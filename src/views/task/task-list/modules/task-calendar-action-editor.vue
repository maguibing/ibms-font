<script setup lang="ts">
import { computed } from 'vue';
import ButtonIcon from '@/components/custom/button-icon.vue';
import RemoteSearchSelect from '@/components/custom/remote-search-select.vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { $t } from '@/locales';
import { fetchGetDeviceList, fetchGetDeviceTypePointList } from '@/service/api/device';
import TaskPointValueInput from './task-point-rule-editor/task-point-value-input.vue';
import {
  buildDeviceTypePointRequestParams,
  createDefaultAction,
  createDefaultActionPoint,
  extractTaskDeviceTypePointOptions,
  syncActionDevice,
  syncActionPoint,
  withDefaultTaskSearchOption,
  type TaskActionEditor,
  type TaskActionEditorModel,
  type TaskRuleDeviceOption
} from './task-point-rule-editor/use-task-point-rule-editor';

export type TaskCalendarActionEditorModel = {
  actions: TaskActionEditorModel;
  outActions: TaskActionEditorModel;
};

const props = withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false });
const model = defineModel<TaskCalendarActionEditorModel>('model', { required: true });

const actionGroups = computed(() => model.value.actions.actions);
const outActionGroups = computed(() => model.value.outActions.actions);

function fetchDeviceList(params: Record<string, any>) {
  return fetchGetDeviceList(withDefaultTaskSearchOption(params, { type: 1, value: '' }));
}

function fetchDeviceTypePointList(params: Record<string, any>) {
  return fetchGetDeviceTypePointList(params as CommonType.CommonListQueryParams);
}

function addAction() {
  const action = createDefaultAction();
  action.delay_seconds = 0;
  action.continuous_times = 1;
  model.value.actions.actions.push(action);
  model.value.outActions.actions.push(createPairedAction());
}

function createPairedAction() {
  const action = createDefaultAction();
  action.delay_seconds = 0;
  action.continuous_times = 1;
  return action;
}

function removeAction(index: number) {
  if (actionGroups.value.length === 1) return;
  actionGroups.value.splice(index, 1);
  outActionGroups.value.splice(index, 1);
}

function addPoint(index: number) {
  actionGroups.value[index].point_vals.push(createDefaultActionPoint());
  outActionGroups.value[index].point_vals.push(createDefaultActionPoint());
}

function removePoint(index: number, pointIndex: number) {
  const action = actionGroups.value[index];
  if (action.point_vals.length === 1) return;
  action.point_vals.splice(pointIndex, 1);
  outActionGroups.value[index].point_vals.splice(pointIndex, 1);
}

function handleDeviceChange(index: number, selected: unknown) {
  syncActionDevice(actionGroups.value[index], selected);
  syncActionDevice(outActionGroups.value[index], selected);
}

function handlePointChange(index: number, pointIndex: number, selected: unknown) {
  syncActionPoint(actionGroups.value[index].point_vals[pointIndex], selected);
  const outPoint = outActionGroups.value[index].point_vals[pointIndex];
  syncActionPoint(outPoint, selected);
}

function getPointRequestParams(action: TaskActionEditor) {
  return buildDeviceTypePointRequestParams(action.selected_device as TaskRuleDeviceOption | null);
}

function getPointKey(action: TaskActionEditor, pointIndex: number) {
  return `${action.device_id ?? ''}-${action.point_vals[pointIndex].device_type_point_id ?? ''}`;
}

function getValidationMessage() {
  if (!actionGroups.value.length) return $t('taskList.addCalendarDeviceValidation');
  for (const [index, action] of actionGroups.value.entries()) {
    if (!action.device_id) return $t('taskList.selectCalendarDevice', { value: index + 1 });
    const outAction = outActionGroups.value[index];
    const inKeys = action.point_vals.map((_point, pointIndex) => getPointKey(action, pointIndex));
    const outKeys = outAction.point_vals.map((_point, pointIndex) => getPointKey(outAction, pointIndex));
    if (inKeys.some(key => key.endsWith('-'))) return $t('taskList.selectCalendarPoint', { value: index + 1 });
    if (new Set(inKeys).size !== inKeys.length) return $t('taskList.duplicateCalendarPoint', { value: index + 1 });
    if (inKeys.sort().join('|') !== outKeys.sort().join('|')) {
      return $t('taskList.calendarPointRangeMismatch', { value: index + 1 });
    }
    for (const [pointIndex, point] of action.point_vals.entries()) {
      if (!point.device_type_point_id) {
        return $t('taskList.selectCalendarPointDetail', { action: index + 1, point: pointIndex + 1 });
      }
      if (
        !point.data_type ||
        point.point_val.value === null ||
        point.point_val.value === undefined ||
        point.point_val.value === ''
      ) {
        return $t('taskList.inputCalendarInsideValue', { value: index + 1 });
      }
      const outPoint = outAction.point_vals[pointIndex];
      if (
        !outPoint?.data_type ||
        outPoint.point_val.value === null ||
        outPoint.point_val.value === undefined ||
        outPoint.point_val.value === ''
      ) {
        return $t('taskList.inputCalendarOutsideValue', { value: index + 1 });
      }
    }
  }
  return '';
}

