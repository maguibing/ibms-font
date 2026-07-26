<script setup lang="ts">
import { computed } from 'vue';
import ButtonIcon from '@/components/custom/button-icon.vue';
import RemoteSearchSelect from '@/components/custom/remote-search-select.vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { fetchGetDeviceList, fetchGetDeviceTypePointList } from '@/service/api/device';
import TaskPointValueInput from './task-point-value-input.vue';
import {
  buildDeviceTypePointRequestParams,
  conditionTimeTypeOptions,
  createDefaultAction,
  createDefaultActionPoint,
  createDefaultCondition,
  createDefaultConditionSubCond,
  extractTaskDeviceTypePointOptions,
  getThresholdOptions,
  isRangeThreshold,
  logicOperatorOptions,
  maxActionCount,
  maxActionPointCount,
  maxConditionCount,
  maxConditionPointCount,
  normalizeActionContinuousTimes,
  normalizeActionDelaySeconds,
  normalizeConditionFreq,
  syncActionDevice,
  syncActionPoint,
  syncConditionDevice,
  syncConditionPoint,
  withDefaultTaskSearchOption,
  type TaskActionEditor,
  type TaskActionEditorModel,
  type TaskConditionEditor,
  type TaskConditionEditorModel,
  type TaskPointRuleEditorMode,
  type TaskPointRuleEditorModel,
  type TaskRuleDeviceOption
} from './use-task-point-rule-editor';

defineOptions({
  name: 'TaskPointRuleEditor'
});

interface Props {
  mode: TaskPointRuleEditorMode;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
});

const model = defineModel<TaskPointRuleEditorModel>('model', { required: true });

const conditionModel = computed(() => model.value as TaskConditionEditorModel);
const actionModel = computed(() => model.value as TaskActionEditorModel);

const isConditionMode = computed(() => props.mode === 'condition');
const conditionFreq = computed(() => conditionModel.value.freq);

function fetchDeviceList(params: Record<string, any>) {
  return fetchGetDeviceList(withDefaultTaskSearchOption(params, { type: 1, value: '' }));
}

function fetchDeviceTypePointList(params: Record<string, any>) {
  return fetchGetDeviceTypePointList(params as CommonType.CommonListQueryParams);
}

function getDeviceTypePointRequestParams(device?: TaskRuleDeviceOption | null) {
  return buildDeviceTypePointRequestParams(device);
}

function addCondition() {
  addItem(conditionModel.value.conds, maxConditionCount, `条件项最多添加 ${maxConditionCount} 个`, () =>
    createDefaultCondition(2)
  );
}

function removeCondition(index: number) {
  removeItem(conditionModel.value.conds, index, createDefaultCondition);
}

function addConditionPoint(condition: TaskConditionEditor) {
  addItem(
    condition.sub_conds,
    maxConditionPointCount,
    `每个条件项最多添加 ${maxConditionPointCount} 个点位条件`,
    createDefaultConditionSubCond
  );
}

function removeConditionPoint(condition: TaskConditionEditor, index: number) {
  removeItem(condition.sub_conds, index, createDefaultConditionSubCond);
}

function handleConditionDurationChange(value: number | null) {
  updateConditionFreq('durations', value);
}

function handleConditionRepeatTimesChange(value: number | null) {
  updateConditionFreq('repeat_times', value);
}

function addAction() {
  addItem(actionModel.value.actions, maxActionCount, `执行项最多添加 ${maxActionCount} 个`, createDefaultAction);
}

function removeAction(index: number) {
  removeItem(actionModel.value.actions, index, createDefaultAction);
}

function addActionPoint(action: TaskActionEditor) {
  addItem(
    action.point_vals,
    maxActionPointCount,
    `每个执行项最多添加 ${maxActionPointCount} 个执行点位`,
    createDefaultActionPoint
  );
}

function removeActionPoint(action: TaskActionEditor, index: number) {
  removeItem(action.point_vals, index, createDefaultActionPoint);
}

