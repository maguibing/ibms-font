<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue';
import ButtonIcon from '@/components/custom/button-icon.vue';
import SectionHeader from '@/components/custom/section-header.vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { $t } from '@/locales';
import TaskPointValueInput from '@/views/task/task-list/modules/task-point-rule-editor/task-point-value-input.vue';
import type { TaskRulePointValue } from '@/views/task/task-list/modules/task-point-rule-editor/use-task-point-rule-editor';
import { validateFormulaExpression } from '../formula-builder';
import { collectVirtualPointLogicPointNodes, getVirtualPointLogicPointTree } from '../logic-point-tree';
import {
  buildVirtualPointRuleValue,
  createDefaultVirtualPointRuleValue,
  isVirtualPointRuleValueFilled,
  normalizeVirtualPointRuleValue
} from '../virtual-point';
import FormulaComputePanel from './formula-compute-panel.vue';

defineOptions({ name: 'SegmentMappingPanel' });

interface Props {
  pointSetting: Api.Device.DeviceTypePointSetting;
  setting?: Api.Device.VirtualPointSegmentMappingSetting;
}

interface SegmentRuleDraft {
  _key: string;
  minValue: number | null;
  maxValue: number | null;
  boundType: 1 | 2 | 3 | 4;
  outputValue: TaskRulePointValue;
  remark: string;
}

const props = defineProps<Props>();

// The source-type numbers must match backend `segment_mapping.match_source_type`.
const sourceTypeOptions = computed<CommonType.Option<1 | 2>[]>(() => [
  { label: $t('virtualPoint.segmentMapping.initialPoint'), value: 1 },
  { label: $t('virtualPoint.segmentMapping.expression'), value: 2 }
]);
const boundTypeOptions = computed<CommonType.Option<1 | 2 | 3 | 4>[]>(() => [
  { label: $t('virtualPoint.segmentMapping.boundLeftClosedRightOpen'), value: 1 },
  { label: $t('virtualPoint.segmentMapping.boundClosedInterval'), value: 2 },
  { label: $t('virtualPoint.segmentMapping.boundOpenInterval'), value: 3 },
  { label: $t('virtualPoint.segmentMapping.boundLeftOpenRightClosed'), value: 4 }
]);

const loading = shallowRef(false);
const deviceTree = shallowRef<Api.Device.LogicPointTreeNode[]>([]);
const sourceType = shallowRef<1 | 2>(1);
const selectedDeviceId = shallowRef<CommonType.IdType | null>(null);
const selectedPointId = shallowRef<CommonType.IdType | null>(null);
const expression = shallowRef('');
const enableDefaultValue = shallowRef(false);
const defaultValue = ref<TaskRulePointValue>(createDefaultVirtualPointRuleValue());
const rules = ref<SegmentRuleDraft[]>([]);
let ruleKeySeed = 0;
let applyingSetting = false;

const deviceOptions = computed(() =>
  deviceTree.value.filter(item => item.type === 2).map(item => ({ label: item.name, value: item.id }))
);
const selectedDevice = computed(() => deviceTree.value.find(item => item.id === selectedDeviceId.value));
const pointList = computed(() => collectVirtualPointLogicPointNodes(selectedDevice.value?.children ?? []));
const pointOptions = computed(() => pointList.value.map(item => ({ label: item.name, value: item.id })));
const allPoints = computed(() =>
  deviceTree.value.flatMap(device => collectVirtualPointLogicPointNodes(device.children ?? []))
);

/** Create a segment rule draft. Edit mode hydrates the output value using the current virtual point data type. */
function createRule(rule?: Api.Device.VirtualPointSegmentMappingRule): SegmentRuleDraft {
  ruleKeySeed += 1;
  return {
    _key: `segment-rule-${Date.now()}-${ruleKeySeed}`,
    minValue: rule?.min_val ?? null,
    maxValue: rule?.max_val ?? null,
    boundType: rule?.bound_type ?? 1,
    outputValue: normalizeVirtualPointRuleValue(rule?.output_value, props.pointSetting.data_type),
    remark: rule?.remark ?? ''
  };
}

/** Build `output_value` / `default_value` for the current virtual point output data type. */
function buildOutputValue(value: TaskRulePointValue) {
  return buildVirtualPointRuleValue(props.pointSetting.data_type, value);
}

/** Look up the owning device from a point ID so the device select can be restored in edit mode. */
function findPointDeviceId(pointId: CommonType.IdType) {
  return deviceTree.value.find(device =>
    collectVirtualPointLogicPointNodes(device.children ?? []).some(point => point.id === pointId)
  )?.id;
}

/** Support legacy records that only store a `${key}` expression without `source_logic_point_id`. */
function findPointByExpression(value: string) {
  const match = value.match(/^\$\{([^{}]+)\}$/);
  return match ? allPoints.value.find(point => point.key === match[1]) : undefined;
}

/** Lazy-load the numeric point tree for both edit hydration and initial point selection. */
async function getLogicPointTree() {
  if (deviceTree.value.length) return;
  loading.value = true;
  try {
    deviceTree.value = await getVirtualPointLogicPointTree();
  } finally {
    loading.value = false;
  }
}

