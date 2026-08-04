<script setup lang="tsx">
import { computed, defineComponent, watch } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import type { JSX } from 'vue/jsx-runtime';
import { getToken } from '@/store/modules/auth/shared';
import { getServiceBaseURL } from '@/utils/service';
import { AcceptType } from '@/enum/business';
import { GenRandomKey, getOssUrl, normalizeOssPath } from '@/utils/common-methods';

defineOptions({
  name: 'FileUpload',
  inheritAttrs: false
});

interface Props {
  /** 上传接口地址 */
  action?: string;
  /** 额外上传参数 */
  data?: Record<string, any>;
  /** 选择文件后是否立即上传 */
  defaultUpload?: boolean;
  /** 是否显示上传提示 */
  showTip?: boolean;
  /** 最大上传数量 */
  max?: number;
  /** 允许上传的文件类型 */
  accept?: string;
  /** 单个文件大小限制，单位 MB */
  fileSize?: number;
  /** 上传类型 */
  uploadType?: 'file' | 'image';
  /** OSS 模块目录名称 */
  moduleName?: string;
}

type UploadFileInfoWithPath = UploadFileInfo & {
  /** 业务提交使用的 OSS 路径，不替换 Naive UI 内部 id */
  storagePath?: string;
};

const props = withDefaults(defineProps<Props>(), {
  action: `/Upload`,
  data: undefined,
  defaultUpload: true,
  showTip: true,
  max: 5,
  accept: undefined,
  fileSize: 5,
  uploadType: 'file',
  moduleName: 'common'
});

const accept = computed(() => {
  if (props.accept) {
    return props.accept;
  }
  return props.uploadType === 'file' ? AcceptType.File : AcceptType.Image;
});

let fileNum = 0;
let syncedValueKey: string | null = null;
/** 业务值：单文件为路径字符串，多文件为路径数组 */
const value = defineModel<string | string[]>('value');
/** Naive UI 上传列表 */
const fileList = defineModel<UploadFileInfo[]>('fileList', {
  default: () => []
});

/** 上传限制提示内容 */
const TooltipContent = defineComponent({
  setup() {
    const startTip = <>请上传</>;

    const maxTip = (
      <>
        数量不超过
        <b class="text-info"> {props.max}个</b>，
      </>
    );

    const fileSizeTip = (
      <>
        大小不超过
        <b class="text-info"> {props.fileSize}MB</b>，
      </>
    );

    const acceptTip = (
      <>
        格式为
        <b class="text-info"> {props.accept?.replaceAll(',', ', ')} </b>
      </>
    );

    const tips: JSX.Element[] = [];
    if (props.max) tips.push(maxTip);
    if (props.fileSize) tips.push(fileSizeTip);
    if (props.accept) tips.push(acceptTip);

    const endTip = (
      <>
        {tips.length ? '的' : ''}
        {props.uploadType === 'file' ? '文件' : '图片'}
      </>
    );

    return () => (
      <NP depth={3}>
        {startTip}
        {tips.map(tip => tip)}
        {endTip}
      </NP>
    );
  }
});

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);
const uploadEnvironment = import.meta.env.MODE.endsWith('.prod') ? 'prod' : 'dev';
const uploadPlatform = import.meta.env.MODE.startsWith('pt.')
  ? 'platform'
  : import.meta.env.MODE.startsWith('cp.')
    ? 'corp'
    : 'project';

const headers: Record<string, string> = {
  Authorization: `Bearer ${getToken()}`,
  clientid: import.meta.env.VITE_APP_CLIENT_ID!
};

/**
 * 获取文件后缀。
 * @param fileName 文件名称
 * @returns 文件后缀
 */
function getFileSuffix(fileName: string) {
  const nameParts = fileName.split('.');
  return nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
}

/**
 * 获取不含后缀的文件名称。
 * @param fileName 文件名称
 * @returns 文件主名称
 */
function getFileName(fileName: string) {
  const suffixIndex = fileName.lastIndexOf('.');
  return suffixIndex > 0 ? fileName.slice(0, suffixIndex) : fileName;
}

/**
 * 将组件业务值统一转为路径数组。
 * @param uploadValue 单文件路径或多文件路径
 * @returns 路径数组
 */
function getValuePaths(uploadValue: string | string[] | undefined) {
  if (Array.isArray(uploadValue)) return uploadValue.filter(Boolean);
  return uploadValue ? [uploadValue] : [];
}

/**
 * 获取文件对应的业务存储路径。
 * @param file 上传文件信息
 * @returns OSS 路径
 */
function getStoragePath(file: UploadFileInfo) {
  const storagePath = (file as UploadFileInfoWithPath).storagePath;
  if (storagePath) return storagePath;

  return file.status === 'finished' && file.id ? String(file.id) : '';
}

/**
 * 根据业务路径生成图片回显列表。
 * @param paths OSS 路径列表
 * @returns 上传文件列表
 */
function buildFileList(paths: string[]): UploadFileInfo[] {
  return paths.map(path => ({
    id: path,
    storagePath: path,
    name: path.split('/').pop() || '文件',
    status: 'finished',
    url: getOssUrl(path)
  }));
}

/**
 * 同步上传结果到业务绑定值。
 * @param paths OSS 路径列表
 */
function updateValue(paths: string[]) {
  if (value.value === undefined) return;
  const valueKey = JSON.stringify(paths);
  if (valueKey === JSON.stringify(getValuePaths(value.value))) return;

  syncedValueKey = valueKey;
  value.value = Array.isArray(value.value) ? paths : paths[0] || '';
}

