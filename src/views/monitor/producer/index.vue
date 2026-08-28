<script setup lang="tsx">
import { h, ref } from 'vue';
import StatusTag from '@/components/custom/status-tag.vue';
import { formatDateTime } from '@sa/utils';
import { NDivider, NTag } from 'naive-ui';
import { fetchDeleteProvider, fetchGetProviderList } from '@/service/api/monitor';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import ProviderOperateDrawer from './modules/provider-operate-drawer.vue';
import ProviderSearch from './modules/provider-search.vue';
import { getProviderTypeLabel } from './shared';
import CopyableValue from '@/components/custom/copyable-value.vue';
defineOptions({
  name: 'MonitorProducer'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();

const searchParams = ref<Api.Monitor.ProviderSearchParams>(createDefaultSearchParams());

function createDefaultSearchParams(): Api.Monitor.ProviderSearchParams {
  return {
    pageNum: 1,
    pageSize: 15,
    name: null,
    provider_type: null,
    status: null
  };
}

function transformSearchParamsToRequest(params: Api.Monitor.ProviderSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 15;
  const filterConfigs = [
    { type: 1, value: params.name },
    { type: 3, value: params.provider_type },
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
    }
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetProviderList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Monitor.Provider>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page;
      searchParams.value.pageSize = params.pageSize;
    },
    columns: () => [
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
        title: '厂商名称',
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'provider_type',
        title: '厂商类型',
        align: 'center',
        minWidth: 120,
        render: row => <NTag type="info">{getProviderTypeLabel(row.provider_type)}</NTag>
      },
      {
        key: 'status',
        title: '状态',
        align: 'center',
        minWidth: 100,
        render: row => <StatusTag value={row.status} />
      },
      {
        key: 'api_host',
        title: '接口地址',
        align: 'center',
        minWidth: 180,
        ellipsis: {
          tooltip: true
        },
        render: row => h(CopyableValue, { value: row.setting?.cloud?.api_host })
      },
      {
        key: 'app_key',
        title: 'AppKey',
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        },
        render: row => h(CopyableValue, { value: row.setting?.cloud?.app_key })
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
        width: 130,
        render: row => {
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
          if (hasAuth('monitor:producer:edit')) buttons.push(editBtn());
          if (hasAuth('monitor:producer:delete')) buttons.push(deleteBtn());

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

async function handleBatchDelete() {
  const { error } = await fetchDeleteProvider({ id_list: checkedRowKeys.value });
  if (error) return;

  onBatchDeleted();
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteProvider({ id_list: [id] });
  if (error) return;

  onDeleted();
}

function edit(id: CommonType.IdType) {
  handleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ProviderSearch v-model:model="searchParams" @search="getDataByPage" />

    <NCard title="视频厂商管理" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('monitor:producer:add')"
          :show-delete="hasAuth('monitor:producer:delete')"
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
      <ProviderOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
