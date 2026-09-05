<script setup lang="ts">
import { computed, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchCreateDeviceTypePoint, fetchGetDeviceTypePoint, fetchUpdateDeviceTypePoint } from '@/service/api/device';
import PointOperateFields from '@/views/device/shared/device-point-form/point-operate-fields.vue';
import { usePointOperateForm } from '@/views/device/shared/device-point-form/use-point-operate-form';
import { $t } from '@/locales';

defineOptions({
  name: 'DeviceTypePointOperateDrawer'
});

interface Props {
  deviceTypeId?: CommonType.IdType | null;
  operateType?: NaiveUI.TableOperateType;
  rowId?: CommonType.IdType | null;
}

interface Emits {
  (e: 'submitted'): void;
}

const props = withDefaults(defineProps<Props>(), {
  deviceTypeId: null,
  operateType: 'add',
  rowId: null
});
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { loading, startLoading, endLoading } = useLoading();
const {
  formRef,
  validate,
  restoreValidation,
  model,
  rules,
  switchPresetOptions,
  enumSourceDataTypeOptions,
  isNumberType,
  isSwitchType,
  isTextType,
  isEnumType,
  trueMappingLabel,
  falseMappingLabel,
  createEnumItem,
  resetModel,
  validateEnumList,
  buildPointSubmitParams
} = usePointOperateForm();

const isEdit = computed(() => props.operateType === 'edit');
const drawerTitle = computed(() => (isEdit.value ? $t('deviceTypeDetail.editPoint') : $t('deviceTypeDetail.addPoint')));

function closeDrawer() {
  visible.value = false;
}

async function handleUpdateModel() {
  resetModel();

  if (isEdit.value && props.rowId !== null && props.rowId !== undefined) {
    const { data, error } = await fetchGetDeviceTypePoint({ id: props.rowId });
    if (error) return;

    resetModel(data.device_type_point);
  }
}

function buildSubmitParams(): Api.Device.DeviceTypePointOperateParams {
  const params: Api.Device.DeviceTypePointOperateParams = {
    device_type_id: Number(props.deviceTypeId),
    ...buildPointSubmitParams()
  };

  if (isEdit.value) {
    params.id = props.rowId;
  }

  return params;
}

async function handleSubmit() {
  if (!props.deviceTypeId) {
    window.$message?.warning($t('deviceTypeDetail.missingDeviceTypeId'));
    return;
  }

  if (isEdit.value && (props.rowId === null || props.rowId === undefined)) {
    window.$message?.warning($t('deviceTypeDetail.missingPointId'));
    return;
  }

  await validate();

  if (!validateEnumList()) return;

  startLoading();
  const request = isEdit.value ? fetchUpdateDeviceTypePoint : fetchCreateDeviceTypePoint;
  const { error } = await request(buildSubmitParams()).finally(endLoading);
  if (error) return;

  window.$message?.success(isEdit.value ? $t('common.updateSuccess') : $t('common.addSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, async () => {
  if (visible.value) {
    await handleUpdateModel();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="520" class="max-w-90%">
    <NDrawerContent :title="drawerTitle" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
        <PointOperateFields
          v-model:model="model"
          :is-number-type="isNumberType"
          :is-switch-type="isSwitchType"
          :is-text-type="isTextType"
          :is-enum-type="isEnumType"
          :switch-preset-options="switchPresetOptions"
          :enum-source-data-type-options="enumSourceDataTypeOptions"
          :true-mapping-label="trueMappingLabel"
          :false-mapping-label="falseMappingLabel"
          :create-enum-item="createEnumItem"
        />
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
