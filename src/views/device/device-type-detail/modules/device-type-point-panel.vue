<script setup lang="tsx">
import { ref, shallowRef } from 'vue';
import { NDivider } from 'naive-ui';
import { formatDateTime } from '@sa/utils';
import { ImportBizType, ImportTemplatePath } from '@/enum/business';
import { fetchDeleteDeviceTypePoint, fetchGetDeviceTypePointList } from '@/service/api/device';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import DataImportModal from '@/components/custom/data-import-modal.vue';
import EnumTag from '@/components/custom/enum-tag.vue';
import DeviceTypePointOperateDrawer from './device-type-point-operate-drawer.vue';
import CopyableValue from '@/components/custom/copyable-value.vue';

defineOptions({
  name: 'DeviceTypePointPanel'
});

interface Props {
  deviceTypeId: CommonType.IdType;
}

const props = defineProps<Props>();

const appStore = useAppStore();
const { hasAuth } = useAuth();

const checkedRowKeys = ref<CommonType.IdType[]>([]);
const operateDrawerVisible = shallowRef(false);
const importPointVisible = shallowRef(false);
const operateType = shallowRef<NaiveUI.TableOperateType>('add');
const editingPointId = shallowRef<CommonType.IdType | null>(null);

const searchParams = ref<Api.Device.DeviceTypePointSearchParams>({
  pageNum: 1,
  pageSize: 10,
  name: null,
  key: null
});

function transformSearchParamsToRequest(params: Api.Device.DeviceTypePointSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs = [
    { type: 3, value: props.deviceTypeId },
    { type: 2, value: params.name },
    { type: 4, value: params.key }
  ];

  const options = filterConfigs
    .filter(item => item.value !== null && item.value !== undefined && item.value !== '')
    .map(({ type, value }) => ({ type, value: String(value) }));

  return {
    list_option: {
      offset: (pageNum - 1) * pageSize,
      limit: pageSize,
      options
    }
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetDeviceTypePointList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Device.DeviceTypePoint>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page;
      searchParams.value.pageSize = params.pageSize;
    },
    columns: (): NaiveUI.TableColumn<Api.Device.DeviceTypePoint>[] => [
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
        title: '点位名称',
        align: 'center',
        minWidth: 150,
        ellipsis: {
          tooltip: true
        },
        render: row => row.name || '-'
      },
      {
        key: 'key',
        title: '点位标识',
        align: 'center',
        minWidth: 150,
        ellipsis: {
          tooltip: true
        },
        render: row => <CopyableValue value={row.key} />
      },
      {
        key: 'data_type',
        title: '数据类型',
        align: 'center',
        minWidth: 120,
        render: row => <EnumTag value={row.data_type} />
      },
      {
        key: 'desc',
        title: '描述',
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        },
        render: row => row.desc || '-'
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
        width: 120,
        fixed: 'right',
        render: row => {
          const editBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => handleEdit(row.id)}
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
          if (hasAuth('device:device-type-point:edit')) buttons.push(editBtn());
          if (hasAuth('device:device-type-point:delete')) buttons.push(deleteBtn());

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

function handleSearch() {
  getDataByPage(1);
}

function handleResetSearch() {
  searchParams.value.name = null;
  searchParams.value.key = null;
  getDataByPage(1);
}

function handleAdd() {
  operateType.value = 'add';
  editingPointId.value = null;
  operateDrawerVisible.value = true;
}

function handleImportPoint() {
  importPointVisible.value = true;
}

function handleEdit(id: CommonType.IdType) {
  operateType.value = 'edit';
  editingPointId.value = id;
  operateDrawerVisible.value = true;
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteDeviceTypePoint({ id_list: [id] });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = checkedRowKeys.value.filter(item => item !== id);
  await getData();
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return;

  const { error } = await fetchDeleteDeviceTypePoint({ id_list: checkedRowKeys.value });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = [];
  await getData();
}
</script>

<template>
  <div class="h-full min-h-0 flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto">
    <NCard size="small" class="card-wrapper">
      <NCollapse>
        <NCollapseItem :title="$t('common.search')" name="device-type-point-search">
          <NForm label-placement="left" :label-width="80">
            <NGrid responsive="screen" item-responsive>
              <NFormItemGi span="24 s:12 m:8" label="点位名称" label-width="auto" class="pr-24px">
                <NInput
                  v-model:value="searchParams.name"
                  clearable
                  placeholder="请输入点位名称"
                  @keyup.enter="handleSearch"
                />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:8" label="点位标识" label-width="auto" class="pr-24px">
                <NInput
                  v-model:value="searchParams.key"
                  clearable
                  placeholder="请输入点位标识"
                  @keyup.enter="handleSearch"
                />
              </NFormItemGi>
              <NFormItemGi span="24 s:24 m:8" class="pr-24px">
                <NSpace class="w-full" justify="end">
                  <NButton type="primary" ghost @click="handleSearch">
                    <template #icon>
                      <icon-ic-round-search class="text-icon" />
                    </template>
                    {{ $t('common.search') }}
                  </NButton>
                  <NButton @click="handleResetSearch">
                    <template #icon>
                      <icon-ic-round-refresh class="text-icon" />
                    </template>
                    {{ $t('common.reset') }}
                  </NButton>
                </NSpace>
              </NFormItemGi>
            </NGrid>
          </NForm>
        </NCollapseItem>
      </NCollapse>
    </NCard>
    <NCard title="点位列表" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('device:device-type-point:add')"
          :show-delete="hasAuth('device:device-type-point:delete')"
          :show-export="false"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        >
          <template #after>
            <NButton v-if="hasAuth('device:device-type-point:import')" size="small" ghost @click="handleImportPoint">
              <template #icon>
                <SvgIcon icon="material-symbols:upload-rounded" class="text-icon" />
              </template>
              导入
            </NButton>
          </template>
        </TableHeaderOperation>
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
      <DeviceTypePointOperateDrawer
        v-model:visible="operateDrawerVisible"
        :device-type-id="props.deviceTypeId"
        :operate-type="operateType"
        :row-id="editingPointId"
        @submitted="getData"
      />
      <DataImportModal
        v-model:visible="importPointVisible"
        :biz-type="ImportBizType.DeviceTypePoint"
        :template-path="ImportTemplatePath.DeviceTypePoint"
        :template-file-name="`设备类型点位_${$t('common.importTemplate')}_${new Date().getTime()}.xlsx`"
        :meta="{ device_type_point: { device_type_id: Number(props.deviceTypeId) } }"
        task-name="设备类型点位"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
