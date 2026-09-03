<script setup lang="ts">
import { computed, ref } from 'vue';
import ButtonIcon from '@/components/custom/button-icon.vue';
import type { TaskScheduleTimeRange } from './use-task-schedule-editor';

const props = withDefaults(
  defineProps<{
    modelValue: TaskScheduleTimeRange[];
    disabled?: boolean;
  }>(),
  { disabled: false }
);

const emit = defineEmits<{ 'update:modelValue': [value: TaskScheduleTimeRange[]] }>();

// 时间轴使用当天起始后的秒数，数据边界仍保持原有毫秒值。
const daySeconds = 24 * 60 * 60 - 1;
const minDuration = 60;
const snapSeconds = 5 * 60;
const defaultDuration = 60 * 60;
// NTimePicker 需要完整时间戳，使用本地 1970-01-01 作为当天时间基准。
const timeOrigin = new Date(1970, 0, 1).getTime();
const trackRef = ref<HTMLElement>();
const hoveredIndex = ref<number | null>(null);
const selectedIndex = ref<number | null>(null);
const editingIndex = ref<number | null>(null);
const interaction = ref<{
  mode: 'create' | 'move' | 'start' | 'end';
  index: number;
  origin: number;
  start: number;
  end: number;
} | null>(null);

const ranges = computed(() =>
  props.modelValue
    .map((range, index) => ({
      index,
      start: range.start_at === null ? null : Math.floor(range.start_at / 1000),
      end: range.end_at === null ? null : Math.floor(range.end_at / 1000)
    }))
    .filter(range => range.start !== null && range.end !== null)
);

// 将鼠标位置转换为时间轴秒数，并吸附到 5 分钟刻度。
function valueAt(event: PointerEvent) {
  const rect = trackRef.value!.getBoundingClientRect();
  const value = Math.max(0, Math.min(daySeconds, Math.round(((event.clientX - rect.left) / rect.width) * daySeconds)));
  return Math.min(daySeconds, Math.round(value / snapSeconds) * snapSeconds);
}

// 列表和时间轴共用同一排序，未完成的时间段始终排在末尾。
function sortRanges(next: TaskScheduleTimeRange[]) {
  return next.sort((a, b) => (a.start_at ?? Number.MAX_SAFE_INTEGER) - (b.start_at ?? Number.MAX_SAFE_INTEGER));
}

// 创建一个默认时长为 1 小时的时间段。
function createRange(start: number, end = Math.min(daySeconds, start + defaultDuration)) {
  return { _key: `schedule-range-${Date.now()}`, start_at: start * 1000, end_at: end * 1000 };
}

// 判断候选区间是否与其他已配置区间重叠。
function overlaps(start: number, end: number, except: number) {
  return ranges.value.some(range => range.index !== except && start < range.end! && end > range.start!);
}

// 在空白轨道按下时开始创建区间。
function handleTrackDown(event: PointerEvent) {
  if (props.disabled || event.button !== 0) return;
  const point = valueAt(event);
  interaction.value = { mode: 'create', index: -1, origin: point, start: point, end: point };
  trackRef.value?.setPointerCapture(event.pointerId);
}

// 在已有区间上开始整体移动或调整边界。
function handleRangeDown(event: PointerEvent, index: number, mode: 'move' | 'start' | 'end') {
  if (props.disabled) return;
  event.stopPropagation();
  selectedIndex.value = index;
  const range = ranges.value.find(item => item.index === index)!;
  interaction.value = { mode, index, origin: valueAt(event), start: range.start!, end: range.end! };
  trackRef.value?.setPointerCapture(event.pointerId);
}

// 根据拖动模式更新区间，并在发生冲突时保持原位置。
function handleTrackMove(event: PointerEvent) {
  const current = interaction.value;
  if (!current) return;
  const point = valueAt(event);
  if (current.mode === 'create') {
    current.start = Math.min(current.origin, point);
    current.end = Math.max(current.origin, point);
    return;
  }
  const snappedPoint = point;
  const delta = snappedPoint - current.origin;
  let start = current.start;
  let end = current.end;
  if (current.mode === 'move') {
    const offset = Math.max(-current.start, Math.min(daySeconds - current.end, delta));
    start += offset;
    end += offset;
  } else if (current.mode === 'start') start = Math.min(snappedPoint, end - minDuration);
  else end = Math.max(snappedPoint, start + minDuration);
  if (!overlaps(start, end, current.index)) {
    const next = props.modelValue.map(range => ({ ...range }));
    next[current.index].start_at = start * 1000;
    next[current.index].end_at = end * 1000;
    emit('update:modelValue', sortRanges(next));
  }
}

