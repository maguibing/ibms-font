<script setup lang="ts">
import { computed } from 'vue';
import ButtonIcon from '@/components/custom/button-icon.vue';
import RemoteSearchSelect from '@/components/custom/remote-search-select.vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { $t } from '@/locales';
import { fetchGetDeviceList, fetchGetDeviceTypeList, fetchGetDeviceTypePointList } from '@/service/api/device';
import { createConditionTimeTypeOptions, createLogicOperatorOptions, createThresholdOptions } from '../../../constants';
import TaskPointValueInput from './task-point-value-input.vue';
import {
  buildDeviceTypePointRequestParams,
  createDefaultAction,
  createDefaultActionPoint,
  createDefaultCondition,
  createDefaultConditionSubCond,
  extractTaskDeviceTypePointOptions,
  isRangeThreshold,
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
  type TaskRuleDeviceOption,
  type TaskRuleDeviceSourceType
} from './use-task-point-rule-editor';

defineOptions({
  name: 'TaskPointRuleEditor'
});

interface Props {
  mode: TaskPointRuleEditorMode;
  disabled?: boolean;
  deviceSourceType?: TaskRuleDeviceSourceType;
  showConditionFreq?: boolean;
  hideConditionRelation?: boolean;
  conditionLogicOperatorType?: Api.Task.TaskLogicalOperatorType;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  deviceSourceType: 1,
  showConditionFreq: true,
  hideConditionRelation: false,
  conditionLogicOperatorType: 1
});

const model = defineModel<TaskPointRuleEditorModel>('model', { required: true });

const conditionModel = computed(() => model.value as TaskConditionEditorModel);
const actionModel = computed(() => model.value as TaskActionEditorModel);
const logicOperatorOptions = computed(createLogicOperatorOptions);
const thresholdOptions = computed(createThresholdOptions);
const conditionTimeTypeOptions = computed(createConditionTimeTypeOptions);

const isConditionMode = computed(() => props.mode === 'condition');
const conditionFreq = computed(() => conditionModel.value.freq);
const conditionDeviceLabel = computed(() =>
  props.deviceSourceType === 2 ? $t('taskList.deviceType') : $t('taskLog.triggerDevice')
);
const conditionDevicePlaceholder = computed(() =>
  props.deviceSourceType === 2 ? $t('taskList.deviceTypePlaceholder') : $t('taskList.devicePlaceholder')
);

function fetchDeviceList(params: Record<string, any>) {
  return fetchGetDeviceList(withDefaultTaskSearchOption(params, { type: 1, value: '' }));
}

function fetchConditionDeviceSourceList(params: Record<string, any>) {
  if (props.deviceSourceType === 1) return fetchDeviceList(params);

  return fetchGetDeviceTypeList(withDefaultTaskSearchOption(params, { type: 1, value: '' }));
}

function fetchDeviceTypePointList(params: Record<string, any>) {
  return fetchGetDeviceTypePointList(params as CommonType.CommonListQueryParams);
}

function getDeviceTypePointRequestParams(device?: TaskRuleDeviceOption | null) {
  return buildDeviceTypePointRequestParams(device, props.deviceSourceType);
}

function addCondition() {
  addItem(
    conditionModel.value.conds,
    maxConditionCount,
    $t('taskList.maxConditions', { value: maxConditionCount }),
    () => createDefaultCondition(props.conditionLogicOperatorType, props.deviceSourceType)
  );
}

function removeCondition(index: number) {
  removeItem(conditionModel.value.conds, index, () =>
    createDefaultCondition(props.conditionLogicOperatorType, props.deviceSourceType)
  );
}

