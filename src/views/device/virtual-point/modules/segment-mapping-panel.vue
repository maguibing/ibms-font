<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue';
import ButtonIcon from '@/components/custom/button-icon.vue';
import SectionHeader from '@/components/custom/section-header.vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
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

// 匹配来源数字需与后端 segment_mapping.match_source_type 保持一致。
const sourceTypeOptions = [
  { label: '初始点位', value: 1 },
  { label: '表达式', value: 2 }
] as const;
const boundTypeOptions: CommonType.Option<1 | 2 | 3 | 4>[] = [
  { label: '左闭右开 [a, b)', value: 1 },
  { label: '闭区间 [a, b]', value: 2 },
  { label: '开区间 (a, b)', value: 3 },
  { label: '左开右闭 (a, b]', value: 4 }
];

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

/** 创建分段规则草稿，编辑时按当前虚点数据类型回填输出值。 */
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

/** 按虚点输出数据类型构建规则 output_value/default_value。 */
function buildOutputValue(value: TaskRulePointValue) {
  return buildVirtualPointRuleValue(props.pointSetting.data_type, value);
}

/** 根据点位 ID 反查所属设备，用于编辑回填设备下拉。 */
function findPointDeviceId(pointId: CommonType.IdType) {
  return deviceTree.value.find(device =>
    collectVirtualPointLogicPointNodes(device.children ?? []).some(point => point.id === pointId)
  )?.id;
}

/** 兼容旧数据中只保存 ${key} 表达式但没有 source_logic_point_id 的情况。 */
function findPointByExpression(value: string) {
  const match = value.match(/^\$\{([^{}]+)\}$/);
  return match ? allPoints.value.find(point => point.key === match[1]) : undefined;
}

/** 懒加载数字点位树，编辑回填和初始点位选择共用。 */
async function getLogicPointTree() {
  if (deviceTree.value.length) return;
  loading.value = true;
  try {
    deviceTree.value = await getVirtualPointLogicPointTree();
  } finally {
    loading.value = false;
  }
}

/** 将后端 segment_mapping 配置回填成匹配来源、默认值和规则草稿。 */
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

/** 切换匹配来源时清空互斥输入。 */
function handleSourceTypeChange(value: 1 | 2) {
  sourceType.value = value;
  selectedDeviceId.value = null;
  selectedPointId.value = null;
  expression.value = '';
}

/** 切换设备后点位列表变化，已选点位需要清空。 */
function handleDeviceChange() {
  selectedPointId.value = null;
}

/** 表达式来源模式下复用公式解析器做本地校验。 */
function handleValidateExpression() {
  const error = validateFormulaExpression(expression.value);
  if (error) window.$message?.warning(error);
  else window.$message?.success('表达式校验通过');
}

/** 新增一条分段规则。 */
function addRule() {
  rules.value.push(createRule());
}

/** 至少保留一条规则，避免提交空分段。 */
function removeRule(index: number) {
  if (rules.value.length <= 1) return;
  rules.value.splice(index, 1);
}

/** 暴露给抽屉的统一出口：校验并构建 segment_mapping setting。 */
function validateAndBuild(): Api.Device.VirtualPointSetting | null {
  let matchExpression = expression.value.trim();
  let sourceLogicPointId: CommonType.IdType | undefined;

  if (sourceType.value === 1) {
    const point = allPoints.value.find(item => item.id === selectedPointId.value);
    if (!point?.key) {
      window.$message?.warning('请选择初始点位');
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
    window.$message?.warning('请完善分段规则，且最小值必须小于最大值');
    return null;
  }

  if (enableDefaultValue.value && !isVirtualPointRuleValueFilled(defaultValue.value)) {
    window.$message?.warning('请设置默认输出值');
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

// 编辑数据变化时重新回填，包含异步点位树加载。
watch(
  () => props.setting,
  setting => loadSetting(setting),
  { immediate: true }
);
// 虚点输出数据类型变化时，旧输出值不再适配，需要清空。
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
      <SectionHeader title="匹配来源" />
      <NForm class="mt-12px" label-placement="top" :show-feedback="false">
        <NFormItem label="来源类型" class="!mb-16px">
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
          <NFormItemGi span="24 m:12" label="设备">
            <NSelect
              v-model:value="selectedDeviceId"
              :options="deviceOptions"
              :loading="loading"
              filterable
              clearable
              placeholder="请选择设备"
              @update:value="handleDeviceChange"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="点位">
            <NSelect
              v-model:value="selectedPointId"
              :options="pointOptions"
              :loading="loading"
              :disabled="!selectedDeviceId"
              filterable
              clearable
              placeholder="请选择点位"
            />
          </NFormItemGi>
        </NGrid>

        <FormulaComputePanel v-else v-model="expression" :validating="false" @validate="handleValidateExpression" />
      </NForm>
    </section>

    <section
      class="rounded-8px border border-#e2e8f0/72 border-solid bg-white p-16px shadow-[0_8px_22px_rgba(15,23,42,0.05)] dark:border-#2f3338 dark:bg-#1f2228 dark:shadow-none"
    >
      <SectionHeader title="分段规则">
        <template #actions>
          <NButton secondary size="small" type="primary" @click="addRule">
            <template #icon>
              <SvgIcon icon="material-symbols:add-rounded" />
            </template>
            新增分段
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
              <NFormItemGi span="24 m:4" label="最小值">
                <NInputNumber v-model:value="rule.minValue" class="w-full" placeholder="最小值" />
              </NFormItemGi>
              <NFormItemGi span="24 m:4" label="最大值">
                <NInputNumber v-model:value="rule.maxValue" class="w-full" placeholder="最大值" />
              </NFormItemGi>
              <NFormItemGi span="24 m:5" label="边界">
                <NSelect v-model:value="rule.boundType" :options="boundTypeOptions" />
              </NFormItemGi>
              <NFormItemGi span="24 m:5" label="输出值">
                <TaskPointValueInput
                  v-model:value="rule.outputValue"
                  :data-type="pointSetting.data_type"
                  :setting="pointSetting"
                />
              </NFormItemGi>
              <NFormItemGi span="24 m:4" label="备注">
                <NInput v-model:value="rule.remark" maxlength="100" placeholder="备注" />
              </NFormItemGi>
              <NFormItemGi span="24 m:2" label="操作">
                <ButtonIcon
                  class="w-full"
                  size="small"
                  type="error"
                  icon="material-symbols:delete-outline"
                  tooltip-content="删除分段"
                  :disabled="rules.length <= 1"
                  @click="removeRule(index)"
                />
              </NFormItemGi>
            </NGrid>
          </NForm>
        </div>
      </div>

      <div class="mt-16px flex items-center gap-12px">
        <NCheckbox v-model:checked="enableDefaultValue">启用默认输出</NCheckbox>
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
