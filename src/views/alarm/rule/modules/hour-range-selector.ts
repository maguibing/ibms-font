export interface TimeRange {
  start_at: number;
  end_at: number;
}

export interface TimeRangeInput {
  start_at?: number | null;
  end_at?: number | null;
}

export function parseHoursFromRanges(ranges: TimeRangeInput[]) {
  const hours = new Set<number>();

  for (const range of ranges) {
    const startAt = normalizeStartHour(range);
    const endAt = normalizeHour(range.end_at);

    if (startAt === null || endAt === null || startAt > endAt) continue;

    for (let hour = startAt; hour <= endAt; hour += 1) {
      hours.add(hour);
    }
  }

  return hours;
}

export function buildRangesFromHours(hourList: Iterable<number>): TimeRange[] {
  const sortedHours = Array.from(new Set(Array.from(hourList).filter(isValidHour))).sort((a, b) => a - b);
  const ranges: TimeRange[] = [];

  let startHour = sortedHours[0];
  let previousHour = sortedHours[0];

  for (const hour of sortedHours.slice(1)) {
    if (hour === previousHour + 1) {
      previousHour = hour;
      continue;
    }

    ranges.push({ start_at: startHour, end_at: previousHour });
    startHour = hour;
    previousHour = hour;
  }

  if (startHour !== undefined && previousHour !== undefined) {
    ranges.push({ start_at: startHour, end_at: previousHour });
  }

  return ranges;
}

export function formatHourRange(range: TimeRange) {
  if (range.start_at === range.end_at) return String(range.start_at);

  return `${range.start_at} ~ ${range.end_at}`;
}

function normalizeStartHour(range: TimeRangeInput) {
  // 后端开始小时为 0 时可能省略 start_at。
  if (range.start_at === undefined) return 0;

  return normalizeHour(range.start_at);
}

function normalizeHour(value: unknown) {
  const numberValue = Math.trunc(Number(value));

  if (!Number.isInteger(numberValue) || !isValidHour(numberValue)) return null;

  return numberValue;
}

function isValidHour(hour: number) {
  return Number.isInteger(hour) && hour >= 0 && hour <= 23;
}
