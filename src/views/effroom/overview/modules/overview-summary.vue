<script setup lang="ts">
import type { OverviewSummaryItem } from './overview-data';

defineOptions({
  name: 'OverviewSummary'
});

defineProps<{
  items: OverviewSummaryItem[];
  loading: boolean;
}>();
</script>

<template>
  <div class="grid grid-cols-4 gap-16px lt-xl:grid-cols-2 lt-sm:grid-cols-1">
    <NCard v-for="item in items" :key="item.key" :bordered="false" size="small" class="card-wrapper">
      <div class="min-h-112px flex flex-col justify-between gap-16px p-10px">
        <div class="flex items-center justify-between gap-12px">
          <span class="text-15px text-[var(--n-text-color-2)] font-500">{{ item.label }}</span>
          <span
            class="h-34px w-34px flex-center shrink-0 rounded-6px"
            :style="{ color: item.color, backgroundColor: `${item.color}18` }"
          >
            <SvgIcon :icon="item.icon" class="text-20px" />
          </span>
        </div>
        <NSkeleton v-if="loading" text width="55%" :height="34" />
        <div v-else class="min-w-0 flex items-baseline gap-6px">
          <span class="truncate text-32px text-[var(--n-text-color)] font-600 leading-none">{{ item.value }}</span>
          <span v-if="item.unit" class="shrink-0 text-13px text-[var(--n-text-color-3)]">{{ item.unit }}</span>
        </div>
        <span class="h-2px w-48px rounded-full" :style="{ backgroundColor: item.color }"></span>
      </div>
    </NCard>
  </div>
</template>
