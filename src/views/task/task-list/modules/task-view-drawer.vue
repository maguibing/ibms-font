<script setup lang="ts">
import { computed, h, shallowRef, watch } from 'vue';
import { NTag } from 'naive-ui';
import dayjs from 'dayjs';
import StatusTag from '@/components/custom/status-tag.vue';
import { useLoading } from '@sa/hooks';
import EnumTag from '@/components/custom/enum-tag.vue';
import { fetchGetTask } from '@/service/api/task';
import { $t } from '@/locales';
import { displayValue, formatUnixDateTime } from '@/utils/common-methods';
import {
  createLogicOperatorOptions,
  createRepeatTypeMap,
  createScheduleTypeMap,
  createTaskTypeMap,
  createWeekdayMap,
  createIntervalTimeTypeMap
} from '../../constants';

defineOptions({
  name: 'TaskViewDrawer'
});

type ActionTableRow = {
  id: string;
  deviceName: string;
  pointName: string;
  dataType: CommonType.DataType;
  value: string;
  delaySeconds?: number;
  continuousTimes?: number;
  outValue?: string;
};

type ConditionTableRow = {
  id: string;
  deviceName: string;
  deviceSourceType: string;
  logicOperatorType: string;
};

const props = defineProps<{
  rowData?: Api.Task.Task | null;
}>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { loading, startLoading, endLoading } = useLoading();
const detail = shallowRef<Api.Task.TaskDetailData | null>(null);

const task = computed(() => detail.value?.task ?? null);
const taskTypeMap = computed(createTaskTypeMap);
const scheduleTypeMap = computed(createScheduleTypeMap);
const repeatTypeMap = computed(createRepeatTypeMap);
const weekdayMap = computed(createWeekdayMap);
const intervalTimeTypeMap = computed(createIntervalTimeTypeMap);
const logicOperatorMap = computed(() =>
  Object.fromEntries(createLogicOperatorOptions().map(item => [item.value, item.label]))
);
const deviceSourceTypeMap = computed(() => ({ 1: $t('taskLog.device'), 2: $t('taskList.deviceType') }));
const taskTypeTag = computed(() => (task.value ? taskTypeMap.value[task.value.task_type] : null));
const actionList = computed(() => task.value?.action_setting.actions ?? []);
const outActionList = computed(() => task.value?.action_setting.out_actions ?? []);
const conditionList = computed(() => task.value?.cond_setting.conds ?? []);

const targetDeviceNames = computed(() => {
  const actionDeviceIds = actionList.value.flatMap(action =>
    (action.point_vals ?? [])
      .map(point => point.device?.id)
      .filter((deviceId): deviceId is CommonType.IdType => deviceId !== null && deviceId !== undefined)
  );
  const outDeviceIds = outActionList.value.flatMap(action =>
    (action.point_vals ?? [])
      .map(point => point.device?.id)
      .filter((deviceId): deviceId is CommonType.IdType => deviceId !== null && deviceId !== undefined)
  );
  const conditionDeviceIds = conditionList.value
    .map(condition => condition.device_source_id)
    .filter((deviceId): deviceId is CommonType.IdType => deviceId !== null && deviceId !== undefined);
  const deviceIds = actionDeviceIds.length ? actionDeviceIds : outDeviceIds.length ? outDeviceIds : conditionDeviceIds;
  const names = deviceIds.map(deviceId => getDeviceName(deviceId)).filter(item => item !== '-');
  const uniqueNames = Array.from(new Set(names));

  return uniqueNames.length ? uniqueNames.join('、') : '-';
});

const scheduleItems = computed(() => {
  const sched = task.value?.cond_setting.sched;
  if (!sched) return [];

  const items = [{ label: $t('taskList.scheduleType'), value: formatMapValue(sched.type, scheduleTypeMap.value) }];

  if (sched.once) {
    items.push({ label: $t('taskList.executionTime'), value: formatUnixDateTime(sched.once.execution_at) });
  }

  if (sched.daily) {
    items.push({
      label: $t('taskList.repeatMethod'),
      value: formatMapValue(sched.daily.repeat_type, repeatTypeMap.value)
    });
    if (sched.daily.repeat_type === 2) {
      items.push({
        label: $t('taskList.executionWeekday'),
        value: formatMappedList(sched.daily.weekdays, weekdayMap.value)
      });
    }
    items.push({
      label: $t('taskList.executionTime'),
      value: formatUnixList(sched.daily.execution_at_list, 'HH:mm:ss')
    });
  }

  if (sched.custom) {
    items.push({
      label: $t('taskList.executionDate'),
      value: formatUnixList(sched.custom.execution_date_list, 'YYYY-MM-DD')
    });
    items.push({
      label: $t('taskList.executionTime'),
      value: formatUnixList(sched.custom.execution_at_list, 'HH:mm:ss')
    });
  }

  if (sched.calendar) {
    items.push({ label: $t('taskList.dateGroup'), value: formatCalendarGroups(sched.calendar.date_groups) });
  }

  if (sched.interval) {
    items.push({ label: $t('taskList.intervalTime'), value: formatIntervalValue(sched.interval) });
  }

  return items;
});

