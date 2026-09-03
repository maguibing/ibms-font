<script setup lang="ts">
import { ref } from 'vue';
import { formatDateTime } from '@sa/utils';
import { fetchGetDeviceOperationLogList } from '@/service/api/system';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import DeviceOperationLogSearch from './device-operation-log-search.vue';

defineOptions({
  name: 'DeviceOperationLog'
});

const appStore = useAppStore();

const searchParams = ref<Api.System.DeviceOperationLogSearchParams>(createDefaultSearchParams());

const { columns, data, getDataByPage, loading, mobilePagination, scrollX, extraData } = useNaivePaginatedTable({
  api: () => fetchGetDeviceOperationLogList(transformSearchParamsToRequest(searchParams.value)),
  transform: response => defaultTransform<Api.System.DeviceOperationLog>(response),
  onPaginationParamsChange: params => {
    searchParams.value.pageNum = params.page;
    searchParams.value.pageSize = params.pageSize;
  },
  paginationProps: { pageSize: 50 },
  columns: (): NaiveUI.TableColumn<Api.System.DeviceOperationLog>[] => [
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: (_, index) => index + 1
    },
    {
      key: 'created_at',
      title: $t('systemLog.fields.time'),
      align: 'center',
      minWidth: 180,
      render: row => formatDateTime(row.created_at)
    },
    {
      key: 'operator_id',
      title: $t('systemLog.fields.operator'),
      align: 'center',
      minWidth: 140,
      ellipsis: {
        tooltip: true
      },
      render: row => getOperatorName(row.operator_id)
    },
    {
      key: 'point',
      title: $t('systemLog.fields.point'),
      align: 'center',
      minWidth: 140,
      ellipsis: {
        tooltip: true
      },
      render: row => getPointName(row)
    },
    {
      key: 'is_success',
      title: $t('systemLog.fields.executeResult'),
      align: 'center',
      minWidth: 120,
      render: row => getExecuteResult(row)
    },
    {
      key: 'fail_reason',
      title: $t('systemLog.fields.failReason'),
      align: 'center',
      minWidth: 160,
      ellipsis: {
        tooltip: true
      },
      render: row => getFailReason(row)
    }
  ]
});

function createDefaultSearchParams(): Api.System.DeviceOperationLogSearchParams {
  return {
    pageNum: 1,
    pageSize: 50,
    device_id: null,
    physical_point_id: null,
    operator_id: null,
    dateRange: null
  };
}

function normalizeDateRange(value?: [number, number] | null) {
  if (!Array.isArray(value) || value.length !== 2) return null;

  const start = Number(value[0]);
  const end = Number(value[1]);

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;

  return `${start},${end}`;
}

function transformSearchParamsToRequest(
  params: Api.System.DeviceOperationLogSearchParams
): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 50;
  const filterConfigs = [
    { type: 104, value: '101' },
    { type: 1, value: params.device_id },
    { type: 2, value: params.physical_point_id },
    { type: 3, value: params.operator_id },
    { type: 103, value: normalizeDateRange(params.dateRange) }
  ];

  const options = filterConfigs
    .filter(item => item.value !== null && item.value !== undefined && item.value !== '')
    .map(({ type, value }) => ({ type, value: String(value) }));

  return {
    list_option: {
      options,
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    },
    options: [{ key: 1 }, { key: 2 }, { key: 3 }]
  };
}

function getOperatorName(operatorId?: CommonType.IdType) {
  if (operatorId === undefined || operatorId === null || operatorId === '') return $t('systemLog.defaultOperator');

  const raw = extraData.value as Api.System.OperationLogListExtra | null;

  return raw?.base_user_map?.[String(operatorId)]?.username ?? String(operatorId);
}

function getPointName(row: Api.System.DeviceOperationLog) {
  return (
    row.point_val?.physical_point?.name ??
    row.point_val?.device_type_point?.name ??
    row.point_val?.logic_point?.name ??
    '-'
  );
}

function getExecuteResult(row: Api.System.DeviceOperationLog) {
  if (row.is_success === true) return $t('systemLog.result.success');
  return $t('systemLog.result.failure');
}

function getFailReason(row: Api.System.DeviceOperationLog) {
  return row.failure_reason || row.fail_reason || row.reason || '-';
}
</script>

<template>
  <div class="system-log-content flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <DeviceOperationLogSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard :title="$t('systemLog.deviceTitle')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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
    </NCard>
  </div>
</template>

<style scoped>
.system-log-content {
  min-height: var(--system-log-min-height, 500px);
}
</style>
