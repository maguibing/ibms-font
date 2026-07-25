<script setup lang="tsx">
import { ref, shallowRef } from 'vue';
import { type FilterConfig, isValidFilterConfig } from '@sa/utils';
import { fetchGetDevicePointEnergyList } from '@/service/api/energy';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import RunTimeSearch from './modules/run-time-search.vue';

defineOptions({
  name: 'EnergyRunTime'
});

type EnergyExtra = Api.Energy.DevicePointEnergyListExtra;

const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

const appStore = useAppStore();

const searchParams = ref<Api.Energy.DevicePointEnergySearchParams>({
  ...createDefaultSearchParams()
});
const energyExtra = shallowRef(createDefaultEnergyExtra());

function createDefaultDateRange(): [number, number] {
  const endAt = Math.floor(Date.now() / 1000);

  return [endAt - SEVEN_DAYS_SECONDS, endAt];
}

function createDefaultEnergyExtra(): EnergyExtra {
  return {
    device_map: {},
    logic_point_map: {}
  };
}

function createDefaultSearchParams(): Api.Energy.DevicePointEnergySearchParams {
  return {
    pageNum: 1,
    pageSize: 10,
    device_names: [],
    dateRange: createDefaultDateRange()
  };
}

function transformSearchParamsToRequest(
  params: Api.Energy.DevicePointEnergySearchParams
): Api.Energy.DevicePointEnergyListParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs: FilterConfig[] = [
    { type: 104, value: '101' },
    { type: 53, value: '2' },
    { type: 51, value: '6' },
    { type: 54, value: params.device_names.length ? params.device_names.join(',') : null }
  ];

  const requestParams: Api.Energy.DevicePointEnergyListParams = {
    list_option: {
      options: filterConfigs.filter(isValidFilterConfig).map(({ type, value }) => ({ type, value })),
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    },
    options: [{ key: 1 }, { key: 2 }]
  };

  if (params.dateRange?.length === 2) {
    requestParams.time_range = {
      start_at: params.dateRange[0],
      end_at: params.dateRange[1]
    };
  }

  return requestParams;
}

function getEnergyPayload(response: unknown): Api.Energy.DevicePointEnergyList | null {
  if (!response || typeof response !== 'object') return null;

  if ('paginate' in response && 'energy_list' in response) {
    return response as Api.Energy.DevicePointEnergyList;
  }

  if ('data' in response) {
    const payload = (response as { data?: unknown }).data;

    if (payload && typeof payload === 'object' && 'paginate' in payload && 'energy_list' in payload) {
      return payload as Api.Energy.DevicePointEnergyList;
    }
  }

  return null;
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
  const normalizedResponse: Api.Common.PaginatingQueryRecord<Api.Energy.DevicePointEnergy, EnergyExtra> = {
    list: Array.isArray(payload.energy_list) ? payload.energy_list : [],
    paginate: {
      limit: typeof payload.paginate?.limit === 'number' ? payload.paginate.limit : pageSize,
      total: typeof payload.paginate?.total === 'number' ? payload.paginate.total : 0,
      offset: (pageNum - 1) * pageSize
    },
    device_map: payload.device_map ?? {},
    logic_point_map: payload.logic_point_map ?? {}
  };

  energyExtra.value = {
    device_map: normalizedResponse.device_map,
    logic_point_map: normalizedResponse.logic_point_map
  };

  return defaultTransform<Api.Energy.DevicePointEnergy>(normalizedResponse);
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetDevicePointEnergyList(transformSearchParamsToRequest(searchParams.value)),
    transform: transformEnergyResponse,
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page ?? 1;
      searchParams.value.pageSize = params.pageSize ?? 10;
    },
    columns: (): NaiveUI.TableColumn<Api.Energy.DevicePointEnergy>[] => [
      {
        key: 'index',
        title: $t('common.index'),
        align: 'center',
        width: 64,
        render: (_, index) => index + 1
      },
      {
        key: 'stat_at',
        title: '统计日期',
        align: 'center',
        minWidth: 120,
        render: row => formatStatDate(row.stat_at)
      },
      {
        key: 'device_id',
        title: '设备名称',
        align: 'center',
        minWidth: 160,
        ellipsis: { tooltip: true },
        render: row => getDeviceName(row.device_id)
      },
      {
        key: 'logic_point_name',
        title: '点位名称',
        align: 'center',
        minWidth: 180,
        ellipsis: { tooltip: true },
        render: row => getLogicPointName(row)
      },
      {
        key: 'value',
        title: '运行时间(h)',
        align: 'center',
        minWidth: 120,
        render: row => getRunTimeValue(row)
      }
    ]
  });

function getFirstPoint(row: Api.Energy.DevicePointEnergy) {
  return row.point_energy_list?.[0] ?? null;
}

function getDeviceName(deviceId: CommonType.IdType) {
  return energyExtra.value.device_map[String(deviceId)]?.name ?? '-';
}

function getLogicPointName(row: Api.Energy.DevicePointEnergy) {
  const point = getFirstPoint(row);
  if (!point) return '-';

  return energyExtra.value.logic_point_map[String(point.logic_point_id)]?.name ?? point.logic_point_key ?? '-';
}

function getRunTimeValue(row: Api.Energy.DevicePointEnergy) {
  const value = getFirstPoint(row)?.value;

  return value === null || value === undefined ? '-' : value;
}

function formatStatDate(value: number) {
  const text = String(value);

  if (!/^\d{8}$/.test(text)) return text || '-';

  return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
}

function handleSearch() {
  getDataByPage(1);
}

function handleReset() {
  const pageSize = searchParams.value.pageSize ?? 10;

  Object.assign(searchParams.value, createDefaultSearchParams(), {
    pageSize
  });
  handleSearch();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <RunTimeSearch v-model:model="searchParams" @reset="handleReset" @search="handleSearch" />

    <NCard title="运行时间" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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
