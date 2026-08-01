<script setup lang="ts">
import { nextTick, ref, shallowRef, watch } from 'vue';
import ButtonIcon from '@/components/custom/button-icon.vue';
import SectionHeader from '@/components/custom/section-header.vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import TaskPointRuleEditor from '@/views/task/task-list/modules/task-point-rule-editor/task-point-rule-editor.vue';
import TaskPointValueInput from '@/views/task/task-list/modules/task-point-rule-editor/task-point-value-input.vue';
import {
  buildTaskConditionSubmitModel,
  createDefaultTaskConditionModel,
  getTaskConditionValidationMessage,
  normalizeTaskConditionModel
} from '@/views/task/task-list/modules/task-point-rule-editor/use-task-point-rule-editor';
import type {
  TaskConditionEditorModel,
  TaskRuleDeviceSourceType,
  TaskRuleEditorOptionMaps,
  TaskRulePointValue
} from '@/views/task/task-list/modules/task-point-rule-editor/use-task-point-rule-editor';
import {
  buildVirtualPointRuleValue,
  createDefaultVirtualPointRuleValue,
  isVirtualPointRuleValueFilled,
  normalizeVirtualPointRuleValue
} from '../virtual-point';

defineOptions({ name: 'ThresholdAssignPanel' });

interface Props {
  pointSetting: Api.Device.DeviceTypePointSetting;
  setting?: Api.Device.VirtualPointThresholdAssignSetting;
  optionMaps?: TaskRuleEditorOptionMaps;
}

interface AssignRuleDraft {
  _key: string;
  repeatTimes: number;
  duration: number;
  durationTimeType: Api.Task.TaskConditionTimeType;
  assignValue: TaskRulePointValue;
}

const props = defineProps<Props>();

// 累计方式的数值必须和后端 threshold_assign.accumulate_type 保持一致。
const accumulateTypeOptions = [
  { label: '立即赋值', value: 1 },
  { label: '累计次数', value: 2 },
  { label: '持续时长', value: 3 }
] as const;
const deviceSourceTypeOptions: CommonType.Option<TaskRuleDeviceSourceType>[] = [
  { label: '设备', value: 1 },
  { label: '设备类型', value: 2 }
];
const timeTypeOptions: CommonType.Option<Api.Task.TaskConditionTimeType>[] = [
  { label: '秒', value: 1 },
  { label: '分钟', value: 2 },
  { label: '小时', value: 3 }
];

const conditionModel = ref<TaskConditionEditorModel>(createDefaultTaskConditionModel());
const deviceSourceType = shallowRef<TaskRuleDeviceSourceType>(1);
const accumulateType = shallowRef<1 | 2 | 3>(1);
const windowDuration = shallowRef(5);
const windowTimeType = shallowRef<Api.Task.TaskConditionTimeType>(2);
const assignRules = ref<AssignRuleDraft[]>([]);
let ruleKeySeed = 0;
let applyingSetting = false;

/** 创建前端赋值规则草稿，编辑时按当前虚点数据类型回填 assign_value。 */
function createRule(assignRule?: Api.Device.VirtualPointThresholdAssignRule): AssignRuleDraft {
  ruleKeySeed += 1;
  return {
    _key: `threshold-rule-${Date.now()}-${ruleKeySeed}`,
    repeatTimes: Number(assignRule?.repeat_times ?? 1),
    duration: Number(assignRule?.duration?.durations ?? 1),
    durationTimeType: assignRule?.duration?.time_type ?? 2,
    assignValue: normalizeVirtualPointRuleValue(assignRule?.assign_value, props.pointSetting.data_type)
  };
}

/** 将后端 threshold_assign 配置回填成条件编辑器和赋值规则草稿。 */
function loadSetting(setting?: Api.Device.VirtualPointThresholdAssignSetting) {
  applyingSetting = true;
  accumulateType.value = setting?.accumulate_type ?? 1;
  deviceSourceType.value = setting?.conds?.[0]?.device_source_type === 2 ? 2 : 1;

  const accumulateSetting = accumulateType.value === 3 ? setting?.duration_accumulate : setting?.count_accumulate;
  windowDuration.value = Number(accumulateSetting?.window.durations ?? 5);
  windowTimeType.value = accumulateSetting?.window.time_type ?? 2;

  conditionModel.value = normalizeTaskConditionModel(
    { task_type: 1, conds: setting?.conds ?? [] },
    props.optionMaps ?? {}
  );

  if (accumulateType.value === 1) {
    assignRules.value = [createRule({ assign_value: setting?.immediate_assign?.assign_value ?? buildAssignValue() })];
  } else {
    const rules = accumulateSetting?.assign_rules ?? [];
    assignRules.value = rules.length ? rules.map(createRule) : [createRule()];
  }

  nextTick(() => {
    applyingSetting = false;
  });
}

