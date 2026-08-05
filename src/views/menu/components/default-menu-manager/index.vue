<script setup lang="tsx">
import { computed, ref } from 'vue';
import type { DataTableColumns, TreeOption } from 'naive-ui';
import { NButton, NDivider, NIcon, NTag } from 'naive-ui';
import { useBoolean, useLoading } from '@sa/hooks';
import { menuNodeType, menuNodeTypeRecord, menuPlatformType } from '@/constants/business';
import { fetchDeleteMenuNode, fetchGetMenuNodeTrees } from '@/service/api/system/menu';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import ButtonIcon from '@/components/custom/button-icon.vue';
import MenuOperateDrawer from './modules/menu-operate-drawer.vue';

interface Props {
  title: string;
  pType: CommonType.IdType;
}

const props = defineProps<Props>();

type MenuNodeItem = Omit<Api.System.MenuNode, 'children' | 'id'> & {
  id: CommonType.IdType;
  label: string;
  icon: string;
  menu_type: Api.System.MenuNodeType;
  is_visible: boolean;
  keep_alive: boolean;
  children?: MenuNodeItem[];
  rawChildren?: MenuNodeItem[];
};

const defaultIcon = import.meta.env.VITE_MENU_ICON;
const { hasAuth } = useAuth();
const appStore = useAppStore();
const menuPermissionMap = {
  [menuPlatformType.operation]: {
    add: 'menu:platform-menu:add',
    edit: 'menu:platform-menu:edit',
    delete: 'menu:platform-menu:delete'
  },
  [menuPlatformType.integrator]: {
    add: 'menu:corp-menu:add',
    edit: 'menu:corp-menu:edit',
    delete: 'menu:corp-menu:delete'
  },
  [menuPlatformType.project]: {
    add: 'menu:project-menu:add',
    edit: 'menu:project-menu:edit',
    delete: 'menu:project-menu:delete'
  }
} as const;
const menuPermissions = computed(() => menuPermissionMap[Number(props.pType) as keyof typeof menuPermissionMap]);
const canAdd = computed(() => hasAuth(menuPermissions.value.add));
const canEdit = computed(() => hasAuth(menuPermissions.value.edit));
const canDelete = computed(() => hasAuth(menuPermissions.value.delete));
const editingId = ref<CommonType.IdType>();
const operateType = ref<NaiveUI.TableOperateType>('add');
const { loading, startLoading, endLoading } = useLoading();
const { bool: drawerVisible, setTrue: openDrawer } = useBoolean();
const { loading: btnLoading, startLoading: startBtnLoading, endLoading: endBtnLoading } = useLoading();
const name = ref<string>();
const createType = ref<Api.System.MenuNodeType>();
const createPid = ref<CommonType.IdType>(0);
const currentMenu = ref<MenuNodeItem>();
const treeData = ref<MenuNodeItem[]>([]);
const selectedKeys = ref<CommonType.IdType[]>([]);
const expandedKeys = ref<CommonType.IdType[]>([0]);
const btnData = ref<MenuNodeItem[]>([]);

const isCatalog = computed(() => currentMenu.value?.menu_type === menuNodeType.catalog);
const isMenu = computed(() => currentMenu.value?.menu_type === menuNodeType.menu);

function normalizeBooleanField(value?: boolean | number | string): boolean {
  return value === true || value === 1 || value === '1';
}

function normalizeMenu(menu: Api.System.MenuNode, parentId: CommonType.IdType = 0): MenuNodeItem {
  const id = menu.meta.id;
  const children = (menu.children || []).map(item => normalizeMenu(item, id));
  const { children: _children, ...menuWithoutChildren } = menu;
  const menuType = menu.meta.menu_type as Api.System.MenuNodeType;
  const isVisible = normalizeBooleanField(menu.meta?.is_visible);
  const keepAlive = normalizeBooleanField(menu.meta?.keep_alive);
  const title = menu?.meta?.title ?? '';
  const icon = menu.meta?.icon || defaultIcon;
  const visibleChildren = children.filter(item => item.menu_type !== menuNodeType.button);

  return {
    ...menuWithoutChildren,
    id,
    parent_id: menu.parent_id ?? parentId,
    meta: {
      ...menu.meta,
      id,
      title,
      icon,
      is_visible: isVisible,
      keep_alive: keepAlive,
      menu_type: menuType
    },
    label: title,
    icon,
    menu_type: menuType,
    is_visible: isVisible,
    keep_alive: keepAlive,
    rawChildren: children,
    ...(visibleChildren.length ? { children: visibleChildren } : {})
  };
}

