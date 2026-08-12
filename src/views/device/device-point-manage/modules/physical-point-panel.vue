<script setup lang="ts">
import { computed, h, ref, shallowRef, useTemplateRef, watch } from 'vue';
import { NButton, NDivider, NTooltip } from 'naive-ui';
import { formatDateTime } from '@sa/utils';
import { fetchDeletePhysicalPoint, fetchGetPhysicalPointList } from '@/service/api/device';
import { fetchExportTask } from '@/service/api/common';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useExportProgress } from '@/hooks/business/export-progress';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { useRouterPush } from '@/hooks/common/router';
import { ExportBizType, ExportFileType, ImportBizType, ImportTemplatePath, PhysicalPointType } from '@/enum/business';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import CopyableValue from '@/components/custom/copyable-value.vue';
import DataImportModal from '@/components/custom/data-import-modal.vue';
import EnumTag from '@/components/custom/enum-tag.vue';
import { DATA_TYPE_OPTIONS } from '@/constants/device-point';
import { displayValue } from '@/utils/common-methods';
import { getWebSocketConnectionId } from '@/utils/websocket';
import DevicePointCommandModal from './device-point-command-modal.vue';
import PhysicalPointOperateDrawer from './physical-point-operate-drawer.vue';
import PhysicalPointScanDrawer from './physical-point-scan-drawer.vue';

defineOptions({
  name: 'PhysicalPointPanel'
});

interface Props {
  selectedGatewayId: CommonType.IdType | null;
  gatewayList: Api.Gateway.Gateway[];
  initialSearchKey?: string;
}

interface Emits {
  (e: 'jumpToLogicPoint', key: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const appStore = useAppStore();
const { hasAuth } = useAuth();
const { routerPushByKey } = useRouterPush();
const { startExport, stopExport } = useExportProgress();
const devicePointCommandModalRef =
  useTemplateRef<InstanceType<typeof DevicePointCommandModal>>('devicePointCommandModalRef');
const checkedRowKeys = ref<CommonType.IdType[]>([]);
const operateDrawerVisible = shallowRef(false);
const operateType = shallowRef<NaiveUI.TableOperateType>('add');
const editingPhysicalPointId = shallowRef<CommonType.IdType | null>(null);
const scanDrawerVisible = shallowRef(false);
const importPhysicalPointVisible = shallowRef(false);

const searchParams = ref<Api.Device.PhysicalPointSearchParams>({
  pageNum: 1,
  pageSize: 10,
  gateway_id: null,
  name: null,
  key: props.initialSearchKey || null,
  data_type: null
});

function transformSearchParamsToRequest(
  params: Api.Device.PhysicalPointSearchParams
): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs = [
    { type: 104, value: '101' },
    { type: 1, value: props.selectedGatewayId },
    { type: 5, value: params.name },
    { type: 3, value: params.key },
    { type: 7, value: params.data_type }
  ];

  const options = filterConfigs
    .filter(item => item.value !== null && item.value !== undefined && item.value !== '')
    .map(({ type, value }) => ({ type, value: String(value) }));

  return {
    list_option: {
      options,
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    },
    options: [{ key: 1 }, { key: 2 }, { key: 3 }]
  };
}

function renderPointLink(label: string, onClick: () => void) {
  return h(NTooltip, null, {
    trigger: () =>
      h(
        NButton,
        { text: true, type: 'primary', class: 'max-w-full', onClick },
        { default: () => h('span', { class: 'block max-w-120px truncate' }, label) }
      ),
    default: () => h('span', { class: 'text-white' }, label)
  });
}

const { columns, columnChecks, data, extraData, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetPhysicalPointList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Device.PhysicalPoint>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page ?? 1;
      searchParams.value.pageSize = params.pageSize ?? 10;
    },
    columns: (): NaiveUI.TableColumn<Api.Device.PhysicalPoint>[] => [
      {
        type: 'selection',
        align: 'center',
        width: 48
      },
      {
        key: 'gateway_id',
        title: '所属边缘设备',
        align: 'center',
        minWidth: 150,
        ellipsis: {
          tooltip: true
        },
        render: row => getGatewayName(row.gateway_id)
      },
      {
        key: 'protocol_type',
        title: '协议',
        align: 'center',
        minWidth: 120,
        render: row => h(EnumTag, { variant: 'protocol', value: getPhysicalPointProtocolType(row) })
      },
      {
        key: 'name',
        title: '名称',
        align: 'center',
        minWidth: 150,
        ellipsis: { tooltip: true },
        render: row => row.name || '-'
      },
      {
        key: 'key',
        title: '标识',
        align: 'center',
        minWidth: 150,
        ellipsis: { tooltip: true },
        render: row => h(CopyableValue, { value: row.key })
      },
      {
        key: 'report_at',
        title: '最新更新时间',
        align: 'center',
        minWidth: 180,
        render: row => formatReportAt(row)
      },
      {
        key: 'current_value',
        title: '最新值',
        align: 'center',
        minWidth: 140,
        ellipsis: { tooltip: true },
        render: row => formatCurrentValue(row)
      },
      {
        key: 'data_type',
        title: '数据类型',
        align: 'center',
        minWidth: 120,
        render: row => h(EnumTag, { value: getDisplayDataType(row) })
      },
      {
        key: 'access_level',
        title: '访问级别',
        align: 'center',
        minWidth: 100,
        render: row => h(EnumTag, { variant: 'accessLevel', value: row.protocol?.access_level })
      },
      {
        key: 'logic_point_id',
        title: '逻辑点位',
        align: 'center',
        minWidth: 160,
        render: row => {
          const logicPoint = getLogicPoint(row.logic_point_id);
          if (!logicPoint?.key) return logicPoint?.name ?? '-';

          return renderPointLink(logicPoint.name, () => emit('jumpToLogicPoint', logicPoint.key!));
        }
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 220,
        fixed: 'right',
        render: row => renderOperate(row)
      }
    ]
  });

