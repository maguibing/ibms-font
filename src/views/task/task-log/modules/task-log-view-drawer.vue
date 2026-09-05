<script setup lang="ts">
import { computed, h, shallowRef, watch } from 'vue';
import { NTag } from 'naive-ui';
import dayjs from 'dayjs';
import { useLoading } from '@sa/hooks';
import { fetchGetTaskLog } from '@/service/api/task';
import { $t } from '@/locales';
import { displayValue, formatUnixDateTime } from '@/utils/common-methods';
import { createRepeatTypeMap, createScheduleTypeMap, createTaskTypeMap, createWeekdayMap } from '../../constants';

defineOptions({
  name: 'TaskLogDetailDrawer'
});

type TableRow = {
  id: string;
  rowSpan: number;
  deviceName: string;
  pointName: string;
  content: string;
  execAt?: number;
  calendarBranch?: 1 | 2;
  timeRange?: string;
  status?: boolean | null;
  continuousTimes?: number;
};

const props = defineProps<{
  rowData?: Api.Task.TaskLog | null;
}>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { loading, startLoading, endLoading } = useLoading();
const detail = shallowRef<Api.Task.TaskLogDetailData | null>(null);

const taskLog = computed(() => detail.value?.task_log ?? null);

const taskLogExtra = computed<Api.Task.TaskLogListExtra>(() => ({
  task_map: detail.value?.task_map ?? {},
  device_map: detail.value?.device_map ?? {},
  device_type_point_map: detail.value?.device_type_point_map ?? {}
}));

const taskInfo = computed(() => {
  const taskId = taskLog.value?.task_id;
  if (!taskId) return null;

  return taskLogExtra.value.task_map[String(taskId)] ?? null;
});

const taskType = computed(() => taskLog.value?.cond_detail.task_type ?? taskInfo.value?.task_type ?? null);
const taskTypeMap = computed(createTaskTypeMap);
const scheduleTypeMap = computed(createScheduleTypeMap);
const repeatTypeMap = computed(createRepeatTypeMap);
const weekdayMap = computed(createWeekdayMap);
const taskTypeTag = computed(() => (taskType.value ? taskTypeMap.value[taskType.value] : null));
const conditionDevicePointList = computed(() => taskLog.value?.cond_detail.device_point_list ?? []);
const actionDevicePointList = computed(() => taskLog.value?.action_detail.device_point_list ?? []);
const isCalendarSchedule = computed(() => taskLog.value?.cond_detail.sched?.type === 5);

const actionTableData = computed<TableRow[]>(() =>
  actionDevicePointList.value.flatMap((item, actionIndex) => {
    const pointList = item.device_type_point_list?.length ? item.device_type_point_list : [null];
    const rowSpan = pointList.length;

    return pointList.map((point, pointIndex) => ({
      id: `${item.device_id}-${item.exec_at ?? actionIndex}-${point?.device_type_point_id ?? 'empty'}-${pointIndex}`,
      rowSpan: pointIndex === 0 ? rowSpan : 0,
      deviceName: getDeviceName(item.device_id),
      pointName: point ? getPointName(point.device_type_point_id) : '-',
      content: point?.content || '-',
      execAt: item.exec_at,
      calendarBranch: item.calendar_branch,
      timeRange: formatTimeRange(item.time_range),
      status: point ? point.is_success === true : null,
      continuousTimes: item.continuous_times
    }));
  })
);

const conditionTableColumns: NaiveUI.TableColumn<TableRow>[] = [
  {
    key: 'deviceName',
    title: $t('taskLog.triggerDevice'),
    align: 'center',
    minWidth: 160,
    ellipsis: { tooltip: true },
    rowSpan: row => row.rowSpan
  },
  {
    key: 'pointName',
    title: $t('taskLog.triggerPoint'),
    align: 'center',
    minWidth: 180,
    ellipsis: { tooltip: true }
  },
  {
    key: 'content',
    title: $t('taskLog.executionContent'),
    align: 'left',
    minWidth: 260,
    ellipsis: { tooltip: true }
  }
];

const actionTableColumns = computed<NaiveUI.TableColumn<TableRow>[]>(() => [
  {
    key: 'deviceName',
    title: $t('taskLog.device'),
    align: 'center',
    minWidth: 140,
    ellipsis: { tooltip: true },
    rowSpan: row => row.rowSpan
  },
  {
    key: 'pointName',
    title: $t('taskLog.point'),
    align: 'center',
    minWidth: 140,
    ellipsis: { tooltip: true }
  },
  ...(isCalendarSchedule.value
    ? [
        {
          key: 'calendarBranch',
          title: $t('taskLog.calendarBranch'),
          align: 'center' as const,
          width: 100,
          rowSpan: (row: TableRow) => row.rowSpan,
          render: (row: TableRow) => renderCalendarBranch(row.calendarBranch)
        },
        {
          key: 'timeRange',
          title: $t('taskLog.timeRange'),
          align: 'center' as const,
          minWidth: 150,
          rowSpan: (row: TableRow) => row.rowSpan,
          render: (row: TableRow) => row.timeRange ?? '-'
        },
        {
          key: 'execAt',
          title: $t('taskLog.executionTime'),
          align: 'center' as const,
          minWidth: 170,
          rowSpan: (row: TableRow) => row.rowSpan,
          render: (row: TableRow) => formatUnixDateTime(row.execAt)
        }
      ]
    : []),
  {
    key: 'content',
    title: $t('taskLog.executionContent'),
    align: 'left',
    minWidth: 180,
    ellipsis: { tooltip: true }
  },
  ...(!isCalendarSchedule.value
    ? [
        {
          key: 'continuousTimes',
          title: $t('taskLog.continuousTimes'),
          align: 'center' as const,
          width: 100,
          rowSpan: (row: TableRow) => row.rowSpan,
          render: (row: TableRow) => displayValue(row.continuousTimes)
        }
      ]
    : []),
  {
    key: 'status',
    title: $t('taskLog.status'),
    align: 'center',
    width: 90,
    render: row => renderActionStatus(row.status)
  }
]);

