<script setup lang="ts">
import dayjs from 'dayjs';
import { AGG_TYPE_OPTIONS } from '@/constants/business';
import { $t } from '@/locales';

defineOptions({
  name: 'PointCompareToolbar'
});

defineProps<{
  dateRange: [number, number];
  aggType: number;
  viewMode: 'chart' | 'table';
  loading: boolean;
  canQuery: boolean;
  canExport: boolean;
  canDrillBack: boolean;
}>();

const emit = defineEmits<{
  updateDateRange: [value: [number, number]];
  updateAggType: [value: number];
  updateViewMode: [value: 'chart' | 'table'];
  query: [];
  refresh: [];
  export: [];
  drillBack: [];
}>();

const shortcuts = {
  [$t('effroom.recentHour')]: () => [dayjs().subtract(1, 'hour').valueOf(), dayjs().valueOf()] as [number, number],
  [$t('effroom.recentDay')]: () => [dayjs().subtract(1, 'day').valueOf(), dayjs().valueOf()] as [number, number],
  [$t('effroom.recent7Days')]: () => [dayjs().subtract(7, 'day').valueOf(), dayjs().valueOf()] as [number, number],
  [$t('effroom.recentMonth')]: () => [dayjs().subtract(1, 'month').valueOf(), dayjs().valueOf()] as [number, number],
  [$t('effroom.recent3Months')]: () => [dayjs().subtract(3, 'month').valueOf(), dayjs().valueOf()] as [number, number],
  [$t('effroom.recentYear')]: () => [dayjs().subtract(1, 'year').valueOf(), dayjs().valueOf()] as [number, number]
};
</script>

<template>
  <div class="flex flex-wrap items-center gap-12px">
    <div class="min-w-280px flex flex-1 items-center gap-8px lt-sm:w-full lt-sm:flex-wrap">
      <span class="shrink-0 text-14px text-[var(--n-text-color-2)]">{{ $t('effroom.timeRange') }}</span>
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
      <span class="shrink-0 text-14px text-[var(--n-text-color-2)]">{{ $t('effroom.valueMethod') }}</span>
      <NSelect
        :value="aggType"
        :options="AGG_TYPE_OPTIONS"
        class="w-120px"
        @update:value="value => emit('updateAggType', Number(value))"
      />
    </div>

    <NSpace :wrap="false" size="small">
      <NButton type="primary" :disabled="!canQuery" :loading="loading" @click="emit('query')">
        <template #icon><SvgIcon icon="material-symbols:search-rounded" /></template>
        {{ $t('effroom.query') }}
      </NButton>
      <NButton :disabled="!canQuery" @click="emit('refresh')">
        <template #icon><SvgIcon icon="material-symbols:refresh-rounded" /></template>
        {{ $t('effroom.refresh') }}
      </NButton>
      <NButton v-if="canDrillBack" type="warning" @click="emit('drillBack')">
        <template #icon><SvgIcon icon="material-symbols:arrow-back-rounded" /></template>
        {{ $t('effroom.back') }}
      </NButton>
      <NButton v-if="viewMode === 'table'" :disabled="!canExport" @click="emit('export')">
        <template #icon><SvgIcon icon="material-symbols:download-rounded" /></template>
        {{ $t('effroom.export') }}
      </NButton>
    </NSpace>

    <NButtonGroup class="ml-auto">
      <NTooltip>
        <template #trigger>
          <NButton :type="viewMode === 'chart' ? 'primary' : 'default'" circle @click="emit('updateViewMode', 'chart')">
            <template #icon><SvgIcon icon="material-symbols:show-chart-rounded" /></template>
          </NButton>
        </template>
        {{ $t('effroom.chartView') }}
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
        {{ $t('effroom.tableView') }}
      </NTooltip>
    </NButtonGroup>
  </div>
</template>
