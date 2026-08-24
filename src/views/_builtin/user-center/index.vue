<script setup lang="ts">
import { reactive, ref } from 'vue';
import { NButton } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { encryptByRsa } from '@sa/utils';
import { fetchGetDeptTree, fetchGetRoleList, fetchUpdatePassword, fetchUpdateUser } from '@/service/api/system';
import { useAuthStore } from '@/store/modules/auth';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import UserAvatar from './modules/user-avatar.vue';
defineOptions({
  name: 'UserCenter'
});

const authStore = useAuthStore();
const { userInfo } = authStore;

const { loading: btnLoading, startLoading: startBtnLoading, endLoading: endBtnLoading } = useLoading();

const {
  formRef: profileFormRef,
  validate: profileValidate,
  restoreValidation: profileRestoreValidation
} = useNaiveForm();
const {
  formRef: passwordFormRef,
  validate: passwordValidate,
  restoreValidation: passwordRestoreValidation
} = useNaiveForm();
const { createRequiredRule } = useFormRules();

type ProfileModel = Pick<
  Api.Auth.UserInfoUser,
  'account_id' | 'user_id' | 'username' | 'phone' | 'gender' | 'dept_id' | 'role_id' | 'email' | 'p_type'
>;
type PasswordModel = Api.System.UserPasswordOperateParams;

const profileModel: ProfileModel = reactive(createDefaultProfileModel());
const passwordModel: PasswordModel = reactive(createDefaultPasswordModel());

function createDefaultProfileModel(): ProfileModel {
  return {
    ...userInfo.user
  } as ProfileModel;
}

function createDefaultPasswordModel(): PasswordModel {
  return {
    old_rsa_pwd: '',
    new_rsa_pwd: '',
    confirm_rsa_pwd: ''
  };
}

type ProfileRuleKey = Extract<keyof ProfileModel, 'username' | 'role_id'>;
type PasswordRuleKey = Extract<keyof PasswordModel, 'old_rsa_pwd' | 'new_rsa_pwd' | 'confirm_rsa_pwd'>;

const profileRules: Record<ProfileRuleKey, App.Global.FormRule> = {
  username: createRequiredRule($t('page.userCenter.form.username.required')),
  role_id: createRequiredRule($t('page.userCenter.form.role.required'))
};

const passwordRules: Record<PasswordRuleKey, App.Global.FormRule> = {
  old_rsa_pwd: createRequiredRule($t('page.userCenter.form.oldPassword.required')),
  confirm_rsa_pwd: createRequiredRule($t('page.userCenter.form.confirmPassword.required')),
  new_rsa_pwd: createRequiredRule($t('page.userCenter.form.newPassword.required'))
};

const deptData = ref<Api.Common.DeptNode[]>([]);
const { loading: deptLoading, startLoading: startDeptLoading, endLoading: endDeptLoading } = useLoading();

async function getDeptData() {
  startDeptLoading();
  const { data, error } = await fetchGetDeptTree({ options: [{ key: 1 }] });
  if (error) return;
  deptData.value = data.trees;
  endDeptLoading();
}

getDeptData();

async function updateProfile() {
  await profileValidate();
  startBtnLoading();
  const { error } = await fetchUpdateUser({ ...profileModel });
  if (!error) {
    window.$message?.success($t('page.userCenter.message.profileUpdateSuccess'));
    // 更新本地用户信息
    if (userInfo.user) {
      authStore.updateUserProfile(profileModel);
      await authStore.refreshUserInfo();
      profileRestoreValidation();
    }
  }
  endBtnLoading();
}

async function updatePassword() {
  await passwordValidate();
  if (passwordModel.new_rsa_pwd !== passwordModel.confirm_rsa_pwd) {
    window.$message?.error($t('page.userCenter.message.passwordMismatch'));
    return;
  }
  startBtnLoading();
  const { old_rsa_pwd, new_rsa_pwd } = passwordModel;
  const { error } = await fetchUpdatePassword({
    old_rsa_pwd: encryptByRsa(old_rsa_pwd as string, import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '') as string,
    new_rsa_pwd: encryptByRsa(new_rsa_pwd as string, import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '') as string
  });
  if (!error) {
    window.$message?.success($t('page.userCenter.message.passwordUpdateSuccess'));
    // 清空表单
    Object.assign(passwordModel, createDefaultPasswordModel());
    passwordRestoreValidation();
  }
  endBtnLoading();
}
</script>

