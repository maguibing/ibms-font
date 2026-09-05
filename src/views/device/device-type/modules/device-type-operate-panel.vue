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
  name: createRequiredRule($t('deviceType.namePlaceholder')),
  key: createRequiredRule($t('deviceType.identifierPlaceholder')),
  status: createRequiredRule($t('deviceType.statusPlaceholder'))
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
      <NFormItem :label="$t('deviceType.name')" path="name">
        <NInput v-model:value="model.name" maxlength="30" show-count :placeholder="$t('deviceType.namePlaceholder')" />
      </NFormItem>
      <NFormItem :label="$t('deviceType.identifier')" path="key">
        <NInput
          v-model:value="model.key"
          maxlength="48"
          show-count
          :placeholder="$t('deviceType.identifierPlaceholder')"
        />
      </NFormItem>
      <NFormItem :label="$t('deviceType.icon')" path="icon">
        <FileUpload
          v-model:value="model.icon"
          module-name="device-type"
          upload-type="image"
          :max="1"
          :file-size="5"
          :show-tip="false"
        />
      </NFormItem>
      <NFormItem :label="$t('deviceType.status')" path="status">
        <NSwitch v-model:value="model.status" :checked-value="1" :unchecked-value="2">
          <template #checked>{{ $t('deviceType.enabled') }}</template>
          <template #unchecked>{{ $t('deviceType.disabled') }}</template>
        </NSwitch>
      </NFormItem>
      <NFormItem :label="$t('deviceType.description')" path="desc">
        <NInput
          v-model:value="model.desc"
          type="textarea"
          maxlength="200"
          show-count
          :rows="5"
          :placeholder="$t('deviceType.descriptionPlaceholder')"
        />
      </NFormItem>
    </NForm>
  </NSpin>
</template>
