<script setup lang="ts">
import { $t } from '@/locales';
import type { DataTableColumns } from 'naive-ui';
import { formatLatency } from './shared';

interface Props {
  data: Api.System.DiscoverNetworkData;
  elapsed?: number;
}

defineProps<Props>();

const columns: DataTableColumns<Api.System.DiscoverNetworkHost> = [
  {
    key: 'index',
    title: $t('common.index'),
    align: 'center',
    width: '33.33%',
    render: (_, index) => index + 1
  },
  {
    key: 'ip',
    title: $t('toolbox.common.ip'),
    width: '33.33%',
    align: 'center'
  },
  {
    key: 'latency_ms',
    title: $t('toolbox.common.latency'),
    align: 'center',
    width: '33.33%',
    render: row => formatLatency(row.latency_ms, 3)
  }
];
</script>

<template>
  <section class="h-full min-h-0 flex flex-1 flex-col gap-12px" aria-live="polite">
    <div class="flex flex-wrap gap-8px">
      <NTag size="small" type="info">{{ $t('toolbox.discovery.scanned', { value: data.completed_count }) }}</NTag>
      <NTag size="small" type="success">{{ $t('toolbox.discovery.found', { value: data.hosts.length }) }}</NTag>
      <NTag v-if="elapsed !== undefined" size="small">{{ $t('toolbox.common.elapsed', { value: elapsed }) }}</NTag>
    </div>

    <div class="min-h-240px flex-1 overflow-hidden">
      <NDataTable :bordered="false" :columns="columns" :data="data.hosts" :max-height="420" size="small" />
    </div>
  </section>
</template>
