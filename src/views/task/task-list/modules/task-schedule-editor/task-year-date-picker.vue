<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, useTemplateRef, watch } from 'vue';
import ButtonIcon from '@/components/custom/button-icon.vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { weekdayMap } from '../../../constants';

defineOptions({
  name: 'TaskYearDatePicker'
});

type CalendarDay = {
  day: number;
  timestamp: number;
};

type CalendarMonth = {
  month: number;
  offset: number;
  days: CalendarDay[];
};

type DateDragMode = 'select' | 'deselect';

const model = defineModel<number[]>({ required: true });

const triggerRef = useTemplateRef<HTMLElement>('triggerRef');
const year = shallowRef(model.value[0] ? new Date(model.value[0]).getFullYear() : new Date().getFullYear());
const popoverPlacement = shallowRef<'top-end' | 'bottom-end'>('bottom-end');
const popoverMaxHeight = shallowRef('calc(50vh - 24px)');

let dateDragMode: DateDragMode | null = null;
let draggedDates = new Set<number>();
let suppressMouseClick = false;
let suppressMouseClickTimer: number | undefined;

const weekHeaders = ([1, 2, 3, 4, 5, 6, 0] as Api.Task.TaskScheduleWeekday[]).map(value => ({
  value,
  label: weekdayMap[value].slice(1)
}));

const selectedDates = computed(() => new Set(model.value));
const selectedCount = computed(() => model.value.length);
const triggerText = computed(() => (selectedCount.value ? `已选择 ${selectedCount.value} 天` : '请选择执行日期'));
const months = computed<CalendarMonth[]>(() =>
  Array.from({ length: 12 }, (_, month) => {
    const daysInMonth = new Date(year.value, month + 1, 0).getDate();
    const firstWeekday = new Date(year.value, month, 1).getDay();

    return {
      month,
      offset: (firstWeekday + 6) % 7,
      days: Array.from({ length: daysInMonth }, (__, index) => ({
        day: index + 1,
        timestamp: new Date(year.value, month, index + 1).getTime()
      }))
    };
  })
);

watch(model, dates => {
  if (!dates.length) {
    year.value = new Date().getFullYear();
    return;
  }

  const hasSelectedDateInCurrentYear = dates.some(timestamp => new Date(timestamp).getFullYear() === year.value);
  if (!hasSelectedDateInCurrentYear) {
    year.value = new Date(dates[0]).getFullYear();
  }
});

function changeYear(offset: number) {
  year.value += offset;
}

function toggleDate(timestamp: number) {
  model.value = selectedDates.value.has(timestamp)
    ? model.value.filter(value => value !== timestamp)
    : [...model.value, timestamp].sort((a, b) => a - b);
}

function applyDraggedDate(timestamp: number) {
  if (!dateDragMode || draggedDates.has(timestamp)) return;

  draggedDates.add(timestamp);

  if (dateDragMode === 'select' && !selectedDates.value.has(timestamp)) {
    model.value = [...model.value, timestamp].sort((a, b) => a - b);
  } else if (dateDragMode === 'deselect' && selectedDates.value.has(timestamp)) {
    model.value = model.value.filter(value => value !== timestamp);
  }
}

function removeDateDragListeners() {
  window.removeEventListener('mouseup', endDateDrag);
  window.removeEventListener('blur', endDateDrag);
}

function endDateDrag() {
  dateDragMode = null;
  draggedDates.clear();
  removeDateDragListeners();

  if (!suppressMouseClick) return;

  window.clearTimeout(suppressMouseClickTimer);
  suppressMouseClickTimer = window.setTimeout(() => {
    suppressMouseClick = false;
    suppressMouseClickTimer = undefined;
  });
}

function startDateDrag(timestamp: number, event: MouseEvent) {
  event.preventDefault();
  window.clearTimeout(suppressMouseClickTimer);
  removeDateDragListeners();

  suppressMouseClick = true;
  dateDragMode = selectedDates.value.has(timestamp) ? 'deselect' : 'select';
  draggedDates = new Set<number>();
  applyDraggedDate(timestamp);

  window.addEventListener('mouseup', endDateDrag, { once: true });
  window.addEventListener('blur', endDateDrag, { once: true });
}

function handleDateMouseEnter(timestamp: number, event: MouseEvent) {
  if (!dateDragMode) return;

  if ((event.buttons & 1) === 0) {
    endDateDrag();
    return;
  }

  applyDraggedDate(timestamp);
}

function handleDateClick(timestamp: number, event: MouseEvent) {
  if (suppressMouseClick && event.detail > 0) {
    suppressMouseClick = false;
    return;
  }

  toggleDate(timestamp);
}