const gatewayByIdMap = computed(() => {
  const map: Record<string, Api.Gateway.Gateway> = {};

  for (const item of props.gatewayList) {
    map[String(item.id)] = item;
  }

  return map;
});

const physicalPointExtra = computed<Api.Device.PhysicalPointListExtra>(() => {
  const raw = (extraData.value ?? {}) as Api.Device.PhysicalPointListExtra;

  return {
    gateway_map: raw.gateway_map ?? {},
    logic_point_map: raw.logic_point_map ?? {},
    current_value_map: raw.current_value_map ?? {}
  };
});

const selectedGateway = computed(() => {
  const gatewayId = props.selectedGatewayId;
  if (!gatewayId) return null;

  return gatewayByIdMap.value[String(gatewayId)] ?? null;
});

const selectedGatewayName = computed(() => selectedGateway.value?.name ?? '全部设备');

const physicalPointTitle = computed(() => `物理点位 - ${selectedGatewayName.value}`);

function getGatewayName(gatewayId: CommonType.IdType) {
  return (
    physicalPointExtra.value.gateway_map?.[String(gatewayId)]?.name ??
    gatewayByIdMap.value[String(gatewayId)]?.name ??
    '-'
  );
}

function getLogicPoint(logicPointId?: CommonType.IdType) {
  if (!logicPointId) return null;

  return physicalPointExtra.value.logic_point_map?.[String(logicPointId)] ?? null;
}

function getPhysicalPointProtocolType(row: Api.Device.PhysicalPoint) {
  return (
    row.protocol_type ?? row.protocol?.protocol_type ?? gatewayByIdMap.value[String(row.gateway_id)]?.protocol_type
  );
}

function getCurrentValue(row: Api.Device.PhysicalPoint) {
  return physicalPointExtra.value.current_value_map?.[String(row.id)] ?? null;
}

function getDisplayDataType(row: Api.Device.PhysicalPoint) {
  return getCurrentValue(row)?.data_type ?? row.data_type;
}

function formatReportAt(row: Api.Device.PhysicalPoint) {
  const timestamp = getCurrentValue(row)?.ts;
  if (!timestamp) return '-';

  return formatDateTime(timestamp < 1e12 ? timestamp * 1000 : timestamp);
}

