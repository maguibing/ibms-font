<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import {
  fetchCreateDeviceTypeTemplateCategory,
  fetchUpdateDeviceTypeTemplateCategory
} from '@/service/api/device-type-template';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'DeviceTypeTemplateCategoryOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.System.DeviceTypeTemplateCategory | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted', id?: CommonType.IdType | null): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增设备类型模板分类',
    edit: '编辑设备类型模板分类'
  };
  return titles[props.operateType];
});

type Model = Api.System.DeviceTypeTemplateCategoryOperateParams;

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    id: null,
    name: '',
    sort: 1,
    desc: ''
  };
}

type RuleKey = Extract<keyof Model, 'name'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  name: createRequiredRule('分类名称不能为空')
};

function handleUpdateModelWhenEdit() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, jsonClone(props.rowData));
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const { id, name, sort, desc } = model.value;

  if (props.operateType === 'add') {
    const { error } = await fetchCreateDeviceTypeTemplateCategory({ name, sort, desc });
    if (error) return;
  }

  if (props.operateType === 'edit') {
    const { error } = await fetchUpdateDeviceTypeTemplateCategory({ id, name, sort, desc });
    if (error) return;
  }

  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted', id);
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModelWhenEdit();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="500" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem label="分类名称" path="name">
          <NInput v-model:value="model.name" placeholder="请输入分类名称" />
        </NFormItem>
        <NFormItem label="排序号" path="sort">
          <NInputNumber v-model:value="model.sort" placeholder="请输入排序号" class="w-full" />
        </NFormItem>
        <NFormItem label="描述" path="desc">
          <NInput v-model:value="model.desc" type="textarea" :rows="3" placeholder="请输入描述" />
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