const targetDeviceNames = computed(() => {
  const source = actionDevicePointList.value.length ? actionDevicePointList.value : conditionDevicePointList.value;

  return getDeviceNameList(source);
});

const executionTime = computed(() => {
  const execAt = actionDevicePointList.value.find(item => item.exec_at)?.exec_at;

  return formatUnixDateTime(execAt ?? taskLog.value?.created_at);
});

const scheduleItems = computed(() => {
  const sched = taskLog.value?.cond_detail.sched;
  if (!sched) return [];

  const items = [{ label: $t('taskLog.scheduleType'), value: formatMapValue(sched.type, scheduleTypeMap.value) }];

  if (sched.daily) {
    items.push({
      label: $t('taskLog.repeatType'),
      value: formatMapValue(sched.daily.repeat_type, repeatTypeMap.value)
    });
    items.push({
      label: $t('taskLog.executionWeekday'),
      value: formatMappedList(sched.daily.weekdays, weekdayMap.value)
    });
    items.push({
      label: $t('taskLog.executionTimeList'),
      value: formatUnixList(sched.daily.execution_at_list, 'HH:mm:ss')
    });
  }

  if (sched.custom) {
    items.push({
      label: $t('taskLog.executionDate'),
      value: formatUnixList(sched.custom.execution_date_list, 'YYYY-MM-DD')
    });
    items.push({
      label: $t('taskLog.executionTimeList'),
      value: formatUnixList(sched.custom.execution_at_list, 'HH:mm:ss')
    });
  }

  if (sched.calendar) {
    items.push({
      label: $t('taskLog.dateGroup'),
      value: formatCalendarGroups(sched.calendar.date_groups)
    });
    items.push({
      label: $t('taskLog.pollingInterval'),
      value: sched.calendar.poll_interval_seconds ? `${sched.calendar.poll_interval_seconds}s` : '-'
    });
  }

  return items;
});

function formatUnixList(values: number[] | undefined, template: string) {
  return formatList(values, value => dayjs(value * 1000).format(template));
}

function formatTimeRange(range?: Api.Task.TaskLogDevicePoint['time_range']) {
  if (range?.start_at === undefined || range.end_at === undefined) return '-';

  return `${dayjs(range.start_at * 1000).format('HH:mm:ss')} - ${dayjs(range.end_at * 1000).format('HH:mm:ss')}`;
}

function formatCalendarGroups(groups?: Api.Task.TaskLogScheduleCalendarDateGroup[]) {
  if (!groups?.length) return '-';

  return groups
    .map((group, index) => {
      const dates = formatUnixList(group.execution_date_list, 'YYYY-MM-DD');
      const ranges = group.time_ranges?.length
        ? group.time_ranges.map(range => formatTimeRange(range)).join(', ')
        : '-';

      return `${$t('taskLog.dateGroup')} ${index + 1}: ${dates}; ${$t('taskLog.timeRange')}: ${ranges}`;
    })
    .join('\n');
}

function formatMappedList(values: number[] | undefined, map: Record<number, string>) {
  return formatList(values, value => map[value] ?? String(value));
}

function formatMapValue(value: number | undefined, map: Record<number, string>) {
  if (!value) return '-';

  const label = map[value];

  return label ?? String(value);
}

function formatList<T>(values: T[] | undefined, formatter: (value: T) => string) {
  return values?.length ? values.map(formatter).join(', ') : '-';
}

function renderActionStatus(status?: boolean | null) {
  if (status === null || status === undefined) return '-';

  return h(
    NTag,
    { size: 'small', type: status ? 'success' : 'error' },
    { default: () => (status ? $t('taskLog.success') : $t('taskLog.failure')) }
  );
}

function renderCalendarBranch(branch?: 1 | 2) {
  if (!branch) return '-';

  return h(
    NTag,
    { size: 'small', type: branch === 1 ? 'success' : 'warning' },
    {
      default: () => $t(branch === 1 ? 'taskLog.inRange' : 'taskLog.outOfRange')
    }
  );
}

