<script setup lang="ts">
import { computed, h, shallowRef, watch } from 'vue';
import { NTag } from 'naive-ui';
import type { TagProps } from 'naive-ui';
import dayjs from 'dayjs';
import { useLoading } from '@sa/hooks';
import { formatDateTime } from '@sa/utils';
import { fetchGetTaskLog } from '@/service/api/task';
import { $t } from '@/locales';
import { displayValue } from '@/utils/common-methods';

defineOptions({
  name: 'TaskLogDetailDrawer'
});

type TableRow = {
  id: string;
  rowSpan: number;
  deviceName: string;
  pointName: string;
  content: string;
  status?: boolean | null;
  continuousTimes?: number;
};

const props = defineProps<{
  rowData?: Api.Task.TaskLog | null;
}>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const taskTypeMap: Record<Api.Task.TaskType, { label: string; type: NonNullable<TagProps['type']> }> = {
  1: { label: '条件任务', type: 'success' },
  2: { label: '定时任务', type: 'info' }
};

const scheduleTypeMap: Record<number, string> = {
  1: '一次执行',
  2: '按周期执行',
  3: '间隔时间重复执行',
  4: '按日程执行'
};

const weekdayMap: Record<number, string> = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六'
};

const repeatTypeMap: Record<number, string> = {
  1: '每天',
  2: '自定义'
};

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
const taskTypeTag = computed(() => (taskType.value ? taskTypeMap[taskType.value] : null));
const conditionDevicePointList = computed(() => taskLog.value?.cond_detail.device_point_list ?? []);
const actionDevicePointList = computed(() => taskLog.value?.action_detail.device_point_list ?? []);

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
      status: point ? point.is_success === true : null,
      continuousTimes: item.continuous_times
    }));
  })
);

const conditionTableColumns: NaiveUI.TableColumn<TableRow>[] = [
  {
    key: 'deviceName',
    title: '触发设备',
    align: 'center',
    minWidth: 160,
    ellipsis: { tooltip: true },
    rowSpan: row => row.rowSpan
  },
  {
    key: 'pointName',
    title: '触发点位',
    align: 'center',
    minWidth: 180,
    ellipsis: { tooltip: true }
  },
  {
    key: 'content',
    title: '执行内容',
    align: 'left',
    minWidth: 260,
    ellipsis: { tooltip: true }
  }
];

const actionTableColumns: NaiveUI.TableColumn<TableRow>[] = [
  {
    key: 'deviceName',
    title: '设备',
    align: 'center',
    minWidth: 140,
    ellipsis: { tooltip: true },
    rowSpan: row => row.rowSpan
  },
  {
    key: 'pointName',
    title: '点位',
    align: 'center',
    minWidth: 140,
    ellipsis: { tooltip: true }
  },
  {
    key: 'content',
    title: '执行内容',
    align: 'left',
    minWidth: 180,
    ellipsis: { tooltip: true }
  },
  {
    key: 'continuousTimes',
    title: '连续次数',
    align: 'center',
    width: 100,
    rowSpan: row => row.rowSpan,
    render: row => displayValue(row.continuousTimes)
  },
  {
    key: 'status',
    title: '状态',
    align: 'center',
    width: 90,
    render: row => renderActionStatus(row.status)
  }
];

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

  const items = [{ label: '调度类型', value: formatMapValue(sched.type, scheduleTypeMap) }];

  if (sched.daily) {
    items.push({ label: '重复类型', value: formatMapValue(sched.daily.repeat_type, repeatTypeMap) });
    items.push({ label: '执行星期', value: formatMappedList(sched.daily.weekdays, weekdayMap) });
    items.push({ label: '执行时间', value: formatUnixList(sched.daily.execution_at_list, 'HH:mm:ss') });
  }

  if (sched.custom) {
    items.push({ label: '执行日期', value: formatUnixList(sched.custom.execution_date_list, 'YYYY-MM-DD') });
    items.push({ label: '执行时间', value: formatUnixList(sched.custom.execution_at_list, 'HH:mm:ss') });
  }

  return items;
});

function formatUnixDateTime(value?: number | null) {
  if (!value) return '-';

  return formatDateTime(value * 1000);
}

function formatUnixList(values: number[] | undefined, template: string) {
  return formatList(values, value => dayjs(value * 1000).format(template));
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
  return values?.length ? values.map(formatter).join('、') : '-';
}

function renderActionStatus(status?: boolean | null) {
  if (status === null || status === undefined) return '-';

  return h(NTag, { size: 'small', type: status ? 'success' : 'error' }, { default: () => (status ? '成功' : '失败') });
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

  return uniqueNames.length ? uniqueNames.join('、') : '-';
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
    <NDrawerContent title="任务日志详情" :native-scrollbar="false" closable>
      <NSpin :show="loading">
        <div v-if="taskLog" class="flex flex-col gap-16px">
          <section class="flex flex-col gap-10px">
            <div class="detail-section-title">基本信息</div>
            <NDescriptions label-placement="left" bordered size="small" :column="2" label-class="w-90px">
              <NDescriptionsItem label="任务名称">{{ taskInfo?.name ?? '-' }}</NDescriptionsItem>
              <NDescriptionsItem label="任务类型">
                <NTag v-if="taskTypeTag" :type="taskTypeTag.type">{{ taskTypeTag.label }}</NTag>
                <span v-else>{{ displayValue(taskType) }}</span>
              </NDescriptionsItem>
              <NDescriptionsItem label="目标设备" :span="2">{{ targetDeviceNames }}</NDescriptionsItem>
              <NDescriptionsItem label="执行时间" :span="2">{{ executionTime }}</NDescriptionsItem>
            </NDescriptions>
          </section>

          <section v-if="taskType === 1" class="flex flex-col gap-10px">
            <div class="detail-section-title">触发条件</div>
            <div v-if="conditionDevicePointList.length" class="condition-list">
              <div
                v-for="(item, index) in conditionDevicePointList"
                :key="`${item.device_id}-${index}`"
                class="condition-item"
              >
                <div class="condition-title">条件项 {{ index + 1 }}</div>
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
                <NEmpty v-else description="暂无触发点位" :show-icon="false" />
              </div>
            </div>
            <NEmpty v-else description="暂无触发条件" />
          </section>

          <section v-else-if="taskType === 2" class="flex flex-col gap-10px">
            <div class="detail-section-title">日程配置</div>
            <NDescriptions v-if="scheduleItems.length" label-placement="left" bordered size="small" :column="1">
              <NDescriptionsItem v-for="item in scheduleItems" :key="item.label" :label="item.label">
                {{ item.value }}
              </NDescriptionsItem>
            </NDescriptions>
            <NEmpty v-else description="暂无日程配置" />
          </section>

          <section class="flex flex-col gap-10px">
            <div class="detail-section-title">执行动作</div>
            <NDataTable
              v-if="actionTableData.length"
              :columns="actionTableColumns"
              :data="actionTableData"
              :pagination="false"
              :bordered="true"
              :single-line="false"
              :scroll-x="830"
              :row-key="row => row.id"
              size="small"
              class="detail-table"
            />
            <NEmpty v-else description="暂无执行动作" />
          </section>
        </div>

        <NEmpty v-else-if="!loading" description="暂无任务日志详情" />
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
