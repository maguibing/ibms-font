<script setup lang="ts">
import { onMounted, ref, useAttrs, watch } from 'vue';
import type { TreeInst, TreeProps } from 'naive-ui';
import { fetchGetMenuTree } from '@/service/api/system';

defineOptions({
  name: 'MenuTree',
  inheritAttrs: false
});

interface Props {
  immediate?: boolean;
  showHeader?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  immediate: true,
  showHeader: true
});

const attrs = useAttrs() as TreeProps;

const menuTreeRef = ref<TreeInst | null>(null);
const expandedKeys = ref<CommonType.IdType[]>([]);
const expandAll = ref(false);
const checkAll = ref(false);

const checkedKeys = defineModel<CommonType.IdType[]>('checkedKeys', { required: false, default: [] });

const options = defineModel<Api.System.MenuTreeOptionList>('options', { required: false, default: [] });
const cascade = defineModel<boolean>('cascade', { required: false, default: true });
const loading = defineModel<boolean>('loading', { required: false, default: false });

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isMenuTreeOption(node: unknown): node is Api.System.MenuTreeOption {
  return isRecord(node) && 'id' in node && 'label' in node;
}

function getMenuLabel(node: Api.System.MenuTreeNode) {
  return node.meta?.title?.trim() || node.name || node.path || node.perm_key || '未命名菜单';
}

function normalizeMenuTree(nodes: Api.System.MenuTreeNode[] = []): Api.System.MenuTreeOptionList {
  return nodes.map(node => {
    const children = normalizeMenuTree(node.children);

    return {
      id: node.meta?.id ?? node.perm_key ?? node.path ?? getMenuLabel(node),
      label: getMenuLabel(node),
      path: node.path,
      component: node.component,
      name: node.name,
      redirect: node.redirect,
      keepAlive: node.meta?.keep_alive,
      menuType: node.meta?.menu_type,
      permKey: node.perm_key,
      ...(children.length > 0 ? { children } : {})
    };
  });
}

function extractMenuTreeOptions(data: Api.System.MenuTreeResponse | null | undefined): Api.System.MenuTreeOptionList {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return [];
    }

    return isMenuTreeOption(data[0])
      ? (data as Api.System.MenuTreeOptionList)
      : normalizeMenuTree(data as Api.System.MenuTreeNode[]);
  }

  if (!isRecord(data)) {
    return [];
  }

  const record = data as Record<string, unknown>;

  if (Array.isArray(record.trees)) {
    return normalizeMenuTree(record.trees as Api.System.MenuTreeNode[]);
  }

  if (isRecord(record.data) && Array.isArray(record.data.trees)) {
    return normalizeMenuTree(record.data.trees as Api.System.MenuTreeNode[]);
  }

  return [];
}

function getAllMenuIds(nodes: Api.System.MenuTreeOptionList = options.value): CommonType.IdType[] {
  return nodes.flatMap(node => [node.id, ...getAllMenuIds(node.children ?? [])]);
}

function syncExpandedKeys() {
  expandedKeys.value = expandAll.value ? getAllMenuIds() : [];
}

async function getMenuList() {
  loading.value = true;

  const { data, error } = await fetchGetMenuTree({
    p_type: 1,
    menu_type_list: [1, 2, 3, 4]
  });

  if (error) {
    options.value = [];
    loading.value = false;
    return;
  }

  options.value = extractMenuTreeOptions(data);
  syncExpandedKeys();
  loading.value = false;
}

function handleCheckedTreeNodeAll(checked: boolean) {
  checkedKeys.value = checked ? getAllMenuIds() : [];
}

function getCheckedMenuIds(includeIndeterminate: boolean = cascade.value) {
  const checkedData = menuTreeRef.value?.getCheckedData();
  const menuIds = new Set<CommonType.IdType>(
    (checkedData?.keys as CommonType.IdType[] | undefined) ?? checkedKeys.value
  );

  if (includeIndeterminate) {
    const indeterminateKeys =
      (menuTreeRef.value?.getIndeterminateData()?.keys as CommonType.IdType[] | undefined) ?? [];

    indeterminateKeys.forEach(key => {
      menuIds.add(key);
    });
  }

  return [...menuIds];
}

watch([expandAll, options], () => {
  syncExpandedKeys();

  if (checkAll.value) {
    checkedKeys.value = getAllMenuIds();
  }
});

watch([checkedKeys, options], () => {
  const allMenuIds = getAllMenuIds();
  checkAll.value = allMenuIds.length > 0 && allMenuIds.every(id => checkedKeys.value.includes(id));
});

onMounted(() => {
  if (props.immediate) {
    void getMenuList();
  }
});

defineExpose({
  getCheckedMenuIds,
  refresh: getMenuList
});
</script>

<template>
  <div class="menu-tree">
    <div v-if="showHeader" class="menu-tree__toolbar">
      <NCheckbox v-model:checked="expandAll" :checked-value="true" :unchecked-value="false">展开/折叠</NCheckbox>
      <NCheckbox
        v-model:checked="checkAll"
        :checked-value="true"
        :unchecked-value="false"
        @update:checked="handleCheckedTreeNodeAll"
      >
        全选/反选
      </NCheckbox>
      <NCheckbox v-model:checked="cascade" :checked-value="true" :unchecked-value="false">父子联动</NCheckbox>
    </div>

    <NSpin :show="loading" class="menu-tree__content" content-class="h-full">
      <NTree
        ref="menuTreeRef"
        v-bind="attrs"
        v-model:checked-keys="checkedKeys"
        v-model:expanded-keys="expandedKeys"
        :data="options"
        :cascade="cascade"
        :loading="loading"
        key-field="id"
        label-field="label"
        check-strategy="all"
        multiple
        checkable
        block-node
        virtual-scroll
        :selectable="false"
      />
    </NSpin>
  </div>
</template>

<style scoped lang="scss">
.menu-tree {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.menu-tree__toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.menu-tree__content {
  min-height: 200px;
  border: 1px solid rgb(224, 224, 230);
  border-radius: 6px;

  :deep(.n-spin-content) {
    height: 100%;
  }

  :deep(.n-tree) {
    min-height: 200px;
    width: 100%;
    padding: 6px 3px;
  }

  :deep(.n-tree__empty) {
    min-height: 200px;
    justify-content: center;
  }
}
</style>