function updatePopoverLayout() {
  const trigger = triggerRef.value;
  if (!trigger) return;

  const rect = trigger.getBoundingClientRect();
  const viewportPadding = 16;
  const popoverGap = 12;
  const maxPopoverHeight = Math.max(0, window.innerHeight - viewportPadding * 2);
  const spaceAbove = Math.min(maxPopoverHeight, Math.max(0, rect.top - viewportPadding - popoverGap));
  const spaceBelow = Math.min(
    maxPopoverHeight,
    Math.max(0, window.innerHeight - rect.bottom - viewportPadding - popoverGap)
  );
  const openBelow = spaceBelow >= spaceAbove;

  popoverPlacement.value = openBelow ? 'bottom-end' : 'top-end';
  popoverMaxHeight.value = `${Math.floor(openBelow ? spaceBelow : spaceAbove)}px`;
}

function removePopoverLayoutListeners() {
  window.removeEventListener('resize', updatePopoverLayout);
  window.removeEventListener('scroll', updatePopoverLayout, true);
}

function handlePopoverShow(show: boolean) {
  removePopoverLayoutListeners();

  if (!show) {
    endDateDrag();
    return;
  }

  updatePopoverLayout();
  window.addEventListener('resize', updatePopoverLayout);
  window.addEventListener('scroll', updatePopoverLayout, true);
}

function clearDates() {
  model.value = [];
}

function isToday(timestamp: number) {
  const today = new Date();
  const date = new Date(timestamp);

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

onBeforeUnmount(() => {
  removeDateDragListeners();
  removePopoverLayoutListeners();
  window.clearTimeout(suppressMouseClickTimer);
});
</script>

<template>
  <NPopover
    trigger="click"
    :placement="popoverPlacement"
    scrollable
    :show-arrow="false"
    :style="{ width: 'min(780px, calc(100vw - 32px))', maxHeight: popoverMaxHeight }"
    @update:show="handlePopoverShow"
  >
    <template #trigger>
      <div ref="triggerRef" class="w-full">
        <NButton class="year-date-trigger w-full" secondary>
          <div class="w-full flex items-center justify-between gap-16px">
            <span class="text-[var(--n-text-color-1)] font-500">{{ year }} 年</span>
            <span class="truncate text-[var(--n-text-color-3)]">{{ triggerText }}</span>
          </div>
        </NButton>
      </div>
    </template>

    <div class="w-full">
      <div
        class="mb-12px flex items-center justify-between gap-12px border-b border-b-#edf1f7 border-b-solid pb-12px dark:border-b-#2f3338"
      >
        <ButtonIcon
          size="small"
          icon="material-symbols:chevron-left-rounded"
          tooltip-content="上一年"
          @click="changeYear(-1)"
        />
        <div class="text-15px text-[var(--n-text-color-1)] font-600">{{ year }} 年</div>
        <div class="flex items-center gap-8px">
          <NButton size="small" quaternary :disabled="selectedCount === 0" @click="clearDates">
            <template #icon>
              <SvgIcon icon="material-symbols:delete-sweep-outline-rounded" />
            </template>
            清空
          </NButton>
          <ButtonIcon
            size="small"
            icon="material-symbols:chevron-right-rounded"
            tooltip-content="下一年"
            @click="changeYear(1)"
          />
        </div>
      </div>

      <div class="calendar-months">
        <section v-for="month in months" :key="month.month" class="p-8px">
          <div class="mb-8px text-center text-13px text-[var(--n-text-color-1)] font-600">{{ month.month + 1 }} 月</div>
          <div class="calendar-grid mb-4px">
            <span
              v-for="weekday in weekHeaders"
              :key="weekday.value"
              class="h-24px flex items-center justify-center text-11px text-#94a3b8"
            >
              {{ weekday.label }}
            </span>
          </div>
          <div class="calendar-grid">
            <span v-for="offset in month.offset" :key="`empty-${offset}`" class="h-28px"></span>
            <button
              v-for="day in month.days"
              :key="day.timestamp"
              type="button"
              class="calendar-day h-28px w-full border-0 rounded-6px bg-transparent p-0 text-12px text-[var(--n-text-color-2)] transition-colors hover:bg-#dbeafe hover:text-#1d4ed8 dark:hover:bg-#1e3a5f dark:hover:text-#93c5fd"
              :class="[
                selectedDates.has(day.timestamp) && '!bg-#2563eb !text-white',
                isToday(day.timestamp) && !selectedDates.has(day.timestamp) && 'ring-1 ring-#2563eb ring-inset'
              ]"
              :aria-pressed="selectedDates.has(day.timestamp)"
              @mousedown.left="startDateDrag(day.timestamp, $event)"
              @mouseenter="handleDateMouseEnter(day.timestamp, $event)"
              @click="handleDateClick(day.timestamp, $event)"
            >
              {{ day.day }}
            </button>
          </div>
        </section>
      </div>
    </div>
  </NPopover>
</template>

<style scoped>
.year-date-trigger :deep(.n-button__content) {
  width: 100%;
}

.calendar-months {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(210px, 100%), 1fr));
  gap: 12px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px;
}

.calendar-day {
  user-select: none;
}
</style>
