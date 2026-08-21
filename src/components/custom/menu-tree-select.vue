<script setup lang="tsx">
import { computed, onMounted } from 'vue';
import type { TreeOption } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { menuNodeType } from '@/constants/business';
import { fetchGetMenuNodeTrees } from '@/service/api/system';
import { defaultMenuIcon } from '@/plugins/iconify-offline-icons';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { $t } from '@/locales';

defineOptions({
  name: 'MenuTreeSelect',
  inheritAttrs: false
});

interface Props {
  immediate?: boolean;
  requestParams?: Parameters<typeof fetchGetMenuNodeTrees>[0];
  [key: string]: any;
}

const props = withDefaults(defineProps<Props>(), {
  immediate: true,
  requestParams: undefined
});

type MenuTreeSelectOption = Omit<Api.System.MenuNode, 'children' | 'id'> & {
  id: CommonType.IdType;
  label: string;
  icon?: string;
  visible?: '1';
  children?: MenuTreeSelectOption[];
};

const value = defineModel<CommonType.IdType | null>('value', { required: false });
const options = defineModel<MenuTreeSelectOption[]>('options', { required: false, default: [] });

const { loading, startLoading, endLoading } = useLoading();

const defaultRequestParams = computed<Parameters<typeof fetchGetMenuNodeTrees>[0]>(() => ({
  p_type: 1,
  menu_type_list: [menuNodeType.catalog, menuNodeType.menu, menuNodeType.extLink]
}));

function normalizeMenu(menu: Api.System.MenuNode): MenuTreeSelectOption {
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

function createRootNode(children: MenuTreeSelectOption[]): MenuTreeSelectOption {
  return {
    id: 0,
    label: '根目录',
    icon: 'lucide:house',
    meta: {
      id: 0,
      title: '根目录',
      icon: 'lucide:house',
      is_visible: true,
      menu_type: menuNodeType.catalog
    },
    children
  };
}

async function getMenuList() {
  startLoading();
  try {
    const { error, data } = await fetchGetMenuNodeTrees(props.requestParams ?? defaultRequestParams.value);
    if (error) {
      return;
    }

    options.value = [createRootNode((data?.trees || []).map(normalizeMenu))];
  } finally {
    endLoading();
  }
}

onMounted(() => {
  if (props.immediate) {
    getMenuList();
  }
});

function renderLabel({ option }: { option: TreeOption }) {
  let label = option.label;
  if (label?.startsWith('route.') || label?.startsWith('menu.')) {
    label = $t(label as App.I18n.I18nKey);
  }
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

defineExpose({
  refresh: getMenuList
});
</script>

<template>
  <NTreeSelect
    v-model:value="value"
    filterable
    class="h-full"
    :loading="loading"
    key-field="id"
    label-field="label"
    :options="options"
    :default-expanded-keys="[0]"
    :render-tag="renderLabel"
    :render-label="renderLabel"
    :render-prefix="renderPrefix"
    v-bind="$attrs"
  />
</template>

<style scoped></style>
