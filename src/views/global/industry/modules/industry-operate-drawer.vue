<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import { fetchAddIndustry, fetchUpdateIndustry } from '@/service/api';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'DemoOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.System.Industry | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted', dictType: string): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增测试单表',
    edit: '编辑测试单表'
  };
  return titles[props.operateType];
});

type Model = Pick<Api.System.Industry, 'id' | 'name' | 'sort' | 'desc'>;

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    id: 0,
    name: '',
    sort: 0,
    desc: ''
  };
}

type RuleKey = Extract<keyof Model, 'name'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  name: createRequiredRule('行业名称不能为空')
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

  // request
  if (props.operateType === 'add') {
    const { error } = await fetchAddIndustry({ name, sort, desc });
    if (error) return;
  }

  if (props.operateType === 'edit') {
    const { error } = await fetchUpdateIndustry({ id, name, sort, desc });
    if (error) return;
  }

  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted', dictType!);
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModelWhenEdit();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="800" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem label="行业名称" path="name">
          <NInput v-model:value="model.name" placeholder="请输入行业名称" />
        </NFormItem>
        <NFormItem label="排序号" path="sort">
          <NInputNumber v-model:value="model.sort" placeholder="请输入排序号" />
        </NFormItem>
        <NFormItem label="描述" path="desc">
          <NInput v-model:value="model.desc" placeholder="请输入描述" />
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
