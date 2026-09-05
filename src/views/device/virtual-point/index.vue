<script setup lang="tsx">
import { computed, h, ref, shallowRef } from 'vue';
import { NDivider, NTag } from 'naive-ui';
import StatusTag from '@/components/custom/status-tag.vue';
import { $t } from '@/locales';
import {
  fetchDeleteVirtualPoint,
  fetchGetVirtualPointList
} from '@/service/api/device';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { useAuth } from '@/hooks/business/auth';
import ButtonIcon from '@/components/custom/button-icon.vue';
import EnumTag from '@/components/custom/enum-tag.vue';
import VirtualPointHistoryModal from './modules/virtual-point-history-modal.vue';
import VirtualPointOperateDrawer from './modules/virtual-point-operate-drawer.vue';
import {
  buildVirtualPointListParams,
  virtualPointComputeModeMap
} from './virtual-point';
import CopyableValue from '@/components/custom/copyable-value.vue';
defineOptions({ name: 'DeviceVirtualPoint' });

const appStore = useAppStore();
const { hasAuth } = useAuth();

// The operate drawer only keeps the mode and row ID. Details are loaded when the drawer opens.
const operateDrawerVisible = shallowRef(false);
const operateType = shallowRef<NaiveUI.TableOperateType>('add');
const operateRowId = shallowRef<CommonType.IdType | null>(null);
const historyModalVisible = shallowRef(false);
const historyRow = shallowRef<Api.Device.VirtualPoint | null>(null);
const paginationParams = ref({ page: 1, pageSize: 15 });

// The list API uses offset + limit and also returns logic/physical point maps for rendering.
const {
  columns,
  columnChecks,
  data,
  extraData,
  getData,
  getDataByPage,
  loading,
  mobilePagination,
  scrollX
} = useNaivePaginatedTable({
  api: () => fetchGetVirtualPointList(buildVirtualPointListParams(paginationParams.value.page, paginationParams.value.pageSize)),
  transform: response => defaultTransform<Api.Device.VirtualPoint>(response),
  onPaginationParamsChange: params => {
    paginationParams.value.page = params.page ?? 1;
    paginationParams.value.pageSize = params.pageSize ?? 15;
  },
  columns: (): NaiveUI.TableColumn<Api.Device.VirtualPoint>[] => [
    { type: 'selection', align: 'center', width: 48 },
    {
      key: 'name',
      title: $t('virtualPoint.table.name'),
      align: 'center',
      ellipsis: { tooltip: true },
      render: row => getLogicPoint(row)?.name ?? '-'
    },
    {
      key: 'key',
      title: $t('virtualPoint.table.key'),
      align: 'center',
      ellipsis: { tooltip: true },
      render: row =>  h(CopyableValue, { value: getLogicPoint(row)?.key })
    },
    {
      key: 'compute_mode',
      title: $t('virtualPoint.table.computeMode'),
      align: 'center',
      render: row => <NTag type="info">{virtualPointComputeModeMap.value[row.compute_mode ?? 0] ?? '-'}</NTag>
    },
    {
      key: 'data_type',
      title: $t('virtualPoint.table.dataType'),
      align: 'center',
      render: row => h(EnumTag, { value: row.setting?.point?.data_type })
    },
    {
      key: 'status',
      title: $t('virtualPoint.table.status'),
      align: 'center',
      render: row => <StatusTag value={row.status} />
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 190,
      render: row => renderOperate(row)
    }
  ]
});

const virtualPointExtra = computed<Api.Device.VirtualPointListExtra>(() =>
  (extraData.value ?? {}) as Api.Device.VirtualPointListExtra
);
const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);
const historyLogicPoint = computed(() => (historyRow.value ? getLogicPoint(historyRow.value) : undefined));
const historyPhysicalPoint = computed(() => (historyRow.value ? getPhysicalPoint(historyRow.value) : undefined));

/** Read the logic point for a virtual point from the extra list map. */
function getLogicPoint(row: Api.Device.VirtualPoint) {
  return virtualPointExtra.value.logic_point_map?.[String(row.logic_point_id ?? '')];
}

/** Read the physical point for a virtual point from the extra list map. */
function getPhysicalPoint(row: Api.Device.VirtualPoint) {
  return virtualPointExtra.value.physical_point_map?.[String(row.physical_point_id ?? '')];
}

/** Open the create drawer. */
function handleAdd() {
  operateType.value = 'add';
  operateRowId.value = null;
  operateDrawerVisible.value = true;
}

/** Open the edit drawer. Details are fetched by row ID inside the drawer. */
function handleEdit(row: Api.Device.VirtualPoint) {
  operateType.value = 'edit';
  operateRowId.value = row.id;
  operateDrawerVisible.value = true;
}

/** Open the history modal. */
function handleHistory(row: Api.Device.VirtualPoint) {
  historyRow.value = row;
  historyModalVisible.value = true;
}

/** Render row actions by permission. The history action is only available when storage is enabled. */
function renderOperate(row: Api.Device.VirtualPoint) {
  const buttons = [];
  const physicalPoint = getPhysicalPoint(row);

  if (hasAuth('device:virtual-point:history')) {
    buttons.push(
      <ButtonIcon
        text
        type="primary"
        icon="material-symbols:history-rounded"
        tooltipContent={physicalPoint?.is_storage ? $t('virtualPoint.action.historyData') : $t('virtualPoint.action.historyDisabled')}
        disabled={!physicalPoint?.is_storage}
        onClick={() => handleHistory(row)}
      />
    );
  }
  if (hasAuth('device:virtual-point:edit')) {
    buttons.push(
      <ButtonIcon
        text
        type="primary"
        icon="material-symbols:drive-file-rename-outline-outline"
        tooltipContent={$t('common.edit')}
        onClick={() => handleEdit(row)}
      />
    );
  }
  if (hasAuth('device:virtual-point:delete')) {
    buttons.push(
      <ButtonIcon
        text
        type="error"
        icon="material-symbols:delete-outline"
        tooltipContent={$t('common.delete')}
        popconfirmContent={$t('virtualPoint.action.deleteConfirm')}
        onPositiveClick={() => handleDelete(row.id)}
      />
    );
  }

  return (
    <div class="flex-center gap-8px">
      {buttons.map((button, index) => (
        <>
          {index > 0 && <NDivider vertical />}
          {button}
        </>
      ))}
    </div>
  );
}

/** Delete a single virtual point and let the table hook maintain pagination. */
async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteVirtualPoint({ id_list: [id] });
  if (error) return;
  onDeleted();
}

/** Delete the selected virtual points in batch and refresh the current list state. */
async function handleBatchDelete() {
  const { error } = await fetchDeleteVirtualPoint({ id_list: checkedRowKeys.value });
  if (error) return;
  onBatchDeleted();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :title="$t('virtualPoint.management')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('device:virtual-point:add')"
          :show-delete="hasAuth('device:virtual-point:delete')"
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
      <VirtualPointOperateDrawer
        v-model:visible="operateDrawerVisible"
        :operate-type="operateType"
        :row-id="operateRowId"
        @submitted="getDataByPage"
      />
      <VirtualPointHistoryModal
        v-model:visible="historyModalVisible"
        :row="historyRow"
        :logic-point="historyLogicPoint"
        :physical-point="historyPhysicalPoint"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
