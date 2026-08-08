<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';
import type { UploadFileInfo, UploadInst } from 'naive-ui';
import type { ImportBizType } from '@/enum/business';
import { getAuthorizationToken } from '@/store/modules/auth/shared';
import { useDownload } from '@/hooks/business/download';
import { useImportProgress } from '@/hooks/business/import-progress';
import { getServiceBaseURL } from '@/utils/service';
import { getWebSocketConnectionId } from '@/utils/websocket';
import { $t } from '@/locales';

defineOptions({
  name: 'DataImportModal'
});

interface Props {
  bizType: ImportBizType;
  templatePath: string;
  templateFileName: string;
  meta?: Record<string, unknown>;
  taskName?: string;
}

interface Emits {
  submitted: [];
}

const props = withDefaults(defineProps<Props>(), {
  meta: () => ({}),
  taskName: '导入数据'
});

const emit = defineEmits<Emits>();

const { downloadUrl } = useDownload();
const { setImportKey, startImport, stopImport } = useImportProgress();

const { baseURL } = getServiceBaseURL(import.meta.env);

const headers: Record<string, string> = {
  Authorization: getAuthorizationToken(),
  clientid: import.meta.env.VITE_APP_CLIENT_ID!
};

const visible = defineModel<boolean>('visible', {
  default: false
});

const uploadRef = shallowRef<UploadInst | null>(null);
const connectionId = shallowRef('');
const submitting = shallowRef(false);
const fileList = ref<UploadFileInfo[]>([]);

type ImportTaskResponse = {
  code?: number | string;
  data?: {
    import_key?: string;
  };
  msg?: string;
};

function getFileSuffix(fileName: string) {
  const suffixIndex = fileName.lastIndexOf('.');
  return suffixIndex >= 0 ? fileName.slice(suffixIndex) : '';
}

function getUploadData({ file }: { file: UploadFileInfo }) {
  const meta = {
    biz_type: props.bizType,
    ...props.meta,
    file_suffix: getFileSuffix(file.name),
    connection_id: connectionId.value
  };

  return {
    meta: JSON.stringify(meta)
  };
}

function closeModal() {
  visible.value = false;
}

function parseUploadResponse(responseText?: string) {
  if (!responseText) return null;

  try {
    return JSON.parse(responseText) as ImportTaskResponse;
  } catch {
    return null;
  }
}

function getUploadResponse(event?: ProgressEvent) {
  return parseUploadResponse((event?.target as XMLHttpRequest | null)?.responseText);
}

function handleSubmit() {
  if (!fileList.value.length) {
    window.$message?.warning('请选择导入文件');
    return;
  }

  const currentConnectionId = getWebSocketConnectionId();
  if (!currentConnectionId) {
    window.$message?.warning('WebSocket 尚未连接，请稍后重试');
    return;
  }

  connectionId.value = currentConnectionId;
  submitting.value = true;
  fileList.value.forEach(item => {
    item.status = 'pending';
  });
  startImport(props.taskName, () => emit('submitted'));
  uploadRef.value?.submit();
}

function isErrorState(xhr: XMLHttpRequest) {
  const response = parseUploadResponse(xhr.responseText);
  return String(response?.code) !== import.meta.env.VITE_SERVICE_SUCCESS_CODE;
}

function handleFinish(options: { file: UploadFileInfo; event?: ProgressEvent }) {
  const { file, event } = options;
  const response = getUploadResponse(event);
  setImportKey(response?.data?.import_key);
  submitting.value = false;
  visible.value = false;
  window.$message?.success('导入任务已提交');
  return file;
}

function handleError(options: { event?: ProgressEvent }) {
  const { event } = options;
  const response = getUploadResponse(event);
  const msg = response?.msg || $t('common.importFail');
  submitting.value = false;
  stopImport();
  window.$message?.error(msg);
}

function handleDownloadTemplate() {
  downloadUrl(props.templatePath, props.templateFileName);
}

watch(visible, () => {
  if (visible.value) {
    fileList.value = [];
    submitting.value = false;
    connectionId.value = '';
  }
});
</script>

<template>
  <NModal
    v-model:show="visible"
    :title="$t('common.import')"
    preset="card"
    :bordered="false"
    display-directive="show"
    class="max-w-90% w-600px"
    @close="closeModal"
  >
    <NUpload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="`${baseURL}/ImportTask`"
      name="file_data"
      :headers="headers"
      :data="getUploadData"
      :max="1"
      :file-size="50"
      accept=".xls,.xlsx"
      :multiple="false"
      directory-dnd
      :default-upload="false"
      list-type="text"
      :disabled="submitting"
      :is-error-state="isErrorState"
      @finish="handleFinish"
      @error="handleError"
    >
      <NUploadDragger>
        <div class="mb-12px flex-center">
          <SvgIcon icon="material-symbols:unarchive-outline" class="text-58px color-#d8d8db dark:color-#a1a1a2" />
        </div>
        <NText class="text-16px">{{ $t('common.importTip') }}</NText>
        <NP depth="3" class="mt-8px text-center">
          {{ $t('common.importSize') }}
          <b class="text-red-500">50MB</b>
          {{ $t('common.importFormat') }}
          <b class="text-red-500">xls/xlsx</b>
          {{ $t('common.importEnd') }}
        </NP>
      </NUploadDragger>
    </NUpload>

    <template #footer>
      <NSpace justify="end" :size="16">
        <NButton @click="handleDownloadTemplate">{{ $t('common.downloadTemplate') }}</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">{{ $t('common.import') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
