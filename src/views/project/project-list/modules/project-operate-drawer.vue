<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { encryptByRsa, jsonClone } from '@sa/utils';
import { NCascader } from 'naive-ui';
import type { CascaderOption } from 'naive-ui';
import regionTree from '@province-city-china/level';
import { fetchGetVersionList } from '@/service/api/corp';
import { fetchCreateProject, fetchUpdateProject } from '@/service/api/sys-screen';
import { fetchGetPhone, fetchGetUserList } from '@/service/api/system';
import { menuPlatformType } from '@/constants/business';
import { usePhoneExistCheck } from '@/hooks/business/use-phone-exist-check';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'ProjectOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.System.Project | null;
}

interface Emits {
  (e: 'submitted'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createConfirmPwdRule, createRequiredRule, patternRules } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增项目',
    edit: '编辑项目'
  };
  return titles[props.operateType];
});

type Model = {
  name: string;
  ad_code: string;
  ad_address: string;
  address: string;
  version_id: CommonType.IdType | null;
  leader_id: CommonType.IdType | null;
  leader_phone: string;
  rsa_pwd: string;
  confirm_password: string;
  desc: string;
};

type RequestOption = {
  type: number;
  value: unknown;
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
  getPhone: () => model.value.leader_phone,
  setPhone: phone => {
    model.value.leader_phone = phone;
  },
  pType: menuPlatformType.project,
  existsFeedback: '负责人电话已存在，将使用已存在账号',
  onExists: clearPassword,
  onReset: clearPassword
});
const showCreatePasswordFields = computed(() => props.operateType === 'add' && showPasswordFields.value);

const versionRequestParams: Api.System.CorpProjectVersionListParams = {
  list_option: {
    options: [{ type: 4, value: 'true' }],
    offset: 0,
    limit: 10
  }
};

const userRequestParams: CommonType.CommonListQueryParams = {
  list_option: {
    offset: 0,
    limit: 10
  }
};

function fetchProjectVersionList(params: Record<string, any>) {
  const listOption = params.list_option ?? {};
  const options: RequestOption[] = Array.isArray(listOption.options) ? listOption.options : [];
  const searchValue = options.find(item => item.type === 1)?.value ?? '';
  const otherOptions = options.filter(item => item.type !== 1 && item.type !== 4);

  return fetchGetVersionList({
    ...params,
    list_option: {
      ...listOption,
      options: [{ type: 1, value: searchValue }, { type: 4, value: 'true' }, ...otherOptions]
    }
  } as Api.System.CorpProjectVersionListParams);
}

function fetchProjectUserList(params: Record<string, any>) {
  return fetchGetUserList(params as CommonType.CommonListQueryParams);
}

function createDefaultModel(): Model {
  return {
    name: '',
    ad_code: '',
    ad_address: '',
    address: '',
    version_id: null,
    leader_id: null,
    leader_phone: '',
    rsa_pwd: '',
    confirm_password: '',
    desc: ''
  };
}

function buildModelFromRow(row: Api.System.Project): Model {
  return {
    ...createDefaultModel(),
    ...jsonClone(row),
    leader_id: row.corp_leader_id ?? row.project_leader_id ?? null
  };
}

function clearPassword() {
  model.value.rsa_pwd = '';
  model.value.confirm_password = '';
}

type RuleKey = Extract<
  keyof Model,
  'name' | 'ad_address' | 'address' | 'version_id' | 'leader_id' | 'leader_phone' | 'rsa_pwd' | 'confirm_password'
>;

