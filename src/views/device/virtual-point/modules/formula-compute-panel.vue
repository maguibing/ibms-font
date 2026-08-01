<script setup lang="ts">
import { computed, h, onMounted, ref, shallowRef, watch } from 'vue';
import type { VNode } from 'vue';
import { NTooltip } from 'naive-ui';
import type { SelectOption } from 'naive-ui';
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

// 公式编辑器以 Token 为编辑态，expression 只作为和父组件/后端交互的字符串。
const loading = shallowRef(false);
const deviceTree = shallowRef<Api.Device.LogicPointTreeNode[]>([]);
const selectedDeviceId = shallowRef<CommonType.IdType | null>(null);
const pointKeyword = shallowRef('');
const tokens = ref<FormulaBuilderToken[]>(parseFormulaExpression(expression.value));

// 与源项目保持一致的数字、运算符和转换函数。
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
// 搜索同时匹配点位名称和未展示的点位标识。
const filteredPointList = computed(() => {
  const keyword = pointKeyword.value.trim().toLowerCase();
  if (!keyword) return pointList.value;
  return pointList.value.filter(point => `${point.name}${point.key}`.toLowerCase().includes(keyword));
});

/** 设备下拉项较长时用 tooltip 显示完整名称。 */
function renderOption({ node, option }: { node: VNode; option: SelectOption }) {
  return h(NTooltip, { placement: 'right' }, { trigger: () => node, default: () => String(option.label ?? '') });
}

/** 将编辑器 Token 同步为后端需要的表达式字符串。 */
function syncExpression() {
  expression.value = buildFormulaExpression(tokens.value);
}

/** 通过统一规则校验并追加 Token。 */
function appendToken(token: FormulaBuilderToken) {
  const result = appendFormulaBuilderToken(tokens.value, token);
  if (result.error) {
    window.$message?.warning(result.error);
    return;
  }

  tokens.value = result.tokens;
  syncExpression();
}

/** 点位按后端公式占位符格式写入。 */
function appendPoint(point: Api.Device.LogicPointTreeNode) {
  appendToken({ type: 'point', value: `\${${point.key}}`, label: point.name });
}

/** 小数点开头时补 0，避免生成不可解析数字。 */
function appendNumber(value: string) {
  appendToken({ type: 'number', value: value === '.' && tokens.value.at(-1)?.type !== 'number' ? '0.' : value });
}

/** 括号和普通运算符使用不同 Token 类型，方便公式校验。 */
function appendOperator(value: string) {
  const type = '()[]'.includes(value) ? 'paren' : 'operator';
  appendToken({ type, value });
}

/** 函数名必须和公式解析器支持的函数保持一致。 */
function appendFunction(value: string) {
  appendToken({ type: 'function', value });
}

/** 按 Token 粒度删除，保证点位占位符不会被拆坏。 */
function removeToken(index: number) {
  tokens.value = removeFormulaBuilderToken(tokens.value, index);
  syncExpression();
}

/** 清空可视化 Token，并同步清空父组件表达式。 */
function clearTokens() {
  tokens.value = [];
  syncExpression();
}

/** 计算键盘统一分发到对应 Token 追加方法。 */
function handleCalculatorKey(key: (typeof calculatorKeys)[number]) {
  if (key.type === 'number') appendNumber(key.value);
  else if (key.type === 'function') appendFunction(key.value);
  else appendOperator(key.value);
}

/** 加载可用设备及数字点位树。 */
async function getLogicPointTree() {
  loading.value = true;
  try {
    deviceTree.value = await getVirtualPointLogicPointTree();
    selectedDeviceId.value = deviceOptions.value[0]?.value ?? null;
  } finally {
    loading.value = false;
  }
}

// 编辑回填或外部更新表达式时，重建可视化 Token。
watch(expression, value => {
  if (value === buildFormulaExpression(tokens.value)) return;
  tokens.value = parseFormulaExpression(value);
});

onMounted(getLogicPointTree);
</script>

<template>
  <div class="w-full overflow-hidden rounded-8px border border-#dfe5ec border-solid dark:border-#30343b">
    <!-- 表达式编辑与操作区 -->
    <div class="border-0 border-b border-#dfe5ec border-solid bg-white p-14px dark:border-#30343b dark:bg-#202329">
      <div class="mb-8px flex items-center justify-between">
        <span class="text-14px font-600">表达式</span>
        <div class="flex items-center gap-8px">
          <NButton secondary size="small" :loading="validating" :disabled="!tokens.length" @click="emit('validate')">
            校验公式
          </NButton>
          <NPopconfirm :disabled="!tokens.length" @positive-click="clearTokens">
            <template #trigger>
              <NButton secondary size="small" type="error" :disabled="!tokens.length">清空</NButton>
            </template>
            确认清空当前公式？
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
            aria-label="删除"
            class="pointer-events-none absolute right--6px top--6px lh-16px h-16px w-16px flex items-center justify-center rounded-full border-0 bg-error text-12px text-white opacity-0 shadow-sm transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100"
            @click="removeToken(index)"
          >
            ×
          </button>
        </div>
        <span v-if="!tokens.length" class="py-5px text-13px text-[var(--n-text-color-3)]">暂无公式内容</span>
      </div>
    </div>

    <!-- 点位选择与计算键盘 -->
    <div class="grid grid-cols-2 lt-md:grid-cols-1">
      <div class="min-w-0 p-14px">
        <div class="mb-12px text-14px font-600">点位来源</div>

        <div class="mb-12px grid grid-cols-2 gap-8px">
          <NSelect
            v-model:value="selectedDeviceId"
            :options="deviceOptions"
            :loading="loading"
            :render-option="renderOption"
            filterable
            placeholder="选择设备"
          />
          <NInput v-model:value="pointKeyword" clearable placeholder="搜索点位" />
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
            <NEmpty v-else size="small" description="暂无数字点位" class="py-24px" />
          </NScrollbar>
        </NSpin>
      </div>

      <div
        class="border-0 border-l border-#dfe5ec border-solid bg-#f7f9fc p-14px lt-md:border-l-0 lt-md:border-t dark:border-#30343b dark:bg-#1b1e24"
      >
        <div class="mb-12px text-14px font-600">计算键盘</div>
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
