<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';
import SectionHeader from '@/components/custom/section-header.vue';
import { $t } from '@/locales';
import TaskPointRuleEditor from '@/views/task/task-list/modules/task-point-rule-editor/task-point-rule-editor.vue';
import {
  buildTaskConditionSubmitModel,
  createDefaultTaskConditionModel,
  getTaskConditionValidationMessage,
  normalizeTaskConditionModel
} from '@/views/task/task-list/modules/task-point-rule-editor/use-task-point-rule-editor';
import { DEVICE_SOURCE_TYPE_OPTIONS } from '@/constants/business';
import type {
  TaskConditionEditorModel,
  TaskRuleDeviceSourceType,
  TaskRuleEditorOptionMaps
} from '@/views/task/task-list/modules/task-point-rule-editor/use-task-point-rule-editor';

defineOptions({ name: 'StatisticalCountPanel' });

interface Props {
  setting?: Api.Device.VirtualPointStatisticalSetting;
  optionMaps?: TaskRuleEditorOptionMaps;
}

const props = defineProps<Props>();

// Statistic counts can filter by device or by device type.
const deviceSourceType = shallowRef<TaskRuleDeviceSourceType>(1);
const conditionModel = ref<TaskConditionEditorModel>(createStatisticalConditionModel(1));
const accumulateValue = shallowRef(1);

/** Statistic conditions always use OR logic; keep the default model aligned with that. */
function createStatisticalConditionModel(sourceType: TaskRuleDeviceSourceType) {
  const model = createDefaultTaskConditionModel(sourceType);
  normalizeConditionRelations(model);
  return model;
}

/** A statistic count increments when any condition matches, so condition relations are forced to OR. */
function normalizeConditionRelations(model: TaskConditionEditorModel) {
  model.conds.forEach(condition => {
    condition.logic_operator_type = 2;
    if (condition.sub_conds[0]) condition.sub_conds[0].logic_operator_type = 2;
  });
}

/** Hydrate backend `statistical` data and supplement mapping names for the condition editor. */
function loadSetting(setting?: Api.Device.VirtualPointStatisticalSetting) {
  deviceSourceType.value = setting?.conds?.[0]?.device_source_type === 2 ? 2 : 1;
  conditionModel.value = normalizeTaskConditionModel(
    { task_type: 1, conds: setting?.conds ?? [] },
    props.optionMaps ?? {}
  );
  normalizeConditionRelations(conditionModel.value);
  accumulateValue.value = Number(setting?.accumulate_value ?? 1);
}

/** Reset the condition model when the device source changes because the selection scope changes. */
function handleDeviceSourceTypeChange(value: TaskRuleDeviceSourceType) {
  deviceSourceType.value = value;
  conditionModel.value = createStatisticalConditionModel(value);
}

/** Expose a single entry for the drawer: validate and build the `statistical` setting. */
function validateAndBuild(): Api.Device.VirtualPointSetting | null {
  const conditionError = getTaskConditionValidationMessage(conditionModel.value);
  if (conditionError) {
    window.$message?.warning(conditionError);
    return null;
  }
  if (!Number.isInteger(accumulateValue.value) || accumulateValue.value < 1) {
    window.$message?.warning($t('virtualPoint.statisticalCount.validationAccumulateValue'));
    return null;
  }

  const conds = (buildTaskConditionSubmitModel(conditionModel.value).conds ?? []).map(condition => ({
    ...condition,
    logic_operator_type: 2 as const,
    device_source_type: deviceSourceType.value,
    sub_conds: condition.sub_conds?.map((point, index) => ({
      ...point,
      logic_operator_type: index === 0 ? 2 : point.logic_operator_type
    }))
  }));

  return {
    statistical: {
      conds,
      accumulate_value: accumulateValue.value
    }
  };
}

// Rehydrate when the config or mapping changes so edit mode keeps the correct names.
watch([() => props.setting, () => props.optionMaps], ([setting]) => loadSetting(setting), { immediate: true });
defineExpose({ validateAndBuild });
</script>

<template>
  <div class="flex flex-col gap-18px">
    <NForm label-placement="top" :show-feedback="false">
      <NFormItem :label="$t('virtualPoint.statisticalCount.deviceSourceType')" class="!mb-0 !mt-12px">
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
      :condition-logic-operator-type="2"
      :device-source-type="deviceSourceType"
      hide-condition-relation
      :show-condition-freq="false"
    />

    <section
      class="rounded-8px border border-#e2e8f0/72 border-solid bg-white p-16px shadow-[0_8px_22px_rgba(15,23,42,0.05)] dark:border-#2f3338 dark:bg-#1f2228 dark:shadow-none"
    >
      <SectionHeader :title="$t('virtualPoint.statisticalCount.settings')" />
      <NForm class="mt-12px" label-placement="top" :show-feedback="false">
        <NFormItem :label="$t('virtualPoint.statisticalCount.accumulateValue')" class="!mb-0">
          <NInputNumber
            v-model:value="accumulateValue"
            :min="1"
            :precision="0"
            button-placement="right"
            class="w-full"
            :placeholder="$t('virtualPoint.statisticalCount.placeholder')"
          />
        </NFormItem>
      </NForm>
    </section>
  </div>
</template>

<style scoped></style>
