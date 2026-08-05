<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue';
import { NCalendar, NDatePicker } from 'naive-ui';
import { ExportBizType, ExportFileType } from '@/enum/business';
import { useAuth } from '@/hooks/business/auth';
import { useExportProgress } from '@/hooks/business/export-progress';
import { fetchExportTask } from '@/service/api/common';
import { fetchGetEnergyCalendar } from '@/service/api/energy';
import { displayValue } from '@/utils/common-methods';
import { getWebSocketConnectionId } from '@/utils/websocket';

defineOptions({
  name: 'EffroomEnergyCalendar'
});

type CalendarItem = Api.Energy.EnergyCalendarItem;
type TimeRange = Api.Energy.EnergyCalendarParams['time_range'];
type YearMonth = {
  year: number;
  month: number;
};

const ENERGY_CALENDAR_STAT_TYPE = 2;

const calendarKey = shallowRef(0);
const panelMonth = shallowRef<YearMonth>(createCurrentYearMonth());
const calendarValue = shallowRef(createCalendarValue(panelMonth.value));
const loading = shallowRef(false);
const timeRange = shallowRef<TimeRange>(createMonthRange(panelMonth.value));
const calendarList = shallowRef<CalendarItem[]>([]);
const { hasAuth } = useAuth();
const calendarMap = computed(() =>
  calendarList.value.reduce<Record<string, CalendarItem>>((map, item) => {
    map[createDateKeyFromUnix(item.ts)] = item;

    return map;
  }, {})
);
const panelMonthValue = computed(() => createDateValue(panelMonth.value.year, panelMonth.value.month, 1));
const { startExport, stopExport } = useExportProgress();

function createCurrentYearMonth(): YearMonth {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1
  };
}

function padDatePart(value: number) {
  return String(value).padStart(2, '0');
}

function createDateKey(year: number, month: number, date: number) {
  return `${year}-${padDatePart(month)}-${padDatePart(date)}`;
}

function createYearMonthKey(value: YearMonth) {
  return `${value.year}-${padDatePart(value.month)}`;
}

function createDateKeyFromUnix(value: number) {
  const date = new Date(value * 1000);

  return createDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function createDateValue(year: number, month: number, date: number) {
  return new Date(year, month - 1, date, 0, 0, 0).getTime();
}

function createCalendarValue(value: YearMonth) {
  const currentMonth = createCurrentYearMonth();

  if (compareYearMonth(value, currentMonth) === 0) {
    return Date.now();
  }

  return createDateValue(value.year, value.month, 1);
}

function createMonthRange(value: YearMonth): TimeRange {
  const currentMonth = createCurrentYearMonth();
  const now = new Date();
  const startAt = new Date(value.year, value.month - 1, 1, 0, 0, 0);
  const endAt =
    compareYearMonth(value, currentMonth) === 0
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      : new Date(value.year, value.month, 0, 23, 59, 59);

  return {
    start_at: Math.floor(startAt.getTime() / 1000),
    end_at: Math.floor(endAt.getTime() / 1000)
  };
}

function compareYearMonth(source: YearMonth, target: YearMonth) {
  return source.year * 12 + source.month - (target.year * 12 + target.month);
}

function isFutureYearMonth(value: YearMonth) {
  return compareYearMonth(value, createCurrentYearMonth()) > 0;
}

function getCurrentDayEndValue() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();
}

function getCalendarItem(year: number, month: number, date: number) {
  return calendarMap.value[createDateKey(year, month, date)];
}

function isVisibleDate(year: number, month: number, date: number) {
  const value = createDateValue(year, month, date);

  return value >= timeRange.value.start_at * 1000 && value <= timeRange.value.end_at * 1000;
}

function formatCalendarValue(value: unknown) {
  return displayValue(value ?? 0);
}

function isDateDisabled(value: number) {
  return value > getCurrentDayEndValue();
}

function isMonthDisabled(value: number) {
  const date = new Date(value);

  return isFutureYearMonth({
    year: date.getFullYear(),
    month: date.getMonth() + 1
  });
}

function setPanelMonth(value: YearMonth) {
  if (isFutureYearMonth(value) || createYearMonthKey(value) === createYearMonthKey(panelMonth.value)) return;

  panelMonth.value = value;
  calendarValue.value = createCalendarValue(value);
  calendarKey.value += 1;
  getData(value);
}

function handlePanelChange(value: YearMonth) {
  setPanelMonth(value);
}

function handleMonthUpdate(value: number | null) {
  if (!value) return;

  const date = new Date(value);

  setPanelMonth({
    year: date.getFullYear(),
    month: date.getMonth() + 1
  });
}

async function getData(value = panelMonth.value) {
  const requestMonthKey = createYearMonthKey(value);

  loading.value = true;

  try {
    const currentRange = createMonthRange(value);
    timeRange.value = currentRange;
    const { data, error } = await fetchGetEnergyCalendar({
      stat_type: ENERGY_CALENDAR_STAT_TYPE,
      time_range: currentRange
    });

    if (error || requestMonthKey !== createYearMonthKey(panelMonth.value)) return;

    calendarList.value = Array.isArray(data?.list) ? data.list : [];
  } finally {
    if (requestMonthKey === createYearMonthKey(panelMonth.value)) {
      loading.value = false;
    }
  }
}

async function handleExport() {
  const connectionId = getWebSocketConnectionId();
  if (!connectionId) {
    window.$message?.warning('WebSocket 尚未连接，请稍后重试');
    return;
  }

  startExport('能效日历');

  const { error } = await fetchExportTask({
    energy_calendar: {
      stat_type: ENERGY_CALENDAR_STAT_TYPE,
      time_range: timeRange.value
    },
    connection_id: connectionId,
    export_biz_type: ExportBizType.EnergyCalendar,
    file_type: ExportFileType.Excel,
    list_option: {}
  });

  if (error) {
    stopExport();
    return;
  }

  window.$message?.success('导出任务已提交');
}

