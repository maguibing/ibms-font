<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchCloneConfiguration } from '@/service/api/visual/configuration';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'ConfigurationCloneModal'
});

interface Props {
  rowData?: Api.Visual.Configuration | null;
}

interface Emits {
  (e: 'submitted'): void;
}

type Model = Api.Visual.ConfigurationCloneParams;

type RuleKey = Extract<keyof Model, 'name'>;

const props = withDefaults(defineProps<Props>(), {
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

const rules: Record<RuleKey, App.Global.FormRule> = {
  name: createRequiredRule($t('visualConfiguration.namePlaceholder'))
};

function createDefaultModel(): Model {
  return {
    id: null,
    name: '',
    desc: ''
  };
}

function closeModal() {
  visible.value = false;
}

function handleUpdateModel() {
  model.value = createDefaultModel();

  if (props.rowData) {
    model.value = {
      id: props.rowData.id,
      name: props.rowData.name || '',
      desc: props.rowData.desc || ''
    };
  }
}

async function handleSubmit() {
  await validate();

  startLoading();
  const { error } = await fetchCloneConfiguration(model.value).finally(endLoading);
  if (error) return;

  window.$message?.success($t('common.addSuccess'));
  closeModal();
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
  <NModal v-model:show="visible" preset="card" :title="$t('visualConfiguration.cloneTitle')" class="w-520px max-w-90%">
    <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
      <NFormItem :label="$t('visualConfiguration.name')" path="name">
        <NInput
          v-model:value="model.name"
          maxlength="30"
          show-count
          :placeholder="$t('visualConfiguration.namePlaceholder')"
        />
      </NFormItem>
      <NFormItem :label="$t('visualConfiguration.description')">
        <NInput
          v-model:value="model.desc"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-count
          :placeholder="$t('visualConfiguration.descriptionPlaceholder')"
        />
      </NFormItem>
    </NForm>
    <template #footer>
      <NSpace :size="16" justify="end">
        <NButton @click="closeModal">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
