<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'vue';
import { buildRangesFromHours, parseHoursFromRanges, type TimeRangeInput } from './hour-range-selector';

defineOptions({
  name: 'HourRangeSelector'
});

type DragAction = 'select' | 'remove';

const model = defineModel<TimeRangeInput[]>({ required: true });

const hours = Array.from({ length: 24 }, (_, hour) => hour);
const dragAction = shallowRef<DragAction | null>(null);

const selectedHours = computed(() => parseHoursFromRanges(model.value));

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
    return 'border-primary bg-primary text-white shadow-sm hover:(border-primary bg-primary text-white)';
  }

  return 'border-#d8dee8 bg-white text-#475569 hover:(border-primary bg-primary/5 text-primary) dark:border-#2f3338 dark:bg-#20242b dark:text-#cbd5e1 dark:hover:(border-primary text-primary)';
}

onBeforeUnmount(stopDragging);
</script>

<template>
  <div
    class="rounded-8px border border-#e2e8f0 border-solid bg-#f8fafc p-12px dark:border-#2f3338 dark:bg-#171a21"
    @pointerleave="stopDragging"
  >
    <div
      class="grid select-none grid-cols-6 gap-6px rounded-6px bg-white p-8px sm:grid-cols-12 dark:bg-#1f2228"
      @dragstart.prevent
    >
      <button
        v-for="hour in hours"
        :key="hour"
        type="button"
        class="h-34px min-w-0 rounded-5px border border-solid text-13px font-600 leading-1 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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
  </div>
</template>
