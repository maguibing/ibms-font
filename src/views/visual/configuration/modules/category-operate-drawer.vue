<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchCreateConfigurationCategory, fetchUpdateConfigurationCategory } from '@/service/api/visual/configuration';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'VisualConfigurationCategoryOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Visual.ConfigurationCategory | null;
  categories: Api.Visual.ConfigurationCategory[];
  parentId?: CommonType.IdType | null;
}

interface Emits {
  (e: 'submitted'): void;
}

type Model = Api.Visual.ConfigurationCategoryOperateParams;

type RuleKey = Extract<keyof Model, 'name' | 'parent_id'>;

const props = withDefaults(defineProps<Props>(), {
  rowData: null,
  parentId: 0
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
const drawerTitle = computed(() =>
  isEdit.value ? $t('visualConfiguration.editCategory') : $t('visualConfiguration.addCategory')
);
const parentOptions = computed(() => {
  if (!isEdit.value || !props.rowData) return props.categories;

  return removeCategoryById(props.categories, props.rowData.id);
});

const rules: Record<RuleKey, App.Global.FormRule> = {
  name: createRequiredRule($t('visualConfiguration.categoryNamePlaceholder')),
  parent_id: createRequiredRule($t('visualConfiguration.parentCategory'))
};

function createDefaultModel(): Model {
  return {
    id: null,
    name: '',
    parent_id: props.parentId ?? 0
  };
}

function removeCategoryById(
  categories: Api.Visual.ConfigurationCategory[],
  id: CommonType.IdType
): Api.Visual.ConfigurationCategory[] {
  return categories
    .filter(category => category.id !== id)
    .map(category => {
      const { children, ...rest } = category;
      const nextCategory: Api.Visual.ConfigurationCategory = { ...rest };
      const nextChildren = removeCategoryById(Array.isArray(children) ? children : [], id);

      if (nextChildren.length) {
        nextCategory.children = nextChildren;
      }

      return nextCategory;
    });
}

function closeDrawer() {
  visible.value = false;
}

function handleUpdateModel() {
  model.value = createDefaultModel();

  if (isEdit.value && props.rowData) {
    model.value = {
      id: props.rowData.id,
      name: props.rowData.name || '',
      parent_id: props.rowData.parent_id ?? 0
    };
  }
}

function buildSubmitParams(): Model {
  const params: Model = {
    name: model.value.name,
    parent_id: model.value.parent_id
  };

  if (isEdit.value) {
    params.id = model.value.id;
  }

  return params;
}

async function handleSubmit() {
  await validate();

  startLoading();
  const request = isEdit.value ? fetchUpdateConfigurationCategory : fetchCreateConfigurationCategory;
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
        <NFormItem :label="$t('visualConfiguration.parentCategory')" path="parent_id">
          <NTreeSelect
            v-model:value="model.parent_id"
            v-model:expanded-keys="expandedKeys"
            filterable
            :options="parentOptions"
            label-field="name"
            key-field="id"
            :placeholder="$t('visualConfiguration.parentCategory')"
          />
        </NFormItem>
        <NFormItem :label="$t('visualConfiguration.categoryName')" path="name">
          <NInput
            v-model:value="model.name"
            maxlength="30"
            show-count
            :placeholder="$t('visualConfiguration.categoryNamePlaceholder')"
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
