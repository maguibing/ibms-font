<script setup lang="ts">
import { computed, h, ref, shallowRef, useTemplateRef, watch } from 'vue';
import { NButton, NDivider, NTooltip } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { formatDateTime } from '@sa/utils';
import { fetchBindDevicePoint, fetchGetLogicPointList } from '@/service/api/device';
import { fetchExportTask } from '@/service/api/common';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useExportProgress } from '@/hooks/business/export-progress';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { useRouterPush } from '@/hooks/common/router';
import { ExportBizType, ExportFileType, ImportBizType, ImportTemplatePath } from '@/enum/business';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import CopyableValue from '@/components/custom/copyable-value.vue';
import DataImportModal from '@/components/custom/data-import-modal.vue';
import EnumTag from '@/components/custom/enum-tag.vue';
import { displayValue } from '@/utils/common-methods';
import { getWebSocketConnectionId } from '@/utils/websocket';
import BindPhysicalPointDrawer from './bind-physical-point-drawer.vue';
import DevicePointCommandModal from './device-point-command-modal.vue';

defineOptions({
  name: 'LogicPointPanel'
});

type LogicPointTreeSelection = {
  id: CommonType.IdType;
  type: 1 | 2;
};

interface Props {
  selectedNode: LogicPointTreeSelection | null;
  initialSearchKey?: string;
}

interface Emits {
  (e: 'jumpToPhysicalPoint', key: string): void;
}

type SearchParams = CommonType.RecordNullable<
  Api.Common.CommonSearchParams & {
    name: string;
    key: string;
  }
>;

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const appStore = useAppStore();
const { hasAuth } = useAuth();
const { routerPushByKey } = useRouterPush();
const { loading: operationLoading, startLoading, endLoading } = useLoading();
const { startExport, stopExport } = useExportProgress();
const bindPhysicalPointDrawerRef =
  useTemplateRef<InstanceType<typeof BindPhysicalPointDrawer>>('bindPhysicalPointDrawerRef');
const devicePointCommandModalRef =
  useTemplateRef<InstanceType<typeof DevicePointCommandModal>>('devicePointCommandModalRef');
const importMappingVisible = shallowRef(false);

const searchParams = ref<SearchParams>({
  pageNum: 1,
  pageSize: 15,
  name: null,
  key: props.initialSearchKey || null
});

function transformSearchParamsToRequest(): CommonType.CommonListQueryParams {
  const pageNum = searchParams.value.pageNum || 1;
  const pageSize = searchParams.value.pageSize || 15;
  const options: CommonType.CommonTypeOptions[] = [];

  if (props.selectedNode) {
    options.push({ type: props.selectedNode.type, value: String(props.selectedNode.id) });
  }

  const name = searchParams.value.name?.trim();
  const key = searchParams.value.key?.trim();

  if (name) options.push({ type: 6, value: name });
  if (key) options.push({ type: 4, value: key });

  return {
    list_option: {
      options,
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    },
    options: [{ key: 1 }, { key: 2 }, { key: 3 }, { key: 4 }, { key: 5 }]
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
    api: () => fetchGetLogicPointList(transformSearchParamsToRequest()),
    transform: response => defaultTransform<Api.Device.LogicPoint>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page ?? 1;
      searchParams.value.pageSize = params.pageSize ?? 15;
    },
    columns: (): NaiveUI.TableColumn<Api.Device.LogicPoint>[] => [
      {
        key: 'index',
        title: $t('common.index'),
        align: 'center',
        width: 64,
        render: (_, index) => index + 1
      },
      {
        key: 'device_type_id',
        title: '设备类型',
        align: 'center',
        minWidth: 140,
        render: row =>
          renderPointLink(getExtraMapName('device_type_map', row.device_type_id), () =>
            handleDeviceTypeView(row.device_type_id)
          )
      },
      {
        key: 'device_id',
        title: '所属设备',
        align: 'center',
        minWidth: 140,
        render: row =>
          renderPointLink(getExtraMapName('device_map', row.device_id), () => handleDeviceView(row.device_id))
      },
      {
        key: 'name',
        title: '逻辑点位名称',
        align: 'center',
        minWidth: 180,
        ellipsis: { tooltip: true },
        render: row => row.name || '-'
      },
      {
        key: 'key',
        title: '逻辑点位标识',
        align: 'center',
        width: 180,
        ellipsis: { tooltip: true },
        render: row => h(CopyableValue, { value: row.key })
      },
      {
        key: 'data_type',
        title: '数据类型',
        align: 'center',
        minWidth: 120,
        render: row => h(EnumTag, { value: getLogicPointDataType(row) })
      },
      {
        key: 'physical_point_id',
        title: '物理点位',
        align: 'center',
        minWidth: 180,
        ellipsis: { tooltip: true },
        render: row => {
          if (!row.physical_point_id) return '暂未绑定';

          return renderPointLink(getExtraMapName('physical_point_map', row.physical_point_id), () =>
            handlePhysicalPointPanelJump(row.physical_point_id!)
          );
        }
      },
      {
        key: 'report_at',
        title: '最新更新时间',
        align: 'center',
        minWidth: 240,
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
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 160,
        fixed: 'right',
        render: row => renderOperate(row)
      }
    ]
  });

