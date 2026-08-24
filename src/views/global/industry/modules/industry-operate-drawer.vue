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
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, App.I18n.I18nKey> = {
    add: 'page.global.industry.addIndustry',
    edit: 'page.global.industry.editIndustry'
  };
  return $t(titles[props.operateType]);
});

type Model = Pick<Api.System.Industry, 'id' | 'name' | 'sort' | 'desc'>;

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    id: 0,
    name: '',
    sort: 1,
    desc: ''
  };
}

type RuleKey = Extract<keyof Model, 'name'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  name: createRequiredRule($t('page.global.industry.form.name.invalid'))
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
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="800" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem :label="$t('page.global.industry.name')" path="name">
          <NInput
            v-model:value="model.name"
            :placeholder="$t('page.global.industry.form.name.required')"
            :maxlength="30"
            show-count
          />
        </NFormItem>
        <NFormItem :label="$t('page.global.industry.sort')" path="sort">
          <NInputNumber v-model:value="model.sort" :placeholder="$t('page.global.industry.form.sort.required')" />
        </NFormItem>
        <NFormItem :label="$t('page.global.industry.desc')" path="desc">
          <NInput
            v-model:value="model.desc"
            type="textarea"
            :rows="3"
            :placeholder="$t('page.global.industry.form.desc.required')"
            :maxlength="200"
            show-count
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
