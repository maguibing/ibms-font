<script setup lang="ts">
import { computed, h, onMounted, ref, shallowRef, watch } from 'vue';
import type { VNode } from 'vue';
import { NTooltip } from 'naive-ui';
import type { SelectOption } from 'naive-ui';
import { $t } from '@/locales';
import {
  appendFormulaBuilderToken,
  buildFormulaExpression,
  parseFormulaExpression,
  removeFormulaBuilderToken
} from '../formula-builder';
import type { FormulaBuilderToken } from '../formula-builder';
import { collectVirtualPointLogicPointNodes, getVirtualPointLogicPointTree } from '../logic-point-tree';

defineOptions({ name: 'FormulaComputePanel' });

defineProps<{
  validating?: boolean;
}>();

const emit = defineEmits<{
  validate: [];
}>();

const expression = defineModel<string>({ required: true });

// The formula editor uses tokens as the editing state. `expression` is only used to sync with the parent/backend.
const loading = shallowRef(false);
const deviceTree = shallowRef<Api.Device.LogicPointTreeNode[]>([]);
const selectedDeviceId = shallowRef<CommonType.IdType | null>(null);
const pointKeyword = shallowRef('');
const tokens = ref<FormulaBuilderToken[]>(parseFormulaExpression(expression.value));

// Numeric keys, operators, and conversion functions aligned with the source project.
const calculatorKeys = [
  { value: '0', type: 'number' },
  { value: '1', type: 'number' },
  { value: '2', type: 'number' },
  { value: '3', type: 'number' },
  { value: '4', type: 'number' },
  { value: '5', type: 'number' },
  { value: '6', type: 'number' },
  { value: '7', type: 'number' },
  { value: '8', type: 'number' },
  { value: '9', type: 'number' },
  { value: '+', type: 'operator' },
  { value: '-', type: 'operator' },
  { value: '*', type: 'operator' },
  { value: '/', type: 'operator' },
  { value: '==', type: 'operator' },
  { value: '(', type: 'operator' },
  { value: ')', type: 'operator' },
  { value: '[', type: 'operator' },
  { value: ']', type: 'operator' },
  { value: '?', type: 'operator' },
  { value: ':', type: 'operator' },
  { value: '&&', type: 'operator' },
  { value: '||', type: 'operator' },
  { value: '!', type: 'operator' },
  { value: '>', type: 'operator' },
  { value: '<', type: 'operator' },
  { value: '>=', type: 'operator' },
  { value: '<=', type: 'operator' },
  { value: '.', type: 'number' },
  { value: '%', type: 'operator' },
  { value: '&', type: 'operator' },
  { value: '|', type: 'operator' },
  { value: '^', type: 'operator' },
  { value: ',', type: 'operator' },
  { value: 'int', type: 'function' },
  { value: 'bool', type: 'function' },
  { value: 'abs', type: 'function' }
] as const;

const deviceOptions = computed(() =>
  deviceTree.value.filter(item => item.type === 2).map(item => ({ label: item.name, value: item.id }))
);
const selectedDevice = computed(() => deviceTree.value.find(item => item.id === selectedDeviceId.value));
const pointList = computed(() => collectVirtualPointLogicPointNodes(selectedDevice.value?.children ?? []));
// Search matches both the point name and the hidden point identifier.
const filteredPointList = computed(() => {
  const keyword = pointKeyword.value.trim().toLowerCase();
  if (!keyword) return pointList.value;
  return pointList.value.filter(point => `${point.name}${point.key}`.toLowerCase().includes(keyword));
});

/** Use a tooltip to show the full device name when the option is long. */
function renderOption({ node, option }: { node: VNode; option: SelectOption }) {
  return h(NTooltip, { placement: 'right' }, { trigger: () => node, default: () => String(option.label ?? '') });
}

/** Sync editor tokens into the backend expression string. */
function syncExpression() {
  expression.value = buildFormulaExpression(tokens.value);
}

/** Validate and append a token using the shared rules. */
function appendToken(token: FormulaBuilderToken) {
  const result = appendFormulaBuilderToken(tokens.value, token);
  if (result.error) {
    window.$message?.warning(result.error);
    return;
  }

  tokens.value = result.tokens;
  syncExpression();
}

/** Write points using the backend formula placeholder format. */
function appendPoint(point: Api.Device.LogicPointTreeNode) {
  appendToken({ type: 'point', value: `\${${point.key}}`, label: point.name });
}

/** Prefix a leading decimal point with 0 to avoid an invalid number. */
function appendNumber(value: string) {
  appendToken({ type: 'number', value: value === '.' && tokens.value.at(-1)?.type !== 'number' ? '0.' : value });
}

/** Use separate token types for parentheses and operators to simplify validation. */
function appendOperator(value: string) {
  const type = '()[]'.includes(value) ? 'paren' : 'operator';
  appendToken({ type, value });
}

/** Function names must stay aligned with the parser-supported set. */
function appendFunction(value: string) {
  appendToken({ type: 'function', value });
}

/** Remove tokens by token granularity so point placeholders are never split. */
function removeToken(index: number) {
  tokens.value = removeFormulaBuilderToken(tokens.value, index);
  syncExpression();
}

/** Clear visual tokens and sync an empty expression back to the parent. */
function clearTokens() {
  tokens.value = [];
  syncExpression();
}

