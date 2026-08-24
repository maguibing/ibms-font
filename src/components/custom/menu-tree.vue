<script setup lang="tsx">
import { computed, onMounted, ref, watch } from 'vue';
import type { TreeOption, TreeSelectInst } from 'naive-ui';
import { useBoolean } from '@sa/hooks';
import { menuNodeType } from '@/constants/business';
import { fetchGetMenuNodeTrees } from '@/service/api/system';
import { translateRouteTitle } from '@/utils/common';
import { $t } from '@/locales';
import { defaultMenuIcon } from '@/plugins/iconify-offline-icons';
import SvgIcon from '@/components/custom/svg-icon.vue';

defineOptions({
  name: 'MenuTree',
  inheritAttrs: false
});

interface Props {
  defaultExpandAll?: boolean;
  immediate?: boolean;
  showButtonMenus?: boolean;
  showHeader?: boolean;
  requestParams?: Parameters<typeof fetchGetMenuNodeTrees>[0];
  [key: string]: any;
}

const props = withDefaults(defineProps<Props>(), {
  defaultExpandAll: true,
  immediate: true,
  requestParams: undefined,
  showButtonMenus: true,
  showHeader: true
});

type MenuTreeOption = Omit<Api.System.MenuNode, 'children' | 'id'> & {
  id: CommonType.IdType;
  label: string;
  icon?: string;
  visible?: '1';
  children?: MenuTreeOption[];
};

const { bool: expandAll } = useBoolean(props.defaultExpandAll);
const { bool: checkAll } = useBoolean();
const expandedKeys = ref<CommonType.IdType[]>([]);

const menuTreeRef = ref<TreeSelectInst | null>(null);
const allOptions = ref<MenuTreeOption[]>([]);
const checkedKeys = defineModel<CommonType.IdType[]>('checkedKeys', { required: false, default: [] });
const options = defineModel<MenuTreeOption[]>('options', { required: false, default: [] });
const cascade = defineModel<boolean>('cascade', { required: false, default: true });
const loading = defineModel<boolean>('loading', { required: false, default: false });

const defaultRequestParams = computed<Parameters<typeof fetchGetMenuNodeTrees>[0]>(() => ({
  p_type: 1,
  menu_type_list: [
    menuNodeType.catalog,
    menuNodeType.menu,
    menuNodeType.button,
    menuNodeType.extLink
  ]
}));

function normalizeMenu(menu: Api.System.MenuNode): MenuTreeOption {
  const id = menu.meta.id;
  const title = menu.meta.title;
  const icon = menu.meta.icon || defaultMenuIcon;

  return {
    ...menu,
    id,
    meta: {
      ...menu.meta,
      id,
      title,
      icon
    },
    label: title,
    icon,
    visible: menu.meta.is_visible === false ? '1' : undefined,
    children: menu.children?.map(normalizeMenu)
  };
}

function getVisibleMenuOptions(menu: MenuTreeOption[]): MenuTreeOption[] {
  if (props.showButtonMenus) {
    return menu;
  }

  return menu.reduce<MenuTreeOption[]>((result, item) => {
    if (item.meta.menu_type === menuNodeType.button) {
      return result;
    }

    const children = item.children ? getVisibleMenuOptions(item.children) : undefined;

    result.push({
      ...item,
      children: children?.length ? children : undefined
    });

    return result;
  }, []);
}

async function getMenuList() {
  loading.value = true;
  try {
    const { error, data } = await fetchGetMenuNodeTrees(props.requestParams ?? defaultRequestParams.value);
    if (error) {
      return;
    }

    allOptions.value = (data?.trees || []).map(normalizeMenu);
    options.value = getVisibleMenuOptions(allOptions.value);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (props.immediate) {
    getMenuList();
  }
});

watch([expandAll, options], ([newVal]) => {
  if (newVal) {
    // 展开所有节点
    expandedKeys.value = getAllMenuIds(options.value);
  } else {
    expandedKeys.value = [];
  }
});

function renderLabel({ option }: { option: TreeOption }) {
  const label = translateRouteTitle(String(option.label || ''));
  // 禁用的菜单显示红色
  if (option.status === '1') {
    return (
      <div class="flex items-center gap-4px text-error-200">
        {label}
        <SvgIcon icon="ri:prohibited-line" class="text-16px" />
      </div>
    );
  }
  // 隐藏的菜单显示灰色
  if (option.visible === '1') {
    return (
      <div class="flex items-center gap-4px text-gray-400">
        {label}
        <SvgIcon icon="codex:hidden" class="text-21px" />
      </div>
    );
  }
  return <div>{label}</div>;
}

function renderPrefix({ option }: { option: TreeOption }) {
  const renderLocalIcon = String(option.icon).startsWith('local-icon-');
  let icon = renderLocalIcon ? undefined : String(option.icon ?? defaultMenuIcon);
  const localIcon = renderLocalIcon ? String(option.icon).replace('local-icon-', 'menu-') : undefined;
  if (icon === '#') {
    icon = defaultMenuIcon;
  }
  return <SvgIcon icon={icon} localIcon={localIcon} />;
}

