<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchGetDeptTree } from '@/service/api/system';

defineOptions({
  name: 'DeptTreeSelect',
  inheritAttrs: false
});

type DeptTreeOption = Omit<Api.Common.DeptNode, 'children'> & {
  children?: DeptTreeOption[];
  [key: string]: unknown;
};

const value = defineModel<CommonType.IdType | CommonType.IdType[] | null>('value', { required: false });
const options = defineModel<Api.Common.DeptNode[]>('options', { required: false, default: () => [] });
const expandedKeys = defineModel<CommonType.IdType[]>('expandedKeys', { required: false, default: () => [] });

const { loading, startLoading, endLoading } = useLoading();

function normalizeDeptTree(depts: Api.Common.DeptNode[] = []): DeptTreeOption[] {
  return depts.map(({ children, ...dept }) => ({
    ...dept,
    children: children?.length ? normalizeDeptTree(children) : undefined
  }));
}

const treeSelectOptions = computed(() => normalizeDeptTree(options.value));

async function getDeptList() {
  startLoading();
  try {
    const { error, data } = await fetchGetDeptTree({ options: [{ key: 1 }] });
    if (error) return;

    const deptTree = data?.trees ?? [];
    options.value = deptTree;

    if (deptTree.length && !expandedKeys.value.length) {
      expandedKeys.value = [deptTree[0].dept_id];
    }
  } finally {
    endLoading();
  }
}

onMounted(getDeptList);
</script>

<template>
  <NTreeSelect
    v-model:value="value"
    v-model:expanded-keys="expandedKeys"
    filterable
    class="h-full"
    :loading="loading"
    key-field="dept_id"
    label-field="dept_name"
    :options="treeSelectOptions"
    v-bind="$attrs"
  />
</template>

<style scoped></style>
