/**
 * 空值转兜底文案，非空值转字符串。
 * @param value 入参：原始值
 * @param fallback 入参：兜底文案
 * @returns 出参：展示字符串
 */
export function displayValue(value: unknown, fallback = '-') {
  if (value === null || value === undefined || value === '') return fallback;

  return String(value);
}

/**
 * 金额格式化为两位小数字符串。
 * @param value 入参：金额
 * @param fallback 入参：兜底文案
 * @returns 出参：金额字符串
 */
export function formatPrice(value?: number | null, fallback = '-') {
  if (value === null || value === undefined) return fallback;

  return Number(value).toFixed(2);
}

/**
 * 转数字，失败时返回兜底值。
 * @param value 入参：原始值
 * @param fallback 入参：兜底数字
 * @returns 出参：数字
 */
export function toNumberValue(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

/**
 * 时间戳转日期输入值。
 * @param value 入参：时间戳
 * @returns 出参：字符串时间戳或 `null`
 */
export function toDateValue(value: number | null | undefined) {
  if (!value) return null;

  return String(value);
}
