<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue';
import { MessageType, RealTimeType } from '@/enum/business';
import type { ECOption } from '@/hooks/common/echarts';
import { useEcharts } from '@/hooks/common/echarts';
import { useAppStore } from '@/store/modules/app';
import { displayValue, formatUnixDateTime } from '@/utils/common-methods';
import { addWebSocketMessageListener, decodeWebSocketPayload } from '@/utils/websocket';

defineOptions({
  name: 'PhysicalPointRealtimeDataPanel'
});

type RealtimePayload = {
  project_id?: number;
  connection_id?: string;
  real_time_type?: RealTimeType;
  point_vals?: RealtimePointValue[];
};

type RealtimePointValue = Api.Device.PhysicalPointCurrentValue & {
  meta?: Record<string, unknown>;
};

type RealtimeDataRow = {
  timestamp: number;
  time: string;
  valueText: string;
  numericValue: number | null;
  unit: string;
};

interface Props {
  physicalPoint: Api.Device.PhysicalPoint;
}

const SECOND_MILLISECONDS = 1000;

const props = defineProps<Props>();
const appStore = useAppStore();

const latestRow = shallowRef<RealtimeDataRow | null>(null);
const isNumberDataType = computed(() => Number(props.physicalPoint.data_type) === 1);
const unit = computed(() => latestRow.value?.unit ?? '');
const chartXAxisData: string[] = [];
const chartSeriesData: Array<number | null> = [];
const {
  domRef: chartRef,
  chart,
  setOptions
} = useEcharts(createChartOptions, {
  onRender: () => {}
});

function getPointRawValue(value: RealtimePointValue) {
  return (
    value.num_val?.value ??
    value.switch_val?.alias ??
    value.switch_val?.value ??
    value.str_val?.value ??
    value.enum_val?.alias ??
    value.enum_val?.value
  );
}

function getPointUnit(value: RealtimePointValue) {
  const pointUnit = value.num_val?.unit ?? value.switch_val?.unit ?? value.str_val?.unit ?? value.enum_val?.unit;

  return typeof pointUnit === 'string' ? pointUnit : '';
}

function getPointNumericValue(value: RealtimePointValue) {
  const rawValue = value.num_val?.value;
  if (rawValue === undefined || rawValue === null) return null;

  const numericValue = Number(rawValue);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatRealtimeValue(value: RealtimePointValue) {
  const pointUnit = getPointUnit(value);
  const text = displayValue(getPointRawValue(value));

  return pointUnit && text !== '-' ? `${text} ${pointUnit}` : text;
}

function isCurrentPhysicalPoint(value: RealtimePointValue) {
  return String(value.physical_point?.key ?? '') === String(props.physicalPoint.key);
}

function createRealtimeRow(value: RealtimePointValue): RealtimeDataRow {
  const timestamp = Number(value.ts) || Math.floor(Date.now() / SECOND_MILLISECONDS);

  return {
    timestamp,
    time: formatUnixDateTime(timestamp),
    valueText: formatRealtimeValue(value),
    numericValue: getPointNumericValue(value),
    unit: getPointUnit(value)
  };
}

function createDataZoomOptions() {
  const showZoom = chartXAxisData.length > 30;

  return [
    { type: 'inside' as const, start: 0, end: 100 },
    {
      type: 'slider' as const,
      show: showZoom,
      height: 20,
      bottom: 10,
      showDetail: false,
      brushSelect: false,
      start: 0,
      end: 100
    }
  ];
}

function appendChartPoint(row: RealtimeDataRow) {
  if (!isNumberDataType.value) return;

  chartXAxisData.push(row.time);
  chartSeriesData.push(row.numericValue);

  if (!chart.value) return;

  chart.value.setOption(
    {
      xAxis: { data: chartXAxisData },
      yAxis: { name: row.unit },
      dataZoom: createDataZoomOptions()
    },
    false,
    true
  );
  chart.value.appendData({
    seriesIndex: 0,
    data: [row.numericValue]
  });
}

function appendRealtimeRows(data: RealtimePointValue[]) {
  data.filter(isCurrentPhysicalPoint).forEach(value => {
    const row = createRealtimeRow(value);

    latestRow.value = row;
    appendChartPoint(row);
  });
}

function handleRealtimeMessage(message: { payload?: string }) {
  const payload = decodeWebSocketPayload<RealtimePayload>(message.payload);
  if (!payload || payload.real_time_type !== RealTimeType.Push) return;
  if (payload.project_id !== undefined && Number(payload.project_id) !== Number(props.physicalPoint.project_id)) return;

  appendRealtimeRows(payload.point_vals ?? []);
}

function createChartOptions(): ECOption {
  const showZoom = chartXAxisData.length > 30;

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
      data: chartXAxisData,
      axisLabel: {
        hideOverlap: true,
        rotate: chartXAxisData.length > 30 ? 30 : 0
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
        name: props.physicalPoint.name || '实时值',
        type: 'line',
        data: chartSeriesData,
        smooth: true,
        connectNulls: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { width: 2 }
      }
    ],
    dataZoom: createDataZoomOptions()
  };
}

function resetRealtimeData() {
  latestRow.value = null;
  chartXAxisData.length = 0;
  chartSeriesData.length = 0;
  setOptions(createChartOptions());
}

const removeRealtimeMessageListener = addWebSocketMessageListener(
  MessageType.DevicePointRealTimeData,
  handleRealtimeMessage
);

watch(
  () => props.physicalPoint.key,
  () => {
    resetRealtimeData();
  }
);

watch(
  chart,
  instance => {
    if (instance) setOptions(createChartOptions());
  },
  { immediate: true }
);

onBeforeUnmount(removeRealtimeMessageListener);
</script>

<template>
  <div class="h-full min-h-0 flex-col-stretch gap-12px">
    <NDescriptions :column="appStore.isMobile ? 1 : 2" bordered size="small" label-placement="left" class="shrink-0">
      <NDescriptionsItem label="最新值">
        {{ latestRow?.valueText ?? '-' }}
      </NDescriptionsItem>
      <NDescriptionsItem label="上报时间">
        {{ latestRow?.time ?? '-' }}
      </NDescriptionsItem>
    </NDescriptions>

    <div v-if="isNumberDataType" class="relative min-h-0 flex-1">
      <div ref="chartRef" class="h-full min-h-260px w-full"></div>
      <NEmpty v-if="!latestRow" description="暂无实时数据" class="absolute inset-0 flex items-center justify-center" />
    </div>
  </div>
</template>
