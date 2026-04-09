<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useLoading } from '@sa/hooks';
import CryptoJS from 'crypto-js';
import { encryptByRsa } from '@sa/utils';
import { fetchCaptchaCode } from '@/service/api';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { localStg } from '@/utils/storage';
import { decryptWithAes, encryptWithAes } from '@/utils/crypto';
import { $t } from '@/locales';

const aesKey = CryptoJS.enc.Utf8.parse(import.meta.env.VITE_REMEMBER_ME_AES_KEY || 'pC4aO6cD2uU7hA0bK6iD4vE1mV8sU8xG');

defineOptions({
  name: 'PwdLogin'
});

const authStore = useAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();
const { loading: codeLoading, startLoading: startCodeLoading, endLoading: endCodeLoading } = useLoading();

const codeUrl = ref<string>();
const registerEnabled = ref<boolean>(false);
const remberMe = ref<boolean>(false);

const model: Api.Auth.PwdLoginForm = reactive({
  phone: '19999999999',
  rsa_pwd: '123456789##',
  captcha_id: '',
  captcha_answer: ''
});

type RuleKey = Extract<keyof Api.Auth.PwdLoginForm, 'phone' | 'rsa_pwd' | 'captcha_answer'>;

const rules = computed<Record<RuleKey, App.Global.FormRule[]>>(() => {
  // inside computed to make locale reactive, if not apply i18n, you can define it without computed
  const { formRules, createRequiredRule } = useFormRules();

  const loginRules: Record<RuleKey, App.Global.FormRule[]> = {
    phone: [...formRules.phone],
    rsa_pwd: [createRequiredRule($t('form.pwd.required'))],
    captcha_answer: [createRequiredRule($t('form.code.required'))]
  };

  return loginRules;
});

async function handleSubmit() {
  await validate();
  // 勾选了需要记住密码设置在 localStorage 中设置记住用户名和密码
  if (remberMe.value) {
    const { phone, rsa_pwd } = model;
    localStg.set('loginRember', encryptWithAes(JSON.stringify({ phone, rsa_pwd }), aesKey));
  } else {
    // 否则移除
    localStg.remove('loginRember');
  }
  try {
    const reqParmas = {
      ...model,
      rsa_pwd: encryptByRsa(model.rsa_pwd as string, import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '')
    };
    await authStore.login(reqParmas);
  } catch {
    handleFetchCaptchaCode();
  }
}

async function handleFetchCaptchaCode() {
  startCodeLoading();
  const { data, error } = await fetchCaptchaCode();
  if (!error) {
    model.captcha_id = data.captcha_id;
    codeUrl.value = `data:image/gif;base64,${data.captcha_img}`;
  }
  endCodeLoading();
}

handleFetchCaptchaCode();

function handleLoginRember() {
  const loginRember = localStg.get('loginRember');
  if (!loginRember) return;
  try {
    remberMe.value = true;
    Object.assign(model, JSON.parse(decryptWithAes(loginRember, aesKey)));
  } catch {}
}

handleLoginRember();

// async function handleRegister() {
//   const { data, error } = await fetchGetConfigDetail('sys.account.registerUser');
//   if (error) return;
//   registerEnabled.value = data.configValue === 'true';
// }

// handleRegister();

async function handleSocialLogin() {
  window.$message?.warning('暂未开放，敬请期待');
}
</script>

<template>
  <div>
    <div class="mb-5px text-32px text-black font-600 dark:text-white">登录到您的账户</div>
    <div class="pb-18px text-16px text-#858585">欢迎回来！请输入您的账户信息</div>
    <NForm
      ref="formRef"
      :model="model"
      :rules="rules"
      size="large"
      :show-label="false"
      @keyup.enter="() => !authStore.loginLoading && handleSubmit()"
    >
      <NFormItem path="phone">
        <NInput v-model:value="model.phone" :placeholder="$t('page.login.common.phonePlaceholder')" />
      </NFormItem>
      <NFormItem path="rsa_pwd">
        <NInput
          v-model:value="model.rsa_pwd"
          type="password"
          show-password-on="click"
          :placeholder="$t('page.login.common.passwordPlaceholder')"
        />
      </NFormItem>
      <NFormItem path="captcha_answer">
        <div class="w-full flex-y-center gap-16px">
          <NInput v-model:value="model.captcha_answer" :placeholder="$t('page.login.common.codePlaceholder')" />
          <NSpin :show="codeLoading" :size="28" class="h-42px">
            <NButton :focusable="false" class="login-code h-42px w-114px" @click="handleFetchCaptchaCode">
              <img v-if="codeUrl" :src="codeUrl" />
              <NEmpty v-else :show-icon="false" description="暂无验证码" />
            </NButton>
          </NSpin>
        </div>
      </NFormItem>
      <NSpace vertical :size="12" class="mb-8px">
        <div class="mx-6px mb-8px flex-y-center justify-between">
          <NCheckbox v-model:checked="remberMe" size="large">{{ $t('page.login.pwdLogin.rememberMe') }}</NCheckbox>
          <NA type="primary" class="text-18px" @click="toggleLoginModule('reset-pwd')">
            {{ $t('page.login.pwdLogin.forgetPassword') }}
          </NA>
        </div>
        <NButton type="primary" size="large" block :loading="authStore.loginLoading" @click="handleSubmit">
          {{ $t('common.login') }}
        </NButton>
        <NButton v-if="registerEnabled" size="large" block @click="toggleLoginModule('register')">
          {{ $t('page.login.common.register') }}
        </NButton>
      </NSpace>
    </NForm>

    <NDivider>
      <div class="color-#858585">{{ $t('page.login.pwdLogin.otherAccountLogin') }}</div>
    </NDivider>

    <div class="w-full flex-y-center gap-16px">
      <NButton class="flex-1" @click="handleSocialLogin">
        <template #icon>
          <icon-simple-icons-gitee class="color-#c71d23" />
        </template>
        <span class="ml-6px">Gitee</span>
      </NButton>
      <NButton class="flex-1" @click="handleSocialLogin">
        <template #icon>
          <icon-mdi-github class="color-#010409" />
        </template>
        <span class="ml-6px">GitHub</span>
      </NButton>
    </div>

    <div class="mt-24px w-full text-center text-18px text-#858585">
      您还没有账户？
      <NA type="primary" class="text-18px" @click="toggleLoginModule('register')">
        {{ $t('page.login.common.register') }}
      </NA>
    </div>
  </div>
</template>

<style scoped>
.login-code {
  &.n-button {
    --n-padding: 0 !important;
  }

  img {
    height: 42px;
    border-radius: 8px;
  }
}

:deep(.n-base-selection),
:deep(.n-input) {
  --n-height: 42px !important;
  --n-font-size: 16px !important;
  --n-border-radius: 8px !important;
}

:deep(.n-base-selection-label) {
  padding: 0 6px !important;
}

:deep(.n-checkbox) {
  --n-size: 18px !important;
  --n-font-size: 16px !important;
}

:deep(.n-button) {
  --n-height: 42px !important;
  --n-font-size: 18px !important;
  --n-border-radius: 8px !important;
}

:deep(.n-divider) {
  --n-font-size: 16px !important;
  --n-font-weight: 400 !important;
}
</style>