const rules = computed<Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>>>(() => {
  const baseRules: Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>> = {
    name: [
      createRequiredRule('项目名称不能为空'),
      {
        max: 20,
        message: '项目名称不能超过20个字符',
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
    version_id: createRequiredRule('项目版本不能为空'),
    leader_id: createRequiredRule('负责人不能为空')
  };

  if (props.operateType === 'add') {
    baseRules.leader_phone = [
      createRequiredRule('联系电话不能为空'),
      { ...patternRules.phone, trigger: ['change', 'blur'] }
    ];
  }

  if (!showCreatePasswordFields.value) {
    return baseRules;
  }

  return {
    ...baseRules,
    rsa_pwd: [createRequiredRule('项目平台密码不能为空'), patternRules.pwd],
    confirm_password: createConfirmPwdRule(model.value.rsa_pwd)
  };
});

const regionOptions = transformRegionOptions(regionTree);

const selectedLeaderPhone = computed(() => {
  return model.value.leader_phone;
});

const selectedVersionOption = computed(() => {
  if (!model.value.version_id || !props.rowData?.version_name) return null;

  return {
    id: model.value.version_id,
    name: props.rowData.version_name
  };
});

const selectedLeaderOption = computed(() => {
  if (!model.value.leader_id || !props.rowData?.leader_username) return null;

  return {
    user_id: model.value.leader_id,
    username: props.rowData.leader_username
  };
});

const operateParams = computed<Api.System.ProjectOperateParams>(() => ({
  ad_address: model.value.ad_address,
  ad_code: model.value.ad_code,
  address: model.value.address,
  desc: model.value.desc,
  leader_id: model.value.leader_id as CommonType.IdType,
  name: model.value.name,
  rsa_pwd: showCreatePasswordFields.value
    ? (encryptByRsa(model.value.rsa_pwd, import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '') as string)
    : '',
  version_id: model.value.version_id as CommonType.IdType
}));

const updateParams = computed<Omit<Api.System.ProjectUpdateParams, 'id'>>(() => {
  const { rsa_pwd: _rsaPwd, ...params } = operateParams.value;

  return params;
});

function transformRegionOptions(options: ProvinceCityChina.Level[]): CascaderOption[] {
  return options.map(item => ({
    label: item.name,
    value: item.code,
    children: item.children ? transformRegionOptions(item.children) : undefined
  }));
}

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

  if (props.operateType === 'edit' && props.rowData) {
    model.value = buildModelFromRow(props.rowData);
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  if (props.operateType === 'edit') {
    const { error } = await fetchUpdateProject({
      ...updateParams.value,
      id: props.rowData!.id
    });
    if (error) return;

    window.$message?.success($t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
    return;
  }

  const checked = await checkPhone();
  if (!checked) return;

  const { error } = await fetchCreateProject(operateParams.value);
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

async function handleLeaderChange() {
  model.value.leader_phone = '';
  if (props.operateType === 'add') {
    resetPhoneCheckStatus();
  } else {
    resetPhoneCheck();
  }

  const leaderId = model.value.leader_id;
  if (!leaderId) return;

  const { data, error } = await fetchGetPhone({ user_id: leaderId });
  if (model.value.leader_id !== leaderId) return;
  if (error) return;

  model.value.leader_phone = data?.phone || '';
  if (!model.value.leader_phone) return;

  if (props.operateType === 'add') {
    await checkPhone();
  }
}
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="600" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top" :label-width="120">
        <NFormItem label="项目名称" path="name">
          <NInput v-model:value="model.name" placeholder="请输入项目名称" :maxlength="20" show-count />
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
        <NFormItem label="项目版本" path="version_id">
          <RemoteSearchSelect
            v-model:value="model.version_id"
            :request="fetchProjectVersionList"
            :request-params="versionRequestParams"
            :search-type="1"
            :selected-options="selectedVersionOption"
            :limit="10"
            label-field="name"
            value-field="id"
            placeholder="请选择项目版本"
          />
        </NFormItem>
        <NFormItem label="负责人" path="leader_id">
          <RemoteSearchSelect
            v-model:value="model.leader_id"
            :request="fetchProjectUserList"
            :request-params="userRequestParams"
            :search-type="1"
            :selected-options="selectedLeaderOption"
            :limit="10"
            label-field="username"
            value-field="user_id"
            placeholder="请选择负责人"
            @selected-change="handleLeaderChange"
          />
        </NFormItem>
        <NFormItem
          ref="phoneFormItemRef"
          label="联系电话"
          :path="operateType === 'add' ? 'leader_phone' : ''"
          :validation-status="phoneValidationStatus"
          :feedback="phoneFeedback"
        >
          <NInput :value="selectedLeaderPhone" disabled placeholder="负责人电话" />
        </NFormItem>
        <template v-if="showCreatePasswordFields">
          <NFormItem label="项目平台密码" path="rsa_pwd">
            <NInput
              v-model:value="model.rsa_pwd"
              type="password"
              show-password-on="click"
              :input-props="{ autocomplete: 'new-password' }"
              placeholder="密码不会显示在系统中，请牢记登录密码，如忘记可重置密码"
            />
          </NFormItem>
          <NFormItem label="确认密码" path="confirm_password">
            <NInput
              v-model:value="model.confirm_password"
              type="password"
              show-password-on="click"
              :input-props="{ autocomplete: 'new-password' }"
              placeholder="登录密码不会显示在系统中，请牢记登录密码，如忘记可重置密码"
            />
          </NFormItem>
        </template>
        <NFormItem label="项目描述">
          <NInput
            v-model:value="model.desc"
            type="textarea"
            placeholder="请输入项目描述"
            :maxlength="200"
            show-count
            :autosize="{ minRows: 6, maxRows: 8 }"
          />
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
