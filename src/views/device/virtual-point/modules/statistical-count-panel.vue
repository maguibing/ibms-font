<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';
import SectionHeader from '@/components/custom/section-header.vue';
import TaskPointRuleEditor from '@/views/task/task-list/modules/task-point-rule-editor/task-point-rule-editor.vue';
import {
  buildTaskConditionSubmitModel,
  createDefaultTaskConditionModel,
  getTaskConditionValidationMessage,
  normalizeTaskConditionModel
} from '@/views/task/task-list/modules/task-point-rule-editor/use-task-point-rule-editor';
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

// 统计次数可按设备或设备类型筛选条件。
const deviceSourceTypeOptions: CommonType.Option<TaskRuleDeviceSourceType>[] = [
  { label: '设备', value: 1 },
  { label: '设备类型', value: 2 }
];

const deviceSourceType = shallowRef<TaskRuleDeviceSourceType>(1);
const conditionModel = ref<TaskConditionEditorModel>(createStatisticalConditionModel(1));
const accumulateValue = shallowRef(1);

/** 统计条件固定使用“或”关系，创建默认条件时同步修正。 */
function createStatisticalConditionModel(sourceType: TaskRuleDeviceSourceType) {
  const model = createDefaultTaskConditionModel(sourceType);
  normalizeConditionRelations(model);
  return model;
}

/** 统计次数只要任一条件命中即可累计，因此强制条件关系为“或”。 */
function normalizeConditionRelations(model: TaskConditionEditorModel) {
  model.conds.forEach(condition => {
    condition.logic_operator_type = 2;
    if (condition.sub_conds[0]) condition.sub_conds[0].logic_operator_type = 2;
  });
}

/** 回填后端 statistical 配置，并补充映射名称用于条件编辑器展示。 */
function loadSetting(setting?: Api.Device.VirtualPointStatisticalSetting) {
  deviceSourceType.value = setting?.conds?.[0]?.device_source_type === 2 ? 2 : 1;
  conditionModel.value = normalizeTaskConditionModel(
    { task_type: 1, conds: setting?.conds ?? [] },
    props.optionMaps ?? {}
  );
  normalizeConditionRelations(conditionModel.value);
  accumulateValue.value = Number(setting?.accumulate_value ?? 1);
}

/** 设备源变化后条件范围变化，需要重置条件模型。 */
function handleDeviceSourceTypeChange(value: TaskRuleDeviceSourceType) {
  deviceSourceType.value = value;
  conditionModel.value = createStatisticalConditionModel(value);
}

/** 暴露给抽屉的统一出口：校验并构建 statistical setting。 */
function validateAndBuild(): Api.Device.VirtualPointSetting | null {
  const conditionError = getTaskConditionValidationMessage(conditionModel.value);
  if (conditionError) {
    window.$message?.warning(conditionError);
    return null;
  }
  if (!Number.isInteger(accumulateValue.value) || accumulateValue.value < 1) {
    window.$message?.warning('累计值必须为大于 0 的整数');
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

// 配置或映射变化时重新回填，保持编辑态名称显示正确。
watch([() => props.setting, () => props.optionMaps], ([setting]) => loadSetting(setting), { immediate: true });
defineExpose({ validateAndBuild });
</script>

<template>
  <div class="flex flex-col gap-18px">
    <NForm label-placement="top" :show-feedback="false">
      <NFormItem label="设备源类型" class="!mb-0 !mt-12px">
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
      :condition-logic-operator-type="2"
      :device-source-type="deviceSourceType"
      hide-condition-relation
      :show-condition-freq="false"
    />

    <section
      class="rounded-8px border border-#e2e8f0/72 border-solid bg-white p-16px shadow-[0_8px_22px_rgba(15,23,42,0.05)] dark:border-#2f3338 dark:bg-#1f2228 dark:shadow-none"
    >
      <SectionHeader title="统计设置" />
      <NForm class="mt-12px" label-placement="top" :show-feedback="false">
        <NFormItem label="每次命中累计值" class="!mb-0">
          <NInputNumber
            v-model:value="accumulateValue"
            :min="1"
            :precision="0"
            button-placement="right"
            class="w-full"
            placeholder="请输入累计值"
          />
        </NFormItem>
      </NForm>
    </section>
  </div>
</template>

<style scoped></style>