/** Hydrate backend `segment_mapping` data into the source type, default value, and rule drafts. */
async function loadSetting(setting?: Api.Device.VirtualPointSegmentMappingSetting) {
  applyingSetting = true;
  await getLogicPointTree();

  const matchedPoint = setting?.source_logic_point_id
    ? allPoints.value.find(point => point.id === setting.source_logic_point_id)
    : findPointByExpression(setting?.match_expression ?? '');
  sourceType.value = setting?.match_source_type ?? (matchedPoint ? 1 : setting?.match_expression ? 2 : 1);
  selectedPointId.value = matchedPoint?.id ?? null;
  selectedDeviceId.value = matchedPoint?.id ? (findPointDeviceId(matchedPoint.id) ?? null) : null;
  expression.value = sourceType.value === 2 ? (setting?.match_expression ?? '') : '';
  enableDefaultValue.value = Boolean(setting?.has_default_value);
  defaultValue.value = normalizeVirtualPointRuleValue(setting?.default_value, props.pointSetting.data_type);
  rules.value = setting?.rules?.length ? setting.rules.map(createRule) : [createRule()];
  applyingSetting = false;
}

/** Clear mutually exclusive inputs when the match source changes. */
function handleSourceTypeChange(value: 1 | 2) {
  sourceType.value = value;
  selectedDeviceId.value = null;
  selectedPointId.value = null;
  expression.value = '';
}

/** Clear the selected point when the device changes and the point list is refreshed. */
function handleDeviceChange() {
  selectedPointId.value = null;
}

/** Reuse the formula parser for local validation in expression mode. */
function handleValidateExpression() {
  const error = validateFormulaExpression(expression.value);
  if (error) window.$message?.warning(error);
  else window.$message?.success($t('virtualPoint.formula.validateSuccess'));
}

/** Add a segment rule. */
function addRule() {
  rules.value.push(createRule());
}

/** Keep at least one rule so an empty segment cannot be submitted. */
function removeRule(index: number) {
  if (rules.value.length <= 1) return;
  rules.value.splice(index, 1);
}

/** Expose a single entry for the drawer: validate and build the `segment_mapping` setting. */
function validateAndBuild(): Api.Device.VirtualPointSetting | null {
  let matchExpression = expression.value.trim();
  let sourceLogicPointId: CommonType.IdType | undefined;

  if (sourceType.value === 1) {
    const point = allPoints.value.find(item => item.id === selectedPointId.value);
    if (!point?.key) {
      window.$message?.warning($t('virtualPoint.segmentMapping.selectInitialPoint'));
      return null;
    }
    matchExpression = `\${${point.key}}`;
    sourceLogicPointId = point.id;
  } else {
    const expressionError = validateFormulaExpression(matchExpression);
    if (expressionError) {
      window.$message?.warning(expressionError);
      return null;
    }
  }

  const invalidRule = rules.value.find(
    rule =>
      rule.minValue === null ||
      rule.maxValue === null ||
      !Number.isFinite(rule.minValue) ||
      !Number.isFinite(rule.maxValue) ||
      rule.minValue >= rule.maxValue ||
      !isVirtualPointRuleValueFilled(rule.outputValue)
  );
  if (invalidRule) {
    window.$message?.warning($t('virtualPoint.segmentMapping.completeRules'));
    return null;
  }

  if (enableDefaultValue.value && !isVirtualPointRuleValueFilled(defaultValue.value)) {
    window.$message?.warning($t('virtualPoint.segmentMapping.defaultOutputRequired'));
    return null;
  }

  return {
    segment_mapping: {
      match_source_type: sourceType.value,
      ...(sourceLogicPointId === undefined ? {} : { source_logic_point_id: sourceLogicPointId }),
      match_expression: matchExpression,
      default_bound_type: 1,
      has_default_value: enableDefaultValue.value,
      ...(enableDefaultValue.value ? { default_value: buildOutputValue(defaultValue.value) } : {}),
      rules: rules.value.map(rule => ({
        min_val: rule.minValue!,
        max_val: rule.maxValue!,
        bound_type: rule.boundType,
        output_value: buildOutputValue(rule.outputValue),
        remark: rule.remark.trim()
      }))
    }
  };
}

// Rehydrate when the edit data changes, including asynchronous tree loading.
watch(
  () => props.setting,
  setting => loadSetting(setting),
  { immediate: true }
);
// When the virtual point output data type changes, old values no longer fit and need to be cleared.
watch(
  () => props.pointSetting.data_type,
  () => {
    if (applyingSetting) return;
    defaultValue.value = createDefaultVirtualPointRuleValue();
    rules.value.forEach(rule => (rule.outputValue = createDefaultVirtualPointRuleValue()));
  }
);

onMounted(getLogicPointTree);
defineExpose({ validateAndBuild });
</script>

