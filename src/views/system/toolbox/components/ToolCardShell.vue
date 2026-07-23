<script setup lang="ts">
import type { ToolTone } from './shared';

interface Props {
  badge: string;
  description: string;
  icon: string;
  title: string;
  tone?: ToolTone;
}

withDefaults(defineProps<Props>(), {
  tone: 'primary'
});

defineSlots<{
  form(): unknown;
  result(): unknown;
}>();
</script>

<template>
  <div
    class="tool-pane h-full min-h-0 grid grid-cols-[minmax(280px,360px)_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] gap-16px overflow-hidden"
    :class="`tool-pane--${tone}`"
  >
    <section
      class="min-h-0 min-w-0 flex flex-col overflow-hidden rounded-8px border border-[var(--n-border-color)] border-solid bg-[var(--n-color)] p-16px"
    >
      <header class="mb-16px flex gap-12px border-b border-[var(--n-border-color)] border-b-solid pb-16px">
        <div class="tool-pane__icon size-40px flex-center shrink-0 rounded-8px text-22px">
          <SvgIcon :icon="icon" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-10px">
            <h2 class="m-0 text-17px text-[var(--n-title-text-color)] font-600 leading-[1.3]">{{ title }}</h2>
            <NTag round size="small" :type="tone === 'primary' ? 'info' : tone">{{ badge }}</NTag>
          </div>
          <p class="m-0 mt-6px text-13px text-[var(--n-text-color-3)] leading-[1.6]">{{ description }}</p>
        </div>
      </header>

      <div class="min-h-0 flex flex-1 flex-col">
        <slot name="form" />
      </div>
    </section>

    <section
      class="tool-pane__result min-h-0 min-w-0 flex flex-col overflow-hidden rounded-8px border border-[var(--n-border-color)] border-solid bg-[var(--n-color)]"
    >
      <header
        class="min-h-48px shrink-0 flex items-center justify-between border-b border-[var(--n-border-color)] border-b-solid bg-[var(--n-color-embedded)] px-16px"
      >
        <span class="text-14px text-[var(--n-title-text-color)] font-600">测试结果</span>
      </header>
      <div class="min-h-0 flex flex-1 flex-col overflow-auto p-16px">
        <slot name="result" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.tool-pane {
  --tool-accent: rgb(var(--primary-color));
  --tool-accent-soft: color-mix(in srgb, var(--tool-accent) 10%, transparent);
}

.tool-pane--success {
  --tool-accent: #18a058;
}

.tool-pane--warning {
  --tool-accent: #f0a020;
}

.tool-pane__icon {
  color: var(--tool-accent);
  background-color: var(--tool-accent-soft);
  border: 1px solid color-mix(in srgb, var(--tool-accent) 24%, transparent);
}

@media (max-width: 900px) {
  .tool-pane {
    height: auto;
    grid-template-rows: auto auto;
    grid-template-columns: minmax(0, 1fr);
  }

  .tool-pane__result {
    min-height: 360px;
  }
}
</style>
