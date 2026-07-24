<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { jsonClone } from '@sa/utils';
import { fetchCreateProvider, fetchUpdateProvider } from '@/service/api/monitor/provider';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { PROVIDER_STATUS_OPTIONS, PROVIDER_TYPE_OPTIONS } from '../shared';

defineOptions({
  name: 'ProviderOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Monitor.Provider | null;
}

interface Emits {
  (e: 'submitted'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

type Model = Api.Monitor.ProviderOperateParams;

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增厂商',
    edit: '编辑厂商'
  };

  return titles[props.operateType];
});

const model = ref<Model>(createDefaultModel());

const rules: Record<string, App.Global.FormRule> = {
  name: createRequiredRule('请输入厂商名称'),
  provider_type: createRequiredRule('请选择厂商类型'),
  status: createRequiredRule('请选择状态'),
  'setting.cloud.api_host': createRequiredRule('请输入接口地址'),
  'setting.cloud.app_key': createRequiredRule('请输入 AppKey'),
  'setting.cloud.app_secret': createRequiredRule('请输入 AppSecret')
};

function createDefaultModel(): Model {
  return {
    id: null,
    name: '',
    provider_type: 1,
    status: 1,
    setting: {
      cloud: {
        api_host: '',
        app_key: '',
        app_secret: ''
      }
    }
  };
}

function handleUpdateModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    const rowData = jsonClone(props.rowData);

    model.value = {
      id: rowData.id,
      name: rowData.name,
      provider_type: rowData.provider_type,
      status: rowData.status,
      setting: {
        cloud: {
          api_host: rowData.setting?.cloud?.api_host || '',
          app_key: rowData.setting?.cloud?.app_key || '',
          app_secret: rowData.setting?.cloud?.app_secret || ''
        }
      }
    };
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const payload = jsonClone(model.value);

  startLoading();
  const { error } = await (
    props.operateType === 'edit'
      ? fetchUpdateProvider(payload)
      : fetchCreateProvider({
          name: payload.name,
          provider_type: payload.provider_type,
          setting: payload.setting,
          status: payload.status
        })
  ).finally(endLoading);
  if (error) return;

  window.$message?.success(props.operateType === 'edit' ? $t('common.updateSuccess') : $t('common.addSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModel();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="600" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
        <NFormItem label="厂商名称" path="name">
          <NInput v-model:value="model.name" maxlength="30" show-count placeholder="请输入厂商名称" />
        </NFormItem>
        <NFormItem label="厂商类型" path="provider_type">
          <NSelect v-model:value="model.provider_type" :options="PROVIDER_TYPE_OPTIONS" placeholder="请选择厂商类型" />
        </NFormItem>
        <NFormItem label="状态" path="status">
          <NRadioGroup v-model:value="model.status">
            <NSpace>
              <NRadio v-for="item in PROVIDER_STATUS_OPTIONS" :key="item.value" :value="item.value">
                {{ item.label }}
              </NRadio>
            </NSpace>
          </NRadioGroup>
        </NFormItem>
        <div
          class="mt-8px rounded-8px border border-#e5e7eb border-solid bg-#fafafa px-18px pt-18px pb-4px dark:border-#2f3338 dark:bg-#1f2228"
        >
          <div class="mb-16px flex items-center gap-8px text-15px text-#1f2937 font-600 leading-20px dark:text-#e5e7eb">
            <span class="h-16px w-3px rounded-2px bg-#18a058"></span>
            <span>云平台配置</span>
          </div>
          <NGrid responsive="screen" item-responsive :x-gap="16">
            <NFormItemGi span="24" label="接口地址" path="setting.cloud.api_host">
              <NInput v-model:value="model.setting.cloud.api_host" placeholder="请输入接口地址" />
            </NFormItemGi>
            <NFormItemGi span="24" label="AppKey" path="setting.cloud.app_key">
              <NInput v-model:value="model.setting.cloud.app_key" placeholder="请输入 AppKey" />
            </NFormItemGi>
            <NFormItemGi span="24" label="AppSecret" path="setting.cloud.app_secret">
              <NInput v-model:value="model.setting.cloud.app_secret" placeholder="请输入 AppSecret" />
            </NFormItemGi>
          </NGrid>
        </div>
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
