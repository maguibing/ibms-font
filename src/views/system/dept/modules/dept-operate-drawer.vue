<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { NInputNumber } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { fetchCreateDept, fetchGetDeptList, fetchUpdateDept } from '@/service/api/system/dept';
import { fetchGetUserList } from '@/service/api/system';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'DeptOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.Common.DeptNode | null;
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

const { loading: deptLoading, startLoading: startDeptLoading, endLoading: endDeptLoading } = useLoading();

const deptData = ref<Api.Common.DeptNode[]>([]);
const expandedKeys = ref<CommonType.IdType[]>([]);

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.system.dept.addDept'),
    edit: $t('page.system.dept.editDept')
  };
  return titles[props.operateType];
});

type Model = Api.System.DeptOperateParams;

const model = ref<Model>(createDefaultModel());

function getRowDeptId(row = props.rowData): CommonType.IdType | undefined {
  return row?.dept_id as CommonType.IdType | undefined;
}

function createDefaultModel(): Model {
  return {
    parent_id: getRowDeptId() || '',
    name: '',
    sort: null,
    leader_id: null
  };
}

type RuleKey = Extract<keyof Model, 'parent_id' | 'name'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  parent_id: createRequiredRule($t('page.system.dept.form.parentId.invalid')),
  name: createRequiredRule($t('page.system.dept.form.deptName.invalid'))
};

function handleUpdateModelWhenEdit() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    model.value = {
      ...model.value,
      parent_id: props.rowData.dept_parent_id,
      name: props.rowData.dept_name,
      sort: props.rowData.sort,
      leader_id: props.rowData.leader_id || null
    };
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const { parent_id, name, sort, leader_id } = model.value;

  // request
  if (props.operateType === 'add') {
    const { error } = await fetchCreateDept({
      parent_id,
      name,
      sort,
      leader_id
    });
    if (error) return;
    window.$message?.success($t('common.addSuccess'));
  }

  if (props.operateType === 'edit') {
    const { error } = await fetchUpdateDept({
      dept_id: getRowDeptId() as CommonType.IdType,
      parent_id,
      name,
      sort,
      leader_id
    });
    if (error) return;
    window.$message?.success($t('common.updateSuccess'));
  }

  closeDrawer();
  emit('submitted');
}

async function getDeptData() {
  startDeptLoading();
  const { data, error } = await fetchGetDeptList({ options: [{ key: 1 }] });

  if (error) {
    window.$message?.error(error.message || $t('page.system.dept.error.getDeptDataFail'));
    endDeptLoading();
    return;
  }

  if (data) {
    deptData.value = data.trees as Api.Common.DeptNode[];
  }

  endDeptLoading();
}

watch(visible, () => {
  if (visible.value) {
    getDeptData();
    handleUpdateModelWhenEdit();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="800" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem v-if="model.parent_id !== 0" :label="$t('page.system.dept.parentId')" path="parent_id">
          <NTreeSelect
            v-model:value="model.parent_id"
            v-model:expanded-keys="expandedKeys"
            :loading="deptLoading"
            clearable
            :options="deptData"
            label-field="dept_name"
            key-field="dept_id"
            :placeholder="$t('page.system.dept.form.parentId.required')"
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.dept.name')" path="name">
          <NInput v-model:value="model.name" :placeholder="$t('page.system.dept.form.deptName.required')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.dept.sort')" path="sort">
          <NInputNumber
            v-model:value="model.sort"
            class="w-full"
            :placeholder="$t('page.system.dept.form.sort.required')"
          />
        </NFormItem>

        <NFormItem :label="$t('page.system.dept.leader')" path="leader">
          <ApiSelect
            v-model:value="model.leader_id"
            :request="fetchGetUserList"
            clearable
            value-field="user_id"
            label-field="username"
            :placeholder="$t('page.system.dept.form.leader.required')"
            :request-params="{ list_option: { limit: 200, offset: 0 } }"
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
