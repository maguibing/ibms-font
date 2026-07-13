<script setup lang="tsx">
import { computed, ref, shallowRef } from 'vue';
import { NDivider } from 'naive-ui';
import { StatusTag } from '@sa/materials';
import { formatDateTime } from '@sa/utils';
import { fetchDeleteDevice, fetchGetDeviceList } from '@/service/api/device';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import DeviceOperateDrawer from './device-operate-drawer.vue';
import DeviceListSearch from './device-list-search.vue';

defineOptions({
  name: 'DeviceListPanel'
});

interface Props {
  fixedDeviceTypeId?: CommonType.IdType | null;
  fixedDeviceType?: Api.Device.DeviceType | null;
  embedded?: boolean;
  searchCollapsible?: boolean;
  showDeviceTypeSearch?: boolean;
  showDeviceGroupSearch?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  fixedDeviceTypeId: null,
  fixedDeviceType: null,
  embedded: false,
  searchCollapsible: true,
  showDeviceTypeSearch: true,
  showDeviceGroupSearch: true
});

const appStore = useAppStore();
const { routerPushByKey } = useRouterPush();

const checkedRowKeys = ref<CommonType.IdType[]>([]);
const operateDrawerVisible = shallowRef(false);
const operateType = shallowRef<NaiveUI.TableOperateType>('add');
const operateRowId = shallowRef<CommonType.IdType | null>(null);
const operateDeviceType = shallowRef<Api.Device.DeviceType | null>(null);

const fixedDeviceTypeId = computed(() => props.fixedDeviceType?.id ?? props.fixedDeviceTypeId ?? null);

const pageClass = computed(() =>
  props.embedded
    ? 'h-full min-h-0 flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto'
    : 'min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto'
);

const showDeviceTypeSearch = computed(() => props.showDeviceTypeSearch && fixedDeviceTypeId.value === null);

const searchParams = ref<Api.Device.DeviceSearchParams>({
  pageNum: 1,
  pageSize: 10,
  name: null,
  key: null,
  device_type_id: fixedDeviceTypeId.value,
  device_group_id: null
});

function transformSearchParamsToRequest(params: Api.Device.DeviceSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs = [
    { type: 104, value: '101' },
    { type: 1, value: params.name },
    { type: 3, value: params.key },
    { type: 5, value: fixedDeviceTypeId.value ?? params.device_type_id },
    { type: 6, value: props.showDeviceGroupSearch ? params.device_group_id : null }
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

const deviceTypeMap = computed(() => {
  return (extraData.value?.device_type_map ?? {}) as Record<string, Api.Device.DeviceType>;
});

const deviceGroupMap = computed(() => {
  return (extraData.value?.device_group_map ?? {}) as Record<string, Api.Device.DeviceGroupMapItem>;
});

function getDeviceTypeName(row: Api.Device.Device) {
  return deviceTypeMap.value[String(row.device_type_id)]?.name ?? '-';
}

function getDeviceGroupId(row: Api.Device.Device) {
  return row.device_group_id ?? null;
}

function getDeviceGroupName(row: Api.Device.Device) {
  const groupId = getDeviceGroupId(row);

  if (!groupId) return '-';

  const deviceGroup = deviceGroupMap.value[String(groupId)];

  return deviceGroup?.name ?? '-';
}

function handleView(id: CommonType.IdType) {
  routerPushByKey('device_device-detail', {
    query: {
      id: String(id)
    }
  });
}

function handleAdd() {
  operateType.value = 'add';
  operateRowId.value = null;
  operateDeviceType.value = props.fixedDeviceType ?? null;
  operateDrawerVisible.value = true;
}

function handleEdit(row: Api.Device.Device) {
  operateType.value = 'edit';
  operateRowId.value = row.id;
  operateDeviceType.value = deviceTypeMap.value[String(row.device_type_id)] ?? props.fixedDeviceType ?? null;
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
  <div :class="pageClass">
    <DeviceListSearch
      v-model:model="searchParams"
      :collapsible="props.searchCollapsible"
      :show-device-type="showDeviceTypeSearch"
      :show-device-group="props.showDeviceGroupSearch"
      @search="handleSearch"
    />
    <NCard title="设备列表" size="small" class="card-wrapper sm:flex-1-hidden">
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
      <DeviceOperateDrawer
        v-model:visible="operateDrawerVisible"
        :operate-type="operateType"
        :row-id="operateRowId"
        :default-device-type-id="fixedDeviceTypeId"
        :default-device-type="operateDeviceType"
        :lock-device-type="fixedDeviceTypeId !== null"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
