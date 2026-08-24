<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, shallowRef } from 'vue';
import { useLoading } from '@sa/hooks';
import { encryptByRsa } from '@sa/utils';
import { fetchForgetPassword, fetchSendVerifyCode } from '@/service/api';
import { REG_CODE_FOUR, REG_PHONE } from '@/constants/reg';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'ResetPwd'
});

const VERIFY_CODE_COUNTDOWN_SECONDS = 60;

const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();
const { loading: codeLoading, startLoading: startCodeLoading, endLoading: endCodeLoading } = useLoading();
const { loading: resetLoading, startLoading: startResetLoading, endLoading: endResetLoading } = useLoading();

interface FormModel {
  phone: string;
  verify_code: string;
  rsa_pwd: string;
  confirmPassword: string;
}

const model: FormModel = reactive({
  phone: '',
  verify_code: '',
  rsa_pwd: '',
  confirmPassword: ''
});

type RuleRecord = Partial<Record<keyof FormModel, App.Global.FormRule[]>>;
let countdownTimer: ReturnType<typeof setInterval> | null = null;

const countdown = shallowRef(0);
const rsaPwd = computed(() => model.rsa_pwd);
const isCountingDown = computed(() => countdown.value > 0);
const verifyCodeButtonText = computed(() =>
  isCountingDown.value
    ? $t('page.login.common.retryAfter', { time: countdown.value })
    : $t('page.login.codeLogin.getCode')
);
const { formRules, createConfirmPwdRule, createRequiredRule } = useFormRules();

const rules: RuleRecord = {
  phone: formRules.phone,
  verify_code: [
    createRequiredRule($t('form.code.required')),
    {
      pattern: REG_CODE_FOUR,
      message: $t('page.login.resetPwd.codePattern'),
      trigger: ['change', 'blur']
    }
  ],
  rsa_pwd: formRules.pwd,
  confirmPassword: createConfirmPwdRule(rsaPwd)
};

function onlyDigits(value: string) {
  return /^\d*$/.test(value);
}

async function handleSubmit() {
  if (resetLoading.value) return;

  await validate();
  startResetLoading();
  try {
    const { error } = await fetchForgetPassword({
      phone: model.phone,
      verify_code: model.verify_code,
      rsa_pwd: encryptByRsa(model.rsa_pwd, import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '') as string
    });

    if (error) return;

    window.$message?.success($t('page.login.resetPwd.resetSuccess'));
    toggleLoginModule('pwd-login');
  } finally {
    endResetLoading();
  }
}

function validatePhone() {
  if (!model.phone) {
    window.$message?.warning($t('form.phone.required'));
    return false;
  }

  if (!REG_PHONE.test(model.phone)) {
    window.$message?.warning($t('form.phone.invalid'));
    return false;
  }

  return true;
}

async function handleSendVerifyCode() {
  if (codeLoading.value || isCountingDown.value || !validatePhone()) return;

  startCodeLoading();
  try {
    const { error } = await fetchSendVerifyCode({ phone: model.phone });

    if (error) return;

    window.$message?.success($t('page.login.codeLogin.sendCodeSuccess'));
    startCountdown();
  } finally {
    endCodeLoading();
  }
}

function startCountdown() {
  stopCountdown();
  countdown.value = VERIFY_CODE_COUNTDOWN_SECONDS;
  countdownTimer = setInterval(() => {
    if (countdown.value <= 1) {
      stopCountdown();
      countdown.value = 0;
      return;
    }

    countdown.value -= 1;
  }, 1000);
}

function stopCountdown() {
  if (!countdownTimer) return;

  clearInterval(countdownTimer);
  countdownTimer = null;
}

onBeforeUnmount(stopCountdown);
</script>

<template>
  <div>
    <div class="mb-5px text-32px text-black font-600 sm:text-30px dark:text-white">
      {{ $t('page.login.resetPwd.title') }}
    </div>
    <div class="pb-18px text-16px text-#858585">{{ $t('page.login.common.sendCodeDesc') }}</div>
    <NForm
      ref="formRef"
      :model="model"
      :rules="rules"
      size="large"
      :show-label="false"
      @keyup.enter="() => !resetLoading && handleSubmit()"
    >
      <NFormItem path="phone">
        <NInput
          v-model:value="model.phone"
          :allow-input="onlyDigits"
          :maxlength="11"
          :placeholder="$t('page.login.common.phonePlaceholder')"
        />
      </NFormItem>
      <NFormItem path="verify_code">
        <div class="w-full flex-y-center gap-16px">
          <NInput
            v-model:value="model.verify_code"
            :allow-input="onlyDigits"
            :maxlength="4"
            :placeholder="$t('page.login.common.codePlaceholder')"
          />
          <NButton
            class="w-128px"
            :disabled="isCountingDown"
            :loading="codeLoading"
            :focusable="false"
            @click="handleSendVerifyCode"
          >
            {{ verifyCodeButtonText }}
          </NButton>
        </div>
      </NFormItem>
      <NFormItem path="rsa_pwd">
        <NInput
          v-model:value="model.rsa_pwd"
          type="password"
          show-password-on="click"
          :placeholder="$t('page.login.common.passwordPlaceholder')"
        />
      </NFormItem>
      <NFormItem path="confirmPassword">
        <NInput
          v-model:value="model.confirmPassword"
          type="password"
          show-password-on="click"
          :placeholder="$t('page.login.common.confirmPasswordPlaceholder')"
        />
      </NFormItem>
      <NSpace vertical :size="20" class="w-full">
        <NButton type="primary" size="large" block :loading="resetLoading" @click="handleSubmit">
          {{ $t('page.login.resetPwd.title') }}
        </NButton>
        <NButton size="large" block @click="toggleLoginModule('pwd-login')">
          {{ $t('page.login.common.back') }}
        </NButton>
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
