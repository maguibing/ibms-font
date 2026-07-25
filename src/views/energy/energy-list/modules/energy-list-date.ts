/** 能耗列表支持的聚合粒度：1 小时、2 日、3 月、4 年。 */
export type EnergyAggregationType = 1 | 2 | 3 | 4;

/** Naive UI 日期选择器类型，与聚合粒度一一对应。 */
export type EnergyDatePickerType = 'datetimerange' | 'daterange' | 'monthrange' | 'yearrange';

/** 单个聚合粒度下的日期边界、展示格式和选择器配置。 */
type DateRangeBoundary = {
  end: (date: Date) => Date;
  format: string;
  pickerType: EnergyDatePickerType;
  start: (date: Date) => Date;
  /** 默认开始时间，不配置时使用当前粒度的开始边界。 */
  startDefault?: (date: Date) => Date;
};

/** 小时维度默认查询最近 7 天。 */
const DEFAULT_HOUR_RANGE_DAYS = 7;

/** 将外部传入值收敛到支持的聚合粒度，非法值默认按小时处理。 */
function toAggregationType(value: number): EnergyAggregationType {
  if (value === 2 || value === 3 || value === 4) return value;

  return 1;
}

function toUnixSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

function toDate(value: number) {
  return new Date(value * 1000);
}

// 以下日期工具均返回新的 Date，避免修改调用方传入的对象。
function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function withTime(date: Date, hours: number, minutes: number, seconds: number, milliseconds: number) {
  const nextDate = new Date(date);
  nextDate.setHours(hours, minutes, seconds, milliseconds);

  return nextDate;
}

function startOfHour(date: Date) {
  const nextDate = new Date(date);
  nextDate.setMinutes(0, 0, 0);

  return nextDate;
}

function endOfHour(date: Date) {
  const nextDate = startOfHour(date);
  nextDate.setMinutes(59, 59, 999);

  return nextDate;
}

function startOfDay(date: Date) {
  return withTime(date, 0, 0, 0, 0);
}

function endOfDay(date: Date) {
  return withTime(date, 23, 59, 59, 999);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

function endOfYear(date: Date) {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

/** 聚合粒度到日期边界、选择器类型、显示格式的统一配置。 */
const aggregationDateBoundaryMap: Record<EnergyAggregationType, DateRangeBoundary> = {
  1: {
    end: endOfHour,
    format: 'yyyy-MM-dd HH:00',
    pickerType: 'datetimerange',
    start: startOfHour,
    startDefault: (date: Date) => startOfHour(addDays(date, -DEFAULT_HOUR_RANGE_DAYS))
  },
  2: {
    end: endOfDay,
    format: 'yyyy-MM-dd',
    pickerType: 'daterange',
    start: startOfDay
  },
  3: {
    end: endOfMonth,
    format: 'yyyy-MM',
    pickerType: 'monthrange',
    start: startOfMonth
  },
  4: {
    end: endOfYear,
    format: 'yyyy',
    pickerType: 'yearrange',
    start: startOfYear
  }
};

function getAggregationDateBoundary(aggregationType: number) {
  return aggregationDateBoundaryMap[toAggregationType(aggregationType)];
}

/**
 * 创建指定聚合粒度的默认时间范围。
 *
 * @param aggregationType 聚合类型：1 小时、2 日、3 月、4 年
 * @param now 当前时间，测试时可传入固定时间
 * @returns 秒级时间戳范围
 */
export function createDefaultDateRange(aggregationType: number, now = new Date()): [number, number] {
  const boundary = getAggregationDateBoundary(aggregationType);
  const startDate = boundary.startDefault?.(now) ?? boundary.start(now);

  return [toUnixSeconds(startDate), toUnixSeconds(boundary.end(now))];
}

/**
 * 将选择器时间范围归一化为后端查询边界。
 *
 * @param dateRange 秒级时间戳范围
 * @param aggregationType 聚合类型：1 小时、2 日、3 月、4 年
 * @returns 后端需要的 start_at/end_at；未选择时间时返回 null
 */
export function normalizeDateRange(dateRange: [number, number] | null, aggregationType: number) {
  if (!dateRange?.length) return null;

  const [startAt, endAt] = dateRange;
  const boundary = getAggregationDateBoundary(aggregationType);

  return {
    start_at: toUnixSeconds(boundary.start(toDate(startAt))),
    end_at: toUnixSeconds(boundary.end(toDate(endAt)))
  };
}

/**
 * 获取当前聚合粒度对应的日期选择器类型。
 *
 * @param aggregationType 聚合类型：1 小时、2 日、3 月、4 年
 * @returns Naive UI DatePicker 的 type
 */
export function getDatePickerType(aggregationType: number): EnergyDatePickerType {
  return getAggregationDateBoundary(aggregationType).pickerType;
}

/**
 * 获取当前聚合粒度对应的日期展示格式。
 *
 * @param aggregationType 聚合类型：1 小时、2 日、3 月、4 年
 * @returns Naive UI DatePicker 的 format
 */
export function getDatePickerFormat(aggregationType: number) {
  return getAggregationDateBoundary(aggregationType).format;
}
