<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { encryptByRsa } from '@sa/utils';
import type { FormItemInst } from 'naive-ui';
import { fetchCheckProject, fetchRegister, fetchSendVerifyCode } from '@/service/api';
import { menuPlatformType } from '@/constants/business';
import { usePhoneExistCheck } from '@/hooks/business/phone-exist-check';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'Register'
});

const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();
const { loading: projectLoading, startLoading: startProjectLoading, endLoading: endProjectLoading } = useLoading();
const { loading: codeLoading, startLoading: startCodeLoading, endLoading: endCodeLoading } = useLoading();
const { loading: registerLoading, startLoading: startRegisterLoading, endLoading: endRegisterLoading } = useLoading();
const { formRules, createConfirmPwdRule, createRequiredRule, patternRules } = useFormRules();

const VERIFY_CODE_COUNTDOWN_SECONDS = 60;

type ProjectCheckStatus = 'unchecked' | 'checked' | 'failed';

interface FormModel {
  project_name: string;
  project_id: CommonType.IdType | null;
  phone: string;
  verify_code: string;
  name: string;
  rsa_pwd: string;
  confirm_rsa_pwd: string;
}

type RuleKey = Exclude<keyof FormModel, 'project_id'>;
type RuleRecord = Partial<Record<RuleKey, App.Global.FormRule[]>>;

const projectFormItemRef = ref<FormItemInst | null>(null);
const countdown = shallowRef(0);
const projectCheckStatus = shallowRef<ProjectCheckStatus>('unchecked');
const checkedProjectName = shallowRef('');
let countdownTimer: ReturnType<typeof setInterval> | null = null;
let projectCheckPromise: Promise<boolean> | null = null;

const model: FormModel = reactive({
  project_name: '',
  project_id: null,
  phone: '',
  verify_code: '',
  name: '',
  rsa_pwd: '',
  confirm_rsa_pwd: ''
});

const rsaPwd = computed(() => model.rsa_pwd);
const isProjectChecked = computed(() => projectCheckStatus.value === 'checked' && model.project_id !== null);
const isCountingDown = computed(() => countdown.value > 0);
const verifyCodeButtonText = computed(() => (isCountingDown.value ? `${countdown.value}s后重试` : '获取验证码'));
const projectValidationStatus = computed<'success' | 'error' | undefined>(() => {
  if (projectCheckStatus.value === 'checked') return 'success';
  if (projectCheckStatus.value === 'failed') return 'error';
  return undefined;
});
const projectFeedback = computed(() => {
  if (projectCheckStatus.value === 'checked') return '项目校验通过';
  if (projectCheckStatus.value === 'failed') return '项目不存在';
  return undefined;
});

const {
  phoneFormItemRef,
  showPasswordFields,
  phoneValidationStatus,
  phoneFeedback,
  checkPhone,
  resetPhoneCheckStatus
} = usePhoneExistCheck({
  getPhone: () => model.phone,
  setPhone: phone => {
    model.phone = phone;
  },
  pType: menuPlatformType.project,
  existsFeedback: '手机号已存在，将使用已存在账号',
  onExists: clearPassword,
  onReset: clearPassword
});

const rules = computed<RuleRecord>(() => {
  const baseRules: RuleRecord = {
    project_name: [createRequiredRule('项目名称不能为空')],
    phone: formRules.phone,
    verify_code: [createRequiredRule($t('form.code.required')), { ...patternRules.code, trigger: ['change', 'blur'] }],
    name: [createRequiredRule('用户名称不能为空')]
  };

  if (!showPasswordFields.value) {
    return baseRules;
  }

  return {
    ...baseRules,
    rsa_pwd: formRules.pwd,
    confirm_rsa_pwd: createConfirmPwdRule(rsaPwd)
  };
});

function onlyDigits(value: string) {
  return /^\d*$/.test(value);
}

function resetProjectCheck() {
  model.project_id = null;
  checkedProjectName.value = '';
  projectCheckStatus.value = 'unchecked';
}

function clearPassword() {
  model.rsa_pwd = '';
  model.confirm_rsa_pwd = '';
}

async function validateProjectField() {
  if (!projectFormItemRef.value) return false;

  model.project_name = model.project_name.trim();

  try {
    await projectFormItemRef.value.validate();
    return true;
  } catch {
    return false;
  }
}

async function checkProject() {
  if (projectCheckPromise) return projectCheckPromise;
  if (projectCheckStatus.value === 'checked') return true;

  const valid = await validateProjectField();
  if (!valid) return false;

  const projectName = model.project_name;
  projectCheckPromise = (async () => {
    startProjectLoading();
    try {
      const { data, error } = await fetchCheckProject({ project_name: projectName });
      if (model.project_name !== projectName) return false;

      const projectId = data?.project_id ?? data?.id;
      if (error || projectId === undefined || projectId === null) {
        projectCheckStatus.value = 'failed';
        return false;
      }

      model.project_id = projectId;
      checkedProjectName.value = projectName;
      projectCheckStatus.value = 'checked';
      window.$message?.success('项目校验通过');
      return true;
    } finally {
      endProjectLoading();
      projectCheckPromise = null;
    }
  })();

  return projectCheckPromise;
}