function handleActionDelaySecondsChange(action: TaskActionEditor, value: number | null) {
  action.delay_seconds = normalizeActionDelaySeconds(value ?? 1);
}

function handleActionContinuousTimesChange(action: TaskActionEditor, value: number | null) {
  action.continuous_times = normalizeActionContinuousTimes(value ?? 1);
}

function addItem<T>(items: T[], maxCount: number, message: string, createItem: () => T) {
  if (items.length >= maxCount) {
    window.$message?.warning(message);
    return;
  }

  items.push(createItem());
}

function removeItem<T>(items: T[], index: number, createItem: () => T) {
  items.splice(index, 1);

  if (items.length === 0) {
    items.push(createItem());
  }
}

function updateConditionFreq(key: 'durations' | 'repeat_times', value: number | null) {
  conditionModel.value.freq = normalizeConditionFreq({
    ...conditionModel.value.freq,
    [key]: value ?? 0
  });
}
</script>

<template>
  <div class="flex flex-col gap-16px p-2px">
    <template v-if="isConditionMode">
      <div class="min-h-40px flex items-center justify-between gap-16px lt-sm:flex-col lt-sm:items-start">
        <div class="min-w-0 flex items-center gap-10px">
          <span class="h-28px w-4px flex-none rounded-4px bg-#2563eb shadow-[0_6px_14px_rgba(37,99,235,0.16)]"></span>
          <div>
            <div class="text-15px text-[var(--n-text-color-1)] font-600 leading-20px">触发条件</div>
          </div>
        </div>
        <NButton class="flex-none" size="small" type="primary" :disabled="props.disabled" @click="addCondition">
          <template #icon>
            <SvgIcon icon="material-symbols:add-rounded" />
          </template>
          新增条件项
        </NButton>
      </div>

      <div class="flex flex-col gap-14px">
        <section
          v-for="(condition, conditionIndex) in conditionModel.conds"
          :key="condition._key"
          class="rounded-8px border border-#e2e8f0/72 border-solid bg-white p-16px shadow-[0_8px_22px_rgba(15,23,42,0.05)] dark:border-#2f3338 dark:bg-#1f2228 dark:shadow-none [&_.n-form-item-label]:font-500 [&_.n-form-item]:mb-0"
        >
          <div
            class="flex items-center justify-between gap-16px border-b border-b-#edf1f7 border-b-solid pb-14px dark:border-b-#2f3338 lt-sm:flex-col lt-sm:items-start"
          >
            <div class="min-w-0 flex items-center gap-10px">
              <span
                class="h-28px w-28px flex flex-none items-center justify-center rounded-8px bg-#eff6ff text-13px text-#2563eb font-600 dark:bg-#172554 dark:text-#93c5fd"
              >
                {{ conditionIndex + 1 }}
              </span>
              <div>
                <div class="text-14px text-[var(--n-text-color-1)] font-600 leading-20px">
                  条件项 {{ conditionIndex + 1 }}
                </div>
              </div>
            </div>
            <div class="flex flex-none items-center gap-8px lt-sm:w-full lt-sm:justify-end">
              <ButtonIcon
                size="small"
                type="error"
                icon="material-symbols:delete-outline"
                tooltip-content="删除条件项"
                :disabled="props.disabled"
                @click="removeCondition(conditionIndex)"
              />
            </div>
          </div>

          <NForm class="mt-14px" label-placement="top" :show-feedback="false" :disabled="props.disabled">
            <NGrid responsive="screen" item-responsive :x-gap="16" :y-gap="4">
              <NFormItemGi span="24 m:16" label="触发设备">
                <RemoteSearchSelect
                  v-model:value="condition.device_source_id"
                  :request="fetchDeviceList"
                  :search-type="1"
                  :immediate="false"
                  :selected-options="condition.selected_device"
                  label-field="name"
                  value-field="id"
                  placeholder="请选择设备"
                  clearable
                  @selected-change="syncConditionDevice(condition, $event)"
                />
              </NFormItemGi>
              <NFormItemGi span="24 m:8" label="条件项关系">
                <NSelect
                  v-model:value="condition.logic_operator_type"
                  disabled
                  :options="conditionIndex === 0 ? logicOperatorOptions : [{ label: '或', value: 2 }]"
                  placeholder="请选择关系"
                />
              </NFormItemGi>
            </NGrid>
          </NForm>

          <div class="mt-14px rounded-8px bg-#f8fafc p-12px dark:bg-#18181c">
            <div class="mb-10px flex items-center justify-between gap-12px lt-sm:flex-col lt-sm:items-start">
              <div class="text-13px text-[var(--n-text-color-1)] font-600 leading-18px">点位条件</div>
              <NButton
                class="flex-none"
                size="small"
                type="primary"
                secondary
                :disabled="props.disabled"
                @click="addConditionPoint(condition)"
              >
                <template #icon>
                  <SvgIcon icon="material-symbols:add-rounded" />
                </template>
                新增点位
              </NButton>
            </div>
            <div class="flex flex-col gap-8px">
              <div
                v-for="(point, pointIndex) in condition.sub_conds"
                :key="point._key"
                class="rounded-6px border border-#edf1f7 border-solid bg-white px-12px py-10px dark:border-#2f3338 dark:bg-#202126"
              >
                <NForm label-placement="top" :show-feedback="false" :disabled="props.disabled">
                  <NGrid responsive="screen" item-responsive :x-gap="12" :y-gap="4">
                    <NFormItemGi span="24 m:3" label="点位关系">
                      <NSelect
                        v-model:value="point.logic_operator_type"
                        :disabled="props.disabled || pointIndex === 0"
                        :options="logicOperatorOptions"
                        placeholder="请选择关系"
                      />
                    </NFormItemGi>
                    <NFormItemGi span="24 m:7" label="点位名称">
                      <RemoteSearchSelect
                        v-model:value="point.device_type_point_id"
                        :disabled="!condition.device_source_id"
                        :options-extractor="extractTaskDeviceTypePointOptions"
                        :request="fetchDeviceTypePointList"
                        :request-params="getDeviceTypePointRequestParams(condition.selected_device)"
                        :search-type="1"
                        :limit="10"
                        :immediate="false"
                        :selected-options="point.selected_device_type_point"
                        label-field="name"
                        value-field="id"
                        placeholder="请选择点位"
                        clearable
                        @selected-change="syncConditionPoint(point, $event)"
                      />
                    </NFormItemGi>
                    <NFormItemGi span="24 m:4" label="阈值">
                      <NSelect
                        v-model:value="point.threshold_type"
                        :disabled="!point.data_type"
                        :options="getThresholdOptions(point.data_type)"
                        placeholder="请选择阈值"
                      />
                    </NFormItemGi>
                    <NFormItemGi span="24 m:8" label="值">
                      <TaskPointValueInput
                        v-model:value="point.single_val"
                        v-model:range-value="point.range_val"
                        :data-type="point.data_type"
                        :setting="point.setting"
                        :range="isRangeThreshold(point.threshold_type)"
                        :disabled="!point.data_type"
                      />
                    </NFormItemGi>
                    <NFormItemGi span="24 m:2" label="操作">
                      <ButtonIcon
                        class="w-full"
                        size="small"
                        type="error"
                        icon="material-symbols:delete-outline"
                        tooltip-content="删除点位"
                        :disabled="props.disabled"
                        @click="removeConditionPoint(condition, pointIndex)"
                      />
                    </NFormItemGi>
                  </NGrid>
                </NForm>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        class="mt-2px rounded-8px border border-#e2e8f0/72 border-solid bg-white p-16px shadow-[0_8px_22px_rgba(15,23,42,0.05)] dark:border-#2f3338 dark:bg-#1f2228 dark:shadow-none [&_.n-form-item-label]:font-500 [&_.n-form-item]:mb-0"
      >
        <div
          class="flex items-center justify-between gap-16px border-b border-b-#edf1f7 border-b-solid pb-14px dark:border-b-#2f3338 lt-sm:flex-col lt-sm:items-start"
        >
          <div class="min-w-0 flex items-center gap-10px">
            <span
              class="h-28px w-28px flex flex-none items-center justify-center rounded-8px bg-#eff6ff text-13px text-#2563eb font-600 dark:bg-#172554 dark:text-#93c5fd"
            >
              频
            </span>
            <div>
              <div class="text-14px text-[var(--n-text-color-1)] font-600 leading-20px">触发频率</div>
            </div>
          </div>
        </div>

        <NForm class="mt-14px" label-placement="top" :show-feedback="false" :disabled="props.disabled">
          <NGrid responsive="screen" item-responsive :x-gap="16" :y-gap="4">
            <NFormItemGi span="24 m:12" label="持续时间">
              <NInputGroup>
                <NInputNumber
                  v-model:value="conditionFreq.durations"
                  :min="0"
                  :precision="0"
                  button-placement="right"
                  class="w-full"
                  @update:value="handleConditionDurationChange"
                />
                <NSelect
                  v-model:value="conditionFreq.time_type"
                  :options="conditionTimeTypeOptions"
                  class="w-120px flex-none"
                />
              </NInputGroup>
            </NFormItemGi>
            <NFormItemGi span="24 m:12" label="重复次数">
              <NInputNumber
                v-model:value="conditionFreq.repeat_times"
                :disabled="conditionFreq.durations === 0"
                :max="100"
                :min="0"
                :precision="0"
                button-placement="right"
                class="w-full"
                @update:value="handleConditionRepeatTimesChange"
              />
            </NFormItemGi>
          </NGrid>
        </NForm>
      </section>
    </template>

    <template v-else>
      <div class="min-h-40px flex items-center justify-between gap-16px lt-sm:flex-col lt-sm:items-start">
        <div class="min-w-0 flex items-center gap-10px">
          <span class="h-28px w-4px flex-none rounded-4px bg-#0891b2 shadow-[0_6px_14px_rgba(8,145,178,0.16)]"></span>
          <div>
            <div class="text-15px text-[var(--n-text-color-1)] font-600 leading-20px">执行动作</div>
          </div>
        </div>
        <NButton class="flex-none" size="small" type="primary" :disabled="props.disabled" @click="addAction">
          <template #icon>
            <SvgIcon icon="material-symbols:add-rounded" />
          </template>
          新增执行项
        </NButton>
      </div>

      <div class="flex flex-col gap-14px">
        <section
          v-for="(action, actionIndex) in actionModel.actions"
          :key="action._key"
          class="rounded-8px border border-#e2e8f0/72 border-solid bg-white p-16px shadow-[0_8px_22px_rgba(15,23,42,0.05)] dark:border-#2f3338 dark:bg-#1f2228 dark:shadow-none [&_.n-form-item-label]:font-500 [&_.n-form-item]:mb-0"
        >
          <div
            class="flex items-center justify-between gap-16px border-b border-b-#edf1f7 border-b-solid pb-14px dark:border-b-#2f3338 lt-sm:flex-col lt-sm:items-start"
          >
            <div class="min-w-0 flex items-center gap-10px">
              <span
                class="h-28px w-28px flex flex-none items-center justify-center rounded-8px bg-#ecfeff text-13px text-#0891b2 font-600 dark:bg-#164e63 dark:text-#67e8f9"
              >
                {{ actionIndex + 1 }}
              </span>
              <div>
                <div class="text-14px text-[var(--n-text-color-1)] font-600 leading-20px">
                  执行项 {{ actionIndex + 1 }}
                </div>
              </div>
            </div>
            <div class="flex flex-none items-center gap-8px lt-sm:w-full lt-sm:justify-end">
              <ButtonIcon
                size="small"
                type="error"
                icon="material-symbols:delete-outline"
                tooltip-content="删除执行项"
                :disabled="props.disabled"
                @click="removeAction(actionIndex)"
              />
            </div>
          </div>

          <NForm class="mt-14px" label-placement="top" :show-feedback="false" :disabled="props.disabled">
            <NGrid responsive="screen" item-responsive :x-gap="16" :y-gap="4">
              <NFormItemGi span="24 m:12" label="执行设备">
                <RemoteSearchSelect
                  v-model:value="action.device_id"
                  :request="fetchDeviceList"
                  :search-type="1"
                  :immediate="false"
                  :selected-options="action.selected_device"
                  label-field="name"
                  value-field="id"
                  placeholder="请选择设备"
                  clearable
                  @selected-change="syncActionDevice(action, $event)"
                />
              </NFormItemGi>
              <NFormItemGi span="24 m:6" label="延迟秒数">
                <NInputNumber
                  v-model:value="action.delay_seconds"
                  :max="300"
                  :min="1"
                  :precision="0"
                  button-placement="right"
                  class="w-full"
                  @update:value="handleActionDelaySecondsChange(action, $event)"
                />
              </NFormItemGi>
              <NFormItemGi span="24 m:6" label="连续次数">
                <NInputNumber
                  v-model:value="action.continuous_times"
                  :max="5"
                  :min="1"
                  :precision="0"
                  button-placement="right"
                  class="w-full"
                  @update:value="handleActionContinuousTimesChange(action, $event)"
                />
              </NFormItemGi>
            </NGrid>
          </NForm>

          <div class="mt-14px rounded-8px bg-#f8fafc p-12px dark:bg-#18181c">
            <div class="mb-10px flex items-center justify-between gap-12px lt-sm:flex-col lt-sm:items-start">
              <div class="text-13px text-[var(--n-text-color-1)] font-600 leading-18px">执行点位</div>
              <NButton
                class="flex-none"
                size="small"
                type="primary"
                secondary
                :disabled="props.disabled"
                @click="addActionPoint(action)"
              >
                <template #icon>
                  <SvgIcon icon="material-symbols:add-rounded" />
                </template>
                新增点位
              </NButton>
            </div>
            <div class="flex flex-col gap-8px">
              <div
                v-for="(point, pointIndex) in action.point_vals"
                :key="point._key"
                class="rounded-6px border border-#edf1f7 border-solid bg-white px-12px py-10px dark:border-#2f3338 dark:bg-#202126"
              >
                <NForm label-placement="top" :show-feedback="false" :disabled="props.disabled">
                  <NGrid responsive="screen" item-responsive :x-gap="12" :y-gap="4">
                    <NFormItemGi span="24 m:10" label="点位名称">
                      <RemoteSearchSelect
                        v-model:value="point.device_type_point_id"
                        :disabled="!action.device_id"
                        :options-extractor="extractTaskDeviceTypePointOptions"
                        :request="fetchDeviceTypePointList"
                        :request-params="getDeviceTypePointRequestParams(action.selected_device)"
                        :search-type="1"
                        :limit="10"
                        :immediate="false"
                        :selected-options="point.selected_device_type_point"
                        label-field="name"
                        value-field="id"
                        placeholder="请选择点位"
                        clearable
                        @selected-change="syncActionPoint(point, $event)"
                      />
                    </NFormItemGi>
                    <NFormItemGi span="24 m:12" label="执行值">
                      <TaskPointValueInput
                        v-model:value="point.point_val"
                        :data-type="point.data_type"
                        :setting="point.setting"
                        :disabled="!point.data_type"
                      />
                    </NFormItemGi>
                    <NFormItemGi span="24 m:2" label="操作">
                      <ButtonIcon
                        class="w-full"
                        size="small"
                        type="error"
                        icon="material-symbols:delete-outline"
                        tooltip-content="删除点位"
                        :disabled="props.disabled"
                        @click="removeActionPoint(action, pointIndex)"
                      />
                    </NFormItemGi>
                  </NGrid>
                </NForm>
              </div>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>
