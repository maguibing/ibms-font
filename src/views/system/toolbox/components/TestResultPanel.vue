<script setup lang="ts">
import { computed } from 'vue';
import { $t } from '@/locales';
import { getStatusText, getStatusType, type TestStatus, type ToolTone } from './shared';

type PanelItem = {
  label: string;
  value: string;
};

type PanelStep = {
  key: string;
  label: string;
};

interface Props {
  elapsed?: number;
  icon?: string;
  idleText?: string;
  items?: readonly PanelItem[];
  result?: string;
  runningText?: string;
  status: TestStatus;
  steps?: readonly PanelStep[];
  title?: string;
  tone?: ToolTone;
}

const props = withDefaults(defineProps<Props>(), {
  elapsed: undefined,
  icon: 'material-symbols:play-circle-rounded',
  idleText: undefined,
  items: () => [],
  result: undefined,
  runningText: undefined,
  steps: () => [],
  title: '',
  tone: 'primary'
});

const displayTitle = computed(() => {
  if (props.title) return props.title;
  if (props.status === 'running') return $t('toolbox.status.running');
  if (props.status === 'error') return $t('toolbox.status.error');

  return $t('toolbox.status.idle');
});

const resultText = computed(() => {
  if (props.status === 'idle') return props.idleText;
  if (props.status === 'running') return props.runningText;
  if (props.result) return props.result;

  return props.status === 'success' ? $t('toolbox.status.success') : $t('toolbox.status.requestFailed');
});
</script>

<template>
  <section
    class="result-panel min-h-0 flex flex-1 flex-col gap-16px overflow-auto rounded-8px border border-[var(--n-border-color)] border-solid p-18px"
    :class="[`result-panel--${tone}`, `result-panel--${status}`]"
    aria-live="polite"
  >
    <div class="flex min-h-150px items-center gap-22px lt-sm:flex-col lt-sm:items-start">
      <div class="result-panel__pulse relative size-132px shrink-0 overflow-hidden rounded-full lt-sm:size-120px">
        <span v-if="status === 'running'" class="result-panel__beam absolute inset-0 animate-spin"></span>
        <SvgIcon class="result-panel__pulse-icon" :icon="icon" />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex min-w-0 items-center gap-10px">
          <NTag round size="small" :type="getStatusType(status)">{{ getStatusText(status) }}</NTag>
        </div>
        <h3 class="m-0 mt-14px text-20px text-[var(--n-title-text-color)] font-600 leading-[1.3]">
          {{ displayTitle }}
        </h3>
        <p class="m-0 mt-8px min-h-22px break-words text-13px text-[var(--n-text-color-2)] leading-[1.7]">
          {{ resultText }}
        </p>
      </div>
    </div>

    <div v-if="items.length" class="grid grid-cols-3 gap-10px lt-sm:grid-cols-1">
      <div
        v-for="item in items"
        :key="item.label"
        class="result-panel__metric min-w-0 rounded-6px border border-[var(--n-border-color)] border-solid p-12px"
      >
        <span class="mb-6px block text-12px text-[var(--n-text-color-3)]">{{ item.label }}</span>
        <strong
          class="block overflow-hidden text-14px text-[var(--n-title-text-color)] font-600 text-ellipsis whitespace-nowrap"
        >
          {{ item.value }}
        </strong>
      </div>
    </div>

    <div v-if="steps.length" class="mt-auto grid grid-cols-4 gap-8px lt-sm:grid-cols-1">
      <div
        v-for="item in steps"
        :key="item.key"
        class="result-panel__step min-w-0 flex items-center gap-8px rounded-6px border border-[var(--n-border-color)] border-solid bg-[var(--n-color)] px-12px py-10px text-[var(--n-text-color-2)]"
        :class="{ 'result-panel__step--active animate-pulse': status === 'running' }"
      >
        <span class="result-panel__step-dot size-7px shrink-0 rounded-full opacity-60"></span>
        <span class="min-w-0 overflow-hidden text-12px text-ellipsis whitespace-nowrap">{{ item.label }}</span>
      </div>
    </div>

    <div v-if="elapsed !== undefined && status !== 'running'" class="text-12px text-[var(--n-text-color-3)]">
      {{ $t('toolbox.common.elapsed', { value: elapsed }) }}
    </div>
  </section>
</template>

<style scoped>
.result-panel {
  --panel-accent: rgb(var(--primary-color));

  background:
    radial-gradient(circle at 88% 10%, color-mix(in srgb, var(--panel-accent) 12%, transparent), transparent 34%),
    linear-gradient(180deg, var(--n-color), var(--n-color-embedded));
}

.result-panel--success {
  --panel-accent: #18a058;
}

.result-panel--warning {
  --panel-accent: #f0a020;
}

.result-panel--error {
  --panel-accent: #d03050;
}

.result-panel__pulse {
  background:
    radial-gradient(circle, color-mix(in srgb, var(--panel-accent) 13%, transparent) 0 10%, transparent 11%),
    repeating-radial-gradient(
      circle,
      transparent 0 31px,
      color-mix(in srgb, var(--panel-accent) 28%, transparent) 32px 33px,
      transparent 34px 58px
    ),
    var(--n-color);
  border: 1px solid color-mix(in srgb, var(--panel-accent) 32%, var(--n-border-color));
}

.result-panel__beam {
  background: conic-gradient(color-mix(in srgb, var(--panel-accent) 45%, transparent), transparent 38%);
  opacity: 0.42;
}

.result-panel__pulse-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  color: var(--panel-accent);
  font-size: 30px;
  transform: translate(-50%, -50%);
}

.result-panel__metric {
  background-color: color-mix(in srgb, var(--n-color) 88%, var(--panel-accent));
}

.result-panel__step--active {
  border-color: color-mix(in srgb, var(--panel-accent) 42%, var(--n-border-color));
}

.result-panel__step-dot {
  background-color: var(--panel-accent);
}
</style>
