<script setup lang="ts">
import { computed, useSlots } from 'vue';

defineOptions({
  name: 'SectionHeader'
});

type HeaderType = 'primary' | 'info' | 'success';

interface Props {
  title: string;
  type?: HeaderType;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary'
});

const slots = useSlots();

const indicatorClassMap: Record<HeaderType, string> = {
  primary: 'bg-#2563eb shadow-[0_6px_14px_rgba(37,99,235,0.16)]',
  info: 'bg-#0891b2 shadow-[0_6px_14px_rgba(8,145,178,0.16)]',
  success: 'bg-#16a34a shadow-[0_6px_14px_rgba(22,163,74,0.16)]'
};

const indicatorClass = computed(() => indicatorClassMap[props.type]);
</script>

<template>
  <div class="min-h-40px flex items-center justify-between gap-16px lt-sm:flex-col lt-sm:items-start">
    <div class="min-w-0 flex items-center gap-10px">
      <span class="h-28px w-4px flex-none rounded-4px" :class="indicatorClass"></span>
      <div class="min-w-0 text-15px text-[var(--n-text-color-1)] font-600 leading-20px">{{ title }}</div>
    </div>

    <div v-if="slots.actions" class="flex flex-none items-center gap-8px lt-sm:w-full lt-sm:justify-end">
      <slot name="actions"></slot>
    </div>
  </div>
</template>
