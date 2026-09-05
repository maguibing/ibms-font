<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue';
import ButtonIcon from '@/components/custom/button-icon.vue';
import SectionHeader from '@/components/custom/section-header.vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { $t } from '@/locales';
import { DEVICE_SOURCE_TYPE_OPTIONS } from '@/constants/business';
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

// The accumulation-type values must match backend `threshold_assign.accumulate_type`.
const accumulateTypeOptions = computed<CommonType.Option<1 | 2 | 3>[]>(() => [
  { label: $t('virtualPoint.thresholdAssign.immediateAssign'), value: 1 },
  { label: $t('virtualPoint.thresholdAssign.repeatTimes'), value: 2 },
  { label: $t('virtualPoint.thresholdAssign.duration'), value: 3 }
]);
const timeTypeOptions = computed<CommonType.Option<Api.Task.TaskConditionTimeType>[]>(() => [
  { label: $t('virtualPoint.thresholdAssign.seconds'), value: 1 },
  { label: $t('virtualPoint.thresholdAssign.minutes'), value: 2 },
  { label: $t('virtualPoint.thresholdAssign.hours'), value: 3 }
]);

const conditionModel = ref<TaskConditionEditorModel>(createDefaultTaskConditionModel());
const deviceSourceType = shallowRef<TaskRuleDeviceSourceType>(1);
const accumulateType = shallowRef<1 | 2 | 3>(1);
const windowDuration = shallowRef(5);
const windowTimeType = shallowRef<Api.Task.TaskConditionTimeType>(2);
const assignRules = ref<AssignRuleDraft[]>([]);
let ruleKeySeed = 0;
let applyingSetting = false;

/** Create a frontend assignment rule draft. Edit mode hydrates `assign_value` with the current data type. */
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

/** Hydrate backend `threshold_assign` data into the condition editor and assignment rule drafts. */
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

/** Build `assign_value` for the current virtual point output data type. */
function buildAssignValue(value: TaskRulePointValue = createDefaultVirtualPointRuleValue()) {
  return buildVirtualPointRuleValue(props.pointSetting.data_type, value);
}

/** Build the accumulation window. */
function buildWindow(): Api.Device.VirtualPointDurationSetting {
  return {
    durations: windowDuration.value,
    time_type: windowTimeType.value
  };
}

/** Build backend rules by accumulation type. The count and duration fields are mutually exclusive. */
function buildAssignRules(): Api.Device.VirtualPointThresholdAssignRule[] {
  return assignRules.value.map(rule => ({
    ...(accumulateType.value === 2
      ? { repeat_times: rule.repeatTimes }
      : { duration: { durations: rule.duration, time_type: rule.durationTimeType } }),
    assign_value: buildAssignValue(rule.assignValue)
  }));
}

/** Normalize different time units to seconds for deduplication and window-boundary checks. */
function normalizeDurationSeconds(duration: number, timeType: Api.Task.TaskConditionTimeType) {
  return duration * ({ 1: 1, 2: 60, 3: 3600 }[timeType] ?? 1);
}

/** Validate assignment rules. Condition validation is handled by TaskPointRuleEditor utilities. */
function validateAssignRules() {
  if (accumulateType.value !== 1 && (!Number.isInteger(windowDuration.value) || windowDuration.value < 1)) {
    return $t('virtualPoint.thresholdAssign.validationWindow');
  }
  if (!assignRules.value.length) return $t('virtualPoint.thresholdAssign.validationRulesRequired');
  if (assignRules.value.some(rule => !isVirtualPointRuleValueFilled(rule.assignValue))) {
    return $t('virtualPoint.thresholdAssign.validationValue');
  }

  if (accumulateType.value === 2) {
    if (assignRules.value.some(rule => !Number.isInteger(rule.repeatTimes) || rule.repeatTimes < 1)) {
      return $t('virtualPoint.thresholdAssign.validationRepeatTimes');
    }
    if (new Set(assignRules.value.map(rule => rule.repeatTimes)).size !== assignRules.value.length) {
      return $t('virtualPoint.thresholdAssign.validationRepeatTimesDuplicate');
    }
  }

  if (accumulateType.value === 3) {
    if (assignRules.value.some(rule => !Number.isInteger(rule.duration) || rule.duration < 0)) {
      return $t('virtualPoint.thresholdAssign.validationDuration');
    }
    const durations = assignRules.value.map(rule => normalizeDurationSeconds(rule.duration, rule.durationTimeType));
    if (new Set(durations).size !== durations.length)
      return $t('virtualPoint.thresholdAssign.validationDurationDuplicate');
    const windowSeconds = normalizeDurationSeconds(windowDuration.value, windowTimeType.value);
    if (durations.some(duration => duration > windowSeconds)) {
      return $t('virtualPoint.thresholdAssign.validationDurationExceedsWindow');
    }
  }

  return '';
}

