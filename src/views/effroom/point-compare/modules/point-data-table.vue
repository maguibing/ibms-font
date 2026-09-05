<script setup lang="ts">
import { computed, h } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import { $t } from '@/locales';
import { buildComparisonTable } from './point-compare-utils';
import type { ComparisonRow } from './point-compare-utils';

defineOptions({
  name: 'PointCompareDataTable'
});

const props = defineProps<{
  trendList: Api.Device.DevicePointHistoryTrend[];
}>();

const table = computed(() => buildComparisonTable(props.trendList));
const columns = computed<DataTableColumns<ComparisonRow>>(() => [
  {
    key: 'formattedTime',
    title: $t('effroom.time'),
    width: 190,
    fixed: 'left',
    align: 'center'
  },
  ...table.value.columns.map(column => ({
    key: column.key,
    title: column.title,
    width: 160,
    align: 'center' as const,
    render: (row: ComparisonRow) => {
      const value = row[column.key];
      if (value === null) return '-';

      return h('span', [
        String(value),
        column.unit ? h('span', { class: 'ml-4px text-12px text-[var(--n-text-color-3)]' }, column.unit) : null
      ]);
    }
  }))
]);
const scrollX = computed(() => 190 + table.value.columns.length * 160);
</script>

<template>
  <NDataTable
    :columns="columns"
    :data="table.rows"
    :scroll-x="scrollX"
    :row-key="row => row.timestamp"
    flex-height
    striped
    class="h-full"
  />
</template>
