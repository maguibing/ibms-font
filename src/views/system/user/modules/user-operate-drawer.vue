<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { encryptByRsa, jsonClone } from '@sa/utils';
import { useLoading } from '@sa/hooks';
import { fetchCreateUser, fetchGetRoleSelect, fetchUpdateUser } from '@/service/api/system';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'UserOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.System.User | null;
  /** the dept tree data */
  deptData?: Api.Common.DeptNode[];
  /** the dept id */
  deptId?: CommonType.IdType | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { loading, startLoading, endLoading } = useLoading();
const { loading: deptLoading, startLoading: startDeptLoading, endLoading: endDeptLoading } = useLoading();
const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule, patternRules } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.system.user.addUser'),
    edit: $t('page.system.user.editUser')
  };
  return titles[props.operateType];
});

type Model = Api.System.UserOperateParams & { rsa_pwd: string };

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    dept_id: undefined,
    role_id: undefined,
    username: '',
    email: '',
    phone: '',
    gender: 3,
    status: 1,
    rsa_pwd: '',
    password: ''
  };
}

type RuleKey = Extract<keyof Model, 'username' | 'role_id' | 'phone' | 'password' | 'status' | 'rsa_pwd' | 'password'>;

const rules: Record<RuleKey, App.Global.FormRule[]> = {
  username: [createRequiredRule($t('page.system.user.form.userName.required'))],
  role_id: [createRequiredRule($t('page.system.user.form.roleIds.required'))],
  phone: [createRequiredRule($t('page.system.user.form.phonenumber.required')), patternRules.phone],
  status: [createRequiredRule($t('page.system.user.form.status.required'))],
  password: [createRequiredRule($t('page.system.user.form.password.required')), patternRules.pwd],
  rsa_pwd: [createRequiredRule($t('page.system.user.form.confirmPassword.required')), patternRules.pwd]
};

function handleUpdateModelWhenEdit() {
  model.value = createDefaultModel();
  startLoading();
  if (props.operateType === 'edit' && props.rowData) {
    startDeptLoading();
    Object.assign(model.value, jsonClone(props.rowData));
    endDeptLoading();
  }
  endLoading();
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  if (props.operateType === 'add') {
    const params = {
      rsa_pwd: encryptByRsa(model.value.rsa_pwd as string, import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '') as string,
      user: model.value
    };

    const { error } = await fetchCreateUser(params);
    if (error) return;
    window.$message?.success($t('common.addSuccess'));
  }

  if (props.operateType === 'edit') {
    const { error } = await fetchUpdateUser(model.value);
    if (error) return;
    window.$message?.success($t('common.updateSuccess'));
  }

  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModelWhenEdit();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="600" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NSpin :show="loading">
        <NForm ref="formRef" :model="model" :rules="rules">
          <NFormItem :label="$t('page.system.user.userName')" path="username">
            <NInput v-model:value="model.username" :placeholder="$t('page.system.user.form.userName.required')" />
          </NFormItem>
          <NFormItem :label="$t('page.system.user.deptName')" path="dept_id">
            <NTreeSelect
              v-model:value="model.dept_id"
              :loading="deptLoading"
              clearable
              :options="deptData as []"
              label-field="dept_name"
              key-field="dept_id"
              :default-expanded-keys="deptData?.length ? [deptData[0].dept_id] : []"
              :placeholder="$t('page.system.user.form.deptId.required')"
            />
          </NFormItem>
          <NFormItem :label="$t('page.system.user.sex')" path="gender">
            <NRadioGroup v-model:value="model.gender">
              <NRadio :value="1">男</NRadio>
              <NRadio :value="2">女</NRadio>
              <NRadio :value="3">未知</NRadio>
            </NRadioGroup>
          </NFormItem>
          <NFormItem :label="$t('page.system.user.roleIds')" path="role_id">
            <ApiSelect
              v-model:value="model.role_id"
              :request="fetchGetRoleSelect"
              clearable
              value-field="id"
              label-field="name"
              :placeholder="$t('page.system.user.form.roleIds.required')"
              :request-params="{ list_option: { limit: 20, offset: 0 } }"
            />
          </NFormItem>
          <NFormItem :label="$t('page.system.user.phonenumber')" :path="operateType === 'add' ? 'phone' : ''">
            <NInput
              v-model:value="model.phone"
              :placeholder="$t('page.system.user.form.phonenumber.required')"
              :disabled="operateType === 'edit'"
              :maxlength="11"
            />
          </NFormItem>

          <template v-if="operateType === 'add'">
            <NFormItem :label="$t('page.system.user.password')" path="password">
              <NInput
                v-model:value="model.password"
                type="password"
                show-password-on="click"
                :input-props="{ autocomplete: 'off' }"
                :placeholder="$t('page.system.user.form.password.required')"
              />
            </NFormItem>
            <NFormItem :label="$t('page.system.user.confirmPassword')" path="rsa_pwd">
              <NInput
                v-model:value="model.rsa_pwd"
                type="password"
                show-password-on="click"
                :input-props="{ autocomplete: 'off' }"
                :placeholder="$t('page.system.user.form.confirmPassword.required')"
              />
            </NFormItem>
          </template>

          <NFormItem :label="$t('page.system.user.email')" path="email">
            <NInput v-model:value="model.email" :placeholder="$t('page.system.user.form.email.required')" />
          </NFormItem>
          <NFormItem :label="$t('page.system.user.status')" path="status">
            <NRadioGroup v-model:value="model.status">
              <NRadio :value="1">正常</NRadio>
              <NRadio :value="2">停用</NRadio>
            </NRadioGroup>
          </NFormItem>
        </NForm>
      </NSpin>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.save') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
