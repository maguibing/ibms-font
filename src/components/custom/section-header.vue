<script setup lang="ts">
import { computed, useSlots } from 'vue';

defineOptions({
  name: 'SectionHeader'
});

type HeaderType = 'primary' | 'info' | 'success';

interface Props {
  title: string;
  type?: HeaderType;
  extraClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  extraClass: ''
});

const slots = useSlots();

const indicatorClassMap: Record<HeaderType, string> = {
  primary: 'bg-[rgb(var(--primary-color))] shadow-[0_6px_14px_rgba(var(--primary-color),0.16)]',
  info: 'bg-[rgb(var(--info-color))] shadow-[0_6px_14px_rgba(var(--info-color),0.16)]',
  success: 'bg-[rgb(var(--success-color))] shadow-[0_6px_14px_rgba(var(--success-color),0.16)]'
};

const indicatorClass = computed(() => indicatorClassMap[props.type]);
</script>

<template>
  <div
    class="min-h-32px flex items-center justify-between gap-12px lt-sm:flex-col lt-sm:items-start"
    :class="extraClass"
  >
    <div class="min-w-0 flex items-center gap-8px">
      <span class="h-24px w-4px flex-none rounded-4px" :class="indicatorClass"></span>
      <div class="min-w-0 text-14px text-[var(--n-text-color-1)] font-600 leading-18px">{{ title }}</div>
    </div>

    <div v-if="slots.actions" class="flex flex-none items-center gap-8px lt-sm:w-full lt-sm:justify-end">
      <slot name="actions"></slot>
    </div>
  </div>
</template>
