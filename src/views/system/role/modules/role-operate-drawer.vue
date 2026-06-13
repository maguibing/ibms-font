<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import { fetchCreateRole, fetchUpdateRole } from '@/service/api/system/role';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'RoleOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.System.Role | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增角色',
    edit: '编辑角色'
  };
  return titles[props.operateType];
});

type Model = Pick<Api.System.RoleOperateParams, 'id' | 'name' | 'desc'>;

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    name: '',
    desc: ''
  };
}

type RuleKey = Extract<keyof Model, 'name' | 'desc'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  name: createRequiredRule('角色名称不能为空'),
  desc: createRequiredRule('角色描述不能为空')
};

async function handleUpdateModelWhenEdit() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    const { id, name, desc } = jsonClone(props.rowData);

    Object.assign(model.value, {
      id,
      name,
      desc: desc ?? ''
    });
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  const { id, name, desc } = model.value;

  // request
  if (props.operateType === 'add') {
    const { error } = await fetchCreateRole({
      name,
      desc
    });
    if (error) return;
    window.$message?.success($t('common.addSuccess'));
  }

  if (props.operateType === 'edit') {
    const { error } = await fetchUpdateRole({
      id,
      name,
      desc
    });
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
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="520" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem label="名称" path="name">
          <NInput v-model:value="model.name" placeholder="请输入名称" />
        </NFormItem>
        <NFormItem label="描述" path="desc">
          <NInput v-model:value="model.desc" :rows="3" type="textarea" placeholder="请输入描述" />
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
