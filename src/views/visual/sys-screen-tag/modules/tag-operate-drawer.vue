<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { SelectOption } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { fetchCreateProjectSysScreenTag, fetchUpdateProjectSysScreenTag } from '@/service/api/visual/screen';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'ProjectSysScreenTagOperateDrawer'
});

interface Props {
  projectSysScreenId?: CommonType.IdType | null;
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Visual.ProjectSysScreenTag | null;
  scopeOptions: SelectOption[];
}

interface Emits {
  (e: 'submitted'): void;
}

type Model = {
  id: CommonType.IdType | null;
  key: string;
  name: string;
  project_sys_screen_id: CommonType.IdType | null;
  scope: number | null;
};

type RuleKey = Extract<keyof Model, 'name' | 'key' | 'scope'>;

const props = withDefaults(defineProps<Props>(), {
  projectSysScreenId: null,
  rowData: null
});
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();

const model = ref<Model>(createDefaultModel());

const isEdit = computed(() => props.operateType === 'edit');
const drawerTitle = computed(() => (isEdit.value ? '编辑大屏标签' : '新增大屏标签'));

const rules: Record<RuleKey, App.Global.FormRule> = {
  name: createRequiredRule('请输入标签名称'),
  key: createRequiredRule('请输入标签标识'),
  scope: createRequiredRule('请选择标签范围')
};

function createDefaultModel(): Model {
  return {
    id: null,
    key: '',
    name: '',
    project_sys_screen_id: props.projectSysScreenId ?? null,
    scope: null
  };
}

function closeDrawer() {
  visible.value = false;
}

function handleUpdateModel() {
  model.value = createDefaultModel();

  if (isEdit.value && props.rowData) {
    model.value = {
      id: props.rowData.id,
      key: props.rowData.key || '',
      name: props.rowData.name || '',
      project_sys_screen_id: props.rowData.project_sys_screen_id ?? props.projectSysScreenId ?? null,
      scope: props.rowData.scope ?? null
    };
  }
}

function buildSubmitParams(): Api.Visual.ProjectSysScreenTagOperateParams {
  const params: Api.Visual.ProjectSysScreenTagOperateParams = {
    key: model.value.key,
    name: model.value.name,
    project_sys_screen_id: Number(model.value.project_sys_screen_id),
    scope: Number(model.value.scope)
  };

  if (isEdit.value) {
    params.id = model.value.id;
  }

  return params;
}

async function handleSubmit() {
  if (model.value.project_sys_screen_id === null || model.value.project_sys_screen_id === undefined) {
    window.$message?.warning('缺少大屏ID');
    return;
  }

  await validate();

  startLoading();
  const request = isEdit.value ? fetchUpdateProjectSysScreenTag : fetchCreateProjectSysScreenTag;
  const { error } = await request(buildSubmitParams()).finally(endLoading);
  if (error) return;

  window.$message?.success(isEdit.value ? $t('common.updateSuccess') : $t('common.addSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModel();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="520" class="max-w-90%">
    <NDrawerContent :title="drawerTitle" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
        <NFormItem label="标签名称" path="name">
          <NInput v-model:value="model.name" maxlength="30" show-count placeholder="请输入标签名称" />
        </NFormItem>
        <NFormItem label="标签标识" path="key">
          <NInput v-model:value="model.key" maxlength="48" show-count placeholder="请输入标签标识，如：CHWP" />
        </NFormItem>
        <NFormItem label="标签范围" path="scope">
          <NSelect v-model:value="model.scope" :options="scopeOptions" placeholder="请选择标签范围" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
