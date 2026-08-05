import { shallowRef } from 'vue';
import { ImportStatus } from '@/enum/business';
import { safeDecodeBase64ToText } from '@/utils/base64';
import { decodeWebSocketPayload, type WebSocketMessage } from '@/utils/websocket';

type ImportTaskMessagePayload = {
  import_key?: string;
  import_status: ImportStatus;
  progress?: number;
  err_msg?: string;
  msg?: string;
};

type CompletedHandler = () => void | Promise<void>;

export type ImportResultRow = {
  row_index?: number;
  reason: string;
};

type ImportParsedMessage = {
  message: string;
  rows: ImportResultRow[];
};

// 进度状态由上传弹窗启动，由全局进度组件消费。
const dialogVisible = shallowRef(false);
const importStatus = shallowRef(ImportStatus.NotStarted);
const progress = shallowRef(0);
const resultVisible = shallowRef(false);
const resultTitle = shallowRef('导入结果');
const resultMessage = shallowRef('');
const resultRows = shallowRef<ImportResultRow[]>([]);
let importName = '导入数据';
let importKey = '';
let completedHandler: CompletedHandler | null = null;

/** 规范化进度值。 */
function normalizeProgress(value?: number) {
  return Math.min(100, Math.max(0, Number(value) || 0));
}

/**
 * 解析导入失败明细。
 *
 * @param value 后端返回的错误明细
 * @returns 可展示的错误行
 */
function parseImportResultRows(value: unknown): ImportResultRow[] {
  if (!Array.isArray(value)) return [];

  const rows: ImportResultRow[] = [];

  value.forEach(item => {
    if (!item || typeof item !== 'object') return;

    const row = item as { reason?: unknown; row_index?: unknown };
    const reason = String(row.reason ?? '');
    if (!reason) return;

    rows.push({
      row_index: Number.isFinite(Number(row.row_index)) ? Number(row.row_index) : undefined,
      reason
    });
  });

  return rows;
}

/**
 * 解析导入结果消息。
 *
 * @param message 后端返回的原始消息
 * @returns 导入结果摘要和错误行
 */
function getImportResult(message?: string): ImportParsedMessage {
  if (!message) return { message: '', rows: [] };

  const decoded = safeDecodeBase64ToText(message);

  try {
    const data = JSON.parse(decoded) as unknown;
    const rows = parseImportResultRows(data);
    if (rows.length) {
      return {
        message: `共 ${rows.length} 条错误`,
        rows
      };
    }

    if (data && typeof data === 'object') {
      const result = data as { error?: string; msg?: string };

      return {
        message: result.error || result.msg || decoded,
        rows: []
      };
    }

    return {
      message: decoded,
      rows: []
    };
  } catch {
    return {
      message: decoded,
      rows: []
    };
  }
}

/** 重置导入结果弹窗状态。 */
function resetImportResult() {
  resultVisible.value = false;
  resultTitle.value = '导入结果';
  resultMessage.value = '';
  resultRows.value = [];
}

/**
 * 打开导入结果弹窗。
 *
 * @param title 弹窗标题
 * @param result 导入结果
 */
function openImportResult(title: string, result: ImportParsedMessage) {
  resultTitle.value = title;
  resultMessage.value = result.message;
  resultRows.value = result.rows;
  resultVisible.value = true;
}

/**
 * 关闭当前导入任务并取出完成回调。
 *
 * @returns 当前任务完成回调
 */
function closeImportTask() {
  dialogVisible.value = false;

  const handler = completedHandler;
  completedHandler = null;
  importKey = '';

  return handler;
}

/**
 * 有错误明细时打开结果弹窗。
 *
 * @param title 弹窗标题
 * @param result 导入结果
 * @returns 是否打开了结果弹窗
 */
function openImportRows(title: string, result: ImportParsedMessage) {
  if (!result.rows.length) return false;

  openImportResult(title, result);

  return true;
}

/** 管理导入任务进度。 */
export function useImportProgress() {
  /**
   * 处理导入任务 WebSocket 消息。
   *
   * @param message WebSocket 消息
   */
  function handleImportMessage(message: WebSocketMessage) {
    if (!dialogVisible.value) return;

    const payload = decodeWebSocketPayload<ImportTaskMessagePayload>(message.payload);
    if (!payload) return;
    if (importKey && payload.import_key && payload.import_key !== importKey) return;

    importStatus.value = Number(payload.import_status) as ImportStatus;
    progress.value = normalizeProgress(payload.progress);

    if (importStatus.value === ImportStatus.Completed || importStatus.value === ImportStatus.PartiallySuccess) {
      const handler = closeImportTask();
      progress.value = 100;

      if (importStatus.value === ImportStatus.PartiallySuccess) {
        const result = getImportResult(payload.err_msg || payload.msg);
        if (!openImportRows('导入部分成功', result)) {
          window.$notification?.warning({
            title: '导入部分成功',
            content: result.message || `${importName}部分成功`,
            duration: 3000
          });
        }
      } else {
        window.$notification?.success({
          title: '导入完成',
          content: getImportResult(payload.msg).message || `${importName}已完成`,
          duration: 3000
        });
      }

      void handler?.();
      return;
    }

    if (importStatus.value === ImportStatus.Failed) {
      closeImportTask();
      const result = getImportResult(payload.err_msg || payload.msg);
      if (openImportRows('导入失败', result)) {
        return;
      }

      window.$notification?.error({
        title: '导入失败',
        content: result.message || '导入任务失败，请重试',
        duration: 3000
      });
    }
  }

  /**
   * 开始导入任务。
   *
   * @param importTaskName 导入任务名称
   * @param onCompleted 完成回调
   */
  function startImport(importTaskName = '导入数据', onCompleted?: CompletedHandler) {
    resetImportResult();
    dialogVisible.value = true;
    importStatus.value = ImportStatus.NotStarted;
    progress.value = 0;
    importName = importTaskName;
    importKey = '';
    completedHandler = onCompleted ?? null;
  }

  /**
   * 设置当前导入任务标识。
   *
   * @param key 导入任务标识
   */
  function setImportKey(key?: string) {
    importKey = key ?? '';
  }

  /** 停止导入任务。 */
  function stopImport() {
    closeImportTask();
    resetImportResult();
  }

  return {
    dialogVisible,
    handleImportMessage,
    importStatus,
    progress,
    resultMessage,
    resultRows,
    resultTitle,
    resultVisible,
    setImportKey,
    startImport,
    stopImport
  };
}