// 结束拖动；短点击会创建默认的一小时区间。
function handleTrackUp(event: PointerEvent) {
  const current = interaction.value;
  if (!current) return;
  if (current.mode === 'create' && current.end - current.start < minDuration) {
    const end = Math.min(daySeconds, current.start + defaultDuration);
    if (!overlaps(current.start, end, -1))
      emit(
        'update:modelValue',
        sortRanges([
          ...props.modelValue.filter(range => range.start_at !== null && range.end_at !== null),
          createRange(current.start, end)
        ])
      );
  } else if (current.mode === 'create' && !overlaps(current.start, current.end, -1)) {
    emit(
      'update:modelValue',
      sortRanges([
        ...props.modelValue.filter(range => range.start_at !== null && range.end_at !== null),
        createRange(current.start, current.end)
      ])
    );
  }
  interaction.value = null;
  trackRef.value?.releasePointerCapture(event.pointerId);
}

function removeRange(index: number) {
  if (selectedIndex.value === index) selectedIndex.value = null;
  emit(
    'update:modelValue',
    props.modelValue.filter((_range, rangeIndex) => rangeIndex !== index)
  );
}

function selectRange(index: number) {
  selectedIndex.value = index;
  hoveredIndex.value = index;
}

// 在业务偏移值和 NTimePicker 的本地时间戳之间转换。
function toPickerValue(value: number | null) {
  return value === null ? null : timeOrigin + value;
}

function fromPickerValue(value: number) {
  return value - timeOrigin;
}

function updateManualTime(index: number, key: 'start_at' | 'end_at', value: number | null) {
  if (value === null) return;
  const next = props.modelValue.map(range => ({ ...range }));
  next[index][key] = fromPickerValue(value);
  const start = next[index].start_at;
  const end = next[index].end_at;
  if (start !== null && end !== null) {
    const startSecond = Math.floor(start / 1000);
    const endSecond = Math.floor(end / 1000);
    if (startSecond >= endSecond || overlaps(startSecond, endSecond, index)) return;
  }
  selectedIndex.value = index;
  emit('update:modelValue', sortRanges(next));
}

function formatTime(seconds: number | null) {
  if (seconds === null) return '未选择';
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60)]
    .map(value => value.toString().padStart(2, '0'))
    .join(':');
}
</script>

