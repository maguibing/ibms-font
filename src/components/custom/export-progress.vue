<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue';
import { ExportStatus, MessageType } from '@/enum/business';
import { useExportProgress } from '@/hooks/business/export-progress';
import { addWebSocketMessageListener } from '@/utils/websocket';

defineOptions({
  name: 'ExportProgress'
});

const { dialogVisible, exportStatus, handleExportMessage, progress } = useExportProgress();

const statusText = computed(() => {
  const statusTextMap: Record<ExportStatus, string> = {
    [ExportStatus.NotStarted]: '等待开始...',
    [ExportStatus.Preparing]: '正在准备导出文件...',
    [ExportStatus.Exporting]: '正在导出...',
    [ExportStatus.Completed]: '导出完成',
    [ExportStatus.Failed]: '导出失败'
  };

  return statusTextMap[exportStatus.value] || '未知状态';
});

const progressStatus = computed(() => {
  if (exportStatus.value === ExportStatus.Failed) return 'error';
  if (exportStatus.value === ExportStatus.Completed) return 'success';

  return 'default';
});

const removeExportMessageListener = addWebSocketMessageListener(MessageType.ExportTask, handleExportMessage);

onBeforeUnmount(removeExportMessageListener);
</script>

<template>
  <NModal
    v-model:show="dialogVisible"
    preset="card"
    title="导出进度"
    :closable="false"
    :mask-closable="false"
    :close-on-esc="false"
    class="max-w-90vw w-400px"
  >
    <div class="flex-col gap-16px">
      <NText>{{ statusText }}</NText>
      <NProgress type="line" :percentage="progress" :status="progressStatus" processing />
    </div>
  </NModal>
</template>

<style scoped></style>
