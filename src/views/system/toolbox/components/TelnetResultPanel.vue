<script setup lang="ts">
import { computed } from 'vue';
import { formatLatency, getTelnetStatusText, getTelnetStatusType } from './shared';

interface Props {
  data: Api.System.TelnetData;
  elapsed?: number;
}

const props = defineProps<Props>();

const statusText = computed(() => getTelnetStatusText(props.data.status));
const statusType = computed(() => getTelnetStatusType(props.data.status));
const latencyText = computed(() => formatLatency(props.data.latency_ms, 3));
</script>

<template>
  <section
    class="h-full min-h-0 flex flex-1 flex-col gap-12px rounded-8px border border-[var(--n-border-color)] border-solid bg-[var(--n-color)] p-14px"
    aria-live="polite"
  >
    <NAlert class="shrink-0" :title="statusText" :type="statusType" />

    <div class="grid grid-cols-2 gap-8px lt-sm:grid-cols-1">
      <div
        class="min-w-0 rounded-6px border border-[var(--n-border-color)] border-solid bg-[var(--n-color-embedded)] p-10px"
      >
        <span class="mb-4px block text-12px text-[var(--n-text-color-3)]">目标 IP</span>
        <strong class="block overflow-hidden text-14px text-[var(--n-text-color-1)] text-ellipsis whitespace-nowrap">
          {{ data.ip ?? '--' }}
        </strong>
      </div>
      <div
        class="min-w-0 rounded-6px border border-[var(--n-border-color)] border-solid bg-[var(--n-color-embedded)] p-10px"
      >
        <span class="mb-4px block text-12px text-[var(--n-text-color-3)]">连接延迟</span>
        <strong class="block overflow-hidden text-14px text-[var(--n-text-color-1)] text-ellipsis whitespace-nowrap">
          {{ latencyText }}
        </strong>
      </div>
    </div>

    <div v-if="elapsed !== undefined" class="text-12px text-[var(--n-text-color-3)]">耗时 {{ elapsed }} ms</div>
  </section>
</template>
