<script setup lang="ts">
import { h, ref } from 'vue';
import { NImage, NTag } from 'naive-ui';
import { formatDateTime } from '@sa/utils';
import { fetchGetSysScreenList } from '@/service/api/sys-screen';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import SysScreenSearch from './modules/sys-screen-search.vue';
import { useAuth } from '@/hooks/business/auth';
defineOptions({
  name: 'SysScreenList'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();
const searchParams = ref<Api.System.SysScreenSearchParams>({
  pageNum: 1,
  pageSize: 10,
  name: null,
  industry_type: null
});

function transformSearchParamsToRequest(params: Api.System.SysScreenSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs = [
    { type: 3, value: params.name },
    { type: 2, value: params.industry_type }
  ];

  const options = filterConfigs
    .filter((item): item is { type: number; value: string } => Boolean(item.value))
    .map(({ type, value }) => ({ type, value }));

  return {
    list_option: {
      options,
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    },
    options: [{ key: 1 }, { key: 2 }, { key: 3 }]
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetSysScreenList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.System.SysScreen>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page;
      searchParams.value.pageSize = params.pageSize;
    },
    columns: () => [
      {
        key: 'index',
        title: $t('common.index'),
        align: 'center',
        width: 64,
        render: (_, index) => index + 1
      },
      {
        key: 'name',
        title: '大屏名称',
        align: 'center',
        minWidth: 140
      },
      {
        key: 'url',
        title: '大屏封面',
        align: 'center',
        minWidth: 240,
        render: row => {
          if (!row.url) {
            return '-';
          }

          return h(NImage, {
            src: row.url,
            width: 100,
            height: 56,
            objectFit: 'cover'
          });
        }
      },
      {
        key: 'status',
        title: '状态',
        align: 'center',
        minWidth: 140,
        render: row => {
          const status = Number(row.status);

          if (status === 1) {
            return h(NTag, { type: 'success' }, { default: () => '启用' });
          }

          if (status === 2) {
            return h(NTag, { type: 'error' }, { default: () => '停用' });
          }

          return '-';
        }
      },
      {
        key: 'created_at',
        title: '创建时间',
        align: 'center',
        minWidth: 180,
        render: row => formatDateTime(row.created_at)
      }
    ]
  });
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <SysScreenSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard title="大屏管理" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
          :show-add="hasAuth('sys:screen:add')"
          :show-delete="hasAuth('sys:screen:remove')"
          :show-export="hasAuth('sys:screen:export')"
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
    </NCard>
  </div>
</template>

<style scoped></style>
