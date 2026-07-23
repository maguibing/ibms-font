<script setup lang="ts">
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
    title: '序号',
    align: 'center',
    width: '33.33%',
    render: (_, index) => index + 1
  },
  {
    key: 'ip',
    title: 'IP 地址',
    width: '33.33%',
    align: 'center'
  },
  {
    key: 'latency_ms',
    title: '延迟',
    align: 'center',
    width: '33.33%',
    render: row => formatLatency(row.latency_ms, 3)
  }
];
</script>

<template>
  <section class="h-full min-h-0 flex flex-1 flex-col gap-12px" aria-live="polite">
    <div class="flex flex-wrap gap-8px">
      <NTag size="small" type="info">已扫描 {{ data.completed_count }}</NTag>
      <NTag size="small" type="success">发现 {{ data.hosts.length }}</NTag>
      <NTag v-if="elapsed !== undefined" size="small">耗时 {{ elapsed }} ms</NTag>
    </div>

    <div class="min-h-240px flex-1 overflow-hidden">
      <NDataTable :bordered="false" :columns="columns" :data="data.hosts" :max-height="420" size="small" />
    </div>
  </section>
</template>