/** 按虚点输出数据类型构建 assign_value。 */
function buildAssignValue(value: TaskRulePointValue = createDefaultVirtualPointRuleValue()) {
  return buildVirtualPointRuleValue(props.pointSetting.data_type, value);
}

/** 构建累计窗口。 */
function buildWindow(): Api.Device.VirtualPointDurationSetting {
  return {
    durations: windowDuration.value,
    time_type: windowTimeType.value
  };
}

/** 按累计方式构建后端规则，累计次数和持续时长字段互斥。 */
function buildAssignRules(): Api.Device.VirtualPointThresholdAssignRule[] {
  return assignRules.value.map(rule => ({
    ...(accumulateType.value === 2
      ? { repeat_times: rule.repeatTimes }
      : { duration: { durations: rule.duration, time_type: rule.durationTimeType } }),
    assign_value: buildAssignValue(rule.assignValue)
  }));
}

/** 将不同时间单位统一成秒，用于去重和窗口边界校验。 */
function normalizeDurationSeconds(duration: number, timeType: Api.Task.TaskConditionTimeType) {
  return duration * ({ 1: 1, 2: 60, 3: 3600 }[timeType] ?? 1);
}

/** 校验赋值规则，条件校验由 TaskPointRuleEditor 的工具函数负责。 */
function validateAssignRules() {
  if (accumulateType.value !== 1 && (!Number.isInteger(windowDuration.value) || windowDuration.value < 1)) {
    return '累计窗口必须为大于 0 的整数';
  }
  if (!assignRules.value.length) return '请至少添加一条赋值规则';
  if (assignRules.value.some(rule => !isVirtualPointRuleValueFilled(rule.assignValue))) {
    return '请完善赋值内容';
  }

  if (accumulateType.value === 2) {
    if (assignRules.value.some(rule => !Number.isInteger(rule.repeatTimes) || rule.repeatTimes < 1)) {
      return '累计次数必须为大于 0 的整数';
    }
    if (new Set(assignRules.value.map(rule => rule.repeatTimes)).size !== assignRules.value.length) {
      return '累计次数不能重复';
    }
  }

  if (accumulateType.value === 3) {
    if (assignRules.value.some(rule => !Number.isInteger(rule.duration) || rule.duration < 0)) {
      return '持续时长必须为不小于 0 的整数';
    }
    const durations = assignRules.value.map(rule => normalizeDurationSeconds(rule.duration, rule.durationTimeType));
    if (new Set(durations).size !== durations.length) return '持续时长不能重复';
    const windowSeconds = normalizeDurationSeconds(windowDuration.value, windowTimeType.value);
    if (durations.some(duration => duration > windowSeconds)) return '持续时长不能超过累计窗口';
  }

  return '';
}

/** 暴露给抽屉的统一出口：校验并构建 threshold_assign setting。 */
function validateAndBuild(): Api.Device.VirtualPointSetting | null {
  const conditionError = getTaskConditionValidationMessage(conditionModel.value);
  if (conditionError) {
    window.$message?.warning(conditionError);
    return null;
  }

  const assignError = validateAssignRules();
  if (assignError) {
    window.$message?.warning(assignError);
    return null;
  }

  const thresholdAssign: Api.Device.VirtualPointThresholdAssignSetting = {
    accumulate_type: accumulateType.value,
    conds: (buildTaskConditionSubmitModel(conditionModel.value).conds ?? []).map(condition => ({
      ...condition,
      device_source_type: deviceSourceType.value
    }))
  };

  if (accumulateType.value === 1) {
    thresholdAssign.immediate_assign = { assign_value: buildAssignValue(assignRules.value[0].assignValue) };
  } else if (accumulateType.value === 2) {
    thresholdAssign.count_accumulate = { window: buildWindow(), assign_rules: buildAssignRules() };
  } else {
    thresholdAssign.duration_accumulate = { window: buildWindow(), assign_rules: buildAssignRules() };
  }

  return { threshold_assign: thresholdAssign };
}

/** 新增一条赋值规则。 */
function addAssignRule() {
  assignRules.value.push(createRule());
}

/** 至少保留一条规则，避免提交空动作。 */
function removeAssignRule(index: number) {
  if (assignRules.value.length <= 1) return;
  assignRules.value.splice(index, 1);
}

/** 设备源切换后条件选择范围变化，需要重置条件模型。 */
function handleDeviceSourceTypeChange(value: TaskRuleDeviceSourceType) {
  deviceSourceType.value = value;
  conditionModel.value = createDefaultTaskConditionModel(value);
}

