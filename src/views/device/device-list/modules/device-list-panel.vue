<script setup lang="tsx">
import { computed, h, ref, shallowRef } from 'vue';
import { NDivider } from 'naive-ui';
import StatusTag from '@/components/custom/status-tag.vue';
import { formatDateTime } from '@sa/utils';
import { fetchDeleteDevice, fetchGetDeviceList } from '@/service/api/device';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import DataGrid from '@/components/common/data-grid.vue';
import TableCardViewSwitch from '@/components/common/table-card-view-switch.vue';
import DeviceOperateDrawer from './device-operate-drawer.vue';
import DeviceListSearch from './device-list-search.vue';
import DeviceCard from './device-card.vue';
import CopyableValue from '@/components/custom/copyable-value.vue';

defineOptions({
  name: 'DeviceListPanel'
});

interface Props {
  fixedDeviceTypeId?: CommonType.IdType | null;
  fixedDeviceType?: Api.Device.DeviceType | null;
  embedded?: boolean;
  showDeviceTypeSearch?: boolean;
  showDeviceGroupSearch?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  fixedDeviceTypeId: null,
  fixedDeviceType: null,
  embedded: false,
  showDeviceTypeSearch: true,
  showDeviceGroupSearch: true
});

const appStore = useAppStore();
const { hasAuth } = useAuth();
const { routerPushByKey } = useRouterPush();

const checkedRowKeys = ref<CommonType.IdType[]>([]);
const viewMode = shallowRef<'table' | 'card'>('card');
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
  pageSize: 15,
  name: null,
  key: null,
  device_type_id: fixedDeviceTypeId.value,
  device_group_id: null
});

function transformSearchParamsToRequest(params: Api.Device.DeviceSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 15;
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

const { columns, columnChecks, data, extraData, getData, getDataByPage, loading, mobilePagination, pagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetDeviceList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Device.Device>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page ?? 1;
      searchParams.value.pageSize = params.pageSize ?? 15;
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
        title: $t('deviceList.name'),
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'key',
        title: $t('deviceList.identifier'),
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        },
        render: row => h(CopyableValue, { value: row.key })
      },
      {
        key: 'device_type_id',
        title: $t('deviceList.type'),
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        },
        render: row => getDeviceTypeName(row)
      },
      {
        key: 'device_group_id',
        title: $t('deviceList.group'),
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        },
        render: row => getDeviceGroupName(row)
      },
      {
        key: 'status',
        title: $t('deviceList.status'),
        align: 'center',
        minWidth: 100,
        render: row => <StatusTag value={row.status} />
      },
      {
        key: 'updated_at',
        title: $t('deviceList.updatedAt'),
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
          const viewBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:visibility-outline"
              tooltipContent={$t('deviceList.view')}
              onClick={() => handleView(row.id)}
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
          if (hasAuth('device:device-list:view')) buttons.push(viewBtn());
          if (hasAuth('device:device-list:edit')) buttons.push(editBtn());
          if (hasAuth('device:device-list:delete')) buttons.push(deleteBtn());

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
      :show-device-type="showDeviceTypeSearch"
      :show-device-group="props.showDeviceGroupSearch"
      @search="handleSearch"
    />
    <NCard
      :title="$t('deviceList.list')"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
      content-class="min-h-0 flex-col-stretch overflow-hidden"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('device:device-list:add')"
          :show-delete="hasAuth('device:device-list:delete')"
          :show-export="false"
          :show-column-setting="viewMode === 'table'"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        >
          <template #prefix>
            <TableCardViewSwitch
              v-model="viewMode"
              v-model:page="pagination.page"
              v-model:page-size="pagination.pageSize"
            />
          </template>
        </TableHeaderOperation>
      </template>
      <DataTable
        v-if="viewMode === 'table'"
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
      <DataGrid
        v-else
        v-model:checked-row-keys="checkedRowKeys"
        :data="data"
        :loading="loading"
        :pagination="mobilePagination"
        :row-key="row => row.id"
        selectable
        :empty-description="$t('deviceList.noData')"
        class="min-h-0 flex-1 overflow-hidden sm:h-full"
      >
        <template #default="{ item, checked, toggleChecked }">
          <DeviceCard
            :device="item"
            :device-type-name="getDeviceTypeName(item)"
            :checked="checked"
            :show-view="hasAuth('device:device-list:view')"
            :show-edit="hasAuth('device:device-list:edit')"
            :show-delete="hasAuth('device:device-list:delete')"
            @update:checked="toggleChecked"
            @view="handleView(item.id)"
            @edit="handleEdit(item)"
            @delete="handleDelete(item.id)"
          />
        </template>
      </DataGrid>
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