<template>
  <div class="flex gap-16px">
    <!-- 个人信息卡片 -->
    <NCard :title="$t('page.userCenter.personalInfo')" class="w-360px shadow-sm">
      <div class="flex-x-center flex-wrap gap-24px">
        <div class="flex-center flex-col gap-16px">
          <div class="relative">
            <UserAvatar />
          </div>
          <div class="text-18px font-medium">{{ authStore.userProfile.user?.username || '-' }}</div>
        </div>
        <NDescriptions :column="1" label-placement="left" label-width="120px">
          <NDescriptionsItem :label="$t('page.userCenter.phoneNumber')">
            <div class="text-14px">{{ authStore.userProfile.user?.phone || '-' }}</div>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.userCenter.dept')">
            <div class="text-14px">{{ authStore.userProfile.dept?.name || '-' }}</div>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.userCenter.role')">
            <div class="text-14px">{{ authStore.userProfile.role?.role_name || '-' }}</div>
          </NDescriptionsItem>
        </NDescriptions>
      </div>
    </NCard>

    <!-- 基本资料卡片 -->
    <NCard :title="$t('page.userCenter.basicInfo')" class="w-full overflow-x-auto shadow-sm">
      <NTabs type="line" animated class="h-full" s>
        <NTabPane name="userInfo" :tab="$t('page.userCenter.basicInfo')">
          <NForm
            ref="profileFormRef"
            :model="profileModel"
            :rules="profileRules"
            label-placement="left"
            label-width="100px"
            class="mt-16px max-w-520px"
          >
            <NFormItem :label="$t('page.userCenter.username')" path="username">
              <NInput v-model:value="profileModel.username" :placeholder="$t('page.userCenter.placeholder.nickname')" />
            </NFormItem>
            <NFormItem :label="$t('page.userCenter.phoneNumber')" path="phone">
              <NInput
                v-model:value="profileModel.phone"
                :placeholder="$t('page.userCenter.placeholder.phone')"
                readonly
              />
            </NFormItem>
            <NFormItem :label="$t('page.userCenter.dept')" path="dept_id">
              <NTreeSelect
                v-model:value="profileModel.dept_id"
                :loading="deptLoading"
                clearable
                :options="deptData as []"
                label-field="dept_name"
                key-field="dept_id"
                :default-expanded-keys="deptData?.length ? [deptData[0].dept_id] : []"
                :placeholder="$t('page.userCenter.placeholder.dept')"
              />
            </NFormItem>
            <NFormItem :label="$t('page.userCenter.role')" path="role_id">
              <ApiSelect
                v-model:value="profileModel.role_id"
                :request="fetchGetRoleList"
                :request-params="{
                  list_option: { limit: 100, offset: 0 }
                }"
                label-field="name"
                value-field="id"
                clearable
                :placeholder="$t('page.userCenter.placeholder.role')"
              />
            </NFormItem>
            <NFormItem :label="$t('page.userCenter.email')" path="email">
              <NInput v-model:value="profileModel.email" :placeholder="$t('page.userCenter.placeholder.email')" />
            </NFormItem>
            <NFormItem :label="$t('page.userCenter.gender')" path="gender">
              <NRadioGroup v-model:value="profileModel.gender">
                <NRadio :value="1">{{ $t('dict.sys_user_sex.male') }}</NRadio>
                <NRadio :value="2">{{ $t('dict.sys_user_sex.female') }}</NRadio>
                <NRadio :value="3">{{ $t('dict.sys_user_sex.unknown') }}</NRadio>
              </NRadioGroup>
            </NFormItem>
            <NFormItem class="flex items-center justify-end">
              <NButton class="ml-20px w-80px" type="primary" :loading="btnLoading" @click="updateProfile">
                <template #icon>
                  <SvgIcon icon="ic:outline-save" class="size-24px" />
                </template>
                {{ $t('common.save') }}
              </NButton>
            </NFormItem>
          </NForm>
        </NTabPane>
        <NTabPane name="updatePwd" :tab="$t('page.userCenter.updatePassword')">
          <NForm
            ref="passwordFormRef"
            :model="passwordModel"
            :rules="passwordRules"
            label-placement="left"
            label-width="100px"
            class="mt-16px max-w-520px"
          >
            <NFormItem :label="$t('page.userCenter.oldPassword')" path="old_rsa_pwd">
              <NInput
                v-model:value="passwordModel.old_rsa_pwd"
                type="password"
                :placeholder="$t('page.userCenter.placeholder.oldPassword')"
                show-password-on="click"
              />
            </NFormItem>
            <NFormItem :label="$t('page.userCenter.newPassword')" path="new_rsa_pwd">
              <NInput
                v-model:value="passwordModel.new_rsa_pwd"
                type="password"
                :placeholder="$t('page.userCenter.placeholder.newPassword')"
                show-password-on="click"
              />
            </NFormItem>
            <NFormItem :label="$t('page.userCenter.confirmPassword')" path="confirm_rsa_pwd">
              <NInput
                v-model:value="passwordModel.confirm_rsa_pwd"
                type="password"
                :placeholder="$t('page.userCenter.placeholder.confirmPassword')"
                show-password-on="click"
              />
            </NFormItem>
            <NFormItem class="flex items-center justify-end">
              <NButton class="ml-20px w-80px" type="primary" :loading="btnLoading" @click="updatePassword">
                <template #icon>
                  <SvgIcon icon="ic:outline-key" class="size-24px" />
                </template>
                {{ $t('common.save') }}
              </NButton>
            </NFormItem>
          </NForm>
        </NTabPane>
      </NTabs>
    </NCard>
  </div>
</template>

<style scoped>
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

:deep(.n-tabs-pane-wrapper),
:deep(.n-tab-pane) {
  height: 100% !important;
}
</style>
