<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { jsonClone } from '@sa/utils';
import { fetchCreateMonitor, fetchGetMonitor, fetchGetProviderList, fetchUpdateMonitor } from '@/service/api/monitor';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { enableStatusOptions } from '@/constants/business';

defineOptions({
  name: 'MonitorDeviceOperateDrawer'
});

const MONITOR_ACCESS_TYPE_OPTIONS: CommonType.Option<Api.Monitor.MonitorAccessType, string>[] = [
  { label: '本地源流拉流', value: 1 },
  { label: '云平台接入', value: 2 }
];

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowId?: CommonType.IdType | null;
}

interface Emits {
  (e: 'submitted'): void;
}

const props = withDefaults(defineProps<Props>(), {
  rowId: null
});
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();

const model = ref<Api.Monitor.MonitorOperateParams>(createDefaultMonitorCreateParams());

function createDefaultMonitorCreateParams(): Api.Monitor.MonitorCreateParams {
  return {
    name: '',
    access_type: 1,
    provider_id: null,
    setting: {
      cloud: {
        device_serial: ''
      }
    },
    status: 1
  };
}

const providerRequestParams: CommonType.CommonListQueryParams = {
  options: [{ key: 1 }]
};

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增监控设备',
    edit: '编辑监控设备'
  };

  return titles[props.operateType];
});

const isEdit = computed(() => props.operateType === 'edit');

const showCloudFields = computed(() => model.value.access_type === 2);

const rules = computed<Record<string, App.Global.FormRule | App.Global.FormRule[]>>(() => {
  const baseRules: Record<string, App.Global.FormRule | App.Global.FormRule[]> = {
    name: createRequiredRule('请输入设备名称'),
    access_type: createRequiredRule('请选择接入类型'),
    status: createRequiredRule('请选择是否启用')
  };

  if (!showCloudFields.value) {
    return baseRules;
  }

  return {
    ...baseRules,
    provider_id: createRequiredRule('请选择云厂商'),
    'setting.cloud.device_serial': createRequiredRule('请输入设备序列号')
  };
});

function fetchProviderList(params: Record<string, any>) {
  return fetchGetProviderList(params as CommonType.CommonListQueryParams);
}

function fillModel(monitor: Api.Monitor.MonitorDetail) {
  model.value = {
    id: monitor.id,
    name: monitor.name,
    access_type: monitor.access_type,
    provider_id: monitor.provider_id ?? null,
    setting: {
      cloud: {
        device_serial: monitor.setting.cloud?.device_serial || ''
      }
    },
    status: monitor.status
  };
}

async function handleUpdateModel() {
  model.value = createDefaultMonitorCreateParams();

  if (!isEdit.value || props.rowId === null || props.rowId === undefined) return;

  startLoading();
  const { data, error } = await fetchGetMonitor({ id: props.rowId }).finally(endLoading);
  if (error) return;

  fillModel(data.monitor);
}

function closeDrawer() {
  visible.value = false;
}

function handleAccessTypeChange() {
  if (model.value.access_type === 2) {
    return;
  }

  model.value.provider_id = null;
  model.value.setting.cloud.device_serial = '';
}

async function handleSubmit() {
  if (loading.value) return;

  await validate();

  const payload = jsonClone(model.value);
  if (payload.access_type !== 2) {
    payload.provider_id = null;
    payload.setting.cloud.device_serial = '';
  }

  startLoading();
  const { error } = await (
    props.operateType === 'edit' ? fetchUpdateMonitor(payload) : fetchCreateMonitor(payload)
  ).finally(endLoading);
  if (error) return;

  window.$message?.success(props.operateType === 'edit' ? $t('common.updateSuccess') : $t('common.addSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, nextVisible => {
  if (!nextVisible) return;

  handleUpdateModel().then(() => restoreValidation());
});

watch(
  () => model.value.access_type,
  () => {
    handleAccessTypeChange();
  }
);
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="600" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
        <NFormItem label="设备名称" path="name">
          <NInput v-model:value="model.name" maxlength="30" show-count placeholder="请输入设备名称" />
        </NFormItem>
        <NFormItem label="接入类型" path="access_type">
          <NRadioGroup v-model:value="model.access_type">
            <NSpace>
              <NRadio v-for="item in MONITOR_ACCESS_TYPE_OPTIONS" :key="item.value" :value="item.value">
                {{ item.label }}
              </NRadio>
            </NSpace>
          </NRadioGroup>
        </NFormItem>
        <NFormItem v-if="showCloudFields" label="云厂商" path="provider_id">
          <RemoteSearchSelect
            v-model:value="model.provider_id"
            :request="fetchProviderList"
            :request-params="providerRequestParams"
            :search-type="1"
            label-field="name"
            value-field="id"
            clearable
            placeholder="请选择云厂商"
          />
        </NFormItem>
        <NFormItem v-if="showCloudFields" label="设备序列号" path="setting.cloud.device_serial">
          <NInput
            v-model:value="model.setting.cloud.device_serial"
            maxlength="64"
            show-count
            placeholder="请输入设备序列号"
          />
        </NFormItem>
        <NFormItem label="是否启用" path="status">
          <NRadioGroup v-model:value="model.status">
            <NSpace>
              <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </NRadio>
            </NSpace>
          </NRadioGroup>
        </NFormItem>
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
