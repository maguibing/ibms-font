<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { encryptByRsa } from '@sa/utils';
import { NCascader } from 'naive-ui';
import type { CascaderOption } from 'naive-ui';
import regionTree from '@province-city-china/level';
import { fetchAddCorp } from '@/service/api/corp';
import { usePhoneExistCheck } from '@/hooks/business/phone-exist-check';
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
      createRequiredRule($t('page.corp.common.form.name.invalid')),
      {
        max: 20,
        message: $t('page.corp.common.message.nameMax'),
        trigger: ['input', 'blur']
      }
    ],
    ad_address: createRequiredRule($t('page.corp.common.form.region.invalid')),
    address: [
      createRequiredRule($t('page.corp.common.form.detailAddress.invalid')),
      {
        max: 30,
        message: $t('page.corp.common.message.addressMax'),
        trigger: ['input', 'blur']
      }
    ],
    contact_name: createRequiredRule($t('page.corp.common.form.contact.invalid')),
    contact_phone: [
      createRequiredRule($t('page.corp.common.form.contactPhone.invalid')),
      { ...patternRules.phone, trigger: ['change', 'blur'] }
    ]
  };

  if (!showPasswordFields.value) {
    return baseRules;
  }

  return {
    ...baseRules,
    rsa_pwd: [createRequiredRule($t('page.corp.common.form.password.invalid')), patternRules.pwd],
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
  <NDrawer
    v-model:show="visible"
    :title="$t('page.corp.common.addCorp')"
    display-directive="show"
    :width="600"
    class="max-w-90%"
  >
    <NDrawerContent :title="$t('page.corp.common.addCorp')" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem :label="$t('page.corp.common.name')" path="name">
          <NInput
            v-model:value="model.name"
            :placeholder="$t('page.corp.common.placeholder.companyName')"
            :maxlength="20"
            show-count
          />
        </NFormItem>
        <NFormItem :label="$t('page.corp.common.region')" path="ad_address">
          <NCascader
            :value="model.ad_code || null"
            filterable
            clearable
            :options="regionOptions"
            :placeholder="$t('page.corp.common.form.region.required')"
            @update:value="handleRegionUpdate"
          />
        </NFormItem>
        <NFormItem :label="$t('page.corp.common.detailAddress')" path="address">
          <NInput
            v-model:value="model.address"
            :placeholder="$t('page.corp.common.form.detailAddress.required')"
            :maxlength="30"
            show-count
          />
        </NFormItem>
        <NFormItem :label="$t('page.corp.common.contact')" path="contact_name">
          <NInput v-model:value="model.contact_name" :placeholder="$t('page.corp.common.form.contact.required')" />
        </NFormItem>
        <NFormItem
          ref="phoneFormItemRef"
          :label="$t('page.corp.common.contactPhone')"
          path="contact_phone"
          :validation-status="phoneValidationStatus"
          :feedback="phoneFeedback"
        >
          <NInput
            v-model:value="model.contact_phone"
            :placeholder="$t('page.corp.common.form.contactPhone.required')"
            :maxlength="11"
            @blur="checkPhone()"
          />
        </NFormItem>

        <template v-if="showPasswordFields">
          <NFormItem :label="$t('page.corp.common.password')" path="rsa_pwd">
            <NInput
              v-model:value="model.rsa_pwd"
              type="password"
              show-password-on="click"
              :input-props="{ autocomplete: 'new-password' }"
              :placeholder="$t('page.corp.common.placeholder.password')"
            />
          </NFormItem>
          <NFormItem :label="$t('page.corp.common.confirmPassword')" path="confirm_password">
            <NInput
              v-model:value="model.confirm_password"
              type="password"
              show-password-on="click"
              :input-props="{ autocomplete: 'new-password' }"
              :placeholder="$t('page.corp.common.placeholder.password')"
            />
          </NFormItem>
        </template>

        <NFormItem :label="$t('page.corp.common.email')">
          <NInput v-model:value="model.contact_email" :placeholder="$t('page.corp.common.placeholder.email')" />
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