defineExpose({ getValidationMessage });
</script>

<template>
  <div class="flex flex-col gap-12px">
    <div class="flex items-center justify-between text-14px font-600">
      <span>{{ $t('taskList.calendarAction') }}</span>
      <NButton text type="primary" :disabled="props.disabled" @click="addAction">
        <template #icon><SvgIcon icon="material-symbols:add-rounded" /></template>
        {{ $t('taskList.addDevice') }}
      </NButton>
    </div>
    <section
      v-for="(action, index) in actionGroups"
      :key="action._key"
      class="rounded-6px border border-#e5e7eb border-solid p-12px dark:border-#2f3338"
    >
      <div class="mb-10px flex items-center justify-between font-500">
        <span>{{ $t('taskList.deviceItem', { value: index + 1 }) }}</span>
        <ButtonIcon
          size="small"
          type="error"
          icon="material-symbols:delete-outline"
          :tooltip-content="$t('taskList.deleteAction')"
          :disabled="props.disabled || actionGroups.length === 1"
          @click="removeAction(index)"
        />
      </div>
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
        :disabled="props.disabled"
        @selected-change="handleDeviceChange(index, $event)"
      />
      <div class="mt-10px flex flex-col gap-8px">
        <div
          class="grid grid-cols-[minmax(130px,1fr)_minmax(130px,1fr)_minmax(130px,1fr)_auto] gap-8px text-12px text-[var(--n-text-color-3)]"
        >
          <span>{{ $t('taskLog.point') }}</span>
          <span>{{ $t('taskList.inside') }}</span>
          <span>{{ $t('taskList.outside') }}</span>
          <span></span>
        </div>
        <div
          v-for="(point, pointIndex) in action.point_vals"
          :key="point._key"
          class="grid grid-cols-[minmax(130px,1fr)_minmax(130px,1fr)_minmax(130px,1fr)_auto] items-center gap-8px"
        >
          <RemoteSearchSelect
            v-model:value="point.device_type_point_id"
            :disabled="props.disabled || !action.device_id"
            :options-extractor="extractTaskDeviceTypePointOptions"
            :request="fetchDeviceTypePointList"
            :request-params="getPointRequestParams(action)"
            :search-type="1"
            :limit="10"
            :immediate="false"
            :selected-options="point.selected_device_type_point"
            label-field="name"
            value-field="id"
            :placeholder="$t('taskList.pointPlaceholder')"
            clearable
            @selected-change="handlePointChange(index, pointIndex, $event)"
          />
          <TaskPointValueInput
            v-model:value="point.point_val"
            :data-type="point.data_type"
            :setting="point.setting"
            :disabled="props.disabled || !point.data_type"
          />
          <TaskPointValueInput
            v-model:value="outActionGroups[index].point_vals[pointIndex].point_val"
            :data-type="outActionGroups[index].point_vals[pointIndex].data_type"
            :setting="outActionGroups[index].point_vals[pointIndex].setting"
            :disabled="props.disabled || !point.data_type"
          />
          <ButtonIcon
            size="small"
            type="error"
            icon="material-symbols:delete-outline"
            :tooltip-content="$t('taskList.deletePoint')"
            :disabled="props.disabled || action.point_vals.length === 1"
            @click="removePoint(index, pointIndex)"
          />
        </div>
        <NButton size="small" text type="primary" :disabled="props.disabled" @click="addPoint(index)">
          <template #icon><SvgIcon icon="material-symbols:add-rounded" /></template>
          {{ $t('taskList.addPoint') }}
        </NButton>
      </div>
    </section>
  </div>
</template>