const conditionTableData = computed<ConditionTableRow[]>(() =>
  conditionList.value.map((condition, index) => ({
    id: `${condition.device_source_id ?? 'empty'}-${index}`,
    deviceName: getDeviceName(condition.device_source_id),
    logicOperatorType: formatMapValue(condition.logic_operator_type, logicOperatorMap.value),
    deviceSourceType: formatMapValue(condition.device_source_type, deviceSourceTypeMap.value)
  }))
);

const actionTableData = computed<ActionTableRow[]>(() =>
  actionList.value.flatMap((action, actionIndex) =>
    (action.point_vals ?? []).map((point, pointIndex) => {
      const pointId = point.device_type_point?.id;

      const outPoint = outActionList.value[actionIndex]?.point_vals?.[pointIndex];
      return {
        id: `${point.device?.id ?? 'empty'}-${pointId ?? 'empty'}-${actionIndex}-${pointIndex}`,
        deviceName: getDeviceName(point.device?.id),
        pointName: getPointName(pointId),
        dataType: point.data_type,
        value: formatPointValue(point),
        delaySeconds: action.delay_seconds,
        continuousTimes: action.continuous_times,
        outValue: outPoint ? formatPointValue(outPoint) : undefined
      };
    })
  )
);

const conditionTableColumns = computed<NaiveUI.TableColumn<ConditionTableRow>[]>(() => [
  {
    key: 'deviceName',
    title: $t('taskLog.triggerDevice'),
    align: 'center',
    minWidth: 160,
    ellipsis: { tooltip: true }
  },
  {
    key: 'deviceSourceType',
    title: $t('taskList.deviceSource'),
    align: 'center',
    width: 120
  },
  {
    key: 'logicOperatorType',
    title: $t('taskList.conditionRelation'),
    align: 'center',
    width: 120
  }
]);

const actionTableColumns = computed<NaiveUI.TableColumn<ActionTableRow>[]>(() => [
  {
    key: 'deviceName',
    title: $t('taskLog.device'),
    align: 'center',
    minWidth: 150,
    ellipsis: { tooltip: true }
  },
  {
    key: 'pointName',
    title: $t('taskLog.point'),
    align: 'center',
    minWidth: 160,
    ellipsis: { tooltip: true }
  },
  {
    key: 'dataType',
    title: $t('taskList.dataType'),
    align: 'center',
    width: 100,
    render: row => h(EnumTag, { value: row.dataType })
  },
  {
    key: 'value',
    title: $t('taskList.executionValue'),
    align: 'center',
    minWidth: 120,
    ellipsis: { tooltip: true }
  },
  {
    key: 'outValue',
    title: $t('taskList.outOfRangeValue'),
    align: 'center',
    minWidth: 120,
    ellipsis: { tooltip: true },
    render: row => displayValue(row.outValue)
  },
  {
    key: 'delaySeconds',
    title: $t('taskList.delaySeconds'),
    align: 'center',
    width: 100,
    render: row => displayValue(row.delaySeconds)
  },
  {
    key: 'continuousTimes',
    title: $t('taskList.continuousTimes'),
    align: 'center',
    width: 100,
    render: row => displayValue(row.continuousTimes)
  }
]);

function formatUnixList(values: number[] | undefined, template: string) {
  return formatList(values, value => dayjs(value * 1000).format(template));
}

function formatMappedList(values: number[] | undefined, map: Record<number, string>) {
  return formatList(values, value => map[value] ?? String(value));
}

function formatMapValue(value: number | undefined, map: Record<number, string>) {
  if (!value) return '-';

  return map[value] ?? String(value);
}

function formatIntervalValue(interval: Api.Task.TaskLogScheduleInterval) {
  const intervals = interval.intervals;
  if (intervals === null || intervals === undefined) return '-';

  const unit = interval.time_type ? intervalTimeTypeMap.value[interval.time_type] : undefined;

  return unit ? `${intervals}${unit}` : String(intervals);
}

function formatList<T>(values: T[] | undefined, formatter: (value: T) => string) {
  return values?.length ? values.map(formatter).join(', ') : '-';
}

function formatCalendarGroups(groups?: Api.Task.TaskLogScheduleCalendarDateGroup[]) {
  return groups?.length
    ? groups
        .map((group, index) => {
          const dates = formatUnixList(group.execution_date_list, 'YYYY-MM-DD');
          const ranges = group.time_ranges?.length
            ? group.time_ranges
                .map(range => `${formatUnixTime(range.start_at)}-${formatUnixTime(range.end_at)}`)
                .join('、')
            : '-';
          return `${$t('taskList.dateGroup')} ${index + 1}: ${dates} ${ranges}`;
        })
        .join('；')
    : '-';
}

