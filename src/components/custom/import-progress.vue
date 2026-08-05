<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import { ImportStatus, MessageType } from '@/enum/business';
import { useImportProgress } from '@/hooks/business/import-progress';
import type { ImportResultRow } from '@/hooks/business/import-progress';
import { addWebSocketMessageListener } from '@/utils/websocket';

defineOptions({
  name: 'ImportProgress'
});

const {
  dialogVisible,
  handleImportMessage,
  importStatus,
  progress,
  resultMessage,
  resultRows,
  resultTitle,
  resultVisible
} = useImportProgress();

const resultColumns: DataTableColumns<ImportResultRow> = [
  {
    key: 'row_index',
    title: '行号',
    align: 'center',
    width: 120,
    render: row => row.row_index ?? '-'
  },
  {
    key: 'reason',
    title: '错误原因',
    minWidth: 320,
    align: 'center',
    ellipsis: {
      tooltip: true
    }
  }
];

const statusText = computed(() => {
  const statusTextMap: Record<ImportStatus, string> = {
    [ImportStatus.NotStarted]: '等待开始...',
    [ImportStatus.Preparing]: '正在准备导入数据...',
    [ImportStatus.Importing]: '正在导入...',
    [ImportStatus.Completed]: '导入完成',
    [ImportStatus.Failed]: '导入失败',
    [ImportStatus.PartiallySuccess]: '部分成功'
  };

  return statusTextMap[importStatus.value] || '未知状态';
});

const progressStatus = computed(() => {
  if (importStatus.value === ImportStatus.Failed) return 'error';
  if (importStatus.value === ImportStatus.Completed) return 'success';
  if (importStatus.value === ImportStatus.PartiallySuccess) return 'warning';

  return 'default';
});

const removeImportMessageListener = addWebSocketMessageListener(MessageType.ImportTask, handleImportMessage);

onBeforeUnmount(removeImportMessageListener);
</script>

<template>
  <NModal
    v-model:show="dialogVisible"
    preset="card"
    title="导入进度"
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

  <NModal v-model:show="resultVisible" preset="card" :title="resultTitle" class="max-w-90vw w-720px">
    <div class="flex-col gap-12px">
      <NText v-if="resultMessage" depth="3">{{ resultMessage }}</NText>
      <NDataTable
        v-if="resultRows.length"
        :columns="resultColumns"
        :data="resultRows"
        :pagination="false"
        :bordered="false"
        size="small"
        :max-height="360"
      />
      <NEmpty v-else description="暂无错误明细" />
    </div>
  </NModal>
</template>

<style scoped></style>
