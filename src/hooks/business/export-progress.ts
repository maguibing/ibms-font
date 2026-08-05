import { shallowRef } from 'vue';
import { ExportStatus } from '@/enum/business';
import { useDownload } from '@/hooks/business/download';
import { decodeWebSocketPayload, type WebSocketMessage } from '@/utils/websocket';

type ExportTaskMessagePayload = {
  export_status: ExportStatus;
  progress?: number;
  download_url?: string;
  err_msg?: string;
};

const dialogVisible = shallowRef(false);
const exportStatus = shallowRef(ExportStatus.NotStarted);
const progress = shallowRef(0);
let fileName = '导出数据';

/** 管理导出任务进度及文件下载。 */
export function useExportProgress() {
  const { downloadUrl: downloadFile } = useDownload();

  function handleExportMessage(message: WebSocketMessage) {
    if (!dialogVisible.value) return;

    const payload = decodeWebSocketPayload<ExportTaskMessagePayload>(message.payload);
    if (!payload) return;

    exportStatus.value = Number(payload.export_status) as ExportStatus;
    progress.value = Math.min(100, Math.max(0, Number(payload.progress) || 0));

    if (exportStatus.value === ExportStatus.Completed && payload.download_url) {
      dialogVisible.value = false;

      downloadFile(payload.download_url, fileName);
      window.$notification?.success({
        title: '导出完成',
        content: `${fileName}已开始下载`,
        duration: 3000
      });
      return;
    }

    if (exportStatus.value === ExportStatus.Failed) {
      dialogVisible.value = false;
      window.$notification?.error({
        title: '导出失败',
        content: payload.err_msg || '导出任务失败，请重试',
        duration: 3000
      });
    }
  }

  function startExport(exportFileName = '导出数据') {
    dialogVisible.value = true;
    exportStatus.value = ExportStatus.NotStarted;
    progress.value = 0;
    fileName = exportFileName;
  }

  function stopExport() {
    dialogVisible.value = false;
  }

  return {
    dialogVisible,
    exportStatus,
    handleExportMessage,
    progress,
    startExport,
    stopExport
  };
}
