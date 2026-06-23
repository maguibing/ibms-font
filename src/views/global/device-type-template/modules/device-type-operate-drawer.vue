<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { SelectOption, UploadFileInfo } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { jsonClone } from '@sa/utils';
import { fetchCreateDeviceTypeTemplate, fetchUpdateDeviceTypeTemplate } from '@/service/api/device-type-template';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import FileUpload from '@/components/custom/file-upload.vue';
import { $t } from '@/locales';

defineOptions({
  name: 'DeviceTypeOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.System.DeviceTypeTemplate | null;
  categoryId?: CommonType.IdType | null;
  categories?: Api.System.DeviceTypeTemplateCategory[];
}

interface Emits {
  (e: 'submitted'): void;
}

const props = withDefaults(defineProps<Props>(), {
  rowData: null,
  categoryId: null,
  categories: () => []
});
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

type Model = {
  id: CommonType.IdType | null;
  category_id: CommonType.IdType | null;
  desc: string;
  icon: string;
  key: string;
  name: string;
  status: number;
};

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();

const model = ref<Model>(createDefaultModel());
const iconFileList = ref<UploadFileInfo[]>([]);

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增设备类型',
    edit: '编辑设备类型'
  };
  return titles[props.operateType];
});

const categoryOptions = computed<SelectOption[]>(() => {
  return props.categories.map(item => ({
    label: item.name,
    value: item.id
  }));
});

const rules: Record<string, App.Global.FormRule> = {
  category_id: createRequiredRule('请选择所属分类'),
  name: createRequiredRule('请输入设备类型名称'),
  key: createRequiredRule('请输入类型标识'),
  status: createRequiredRule('请选择状态')
};

function createDefaultModel(): Model {
  return {
    id: null,
    category_id: props.categoryId,
    desc: '',
    icon: '',
    key: '',
    name: '',
    status: 1
  };
}

function buildIconFileList(url?: string | null): UploadFileInfo[] {
  if (!url) return [];

  return [
    {
      id: url,
      name: url.split('/').pop() || '图标',
      status: 'finished',
      url
    }
  ];
}

function handleUpdateModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, jsonClone(props.rowData));
    model.value.status = Number(props.rowData.status) === 1 ? 1 : 2;
  }

  iconFileList.value = buildIconFileList(model.value.icon);
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const { id, category_id, desc, icon, key, name, status } = model.value;

  if (props.operateType === 'edit') {
    startLoading();
    const { error } = await fetchUpdateDeviceTypeTemplate({ id, category_id, desc, icon, key, name, status }).finally(
      endLoading
    );
    if (error) return;

    window.$message?.success($t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
    return;
  }

  startLoading();
  const { error } = await fetchCreateDeviceTypeTemplate({ category_id, desc, icon, key, name, status }).finally(
    endLoading
  );
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

watch(
  iconFileList,
  value => {
    const url = value.find(item => item.status === 'finished')?.url || '';
    if (url !== model.value.icon) {
      model.value.icon = url;
    }
  },
  { deep: true }
);
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="520" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
        <NFormItem label="所属分类" path="category_id">
          <NSelect v-model:value="model.category_id" disabled :options="categoryOptions" placeholder="请选择所属分类" />
        </NFormItem>
        <NFormItem label="设备类型名称" path="name">
          <NInput v-model:value="model.name" maxlength="30" show-count placeholder="请输入设备类型名称" />
        </NFormItem>
        <NFormItem label="类型标识" path="key">
          <NInput v-model:value="model.key" maxlength="48" show-count placeholder="请输入类型标识，如：METER_001" />
        </NFormItem>
        <NFormItem label="图标" path="icon">
          <FileUpload v-model:file-list="iconFileList" upload-type="image" :max="1" :file-size="5" :show-tip="false" />
        </NFormItem>
        <NFormItem label="状态" path="status">
          <div class="flex items-center gap-12px">
            <NSwitch v-model:value="model.status" :checked-value="1" :unchecked-value="2">
              <template #checked>启用</template>
              <template #unchecked>停用</template>
            </NSwitch>
          </div>
        </NFormItem>
        <NFormItem label="描述" path="desc">
          <NInput
            v-model:value="model.desc"
            type="textarea"
            maxlength="200"
            show-count
            :rows="5"
            placeholder="请输入描述"
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
