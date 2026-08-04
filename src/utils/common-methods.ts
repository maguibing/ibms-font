import { formatDateTime } from '@sa/utils';
import { localStg } from '@/utils/storage';

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
 * 时间戳格式化为展示时间。
 * @param value 入参：时间戳
 * @param fallback 入参：兜底文案
 * @returns 出参：时间字符串
 */
export function formatTime(value?: number | null, fallback = '-') {
  if (!value) return fallback;

  return formatDateTime(value);
}

/**
 * Unix 秒级时间戳格式化为展示时间。
 * @param value 入参：秒级时间戳
 * @param fallback 入参：兜底文案
 * @returns 出参：时间字符串
 */
export function formatUnixDateTime(value?: number | null, fallback = '-') {
  if (!value) return fallback;

  return formatDateTime(value * 1000);
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
 * 获取 OSS 域名缓存。
 * @param ossDomain 入参：Pinia 中的 OSS 域名
 * @returns 出参：OSS 域名
 */
export function getCachedOssDomain(ossDomain?: string | null) {
  return ossDomain || localStg.get('ossDomain') || '';
}

/**
 * OSS 路径转完整访问地址。
 * @param path 入参：OSS 地址或路径
 * @returns 出参：完整访问地址
 */
export function getOssUrl(path: string) {
  if (!path || /^https?:\/\//.test(path)) return path;

  const domain = getCachedOssDomain().replace(/\/+$/, '');
  if (!domain) return path;

  const normalizedPath = path.replace(/^\/+/, '');
  const environment = import.meta.env.MODE.endsWith('.prod') ? 'prod' : 'dev';
  const fullPath = /^(dev|prod)\//.test(normalizedPath) ? normalizedPath : `${environment}/${normalizedPath}`;

  return `${domain}/${fullPath}`;
}

/**
 * OSS 地址转持久化路径，移除域名和环境目录。
 * @param value 入参：OSS 地址或路径
 * @returns 出参：持久化路径
 */
export function normalizeOssPath(value: string) {
  if (!value) return '';

  const path = /^https?:\/\//.test(value) ? decodeURI(new URL(value).pathname) : value;

  return path.replace(/^\/+/, '').replace(/^(dev|prod)\//, '');
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

export const DefaultChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * 生成指定长度随机字符串。
 * @param length 入参：字符串长度，默认 6
 * @param chars 入参：可选字符集
 * @returns 出参：随机字符串
 */
export function GenRandomKey(length = 6, ...chars: string[]) {
  const c = chars.length > 0 ? chars[0] : DefaultChars;
  let result = '';

  for (let i = 0; i < length; i += 1) {
    result += c.charAt(Math.floor(Math.random() * c.length));
  }

  return result;
}

/**
 * 生成带前缀的随机字符串。
 * @param prefix 入参：前缀
 * @param length 入参：随机字符串长度，默认 6
 * @param chars 入参：可选字符集
 * @returns 出参：带前缀的随机字符串
 */
export function GenKeyWithPrefix(prefix: string, length = 6, ...chars: string[]) {
  let keyPrefix = prefix;

  if (keyPrefix === '') {
    keyPrefix = 'default_';
  }

  if (!keyPrefix.endsWith('_')) {
    keyPrefix += '_';
  }

  return keyPrefix + GenRandomKey(length, ...chars);
}