// 配置或映射变化时重新回填；映射用于条件编辑器显示已选设备/点位名称。
watch([() => props.setting, () => props.optionMaps], ([setting]) => loadSetting(setting), { immediate: true });
watch(accumulateType, () => {
  if (!applyingSetting) assignRules.value = [createRule()];
});
// 虚点输出数据类型变化时，旧赋值内容不再适配，需要清空。
watch(
  () => props.pointSetting.data_type,
  () => {
    if (!applyingSetting) assignRules.value.forEach(rule => (rule.assignValue = createDefaultVirtualPointRuleValue()));
  }
);

defineExpose({ validateAndBuild });
</script>

<template>
  <div class="flex flex-col gap-18px">
    <NForm label-placement="top" :show-feedback="false" class="!mt-12px">
      <NFormItem label="设备源类型">
        <NSelect
          :value="deviceSourceType"
          :options="deviceSourceTypeOptions"
          class="w-240px"
          @update:value="handleDeviceSourceTypeChange"
        />
      </NFormItem>
    </NForm>

    <TaskPointRuleEditor
      v-model:model="conditionModel"
      mode="condition"
      :device-source-type="deviceSourceType"
      :show-condition-freq="false"
    />

    <section
      class="rounded-8px border border-#e2e8f0/72 border-solid bg-white p-16px shadow-[0_8px_22px_rgba(15,23,42,0.05)] dark:border-#2f3338 dark:bg-#1f2228 dark:shadow-none"
    >
      <SectionHeader title="赋值动作" />

      <NForm class="mt-14px" label-placement="top" :show-feedback="false">
        <NFormItem label="累计方式" class="!mb-16px">
          <NRadioGroup v-model:value="accumulateType">
            <NRadioButton
              v-for="option in accumulateTypeOptions"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </NRadioGroup>
        </NFormItem>

        <NFormItem v-if="accumulateType !== 1" label="累计窗口" class="!mb-16px">
          <NInputGroup>
            <NInputNumber
              v-model:value="windowDuration"
              :min="1"
              :precision="0"
              button-placement="right"
              class="w-full"
            />
            <NSelect v-model:value="windowTimeType" :options="timeTypeOptions" class="w-120px flex-none" />
          </NInputGroup>
        </NFormItem>

        <NFormItem v-if="accumulateType === 1" label="命中后赋值" class="!mb-0">
          <TaskPointValueInput
            v-model:value="assignRules[0].assignValue"
            :data-type="pointSetting.data_type"
            :setting="pointSetting"
          />
        </NFormItem>

        <template v-else>
          <div class="mb-12px flex items-center justify-between">
            <span class="text-14px font-600">赋值规则</span>
            <NButton secondary size="small" type="primary" @click="addAssignRule">
              <template #icon>
                <SvgIcon icon="material-symbols:add-rounded" />
              </template>
              新增规则
            </NButton>
          </div>

          <div class="flex flex-col gap-12px">
            <div
              v-for="(rule, index) in assignRules"
              :key="rule._key"
              class="rounded-6px border border-#edf1f7 border-solid bg-#f8fafc p-12px dark:border-#2f3338 dark:bg-#18181c [&_.n-form-item]:mb-0"
            >
              <NGrid responsive="screen" item-responsive :x-gap="12" :y-gap="4">
                <NFormItemGi v-if="accumulateType === 2" span="24 m:11" label="累计次数">
                  <NInputNumber
                    v-model:value="rule.repeatTimes"
                    :min="1"
                    :precision="0"
                    button-placement="right"
                    class="w-full"
                  />
                </NFormItemGi>
                <NFormItemGi v-else span="24 m:11" label="持续时长">
                  <NInputGroup>
                    <NInputNumber
                      v-model:value="rule.duration"
                      :min="0"
                      :precision="0"
                      button-placement="right"
                      class="w-full"
                    />
                    <NSelect
                      v-model:value="rule.durationTimeType"
                      :options="timeTypeOptions"
                      class="w-100px flex-none"
                    />
                  </NInputGroup>
                </NFormItemGi>
                <NFormItemGi span="24 m:11" label="赋值">
                  <TaskPointValueInput
                    v-model:value="rule.assignValue"
                    :data-type="pointSetting.data_type"
                    :setting="pointSetting"
                  />
                </NFormItemGi>
                <NFormItemGi span="24 m:2" label="操作">
                  <ButtonIcon
                    class="w-full"
                    size="small"
                    type="error"
                    icon="material-symbols:delete-outline"
                    tooltip-content="删除规则"
                    :disabled="assignRules.length <= 1"
                    @click="removeAssignRule(index)"
                  />
                </NFormItemGi>
              </NGrid>
            </div>
          </div>
        </template>
      </NForm>
    </section>
  </div>
</template>

<style scoped></style>
