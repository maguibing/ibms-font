<script setup lang="tsx">
import { h, ref, shallowRef } from 'vue';
import { NDivider, NImage } from 'naive-ui';
import { StatusTag } from '@sa/materials';
import { formatDateTime } from '@sa/utils';
import { fetchDeleteDeviceType, fetchGetDeviceTypeList } from '@/service/api/device';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import DeviceTypeOperateDrawer from './modules/device-type-operate-drawer.vue';
import DeviceTypeSearch from './modules/device-type-search.vue';
import CopyableValue from '@/components/custom/copyable-value.vue';

defineOptions({
  name: 'DeviceType'
});

const appStore = useAppStore();
const { routerPushByKey } = useRouterPush();
const operateDrawerVisible = shallowRef(false);
const operateType = shallowRef<NaiveUI.TableOperateType>('add');
const operateRowId = shallowRef<CommonType.IdType | null>(null);

const searchParams = ref<Api.Device.DeviceTypeSearchParams>({
  pageNum: 1,
  pageSize: 10,
  name: null,
  key: null
});

function transformSearchParamsToRequest(params: Api.Device.DeviceTypeSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs = [
    { type: 104, value: '101' },
    { type: 1, value: params.name },
    { type: 4, value: params.key }
  ];

  const options = filterConfigs
    .filter(item => item.value !== null && item.value !== undefined && item.value !== '')
    .map(({ type, value }) => ({ type, value: String(value) }));

  return {
    list_option: {
      options,
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    }
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetDeviceTypeList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Device.DeviceType>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page ?? 1;
      searchParams.value.pageSize = params.pageSize ?? 10;
    },
    columns: (): NaiveUI.TableColumn<Api.Device.DeviceType>[] => [
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
        title: '设备类型名称',
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'key',
        title: '设备类型标识',
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        },
        render: row => h(CopyableValue, { value: row.key })
      },
      {
        key: 'icon',
        title: '图标',
        align: 'center',
        minWidth: 120,
        render: row => (row.icon ? <NImage src={row.icon} width={40} height={40} objectFit="contain" /> : '-')
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
        render: row => {
          const buttons = [
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:visibility-outline"
              tooltipContent="查看"
              onClick={() => handleView(row.id)}
            />,
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => handleEdit(row)}
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

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);

function handleView(id: CommonType.IdType) {
  routerPushByKey('device_device-type-detail', {
    query: {
      id: String(id)
    }
  });
}

function handleAdd() {
  operateType.value = 'add';
  operateRowId.value = null;
  operateDrawerVisible.value = true;
}

function handleEdit(row: Api.Device.DeviceType) {
  operateType.value = 'edit';
  operateRowId.value = row.id;
  operateDrawerVisible.value = true;
}

async function handleBatchDelete() {
  const { error } = await fetchDeleteDeviceType({ id_list: checkedRowKeys.value });
  if (error) return;

  onBatchDeleted();
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteDeviceType({ id_list: [id] });
  if (error) return;

  onDeleted();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <DeviceTypeSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard title="设备类型管理" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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
      <DeviceTypeOperateDrawer
        v-model:visible="operateDrawerVisible"
        :operate-type="operateType"
        :row-id="operateRowId"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