function formatCurrentValue(row: Api.Device.PhysicalPoint) {
  const currentValue = getCurrentValue(row);
  if (!currentValue?.ts) return '-';

  const dataType = Number(getDisplayDataType(row));

  if (dataType === 1) {
    const value = currentValue.num_val?.value ?? 0;
    const unit = currentValue.num_val?.unit;

    return `${value}${unit ? ` ${unit}` : ''}`;
  }

  if (dataType === 2) {
    return displayValue(currentValue.switch_val?.alias || currentValue.switch_val?.value, '0');
  }

  if (dataType === 3) {
    return displayValue(currentValue.str_val?.value, '0');
  }

  if (dataType === 4) {
    return displayValue(currentValue.enum_val?.alias || currentValue.enum_val?.value, '0');
  }

  return '-';
}

function handleView(row: Api.Device.PhysicalPoint) {
  routerPushByKey('device_physical-point-detail', {
    query: {
      id: String(row.id),
      tab: 'physical'
    }
  });
}

function handleCommand(row: Api.Device.PhysicalPoint) {
  const logicPoint = getLogicPoint(row.logic_point_id);

  devicePointCommandModalRef.value?.open({
    source: 'physical',
    logicPoint: logicPoint?.key
      ? {
          id: logicPoint.id,
          name: logicPoint.name,
          key: logicPoint.key
        }
      : undefined,
    physicalPoint: row,
    currentValue: getCurrentValue(row)
  });
}

/** 打开新增物理点位抽屉。 */
function handleAdd() {
  operateType.value = 'add';
  editingPhysicalPointId.value = null;
  operateDrawerVisible.value = true;
}

/**
 * 打开编辑物理点位抽屉。
 *
 * @param row 物理点位行
 */
function handleEdit(row: Api.Device.PhysicalPoint) {
  operateType.value = 'edit';
  editingPhysicalPointId.value = row.id;
  operateDrawerVisible.value = true;
}

function handleScan() {
  scanDrawerVisible.value = true;
}

function handleImportPhysicalPoint() {
  importPhysicalPointVisible.value = true;
}

async function handleExport() {
  const connectionId = getWebSocketConnectionId();
  if (!connectionId) {
    window.$message?.warning('WebSocket 尚未连接，请稍后重试');
    return;
  }

  const { list_option } = transformSearchParamsToRequest(searchParams.value);
  startExport('物理点位');

  const { error } = await fetchExportTask({
    connection_id: connectionId,
    export_biz_type: ExportBizType.PhysicalPoint,
    file_type: ExportFileType.Excel,
    list_option: list_option!,
    physical_point: {
      source: PhysicalPointType.OriginalPhysicalPoint
    }
  });

  if (error) {
    stopExport();
    return;
  }

  window.$message?.success('导出任务已提交');
}

function handlePhysicalPointSubmitted() {
  checkedRowKeys.value = [];
  getDataByPage(1);
}

function renderOperate(row: Api.Device.PhysicalPoint) {
  const isReadOnly = row.protocol?.access_level === 1;
  const buttons = [];
  if (hasAuth('device:device-point-manage:physical-point:view')) {
    buttons.push(
      h(ButtonIcon, {
        text: true,
        type: 'primary',
        icon: 'material-symbols:visibility-outline',
        tooltipContent: '查看',
        onClick: () => handleView(row)
      })
    );
  }
  if (hasAuth('device:device-point-manage:physical-point:edit')) {
    buttons.push(
      h(ButtonIcon, {
        text: true,
        type: 'primary',
        icon: 'material-symbols:edit-outline-rounded',
        tooltipContent: '编辑',
        onClick: () => handleEdit(row)
      })
    );
  }
  if (hasAuth('device:device-point-manage:physical-point:ctrl')) {
    buttons.push(
      h(ButtonIcon, {
        text: true,
        type: 'primary',
        icon: 'material-symbols:send-rounded',
        tooltipContent: '下发',
        disabled: isReadOnly,
        onClick: () => handleCommand(row)
      })
    );
  }
  if (hasAuth('device:device-point-manage:physical-point:delete')) {
    buttons.push(
      h(ButtonIcon, {
        text: true,
        type: 'error',
        icon: 'material-symbols:delete-outline-rounded',
        tooltipContent: '删除',
        popconfirmContent: $t('common.confirmDelete'),
        onPositiveClick: () => handleDelete(row.id)
      })
    );
  }

  return h(
    'div',
    { class: 'flex-center gap-8px' },
    buttons.flatMap((button, index) => (index ? [h(NDivider, { vertical: true }), button] : [button]))
  );
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeletePhysicalPoint({ id_list: [id] });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = checkedRowKeys.value.filter(item => item !== id);
  await getData();
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return;

  const { error } = await fetchDeletePhysicalPoint({ id_list: checkedRowKeys.value });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = [];
  await getData();
}

