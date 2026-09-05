<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import dayjs from 'dayjs';
import { AggType, ExportBizType, ExportFileType, StatType } from '@/enum/business';
import { $t } from '@/locales';
import { useExportProgress } from '@/hooks/business/export-progress';
import { fetchExportTask } from '@/service/api/common';
import { fetchGetDevicePointHistoryTrend } from '@/service/api/device';
import { getWebSocketConnectionId } from '@/utils/websocket';
import PointDataTable from './modules/point-data-table.vue';
import PointToolbar from './modules/point-toolbar.vue';
import PointTree from './modules/point-tree.vue';
import type { SelectedPoint } from './modules/point-tree.vue';
import PointTrendChart from './modules/point-trend-chart.vue';
import { calculateDrillTimeRange } from './modules/point-compare-utils';

defineOptions({
  name: 'EffroomPointCompare'
});

type ViewMode = 'chart' | 'table';
type DrillParams = {
  statType: number;
  startAt: number;
  endAt: number;
};

const DRILL_DOWN_MAP: Record<number, number | null> = {
  [StatType.Year]: StatType.Month,
  [StatType.Month]: StatType.Day,
  [StatType.Day]: StatType.Hour,
  [StatType.Hour]: 5,
  5: null
};

const selectedPoints = shallowRef<SelectedPoint[]>([]);
const dateRange = shallowRef<[number, number]>([dayjs().subtract(7, 'day').valueOf(), dayjs().valueOf()]);
const aggType = shallowRef<number>(AggType.Average);
const viewMode = shallowRef<ViewMode>('chart');
const loading = shallowRef(false);
const trendData = shallowRef<Api.Device.DevicePointHistoryTrendData | null>(null);
const currentStatType = shallowRef<number>(StatType.Day);
const currentDrillParams = shallowRef<DrillParams | null>(null);
const drillHistory = shallowRef<DrillParams[]>([]);
let requestSequence = 0;

const { startExport, stopExport } = useExportProgress();
const trendList = computed(() => trendData.value?.trend_list ?? []);
const hasTrendData = computed(() => trendList.value.some(item => item.point_trends?.length));
const canExport = computed(() => viewMode.value === 'table' && selectedPoints.value.length > 0);

function inferStatType([start, end]: [number, number]) {
  const duration = end - start;

  if (duration >= 366 * 24 * 60 * 60 * 1000) return StatType.Year;
  if (duration >= 62 * 24 * 60 * 60 * 1000) return StatType.Month;
  if (duration >= 2 * 24 * 60 * 60 * 1000) return StatType.Day;

  return StatType.Hour;
}

function buildRequestParams(): Api.Device.DevicePointHistoryParams {
  const drillParams = currentDrillParams.value;

  return {
    agg_type: aggType.value,
    logic_point_key_list: selectedPoints.value.map(point => point.key),
    stat_type: drillParams?.statType ?? inferStatType(dateRange.value),
    time_range: drillParams
      ? { start_at: drillParams.startAt, end_at: drillParams.endAt }
      : {
          start_at: dayjs(dateRange.value[0]).unix(),
          end_at: dayjs(dateRange.value[1]).unix()
        }
  };
}

async function getTrendData() {
  if (!selectedPoints.value.length) return;

  const sequence = ++requestSequence;
  const requestParams = buildRequestParams();
  loading.value = true;

  try {
    const { data, error } = await fetchGetDevicePointHistoryTrend(requestParams);
    if (sequence !== requestSequence) return;

    trendData.value = error ? null : data;
    currentStatType.value = data?.stat_type ?? requestParams.stat_type;

    if (error) window.$message?.error($t('effroom.trendFetchFailed'));
    else if (!data?.trend_list?.some(item => item.point_trends?.length))
      window.$message?.warning($t('effroom.noDataForCondition'));
  } finally {
    if (sequence === requestSequence) loading.value = false;
  }
}

function resetDrillState() {
  drillHistory.value = [];
  currentDrillParams.value = null;
}

