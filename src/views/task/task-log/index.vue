<script setup lang="tsx">
import { computed, ref, shallowRef } from 'vue';
import { NTag } from 'naive-ui';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { useAppStore } from '@/store/modules/app';
import { fetchGetTaskLogList } from '@/service/api/task';
import { $t } from '@/locales';
import { formatUnixDateTime } from '@/utils/common-methods';
import ButtonIcon from '@/components/custom/button-icon.vue';
import { createTaskTypeMap } from '../constants';
import TaskLogViewDrawer from './modules/task-log-view-drawer.vue';
import TaskLogSearch from './modules/task-log-search.vue';

defineOptions({
  name: 'TaskLog'
});

const appStore = useAppStore();

const taskLogRelatedOptions: CommonType.CommonKeysOptions[] = [{ key: 1 }, { key: 2 }, { key: 3 }];

const searchParams = ref<Api.Task.TaskLogSearchParams>({
  pageNum: 1,
  pageSize: 15,
  task_name: null,
  task_type: null
});

const detailDrawerVisible = shallowRef(false);
const detailRowData = shallowRef<Api.Task.TaskLog | null>(null);
const taskTypeMap = computed(createTaskTypeMap);

function transformSearchParamsToRequest(params: Api.Task.TaskLogSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 15;
  const filterConfigs = [
    { type: 104, value: '101' },
    { type: 51, value: params.task_name },
    { type: 52, value: params.task_type }
  ];

  const options = filterConfigs
    .filter(item => item.value !== null && item.value !== undefined && item.value !== '')
    .map(({ type, value }) => ({ type, value: String(value) }));

  return {
    list_option: {
      offset: (pageNum - 1) * pageSize,
      limit: pageSize,
      options
    },
    options: taskLogRelatedOptions
  };
}

const { columns, columnChecks, data, extraData, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetTaskLogList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Task.TaskLog>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page;
      searchParams.value.pageSize = params.pageSize;
    },
    columns: (): NaiveUI.TableColumn<Api.Task.TaskLog>[] => [
      {
        key: 'index',
        title: $t('common.index'),
        align: 'center',
        width: 64,
        render: (_, index) => index + 1
      },
      {
        key: 'task_id',
        title: $t('taskLog.taskName'),
        align: 'center',
        minWidth: 180,
        ellipsis: { tooltip: true },
        render: row => getTaskName(row.task_id)
      },
      {
        key: 'task_type',
        title: $t('taskLog.taskType'),
        align: 'center',
        minWidth: 110,
        render: row => renderTaskType(getTaskType(row))
      },
      {
        key: 'device_id',
        title: $t('taskLog.targetDevice'),
        align: 'center',
        minWidth: 180,
        ellipsis: { tooltip: true },
        render: row => getTargetDeviceNames(row)
      },
      {
        key: 'exec_at',
        title: $t('taskLog.executionTime'),
        align: 'center',
        minWidth: 180,
        render: row => formatUnixDateTime(getExecutionTime(row))
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 100,
        fixed: 'right',
        render: row => (
          <ButtonIcon
            text
            type="primary"
            icon="material-symbols:visibility-outline"
            tooltipContent={$t('taskLog.detail')}
            onClick={() => handleView(row)}
          />
        )
      }
    ]
  });

const taskLogExtra = computed<Api.Task.TaskLogListExtra>(() => {
  const raw = extraData.value as Partial<Api.Task.TaskLogListExtra> | null;

  return {
    task_map: raw?.task_map ?? {},
    device_map: raw?.device_map ?? {},
    device_type_point_map: raw?.device_type_point_map ?? {}
  };
});

function getTaskName(taskId: CommonType.IdType) {
  return taskLogExtra.value.task_map[String(taskId)]?.name ?? '-';
}

function getTaskType(row: Api.Task.TaskLog) {
  return row.cond_detail.task_type ?? taskLogExtra.value.task_map[String(row.task_id)]?.task_type ?? null;
}

function renderTaskType(type: Api.Task.TaskType | null) {
  if (!type) return '-';

  const config = taskTypeMap.value[type];

  return config ? <NTag type={config.type}>{config.label}</NTag> : String(type);
}

function getDeviceName(deviceId: CommonType.IdType) {
  return taskLogExtra.value.device_map[String(deviceId)]?.name ?? '-';
}

function getTargetDeviceNames(row: Api.Task.TaskLog) {
  const devicePointList = row.action_detail.device_point_list?.length
    ? row.action_detail.device_point_list
    : row.cond_detail.device_point_list ?? [];
  const names = devicePointList.map(item => getDeviceName(item.device_id)).filter(item => item !== '-');
  const uniqueNames = Array.from(new Set(names));

  return uniqueNames.length ? uniqueNames.join('、') : '-';
}

function getExecutionTime(row: Api.Task.TaskLog) {
  return row.action_detail.device_point_list?.find(item => item.exec_at)?.exec_at ?? row.created_at;
}

function handleSearch() {
  getDataByPage(1);
}

function handleView(row: Api.Task.TaskLog) {
  detailRowData.value = row;
  detailDrawerVisible.value = true;
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <TaskLogSearch v-model:model="searchParams" @search="handleSearch" />

    <NCard :title="$t('taskLog.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
          :show-add="false"
          :show-delete="false"
          :show-export="false"
          @refresh="getData"
        />
      </template>
      <DataTable
        :columns="columns"
        :data="data"
        :flex-height="!appStore.isMobile"
        :scroll-x="scrollX"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <TaskLogViewDrawer v-model:visible="detailDrawerVisible" :row-data="detailRowData" />
    </NCard>
  </div>
</template>

<style scoped></style>