function formatUnixTime(value?: number) {
  return value === undefined ? '-' : dayjs(value * 1000).format('HH:mm:ss');
}

function formatPointValue(point: Api.Task.TaskPointValue) {
  if (point.data_type === 1) {
    const value = point.num_val?.value ?? 0;
    const unit = point.num_val?.unit;
    const unitText = unit ? ` ${unit}` : '';

    return value === null || value === undefined ? '-' : `${value}${unitText}`;
  }

  if (point.data_type === 2) {
    return displayValue(point.switch_val?.alias ?? point.switch_val?.value);
  }

  if (point.data_type === 3) {
    return displayValue(point.text_val?.value ?? point.str_val?.value);
  }

  if (point.data_type === 4) {
    return displayValue(point.enum_val?.alias ?? point.enum_val?.value);
  }

  return '-';
}

function getDeviceName(deviceId?: CommonType.IdType) {
  if (!deviceId) return '-';

  return detail.value?.device_map[String(deviceId)]?.name ?? '-';
}

function getPointName(pointId?: CommonType.IdType) {
  if (!pointId) return '-';

  return detail.value?.device_type_point_map[String(pointId)]?.name ?? '-';
}

async function getTaskDetail(id: CommonType.IdType) {
  startLoading();
  const { data, error } = await fetchGetTask({
    id,
    options: [{ key: 1 }, { key: 2 }]
  }).finally(endLoading);

  if (error) return;

  detail.value = data;
}

function closeDrawer() {
  visible.value = false;
}

watch(visible, () => {
  if (!visible.value) return;

  detail.value = null;

  if (props.rowData?.id) {
    getTaskDetail(props.rowData.id);
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="900" class="max-w-90%">
    <NDrawerContent :title="$t('taskList.detail')" :native-scrollbar="false" closable>
      <NSpin :show="loading">
        <div v-if="task" class="flex flex-col gap-16px">
          <section class="flex flex-col gap-10px">
            <div class="detail-section-title">{{ $t('taskList.basicInfo') }}</div>
            <NDescriptions label-placement="left" bordered size="small" :column="2" label-class="w-90px">
              <NDescriptionsItem :label="$t('taskList.taskName')">{{ displayValue(task.name) }}</NDescriptionsItem>
              <NDescriptionsItem :label="$t('taskList.targetDevice')" :span="2">
                {{ targetDeviceNames }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('taskList.taskType')">
                <NTag v-if="taskTypeTag" :type="taskTypeTag.type">{{ taskTypeTag.label }}</NTag>
                <span v-else>{{ displayValue(task.task_type) }}</span>
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('taskList.status')">
                <StatusTag :value="task.status" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('taskList.createdAt')">
                {{ formatUnixDateTime(task.created_at) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('taskList.updatedAt')">
                {{ formatUnixDateTime(task.updated_at) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('taskList.remark')" :span="2">
                {{ displayValue(task.desc) }}
              </NDescriptionsItem>
            </NDescriptions>
          </section>

          <section v-if="task.task_type === 1" class="flex flex-col gap-10px">
            <div class="detail-section-title">{{ $t('taskList.triggerCondition') }}</div>
            <NDataTable
              v-if="conditionTableData.length"
              :columns="conditionTableColumns"
              :data="conditionTableData"
              :pagination="false"
              :bordered="true"
              :single-line="false"
              :scroll-x="520"
              :row-key="row => row.id"
              size="small"
              class="detail-table"
            />
            <NEmpty v-else :description="$t('taskList.noTriggerCondition')" />
          </section>

          <section v-else-if="task.task_type === 2" class="flex flex-col gap-10px">
            <div class="detail-section-title">{{ $t('taskList.scheduleConfig') }}</div>
            <NDescriptions v-if="scheduleItems.length" label-placement="left" bordered size="small" :column="1">
              <NDescriptionsItem v-for="item in scheduleItems" :key="item.label" :label="item.label">
                {{ item.value }}
              </NDescriptionsItem>
            </NDescriptions>
            <NEmpty v-else :description="$t('taskList.noScheduleConfig')" />
          </section>

          <section class="flex flex-col gap-10px">
            <div class="detail-section-title">{{ $t('taskList.executeAction') }}</div>
            <NDataTable
              v-if="actionTableData.length"
              :columns="actionTableColumns"
              :data="actionTableData"
              :pagination="false"
              :bordered="true"
              :single-line="false"
              :scroll-x="820"
              :row-key="row => row.id"
              size="small"
              class="detail-table"
            />
            <NEmpty v-else :description="$t('taskList.noAction')" />
          </section>
        </div>

        <NEmpty v-else-if="!loading" :description="$t('taskList.noDetail')" />
      </NSpin>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.close') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.detail-section-title {
  padding-left: 8px;
  border-left: 3px solid rgb(var(--primary-color));
  color: var(--n-text-color-1);
  font-size: 15px;
  font-weight: 600;
  line-height: 18px;
}

.detail-table :deep(.n-data-table-td) {
  vertical-align: middle;
}
</style>