async function ensurePhoneChecked() {
  return checkPhone();
}

async function handleCheckProject() {
  await checkProject();
}

async function handleSendVerifyCode() {
  if (codeLoading.value || isCountingDown.value) return;

  if (!isProjectChecked.value) {
    const checked = await checkProject();
    if (!checked) return;
  }

  const checked = await ensurePhoneChecked();
  if (!checked) return;

  startCodeLoading();
  try {
    const { error } = await fetchSendVerifyCode({ phone: model.phone });
    if (error) return;

    window.$message?.success('验证码已发送');
    startCountdown();
  } finally {
    endCodeLoading();
  }
}

async function handleSubmit() {
  if (registerLoading.value) return;

  if (!isProjectChecked.value) {
    const checked = await checkProject();
    if (!checked) return;
  }

  const phoneChecked = await ensurePhoneChecked();
  if (!phoneChecked) return;

  await validate();

  if (model.project_id === null) return;

  startRegisterLoading();
  try {
    const { error } = await fetchRegister({
      confirm_rsa_pwd: showPasswordFields.value
        ? (encryptByRsa(model.confirm_rsa_pwd, import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '') as string)
        : '',
      name: model.name,
      phone: model.phone,
      project_id: model.project_id,
      rsa_pwd: showPasswordFields.value
        ? (encryptByRsa(model.rsa_pwd, import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '') as string)
        : '',
      verify_code: model.verify_code
    });
    if (error) return;

    window.$message?.success('注册成功');
    toggleLoginModule('pwd-login');
  } finally {
    endRegisterLoading();
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

watch(
  () => model.project_name,
  value => {
    if (value !== checkedProjectName.value) {
      resetProjectCheck();
    }
  }
);

watch(
  () => model.phone,
  () => {
    resetPhoneCheckStatus();
  }
);

onBeforeUnmount(stopCountdown);
</script>

<template>
  <div>
    <div class="mb-5px text-32px text-black font-600 sm:text-30px dark:text-white">项目成员注册</div>
    <div class="pb-18px text-16px text-#858585">请输入项目和账户信息完成注册</div>
    <NForm
      ref="formRef"
      :model="model"
      :rules="rules"
      size="large"
      :show-label="false"
      @keyup.enter="() => !registerLoading && handleSubmit()"
    >
      <NFormItem
        ref="projectFormItemRef"
        path="project_name"
        :validation-status="projectValidationStatus"
        :feedback="projectFeedback"
      >
        <div class="w-full flex-y-center gap-16px">
          <NInput v-model:value="model.project_name" placeholder="请输入项目名称" />
          <NButton
            class="w-88px"
            :loading="projectLoading"
            :disabled="projectCheckStatus === 'checked'"
            @click="handleCheckProject"
          >
            查询
          </NButton>
        </div>
      </NFormItem>
      <NFormItem
        ref="phoneFormItemRef"
        path="phone"
        :validation-status="phoneValidationStatus"
        :feedback="phoneFeedback"
      >
        <div class="w-full flex-y-center gap-16px">
          <NInput
            v-model:value="model.phone"
            :allow-input="onlyDigits"
            :maxlength="11"
            placeholder="请输入手机号码"
            @blur="checkPhone()"
          />
          <NButton
            class="w-128px"
            :disabled="!isProjectChecked || isCountingDown"
            :loading="codeLoading"
            :focusable="false"
            @click="handleSendVerifyCode"
          >
            {{ verifyCodeButtonText }}
          </NButton>
        </div>
      </NFormItem>
      <NFormItem path="verify_code">
        <NInput
          v-model:value="model.verify_code"
          :allow-input="onlyDigits"
          :maxlength="6"
          placeholder="请输入验证码"
        ></NInput>
      </NFormItem>
      <NFormItem path="name">
        <NInput v-model:value="model.name" placeholder="请输入用户名称" />
      </NFormItem>
      <template v-if="showPasswordFields">
        <NFormItem path="rsa_pwd">
          <NInput v-model:value="model.rsa_pwd" type="password" show-password-on="click" placeholder="请输入密码" />
        </NFormItem>
        <NFormItem path="confirm_rsa_pwd">
          <NInput
            v-model:value="model.confirm_rsa_pwd"
            type="password"
            show-password-on="click"
            placeholder="请再次输入密码"
          />
        </NFormItem>
      </template>
      <NSpace vertical :size="20" class="w-full">
        <NButton
          type="primary"
          size="large"
          block
          :disabled="!isProjectChecked"
          :loading="registerLoading"
          @click="handleSubmit"
        >
          提交
        </NButton>
        <NButton size="large" block @click="toggleLoginModule('pwd-login')">返回</NButton>
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