function createRootNode(children: MenuNodeItem[]): MenuNodeItem {
  const visibleChildren = children.filter(item => item.menu_type !== menuNodeType.button);

  return {
    id: 0,
    parent_id: 0,
    p_type: props.pType,
    path: '',
    component: '',
    name: 'root',
    perm_key: '',
    meta: {
      id: 0,
      title: '根目录',
      icon: 'material-symbols:home-outline-rounded',
      is_visible: true,
      keep_alive: false,
      menu_type: menuNodeType.catalog
    },
    label: '根目录',
    icon: 'material-symbols:home-outline-rounded',
    menu_type: menuNodeType.catalog,
    is_visible: true,
    keep_alive: false,
    rawChildren: children,
    ...(visibleChildren.length ? { children: visibleChildren } : {})
  };
}

function findMenuById(list: MenuNodeItem[], id: CommonType.IdType): MenuNodeItem | undefined {
  for (const item of list) {
    if (item.id === id) {
      return item;
    }
    const child = findMenuById(item.rawChildren || [], id);
    if (child) {
      return child;
    }
  }
  return undefined;
}

async function getMenuTree(selectId?: CommonType.IdType) {
  startLoading();
  const { data, error } = await fetchGetMenuNodeTrees({
    p_type: props.pType,
    menu_type_list: [
      menuNodeType.catalog,
      menuNodeType.menu,
      menuNodeType.button,
      menuNodeType.extLink
    ]
  });
  endLoading();
  if (error) return;

  const menus = (data?.trees || []).map(normalizeMenu);
  const root = createRootNode(menus);
  treeData.value = [root];
  if (selectId) {
    const selectedMenu = findMenuById(treeData.value, selectId);
    if (selectedMenu && selectedMenu.id !== 0) {
      currentMenu.value = selectedMenu;
      selectedKeys.value = [selectedMenu.id];
      getBtnMenuList();
      return;
    }
  }

  if (!currentMenu.value) {
    selectedKeys.value = [];
    btnData.value = [];
  }
}

getMenuTree();

async function handleSubmitted(menuType?: Api.System.MenuNodeType) {
  const selectedId = currentMenu.value?.id;
  await getMenuTree(selectedId);
  if (menuType === menuNodeType.button) {
    getBtnMenuList();
  }
}

function handleAddMenu(pid: CommonType.IdType) {
  createPid.value = pid;
  createType.value = pid === 0 ? menuNodeType.catalog : menuNodeType.menu;
  editingId.value = undefined;
  operateType.value = 'add';
  openDrawer();
}

function handleUpdateMenu() {
  operateType.value = 'edit';
  createType.value = currentMenu.value?.menu_type as Api.System.MenuNodeType;
  editingId.value = currentMenu.value?.id;
  openDrawer();
}

async function handleDeleteMenu(id?: CommonType.IdType) {
  const menuId = id || selectedKeys.value[0];
  if (!menuId) {
    return;
  }

  const { error } = await fetchDeleteMenuNode({ id_list: [menuId] });
  if (error) return;
  window.$message?.success($t('common.deleteSuccess'));

  if (id) {
    await getMenuTree(currentMenu.value?.id);
    getBtnMenuList();
    return;
  }

  currentMenu.value = undefined;
  selectedKeys.value = [];
  await getMenuTree();
}