function handleSearch() {
  getDataByPage(1);
}

function handleResetSearch() {
  searchParams.value.name = null;
  searchParams.value.key = null;
  searchParams.value.data_type = null;
  getDataByPage(1);
}

watch(
  () => props.selectedGatewayId,
  () => {
    getDataByPage(1);
  }
);
</script>

<template>
  <div class="h-full min-h-0 flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto">
    <NCard size="small" class="card-wrapper shrink-0">
      <NForm :show-feedback="false" label-placement="left" :label-width="90">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi span="24 s:12 m:8 xl:6" label="点位名称" label-width="auto" class="pr-24px">
            <NInput
              v-model:value="searchParams.name"
              clearable
              placeholder="请输入点位名称"
              @keyup.enter="handleSearch"
            />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:8 xl:6" label="点位标识" label-width="auto" class="pr-24px">
            <NInput
              v-model:value="searchParams.key"
              clearable
              placeholder="请输入点位标识"
              @keyup.enter="handleSearch"
            />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:8 xl:5" label="数据类型" label-width="auto" class="pr-24px">
            <NSelect
              v-model:value="searchParams.data_type"
              clearable
              :options="DATA_TYPE_OPTIONS"
              placeholder="请选择数据类型"
            />
          </NFormItemGi>
          <NFormItemGi :show-feedback="false" span="24 s:24 m:24 xl:7">
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
    </NCard>

    <NCard :title="physicalPointTitle" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <NSpace align="center" :size="12">
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            :show-add="hasAuth('device:device-point-manage:physical-point:add')"
            :show-delete="hasAuth('device:device-point-manage:physical-point:delete')"
            :show-export="hasAuth('device:device-point-manage:physical-point:export')"
            @add="handleAdd"
            @delete="handleBatchDelete"
            @export="handleExport"
            @refresh="getData"
          >
            <template #after>
              <NButton
                v-if="hasAuth('device:device-point-manage:physical-point:import')"
                size="small"
                ghost
                @click="handleImportPhysicalPoint"
              >
                <template #icon>
                  <SvgIcon icon="material-symbols:upload-rounded" class="text-icon" />
                </template>
                导入
              </NButton>
              <NButton
                v-if="hasAuth('device:device-point-manage:physical-point:scan')"
                size="small"
                ghost
                type="primary"
                @click="handleScan"
              >
                <template #icon>
                  <SvgIcon icon="material-symbols:radar" class="text-icon" />
                </template>
                扫描点位
              </NButton>
            </template>
          </TableHeaderOperation>
        </NSpace>
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
    </NCard>

    <DevicePointCommandModal ref="devicePointCommandModalRef" />
    <PhysicalPointOperateDrawer
      v-model:visible="operateDrawerVisible"
      :operate-type="operateType"
      :prefill-gateway="selectedGateway"
      :row-id="editingPhysicalPointId"
      @submitted="handlePhysicalPointSubmitted"
    />
    <PhysicalPointScanDrawer v-model:visible="scanDrawerVisible" :prefill-gateway="selectedGateway" />

    <!-- 导入点位映射 -->
    <DataImportModal
      v-model:visible="importPhysicalPointVisible"
      :biz-type="ImportBizType.PhysicalPoint"
      :template-path="ImportTemplatePath.PhysicalPoint"
      :template-file-name="`物理点位_${$t('common.importTemplate')}_${new Date().getTime()}.xlsx`"
      task-name="物理点位"
      @submitted="getData"
    />
  </div>
</template>