/** Expose a single entry for the drawer: validate and build the `threshold_assign` setting. */
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

/** Add an assignment rule. */
function addAssignRule() {
  assignRules.value.push(createRule());
}

/** Keep at least one rule so an empty action cannot be submitted. */
function removeAssignRule(index: number) {
  if (assignRules.value.length <= 1) return;
  assignRules.value.splice(index, 1);
}

/** Reset the condition model when the device source changes because the selection scope changes. */
function handleDeviceSourceTypeChange(value: TaskRuleDeviceSourceType) {
  deviceSourceType.value = value;
  conditionModel.value = createDefaultTaskConditionModel(value);
}

// Rehydrate when the config or mapping changes. The mapping is used to show the selected device/point names.
watch([() => props.setting, () => props.optionMaps], ([setting]) => loadSetting(setting), { immediate: true });
watch(accumulateType, () => {
  if (!applyingSetting) assignRules.value = [createRule()];
});
// When the virtual point output data type changes, old assignment values no longer fit and need to be cleared.
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
      <NFormItem :label="$t('virtualPoint.thresholdAssign.deviceSourceType')">
        <NSelect
          :value="deviceSourceType"
          :options="DEVICE_SOURCE_TYPE_OPTIONS"
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
      <SectionHeader :title="$t('virtualPoint.thresholdAssign.action')" />

      <NForm class="mt-14px" label-placement="top" :show-feedback="false">
        <NFormItem :label="$t('virtualPoint.thresholdAssign.accumulateType')" class="!mb-16px">
          <NRadioGroup v-model:value="accumulateType">
            <NRadioButton
              v-for="option in accumulateTypeOptions"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </NRadioGroup>
        </NFormItem>

        <NFormItem v-if="accumulateType !== 1" :label="$t('virtualPoint.thresholdAssign.window')" class="!mb-16px">
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

        <NFormItem
          v-if="accumulateType === 1"
          :label="$t('virtualPoint.thresholdAssign.immediateAssign')"
          class="!mb-0"
        >
          <TaskPointValueInput
            v-model:value="assignRules[0].assignValue"
            :data-type="pointSetting.data_type"
            :setting="pointSetting"
          />
        </NFormItem>

        <template v-else>
          <div class="mb-12px flex items-center justify-between">
            <span class="text-14px font-600">{{ $t('virtualPoint.thresholdAssign.assignRules') }}</span>
            <NButton secondary size="small" type="primary" @click="addAssignRule">
              <template #icon>
                <SvgIcon icon="material-symbols:add-rounded" />
              </template>
              {{ $t('virtualPoint.thresholdAssign.addRule') }}
            </NButton>
          </div>

          <div class="flex flex-col gap-12px">
            <div
              v-for="(rule, index) in assignRules"
              :key="rule._key"
              class="rounded-6px border border-#edf1f7 border-solid bg-#f8fafc p-12px dark:border-#2f3338 dark:bg-#18181c [&_.n-form-item]:mb-0"
            >
              <NGrid responsive="screen" item-responsive :x-gap="12" :y-gap="4">
                <NFormItemGi
                  v-if="accumulateType === 2"
                  span="24 m:11"
                  :label="$t('virtualPoint.thresholdAssign.repeatTimes')"
                >
                  <NInputNumber
                    v-model:value="rule.repeatTimes"
                    :min="1"
                    :precision="0"
                    button-placement="right"
                    class="w-full"
                  />
                </NFormItemGi>
                <NFormItemGi v-else span="24 m:11" :label="$t('virtualPoint.thresholdAssign.duration')">
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
                <NFormItemGi span="24 m:11" :label="$t('virtualPoint.thresholdAssign.assignValue')">
                  <TaskPointValueInput
                    v-model:value="rule.assignValue"
                    :data-type="pointSetting.data_type"
                    :setting="pointSetting"
                  />
                </NFormItemGi>
                <NFormItemGi span="24 m:2" :label="$t('common.operate')">
                  <ButtonIcon
                    class="w-full"
                    size="small"
                    type="error"
                    icon="material-symbols:delete-outline"
                    :tooltip-content="$t('virtualPoint.thresholdAssign.deleteRule')"
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
