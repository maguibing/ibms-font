<script setup lang="ts">
import { computed, watch } from 'vue';
import type { ECOption } from '@/hooks/common/echarts';
import { useEcharts } from '@/hooks/common/echarts';
import { formatTimeLabel, normalizeTrendList } from './point-compare-utils';

defineOptions({
  name: 'PointCompareTrendChart'
});

const props = defineProps<{
  trendList: Api.Device.DevicePointHistoryTrend[];
  statType: number;
  loading: boolean;
}>();

const emit = defineEmits<{
  drill: [timestamp: number];
}>();

const colors = [
  '#2080f0',
  '#18a058',
  '#f0a020',
  '#d03050',
  '#8a2be2',
  '#13c2c2',
  '#fa8c16',
  '#eb2f96',
  '#52c41a',
  '#722ed1'
];
const normalizedTrends = computed(() => normalizeTrendList(props.trendList));
const timestamps = computed(() =>
  Array.from(new Set(normalizedTrends.value.flatMap(item => Array.from(item.values.keys())))).sort((a, b) => a - b)
);
const { domRef, chart, updateOptions } = useEcharts(createOptions);

function createOptions(): ECOption {
  const showZoom = timestamps.value.length > 12;
  const legendData = normalizedTrends.value.map(item => item.name);
  const axisUnits = Array.from(new Set(normalizedTrends.value.map(item => item.unit)));
  const axisLayouts = axisUnits.map((unit, index) => ({
    unit,
    position: index % 2 === 0 ? ('left' as const) : ('right' as const),
    offset: Math.floor(index / 2) * 88
  }));

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' }
    },
    legend: {
      data: legendData,
      top: 8,
      type: 'scroll'
    },
    grid: {
      top: 58,
      right: 16,
      bottom: showZoom ? 80 : 48,
      left: 16,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timestamps.value.map(timestamp => formatTimeLabel(timestamp, props.statType)),
      axisLabel: {
        hideOverlap: true,
        rotate: showZoom ? 30 : 0
      }
    },
    yAxis: axisLayouts.length
      ? axisLayouts.map(({ unit, position, offset }, index) => {
          const colorIndex = normalizedTrends.value.findIndex(item => item.unit === unit);

          return {
            type: 'value',
            name: unit,
            position,
            offset,
            axisLine: {
              show: true,
              lineStyle: { color: colors[colorIndex % colors.length] }
            },
            axisLabel: {
              color: colors[colorIndex % colors.length],
              margin: 12
            },
            splitLine: {
              show: index === 0,
              lineStyle: { type: 'dashed' }
            }
          };
        })
      : { type: 'value' },
    series: normalizedTrends.value.map((item, index) => ({
      name: item.name,
      type: 'line',
      yAxisIndex: axisUnits.indexOf(item.unit),
      data: timestamps.value.map(timestamp => item.values.get(timestamp) ?? null),
      smooth: true,
      connectNulls: true,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: colors[index % colors.length] },
      lineStyle: { width: 2 }
    })),
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

watch(
  () => [props.trendList, props.statType],
  () => updateOptions(() => createOptions()),
  { deep: true, immediate: true }
);

watch(
  chart,
  instance => {
    if (!instance) return;

    instance.off('click');
    instance.on('click', params => {
      const timestamp = timestamps.value[params.dataIndex];
      if (timestamp) emit('drill', timestamp);
    });
  },
  { immediate: true }
);
</script>

<template>
  <NSpin :show="loading" class="h-full">
    <div ref="domRef" class="h-full min-h-360px w-full"></div>
  </NSpin>
</template>

<style scoped>
:deep(.n-spin-content),
:deep(.n-spin-container) {
  height: 100%;
}
</style>
