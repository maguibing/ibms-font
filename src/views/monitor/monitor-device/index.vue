<script setup lang="tsx">
import { ref, shallowRef } from 'vue';
import { NDivider, NTag } from 'naive-ui';
import { formatDateTime } from '@sa/utils';
import StatusTag from '@/components/custom/status-tag.vue';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { fetchDeleteMonitor, fetchGetMonitorList } from '@/service/api/monitor';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import MonitorChannelView from './modules/monitor-channel-view.vue';
import MonitorDeviceOperateDrawer from './modules/monitor-device-operate-drawer.vue';
import MonitorDeviceSearch from './modules/monitor-device-search.vue';

defineOptions({
  name: 'MonitorDeviceList'
});

const MONITOR_ACCESS_TYPE_OPTIONS: CommonType.Option<Api.Monitor.MonitorAccessType, string>[] = [
  { label: '本地源流拉流', value: 1 },
  { label: '云平台接入', value: 2 }
];

const appStore = useAppStore();
const { hasAuth } = useAuth();

const searchParams = ref<Api.Monitor.MonitorSearchParams>(createDefaultMonitorSearchParams());
const showChannelView = shallowRef(false);
const monitorChannelId = shallowRef<CommonType.IdType>(13);

function createDefaultMonitorSearchParams(): Api.Monitor.MonitorSearchParams {
  return {
    pageNum: 1,
    pageSize: 15,
    name: null,
    access_type: null,
    status: null
  };
}

function getMonitorAccessTypeLabel(value: Api.Monitor.MonitorAccessType | null | undefined) {
  return MONITOR_ACCESS_TYPE_OPTIONS.find(item => item.value === value)?.label || '-';
}

function transformSearchParamsToRequest(params: Api.Monitor.MonitorSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 15;
  const filterConfigs = [
    { type: 1, value: params.name },
    { type: 3, value: params.access_type },
    { type: 4, value: params.status }
  ];

  const options = filterConfigs
    .filter(item => item.value !== null && item.value !== undefined && item.value !== '')
    .map(({ type, value }) => ({ type, value: String(value) }));

  return {
    list_option: {
      limit: pageSize,
      offset: (pageNum - 1) * pageSize,
      options
    },
    options: [{ key: 1 }]
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetMonitorList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Monitor.Monitor>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page ?? 1;
      searchParams.value.pageSize = params.pageSize ?? 15;
    },
    columns: (): NaiveUI.TableColumn<Api.Monitor.Monitor>[] => [
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
        title: '设备名称',
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'access_type',
        title: '接入类型',
        align: 'center',
        minWidth: 140,
        render: row => <NTag type="info">{getMonitorAccessTypeLabel(row.access_type)}</NTag>
      },
      {
        key: 'status',
        title: '状态',
        align: 'center',
        minWidth: 100,
        render: row => <StatusTag value={row.status} />
      },
      {
        key: 'created_at',
        title: '创建时间',
        align: 'center',
        minWidth: 180,
        render: row => (row.created_at ? formatDateTime(row.created_at) : '-')
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 180,
        fixed: 'right',
        render: row => {
          const viewBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:videocam-outline-rounded"
              tooltipContent="通道"
              onClick={() => openChannelView()}
            />
          );

          const editBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => edit(row.id)}
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
          if (hasAuth('monitor:monitor-device:view')) buttons.push(viewBtn());
          if (hasAuth('monitor:monitor-device:edit')) buttons.push(editBtn());
          if (hasAuth('monitor:monitor-device:delete')) buttons.push(deleteBtn());

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

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'id', getData);

function handleSearch() {
  getDataByPage(1);
}

async function handleBatchDelete() {
  const { error } = await fetchDeleteMonitor({ id_list: checkedRowKeys.value });
  if (error) return;

  onBatchDeleted();
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteMonitor({ id_list: [id] });
  if (error) return;

  onDeleted();
}

function edit(id: CommonType.IdType) {
  handleEdit(id);
}

function openChannelView() {
  monitorChannelId.value = 13;
  showChannelView.value = true;
}

function handleBackMonitorList() {
  showChannelView.value = false;
}
</script>

<template>
  <MonitorChannelView v-if="showChannelView" :monitor-id="monitorChannelId" @back="handleBackMonitorList" />
  <div v-else class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <MonitorDeviceSearch v-model:model="searchParams" @search="handleSearch" />

    <NCard title="监控设备列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('monitor:monitor-device:add')"
          :show-delete="hasAuth('monitor:monitor-device:delete')"
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
      <MonitorDeviceOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-id="editingData?.id ?? null"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
