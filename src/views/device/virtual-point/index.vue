<script setup lang="tsx">
import { computed, h, ref, shallowRef } from 'vue';
import { NDivider, NTag } from 'naive-ui';
import { StatusTag } from '@sa/materials';
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

defineOptions({ name: 'DeviceVirtualPoint' });

const appStore = useAppStore();
const { hasAuth } = useAuth();

// 操作抽屉只保存模式和行 ID，详情数据由抽屉打开时自行加载。
const operateDrawerVisible = shallowRef(false);
const operateType = shallowRef<NaiveUI.TableOperateType>('add');
const operateRowId = shallowRef<CommonType.IdType | null>(null);
const historyModalVisible = shallowRef(false);
const historyRow = shallowRef<Api.Device.VirtualPoint | null>(null);
const paginationParams = ref({ page: 1, pageSize: 10 });

// 列表接口需要使用 offset + limit，同时请求逻辑点和物理点映射用于展示。
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
    paginationParams.value.pageSize = params.pageSize ?? 10;
  },
  columns: (): NaiveUI.TableColumn<Api.Device.VirtualPoint>[] => [
    { type: 'selection', align: 'center', width: 48 },
    {
      key: 'name',
      title: '虚拟点名称',
      align: 'center',
      ellipsis: { tooltip: true },
      render: row => getLogicPoint(row)?.name ?? '-'
    },
    {
      key: 'key',
      title: '虚拟点标识',
      align: 'center',
      ellipsis: { tooltip: true },
      render: row => getLogicPoint(row)?.key ?? '-'
    },
    {
      key: 'compute_mode',
      title: '计算模式',
      align: 'center',
      render: row => <NTag type="info">{virtualPointComputeModeMap[row.compute_mode ?? 0] ?? '-'}</NTag>
    },
    {
      key: 'data_type',
      title: '数据类型',
      align: 'center',
      render: row => h(EnumTag, { value: row.setting?.point?.data_type })
    },
    {
      key: 'status',
      title: '状态',
      align: 'center',
      render: row => <StatusTag value={row.status} />
    },
    {
      key: 'operate',
      title: '操作',
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

/** 从列表额外映射中读取虚拟点对应的逻辑点。 */
function getLogicPoint(row: Api.Device.VirtualPoint) {
  return virtualPointExtra.value.logic_point_map?.[String(row.logic_point_id ?? '')];
}

/** 从列表额外映射中读取虚拟点对应的物理点。 */
function getPhysicalPoint(row: Api.Device.VirtualPoint) {
  return virtualPointExtra.value.physical_point_map?.[String(row.physical_point_id ?? '')];
}

/** 打开创建抽屉。 */
function handleAdd() {
  operateType.value = 'add';
  operateRowId.value = null;
  operateDrawerVisible.value = true;
}

/** 打开编辑抽屉，详情由抽屉按行 ID 拉取。 */
function handleEdit(row: Api.Device.VirtualPoint) {
  operateType.value = 'edit';
  operateRowId.value = row.id;
  operateDrawerVisible.value = true;
}

/** 打开历史记录弹窗。 */
function handleHistory(row: Api.Device.VirtualPoint) {
  historyRow.value = row;
  historyModalVisible.value = true;
}

/** 按权限渲染行操作，历史按钮仅在开启存储时可用。 */
function renderOperate(row: Api.Device.VirtualPoint) {
  const buttons = [];
  const physicalPoint = getPhysicalPoint(row);

  if (hasAuth('device:virtual-point:history')) {
    buttons.push(
      <ButtonIcon
        text
        type="primary"
        icon="material-symbols:history-rounded"
        tooltipContent={physicalPoint?.is_storage ? '历史数据' : '未开启历史存储'}
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
        tooltipContent="编辑"
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
        tooltipContent="删除"
        popconfirmContent="确认删除该虚拟点吗？"
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

/** 删除单个虚拟点后按表格 hook 维护分页。 */
async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteVirtualPoint({ id_list: [id] });
  if (error) return;
  onDeleted();
}

/** 批量删除选中虚拟点后刷新当前列表状态。 */
async function handleBatchDelete() {
  const { error } = await fetchDeleteVirtualPoint({ id_list: checkedRowKeys.value });
  if (error) return;
  onBatchDeleted();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard title="虚拟点管理" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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
