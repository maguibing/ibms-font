<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchCreateDeviceType, fetchGetDeviceType, fetchUpdateDeviceType } from '@/service/api/device';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import FileUpload from '@/components/custom/file-upload.vue';
import { $t } from '@/locales';

defineOptions({
  name: 'DeviceTypeOperatePanel'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowId?: CommonType.IdType | null;
  visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  rowId: null
});

type Model = Api.Device.DeviceTypeOperateParams;

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();

const model = ref<Model>(createDefaultModel());

const rules: Record<string, App.Global.FormRule> = {
  name: createRequiredRule('请输入设备类型名称'),
  key: createRequiredRule('请输入设备类型标识'),
  status: createRequiredRule('请选择状态')
};

function createDefaultModel(): Model {
  return {
    name: '',
    is_auto_create_point: false,
    icon: '',
    status: 1,
    key: '',
    desc: ''
  };
}

function resetModel() {
  model.value = createDefaultModel();
}

function fillModel(deviceType: Api.Device.DeviceType) {
  model.value = {
    desc: deviceType.desc ?? '',
    icon: deviceType.icon ?? '',
    key: deviceType.key ?? '',
    name: deviceType.name ?? '',
    status: Number(deviceType.status) === 1 ? 1 : 2
  };
}

async function getDetail() {
  if (props.operateType !== 'edit' || props.rowId === null || props.rowId === undefined) return;

  startLoading();
  const { data, error } = await fetchGetDeviceType({ id: props.rowId }).finally(endLoading);
  if (error || !props.visible || props.operateType !== 'edit') return;

  const deviceType = data?.device_type;
  if (deviceType) {
    fillModel(deviceType);
  }
}

async function submit() {
  if (loading.value) return false;

  await validate();

  if (props.operateType === 'edit') {
    if (props.rowId === null || props.rowId === undefined) return false;

    const { desc, icon, key, name, status } = model.value;
    const { error } = await fetchUpdateDeviceType({ id: props.rowId, desc, icon, key, name, status });
    if (error) return false;

    window.$message?.success($t('common.updateSuccess'));
    return true;
  }

  const { error } = await fetchCreateDeviceType(model.value);
  if (error) return false;

  window.$message?.success($t('common.addSuccess'));
  return true;
}

watch(
  () => [props.visible, props.operateType, props.rowId] as const,
  async ([visible]) => {
    if (visible) {
      resetModel();
      restoreValidation();
      await getDetail();
    }
  },
  { immediate: true }
);

defineExpose({
  submit
});
</script>

<template>
  <NSpin :show="loading">
    <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
      <NFormItem label="设备类型名称" path="name">
        <NInput v-model:value="model.name" maxlength="30" show-count placeholder="请输入设备类型名称" />
      </NFormItem>
      <NFormItem label="设备类型标识" path="key">
        <NInput v-model:value="model.key" maxlength="48" show-count placeholder="请输入设备类型标识" />
      </NFormItem>
      <NFormItem label="图标" path="icon">
        <FileUpload
          v-model:value="model.icon"
          module-name="device-type"
          upload-type="image"
          :max="1"
          :file-size="5"
          :show-tip="false"
        />
      </NFormItem>
      <NFormItem label="状态" path="status">
        <NSwitch v-model:value="model.status" :checked-value="1" :unchecked-value="2">
          <template #checked>启用</template>
          <template #unchecked>禁用</template>
        </NSwitch>
      </NFormItem>
      <NFormItem label="描述" path="desc">
        <NInput
          v-model:value="model.desc"
          type="textarea"
          maxlength="200"
          show-count
          :rows="5"
          placeholder="请输入描述"
        />
      </NFormItem>
    </NForm>
  </NSpin>
</template>
