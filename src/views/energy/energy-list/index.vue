<script setup lang="tsx">
import { computed, ref, shallowRef, watch } from 'vue';
import { NPopover } from 'naive-ui';
import { type FilterConfig, isValidFilterConfig } from '@sa/utils';
import { ENERGY_TYPE_OPTIONS } from '@/constants/device-point';
import { fetchGetDevicePointEnergyList } from '@/service/api/energy';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { displayValue } from '@/utils/common-methods';
import { $t } from '@/locales';
import { createDefaultDateRange, normalizeDateRange } from './modules/energy-list-date';
import EnergyListSearch from './modules/energy-list-search.vue';

defineOptions({
  name: 'EnergyList'
});

type EnergyRow = Api.Energy.DevicePointEnergy;
type EnergyPoint = Api.Energy.DevicePointEnergyPoint;
type EnergyExtra = Api.Energy.DevicePointEnergyListExtra;
type EnergyColumn = NaiveUI.TableColumn<EnergyRow>;
type EnergyTableRecord = Api.Common.PaginatingQueryRecord<EnergyRow, EnergyExtra>;

const appStore = useAppStore();
const energyTypeOptions = ENERGY_TYPE_OPTIONS.filter(option => {
  const value = Number(option.value);

  return value > 0 && value !== 6;
});

const searchParams = ref<Api.Energy.DevicePointEnergyListSearchParams>({
  ...createDefaultSearchParams()
});
const energyExtra = shallowRef(createDefaultEnergyExtra());
const visibleEnergyTypeOptions = computed(() => {
  const selectedTypes = searchParams.value.energy_types;

  if (!selectedTypes.length) return energyTypeOptions;

  const selectedTypeSet = new Set(selectedTypes.map(Number));

  return energyTypeOptions.filter(option => selectedTypeSet.has(Number(option.value)));
});

function createDefaultSearchParams(): Api.Energy.DevicePointEnergyListSearchParams {
  return {
    pageNum: 1,
    pageSize: 10,
    aggregation_type: 1,
    energy_types: [],
    space_id: null,
    device_ids: [],
    dateRange: createDefaultDateRange(1)
  };
}

function createEnergyValueColumns(): EnergyColumn[] {
  return visibleEnergyTypeOptions.value.map(option => {
    const energyType = Number(option.value);

    return {
      key: `energy_${energyType}`,
      title: String(option.label),
      align: 'center',
      minWidth: 120,
      render: (row: EnergyRow) => renderEnergyValue(row, energyType)
    } satisfies EnergyColumn;
  });
}

function createDefaultEnergyExtra(): EnergyExtra {
  return {
    device_map: {},
    logic_point_map: {}
  };
}

function transformSearchParamsToRequest(
  params: Api.Energy.DevicePointEnergyListSearchParams
): Api.Energy.DevicePointEnergyListParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs: FilterConfig[] = [
    { type: 104, value: '101' },
    { type: 53, value: params.aggregation_type },
    { type: 51, value: params.energy_types.length ? params.energy_types.join(',') : null },
    { type: 52, value: params.space_id },
    { type: 54, value: params.device_ids.length ? params.device_ids.join(',') : null }
  ];

  const requestParams: Api.Energy.DevicePointEnergyListParams = {
    list_option: {
      options: filterConfigs.filter(isValidFilterConfig).map(({ type, value }) => ({ type, value: String(value) })),
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    },
    options: [{ key: 1 }, { key: 2 }]
  };

  const timeRange = normalizeDateRange(params.dateRange, params.aggregation_type);

  if (timeRange) {
    requestParams.time_range = timeRange;
  }

  return requestParams;
}

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return Boolean(value && typeof value === 'object');
}

function isEnergyPayload(value: unknown): value is Api.Energy.DevicePointEnergyList {
  return isRecord(value) && 'paginate' in value && 'energy_list' in value;
}

function getEnergyPayload(response: unknown): Api.Energy.DevicePointEnergyList | null {
  if (isEnergyPayload(response)) return response;

  if (!isRecord(response)) return null;

  return isEnergyPayload(response.data) ? response.data : null;
}

function createEnergyTableRecord(
  payload: Api.Energy.DevicePointEnergyList,
  pageNum: number,
  pageSize: number
): EnergyTableRecord {
  return {
    list: Array.isArray(payload.energy_list) ? payload.energy_list : [],
    paginate: {
      limit: typeof payload.paginate?.limit === 'number' ? payload.paginate.limit : pageSize,
      total: typeof payload.paginate?.total === 'number' ? payload.paginate.total : 0,
      offset: (pageNum - 1) * pageSize
    },
    device_map: payload.device_map ?? {},
    logic_point_map: payload.logic_point_map ?? {}
  };
}

