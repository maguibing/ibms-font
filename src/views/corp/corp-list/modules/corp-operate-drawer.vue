<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { encryptByRsa } from '@sa/utils';
import { NCascader } from 'naive-ui';
import type { CascaderOption } from 'naive-ui';
import regionTree from '@province-city-china/level';
import { fetchAddCorp } from '@/service/api/corp';
import { usePhoneExistCheck } from '@/hooks/business/use-phone-exist-check';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'CorpOperateDrawer'
});

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createConfirmPwdRule, createRequiredRule, patternRules } = useFormRules();

type Model = {
  name: string;
  address: string;
  ad_code: string;
  ad_address: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  rsa_pwd: string;
  confirm_password: string;
};

const model = ref<Model>(createDefaultModel());
const {
  phoneFormItemRef,
  showPasswordFields,
  phoneValidationStatus,
  phoneFeedback,
  checkPhone,
  resetPhoneCheck,
  resetPhoneCheckStatus
} = usePhoneExistCheck({
  getPhone: () => model.value.contact_phone,
  setPhone: phone => {
    model.value.contact_phone = phone;
  },
  pType: 2,
  onExists: clearPassword,
  onReset: clearPassword
});

function createDefaultModel(): Model {
  return {
    name: '',
    address: '',
    ad_code: '',
    ad_address: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    rsa_pwd: '',
    confirm_password: ''
  };
}

function clearPassword() {
  model.value.rsa_pwd = '';
  model.value.confirm_password = '';
}

type RuleKey = Extract<
  keyof Model,
  'name' | 'ad_address' | 'address' | 'contact_name' | 'contact_phone' | 'rsa_pwd' | 'confirm_password'
>;

const rules = computed<Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>>>(() => {
  const baseRules: Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>> = {
    name: [
      createRequiredRule('集成商名称不能为空'),
      {
        max: 20,
        message: '集成商名称不能超过20个字符',
        trigger: ['input', 'blur']
      }
    ],
    ad_address: createRequiredRule('所属地区不能为空'),
    address: [
      createRequiredRule('详细地址不能为空'),
      {
        max: 30,
        message: '详细地址不能超过30个字符',
        trigger: ['input', 'blur']
      }
    ],
    contact_name: createRequiredRule('联系人不能为空'),
    contact_phone: [createRequiredRule('联系电话不能为空'), { ...patternRules.phone, trigger: ['change', 'blur'] }]
  };

  if (!showPasswordFields.value) {
    return baseRules;
  }

  return {
    ...baseRules,
    rsa_pwd: [createRequiredRule('密码不能为空'), patternRules.pwd],
    confirm_password: createConfirmPwdRule(model.value.rsa_pwd)
  };
});

const regionOptions = transformRegionOptions(regionTree);

function transformRegionOptions(options: ProvinceCityChina.Level[]): CascaderOption[] {
  return options.map(item => ({
    label: item.name,
    value: item.code,
    children: item.children ? transformRegionOptions(item.children) : undefined
  }));
}

const operateParams = computed<Api.System.CorpOperateParams>(() => {
  const rsaPwd = showPasswordFields.value
    ? (encryptByRsa(model.value.rsa_pwd, import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '') as string)
    : '';

  const params: Api.System.CorpOperateParams = {
    name: model.value.name,
    address: model.value.address,
    ad_code: model.value.ad_code,
    ad_address: model.value.ad_address,
    contact_name: model.value.contact_name,
    contact_phone: model.value.contact_phone,
    contact_email: model.value.contact_email,
    rsa_pwd: rsaPwd
  };

  return params;
});

function handleRegionUpdate(
  value: string | number | null,
  _selectedOption: CascaderOption | null,
  path: CascaderOption[] | null
) {
  model.value.ad_code = value ? String(value) : '';
  model.value.ad_address =
    path
      ?.map(item => item.label)
      .filter(Boolean)
      .join('/') || '';
}

function resetModel() {
  model.value = createDefaultModel();
  resetPhoneCheck();
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const checked = await checkPhone();
  if (!checked) return;

  const { error } = await fetchAddCorp(operateParams.value);
  if (error) return;

  window.$message?.success($t('common.addSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    resetModel();
    restoreValidation();
  }
});

watch(
  () => model.value.contact_phone,
  () => {
    resetPhoneCheckStatus();
  }
);
</script>

<template>
  <NDrawer v-model:show="visible" title="新增集成商" display-directive="show" :width="600" class="max-w-90%">
    <NDrawerContent title="新增集成商" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem label="集成商名称" path="name">
          <NInput v-model:value="model.name" placeholder="请输入公司名称" :maxlength="20" show-count />
        </NFormItem>
        <NFormItem label="所属地区" path="ad_address">
          <NCascader
            :value="model.ad_code || null"
            filterable
            clearable
            :options="regionOptions"
            placeholder="请选择所属地区"
            @update:value="handleRegionUpdate"
          />
        </NFormItem>
        <NFormItem label="详细地址" path="address">
          <NInput v-model:value="model.address" placeholder="请输入详细地址" :maxlength="30" show-count />
        </NFormItem>
        <NFormItem label="联系人" path="contact_name">
          <NInput v-model:value="model.contact_name" placeholder="请输入联系人" />
        </NFormItem>
        <NFormItem
          ref="phoneFormItemRef"
          label="联系电话"
          path="contact_phone"
          :validation-status="phoneValidationStatus"
          :feedback="phoneFeedback"
        >
          <NInput
            v-model:value="model.contact_phone"
            placeholder="请输入联系电话"
            :maxlength="11"
            @blur="checkPhone()"
          />
        </NFormItem>

        <template v-if="showPasswordFields">
          <NFormItem label="密码" path="rsa_pwd">
            <NInput
              v-model:value="model.rsa_pwd"
              type="password"
              show-password-on="click"
              :input-props="{ autocomplete: 'new-password' }"
              placeholder="登录密码不会显示在系统中，请牢记登录密码，如忘记可重置"
            />
          </NFormItem>
          <NFormItem label="确认密码" path="confirm_password">
            <NInput
              v-model:value="model.confirm_password"
              type="password"
              show-password-on="click"
              :input-props="{ autocomplete: 'new-password' }"
              placeholder="登录密码不会显示在系统中，请牢记登录密码，如忘记可重置"
            />
          </NFormItem>
        </template>

        <NFormItem label="邮箱">
          <NInput v-model:value="model.contact_email" placeholder="请输入邮箱地址" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