<template>
  <div class="flex flex-col gap-18px">
    <section
      class="rounded-8px border border-#e2e8f0/72 border-solid bg-white p-16px shadow-[0_8px_22px_rgba(15,23,42,0.05)] dark:border-#2f3338 dark:bg-#1f2228 dark:shadow-none"
    >
      <SectionHeader :title="$t('virtualPoint.segmentMapping.matchSource')" />
      <NForm class="mt-12px" label-placement="top" :show-feedback="false">
        <NFormItem :label="$t('virtualPoint.segmentMapping.sourceType')" class="!mb-16px">
          <NRadioGroup :value="sourceType" @update:value="handleSourceTypeChange">
            <NRadioButton
              v-for="option in sourceTypeOptions"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </NRadioGroup>
        </NFormItem>

        <NGrid v-if="sourceType === 1" responsive="screen" item-responsive :x-gap="12" :y-gap="4">
          <NFormItemGi span="24 m:12" :label="$t('virtualPoint.segmentMapping.device')">
            <NSelect
              v-model:value="selectedDeviceId"
              :options="deviceOptions"
              :loading="loading"
              filterable
              clearable
              :placeholder="$t('virtualPoint.segmentMapping.devicePlaceholder')"
              @update:value="handleDeviceChange"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('virtualPoint.segmentMapping.point')">
            <NSelect
              v-model:value="selectedPointId"
              :options="pointOptions"
              :loading="loading"
              :disabled="!selectedDeviceId"
              filterable
              clearable
              :placeholder="$t('virtualPoint.segmentMapping.pointPlaceholder')"
            />
          </NFormItemGi>
        </NGrid>

        <FormulaComputePanel v-else v-model="expression" :validating="false" @validate="handleValidateExpression" />
      </NForm>
    </section>

    <section
      class="rounded-8px border border-#e2e8f0/72 border-solid bg-white p-16px shadow-[0_8px_22px_rgba(15,23,42,0.05)] dark:border-#2f3338 dark:bg-#1f2228 dark:shadow-none"
    >
      <SectionHeader :title="$t('virtualPoint.segmentMapping.rules')">
        <template #actions>
          <NButton secondary size="small" type="primary" @click="addRule">
            <template #icon>
              <SvgIcon icon="material-symbols:add-rounded" />
            </template>
            {{ $t('virtualPoint.segmentMapping.addRule') }}
          </NButton>
        </template>
      </SectionHeader>

      <div class="mt-12px flex flex-col gap-12px">
        <div
          v-for="(rule, index) in rules"
          :key="rule._key"
          class="rounded-6px border border-#edf1f7 border-solid bg-#f8fafc p-12px dark:border-#2f3338 dark:bg-#18181c [&_.n-form-item]:mb-0"
        >
          <NForm label-placement="top" :show-feedback="false">
            <NGrid responsive="screen" item-responsive :x-gap="10" :y-gap="4">
              <NFormItemGi span="24 m:4" :label="$t('virtualPoint.segmentMapping.minValue')">
                <NInputNumber
                  v-model:value="rule.minValue"
                  class="w-full"
                  :placeholder="$t('virtualPoint.segmentMapping.minValue')"
                />
              </NFormItemGi>
              <NFormItemGi span="24 m:4" :label="$t('virtualPoint.segmentMapping.maxValue')">
                <NInputNumber
                  v-model:value="rule.maxValue"
                  class="w-full"
                  :placeholder="$t('virtualPoint.segmentMapping.maxValue')"
                />
              </NFormItemGi>
              <NFormItemGi span="24 m:5" :label="$t('virtualPoint.segmentMapping.bound')">
                <NSelect v-model:value="rule.boundType" :options="boundTypeOptions" />
              </NFormItemGi>
              <NFormItemGi span="24 m:5" :label="$t('virtualPoint.segmentMapping.outputValue')">
                <TaskPointValueInput
                  v-model:value="rule.outputValue"
                  :data-type="pointSetting.data_type"
                  :setting="pointSetting"
                />
              </NFormItemGi>
              <NFormItemGi span="24 m:4" :label="$t('virtualPoint.segmentMapping.remark')">
                <NInput
                  v-model:value="rule.remark"
                  maxlength="100"
                  :placeholder="$t('virtualPoint.segmentMapping.remark')"
                />
              </NFormItemGi>
              <NFormItemGi span="24 m:2" :label="$t('common.operate')">
                <ButtonIcon
                  class="w-full"
                  size="small"
                  type="error"
                  icon="material-symbols:delete-outline"
                  :tooltip-content="$t('virtualPoint.segmentMapping.deleteRule')"
                  :disabled="rules.length <= 1"
                  @click="removeRule(index)"
                />
              </NFormItemGi>
            </NGrid>
          </NForm>
        </div>
      </div>

      <div class="mt-16px flex items-center gap-12px">
        <NCheckbox v-model:checked="enableDefaultValue">
          {{ $t('virtualPoint.segmentMapping.enableDefaultOutput') }}
        </NCheckbox>
        <div v-if="enableDefaultValue" class="w-260px">
          <TaskPointValueInput
            v-model:value="defaultValue"
            :data-type="pointSetting.data_type"
            :setting="pointSetting"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