function transformEnergyResponse(response: unknown) {
  const payload = getEnergyPayload(response);

  if (!payload) {
    energyExtra.value = createDefaultEnergyExtra();

    return {
      data: [],
      pageNum: 1,
      total: 0
    };
  }

  const pageNum = searchParams.value.pageNum || 1;
  const pageSize = searchParams.value.pageSize || 10;
  const normalizedResponse = createEnergyTableRecord(payload, pageNum, pageSize);
  const { device_map, logic_point_map } = normalizedResponse;

  energyExtra.value = {
    device_map,
    logic_point_map
  };

  return defaultTransform<EnergyRow>(normalizedResponse);
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, reloadColumns, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetDevicePointEnergyList(transformSearchParamsToRequest(searchParams.value)),
    transform: transformEnergyResponse,
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page ?? 1;
      searchParams.value.pageSize = params.pageSize ?? 10;
    },
    columns: (): EnergyColumn[] => [
      {
        key: 'index',
        title: $t('common.index'),
        align: 'center',
        width: 64,
        render: (_, index) => index + 1
      },
      {
        key: 'stat_at',
        title: '统计时间',
        align: 'center',
        minWidth: 140,
        render: row => formatStatAt(row.stat_at)
      },
      {
        key: 'device_id',
        title: '设备名称',
        align: 'center',
        minWidth: 160,
        ellipsis: { tooltip: true },
        render: row => getDeviceName(row.device_id)
      },
      ...createEnergyValueColumns()
    ]
  });

function getDeviceName(deviceId: CommonType.IdType) {
  return energyExtra.value.device_map[String(deviceId)]?.name ?? '-';
}

function getLogicPointName(point: EnergyPoint) {
  return energyExtra.value.logic_point_map[String(point.logic_point_id)]?.name ?? point.logic_point_key ?? '-';
}

function getEnergyPoints(row: EnergyRow, energyType: number) {
  return row.point_energy_list?.filter(point => point.energy_type === energyType) ?? [];
}

function getEnergyTotal(points: EnergyPoint[]) {
  let hasValue = false;
  const total = points.reduce((sum, point) => {
    if (point.value === null || point.value === undefined) return sum;

    hasValue = true;
    return sum + point.value;
  }, 0);

  return hasValue ? total : null;
}

function renderEnergyDetails(points: EnergyPoint[]) {
  return (
    <div class="max-w-360px min-w-220px flex-col gap-6px">
      {points.map(point => (
        <div
          key={`${point.logic_point_id}-${point.logic_point_key}`}
          class="flex items-center justify-between gap-16px"
        >
          <span class="min-w-0 flex-1 truncate">{getLogicPointName(point)}</span>
          <span class="shrink-0">{displayValue(point.value)}</span>
        </div>
      ))}
    </div>
  );
}

function renderEnergyValue(row: EnergyRow, energyType: number) {
  const points = getEnergyPoints(row, energyType);
  const total = getEnergyTotal(points);
  const totalText = displayValue(total);

  if (!points.length) return totalText;

  return (
    <NPopover trigger="hover" placement="top">
      {{
        trigger: () => <span class="cursor-default">{totalText}</span>,
        default: () => renderEnergyDetails(points)
      }}
    </NPopover>
  );
}

function formatDateText(text: string) {
  return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
}

function formatStatAt(value: number) {
  const text = String(value);

  if (/^\d{10}$/.test(text)) {
    const dateText = formatDateText(text);
    const hourText = text.slice(8, 10);

    return `${dateText} ${hourText}:00:00 ~ ${dateText} ${hourText}:59:59`;
  }

  if (/^\d{8}$/.test(text)) {
    const dateText = formatDateText(text);

    return `${dateText} 00:00:00 ~ ${dateText} 23:59:59`;
  }

  return text || '-';
}

function handleSearch() {
  getDataByPage(1);
}

watch(
  () => searchParams.value.energy_types.join(','),
  () => {
    reloadColumns();
  }
);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <EnergyListSearch v-model:model="searchParams" @search="handleSearch" />

    <NCard title="能耗列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
          :show-add="false"
          :show-delete="false"
          @refresh="getData"
        />
      </template>
      <DataTable
        :columns="columns"
        :data="data"
        :flex-height="!appStore.isMobile"
        :scroll-x="scrollX"
        :loading="loading"
        remote
        :row-key="row => `${row.stat_at}-${row.device_id}`"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
