<script setup lang="tsx">
import { computed, ref, shallowRef } from 'vue';
import { NDivider } from 'naive-ui';
import { StatusTag } from '@sa/materials';
import { formatDateTime } from '@sa/utils';
import { fetchDeleteDevice, fetchGetDeviceList } from '@/service/api/device';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import DeviceOperateDrawer from './modules/device-operate-drawer.vue';
import DeviceListSearch from './modules/device-list-search.vue';

defineOptions({
  name: 'DeviceList'
});

const appStore = useAppStore();

const checkedRowKeys = ref<CommonType.IdType[]>([]);
const operateDrawerVisible = shallowRef(false);

const searchParams = ref<Api.Device.DeviceSearchParams>({
  pageNum: 1,
  pageSize: 10,
  name: null,
  key: null,
  device_type_id: null,
  device_group_id: null
});

function transformSearchParamsToRequest(params: Api.Device.DeviceSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs = [
    { type: 104, value: '101' },
    { type: 1, value: params.name },
    { type: 3, value: params.key },
    { type: 5, value: params.device_type_id },
    { type: 6, value: params.device_group_id }
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
    options: [{ key: 1 }, { key: 2 }, { key: 3 }]
  };
}

const { columns, columnChecks, data, extraData, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetDeviceList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Device.Device>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page ?? 1;
      searchParams.value.pageSize = params.pageSize ?? 10;
    },
    columns: (): NaiveUI.TableColumn<Api.Device.Device>[] => [
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
        key: 'key',
        title: '设备标识',
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        },
        render: row => row.key || '-'
      },
      {
        key: 'device_type_id',
        title: '设备类型',
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        },
        render: row => getDeviceTypeName(row)
      },
      {
        key: 'device_group_id',
        title: '设备组',
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        },
        render: row => getDeviceGroupName(row)
      },
      {
        key: 'status',
        title: '状态',
        align: 'center',
        minWidth: 100,
        render: row => <StatusTag value={row.status} />
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
            <ButtonIcon text type="primary" icon="material-symbols:visibility-outline" tooltipContent="查看" onClick={handleDeveloping} />,
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

const deviceTypeMap = computed(() => {
  return (extraData.value?.device_type_map ?? {}) as Record<string, Api.Device.DeviceType>;
});

const deviceGroupMap = computed(() => {
  return (extraData.value?.device_group_map ?? {}) as Record<string, Api.Device.DeviceGroup>;
});

function getDeviceTypeName(row: Api.Device.Device) {
  return deviceTypeMap.value[String(row.device_type_id)]?.name ?? '-';
}

function getDeviceGroupId(row: Api.Device.Device) {
  return row.device_group_id ?? row.group_id ?? null;
}

function getDeviceGroupName(row: Api.Device.Device) {
  const groupId = getDeviceGroupId(row);

  if (groupId === null || groupId === undefined || groupId === '') return '-';

  return deviceGroupMap.value[String(groupId)]?.group_name ?? '-';
}

function handleDeveloping() {
  window.$message?.info('功能待开发');
}

function handleAdd() {
  operateDrawerVisible.value = true;
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteDevice({ id_list: [id] });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = checkedRowKeys.value.filter(item => item !== id);
  await getData();
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return;

  const { error } = await fetchDeleteDevice({ id_list: checkedRowKeys.value });
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
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <DeviceListSearch v-model:model="searchParams" @search="handleSearch" />
    <NCard title="设备列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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
      <DeviceOperateDrawer v-model:visible="operateDrawerVisible" @submitted="getDataByPage" />
    </NCard>
  </div>
</template>

<style scoped></style>
