<script setup lang="tsx">
import { computed, ref, shallowRef } from 'vue';
import { NDivider, NTag } from 'naive-ui';
import StatusTag from '@/components/custom/status-tag.vue';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { fetchDeleteTask, fetchExecuteTask, fetchGetTaskList } from '@/service/api/task';
import { $t } from '@/locales';
import { formatUnixDateTime } from '@/utils/common-methods';
import ButtonIcon from '@/components/custom/button-icon.vue';
import { createTaskTypeMap } from '../constants';
import TaskListSearch from './modules/task-list-search.vue';
import TaskOperateDrawer from './modules/task-operate-drawer.vue';
import { buildTaskListRequest } from './modules/task-request';
import TaskViewDrawer from './modules/task-view-drawer.vue';

defineOptions({
  name: 'TaskList'
});

interface Props {
  embedded?: boolean;
  fixedDeviceId?: CommonType.IdType | null;
}

const props = withDefaults(defineProps<Props>(), {
  embedded: false,
  fixedDeviceId: null
});

const appStore = useAppStore();
const { hasAuth } = useAuth();
const checkedRowKeys = ref<CommonType.IdType[]>([]);
const operateDrawerVisible = shallowRef(false);
const operateType = shallowRef<NaiveUI.TableOperateType>('add');
const operateRowData = shallowRef<Api.Task.Task | null>(null);
const detailDrawerVisible = shallowRef(false);
const detailRowData = shallowRef<Api.Task.Task | null>(null);
const taskTypeMap = computed(createTaskTypeMap);

const searchParams = ref<Api.Task.TaskSearchParams>({
  pageNum: 1,
  pageSize: 15,
  name: null
});

const containerClass = computed(() => [
  props.embedded
    ? 'h-full min-h-0 flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto'
    : 'min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto'
]);

const { columns, columnChecks, data, extraData, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetTaskList(buildTaskListRequest(searchParams.value, props.fixedDeviceId)),
    transform: response => defaultTransform<Api.Task.Task>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page;
      searchParams.value.pageSize = params.pageSize;
    },
    columns: (): NaiveUI.TableColumn<Api.Task.Task>[] => [
      {
        type: 'selection',
        align: 'center',
        width: 48
      },
      {
        key: 'index',
        title: $t('common.index'),
        align: 'center',
        width: 64,
        render: (_, index) => index + 1
      },
      {
        key: 'name',
        title: $t('taskList.taskName'),
        align: 'center',
        minWidth: 180,
        ellipsis: { tooltip: true }
      },
      {
        key: 'task_type',
        title: $t('taskList.taskType'),
        align: 'center',
        minWidth: 110,
        render: row => renderTaskType(row.task_type)
      },
      {
        key: 'device_id',
        title: $t('taskList.targetDevice'),
        align: 'center',
        minWidth: 180,
        ellipsis: { tooltip: true },
        render: row => getTargetDeviceNames(row)
      },
      {
        key: 'status',
        title: $t('taskList.status'),
        align: 'center',
        minWidth: 100,
        render: row => <StatusTag value={row.status} />
      },
      {
        key: 'created_at',
        title: $t('taskList.createdAt'),
        align: 'center',
        minWidth: 180,
        render: row => formatUnixDateTime(row.created_at)
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 220,
        fixed: 'right',
        render: row => {
          const viewBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:visibility-outline"
              tooltipContent={$t('taskList.view')}
              onClick={() => handleView(row)}
            />
          );

          const editBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => handleEdit(row)}
            />
          );

          const execBtn = () => (
            <ButtonIcon
              text
              type="success"
              icon="material-symbols:play-arrow-outline"
              tooltipContent={$t('taskList.execute')}
              popconfirmContent={$t('taskList.executePrompt')}
              onPositiveClick={() => handleExecuteTask(row.id)}
            />
          );

          const deleteBtn = () => (
            <ButtonIcon
              text
              type="error"
              icon="material-symbols:delete-outline"
              tooltipContent={$t('common.delete')}
              popconfirmContent={$t('common.confirmDelete')}
              onPositiveClick={() => handleDelete(row.id)}
            />
          );

          const buttons = [];
          if (hasAuth('task:task-list:view')) buttons.push(viewBtn());
          if (hasAuth('task:task-list:edit')) buttons.push(editBtn());
          if (row.task_type === 2 && row.cond_setting.sched?.type !== 5 && hasAuth('task:task-list:exec')) {
            buttons.push(execBtn());
          }
          if (hasAuth('task:task-list:delete')) buttons.push(deleteBtn());

          return (
            <div class="flex-center gap-8px">
              {buttons.map((btn, index) => (
                <>
                  {index !== 0 && <NDivider vertical />}
                  {btn}
                </>
              ))}
            </div>
          );
        }
      }
    ]
  });

