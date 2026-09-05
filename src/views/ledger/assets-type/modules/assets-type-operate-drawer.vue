<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { jsonClone } from '@sa/utils';
import { fetchCreateAssetsType, fetchUpdateAssetsType } from '@/service/api/ledger';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'AssetsTypeOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Ledger.AssetsType | null;
}

interface Emits {
  (e: 'submitted'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

type Model = Api.Ledger.AssetsTypeOperateParams;

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('ledger.addAssetsType'),
    edit: $t('ledger.editAssetsType')
  };
  return titles[props.operateType];
});

const model = ref<Model>(createDefaultModel());

const rules: Record<string, App.Global.FormRule> = {
  name: createRequiredRule($t('ledger.typeName')),
  status: createRequiredRule($t('ledger.selectStatus'))
};

function createDefaultModel(): Model {
  return {
    id: null,
    name: '',
    status: 1,
    desc: ''
  };
}

function handleUpdateModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, jsonClone(props.rowData));
    model.value.status = Number(props.rowData.status) === 1 ? 1 : 2;
    model.value.desc = props.rowData.desc || '';
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const { id, name, status, desc } = model.value;

  if (props.operateType === 'edit') {
    startLoading();
    const { error } = await fetchUpdateAssetsType({ id, name, status, desc }).finally(endLoading);
    if (error) return;

    window.$message?.success($t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
    return;
  }

  startLoading();
  const { error } = await fetchCreateAssetsType({ name, status, desc }).finally(endLoading);
  if (error) return;

  window.$message?.success($t('common.addSuccess'));
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
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
        <NFormItem :label="$t('ledger.assetsTypeName')" path="name">
          <NInput v-model:value="model.name" maxlength="30" show-count :placeholder="$t('ledger.typeName')" />
        </NFormItem>
        <NFormItem :label="$t('ledger.status')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NSpace>
              <NRadio :value="1">{{ $t('ledger.enabled') }}</NRadio>
              <NRadio :value="2">{{ $t('ledger.disabled') }}</NRadio>
            </NSpace>
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('ledger.desc')" path="desc">
          <NInput
            v-model:value="model.desc"
            type="textarea"
            maxlength="200"
            show-count
            :rows="4"
            :placeholder="$t('ledger.inputDesc')"
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
