<script setup lang="ts">
import { nextTick, shallowRef, useTemplateRef, watch } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { NButton, NModal } from 'naive-ui';
import { Cropper } from 'vue-advanced-cropper';
import { useBoolean, useLoading } from '@sa/hooks';
import { fetchUpdateProjectLogo } from '@/service/api/sys-screen';
import { useAuthStore } from '@/store/modules/auth';
import { $t } from '@/locales';
import FileUpload from '@/components/custom/file-upload.vue';
import 'vue-advanced-cropper/dist/style.css';

defineOptions({
  name: 'ProjectLogo'
});

interface CropperRef {
  getResult: () => {
    canvas: HTMLCanvasElement;
  };
}

const { bool: showModal, setTrue: showModalVisible, setFalse: hideModal } = useBoolean();
const { loading, startLoading, endLoading } = useLoading();
const authStore = useAuthStore();
const cropperRef = useTemplateRef<CropperRef>('cropperRef');
const uploadRef = useTemplateRef<InstanceType<typeof FileUpload>>('uploadRef');
const logo = shallowRef('');
const fileList = shallowRef<UploadFileInfo[]>([]);
const cropperImage = shallowRef('');
const selectedFile = shallowRef<UploadFileInfo | null>(null);

/** 同步基础信息中的项目 Logo，仅用于回显。 */
watch(
  () => authStore.userInfo.project?.logo,
  value => {
    logo.value = value || '';
  },
  { immediate: true }
);

/** 更新或清空项目 Logo。 */
async function handleLogoUpdate(value: string | string[] | undefined) {
  if (typeof value !== 'string') return;

  const { error } = await fetchUpdateProjectLogo({ logo: value });
  if (error) {
    logo.value = authStore.userInfo.project?.logo || '';
    return;
  }

  if (authStore.userInfo.project) authStore.userInfo.project.logo = value;
  window.$message?.success($t('page.userCenter.message.projectLogoUpdateSuccess'));
}

/** 读取待裁剪图片并打开裁剪弹窗。 */
function handleFileChange(data: { file: UploadFileInfo }) {
  const { file } = data;
  if (file.status !== 'pending' || !file.file) return;

  selectedFile.value = file;

  const reader = new FileReader();
  reader.addEventListener('load', () => {
    cropperImage.value = reader.result as string;
    showModalVisible();
  });
  reader.readAsDataURL(file.file);
}

/** 将裁剪结果转换为 PNG 后提交上传。 */
async function handleCrop() {
  if (!cropperRef.value || !selectedFile.value) return;

  startLoading();
  try {
    const { canvas } = cropperRef.value.getResult();
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return;

    const currentFile = selectedFile.value;
    const fileName = currentFile.name.replace(/\.[^.]+$/, '') || 'project-logo';
    const croppedFile = new File([blob], `${fileName}.png`, { type: 'image/png' });
    fileList.value = fileList.value.map(file =>
      file.id === currentFile.id ? { ...file, name: croppedFile.name, file: croppedFile, type: croppedFile.type } : file
    );

    await nextTick();
    uploadRef.value?.submit(currentFile.id);
    selectedFile.value = null;
    hideModal();
  } finally {
    endLoading();
  }
}

/** 关闭弹窗并丢弃未上传文件。 */
function handleClose() {
  if (selectedFile.value) uploadRef.value?.discard(selectedFile.value.id);
  selectedFile.value = null;
  hideModal();
  cropperImage.value = '';
}
</script>

<template>
  <div class="mt-24px w-240px">
    <FileUpload
      ref="uploadRef"
      v-model:value="logo"
      v-model:file-list="fileList"
      module-name="project-logo"
      upload-type="image"
      accept=".jpg,.jpeg,.png,.gif"
      :max="1"
      :file-size="5"
      :show-tip="false"
      :default-upload="false"
      @change="handleFileChange"
      @update:value="handleLogoUpdate"
    />

    <NModal
      v-model:show="showModal"
      preset="card"
      :title="$t('page.userCenter.editProjectLogo')"
      style="width: min(480px, calc(100vw - 32px))"
      @close="handleClose"
    >
      <div class="flex-col-center gap-20px py-20px">
        <div class="h-340px w-full">
          <Cropper ref="cropperRef" class="h-full bg-gray-100" :src="cropperImage" />
        </div>
        <NButton type="primary" class="min-w-100px" :loading="loading" @click="handleCrop">
          {{ $t('page.userCenter.confirmCrop') }}
        </NButton>
      </div>
    </NModal>
  </div>
</template>