const taskExtra = computed<Api.Task.TaskListExtra>(() => {
  const raw = extraData.value as Partial<Api.Task.TaskListExtra> | null;

  return {
    device_map: raw?.device_map ?? {}
  };
});

function renderTaskType(type: Api.Task.TaskType) {
  const config = taskTypeMap.value[type];

  return config ? <NTag type={config.type}>{config.label}</NTag> : String(type);
}

function getDeviceName(deviceId?: CommonType.IdType) {
  if (!deviceId) return '-';

  return taskExtra.value.device_map[String(deviceId)]?.name ?? '-';
}

function getTargetDeviceNames(row: Api.Task.Task) {
  const actionDeviceIds =
    row.action_setting.actions?.flatMap(action =>
      (action.point_vals ?? [])
        .map(point => point.device?.id)
        .filter((deviceId): deviceId is CommonType.IdType => deviceId !== null && deviceId !== undefined)
    ) ?? [];
  const conditionDeviceIds =
    row.cond_setting.conds
      ?.map(condition => condition.device_source_id)
      .filter((deviceId): deviceId is CommonType.IdType => deviceId !== null && deviceId !== undefined) ?? [];
  const deviceIds = actionDeviceIds.length ? actionDeviceIds : conditionDeviceIds;
  const names = deviceIds.map(deviceId => getDeviceName(deviceId)).filter(item => item !== '-');
  const uniqueNames = Array.from(new Set(names));

  return uniqueNames.length ? uniqueNames.join('、') : '-';
}

function handleSearch() {
  getDataByPage(1);
}

function handleAdd() {
  operateType.value = 'add';
  operateRowData.value = null;
  operateDrawerVisible.value = true;
}

function handleEdit(row: Api.Task.Task) {
  operateType.value = 'edit';
  operateRowData.value = row;
  operateDrawerVisible.value = true;
}

async function handleExecuteTask(id: CommonType.IdType) {
  const { error } = await fetchExecuteTask({ id_list: [id] });
  if (error) return;

  window.$message?.success($t('taskList.executeSuccess'));
}

function handleView(row: Api.Task.Task) {
  detailRowData.value = row;
  detailDrawerVisible.value = true;
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteTask({ id_list: [id] });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = checkedRowKeys.value.filter(item => item !== id);
  await getData();
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return;

  const { error } = await fetchDeleteTask({ id_list: checkedRowKeys.value });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = [];
  await getData();
}
</script>

<template>
  <div :class="containerClass">
    <TaskListSearch v-model:model="searchParams" :bordered="embedded" @search="handleSearch" />

    <NCard :title="$t('taskList.title')" :bordered="embedded" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('task:task-list:add')"
          :show-delete="hasAuth('task:task-list:delete')"
          :show-export="false"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </template>
      <DataTable
        v-model:checked-row-keys="checkedRowKeys"
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
      <TaskOperateDrawer
        v-model:visible="operateDrawerVisible"
        :operate-type="operateType"
        :row-data="operateRowData"
        @submitted="getData"
      />
      <TaskViewDrawer v-model:visible="detailDrawerVisible" :row-data="detailRowData" />
    </NCard>
  </div>
</template>

<style scoped></style>
