<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import dayjs from 'dayjs';
import type { DataTableColumns } from 'naive-ui';
import { fetchGetDevicePointHistoryTrend } from '@/service/api/device';
import { displayValue, formatUnixDateTime } from '@/utils/common-methods';
import { virtualPointComputeModeMap } from '../virtual-point';

defineOptions({ name: 'VirtualPointHistoryModal' });

type HistoryLogicPoint = Pick<Api.Device.LogicPoint, 'id' | 'name' | 'key'>;
type HistoryPhysicalPoint = Pick<Api.Device.PhysicalPoint, 'id' | 'name' | 'key' | 'is_storage'>;
type HistoryTableRow = {
  id: string;
  time: string;
  value: string;
};

interface Props {
  row?: Api.Device.VirtualPoint | null;
  logicPoint?: HistoryLogicPoint;
  physicalPoint?: HistoryPhysicalPoint;
}

const HISTORY_STAT_TYPE = 5;

const props = defineProps<Props>();
const visible = defineModel<boolean>('visible', { default: false });

const loading = shallowRef(false);
const dateRange = shallowRef<[number, number]>(createDefaultDateRange());
const trend = shallowRef<Api.Device.DevicePointHistoryTrend | null>(null);
let requestSequence = 0;

const computeModeLabel = computed(() => virtualPointComputeModeMap[props.row?.compute_mode ?? 0] ?? '-');
const isStored = computed(() => Boolean(props.physicalPoint?.is_storage));
const canQuery = computed(() => Boolean(props.physicalPoint?.key && dateRange.value.length === 2));
const tableData = computed<HistoryTableRow[]>(() =>
  (trend.value?.point_trends ?? []).map((item, index) => ({
    id: `${item.ts ?? 'empty'}-${index}`,
    time: formatUnixDateTime(item.ts),
    value: formatTrendValue(item)
  }))
);
const columns: DataTableColumns<HistoryTableRow> = [
  {
    key: 'time',
    title: '时间',
    align: 'center',
    width: 180
  },
  {
    key: 'value',
    title: '数值',
    align: 'center',
    ellipsis: { tooltip: true }
  }
];
const shortcuts = {
  '近 1 小时': () => createDefaultDateRange(),
  '近 1 天': () => [dayjs().subtract(1, 'day').valueOf(), dayjs().valueOf()] as [number, number],
  '近 7 天': () => [dayjs().subtract(7, 'day').valueOf(), dayjs().valueOf()] as [number, number]
};

/** 默认查询最近一小时历史记录。 */
function createDefaultDateRange(): [number, number] {
  return [dayjs().subtract(1, 'hour').valueOf(), dayjs().valueOf()];
}

/** 兼容不同数据类型的历史值展示。 */
function formatTrendValue(value: Api.Device.DevicePointHistoryValue) {
  const pointValue =
    value.num_val?.value ??
    value.switch_val?.alias ??
    value.switch_val?.value ??
    value.str_val?.value ??
    value.enum_val?.alias ??
    value.enum_val?.value;
  const unit = value.num_val?.unit ?? value.switch_val?.unit ?? value.str_val?.unit ?? value.enum_val?.unit ?? '';
  const text = displayValue(pointValue);

  return unit && text !== '-' ? `${text} ${unit}` : text;
}

/** 重置时间和历史数据，避免打开不同点位时显示旧数据。 */
function reset() {
  dateRange.value = createDefaultDateRange();
  trend.value = null;
}

/** 选择时间范围后立即按新范围请求历史数据。 */
function handleDateRangeUpdate(value: [number, number] | null) {
  if (!value) return;

  dateRange.value = value;
  getHistoryData();
}

/** 刷新最新一小时历史数据。 */
function handleRefresh() {
  dateRange.value = createDefaultDateRange();
  getHistoryData();
}

/** 根据当前物理点标识和时间范围获取历史趋势。 */
async function getHistoryData() {
  const physicalPointKey = props.physicalPoint?.key;
  if (!physicalPointKey) {
    window.$message?.warning('缺少物理点标识，无法获取历史数据');
    return;
  }

  const sequence = ++requestSequence;
  loading.value = true;
  try {
    const { data, error } = await fetchGetDevicePointHistoryTrend({
      physical_point_key_list: [physicalPointKey],
      stat_type: HISTORY_STAT_TYPE,
      time_range: {
        start_at: dayjs(dateRange.value[0]).unix(),
        end_at: dayjs(dateRange.value[1]).unix()
      }
    });
    if (sequence !== requestSequence) return;

    trend.value = error ? null : (data?.trend_list?.[0] ?? null);
    if (error) window.$message?.error('历史数据获取失败');
  } finally {
    if (sequence === requestSequence) loading.value = false;
  }
}

watch(visible, show => {
  if (!show) return;
  reset();
  getHistoryData();
});
</script>

<template>
  <NModal v-model:show="visible" preset="card" title="历史记录" class="w-920px max-w-95%">
    <div class="flex flex-col gap-16px">
      <NDescriptions label-placement="left" bordered :column="2" size="small">
        <NDescriptionsItem label="逻辑点名称">
          {{ displayValue(logicPoint?.name) }}
        </NDescriptionsItem>
        <NDescriptionsItem label="逻辑点标识">
          {{ displayValue(logicPoint?.key) }}
        </NDescriptionsItem>
        <NDescriptionsItem label="是否存储">
          <NTag :type="isStored ? 'success' : 'default'" :bordered="false">
            {{ isStored ? '是' : '否' }}
          </NTag>
        </NDescriptionsItem>
        <NDescriptionsItem label="计算方式">
          <NTag type="info" :bordered="false">{{ computeModeLabel }}</NTag>
        </NDescriptionsItem>
      </NDescriptions>

      <div class="flex flex-wrap items-center gap-12px">
        <span class="shrink-0 text-14px text-[var(--n-text-color-2)]">时间范围</span>
        <NDatePicker
          :value="dateRange"
          type="datetimerange"
          :clearable="false"
          :shortcuts="shortcuts"
          :default-time="['00:00:00', '23:59:59']"
          class="min-w-300px flex-1 lt-sm:w-full"
          @update:value="value => handleDateRangeUpdate(value as [number, number] | null)"
        />
        <NButton type="primary" :loading="loading" :disabled="!canQuery" @click="handleRefresh">刷新</NButton>
      </div>

      <NDataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :row-key="row => row.id"
        :max-height="360"
        size="small"
        striped
        virtual-scroll
      />
    </div>
  </NModal>
</template>

<style scoped></style>