<template>
  <div class="w-full flex flex-col gap-12px" :class="{ 'opacity-60': disabled }">
    <div
      ref="trackRef"
      class="relative h-74px mt-10px overflow-visible border border-#e5e7eb border-solid rounded-8px bg-[var(--n-color-embedded)] touch-none select-none dark:border-#2f3338"
      @pointerdown="handleTrackDown"
      @pointermove="handleTrackMove"
      @pointerup="handleTrackUp"
      @pointercancel="handleTrackUp"
    >
      <div
        v-for="tick in 49"
        :key="tick"
        class="absolute border-l border-#d9dee5 border-l-solid dark:border-#343b45"
        :class="(tick - 1) % 2 === 0 ? 'top-34px h-11px border-l-#aeb8c5' : 'top-38px h-7px'"
        :style="{ left: `${((tick - 1) / 48) * 100}%` }"
      >
        <span
          v-if="(tick - 1) % 6 === 0 || tick === 49"
          class="absolute top--23px -translate-x-1/2 whitespace-nowrap text-10px text-[var(--n-text-color-2)] tabular-nums"
          :class="{ 'translate-x-0': tick === 1, '-translate-x-full': tick === 49 }"
          :style="{ left: tick === 1 ? '8px' : tick === 49 ? '-8px' : '0' }"
        >
          {{ tick === 49 ? 24 : (tick - 1) / 2 }}
        </span>
      </div>
      <div
        v-for="range in ranges"
        :key="modelValue[range.index]._key"
        class="absolute z-2 top-30px h-30px min-w-4px overflow-visible rounded-6px border border-#1d4ed8 border-solid bg-gradient-to-b from-#3b82f6 to-#2563eb text-center text-11px text-white leading-28px cursor-grab whitespace-nowrap shadow-[0_3px_8px_rgb(37_99_235_/_30%)]"
        :class="
          hoveredIndex === range.index || selectedIndex === range.index || interaction?.index === range.index
            ? 'z-3 border-#1e40af shadow-[0_0_0_3px_rgb(37_99_235_/_18%),0_4px_10px_rgb(37_99_235_/_28%)]'
            : ''
        "
        :style="{
          left: `${(range.start! / daySeconds) * 100}%`,
          width: `${((range.end! - range.start!) / daySeconds) * 100}%`
        }"
        @pointerenter="hoveredIndex = range.index"
        @pointerleave="hoveredIndex = null"
        @pointerdown="handleRangeDown($event, range.index, 'move')"
      >
        <button
          class="absolute left--4px top-0 h-30px w-8px cursor-ew-resize border-0 bg-transparent p-0"
          type="button"
          aria-label="调整开始时间"
          @pointerdown="handleRangeDown($event, range.index, 'start')"
        ></button>
        <button
          class="absolute right--4px top-0 h-30px w-8px cursor-ew-resize border-0 bg-transparent p-0"
          type="button"
          aria-label="调整结束时间"
          @pointerdown="handleRangeDown($event, range.index, 'end')"
        ></button>
      </div>
      <div
        v-if="interaction?.mode === 'create'"
        class="absolute z-2 top-30px h-30px min-w-4px overflow-visible rounded-6px border border-#1d4ed8 border-solid bg-gradient-to-b from-#3b82f6 to-#2563eb opacity-55 pointer-events-none"
        :style="{
          left: `${(interaction.start / daySeconds) * 100}%`,
          width: `${((interaction.end - interaction.start) / daySeconds) * 100}%`
        }"
      ></div>
    </div>
    <div v-if="modelValue.length" class="flex flex-wrap gap-8px">
      <NPopover
        v-for="(range, rangeIndex) in modelValue"
        :key="range._key"
        :show="editingIndex === rangeIndex"
        trigger="click"
        placement="bottom-start"
        :show-arrow="false"
        @update:show="show => (editingIndex = show ? rangeIndex : null)"
      >
        <template #trigger>
          <div
            class="min-h-30px flex cursor-pointer items-center gap-6px rounded-5px border border-#e5e7eb border-solid bg-[var(--n-color-embedded)] px-5px py-1px text-12px text-[var(--n-text-color-2)] transition-colors dark:border-#2f3338 hover:border-primary"
            :class="{ 'border-primary!': hoveredIndex === rangeIndex || selectedIndex === rangeIndex }"
            @click="selectRange(rangeIndex)"
            @mouseenter="hoveredIndex = rangeIndex"
            @mouseleave="hoveredIndex = null"
          >
            <span>
              {{ formatTime(range.start_at === null ? null : Math.floor(range.start_at / 1000)) }} -
              {{ formatTime(range.end_at === null ? null : Math.floor(range.end_at / 1000)) }}
            </span>
            <ButtonIcon
              size="small"
              type="error"
              icon="material-symbols:delete-outline"
              tooltip-content="删除时间段"
              :disabled="disabled"
              @click.stop="removeRange(modelValue.indexOf(range))"
            />
          </div>
        </template>
        <div class="w-240px flex flex-col gap-10px">
          <div class="text-13px text-[var(--n-text-color-1)] font-600">编辑时间段</div>
          <div class="grid grid-cols-2 gap-8px">
            <NTimePicker
              :value="toPickerValue(range.start_at)"
              value-format="t"
              format="HH:mm"
              placeholder="开始时间"
              clearable
              @update:value="updateManualTime(rangeIndex, 'start_at', $event)"
            />
            <NTimePicker
              :value="toPickerValue(range.end_at)"
              value-format="t"
              format="HH:mm"
              placeholder="结束时间"
              clearable
              @update:value="updateManualTime(rangeIndex, 'end_at', $event)"
            />
          </div>
          <div class="text-12px text-[var(--n-text-color-3)]">时间按 5 分钟自动对齐</div>
        </div>
      </NPopover>
    </div>
  </div>
</template>