/** Dispatch calculator keys to the matching token appenders. */
function handleCalculatorKey(key: (typeof calculatorKeys)[number]) {
  if (key.type === 'number') appendNumber(key.value);
  else if (key.type === 'function') appendFunction(key.value);
  else appendOperator(key.value);
}

/** Load the available devices and numeric point tree. */
async function getLogicPointTree() {
  loading.value = true;
  try {
    deviceTree.value = await getVirtualPointLogicPointTree();
    selectedDeviceId.value = deviceOptions.value[0]?.value ?? null;
  } finally {
    loading.value = false;
  }
}

// Rebuild visual tokens when the expression is restored or updated externally.
watch(expression, value => {
  if (value === buildFormulaExpression(tokens.value)) return;
  tokens.value = parseFormulaExpression(value);
});

onMounted(getLogicPointTree);
</script>

<template>
  <div class="w-full overflow-hidden rounded-8px border border-#dfe5ec border-solid dark:border-#30343b">
    <div class="border-0 border-b border-#dfe5ec border-solid bg-white p-14px dark:border-#30343b dark:bg-#202329">
      <div class="mb-8px flex items-center justify-between">
        <span class="text-14px font-600">{{ $t('virtualPoint.formula.title') }}</span>
        <div class="flex items-center gap-8px">
          <NButton secondary size="small" :loading="validating" :disabled="!tokens.length" @click="emit('validate')">
            {{ $t('virtualPoint.formula.validate') }}
          </NButton>
          <NPopconfirm :disabled="!tokens.length" @positive-click="clearTokens">
            <template #trigger>
              <NButton secondary size="small" type="error" :disabled="!tokens.length">
                {{ $t('virtualPoint.formula.clear') }}
              </NButton>
            </template>
            {{ $t('virtualPoint.formula.clearConfirm') }}
          </NPopconfirm>
        </div>
      </div>
      <div
        class="min-h-92px flex flex-wrap content-start items-start gap-10px rounded-6px bg-#f7f9fc p-12px dark:bg-#171a20"
      >
        <div v-for="(token, index) in tokens" :key="`${index}-${token.value}`" class="group relative inline-flex">
          <NTag
            :type="token.type === 'point' ? 'primary' : token.type === 'operator' ? 'warning' : 'default'"
            size="large"
            :bordered="token.type !== 'point'"
            class="max-w-260px"
          >
            <span class="truncate">{{ token.label || token.value }}</span>
          </NTag>
          <button
            type="button"
            :aria-label="$t('common.delete')"
            class="pointer-events-none absolute right--6px top--6px lh-16px h-16px w-16px flex items-center justify-center rounded-full border-0 bg-error text-12px text-white opacity-0 shadow-sm transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100"
            @click="removeToken(index)"
          >
            ×
          </button>
        </div>
        <span v-if="!tokens.length" class="py-5px text-13px text-[var(--n-text-color-3)]">
          {{ $t('virtualPoint.formula.noContent') }}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-2 lt-md:grid-cols-1">
      <div class="min-w-0 p-14px">
        <div class="mb-12px text-14px font-600">{{ $t('virtualPoint.formula.pointSource') }}</div>

        <div class="mb-12px grid grid-cols-2 gap-8px">
          <NSelect
            v-model:value="selectedDeviceId"
            :options="deviceOptions"
            :loading="loading"
            :render-option="renderOption"
            filterable
            :placeholder="$t('virtualPoint.formula.selectDevice')"
          />
          <NInput v-model:value="pointKeyword" clearable :placeholder="$t('virtualPoint.formula.searchPoint')" />
        </div>

        <NSpin :show="loading" class="w-full">
          <NScrollbar class="h-304px rounded-6px bg-#f7f9fc p-8px dark:bg-#171a20">
            <div v-if="filteredPointList.length" class="flex flex-col gap-6px">
              <NTooltip v-for="point in filteredPointList" :key="point.id">
                <template #trigger>
                  <button
                    type="button"
                    class="h-44px w-full flex items-center gap-10px rounded-6px border border-transparent bg-white px-12px text-left transition-colors hover:(border-primary bg-primary/5) dark:bg-#23262d"
                    @click="appendPoint(point)"
                  >
                    <div class="min-w-0 flex-1 truncate text-13px font-500">{{ point.name }}</div>
                    <NTag v-if="point.setting?.num_val?.unit" size="small" :bordered="false">
                      {{ point.setting.num_val.unit }}
                    </NTag>
                  </button>
                </template>
                {{ point.name }}
              </NTooltip>
            </div>
            <NEmpty v-else size="small" :description="$t('virtualPoint.formula.noDigitalPoint')" class="py-24px" />
          </NScrollbar>
        </NSpin>
      </div>

      <div
        class="border-0 border-l border-#dfe5ec border-solid bg-#f7f9fc p-14px lt-md:border-l-0 lt-md:border-t dark:border-#30343b dark:bg-#1b1e24"
      >
        <div class="mb-12px text-14px font-600">{{ $t('virtualPoint.formula.keyboard') }}</div>
        <div class="grid grid-cols-5 gap-8px">
          <NButton
            v-for="key in calculatorKeys"
            :key="key.value"
            class="h-36px min-w-0 px-4px font-mono text-14px"
            @click="handleCalculatorKey(key)"
          >
            {{ key.value }}
          </NButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
