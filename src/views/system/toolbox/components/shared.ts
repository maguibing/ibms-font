import { $t } from '@/locales';

export type TestStatus = 'idle' | 'running' | 'success' | 'error';
export type AlertType = 'default' | 'error' | 'info' | 'success' | 'warning';
export type ToolTone = 'primary' | 'success' | 'warning';

export const APP_DOWNLOAD_URL = 'https://autodriver-ibms.oss-cn-beijing.aliyuncs.com/dev/system/app/android.apk.zip';

const STATUS_TEXT: Record<TestStatus, string> = {
  idle: $t('toolbox.status.idle'),
  running: $t('toolbox.status.running'),
  success: $t('toolbox.status.success'),
  error: $t('toolbox.status.error')
};

const STATUS_TYPE: Record<TestStatus, AlertType> = {
  idle: 'default',
  running: 'info',
  success: 'success',
  error: 'error'
};

const TELNET_STATUS_TEXT: Record<number, string> = {
  1: $t('toolbox.status.connected'),
  2: $t('toolbox.status.refused'),
  3: $t('toolbox.status.timedOut'),
  4: $t('toolbox.status.unreachable'),
  5: $t('toolbox.status.dnsFailed')
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

    return message === undefined || message === null || message === ''
      ? $t('toolbox.status.requestFailed')
      : String(message);
  }

  return $t('toolbox.status.requestFailed');
}

export function getTelnetStatusText(status?: number) {
  return status === undefined ? '-' : (TELNET_STATUS_TEXT[status] ?? $t('toolbox.status.unknown'));
}

export function getTelnetStatusType(status?: number): AlertType {
  if (status === 1) return 'success';
  if (status === 3) return 'warning';

  return status === undefined ? 'default' : 'error';
}