function handleDateRangeUpdate(value: [number, number]) {
  dateRange.value = value;
  resetDrillState();
  getTrendData();
}

function handleRefresh() {
  dateRange.value = [dayjs().subtract(7, 'day').valueOf(), dayjs().valueOf()];
  resetDrillState();
  getTrendData();
}

async function handleExport() {
  const connectionId = getWebSocketConnectionId();
  if (!connectionId) {
    window.$message?.warning($t('effroom.websocketWarning'));
    return;
  }

  startExport($t('effroom.pointCompare'));

  const { error } = await fetchExportTask({
    connection_id: connectionId,
    export_biz_type: ExportBizType.DevicePointTrend,
    file_type: ExportFileType.Excel,
    list_option: {},
    device_point_trend: buildRequestParams()
  });

  if (error) {
    stopExport();
    return;
  }

  window.$message?.success($t('effroom.exportSubmitted'));
}

function handleDrill(timestamp: number) {
  const nextStatType = DRILL_DOWN_MAP[currentStatType.value];
  if (nextStatType === null || nextStatType === undefined) {
    window.$message?.info($t('effroom.finestGranularity'));
    return;
  }

  const timeRange = calculateDrillTimeRange(timestamp, currentStatType.value);
  if (!timeRange) return;

  const currentParams = currentDrillParams.value ?? {
    statType: currentStatType.value,
    startAt: dayjs(dateRange.value[0]).unix(),
    endAt: dayjs(dateRange.value[1]).unix()
  };
  drillHistory.value = [...drillHistory.value, currentParams];
  currentDrillParams.value = {
    statType: nextStatType,
    startAt: timeRange.startAt,
    endAt: timeRange.endAt
  };
  getTrendData();
}

function handleDrillBack() {
  const history = [...drillHistory.value];
  const previousParams = history.pop();
  if (!previousParams) return;

  drillHistory.value = history;
  currentDrillParams.value = history.length ? previousParams : null;
  getTrendData();
}

watch(
  selectedPoints,
  points => {
    resetDrillState();

    if (points.length) {
      getTrendData();
    } else {
      requestSequence += 1;
      loading.value = false;
      trendData.value = null;
      viewMode.value = 'chart';
    }
  },
  { deep: true }
);
</script>

<template>
  <TableSiderLayout :sider-title="$t('effroom.pointSelection')" default-expanded class="point-compare-page">
    <template #sider>
      <PointTree v-model:selected-points="selectedPoints" />
    </template>

    <NCard
      :bordered="false"
      size="small"
      class="card-wrapper h-full min-w-0 flex-1"
      :content-style="{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }"
    >
      <PointToolbar
        :date-range="dateRange"
        :agg-type="aggType"
        :view-mode="viewMode"
        :loading="loading"
        :can-query="selectedPoints.length > 0"
        :can-export="canExport"
        :can-drill-back="drillHistory.length > 0"
        @update-date-range="handleDateRangeUpdate"
        @update-agg-type="aggType = $event"
        @update-view-mode="viewMode = $event"
        @query="getTrendData"
        @refresh="handleRefresh"
        @export="handleExport"
        @drill-back="handleDrillBack"
      />

      <div class="mt-16px min-h-0 flex-1 overflow-hidden">
        <NEmpty
          v-if="selectedPoints.length === 0"
          :description="$t('effroom.selectPointsHint')"
          class="h-full justify-center"
        />
        <NEmpty
          v-else-if="!hasTrendData && !loading"
          :description="$t('effroom.noDataForCondition')"
          class="h-full justify-center"
        />
        <PointTrendChart
          v-else-if="viewMode === 'chart'"
          :trend-list="trendList"
          :stat-type="currentStatType"
          :loading="loading"
          @drill="handleDrill"
        />
        <PointDataTable v-else :trend-list="trendList" />
      </div>
    </NCard>
  </TableSiderLayout>
</template>

<style scoped>
.point-compare-page {
  height: calc(100vh - 142px - var(--calc-footer-height, 0px));
}
</style>
