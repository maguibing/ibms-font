<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'vue';
import { buildRangesFromHours, parseHoursFromRanges, type TimeRangeInput } from './hour-range-selector';

defineOptions({
  name: 'HourRangeSelector'
});

type DragAction = 'select' | 'remove';

type HourCell = {
  hour: number;
  isSelected: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
};

const model = defineModel<TimeRangeInput[]>({ required: true });

const hours = Array.from({ length: 24 }, (_, hour) => hour);
const dragAction = shallowRef<DragAction | null>(null);

const selectedHours = computed(() => parseHoursFromRanges(model.value));
const hourCells = computed<HourCell[]>(() => {
  const selected = selectedHours.value;

  return hours.map(hour => {
    const isSelected = selected.has(hour);

    return {
      hour,
      isSelected,
      isRangeStart: isSelected && !selected.has(hour - 1),
      isRangeEnd: isSelected && !selected.has(hour + 1)
    };
  });
});

function toggleHour(hour: number) {
  applyHourSelection(hour, selectedHours.value.has(hour) ? 'remove' : 'select');
}

function handleHourPointerDown(hour: number, event: PointerEvent) {
  if (event.button !== 0) return;

  dragAction.value = selectedHours.value.has(hour) ? 'remove' : 'select';
  applyHourSelection(hour, dragAction.value);
  window.addEventListener('pointerup', stopDragging, { once: true });
  window.addEventListener('pointercancel', stopDragging, { once: true });
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
  window.removeEventListener('pointercancel', stopDragging);
}

function getHourCellClass(cell: HourCell) {
  return [
    'hour-range-selector__cell',
    cell.isSelected ? 'hour-range-selector__cell--selected' : 'hour-range-selector__cell--idle',
    cell.isRangeStart ? 'hour-range-selector__cell--range-start' : '',
    cell.isRangeEnd ? 'hour-range-selector__cell--range-end' : ''
  ];
}

onBeforeUnmount(stopDragging);
</script>

<template>
  <div class="hour-range-selector" @pointerleave="stopDragging">
    <div class="hour-range-selector__viewport">
      <div class="hour-range-selector__track" @dragstart.prevent>
        <button
          v-for="cell in hourCells"
          :key="cell.hour"
          type="button"
          :class="getHourCellClass(cell)"
          :aria-pressed="cell.isSelected"
          :aria-label="`${cell.hour}点`"
          @pointerdown.prevent="handleHourPointerDown(cell.hour, $event)"
          @pointerenter="handleHourPointerEnter(cell.hour)"
          @keydown.enter.prevent="toggleHour(cell.hour)"
          @keydown.space.prevent="toggleHour(cell.hour)"
        >
          {{ cell.hour }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hour-range-selector {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 8px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
}

.hour-range-selector__viewport {
  width: 100%;
  overflow: hidden;
}

.hour-range-selector__track {
  display: grid;
  box-sizing: border-box;
  width: 100%;
  grid-template-columns: repeat(24, minmax(0, 1fr));
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.06);
}

.hour-range-selector__cell {
  display: flex;
  box-sizing: border-box;
  height: 36px;
  min-width: 0;
  align-items: center;
  justify-content: center;
  border: 0;
  border-right: 1px solid rgba(148, 163, 184, 0.32);
  background: rgba(148, 163, 184, 0.12);
  color: var(--n-text-color-2);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  touch-action: none;
  user-select: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.hour-range-selector__cell:last-child {
  border-right: 0;
}

.hour-range-selector__cell--idle:hover {
  background: rgba(var(--primary-color), 0.1);
  color: rgb(var(--primary-color));
}

.hour-range-selector__cell:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px rgba(var(--primary-color), 0.28);
}

.hour-range-selector__cell--selected {
  background: rgb(var(--primary-color));
  color: #fff;
  border-right-color: rgba(255, 255, 255, 0.28);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.hour-range-selector__cell--selected:hover {
  background: rgb(var(--primary-color));
  color: #fff;
}

.hour-range-selector__cell--range-start {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.hour-range-selector__cell--range-end {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}
</style>