function getConditionRows(item: Api.Task.TaskLogDevicePoint): TableRow[] {
  const pointList = item.device_type_point_list ?? [];

  return pointList.map((point, pointIndex) => ({
    id: `${item.device_id}-${point.device_type_point_id}-${pointIndex}`,
    rowSpan: pointIndex === 0 ? pointList.length : 0,
    deviceName: getDeviceName(item.device_id),
    pointName: getPointName(point.device_type_point_id),
    content: point.content || '-'
  }));
}

function getDeviceName(deviceId?: CommonType.IdType) {
  if (!deviceId) return '-';

  return taskLogExtra.value.device_map[String(deviceId)]?.name ?? '-';
}

function getPointName(pointId?: CommonType.IdType) {
  if (!pointId) return '-';

  return taskLogExtra.value.device_type_point_map[String(pointId)]?.name ?? '-';
}

function getDeviceNameList(list: Api.Task.TaskLogDevicePoint[]) {
  const names = list.map(item => getDeviceName(item.device_id)).filter(item => item !== '-');
  const uniqueNames = Array.from(new Set(names));

  return uniqueNames.length ? uniqueNames.join(', ') : '-';
}

async function getTaskLog(id: CommonType.IdType) {
  startLoading();
  const { data, error } = await fetchGetTaskLog({
    id,
    options: [{ key: 1 }, { key: 2 }, { key: 3 }]
  }).finally(endLoading);

  if (error) return;

  detail.value = data;
}

watch(visible, isVisible => {
  if (!isVisible) return;

  detail.value = null;

  const id = props.rowData?.id;
  if (id) {
    getTaskLog(id);
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="900" class="max-w-90%">
    <NDrawerContent :title="$t('taskLog.detail')" :native-scrollbar="false" closable>
      <NSpin :show="loading">
        <div v-if="taskLog" class="flex flex-col gap-16px">
          <section class="flex flex-col gap-10px">
            <div class="detail-section-title">{{ $t('taskLog.basicInfo') }}</div>
            <NDescriptions label-placement="left" bordered size="small" :column="2" label-class="w-90px">
              <NDescriptionsItem :label="$t('taskLog.taskName')">{{ taskInfo?.name ?? '-' }}</NDescriptionsItem>
              <NDescriptionsItem :label="$t('taskLog.taskType')">
                <NTag v-if="taskTypeTag" :type="taskTypeTag.type">{{ taskTypeTag.label }}</NTag>
                <span v-else>{{ displayValue(taskType) }}</span>
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('taskLog.targetDevice')" :span="2">
                {{ targetDeviceNames }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('taskLog.executionTime')" :span="2">{{ executionTime }}</NDescriptionsItem>
            </NDescriptions>
          </section>

          <section v-if="taskType === 1" class="flex flex-col gap-10px">
            <div class="detail-section-title">{{ $t('taskLog.triggerCondition') }}</div>
            <div v-if="conditionDevicePointList.length" class="condition-list">
              <div
                v-for="(item, index) in conditionDevicePointList"
                :key="`${item.device_id}-${index}`"
                class="condition-item"
              >
                <div class="condition-title">{{ $t('taskLog.conditionItem', { value: index + 1 }) }}</div>
                <NDataTable
                  v-if="item.device_type_point_list?.length"
                  :columns="conditionTableColumns"
                  :data="getConditionRows(item)"
                  :pagination="false"
                  :bordered="true"
                  :single-line="false"
                  :scroll-x="760"
                  :row-key="row => row.id"
                  size="small"
                  class="detail-table"
                />
                <NEmpty v-else :description="$t('taskLog.noTriggerPoints')" :show-icon="false" />
              </div>
            </div>
            <NEmpty v-else :description="$t('taskLog.noTriggerCondition')" />
          </section>

          <section v-else-if="taskType === 2" class="flex flex-col gap-10px">
            <div class="detail-section-title">{{ $t('taskLog.scheduleConfig') }}</div>
            <NDescriptions v-if="scheduleItems.length" label-placement="left" bordered size="small" :column="1">
              <NDescriptionsItem v-for="item in scheduleItems" :key="item.label" :label="item.label">
                {{ item.value }}
              </NDescriptionsItem>
            </NDescriptions>
            <NEmpty v-else :description="$t('taskLog.noScheduleConfig')" />
          </section>

          <section class="flex flex-col gap-10px">
            <div class="detail-section-title">{{ $t('taskLog.action') }}</div>
            <NDataTable
              v-if="actionTableData.length"
              :columns="actionTableColumns"
              :data="actionTableData"
              :pagination="false"
              :bordered="true"
              :single-line="false"
              :scroll-x="isCalendarSchedule ? 1300 : 830"
              :row-key="row => row.id"
              size="small"
              class="detail-table"
            />
            <NEmpty v-else :description="$t('taskLog.noAction')" />
          </section>
        </div>

        <NEmpty v-else-if="!loading" :description="$t('taskLog.noDetail')" />
      </NSpin>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="visible = false">{{ $t('common.close') }}</NButton>
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

.condition-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.condition-item {
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(var(--primary-color), 0.22);
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.04);
}

.condition-title {
  margin-bottom: 10px;
  color: rgb(var(--primary-color));
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.detail-table :deep(.n-data-table-td) {
  vertical-align: middle;
}
</style>
