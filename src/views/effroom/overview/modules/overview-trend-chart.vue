<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from 'vue';
import type { ECOption } from '@/hooks/common/echarts';
import { useEcharts } from '@/hooks/common/echarts';
import type { OverviewChartData } from './overview-data';

defineOptions({
  name: 'OverviewTrendChart'
});

const props = defineProps<{
  title: string;
  icon: string;
  color: string;
  data: OverviewChartData;
  loading: boolean;
  showCop?: boolean;
}>();

const cardRef = useTemplateRef<HTMLElement>('cardRef');
const hasData = computed(() => props.data.xAxisData.length > 0 && props.data.seriesData.length > 0);
const { domRef, chart, updateOptions } = useEcharts(createOptions);

function createOptions(): ECOption {
  const copData = props.data.copData ?? [];
  const showCopSeries = Boolean(props.showCop && copData.some(value => value !== null));
  const series: NonNullable<ECOption['series']> = [
    {
      name: props.title,
      type: props.showCop ? 'bar' : 'line',
      data: props.data.seriesData,
      smooth: !props.showCop,
      showSymbol: !props.showCop,
      symbolSize: 6,
      barMaxWidth: 12,
      connectNulls: false,
      itemStyle: { color: props.color },
      lineStyle: { color: props.color, width: 2 }
    }
  ];

  if (showCopSeries) {
    series.push({
      name: 'COP',
      type: 'line',
      yAxisIndex: 1,
      data: copData,
      smooth: true,
      showSymbol: true,
      symbolSize: 6,
      connectNulls: false,
      itemStyle: { color: '#f0a020' },
      lineStyle: { color: '#f0a020', width: 2 }
    });
  }

  return {
    title: {
      text: '单位：kWh',
      top: 8,
      left: 8,
      textStyle: {
        fontSize: 12,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: props.showCop ? 'cross' : 'line' }
    },
    legend: {
      top: 8,
      right: 8,
      data: showCopSeries ? [props.title, 'COP'] : [props.title]
    },
    grid: {
      top: 62,
      right: showCopSeries ? 50 : 20,
      bottom: 24,
      left: 20,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.xAxisData,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        rotate: props.data.xAxisData.length > 8 ? 35 : 0
      }
    },
    yAxis: showCopSeries
      ? [
          {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { lineStyle: { type: 'dashed' } }
          },
          {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false }
          }
        ]
      : {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { type: 'dashed' } }
        },
    series
  };
}

async function toggleFullscreen() {
  if (!cardRef.value) return;

  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await cardRef.value.requestFullscreen();
  }

  await nextTick();
  chart.value?.resize();
}

watch(
  () => props.data,
  () => updateOptions(() => createOptions()),
  { deep: true, immediate: true }
);
</script>

<template>
  <section ref="cardRef" class="overview-chart min-w-0 bg-[var(--n-card-color)]">
    <NCard :bordered="false" size="small" class="card-wrapper h-full">
      <template #header>
        <div class="flex items-center gap-8px">
          <SvgIcon :icon="icon" :style="{ color }" class="text-20px" />
          <span>{{ title }}</span>
        </div>
      </template>
      <template #header-extra>
        <NTooltip>
          <template #trigger>
            <NButton quaternary circle size="small" @click="toggleFullscreen">
              <template #icon>
                <SvgIcon icon="material-symbols:fullscreen-rounded" />
              </template>
            </NButton>
          </template>
          全屏
        </NTooltip>
      </template>

      <NSpin :show="loading">
        <div ref="domRef" class="h-330px w-full overflow-hidden"></div>
        <div v-if="!loading && !hasData" class="absolute inset-0 flex-center bg-[var(--n-card-color)]">
          <NEmpty description="暂无数据" />
        </div>
      </NSpin>
    </NCard>
  </section>
</template>

<style scoped>
.overview-chart:fullscreen {
  padding: 16px;
}

.overview-chart:fullscreen :deep(.n-spin-container),
.overview-chart:fullscreen :deep(.n-spin-content) {
  height: calc(100vh - 94px);
}

.overview-chart:fullscreen :deep(.n-spin-content > div:first-child) {
  height: 100%;
}
</style>
