<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { encryptByRsa, jsonClone } from '@sa/utils';
import { useLoading } from '@sa/hooks';
import { fetchCreateUser, fetchGetRoleSelect, fetchUpdateUser } from '@/service/api/system';
import { usePhoneExistCheck } from '@/hooks/business/phone-exist-check';
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
const {
  phoneFormItemRef,
  showPasswordFields,
  phoneValidationStatus,
  phoneFeedback,
  checkPhone,
  resetPhoneCheck,
  resetPhoneCheckStatus
} = usePhoneExistCheck({
  getPhone: () => model.value.phone || '',
  setPhone: phone => {
    model.value.phone = phone;
  },
  existsFeedback: '手机号码已存在，将使用已存在账号',
  onExists: clearPassword,
  onReset: clearPassword
});
const showCreatePasswordFields = computed(() => props.operateType === 'add' && showPasswordFields.value);

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

function clearPassword() {
  model.value.password = '';
  model.value.rsa_pwd = '';
}

type RuleKey = Extract<keyof Model, 'username' | 'role_id' | 'phone' | 'password' | 'status' | 'rsa_pwd'>;

const rules = computed<Partial<Record<RuleKey, App.Global.FormRule[]>>>(() => {
  const baseRules: Partial<Record<RuleKey, App.Global.FormRule[]>> = {
    username: [createRequiredRule($t('page.system.user.form.userName.required'))],
    role_id: [createRequiredRule($t('page.system.user.form.roleIds.required'))],
    status: [createRequiredRule($t('page.system.user.form.status.required'))]
  };

  if (props.operateType === 'add') {
    baseRules.phone = [
      createRequiredRule($t('page.system.user.form.phonenumber.required')),
      { ...patternRules.phone, trigger: ['change', 'blur'] }
    ];
  }

  if (!showCreatePasswordFields.value) {
    return baseRules;
  }

  return {
    ...baseRules,
    password: [createRequiredRule($t('page.system.user.form.password.required')), patternRules.pwd],
    rsa_pwd: [createRequiredRule($t('page.system.user.form.confirmPassword.required')), patternRules.pwd]
  };
});

function handleUpdateModelWhenEdit() {
  model.value = createDefaultModel();
  resetPhoneCheck();
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

async function handlePhoneBlur() {
  if (props.operateType !== 'add') return;
  await checkPhone();
}

async function handleSubmit() {
  await validate();

  if (props.operateType === 'add') {
    const checked = await checkPhone();
    if (!checked) return;

    const params = {
      rsa_pwd: showPasswordFields.value
        ? (encryptByRsa(model.value.rsa_pwd as string, import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '') as string)
        : '',
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

watch(
  () => model.value.phone,
  () => {
    if (props.operateType === 'add') {
      resetPhoneCheckStatus();
    } else {
      resetPhoneCheck();
    }
  }
);
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
              <NRadio :value="1">{{ $t('dict.sys_user_sex.male') }}</NRadio>
              <NRadio :value="2">{{ $t('dict.sys_user_sex.female') }}</NRadio>
              <NRadio :value="3">{{ $t('dict.sys_user_sex.unknown') }}</NRadio>
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
          <NFormItem
            ref="phoneFormItemRef"
            :label="$t('page.system.user.phonenumber')"
            :path="operateType === 'add' ? 'phone' : ''"
            :validation-status="phoneValidationStatus"
            :feedback="phoneFeedback"
          >
            <NInput
              v-model:value="model.phone"
              :placeholder="$t('page.system.user.form.phonenumber.required')"
              :disabled="operateType === 'edit'"
              :maxlength="11"
              @blur="handlePhoneBlur"
            />
          </NFormItem>

          <template v-if="showCreatePasswordFields">
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
              <NRadio :value="1">{{ $t('dict.sys_normal_disable.normal') }}</NRadio>
              <NRadio :value="2">{{ $t('dict.sys_normal_disable.disable') }}</NRadio>
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
