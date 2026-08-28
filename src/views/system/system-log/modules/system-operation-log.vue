<script setup lang="ts">
import { ref } from 'vue';
import { formatDateTime } from '@sa/utils';
import { fetchGetSystemLogList } from '@/service/api/system';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import { operateModuleOptions, operateTypeOptions } from './system-operation-log.constants';
import SystemOperationLogSearch from './system-operation-log-search.vue';

defineOptions({
  name: 'SystemOperationLog'
});

const appStore = useAppStore();

const searchParams = ref<Api.System.SystemOperationLogSearchParams>(createDefaultSearchParams());

const { columns, data, getDataByPage, loading, mobilePagination, scrollX, extraData } = useNaivePaginatedTable({
  api: () => fetchGetSystemLogList(transformSearchParamsToRequest(searchParams.value)),
  transform: response => defaultTransform<Api.System.SystemOperationLog>(response),
  onPaginationParamsChange: params => {
    searchParams.value.pageNum = params.page;
    searchParams.value.pageSize = params.pageSize;
  },
  paginationProps: { pageSize: 50 },
  columns: (): NaiveUI.TableColumn<Api.System.SystemOperationLog>[] => [
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: (_, index) => index + 1
    },
    {
      key: 'created_at',
      title: '操作时间',
      align: 'center',
      minWidth: 180,
      render: row => formatDateTime(row.created_at)
    },
    {
      key: 'user_id',
      title: '操作人',
      align: 'center',
      minWidth: 140,
      ellipsis: {
        tooltip: true
      },
      render: row => getOperatorName(row.user_id)
    },
    {
      key: 'operate_type',
      title: '操作类型',
      align: 'center',
      minWidth: 120,
      render: row =>
        String(
          operateTypeOptions.find(item => String(item.value) === String(row.operate_type))?.label ??
            row.operate_type ??
            '-'
        )
    },
    {
      key: 'operate_module',
      title: '操作模块',
      align: 'center',
      minWidth: 120,
      render: row =>
        String(
          operateModuleOptions.find(item => String(item.value) === String(row.operate_module))?.label ??
            row.operate_module ??
            '-'
        )
    },
    {
      key: 'ip',
      title: 'IP',
      align: 'center',
      minWidth: 140,
      ellipsis: {
        tooltip: true
      },
      render: row => row.ip || '-'
    },
    {
      key: 'desc',
      title: '操作详情',
      align: 'center',
      minWidth: 200,
      ellipsis: {
        tooltip: true
      },
      render: row => row.desc || '-'
    }
  ]
});

function createDefaultSearchParams(): Api.System.SystemOperationLogSearchParams {
  return {
    pageNum: 1,
    pageSize: 50,
    user_id: null,
    operate_type: null,
    operate_module: null,
    ip: null,
    dateRange: null
  };
}

function normalizeDateRange(value?: [number, number] | null) {
  if (!Array.isArray(value) || value.length !== 2) return null;

  const start = Number(value[0]);
  const end = Number(value[1]);

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;

  return `${Math.floor(start / 1000)},${Math.floor(end / 1000)}`;
}

function transformSearchParamsToRequest(
  params: Api.System.SystemOperationLogSearchParams
): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 50;
  const filterConfigs = [
    { type: 104, value: '101' },
    { type: 1, value: params.user_id },
    { type: 2, value: params.operate_type },
    { type: 3, value: params.operate_module },
    { type: 4, value: params.ip },
    { type: 5, value: normalizeDateRange(params.dateRange) }
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
    options: [{ key: 1 }]
  };
}

function getOperatorName(userId?: CommonType.IdType) {
  if (!userId) return '-';

  const raw = extraData.value as Api.System.OperationLogListExtra | null;

  return raw?.base_user_map?.[String(userId)]?.username ?? String(userId);
}
</script>

<template>
  <div class="system-log-content flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <SystemOperationLogSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard title="系统日志" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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