const logicPointExtra = computed<Api.Device.LogicPointListExtra>(() => {
  const raw = (extraData.value ?? {}) as Api.Device.LogicPointListExtra;

  return {
    device_type_map: raw.device_type_map ?? {},
    device_map: raw.device_map ?? {},
    physical_point_map: raw.physical_point_map ?? {},
    device_type_point_map: raw.device_type_point_map ?? {},
    current_value_map: raw.current_value_map ?? {}
  };
});

function getLogicPointDataType(row: Api.Device.LogicPoint) {
  return logicPointExtra.value.device_type_point_map?.[String(row.device_type_point_id)]?.data_type ?? row.data_type;
}

type NameMapKey = 'device_type_map' | 'device_map' | 'physical_point_map';

function getExtraMapName(mapKey: NameMapKey, id?: CommonType.IdType) {
  if (!id) return '-';

  return logicPointExtra.value[mapKey]?.[String(id)]?.name ?? '-';
}

function getCurrentValue(row: Api.Device.LogicPoint) {
  if (!row.physical_point_id) return null;

  return logicPointExtra.value.current_value_map?.[String(row.physical_point_id)] ?? null;
}

function formatReportAt(row: Api.Device.LogicPoint) {
  const timestamp = getCurrentValue(row)?.ts;
  if (!timestamp) return '-';

  return formatDateTime(timestamp < 1e12 ? timestamp * 1000 : timestamp);
}

function formatCurrentValue(row: Api.Device.LogicPoint) {
  const currentValue = getCurrentValue(row);
  if (!currentValue?.ts) return '-';

  const dataType = Number(currentValue.data_type ?? getLogicPointDataType(row));

  if (dataType === 1) {
    const value = currentValue.num_val?.value ?? 0;
    const unit = currentValue.num_val?.unit;

    return `${value}${unit ? ` ${unit}` : ''}`;
  }

  if (dataType === 2) return displayValue(currentValue.switch_val?.alias || currentValue.switch_val?.value, '0');
  if (dataType === 3) return displayValue(currentValue.str_val?.value, '0');
  if (dataType === 4) return displayValue(currentValue.enum_val?.alias || currentValue.enum_val?.value, '0');

  return '-';
}

function handleDeviceTypeView(id: CommonType.IdType) {
  routerPushByKey('device_device-type-detail', { query: { id: String(id) } });
}

function handleDeviceView(id: CommonType.IdType) {
  routerPushByKey('device_device-detail', { query: { id: String(id) } });
}

function getPhysicalPointKey(id: CommonType.IdType) {
  return logicPointExtra.value.physical_point_map?.[String(id)]?.key ?? '';
}

function handlePhysicalPointPanelJump(id: CommonType.IdType) {
  const key = getPhysicalPointKey(id);

  if (!key) {
    window.$message?.error('物理点位不存在');
    return;
  }

  emit('jumpToPhysicalPoint', key);
}

function handlePhysicalPointView(id: CommonType.IdType) {
  routerPushByKey('device_physical-point-detail', {
    query: {
      id: String(id),
      tab: 'physical'
    }
  });
}

function handleBindPhysicalPoint(row: Api.Device.LogicPoint) {
  bindPhysicalPointDrawerRef.value?.open(row);
}

function handleDevicePointCommand(row: Api.Device.LogicPoint) {
  const physicalPoint = logicPointExtra.value.physical_point_map?.[String(row.physical_point_id)];

  if (!physicalPoint) {
    window.$message?.error('物理点位不存在');
    return;
  }

  devicePointCommandModalRef.value?.open({
    source: 'logic',
    logicPoint: row,
    physicalPoint,
    currentValue: getCurrentValue(row)
  });
}

function renderOperate(row: Api.Device.LogicPoint) {
  if (!row.physical_point_id) {
    const buttons = [];
    if (hasAuth('device:device-point-manage:device-point:match')) {
      buttons.push(
        h(ButtonIcon, {
          text: true,
          type: 'primary',
          icon: 'material-symbols:add-link-rounded',
          tooltipContent: '绑定物理点位',
          onClick: () => handleBindPhysicalPoint(row)
        })
      );
    }

    return h('div', { class: 'flex-center gap-8px' }, buttons);
  }

  const buttons = [];
  if (hasAuth('device:device-point-manage:physical-point:view')) {
    buttons.push(
      h(ButtonIcon, {
        text: true,
        type: 'primary',
        icon: 'material-symbols:visibility-outline',
        tooltipContent: '查看物理点位',
        onClick: () => handlePhysicalPointView(row.physical_point_id!)
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
        onClick: () => handleDevicePointCommand(row)
      })
    );
  }
  if (hasAuth('device:device-point-manage:device-point:match')) {
    buttons.push(
      h(ButtonIcon, {
        text: true,
        type: 'error',
        icon: 'material-symbols:link-off-rounded',
        tooltipContent: '解绑物理点位',
        popconfirmContent: '确认解绑物理点位？',
        onPositiveClick: () => handleUnbindPhysicalPoint(row)
      })
    );
  }

  return h(
    'div',
    { class: 'flex-center gap-8px' },
    buttons.flatMap((button, index) => (index ? [h(NDivider, { vertical: true }), button] : [button]))
  );
}

