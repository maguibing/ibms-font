<script setup lang="ts">
import { computed } from 'vue';
import { $t } from '@/locales';
import type { DataTableColumns } from 'naive-ui';
import { formatLatency } from './shared';

interface Props {
  data: Api.System.PingData;
  elapsed?: number;
}

const props = defineProps<Props>();

const statistics = computed(() => [
  { label: $t('toolbox.ping.targetIp'), value: props.data.ip ?? '--' },
  { label: $t('toolbox.ping.minLatency'), value: formatLatency(props.data.min_latency_ms) },
  { label: $t('toolbox.ping.avgLatency'), value: formatLatency(props.data.avg_latency_ms) },
  { label: $t('toolbox.ping.maxLatency'), value: formatLatency(props.data.max_latency_ms) }
]);

const columns: DataTableColumns<Api.System.PingPacket> = [
  {
    key: 'sequence',
    title: $t('common.index'),
    align: 'center',
    width: '33.33%',
    render: row => `#${row.sequence}`
  },
  {
    key: 'success',
    title: $t('toolbox.ping.status'),
    align: 'center',
    width: '33.33%',
    render: row => (row.success ? $t('toolbox.common.success') : $t('toolbox.common.failure'))
  },
  {
    key: 'latency_ms',
    title: $t('toolbox.common.latency'),
    align: 'center',
    width: '33.33%',
    render: row => formatLatency(row.latency_ms, 2)
  }
];
</script>

<template>
  <section
    class="h-full min-h-0 flex flex-1 flex-col gap-12px rounded-8px border border-[var(--n-border-color)] border-solid bg-[var(--n-color)] p-14px"
    aria-live="polite"
  >
    <div class="grid grid-cols-2 gap-8px lt-sm:grid-cols-1">
      <div
        v-for="item in statistics"
        :key="item.label"
        class="min-w-0 rounded-6px border border-[var(--n-border-color)] border-solid bg-[var(--n-color-embedded)] p-10px"
      >
        <span class="mb-4px block text-12px text-[var(--n-text-color-3)]">{{ item.label }}</span>
        <strong class="block overflow-hidden text-14px text-[var(--n-text-color-1)] text-ellipsis whitespace-nowrap">
          {{ item.value }}
        </strong>
      </div>
    </div>

    <div class="min-h-220px flex-1 overflow-hidden">
      <NDataTable :bordered="false" :columns="columns" :data="data.packets" :max-height="360" size="small" />
    </div>

    <div v-if="elapsed !== undefined" class="text-12px text-[var(--n-text-color-3)]">
      {{ $t('toolbox.common.elapsed', { value: elapsed }) }}
    </div>
  </section>
</template>