onMounted(getData);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard title="能效日历" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <NSpin :show="loading">
        <NCalendar
          :key="calendarKey"
          v-model:value="calendarValue"
          :default-value="calendarValue"
          :is-date-disabled="isDateDisabled"
          class="h-[calc(100vh_-_190px)] min-h-620px [&_.n-calendar-cell]:p-8px [&_.n-calendar-cell_.n-calendar-date]:!pb-0 [&_.n-calendar-header__extra]:hidden [&_.n-calendar-header__title]:(min-w-0 flex-1) lt-sm:(h-auto min-h-620px)"
          @panel-change="handlePanelChange"
        >
          <template #header>
            <div class="min-w-0 w-full flex flex-wrap items-center justify-between gap-x-12px gap-y-8px">
              <div class="flex items-center gap-8px">
                <NDatePicker
                  type="month"
                  size="small"
                  :value="panelMonthValue"
                  :clearable="false"
                  :is-date-disabled="isMonthDisabled"
                  class="w-140px"
                  @update:value="handleMonthUpdate"
                />
                <NButton v-if="hasAuth('effroom:energy-calendar:export')" size="small" @click="handleExport">
                  <template #icon><SvgIcon icon="material-symbols:download-rounded" /></template>
                  导出
                </NButton>
              </div>
              <div class="flex shrink-0 flex-wrap items-center justify-end gap-x-12px gap-y-6px text-12px">
                <span class="inline-flex items-center gap-5px text-[var(--n-text-color-3)]">
                  <span class="h-7px w-7px rounded-full bg-[rgb(var(--primary-color))]"></span>
                  COP
                </span>
                <span class="inline-flex items-center gap-5px text-[var(--n-text-color-3)]">
                  <span class="h-7px w-7px rounded-full bg-[var(--n-text-color)]"></span>
                  能耗(kWh)
                </span>
                <span class="inline-flex items-center gap-5px text-[var(--n-text-color-3)]">
                  <span class="h-7px w-7px rounded-full bg-[#18a058]"></span>
                  冷量(kWh)
                </span>
              </div>
            </div>
          </template>

          <template #default="{ year, month, date }">
            <div
              v-if="isVisibleDate(year, month, date)"
              class="absolute bottom-8px left-8px right-8px top-36px min-w-0"
              :class="{ 'opacity-72': !getCalendarItem(year, month, date) }"
            >
              <div
                class="h-full min-w-0 flex flex-col overflow-hidden border border-[rgba(148,163,184,0.18)] rounded-6px bg-[var(--n-card-color)] shadow-[0_4px_14px_rgba(15,23,42,0.06)]"
              >
                <div
                  class="min-h-0 min-w-0 flex flex-1 items-center justify-center border-b border-b-[rgba(148,163,184,0.12)] bg-[rgba(var(--primary-color),0.07)] px-6px"
                >
                  <div class="min-w-0 flex items-center justify-center gap-6px text-center leading-none">
                    <span
                      class="h-20px w-20px flex-center shrink-0 rounded-full bg-[rgba(var(--primary-color),0.14)] text-[rgb(var(--primary-color))]"
                    >
                      <SvgIcon icon="material-symbols:speed-outline-rounded" class="text-13px" />
                    </span>
                    <span class="shrink-0 text-11px text-[rgba(var(--primary-color),0.82)] font-500">COP</span>
                    <span class="min-w-0 truncate text-14px text-[rgb(var(--primary-color))] font-700">
                      {{ formatCalendarValue(getCalendarItem(year, month, date)?.cop) }}
                    </span>
                  </div>
                </div>
                <div
                  class="min-h-0 min-w-0 flex flex-1 items-center justify-center border-b border-b-[rgba(148,163,184,0.12)] bg-[rgba(100,116,139,0.06)] px-6px"
                >
                  <div class="min-w-0 flex items-center justify-center gap-6px text-center leading-none">
                    <span
                      class="h-20px w-20px flex-center shrink-0 rounded-full bg-[rgba(100,116,139,0.12)] text-[var(--n-text-color-2)]"
                    >
                      <SvgIcon icon="material-symbols:electric-bolt-outline-rounded" class="text-13px" />
                    </span>
                    <span class="shrink-0 text-11px text-[var(--n-text-color-3)] font-500">能耗</span>
                    <span class="min-w-0 truncate text-14px text-[var(--n-text-color)] font-700">
                      {{ formatCalendarValue(getCalendarItem(year, month, date)?.energy) }}
                    </span>
                  </div>
                </div>
                <div class="min-h-0 min-w-0 flex flex-1 items-center justify-center bg-[rgba(24,160,88,0.07)] px-6px">
                  <div class="min-w-0 flex items-center justify-center gap-6px text-center leading-none">
                    <span
                      class="h-20px w-20px flex-center shrink-0 rounded-full bg-[rgba(24,160,88,0.13)] text-[#18a058]"
                    >
                      <SvgIcon icon="material-symbols:ac-unit-rounded" class="text-13px" />
                    </span>
                    <span class="shrink-0 text-11px text-[var(--n-text-color-3)] font-500">冷量</span>
                    <span class="min-w-0 truncate text-14px text-[#18a058] font-700">
                      {{ formatCalendarValue(getCalendarItem(year, month, date)?.cooling) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </NCalendar>
      </NSpin>
    </NCard>
  </div>
</template>
