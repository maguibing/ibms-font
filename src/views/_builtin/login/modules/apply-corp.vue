<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { encryptByRsa } from '@sa/utils';
import { NCascader } from 'naive-ui';
import type { CascaderOption } from 'naive-ui';
import regionTree from '@province-city-china/level';
import { fetchCreateApplyCorp } from '@/service/api/corp';
import { usePhoneExistCheck } from '@/hooks/business/phone-exist-check';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';

defineOptions({
  name: 'ApplyCorp'
});

type FormModel = {
  name: string;
  ad_code: string;
  ad_address: string;
  address: string;
  contact_name: string;
  contact_phone: string;
  password: string;
  confirm_password: string;
  contact_email: string;
};

type RuleRecord = Partial<Record<keyof FormModel, App.Global.FormRule | App.Global.FormRule[]>>;

const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();
const { loading: submitLoading, startLoading: startSubmitLoading, endLoading: endSubmitLoading } = useLoading();
const { createConfirmPwdRule, createRequiredRule, patternRules } = useFormRules();

const model: FormModel = reactive({
  name: '',
  ad_code: '',
  ad_address: '',
  address: '',
  contact_name: '',
  contact_phone: '',
  password: '',
  confirm_password: '',
  contact_email: ''
});

const password = computed(() => model.password);

const {
  phoneFormItemRef,
  showPasswordFields,
  phoneValidationStatus,
  phoneFeedback,
  checkPhone,
  resetPhoneCheckStatus
} = usePhoneExistCheck({
  getPhone: () => model.contact_phone,
  setPhone: phone => {
    model.contact_phone = phone;
  },
  pType: 2,
  onExists: clearPassword,
  onReset: clearPassword
});

const rules = computed<RuleRecord>(() => {
  const baseRules: RuleRecord = {
    name: [
      createRequiredRule('集成商名称不能为空'),
      {
        max: 20,
        message: '集成商名称不能超过20个字符',
        trigger: ['input', 'blur']
      }
    ],
    ad_address: createRequiredRule('所在地区不能为空'),
    address: [
      createRequiredRule('详细地址不能为空'),
      {
        max: 30,
        message: '详细地址不能超过30个字符',
        trigger: ['input', 'blur']
      }
    ],
    contact_name: createRequiredRule('联系人名称不能为空'),
    contact_phone: [createRequiredRule('联系电话不能为空'), { ...patternRules.phone, trigger: ['change', 'blur'] }]
  };

  if (!showPasswordFields.value) {
    return baseRules;
  }

  return {
    ...baseRules,
    password: [createRequiredRule('登录密码不能为空'), patternRules.pwd],
    confirm_password: createConfirmPwdRule(password)
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

function clearPassword() {
  model.password = '';
  model.confirm_password = '';
}

function handleRegionUpdate(
  value: string | number | null,
  _selectedOption: CascaderOption | null,
  path: CascaderOption[] | null
) {
  model.ad_code = value ? String(value) : '';
  model.ad_address =
    path
      ?.map(item => item.label)
      .filter(Boolean)
      .join('') || '';
}

async function handleSubmit() {
  if (submitLoading.value) return;

  await validate();
  const checked = await checkPhone();
  if (!checked) return;

  startSubmitLoading();
  try {
    const { error } = await fetchCreateApplyCorp({
      name: model.name,
      ad_address: model.ad_address,
      ad_code: model.ad_code,
      address: model.address,
      contact_name: model.contact_name,
      contact_phone: model.contact_phone,
      password: showPasswordFields.value ? model.password : '',
      rsa_pwd: showPasswordFields.value
        ? (encryptByRsa(model.password, import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '') as string)
        : '',
      contact_email: model.contact_email
    });

    if (error) return;

    window.$message?.success('提交成功');
    toggleLoginModule('pwd-login');
  } finally {
    endSubmitLoading();
  }
}

watch(
  () => model.contact_phone,
  () => {
    resetPhoneCheckStatus();
  }
);
</script>

<template>
  <div>
    <div class="mb-5px text-32px text-black font-600 sm:text-30px dark:text-white">集成商入驻</div>
    <div class="pb-18px text-16px text-#858585">请输入入驻信息，我们将尽快完成审核</div>
    <NForm
      ref="formRef"
      :model="model"
      :rules="rules"
      size="large"
      :show-label="false"
      @keyup.enter="() => !submitLoading && handleSubmit()"
    >
      <NFormItem path="name">
        <NInput v-model:value="model.name" placeholder="请输入集成商名称" :maxlength="20" />
      </NFormItem>
      <NFormItem path="ad_address">
        <NCascader
          :value="model.ad_code || null"
          filterable
          clearable
          :options="regionOptions"
          placeholder="请选择所在地区（必填）"
          @update:value="handleRegionUpdate"
        />
      </NFormItem>
      <NFormItem path="address">
        <NInput v-model:value="model.address" placeholder="请输入详细地址" :maxlength="30" />
      </NFormItem>
      <NFormItem path="contact_name">
        <NInput v-model:value="model.contact_name" placeholder="请输入联系人名称" />
      </NFormItem>
      <NFormItem
        ref="phoneFormItemRef"
        path="contact_phone"
        :validation-status="phoneValidationStatus"
        :feedback="phoneFeedback"
      >
        <NInput
          v-model:value="model.contact_phone"
          placeholder="请输入联系电话"
          :maxlength="11"
          show-count
          @blur="checkPhone()"
        />
      </NFormItem>
      <template v-if="showPasswordFields">
        <NFormItem path="password">
          <NInput
            v-model:value="model.password"
            type="password"
            show-password-on="click"
            :input-props="{ autocomplete: 'new-password' }"
            placeholder="登录密码不会显示在系统中，请牢记登录密码"
          />
        </NFormItem>
        <NFormItem path="confirm_password">
          <NInput
            v-model:value="model.confirm_password"
            type="password"
            show-password-on="click"
            :input-props="{ autocomplete: 'new-password' }"
            placeholder="登录密码不会显示在系统中，请牢记登录密码"
          />
        </NFormItem>
      </template>
      <NFormItem path="contact_email">
        <NInput v-model:value="model.contact_email" placeholder="请输入邮箱(选填)" />
      </NFormItem>
      <NSpace vertical :size="20" class="w-full">
        <NButton type="primary" size="large" block :loading="submitLoading" @click="handleSubmit">提交</NButton>
        <NButton size="large" block @click="toggleLoginModule('pwd-login')">取消</NButton>
      </NSpace>
    </NForm>
  </div>
</template>

<style scoped>
:deep(.n-base-selection),
:deep(.n-input) {
  --n-height: 42px !important;
  --n-font-size: 16px !important;
  --n-border-radius: 8px !important;
}

:deep(.n-base-selection-label) {
  padding: 0 6px !important;
}

:deep(.n-button) {
  --n-height: 42px !important;
  --n-font-size: 18px !important;
  --n-border-radius: 8px !important;
}
</style>