function getMenuLabel(option: TreeOption) {
  const meta = option.meta as Api.System.MenuNodeMeta | undefined;
  const raw = String(option.label || meta?.title || option.name || '');
  if (raw.startsWith('route.') || raw.startsWith('menu.')) {
    return $t(raw as App.I18n.I18nKey);
  }
  return raw;
}

function customFilterTree(pattern: string, node: TreeOption) {
  if (!pattern) return true;

  const label = getMenuLabel(node);
  return label.toLowerCase().includes(pattern.toLowerCase());
}

function renderLabel({ option }: { option: TreeOption }) {
  const label = getMenuLabel(option);
  if (option.id !== 0 && !(option.is_visible ?? false)) {
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
  const rawIcon = String(option.icon || defaultIcon);
  const renderLocalIcon = rawIcon.startsWith('local-icon-');
  const icon = renderLocalIcon ? undefined : rawIcon;
  const localIcon = renderLocalIcon ? rawIcon.replace('local-icon-', 'menu-') : undefined;
  return <SvgIcon icon={icon || defaultIcon} localIcon={localIcon} />;
}

function renderSuffix({ option }: { option: TreeOption }) {
  if (Number(option.menu_type ?? 0) !== menuNodeType.catalog || !canAdd.value) {
    return null;
  }

  return (
    <div class="flex-center gap-8px">
      <ButtonIcon
        text
        class="h-18px"
        icon="ic-round-plus"
        tooltip-content="新增子菜单"
        onClick={(event: Event) => {
          event.stopPropagation();
          handleAddMenu(option.id as CommonType.IdType);
        }}
      />
    </div>
  );
}

function reset() {
  name.value = undefined;
  currentMenu.value = undefined;
  selectedKeys.value = [];
  getMenuTree();
}

function handleClickTree(option: Array<TreeOption | null>) {
  const menu = option[0] as MenuNodeItem | undefined;
  if (!menu || menu.id === 0) {
    currentMenu.value = undefined;
    btnData.value = [];
    return;
  }
  currentMenu.value = menu;
  getBtnMenuList();
}

function getBtnMenuList() {
  startBtnLoading();
  btnData.value = (currentMenu.value?.rawChildren || []).filter(item => item.menu_type === menuNodeType.button);
  endBtnLoading();
}

function addBtnMenu() {
  operateType.value = 'add';
  createType.value = menuNodeType.button;
  createPid.value = currentMenu.value?.id || 0;
  editingId.value = undefined;
  openDrawer();
}

function handleUpdateBtnMenu(row: MenuNodeItem) {
  operateType.value = 'edit';
  createType.value = menuNodeType.button;
  editingId.value = row.id;
  openDrawer();
}

function renderMenuName(menuName: string) {
  return menuName?.startsWith('route.') || menuName?.startsWith('menu.') ? $t(menuName as App.I18n.I18nKey) : menuName;
}

const btnColumns: DataTableColumns<MenuNodeItem> = [
  {
    key: 'index',
    width: 64,
    align: 'center',
    title() {
      if (!canAdd.value) {
        return null;
      }

      return (
        <NButton circle type="primary" size="small" onClick={() => addBtnMenu()}>
          {{
            icon: () => (
              <NIcon>
                <SvgIcon icon="ic-round-plus" />
              </NIcon>
            )
          }}
        </NButton>
      );
    },
    render(_, index) {
      return index + 1;
    }
  },
  {
    title: '按钮名称',
    key: 'label',
    minWidth: 120,
    render(row) {
      return renderMenuName(row.label);
    }
  },
  {
    title: '权限标识',
    key: 'perm_key',
    align: 'center',
    minWidth: 120
  },
  {
    title: '显示',
    key: 'is_visible',
    align: 'center',
    minWidth: 150,
    render(row) {
      return <NTag type={row.is_visible ? 'success' : 'warning'}>{row.is_visible ? '显示' : '隐藏'}</NTag>;
    }
  },
  {
    title: $t('common.action'),
    key: 'actions',
    width: 80,
    align: 'center',
    render(row) {
      const editBtn = () => {
        return (
          <ButtonIcon
            text
            type="primary"
            icon="material-symbols:drive-file-rename-outline-outline"
            tooltipContent={$t('common.edit')}
            onClick={() => handleUpdateBtnMenu(row)}
          />
        );
      };

      const deleteBtn = () => {
        return (
          <ButtonIcon
            text
            type="error"
            icon="material-symbols:delete-outline"
            tooltipContent={$t('common.delete')}
            popconfirmContent={$t('common.confirmDelete')}
            onPositiveClick={() => handleDeleteMenu(row.id)}
          />
        );
      };

      const buttons = [];
      if (canEdit.value) buttons.push(editBtn());
      if (canDelete.value) buttons.push(deleteBtn());

      return (
        <div class="flex-center gap-8px">
          {buttons.map((btn, index) => (
            <>
              {index !== 0 && <NDivider vertical />}
              {btn}
            </>
          ))}
        </div>
      );
    }
  }
];
</script>

<template>
  <TableSiderLayout default-expanded>
    <template #header>{{ title }}</template>
    <template #header-extra>
      <ButtonIcon
        v-if="canAdd"
        size="small"
        icon="material-symbols:add-rounded"
        class="h-28px text-icon color-primary"
        tooltip-content="新增菜单"
        @click.stop="handleAddMenu(0)"
      />
      <ButtonIcon
        size="small"
        icon="material-symbols:refresh-rounded"
        class="h-28px text-icon"
        :tooltip-content="$t('common.refresh')"
        @click.stop="reset"
      />
    </template>
    <template #sider>
      <div class="flex gap-6px">
        <NInput v-model:value="name" size="small" placeholder="请输入菜单名称" />
      </div>
      <NSpin :show="loading" class="infinite-scroll">
        <NTree
          v-model:selected-keys="selectedKeys"
          v-model:expanded-keys="expandedKeys"
          :cancelable="false"
          block-node
          :filter="customFilterTree"
          show-line
          :data="treeData as []"
          :default-expanded-keys="[0]"
          :show-irrelevant-nodes="false"
          :pattern="name"
          class="menu-tree h-full min-h-200px py-3"
          key-field="id"
          label-field="label"
          virtual-scroll
          :render-label="renderLabel"
          :render-prefix="renderPrefix"
          :render-suffix="renderSuffix"
          @update:selected-keys="(_: Array<string | number>, option: Array<TreeOption | null>) => handleClickTree(option)"
        >
          <template #empty>
            <NEmpty description="暂无菜单" class="h-full min-h-200px justify-center" />
          </template>
        </NTree>
      </NSpin>
    </template>
    <div class="h-full flex-col-stretch gap-16px">
      <template v-if="currentMenu">
        <NCard
          title="菜单详情"
          :bordered="false"
          size="small"
          class="max-h-50% card-wrapper"
          content-class="overflow-auto mb-12px"
        >
          <template #header-extra>
            <NSpace>
              <NButton
                v-if="isCatalog && canAdd"
                size="small"
                ghost
                type="primary"
                @click="handleAddMenu(currentMenu.id)"
              >
                <template #icon>
                  <icon-material-symbols-add-rounded />
                </template>
                新增子菜单
              </NButton>
              <NButton v-if="canEdit" size="small" ghost type="primary" @click="handleUpdateMenu">
                <template #icon>
                  <icon-material-symbols-drive-file-rename-outline-outline />
                </template>
                {{ $t('common.edit') }}
              </NButton>
              <NPopconfirm @positive-click="() => handleDeleteMenu()">
                <template #trigger>
                  <NButton
                    v-if="canDelete"
                    size="small"
                    ghost
                    type="error"
                    :disabled="btnData.length > 0 || btnLoading"
                  >
                    <template #icon>
                      <icon-material-symbols-delete-outline />
                    </template>
                    {{ $t('common.delete') }}
                  </NButton>
                </template>
                {{ $t('common.confirmDelete') }}
              </NPopconfirm>
            </NSpace>
          </template>
          <NDescriptions
            label-placement="left"
            size="small"
            bordered
            :column="appStore.isMobile ? 1 : 2"
            label-class="w-20% min-w-88px"
            content-class="w-100px"
          >
            <NDescriptionsItem label="菜单类型">
              <NTag class="m-1" size="small" type="primary">
                {{ menuNodeTypeRecord[currentMenu.menu_type] || '未知' }}
              </NTag>
            </NDescriptionsItem>
            <NDescriptionsItem label="菜单状态">
              <NTag class="m-1" size="small" type="success">正常</NTag>
            </NDescriptionsItem>
            <NDescriptionsItem label="菜单名称">
              {{ renderMenuName(currentMenu.label) }}
            </NDescriptionsItem>
            <NDescriptionsItem v-if="isMenu" label="组件路径">
              {{ currentMenu.component }}
            </NDescriptionsItem>
            <NDescriptionsItem label="路由地址">
              {{ currentMenu.path }}
            </NDescriptionsItem>
            <NDescriptionsItem v-if="isMenu" label="路由参数"></NDescriptionsItem>
            <NDescriptionsItem v-if="!isCatalog" label="权限标识">
              {{ currentMenu.perm_key }}
            </NDescriptionsItem>
            <NDescriptionsItem label="是否外链">
              <NTag class="m-1" size="small" type="warning">否</NTag>
            </NDescriptionsItem>
            <NDescriptionsItem label="显示状态">
              <NTag class="m-1" size="small" :type="currentMenu.is_visible ? 'success' : 'warning'">
                {{ currentMenu.is_visible ? '显示' : '隐藏' }}
              </NTag>
            </NDescriptionsItem>
            <NDescriptionsItem v-if="isMenu" label="是否缓存">
              <NTag class="m-1" size="small" :type="currentMenu.keep_alive ? 'success' : 'warning'">
                {{ currentMenu.keep_alive ? '缓存' : '不缓存' }}
              </NTag>
            </NDescriptionsItem>
          </NDescriptions>
        </NCard>

        <NCard
          v-if="isMenu"
          title="按钮权限列表"
          :bordered="false"
          size="small"
          class="h-full overflow-auto card-wrapper"
          content-class="overflow-auto mb-12px"
        >
          <template #header-extra>
            <ButtonIcon
              size="small"
              icon="ic-round-refresh"
              class="h-28px text-icon"
              :tooltip-content="$t('common.refresh')"
              @click.stop="getBtnMenuList"
            />
          </template>

          <NDataTable class="h-full" :loading="btnLoading" :columns="btnColumns" :data="btnData" />
        </NCard>
      </template>
      <NCard v-else :bordered="false" size="small" class="h-full card-wrapper">
        <NEmpty class="h-full flex-center" size="large" />
      </NCard>
    </div>
    <MenuOperateDrawer
      v-model:visible="drawerVisible"
      :p-type="pType"
      :operate-type="operateType"
      :menu-id="editingId"
      :tree-data="treeData"
      :pid="createPid"
      :menu-type="createType"
      @submitted="handleSubmitted"
    />
  </TableSiderLayout>
</template>

<style scoped lang="scss">
:deep(.infinite-scroll) {
  height: calc(100vh - 224px - var(--calc-footer-height, 0px)) !important;
  max-height: calc(100vh - 224px - var(--calc-footer-height, 0px)) !important;
}

@media screen and (max-width: 1024px) {
  :deep(.infinite-scroll) {
    height: calc(100vh - 227px - var(--calc-footer-height, 0px)) !important;
    max-height: calc(100vh - 227px - var(--calc-footer-height, 0px)) !important;
  }
}

:deep(.n-spin-content) {
  height: 100%;
}

:deep(.n-data-table-base-table) {
  height: 100% !important;
}

.menu-tree {
  :deep(.n-tree-node) {
    height: 25px;
  }

  :deep(.n-tree-node-switcher) {
    height: 25px;
  }

  :deep(.n-tree-node-switcher__icon) {
    font-size: 16px !important;
    height: 16px !important;
    width: 16px !important;
  }
}
</style>
