<script setup lang="ts">
import dayjs from 'dayjs';
import type { SelectOption } from 'naive-ui';
import { AggType } from '@/enum/business';

defineOptions({
  name: 'PointCompareToolbar'
});

defineProps<{
  dateRange: [number, number];
  aggType: number;
  viewMode: 'chart' | 'table';
  loading: boolean;
  canQuery: boolean;
  canDrillBack: boolean;
}>();

const emit = defineEmits<{
  updateDateRange: [value: [number, number]];
  updateAggType: [value: number];
  updateViewMode: [value: 'chart' | 'table'];
  query: [];
  refresh: [];
  drillBack: [];
}>();

const aggTypeOptions: SelectOption[] = [
  { label: '平均值', value: AggType.Average },
  { label: '差值', value: AggType.Difference },
  { label: '首值', value: AggType.First },
  { label: '末值', value: AggType.Last }
];
const shortcuts = {
  '近 1 小时': () => [dayjs().subtract(1, 'hour').valueOf(), dayjs().valueOf()] as [number, number],
  '近 1 天': () => [dayjs().subtract(1, 'day').valueOf(), dayjs().valueOf()] as [number, number],
  '近 7 天': () => [dayjs().subtract(7, 'day').valueOf(), dayjs().valueOf()] as [number, number],
  '近 1 个月': () => [dayjs().subtract(1, 'month').valueOf(), dayjs().valueOf()] as [number, number],
  '近 3 个月': () => [dayjs().subtract(3, 'month').valueOf(), dayjs().valueOf()] as [number, number],
  '近 1 年': () => [dayjs().subtract(1, 'year').valueOf(), dayjs().valueOf()] as [number, number]
};
</script>

<template>
  <div class="flex flex-wrap items-center gap-12px">
    <div class="min-w-280px flex flex-1 items-center gap-8px lt-sm:w-full lt-sm:flex-wrap">
      <span class="shrink-0 text-14px text-[var(--n-text-color-2)]">时间范围</span>
      <NDatePicker
        :value="dateRange"
        type="datetimerange"
        :clearable="false"
        :shortcuts="shortcuts"
        :default-time="['00:00:00', '23:59:59']"
        class="min-w-260px flex-1 lt-sm:w-full"
        @update:value="value => value && emit('updateDateRange', value as [number, number])"
      />
    </div>

    <div class="flex items-center gap-8px">
      <span class="shrink-0 text-14px text-[var(--n-text-color-2)]">取值方式</span>
      <NSelect
        :value="aggType"
        :options="aggTypeOptions"
        class="w-120px"
        @update:value="value => emit('updateAggType', Number(value))"
      />
    </div>

    <NSpace :wrap="false" size="small">
      <NButton type="primary" :disabled="!canQuery" :loading="loading" @click="emit('query')">
        <template #icon><SvgIcon icon="material-symbols:search-rounded" /></template>
        查询
      </NButton>
      <NButton :disabled="!canQuery" @click="emit('refresh')">
        <template #icon><SvgIcon icon="material-symbols:refresh-rounded" /></template>
        刷新
      </NButton>
      <NButton v-if="canDrillBack" type="warning" @click="emit('drillBack')">
        <template #icon><SvgIcon icon="material-symbols:arrow-back-rounded" /></template>
        返回
      </NButton>
    </NSpace>

    <NButtonGroup class="ml-auto">
      <NTooltip>
        <template #trigger>
          <NButton :type="viewMode === 'chart' ? 'primary' : 'default'" circle @click="emit('updateViewMode', 'chart')">
            <template #icon><SvgIcon icon="material-symbols:show-chart-rounded" /></template>
          </NButton>
        </template>
        图表视图
      </NTooltip>
      <NTooltip>
        <template #trigger>
          <NButton
            :type="viewMode === 'table' ? 'primary' : 'default'"
            :disabled="!canQuery"
            circle
            @click="emit('updateViewMode', 'table')"
          >
            <template #icon><SvgIcon icon="material-symbols:grid-view-rounded" /></template>
          </NButton>
        </template>
        表格视图
      </NTooltip>
    </NButtonGroup>
  </div>
</template>
