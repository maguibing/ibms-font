<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { fetchUpdateProjectSysScreen } from '@/service/api/visual/screen';
import { $t } from '@/locales';

defineOptions({
  name: 'ProjectSysScreenOperateDrawer'
});

interface Props {
  rowData?: Api.Visual.ProjectSysScreen | null;
  coverUrl?: string;
}

interface Emits {
  (e: 'submitted'): void;
}

type Model = {
  id: CommonType.IdType | null;
  title: string;
  name: string;
  coverUrl: string;
};

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();

const title = computed(() => '编辑大屏');

const model = ref<Model>(createDefaultModel());

const rules: Partial<Record<keyof Model, App.Global.FormRule>> = {
  title: createRequiredRule('请输入大屏标题'),
  name: createRequiredRule('请输入大屏名称')
};

function createDefaultModel(): Model {
  return {
    id: null,
    title: '',
    name: '',
    coverUrl: ''
  };
}

function buildModel(row: Api.Visual.ProjectSysScreen | null | undefined, coverUrl?: string): Model {
  if (!row) {
    return createDefaultModel();
  }

  return {
    id: row.id,
    title: row.title || '',
    name: row.name || '',
    coverUrl: coverUrl || ''
  };
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  if (model.value.id === null) return;

  startLoading();
  const { error } = await fetchUpdateProjectSysScreen({
    list: [
      {
        id: model.value.id,
        name: model.value.name,
        title: model.value.title
      }
    ]
  }).finally(endLoading);

  if (error) return;

  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, async value => {
  if (!value) return;

  model.value = buildModel(props.rowData, props.coverUrl);
  await restoreValidation();
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="600">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top" :label-width="100">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi span="24" label="大屏标题" path="title">
            <NInput v-model:value="model.title" placeholder="请输入大屏标题" />
          </NFormItemGi>
          <NFormItemGi span="24" label="大屏名称" path="name">
            <NInput v-model:value="model.name" placeholder="请输入大屏名称" />
          </NFormItemGi>
          <NFormItemGi span="24" label="大屏封面" path="coverUrl">
            <NImage v-if="model.coverUrl" :src="model.coverUrl" width="400" height="225" object-fit="cover" />
            <span v-else>-</span>
          </NFormItemGi>
        </NGrid>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
