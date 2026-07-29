<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'vue';
import {
  buildRangesFromHours,
  formatHourRange,
  parseHoursFromRanges,
  type TimeRangeInput
} from './hour-range-selector';

defineOptions({
  name: 'HourRangeSelector'
});

type DragAction = 'select' | 'remove';

const model = defineModel<TimeRangeInput[]>({ required: true });

const hours = Array.from({ length: 24 }, (_, hour) => hour);
const dragAction = shallowRef<DragAction | null>(null);

const selectedHours = computed(() => parseHoursFromRanges(model.value));
const selectedHourList = computed(() => Array.from(selectedHours.value).sort((a, b) => a - b));
const selectedRanges = computed(() => buildRangesFromHours(selectedHourList.value));
const selectedCountText = computed(() => `已选 ${selectedHours.value.size}/24`);
const isAllSelected = computed(() => selectedHours.value.size === hours.length);

function selectAll() {
  model.value = [{ start_at: 0, end_at: 23 }];
}

function clearAll() {
  model.value = [];
}

function toggleHour(hour: number) {
  applyHourSelection(hour, selectedHours.value.has(hour) ? 'remove' : 'select');
}

function handleHourPointerDown(hour: number, event: PointerEvent) {
  if (event.button !== 0) return;

  dragAction.value = selectedHours.value.has(hour) ? 'remove' : 'select';
  applyHourSelection(hour, dragAction.value);
  window.addEventListener('pointerup', stopDragging, { once: true });
}

function handleHourPointerEnter(hour: number) {
  if (!dragAction.value) return;

  applyHourSelection(hour, dragAction.value);
}

function applyHourSelection(hour: number, action: DragAction) {
  const nextHours = new Set(selectedHours.value);
  const selected = nextHours.has(hour);

  if ((action === 'select' && selected) || (action === 'remove' && !selected)) return;

  if (action === 'select') {
    nextHours.add(hour);
  } else {
    nextHours.delete(hour);
  }

  model.value = buildRangesFromHours(nextHours);
}

function stopDragging() {
  dragAction.value = null;
  window.removeEventListener('pointerup', stopDragging);
}

function getHourClass(hour: number) {
  if (selectedHours.value.has(hour)) {
    return 'border-primary bg-primary text-white shadow-[0_6px_14px_rgba(22,119,255,0.16)] hover:(border-primary bg-primary text-white)';
  }

  return 'border-#d8dee8 bg-#f8fafc text-#475569 hover:(border-primary bg-primary/6 text-primary) dark:border-#2f3338 dark:bg-#171a21 dark:text-#cbd5e1 dark:hover:(border-primary text-primary)';
}

onBeforeUnmount(stopDragging);
</script>

<template>
  <div
    class="rounded-8px border border-#e2e8f0/72 border-solid bg-white p-16px shadow-[0_8px_22px_rgba(15,23,42,0.05)] dark:border-#2f3338 dark:bg-#1f2228 dark:shadow-none"
    @pointerleave="stopDragging"
  >
    <div class="flex flex-col gap-12px">
      <div class="flex flex-wrap items-center justify-between gap-12px">
        <div class="flex flex-wrap items-center gap-8px">
          <NTag size="small" :type="isAllSelected ? 'success' : 'info'">{{ selectedCountText }}</NTag>
          <NTag v-if="selectedRanges.length" size="small" :bordered="false">区间 {{ selectedRanges.length }}</NTag>
        </div>

        <div class="flex flex-none items-center gap-8px">
          <NButton secondary size="small" :disabled="selectedHours.size === 0" @click="clearAll">清空</NButton>
          <NButton secondary type="primary" size="small" :disabled="isAllSelected" @click="selectAll">全选</NButton>
        </div>
      </div>

      <div class="grid select-none grid-cols-6 gap-8px sm:grid-cols-12" @dragstart.prevent>
        <button
          v-for="hour in hours"
          :key="hour"
          type="button"
          class="h-36px min-w-0 rounded-6px border border-solid text-13px font-600 leading-1 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          :class="getHourClass(hour)"
          :aria-pressed="selectedHours.has(hour)"
          @pointerdown="handleHourPointerDown(hour, $event)"
          @pointerenter="handleHourPointerEnter(hour)"
          @keydown.enter.prevent="toggleHour(hour)"
          @keydown.space.prevent="toggleHour(hour)"
        >
          {{ hour }}
        </button>
      </div>

      <div class="min-h-30px flex flex-wrap items-center gap-8px rounded-6px bg-#f6f8fb px-10px py-7px dark:bg-#171a21">
        <span class="shrink-0 text-12px text-[var(--n-text-color-3)]">区间</span>
        <template v-if="selectedRanges.length">
          <NTag v-for="range in selectedRanges" :key="`${range.start_at}-${range.end_at}`" size="small" type="info">
            {{ formatHourRange(range) }}
          </NTag>
        </template>
        <span v-else class="text-12px text-[var(--n-text-color-3)]">未选择</span>
      </div>
    </div>
  </div>
</template>