function addConditionPoint(condition: TaskConditionEditor) {
  addItem(
    condition.sub_conds,
    maxConditionPointCount,
    $t('taskList.maxConditionPoints', { value: maxConditionPointCount }),
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
  addItem(
    actionModel.value.actions,
    maxActionCount,
    $t('taskList.maxActions', { value: maxActionCount }),
    createDefaultAction
  );
}

function removeAction(index: number) {
  removeItem(actionModel.value.actions, index, createDefaultAction);
}

function addActionPoint(action: TaskActionEditor) {
  addItem(
    action.point_vals,
    maxActionPointCount,
    $t('taskList.maxActionPoints', { value: maxActionPointCount }),
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
  <div class="flex flex-col gap-12px">
    <template v-if="isConditionMode">
      <div class="flex items-center justify-between gap-12px text-14px text-[var(--n-text-color-1)] font-600">
        <span>{{ $t('taskList.triggerCondition') }}</span>
        <NButton text type="primary" :disabled="props.disabled" @click="addCondition">
          <template #icon><SvgIcon icon="material-symbols:add-rounded" /></template>
          {{ $t('taskList.addCondition') }}
        </NButton>
      </div>

      <div class="flex flex-col gap-10px">
        <section
          v-for="(condition, conditionIndex) in conditionModel.conds"
          :key="condition._key"
          class="rounded-6px border border-#e5e7eb border-solid px-14px py-12px dark:border-#2f3338"
        >
          <div
            class="mb-12px flex items-center justify-between gap-12px text-14px text-[var(--n-text-color-1)] font-600"
          >
            <span>{{ $t('taskList.conditionItem', { value: conditionIndex + 1 }) }}</span>
            <ButtonIcon
              size="small"
              type="error"
              icon="material-symbols:delete-outline"
              :tooltip-content="$t('taskList.deleteCondition')"
              :disabled="props.disabled"
              @click="removeCondition(conditionIndex)"
            />
          </div>

          <NForm label-placement="top" :show-feedback="false" :disabled="props.disabled">
            <NGrid responsive="screen" item-responsive :x-gap="16" :y-gap="4">
              <NFormItemGi :span="props.hideConditionRelation ? 24 : '24 m:16'" :label="conditionDeviceLabel">
                <RemoteSearchSelect
                  v-model:value="condition.device_source_id"
                  :request="fetchConditionDeviceSourceList"
                  :search-type="1"
                  :immediate="false"
                  :selected-options="condition.selected_device"
                  label-field="name"
                  value-field="id"
                  :placeholder="conditionDevicePlaceholder"
                  clearable
                  @selected-change="syncConditionDevice(condition, $event)"
                />
              </NFormItemGi>
              <NFormItemGi v-if="!props.hideConditionRelation" span="24 m:8" :label="$t('taskList.conditionRelation')">
                <NSelect
                  v-model:value="condition.logic_operator_type"
                  disabled
                  :options="
                    conditionIndex === 0
                      ? logicOperatorOptions
                      : [{ label: $t('taskList.conditionRelationOr'), value: 2 }]
                  "
                  :placeholder="$t('taskList.relationPlaceholder')"
                />
              </NFormItemGi>
            </NGrid>
          </NForm>

          <div class="mt-4px">
            <div class="mb-8px flex items-center justify-between gap-12px text-13px text-[var(--n-text-color-3)]">
              <span>{{ $t('taskList.pointThreshold') }}</span>
              <NButton
                size="small"
                type="primary"
                text
                :disabled="props.disabled"
                @click="addConditionPoint(condition)"
              >
                <template #icon><SvgIcon icon="material-symbols:add-rounded" /></template>
                {{ $t('taskList.addThreshold') }}
              </NButton>
            </div>
            <div class="flex flex-col gap-8px">
              <div v-for="(point, pointIndex) in condition.sub_conds" :key="point._key" class="[&_.n-form-item]:mb-0">
                <NForm :show-label="false" :show-feedback="false" :disabled="props.disabled">
                  <NGrid responsive="screen" item-responsive :x-gap="12" :y-gap="4">
                    <NFormItemGi span="24 m:3">
                      <NSelect
                        v-model:value="point.logic_operator_type"
                        :disabled="props.disabled || pointIndex === 0"
                        :options="logicOperatorOptions"
                        :placeholder="$t('taskList.relationPlaceholder')"
                      />
                    </NFormItemGi>
                    <NFormItemGi span="24 m:6">
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
                        :placeholder="$t('taskList.pointPlaceholder')"
                        clearable
                        @selected-change="syncConditionPoint(point, $event)"
                      />
                    </NFormItemGi>
                    <NFormItemGi span="24 m:4">
                      <NSelect
                        v-model:value="point.threshold_type"
                        :disabled="!point.data_type"
                        :options="
                          point.data_type === 1
                            ? thresholdOptions
                            : thresholdOptions.filter(item => [7, 8].includes(item.value))
                        "
                        :placeholder="$t('taskList.thresholdPlaceholder')"
                      />
                    </NFormItemGi>
                    <NFormItemGi span="24 m:9">
                      <TaskPointValueInput
                        v-model:value="point.single_val"
                        v-model:range-value="point.range_val"
                        :data-type="point.data_type"
                        :setting="point.setting"
                        :range="isRangeThreshold(point.threshold_type)"
                        :disabled="!point.data_type"
                      />
                    </NFormItemGi>
                    <NFormItemGi span="24 m:2">
                      <ButtonIcon
                        class="w-full"
                        size="small"
                        type="error"
                        icon="material-symbols:delete-outline"
                        :tooltip-content="$t('taskList.deletePoint')"
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
        v-if="props.showConditionFreq"
        class="rounded-6px border border-#e5e7eb border-solid px-16px py-14px dark:border-#2f3338"
      >
        <div class="mb-12px text-14px text-[var(--n-text-color-1)] font-600">{{ $t('taskList.triggerFrequency') }}</div>

        <NForm label-placement="top" :show-feedback="false" :disabled="props.disabled">
          <NGrid responsive="screen" item-responsive :x-gap="16" :y-gap="4">
            <NFormItemGi span="24 m:12" :label="$t('taskList.duration')">
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
            <NFormItemGi span="24 m:12" :label="$t('taskList.repeatCount')">
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
      <div class="flex items-center justify-between gap-12px text-14px text-[var(--n-text-color-1)] font-600">
        <span>{{ $t('taskList.executeAction') }}</span>
        <NButton text type="primary" :disabled="props.disabled" @click="addAction">
          <template #icon><SvgIcon icon="material-symbols:add-rounded" /></template>
          {{ $t('taskList.addAction') }}
        </NButton>
      </div>

      <div class="flex flex-col gap-10px">
        <section
          v-for="(action, actionIndex) in actionModel.actions"
          :key="action._key"
          class="rounded-6px border border-#e5e7eb border-solid px-14px py-12px dark:border-#2f3338"
        >
          <div
            class="mb-12px flex items-center justify-between gap-12px text-14px text-[var(--n-text-color-1)] font-600"
          >
            <span>{{ $t('taskList.actionItem', { value: actionIndex + 1 }) }}</span>
            <ButtonIcon
              size="small"
              type="error"
              icon="material-symbols:delete-outline"
              :tooltip-content="$t('taskList.deleteAction')"
              :disabled="props.disabled"
              @click="removeAction(actionIndex)"
            />
          </div>

          <NForm label-placement="top" :show-feedback="false" :disabled="props.disabled">
            <NGrid responsive="screen" item-responsive :x-gap="16" :y-gap="4">
              <NFormItemGi span="24 m:12" :label="$t('taskList.executeDevice')">
                <RemoteSearchSelect
                  v-model:value="action.device_id"
                  :request="fetchDeviceList"
                  :search-type="1"
                  :immediate="false"
                  :selected-options="action.selected_device"
                  label-field="name"
                  value-field="id"
                  :placeholder="$t('taskList.devicePlaceholder')"
                  clearable
                  @selected-change="syncActionDevice(action, $event)"
                />
              </NFormItemGi>
              <NFormItemGi span="24 m:6" :label="$t('taskList.delaySeconds')">
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
              <NFormItemGi span="24 m:6" :label="$t('taskList.continuousTimes')">
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

          <div class="mt-4px">
            <div class="mb-8px flex items-center justify-between gap-12px text-13px text-[var(--n-text-color-3)]">
              <span>{{ $t('taskList.executePointSettings') }}</span>
              <NButton size="small" type="primary" text :disabled="props.disabled" @click="addActionPoint(action)">
                <template #icon><SvgIcon icon="material-symbols:add-rounded" /></template>
                {{ $t('taskList.addPoint') }}
              </NButton>
            </div>
            <div class="flex flex-col gap-8px">
              <div v-for="(point, pointIndex) in action.point_vals" :key="point._key" class="[&_.n-form-item]:mb-0">
                <NForm :show-label="false" :show-feedback="false" :disabled="props.disabled">
                  <NGrid responsive="screen" item-responsive :x-gap="12" :y-gap="4">
                    <NFormItemGi span="24 m:10">
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
                        :placeholder="$t('taskList.pointPlaceholder')"
                        clearable
                        @selected-change="syncActionPoint(point, $event)"
                      />
                    </NFormItemGi>
                    <NFormItemGi span="24 m:12">
                      <TaskPointValueInput
                        v-model:value="point.point_val"
                        :data-type="point.data_type"
                        :setting="point.setting"
                        :disabled="!point.data_type"
                      />
                    </NFormItemGi>
                    <NFormItemGi span="24 m:2">
                      <ButtonIcon
                        class="w-full"
                        size="small"
                        type="error"
                        icon="material-symbols:delete-outline"
                        :tooltip-content="$t('taskList.deletePoint')"
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