// 外部业务值变化时，在组件内生成对应的文件回显列表。
watch(
  value,
  uploadValue => {
    if (uploadValue === undefined) return;

    const paths = getValuePaths(uploadValue);
    const valueKey = JSON.stringify(paths);
    if (valueKey === syncedValueKey) {
      syncedValueKey = null;
      return;
    }

    const currentPaths = fileList.value.map(getStoragePath).filter(Boolean);

    if (paths.length === currentPaths.length && paths.every((path, index) => path === currentPaths[index])) return;

    fileList.value = buildFileList(paths);
  },
  { deep: true, immediate: true }
);

/**
 * 生成上传接口需要的目录、后缀和随机文件名。
 * @param file 上传文件信息
 * @returns 上传接口参数
 */
function getUploadData({ file }: { file: UploadFileInfo }) {
  return {
    ...props.data,
    meta: JSON.stringify({
      dir: `${uploadEnvironment}/${uploadPlatform}/${props.moduleName}`,
      file_suffix: getFileSuffix(file.name),
      filename: `${getFileName(file.name)}_${GenRandomKey(6)}`
    })
  };
}

/**
 * 上传前校验文件类型、名称和大小。
 * @param options 上传文件及文件列表
 * @returns 是否允许上传
 */
function beforeUpload(options: { file: UploadFileInfo; fileList: UploadFileInfo[] }) {
  fileNum += 1;
  const { file } = options;

  // 校检文件类型
  if (accept.value) {
    const fileExt = `.${getFileSuffix(file.name)}`;
    const isTypeOk = accept.value.split(',')?.includes(fileExt);
    if (!isTypeOk) {
      window.$message?.error(`文件格式不正确, 请上传 ${accept.value} 格式文件!`);
      return false;
    }
  }
  // 校检文件名是否包含特殊字符
  if (file.name.includes(',')) {
    window.$message?.error('文件名不正确，不能包含英文逗号!');
    return false;
  }
  // 校检文件大小
  if (props.fileSize && file.file?.size) {
    const isLt = file.file?.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      window.$message?.error(`上传文件大小不能超过 ${props.fileSize} MB!`);
      return false;
    }
  }
  return true;
}

/**
 * 判断上传接口是否返回业务错误。
 * @param xhr 上传请求对象
 * @returns 是否为错误状态
 */
function isErrorState(xhr: XMLHttpRequest) {
  const responseText = xhr?.responseText;
  const response = JSON.parse(responseText);
  return String(response.code) !== import.meta.env.VITE_SERVICE_SUCCESS_CODE;
}

/**
 * 处理上传成功结果并同步业务路径。
 * @param options 上传文件及响应事件
 * @returns 上传文件信息
 */
function handleFinish(options: { file: UploadFileInfo; event?: ProgressEvent }) {
  fileNum -= 1;
  const { file, event } = options;
  // @ts-expect-error Ignore type errors
  const responseText = event?.target?.responseText;
  const response = JSON.parse(responseText);
  const oss = response.data;
  const path = normalizeOssPath(oss.path || oss.url);
  const currentFile = fileList.value.find(item => item.id === file.id) as UploadFileInfoWithPath | undefined;
  if (currentFile) currentFile.storagePath = path;
  (file as UploadFileInfoWithPath).storagePath = path;
  file.url = oss.url;
  updateValue(
    fileList.value
      .filter(item => item.status === 'finished' || item.id === file.id)
      .map(getStoragePath)
      .filter(Boolean)
  );
  if (fileNum === 0) {
    window.$message?.success('上传成功');
  }
  return file;
}

/**
 * 显示上传失败信息。
 * @param options 上传文件及响应事件
 */
function handleError(options: { file: UploadFileInfo; event?: ProgressEvent }) {
  const { event } = options;
  // @ts-expect-error Ignore type errors
  const responseText = event?.target?.responseText;
  const msg = JSON.parse(responseText).msg;
  window.$message?.error(msg || '上传失败');
}

/**
 * 删除文件并同步剩余业务路径。
 * @param file 被删除的文件
 * @returns 是否允许删除
 */
function handleRemove({ file }: { file: UploadFileInfo }) {
  updateValue(
    fileList.value
      .filter(item => item.id !== file.id && item.status === 'finished')
      .map(getStoragePath)
      .filter(Boolean)
  );
  return true;
}
</script>

<template>
  <div class="w-full flex-col">
    <NUpload
      v-bind="$attrs"
      v-model:file-list="fileList"
      :action="`${baseURL}${action}`"
      name="file_data"
      :data="getUploadData"
      :headers="headers"
      :max="max"
      :accept="accept"
      :multiple="max > 1"
      directory-dnd
      :default-upload="defaultUpload"
      :list-type="uploadType === 'image' ? 'image-card' : 'text'"
      :is-error-state="isErrorState"
      @finish="handleFinish"
      @error="handleError"
      @before-upload="beforeUpload"
      @remove="handleRemove"
    >
      <NUploadDragger v-if="uploadType === 'file'">
        <div class="mb-12px flex-center">
          <SvgIcon icon="material-symbols:unarchive-outline" class="text-58px color-#d8d8db dark:color-#a1a1a2" />
        </div>
        <NText class="text-16px">点击或者拖动文件到该区域来上传</NText>
        <TooltipContent v-if="showTip" class="mt-8px text-center" />
      </NUploadDragger>
      <NUploadDragger v-else>
        <SvgIcon icon="material-symbols:image-arrow-up-outline" class="text-58px color-#d8d8db dark:color-#a1a1a2" />
      </NUploadDragger>
    </NUpload>
    <TooltipContent v-if="showTip && uploadType === 'image'" class="mt-12px" />
  </div>
</template>

<style scoped></style>
