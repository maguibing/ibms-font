<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchCreateCustomScreen, fetchUpdateCustomScreen } from '@/service/api/visual/custom-screen';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'CustomScreenOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Visual.CustomScreen | null;
}

interface Emits {
  (e: 'submitted'): void;
}

type Model = Api.Visual.CustomScreenOperateParams;

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

const isEdit = computed(() => props.operateType === 'edit');
const drawerTitle = computed(() =>
  isEdit.value ? $t('visualCustomScreen.editTitle') : $t('visualCustomScreen.addTitle')
);

const rules: Record<RuleKey, App.Global.FormRule> = {
  name: createRequiredRule($t('visualCustomScreen.namePlaceholder'))
};

function createDefaultModel(): Model {
  return {
    id: null,
    name: '',
    desc: ''
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
      name: props.rowData.name || '',
      desc: props.rowData.desc || ''
    };
  }
}

function buildSubmitParams(): Model {
  const params: Model = {
    name: model.value.name,
    desc: model.value.desc
  };

  if (isEdit.value) {
    params.id = model.value.id;
  }

  return params;
}

async function handleSubmit() {
  await validate();

  startLoading();
  const request = isEdit.value ? fetchUpdateCustomScreen : fetchCreateCustomScreen;
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
        <NFormItem :label="$t('visualCustomScreen.name')" path="name">
          <NInput
            v-model:value="model.name"
            maxlength="30"
            show-count
            :placeholder="$t('visualCustomScreen.namePlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('visualCustomScreen.description')">
          <NInput
            v-model:value="model.desc"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-count
            :placeholder="$t('visualCustomScreen.descriptionPlaceholder')"
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
