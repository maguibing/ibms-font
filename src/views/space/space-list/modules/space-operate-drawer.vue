<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import {
  fetchCreateSpace,
  fetchGetSpace,
  fetchGetSpaceTrees,
  fetchGetSpaceTypeList,
  fetchUpdateSpace
} from '@/service/api/space';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'SpaceOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Space.Space | null;
}

interface Emits {
  (e: 'submitted'): void;
}

type Model = CommonType.RecordNullable<
  Pick<Api.Space.UpdateSpaceParams, 'id' | 'parent_id' | 'name' | 'key' | 'desc' | 'space_type_id'>
>;

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading: spaceLoading, startLoading: startSpaceLoading, endLoading: endSpaceLoading } = useLoading();

const spaceData = ref<Api.Space.Space[]>([]);
const expandedKeys = ref<CommonType.IdType[]>([]);
const model = ref<Model>(createDefaultModel());

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('space.add'),
    edit: $t('space.edit')
  };
  return titles[props.operateType];
});

const rules: Record<string, App.Global.FormRule> = {
  name: createRequiredRule($t('space.namePlaceholder')),
  space_key: createRequiredRule($t('space.keyPlaceholder'))
};

function getRowSpaceId(row = props.rowData): CommonType.IdType | undefined {
  return row?.space_id as CommonType.IdType | undefined;
}

function createDefaultModel(): Model {
  return {
    id: null,
    parent_id: getRowSpaceId() || 0,
    name: '',
    key: '',
    desc: '',
    space_type_id: null
  };
}

async function handleUpdateModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    const spaceId = getRowSpaceId();
    if (!spaceId) return;

    const { data, error } = await fetchGetSpace({ id: spaceId });
    if (error) return;

    if (!data?.space) return;

    const { id, name, space_key, desc, space_type_id } = data.space;

    model.value = {
      id,
      parent_id: props.rowData.parent_id ?? 0,
      name,
      key: space_key,
      desc,
      space_type_id
    };
  }
}

async function getSpaceData() {
  startSpaceLoading();
  const { data, error } = await fetchGetSpaceTrees().finally(endSpaceLoading);

  if (error) {
    spaceData.value = [];
    return;
  }

  spaceData.value = Array.isArray(data?.trees) ? data.trees : [];
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const { id, parent_id, name, key, desc, space_type_id } = model.value;
  const submitData: Api.Space.CreateSpaceParams = {
    parent_id: parent_id ?? 0,
    name: name as string,
    key: key as string,
    desc: desc as string,
    space_type_id: space_type_id ?? null
  };

  if (props.operateType === 'edit') {
    const { error } = await fetchUpdateSpace({
      id: id as CommonType.IdType,
      ...submitData
    });
    if (error) return;

    window.$message?.success($t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
    return;
  }

  const { error } = await fetchCreateSpace(submitData);
  if (error) return;

  window.$message?.success($t('common.addSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    getSpaceData();
    handleUpdateModel().then(() => restoreValidation());
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="700" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
        <NFormItem :label="$t('space.parent')" path="parent_id">
          <NTreeSelect
            v-model:value="model.parent_id"
            v-model:expanded-keys="expandedKeys"
            filterable
            :loading="spaceLoading"
            clearable
            :options="spaceData"
            label-field="space_name"
            key-field="space_id"
            :placeholder="$t('space.selectParent')"
          />
        </NFormItem>
        <NFormItem :label="$t('space.name')" path="name">
          <NInput v-model:value="model.name" maxlength="30" show-count :placeholder="$t('space.namePlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('space.key')" path="key">
          <NInput v-model:value="model.key" maxlength="48" show-count :placeholder="$t('space.keyPlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('space.type')" path="space_type_id">
          <ApiSelect
            v-model:value="model.space_type_id"
            :request="fetchGetSpaceTypeList"
            :request-params="{ list_option: { limit: 200, offset: 0 } }"
            clearable
            label-field="name"
            value-field="id"
            :placeholder="$t('space.selectType')"
          />
        </NFormItem>
        <NFormItem :label="$t('space.description')" path="desc">
          <NInput
            v-model:value="model.desc"
            type="textarea"
            maxlength="200"
            show-count
            :rows="4"
            :placeholder="$t('space.descriptionPlaceholder')"
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
