<script setup lang="tsx">
import { ref } from 'vue';
import { NDivider } from 'naive-ui';
import { StatusTag } from '@sa/materials';
import { formatDateTime } from '@sa/utils';
import { fetchDeleteGateway, fetchGetGatewayList } from '@/service/api/gateway';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import GatewayOperateDrawer from './modules/gateway-operate-drawer.vue';
import GatewaySearch from './modules/gateway-search.vue';
import {
  GATEWAY_LINK_STATUS_MAP,
  GATEWAY_UNKNOWN_STATUS,
  getGatewayProtocolLabel
} from './shared';

defineOptions({
  name: 'GatewayList'
});

const appStore = useAppStore();

const checkedRowKeys = ref<CommonType.IdType[]>([]);
const drawerVisible = ref(false);
const searchParams = ref<Api.Gateway.GatewaySearchParams>({
  pageNum: 1,
  pageSize: 10,
  name: null,
  protocol_type: null
});

function transformSearchParamsToRequest(params: Api.Gateway.GatewaySearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 12;
  const options: CommonType.CommonTypeOptions[] = [{ type: 104, value: '101' }];

  if (params.name) {
    options.push({ type: 1, value: params.name });
  }

  if (params.protocol_type) {
    options.push({ type: 7, value: String(params.protocol_type) });
  }

  return {
    list_option: {
      options,
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    },
    options: [{ key: 1 }]
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetGatewayList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Gateway.Gateway>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page ?? 1;
      searchParams.value.pageSize = params.pageSize ?? 10;
    },
    columns: (): NaiveUI.TableColumn<Api.Gateway.Gateway>[] => [
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
        title: '边缘设备名称',
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'key',
        title: '设备Key',
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'protocol_type',
        title: '协议类型',
        align: 'center',
        minWidth: 120,
        render: row => getGatewayProtocolLabel(row.protocol_type)
      },
      {
        key: 'status',
        title: '状态',
        align: 'center',
        minWidth: 100,
        render: row => <StatusTag value={row.status} unknown={GATEWAY_UNKNOWN_STATUS} />
      },
      {
        key: 'link_status',
        title: '在线状态',
        align: 'center',
        minWidth: 100,
        render: row => (
          <StatusTag value={row.link_status} statusMap={GATEWAY_LINK_STATUS_MAP} unknown={GATEWAY_UNKNOWN_STATUS} />
        )
      },
      {
        key: 'updated_at',
        title: '更新时间',
        align: 'center',
        minWidth: 180,
        render: row => (row.updated_at ? formatDateTime(row.updated_at) : '-')
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 180,
        fixed: 'right',
        render: row => {
          const buttons = [
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:visibility-outline"
              tooltipContent="查看"
            />,
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={handleDeveloping}
            />,
            <ButtonIcon
              text
              type="error"
              icon="material-symbols:delete-outline"
              tooltipContent={$t('common.delete')}
              popconfirmContent={$t('common.confirmDelete')}
              onPositiveClick={() => handleDelete(row.id)}
            />
          ];

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

function handleDeveloping() {
  window.$message?.info('功能待开发');
}

function handleAdd() {
  drawerVisible.value = true;
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteGateway({ id_list: [id] });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = checkedRowKeys.value.filter(item => item !== id);
  await getData();
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return;

  const { error } = await fetchDeleteGateway({ id_list: checkedRowKeys.value });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = [];
  await getData();
}

function handleSearch() {
  getDataByPage(1);
}
</script>

<template>
  <div class="h-full flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto">
    <GatewaySearch v-model:model="searchParams" @search="handleSearch" />
    <NCard title="边缘设备列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="true"
          :show-delete="true"
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
      <GatewayOperateDrawer v-model:visible="drawerVisible" @submitted="getDataByPage" />
    </NCard>
  </div>
</template>

<style scoped></style>