async function handleSmartMatch() {
  startLoading();
  const { error } = await fetchBindDevicePoint({ op_type: 3 }).finally(endLoading);
  if (error) return;

  window.$message?.success('智能匹配成功');
  handleRefresh();
}

async function handleUnbindPhysicalPoint(row: Api.Device.LogicPoint) {
  if (!row.physical_point_id) return;

  startLoading();
  const { error } = await fetchBindDevicePoint({
    op_type: 2,
    unbind_list: [{ logic_point_id: row.id, physical_point_id: row.physical_point_id }]
  }).finally(endLoading);

  if (error) return;

  window.$message?.success('解绑成功');
  getData();
}

async function handleExport() {
  const connectionId = getWebSocketConnectionId();
  if (!connectionId) {
    window.$message?.warning('WebSocket 尚未连接，请稍后重试');
    return;
  }

  const { list_option } = transformSearchParamsToRequest();
  startExport('逻辑点位');

  const { error } = await fetchExportTask({
    connection_id: connectionId,
    export_biz_type: ExportBizType.LogicPoint,
    file_type: ExportFileType.Excel,
    list_option: list_option!
  });

  if (error) {
    stopExport();
    return;
  }

  window.$message?.success('导出任务已提交');
}

function handleImportMapping() {
  importMappingVisible.value = true;
}

function handleSearch() {
  getDataByPage(1);
}

function handleResetSearch() {
  searchParams.value.name = null;
  searchParams.value.key = null;
  getDataByPage(1);
}

function handleRefresh() {
  getData();
}

watch(
  () => props.selectedNode,
  () => getDataByPage(1)
);
</script>

<template>
  <div class="h-full min-h-0 flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto">
    <NCard size="small" class="card-wrapper shrink-0">
      <NForm :show-feedback="false" label-placement="left">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi span="24 s:12 m:8" label="点位名称" class="pr-24px">
            <NInput
              v-model:value="searchParams.name"
              clearable
              placeholder="请输入点位名称"
              @keyup.enter="handleSearch"
            />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:8" label="点位标识" class="pr-24px">
            <NInput
              v-model:value="searchParams.key"
              clearable
              placeholder="请输入点位标识"
              @keyup.enter="handleSearch"
            />
          </NFormItemGi>
          <NFormItemGi :show-feedback="false" span="24 s:24 m:8">
            <NSpace class="w-full" justify="end">
              <NButton type="primary" ghost @click="handleSearch">
                <template #icon><icon-ic-round-search class="text-icon" /></template>
                {{ $t('common.search') }}
              </NButton>
              <NButton @click="handleResetSearch">
                <template #icon><icon-ic-round-refresh class="text-icon" /></template>
                {{ $t('common.reset') }}
              </NButton>
            </NSpace>
          </NFormItemGi>
        </NGrid>
      </NForm>
    </NCard>

    <NCard title="逻辑点位" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading || operationLoading"
          :show-add="false"
          :show-delete="false"
          :show-export="hasAuth('device:device-point-manage:logic-point:export')"
          @export="handleExport"
          @refresh="handleRefresh"
        >
          <template #prefix>
            <NButton
              v-if="hasAuth('device:device-point-manage:device-point:match')"
              size="small"
              type="success"
              ghost
              :loading="operationLoading"
              @click="handleSmartMatch"
            >
              <template #icon><SvgIcon icon="material-symbols:wand-stars-rounded" /></template>
              智能匹配
            </NButton>
          </template>
          <template #after>
            <NButton
              v-if="hasAuth('device:device-point-manage:device-point-mapping:import')"
              size="small"
              ghost
              @click="handleImportMapping"
            >
              <template #icon>
                <SvgIcon icon="material-symbols:upload-rounded" class="text-icon" />
              </template>
              导入映射表
            </NButton>
          </template>
        </TableHeaderOperation>
      </template>
      <DataTable
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

    <BindPhysicalPointDrawer ref="bindPhysicalPointDrawerRef" @submitted="handleRefresh" />
    <DevicePointCommandModal ref="devicePointCommandModalRef" />
    <DataImportModal
      v-model:visible="importMappingVisible"
      :biz-type="ImportBizType.DevicePointMapping"
      :template-path="ImportTemplatePath.DevicePointMapping"
      :template-file-name="`点位映射_${$t('common.importTemplate')}_${new Date().getTime()}.xlsx`"
      task-name="点位映射"
      @submitted="handleRefresh"
    />
  </div>
</template>

<style scoped></style>
