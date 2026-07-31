<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue';
import dayjs from 'dayjs';
import type { DatePickerProps, SelectOption } from 'naive-ui';
import { AggType, StatType } from '@/enum/business';
import { fetchGetDevicePointHistoryStat, fetchGetDevicePointHistoryTrend } from '@/service/api/device';
import { buildOverviewStats, buildTrendChartData, OVERVIEW_POINT_KEYS } from './modules/overview-data';
import OverviewSummary from './modules/overview-summary.vue';
import OverviewToolbar from './modules/overview-toolbar.vue';
import OverviewTrendChart from './modules/overview-trend-chart.vue';

defineOptions({
  name: 'EffroomOverview'
});

type DateRange = [number, number];

const STAT_TYPE_CONFIG: Record<
  StatType,
  { unit: dayjs.ManipulateType; pickerType: DatePickerProps['type']; pickerFormat: string; trendFormat: string }
> = {
  [StatType.Hour]: {
    unit: 'hour',
    pickerType: 'datetimerange',
    pickerFormat: 'yyyy-MM-dd HH:mm',
    trendFormat: 'YYYY-MM-DD HH:mm'
  },
  [StatType.Day]: { unit: 'day', pickerType: 'daterange', pickerFormat: 'yyyy-MM-dd', trendFormat: 'YYYY-MM-DD' },
  [StatType.Month]: { unit: 'month', pickerType: 'monthrange', pickerFormat: 'yyyy-MM', trendFormat: 'YYYY-MM' },
  [StatType.Year]: { unit: 'year', pickerType: 'yearrange', pickerFormat: 'yyyy', trendFormat: 'YYYY' }
};

const STAT_TYPE_OPTIONS: SelectOption[] = [
  { label: '小时', value: StatType.Hour },
  { label: '日', value: StatType.Day },
  { label: '月', value: StatType.Month },
  { label: '年', value: StatType.Year }
];
const AGG_TYPE_OPTIONS: SelectOption[] = [
  { label: '末值', value: AggType.Last },
  { label: '平均值', value: AggType.Average },
  { label: '差值', value: AggType.Difference },
  { label: '首值', value: AggType.First }
];

const statType = shallowRef(StatType.Hour);
const aggType = shallowRef(AggType.Average);
const dateRange = shallowRef<DateRange>(createDateRange(statType.value));
const summaryLoading = shallowRef(false);
const trendLoading = shallowRef(false);
const statData = shallowRef<Api.Device.DevicePointHistoryStatData | null>(null);
const trendData = shallowRef<Api.Device.DevicePointHistoryTrendData | null>(null);
const trendStatType = shallowRef<StatType>(statType.value);

const datePickerType = computed(() => STAT_TYPE_CONFIG[statType.value].pickerType);
const dateFormat = computed(() => STAT_TYPE_CONFIG[statType.value].pickerFormat);
const summaryItems = computed(() => buildOverviewStats(statData.value?.device_point_stat?.point_vals ?? []));
const chartData = computed(() =>
  buildTrendChartData(trendData.value?.trend_list ?? [], timestamp =>
    dayjs.unix(timestamp).format(STAT_TYPE_CONFIG[trendStatType.value].trendFormat)
  )
);

function createDateRange(type: StatType): DateRange {
  const now = dayjs();

  if (type === StatType.Hour) return [now.subtract(24, 'hour').startOf('hour').valueOf(), now.endOf('hour').valueOf()];
  if (type === StatType.Month)
    return [now.subtract(5, 'month').startOf('month').valueOf(), now.endOf('month').valueOf()];
  if (type === StatType.Year) return [now.subtract(1, 'year').startOf('year').valueOf(), now.endOf('year').valueOf()];

  return [now.subtract(7, 'day').startOf('day').valueOf(), now.endOf('day').valueOf()];
}

function buildTimeRange() {
  const unit = STAT_TYPE_CONFIG[statType.value].unit;

  return {
    start_at: dayjs(dateRange.value[0]).startOf(unit).unix(),
    end_at: dayjs(dateRange.value[1]).endOf(unit).unix()
  };
}

async function getSummaryData() {
  const endAt = dayjs();
  summaryLoading.value = true;

  try {
    const { data, error } = await fetchGetDevicePointHistoryStat({
      agg_type: AggType.Average,
      logic_point_key_list: [...OVERVIEW_POINT_KEYS],
      stat_type: StatType.Day,
      time_range: {
        start_at: endAt.subtract(2, 'day').unix(),
        end_at: endAt.unix()
      }
    });

    statData.value = error ? null : data;
  } finally {
    summaryLoading.value = false;
  }
}

async function getTrendData() {
  const requestStatType = statType.value;
  trendLoading.value = true;

  try {
    const { data, error } = await fetchGetDevicePointHistoryTrend({
      agg_type: aggType.value,
      logic_point_key_list: [...OVERVIEW_POINT_KEYS],
      stat_type: requestStatType,
      time_range: buildTimeRange()
    });

    trendData.value = error ? null : data;
    trendStatType.value = requestStatType;
  } finally {
    trendLoading.value = false;
  }
}

function handleStatTypeUpdate(value: number) {
  statType.value = value as StatType;
  dateRange.value = createDateRange(statType.value);
}

function handleAggTypeUpdate(value: number) {
  aggType.value = value as AggType;
}

onMounted(() => {
  getSummaryData();
  getTrendData();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-auto">
    <div class="flex items-center gap-10px">
      <span class="h-22px w-4px rounded-full bg-[rgb(var(--primary-color))]"></span>
      <h2 class="m-0 text-20px text-[var(--n-text-color)] font-600">数据概览</h2>
    </div>

    <OverviewSummary :items="summaryItems" :loading="summaryLoading" />

    <OverviewToolbar
      :stat-type="statType"
      :date-range="dateRange"
      :agg-type="aggType"
      :stat-type-options="STAT_TYPE_OPTIONS"
      :agg-type-options="AGG_TYPE_OPTIONS"
      :date-picker-type="datePickerType"
      :date-format="dateFormat"
      :loading="trendLoading"
      @update-stat-type="handleStatTypeUpdate"
      @update-date-range="dateRange = $event"
      @update-agg-type="handleAggTypeUpdate"
      @execute="getTrendData"
    />

    <div class="grid grid-cols-2 gap-16px lt-lg:grid-cols-1">
      <OverviewTrendChart
        title="总能耗"
        icon="material-symbols:electric-bolt-outline-rounded"
        color="#2080f0"
        :data="chartData.electricity"
        :loading="trendLoading"
      />
      <OverviewTrendChart
        title="总冷量"
        icon="material-symbols:ac-unit-rounded"
        color="#18a058"
        :data="chartData.cooling"
        :loading="trendLoading"
        show-cop
      />
    </div>
  </div>
</template>
