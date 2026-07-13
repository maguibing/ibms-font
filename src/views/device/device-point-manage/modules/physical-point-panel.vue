<script setup lang="ts">
import { computed, h, ref, watch } from 'vue';
import { formatDateTime } from '@sa/utils';
import { fetchGetPhysicalPointList } from '@/service/api/device';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import CopyableValue from '@/components/custom/copyable-value.vue';
import DataTypeTag from '@/components/custom/data-type-tag.vue';
import { DATA_TYPE_OPTIONS } from '@/constants/device-point';
import { displayValue } from '@/utils/common-methods';
import { getGatewayProtocolLabel } from '@/views/gateway/gateway-list/shared';

defineOptions({
  name: 'PhysicalPointPanel'
});

interface Props {
  selectedGatewayId: CommonType.IdType | null;
  gatewayList: Api.Gateway.Gateway[];
}

const props = defineProps<Props>();

const appStore = useAppStore();

const searchParams = ref<Api.Device.PhysicalPointSearchParams>({
  pageNum: 1,
  pageSize: 10,
  gateway_id: null,
  name: null,
  key: null,
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

const {
  columns,
  columnChecks,
  data,
  extraData,
  getData,
  getDataByPage,
  loading,
  mobilePagination,
  pagination,
  scrollX
} = useNaivePaginatedTable({
  api: () => fetchGetPhysicalPointList(transformSearchParamsToRequest(searchParams.value)),
  transform: response => defaultTransform<Api.Device.PhysicalPoint>(response),
  onPaginationParamsChange: params => {
    searchParams.value.pageNum = params.page ?? 1;
    searchParams.value.pageSize = params.pageSize ?? 10;
  },
  columns: (): NaiveUI.TableColumn<Api.Device.PhysicalPoint>[] => [
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
      render: row => h(CopyableValue, { value: row.key })
    },
    {
      key: 'gateway_id',
      title: '边缘设备',
      align: 'center',
      minWidth: 150,
      ellipsis: {
        tooltip: true
      },
      render: row => getGatewayName(row.gateway_id)
    },
    {
      key: 'protocol_type',
      title: '协议类型',
      align: 'center',
      minWidth: 120,
      render: row => getPhysicalPointProtocolLabel(row)
    },
    {
      key: 'data_type',
      title: '数据类型',
      align: 'center',
      minWidth: 120,
      render: row => h(DataTypeTag, { value: row.data_type })
    },
    {
      key: 'current_value',
      title: '当前值',
      align: 'center',
      minWidth: 140,
      ellipsis: {
        tooltip: true
      },
      render: row => formatCurrentValue(row)
    },
    {
      key: 'logic_point_id',
      title: '关联逻辑点位',
      align: 'center',
      minWidth: 160,
      ellipsis: {
        tooltip: true
      },
      render: row => getLogicPointName(row.logic_point_id)
    },
    {
      key: 'access_level',
      title: '访问等级',
      align: 'center',
      minWidth: 100,
      render: row => row.protocol?.access_level ?? '-'
    },
    {
      key: 'updated_at',
      title: '更新时间',
      align: 'center',
      minWidth: 180,
      render: row => (row.updated_at ? formatDateTime(row.updated_at) : '-')
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

function getLogicPointName(logicPointId?: CommonType.IdType) {
  if (!logicPointId) return '-';

  return physicalPointExtra.value.logic_point_map?.[String(logicPointId)]?.name ?? '-';
}

function getPhysicalPointProtocolLabel(row: Api.Device.PhysicalPoint) {
  const protocolType =
    row.protocol_type ?? row.protocol?.protocol_type ?? gatewayByIdMap.value[String(row.gateway_id)]?.protocol_type;

  return getGatewayProtocolLabel(protocolType);
}

function formatCurrentValue(row: Api.Device.PhysicalPoint) {
  const currentValue = physicalPointExtra.value.current_value_map?.[String(row.id)];
  if (!currentValue) return '-';

  const dataType = Number(currentValue.data_type ?? row.data_type);

  if (dataType === 1) {
    const value = currentValue.num_val?.value;
    const unit = currentValue.num_val?.unit;

    return value === undefined || value === null ? '-' : `${value}${unit ? ` ${unit}` : ''}`;
  }

  if (dataType === 2) {
    return displayValue(currentValue.switch_val?.alias ?? currentValue.switch_val?.value);
  }

  if (dataType === 3) {
    return displayValue(currentValue.str_val?.value);
  }

  if (dataType === 4) {
    return displayValue(currentValue.enum_val?.alias ?? currentValue.enum_val?.value);
  }

  return '-';
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
          <NTag size="small" :bordered="false">共 {{ pagination.itemCount || 0 }} 个点位</NTag>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :loading="loading"
            :show-add="false"
            :show-delete="false"
            :show-export="false"
            @refresh="getData"
          />
        </NSpace>
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
  </div>
</template>
