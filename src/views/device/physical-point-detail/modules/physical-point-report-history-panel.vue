<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import type { ECOption } from '@/hooks/common/echarts';
import { useEcharts } from '@/hooks/common/echarts';
import { fetchGetDevicePointHistoryTrend } from '@/service/api/device';
import { displayValue, formatUnixDateTime } from '@/utils/common-methods';

defineOptions({
  name: 'PhysicalPointReportHistoryPanel'
});

type ReportViewMode = 'chart' | 'table';

type ReportHistoryRow = {
  id: string;
  timestamp: number;
  time: string;
  value: string;
  numericValue: number | null;
};

interface Props {
  physicalPoint: Api.Device.PhysicalPoint;
}

const HISTORY_STAT_TYPE = 5;
const HOUR_SECONDS = 60 * 60;
const SECOND_MILLISECONDS = 1000;

const props = defineProps<Props>();

const reportViewMode = shallowRef<ReportViewMode>('chart');
const loading = shallowRef(false);
const dateRange = shallowRef<[number, number]>(createRecentHourDateRange());
const trend = shallowRef<Api.Device.DevicePointHistoryTrend | null>(null);
let requestSeq = 0;

const canQuery = computed(() => Boolean(props.physicalPoint.key));
const isNumberDataType = computed(() => Number(props.physicalPoint.data_type) === 1);
const dateRangeFormattedValue = computed<[string, string]>(() => [
  String(dateRange.value[0]),
  String(dateRange.value[1])
]);
const rows = computed<ReportHistoryRow[]>(() =>
  (trend.value?.point_trends ?? [])
    .filter((item): item is Api.Device.DevicePointHistoryValue & { ts: number } => item.ts !== undefined)
    .map((item, index) => ({
      id: `${item.ts}-${index}`,
      timestamp: item.ts,
      time: formatUnixDateTime(item.ts),
      value: formatTrendValue(item),
      numericValue: getTrendNumericValue(item)
    }))
);
const unit = computed(() => {
  for (const item of trend.value?.point_trends ?? []) {
    const pointUnit = item.num_val?.unit ?? item.switch_val?.unit ?? item.str_val?.unit ?? item.enum_val?.unit;
    if (pointUnit) return pointUnit;
  }

  return '';
});
const columns: DataTableColumns<ReportHistoryRow> = [
  {
    key: 'time',
    title: '时间',
    align: 'center',
    width: 190
  },
  {
    key: 'value',
    title: '上报值',
    align: 'center',
    ellipsis: { tooltip: true }
  }
];
const { domRef: chartRef, updateOptions: updateChartOptions } = useEcharts(createChartOptions);

function createRecentHourDateRange(): [number, number] {
  const endAt = Math.floor(Date.now() / SECOND_MILLISECONDS);

  return [endAt - HOUR_SECONDS, endAt];
}

function getTrendRawValue(value: Api.Device.DevicePointHistoryValue) {
  return (
    value.num_val?.value ??
    value.switch_val?.alias ??
    value.switch_val?.value ??
    value.str_val?.value ??
    value.enum_val?.alias ??
    value.enum_val?.value
  );
}

function getTrendNumericValue(value: Api.Device.DevicePointHistoryValue) {
  const rawValue = value.num_val?.value;
  if (rawValue === undefined || rawValue === null || rawValue === '') return null;

  const numericValue = Number(rawValue);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatTrendValue(value: Api.Device.DevicePointHistoryValue) {
  const pointUnit = value.num_val?.unit ?? value.switch_val?.unit ?? value.str_val?.unit ?? value.enum_val?.unit ?? '';
  const text = displayValue(getTrendRawValue(value));

  return pointUnit && text !== '-' ? `${text} ${pointUnit}` : text;
}

function createChartOptions(): ECOption {
  const showZoom = rows.value.length > 30;

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
      valueFormatter: value => {
        const text = displayValue(value);

        return unit.value && text !== '-' ? `${text} ${unit.value}` : text;
      }
    },
    grid: {
      top: 28,
      right: 24,
      bottom: showZoom ? 72 : 36,
      left: 16,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: rows.value.map(row => row.time),
      axisLabel: {
        hideOverlap: true,
        rotate: showZoom ? 30 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: unit.value,
      splitLine: {
        lineStyle: { type: 'dashed' }
      }
    },
    series: [
      {
        name: props.physicalPoint.name || '上报值',
        type: 'line',
        data: rows.value.map(row => row.numericValue),
        smooth: true,
        connectNulls: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { width: 2 }
      }
    ],
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      {
        type: 'slider',
        show: showZoom,
        height: 20,
        bottom: 10,
        showDetail: false,
        brushSelect: false,
        start: 0,
        end: 100
      }
    ]
  };
}

