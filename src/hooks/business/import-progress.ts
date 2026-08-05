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

function normalizeProgress(value?: number) {
  return Math.min(100, Math.max(0, Number(value) || 0));
}

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

function resetImportResult() {
  resultVisible.value = false;
  resultTitle.value = '导入结果';
  resultMessage.value = '';
  resultRows.value = [];
}

function openImportResult(title: string, result: ImportParsedMessage) {
  resultTitle.value = title;
  resultMessage.value = result.message;
  resultRows.value = result.rows;
  resultVisible.value = true;
}

/** 管理导入任务进度。 */
export function useImportProgress() {
  function handleImportMessage(message: WebSocketMessage) {
    if (!dialogVisible.value) return;

    const payload = decodeWebSocketPayload<ImportTaskMessagePayload>(message.payload);
    if (!payload) return;
    if (importKey && payload.import_key && payload.import_key !== importKey) return;

    importStatus.value = Number(payload.import_status) as ImportStatus;
    progress.value = normalizeProgress(payload.progress);

    if (importStatus.value === ImportStatus.Completed || importStatus.value === ImportStatus.PartiallySuccess) {
      dialogVisible.value = false;
      progress.value = 100;

      const handler = completedHandler;
      completedHandler = null;
      importKey = '';

      if (importStatus.value === ImportStatus.PartiallySuccess) {
        const result = getImportResult(payload.err_msg || payload.msg);
        if (result.rows.length) {
          openImportResult('导入部分成功', result);
        } else {
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
      dialogVisible.value = false;
      completedHandler = null;
      importKey = '';
      const result = getImportResult(payload.err_msg || payload.msg);
      if (result.rows.length) {
        openImportResult('导入失败', result);
        return;
      }

      window.$notification?.error({
        title: '导入失败',
        content: result.message || '导入任务失败，请重试',
        duration: 3000
      });
    }
  }

  function startImport(importTaskName = '导入数据', onCompleted?: CompletedHandler) {
    resetImportResult();
    dialogVisible.value = true;
    importStatus.value = ImportStatus.NotStarted;
    progress.value = 0;
    importName = importTaskName;
    importKey = '';
    completedHandler = onCompleted ?? null;
  }

  function setImportKey(key?: string) {
    importKey = key ?? '';
  }

  function stopImport() {
    dialogVisible.value = false;
    resetImportResult();
    importKey = '';
    completedHandler = null;
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