function getAllMenuIds(menu: MenuTreeOption[]) {
  const menuIds: CommonType.IdType[] = [];
  menu.forEach(item => {
    menuIds.push(item.id!);
    if (item.children) {
      menuIds.push(...getAllMenuIds(item.children));
    }
  });
  return menuIds;
}

/** 获取所有叶子节点的 ID（没有子节点的节点） */
function getLeafMenuIds(menu: MenuTreeOption[]): CommonType.IdType[] {
  const leafIds: CommonType.IdType[] = [];
  menu.forEach(item => {
    if (!item.children || item.children.length === 0) {
      // 是叶子节点
      leafIds.push(item.id!);
    } else {
      // 有子节点，递归获取子节点中的叶子节点
      leafIds.push(...getLeafMenuIds(item.children));
    }
  });
  return leafIds;
}

function handleCheckedTreeNodeAll(checked: boolean) {
  if (checked) {
    checkedKeys.value = getAllMenuIds(options.value);
    return;
  }
  checkedKeys.value = [];
}

function getHiddenButtonMenuIds(menu: MenuTreeOption[], checkedIdSet: Set<string>) {
  const menuIds: CommonType.IdType[] = [];

  function walk(node: MenuTreeOption, parentChecked: boolean) {
    const isButton = node.meta.menu_type === menuNodeType.button;
    const checked = checkedIdSet.has(String(node.id));

    if (isButton) {
      if (parentChecked) {
        menuIds.push(node.id);
      }
      return;
    }

    node.children?.forEach(child => walk(child, parentChecked || checked));
  }

  menu.forEach(item => walk(item, false));

  return menuIds;
}

function getCheckedMenuIds(isCascade: boolean = false) {
  const menuIds = [...((menuTreeRef.value?.getCheckedData()?.keys ?? []) as CommonType.IdType[])];
  const indeterminateData = menuTreeRef.value?.getIndeterminateData();
  if (cascade.value || isCascade) {
    const parentIds = (indeterminateData?.keys ?? []) as CommonType.IdType[];
    parentIds.forEach(id => {
      if (!menuIds.some(item => String(item) === String(id))) {
        menuIds.push(id);
      }
    });
  }

  if (!props.showButtonMenus) {
    const checkedIdSet = new Set(menuIds.map(String));
    menuIds.push(...getHiddenButtonMenuIds(allOptions.value, checkedIdSet));
  }

  return Array.from(new Map(menuIds.map(id => [String(id), id])).values());
}

watch(cascade, () => {
  if (cascade.value) {
    // 获取当前菜单树中的所有叶子节点ID
    const allLeafIds = getLeafMenuIds(options.value);
    // 筛选出当前选中项中的叶子节点
    const selectedLeafIds = checkedKeys.value.filter(id => allLeafIds.includes(id));
    // 重新设置选中状态为只包含叶子节点，让组件基于父子联动规则重新计算父节点状态
    checkedKeys.value = selectedLeafIds;
    return;
  }
  // 禁用父子联动时，将半选中的父节点也加入到选中列表
  checkedKeys.value = getCheckedMenuIds(true);
});

defineExpose({
  getCheckedMenuIds,
  refresh: getMenuList
});
</script>

<template>
  <div class="w-full flex-col gap-12px">
    <div v-if="showHeader" class="w-full flex-center">
      <NCheckbox v-model:checked="expandAll" :checked-value="true" :unchecked-value="false">
        {{ $t('page.system.menu.expandCollapse') }}
      </NCheckbox>
      <NCheckbox
        v-model:checked="checkAll"
        :checked-value="true"
        :unchecked-value="false"
        @update:checked="handleCheckedTreeNodeAll"
      >
        {{ $t('page.system.menu.selectDeselectAll') }}
      </NCheckbox>
      <NCheckbox v-model:checked="cascade" :checked-value="true" :unchecked-value="false">
        {{ $t('page.system.menu.parentChildCascade') }}
      </NCheckbox>
    </div>
    <NSpin class="resource h-full w-full py-6px pl-3px" content-class="h-full" :show="loading">
      <NTree
        ref="menuTreeRef"
        v-model:checked-keys="checkedKeys"
        v-model:expanded-keys="expandedKeys"
        multiple
        checkable
        :selectable="false"
        key-field="id"
        label-field="label"
        :data="options"
        :cascade="cascade"
        :loading="loading"
        virtual-scroll
        check-strategy="all"
        :render-label="renderLabel"
        :render-prefix="renderPrefix"
        v-bind="$attrs"
      />
    </NSpin>
  </div>
</template>

<style scoped lang="scss">
.resource {
  border-radius: 6px;
  border: 1px solid rgb(224, 224, 230);

  .n-tree {
    min-height: 200px;
    max-height: 750px;
    width: 100%;
    height: 100%;

    :deep(.n-tree__empty) {
      min-height: 200px;
      justify-content: center;
    }
  }

  .n-empty {
    justify-content: center;
  }
}
</style>
