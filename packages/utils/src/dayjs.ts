import dayjs from 'dayjs';
import type { ConfigType } from 'dayjs';

export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';
export const DEFAULT_TIME_FORMAT = 'HH:mm:ss';
export const DEFAULT_DATETIME_FORMAT = `${DEFAULT_DATE_FORMAT} ${DEFAULT_TIME_FORMAT}`;

function isNumericString(value: string) {
  return /^-?\d+$/.test(value);
}

function parseUnixLike(input: number | string) {
  const raw = typeof input === 'string' ? Number(input) : input;

  if (!Number.isFinite(raw)) {
    return dayjs(Number.NaN);
  }

  // 10-digit unix timestamp(seconds) is the default in this project.
  if (Math.abs(raw) < 1e12) {
    return dayjs.unix(raw);
  }

  // 13-digit timestamp(milliseconds)
  return dayjs(raw);
}

function parseDate(input: ConfigType) {
  if (typeof input === 'number') {
    return parseUnixLike(input);
  }

  if (typeof input === 'string' && isNumericString(input.trim())) {
    return parseUnixLike(input.trim());
  }

  return dayjs(input);
}

function format(input: ConfigType, pattern: string, fallback = '') {
  const date = parseDate(input);

  return date.isValid() ? date.format(pattern) : fallback;
}

export function formatDateTime(input: ConfigType, pattern = DEFAULT_DATETIME_FORMAT, fallback = '') {
  return format(input, pattern, fallback);
}

export function formatDate(input: ConfigType, pattern = DEFAULT_DATE_FORMAT, fallback = '') {
  return format(input, pattern, fallback);
}

export function formatTime(input: ConfigType, pattern = DEFAULT_TIME_FORMAT, fallback = '') {
  return format(input, pattern, fallback);
}

export function formatByPattern(input: ConfigType, pattern: string, fallback = '') {
  return format(input, pattern, fallback);
}
