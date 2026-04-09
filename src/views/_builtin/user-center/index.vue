<script setup lang="ts">
import { reactive, ref } from 'vue';
import { NButton } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { encryptByRsa } from '@sa/utils';
import { fetchGetDeptTree, fetchGetRoleList, fetchUpdatePassword, fetchUpdateUser } from '@/service/api/system';
import { useAuthStore } from '@/store/modules/auth';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
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
  username: createRequiredRule('用户名不能为空'),
  role_id: createRequiredRule('角色不能为空')
};

const passwordRules: Record<PasswordRuleKey, App.Global.FormRule> = {
  old_rsa_pwd: createRequiredRule('旧密码不能为空'),
  confirm_rsa_pwd: createRequiredRule('确认密码不能为空'),
  new_rsa_pwd: createRequiredRule('新密码不能为空')
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
    window.$message?.success('更新成功');
    // 更新本地用户信息
    if (userInfo.user) {
      Object.assign(userInfo.user, profileModel);
      profileRestoreValidation();
    }
  }
  endBtnLoading();
}

async function updatePassword() {
  await passwordValidate();
  if (passwordModel.new_rsa_pwd !== passwordModel.confirm_rsa_pwd) {
    window.$message?.error('两次输入的密码不一致');
    return;
  }
  startBtnLoading();
  const { old_rsa_pwd, new_rsa_pwd } = passwordModel;
  const { error } = await fetchUpdatePassword({
    old_rsa_pwd: encryptByRsa(old_rsa_pwd as string, import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '') as string,
    new_rsa_pwd: encryptByRsa(new_rsa_pwd as string, import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '') as string
  });
  if (!error) {
    window.$message?.success('密码修改成功');
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
    <NCard title="个人信息" class="w-360px shadow-sm">
      <div class="flex-x-center flex-wrap gap-24px">
        <div class="flex-center flex-col gap-16px">
          <div class="relative">
            <UserAvatar />
          </div>
          <div class="text-18px font-medium">{{ userInfo.user?.username }}</div>
        </div>
        <NDescriptions :column="1" label-placement="left" label-width="120px">
          <NDescriptionsItem label="手机号码">
            <div class="text-14px">{{ userInfo.user?.phone }}</div>
          </NDescriptionsItem>
          <NDescriptionsItem label="所属部门">
            <div class="text-14px">{{ userInfo.dept?.dept_name }}</div>
          </NDescriptionsItem>
          <NDescriptionsItem label="所属角色">
            <div class="text-14px">{{ userInfo.role?.role_name }}</div>
          </NDescriptionsItem>
          <NDescriptionsItem label="创建日期">
            <div class="text-14px">{{ userInfo.user?.created_at }}</div>
          </NDescriptionsItem>
        </NDescriptions>
      </div>
    </NCard>

    <!-- 基本资料卡片 -->
    <NCard title="基本资料" class="w-full overflow-x-auto shadow-sm">
      <NTabs type="line" animated class="h-full" s>
        <NTabPane name="userInfo" tab="基本资料">
          <NForm
            ref="profileFormRef"
            :model="profileModel"
            :rules="profileRules"
            label-placement="left"
            label-width="100px"
            class="mt-16px max-w-520px"
          >
            <NFormItem label="用户名" path="username">
              <NInput v-model:value="profileModel.username" placeholder="请输入昵称" />
            </NFormItem>
            <NFormItem label="手机号" path="phone">
              <NInput v-model:value="profileModel.phone" placeholder="请输入手机号" readonly />
            </NFormItem>
            <NFormItem label="部门" path="dept_id">
              <NTreeSelect
                v-model:value="profileModel.dept_id"
                :loading="deptLoading"
                clearable
                :options="deptData as []"
                label-field="dept_name"
                key-field="dept_id"
                :default-expanded-keys="deptData?.length ? [deptData[0].dept_id] : []"
                placeholder="请选择部门"
              />
            </NFormItem>
            <NFormItem label="角色" path="role_id">
              <ApiSelect
                v-model:value="profileModel.role_id"
                :request="fetchGetRoleList"
                :request-params="{
                  list_option: { limit: 100, offset: 0 }
                }"
                label-field="name"
                value-field="id"
                clearable
                placeholder="请选择角色"
              />
            </NFormItem>
            <NFormItem label="邮箱" path="email">
              <NInput v-model:value="profileModel.email" placeholder="请输入邮箱" />
            </NFormItem>
            <NFormItem label="性别" path="gender">
              <NRadioGroup v-model:value="profileModel.gender">
                <NRadio :value="1">男</NRadio>
                <NRadio :value="2">女</NRadio>
                <NRadio :value="3">未知</NRadio>
              </NRadioGroup>
            </NFormItem>
            <NFormItem class="flex items-center justify-end">
              <NButton class="ml-20px w-80px" type="primary" :loading="btnLoading" @click="updateProfile">
                <template #icon>
                  <SvgIcon icon="ic:outline-save" class="size-24px" />
                </template>
                保存
              </NButton>
            </NFormItem>
          </NForm>
        </NTabPane>

        <NTabPane name="updatePwd" tab="修改密码">
          <NForm
            ref="passwordFormRef"
            :model="passwordModel"
            :rules="passwordRules"
            label-placement="left"
            label-width="100px"
            class="mt-16px max-w-520px"
          >
            <NFormItem label="旧密码" path="old_rsa_pwd">
              <NInput
                v-model:value="passwordModel.old_rsa_pwd"
                type="password"
                placeholder="请输入旧密码"
                show-password-on="click"
              />
            </NFormItem>
            <NFormItem label="新密码" path="new_rsa_pwd">
              <NInput
                v-model:value="passwordModel.new_rsa_pwd"
                type="password"
                placeholder="请输入新密码"
                show-password-on="click"
              />
            </NFormItem>
            <NFormItem label="确认密码" path="confirm_rsa_pwd">
              <NInput
                v-model:value="passwordModel.confirm_rsa_pwd"
                type="password"
                placeholder="请再次输入新密码"
                show-password-on="click"
              />
            </NFormItem>
            <NFormItem class="flex items-center justify-end">
              <NButton class="ml-20px w-120px" type="primary" :loading="btnLoading" @click="updatePassword">
                <template #icon>
                  <SvgIcon icon="ic:outline-key" class="size-24px" />
                </template>
                修改密码
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
