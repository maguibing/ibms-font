<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import {
  fetchCreateDeviceGroup,
  fetchGetDeviceGroup,
  fetchGetDeviceGroupTrees,
  fetchUpdateDeviceGroup
} from '@/service/api/device';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'DeviceGroupOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Device.DeviceGroup | null;
}

interface Emits {
  (e: 'submitted'): void;
}

type Model = CommonType.RecordNullable<Api.Device.UpdateDeviceGroupParams>;

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading: groupLoading, startLoading: startGroupLoading, endLoading: endGroupLoading } = useLoading();

const groupData = ref<Api.Device.DeviceGroup[]>([]);
const expandedKeys = ref<CommonType.IdType[]>([]);
const model = ref<Model>(createDefaultModel());

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增设备分组',
    edit: '编辑设备分组'
  };
  return titles[props.operateType];
});

const rules: Record<string, App.Global.FormRule> = {
  name: createRequiredRule('请输入分组名称')
};

function getRowGroupId(row = props.rowData): CommonType.IdType | undefined {
  return row?.group_id as CommonType.IdType | undefined;
}

function createDefaultModel(): Model {
  return {
    id: null,
    parent_id: props.operateType === 'add' ? getRowGroupId() || 0 : 0,
    name: '',
    desc: ''
  };
}

async function handleUpdateModel() {
  model.value = createDefaultModel();

  if (props.operateType !== 'edit' || !props.rowData) return;

  const groupId = getRowGroupId();
  if (!groupId) return;

  const { data, error } = await fetchGetDeviceGroup({ id: groupId });
  if (error || !data?.device_group) return;

  const { id, name } = data.device_group;

  model.value = {
    id,
    parent_id: props.rowData.parent_id ?? 0,
    name,
    desc: props.rowData.desc ?? ''
  };
}

async function getGroupData() {
  startGroupLoading();
  const { data, error } = await fetchGetDeviceGroupTrees().finally(endGroupLoading);

  if (error) {
    groupData.value = [];
    return;
  }

  groupData.value = Array.isArray(data?.device_group_trees) ? data.device_group_trees : [];
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const { id, parent_id, name, desc } = model.value;
  const submitData: Api.Device.CreateDeviceGroupParams = {
    parent_id: parent_id ?? 0,
    name: name as string,
    desc: desc ?? ''
  };

  if (props.operateType === 'edit') {
    const { error } = await fetchUpdateDeviceGroup({
      id: id as CommonType.IdType,
      ...submitData
    });
    if (error) return;

    window.$message?.success($t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
    return;
  }

  const { error } = await fetchCreateDeviceGroup(submitData);
  if (error) return;

  window.$message?.success($t('common.addSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    getGroupData();
    handleUpdateModel().then(() => restoreValidation());
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="700" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
        <NFormItem label="上级分组" path="parent_id">
          <NTreeSelect
            v-model:value="model.parent_id"
            v-model:expanded-keys="expandedKeys"
            filterable
            :loading="groupLoading"
            clearable
            :options="groupData"
            label-field="group_name"
            key-field="group_id"
            placeholder="请选择上级分组"
          />
        </NFormItem>
        <NFormItem label="分组名称" path="name">
          <NInput v-model:value="model.name" maxlength="30" show-count placeholder="请输入分组名称" />
        </NFormItem>
        <NFormItem label="描述" path="desc">
          <NInput
            v-model:value="model.desc"
            type="textarea"
            maxlength="200"
            show-count
            :rows="4"
            placeholder="请输入描述"
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
