<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchCreateConfiguration, fetchUpdateConfiguration } from '@/service/api/visual/configuration';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'ConfigurationOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Visual.Configuration | null;
  categories: Api.Visual.ConfigurationCategory[];
  categoryId?: CommonType.IdType | null;
}

interface Emits {
  (e: 'submitted'): void;
}

type Model = Api.Visual.ConfigurationOperateParams;

type RuleKey = Extract<keyof Model, 'configuration_category_id' | 'name'>;

const props = withDefaults(defineProps<Props>(), {
  rowData: null,
  categoryId: 0
});

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();

const model = ref<Model>(createDefaultModel());
const expandedKeys = ref<CommonType.IdType[]>([0]);

const isEdit = computed(() => props.operateType === 'edit');
const drawerTitle = computed(() => (isEdit.value ? '编辑组态' : '新增组态'));

const rules: Record<RuleKey, App.Global.FormRule> = {
  configuration_category_id: createRequiredRule('请选择组态分类'),
  name: createRequiredRule('请输入组态名称')
};

function createDefaultModel(): Model {
  return {
    id: null,
    configuration_category_id: props.categoryId ?? 0,
    name: '',
    desc: '',
    type: 1
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
      configuration_category_id: props.rowData.configuration_category_id ?? props.categoryId ?? 0,
      name: props.rowData.name || '',
      desc: props.rowData.desc || '',
      type: props.rowData.type ?? 1
    };
  }
}

function buildSubmitParams(): Model {
  const params: Model = {
    configuration_category_id: model.value.configuration_category_id,
    name: model.value.name,
    desc: model.value.desc,
    type: 1
  };

  if (isEdit.value) {
    params.id = model.value.id;
  }

  return params;
}

async function handleSubmit() {
  await validate();

  startLoading();
  const request = isEdit.value ? fetchUpdateConfiguration : fetchCreateConfiguration;
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
        <NFormItem label="组态分类" path="configuration_category_id">
          <NTreeSelect
            v-model:value="model.configuration_category_id"
            v-model:expanded-keys="expandedKeys"
            filterable
            :options="categories"
            label-field="name"
            key-field="id"
            placeholder="请选择组态分类"
          />
        </NFormItem>
        <NFormItem label="组态名称" path="name">
          <NInput v-model:value="model.name" maxlength="30" show-count placeholder="请输入组态名称" />
        </NFormItem>
        <NFormItem label="组态描述">
          <NInput
            v-model:value="model.desc"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-count
            placeholder="请输入组态描述"
          />
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
