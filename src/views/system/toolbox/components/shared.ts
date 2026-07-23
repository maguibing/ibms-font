export type TestStatus = 'idle' | 'running' | 'success' | 'error';
export type AlertType = 'default' | 'error' | 'info' | 'success' | 'warning';
export type ToolTone = 'primary' | 'success' | 'warning';

export const APP_DOWNLOAD_URL = 'https://autodriver-ibms.oss-cn-beijing.aliyuncs.com/dev/system/app/android.apk.zip';

const STATUS_TEXT: Record<TestStatus, string> = {
  idle: '等待执行',
  running: '执行中',
  success: '执行成功',
  error: '执行失败'
};

const STATUS_TYPE: Record<TestStatus, AlertType> = {
  idle: 'default',
  running: 'info',
  success: 'success',
  error: 'error'
};

const TELNET_STATUS_TEXT: Record<number, string> = {
  1: '连接成功',
  2: '连接被拒绝',
  3: '连接超时',
  4: '网络不可达',
  5: 'DNS 解析失败'
};

export function formatLatency(value?: number, digits = 2) {
  return value === undefined ? '-' : `${value.toFixed(digits)} ms`;
}

export function getStatusText(status: TestStatus) {
  return STATUS_TEXT[status];
}

export function getStatusType(status: TestStatus): AlertType {
  return STATUS_TYPE[status];
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = error as { message?: unknown };

    return message === undefined || message === null || message === '' ? '请求失败' : String(message);
  }

  return '请求失败';
}

export function getTelnetStatusText(status?: number) {
  return status === undefined ? '-' : (TELNET_STATUS_TEXT[status] ?? '未知状态');
}

export function getTelnetStatusType(status?: number): AlertType {
  if (status === 1) return 'success';
  if (status === 3) return 'warning';

  return status === undefined ? 'default' : 'error';
}
