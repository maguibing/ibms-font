const EXTERNAL_RETURN_URL_KEY = 'external_return_url';

// 路由 query 可能是字符串、数组或空值，这里统一转成可用的字符串。
function normalizeQueryValue(value: unknown) {
  if (Array.isArray(value)) {
    return normalizeQueryValue(value[0]);
  }

  return typeof value === 'string' ? value.trim() : '';
}

// 只允许同源地址，避免 return_url 跳到外部站点。
function isSafeReturnUrl(url: string) {
  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * 记录从大屏进入项目平台时携带的 return_url。
 *
 * @param value 路由 query 中的 return_url
 */
export function rememberExternalReturnUrl(value: unknown) {
  const url = normalizeQueryValue(value);
  if (url && isSafeReturnUrl(url)) {
    sessionStorage.setItem(EXTERNAL_RETURN_URL_KEY, url);
  }
}

/**
 * 获取已记录且仍然安全的回跳地址。
 *
 * @returns 回跳地址
 */
export function getExternalReturnUrl() {
  const url = sessionStorage.getItem(EXTERNAL_RETURN_URL_KEY) || '';

  return url && isSafeReturnUrl(url) ? url : '';
}

/**
 * 清除已记录的回跳地址。
 */
export function clearExternalReturnUrl() {
  sessionStorage.removeItem(EXTERNAL_RETURN_URL_KEY);
}