async function getHistoryData() {
  if (!props.physicalPoint.key) {
    window.$message?.warning('缺少物理点位标识，无法获取上报历史');
    return;
  }

  const sequence = ++requestSeq;

  loading.value = true;
  try {
    const { data, error } = await fetchGetDevicePointHistoryTrend({
      physical_point_key_list: [props.physicalPoint.key],
      stat_type: HISTORY_STAT_TYPE,
      time_range: {
        start_at: dateRange.value[0],
        end_at: dateRange.value[1]
      }
    });
    if (sequence !== requestSeq) return;

    trend.value = error ? null : (data?.trend_list?.[0] ?? null);
    if (error) window.$message?.error('上报历史获取失败');
  } finally {
    if (sequence === requestSeq) loading.value = false;
  }
}

function handleRefresh() {
  dateRange.value = createRecentHourDateRange();
  getHistoryData();
}

function handleDateRangeUpdate(value: [string, string] | null) {
  if (!value) return;

  dateRange.value = [Number(value[0]), Number(value[1])];
  getHistoryData();
}

watch(
  () => props.physicalPoint.key,
  () => {
    trend.value = null;
    if (props.physicalPoint.key) getHistoryData();
  },
  { immediate: true }
);

watch(
  [rows, reportViewMode, isNumberDataType],
  () => {
    if (isNumberDataType.value && reportViewMode.value === 'chart') {
      updateChartOptions(() => createChartOptions());
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="h-full min-h-0 flex-col-stretch gap-12px">
    <div class="flex shrink-0 flex-wrap items-center justify-between gap-12px">
      <div class="flex flex-wrap items-center gap-8px">
        <span class="shrink-0 text-14px text-[var(--n-text-color-2)]">时间范围</span>
        <NDatePicker
          :formatted-value="dateRangeFormattedValue"
          type="datetimerange"
          value-format="t"
          :clearable="false"
          :default-time="['00:00:00', '23:59:59']"
          class="max-w-full lt-sm:w-full"
          @update:formatted-value="value => handleDateRangeUpdate(value as [string, string] | null)"
        />
        <NButton type="primary" :loading="loading" :disabled="!canQuery" @click="handleRefresh">
          <template #icon>
            <SvgIcon icon="material-symbols:refresh-rounded" />
          </template>
          刷新
        </NButton>
      </div>

      <NButtonGroup v-if="isNumberDataType">
        <NTooltip>
          <template #trigger>
            <NButton
              :type="reportViewMode === 'chart' ? 'primary' : 'default'"
              circle
              @click="reportViewMode = 'chart'"
            >
              <template #icon>
                <SvgIcon icon="material-symbols:show-chart-rounded" />
              </template>
            </NButton>
          </template>
          图表视图
        </NTooltip>
        <NTooltip>
          <template #trigger>
            <NButton
              :type="reportViewMode === 'table' ? 'primary' : 'default'"
              circle
              @click="reportViewMode = 'table'"
            >
              <template #icon>
                <SvgIcon icon="material-symbols:grid-view-rounded" />
              </template>
            </NButton>
          </template>
          表格视图
        </NTooltip>
      </NButtonGroup>
    </div>

    <NSpin :show="loading" class="report-history-body min-h-0 flex-1">
      <div v-if="isNumberDataType" v-show="reportViewMode === 'chart'" class="relative h-full min-h-0">
        <div ref="chartRef" class="h-full min-h-320px w-full"></div>
        <NEmpty
          v-if="!rows.length && !loading"
          description="暂无上报历史"
          class="absolute inset-0 flex items-center justify-center"
        />
      </div>
      <NDataTable
        v-show="!isNumberDataType || reportViewMode === 'table'"
        :columns="columns"
        :data="rows"
        :loading="loading"
        :row-key="row => row.id"
        flex-height
        max-height="100%"
        striped
        virtual-scroll
        class="h-full"
      />
    </NSpin>
  </div>
</template>

<style scoped>
.report-history-body :deep(.n-spin-content),
.report-history-body :deep(.n-spin-container) {
  height: 100%;
}
</style>
