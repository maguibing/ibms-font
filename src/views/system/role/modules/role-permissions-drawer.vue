<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import MenuTree from '@/components/custom/menu-tree.vue';
import { menuNodeType, menuPlatformType } from '@/constants/business';
import { fetchAssignPermAuth, fetchGetRole } from '@/service/api/system/role';
import { fetchGetConfigurationList } from '@/service/api/visual/configuration';
import { fetchGetCustomScreenList } from '@/service/api/visual/custom-screen';
import { fetchGetProjectSysScreenList } from '@/service/api/visual/screen';
import { $t } from '@/locales';
import { getOssUrl } from '@/utils/common-methods';

defineOptions({
  name: 'RolePermissionsDrawer'
});

interface Props {
  /** the edit row data */
  rowData?: Api.System.Role | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

type PermissionTab = 'menu' | 'visual';
type VisualPermissionType = 'projectSysScreen' | 'configuration' | 'customScreen';
type VisualSubmitParams = Pick<
  Api.System.AssignPermAuthParams,
  'project_sys_screen_conf' | 'configuration_conf' | 'custom_screen_conf'
>;

type VisualPermissionItem = {
  id: CommonType.IdType;
  name: string;
  thumbUrl?: string;
};

/** 可视化权限面板状态，selectedIds 表示授权，controlIds 表示可控制。 */
type VisualPermissionPanel = {
  type: VisualPermissionType;
  label: string;
  searchPlaceholder: string;
  searchKeyword: string | null;
  loading: boolean;
  items: VisualPermissionItem[];
  selectedIds: CommonType.IdType[];
  controlIds: CommonType.IdType[];
};

const menuTreeRef = ref<InstanceType<typeof MenuTree> | null>(null);
const currentRole = ref<Api.System.Role | null>(null);
const checkedKeys = ref<CommonType.IdType[]>([]);
const menuLoading = ref(false);
const cascade = ref(false);
const activePermissionTab = ref<PermissionTab>('menu');
const activeVisualTab = ref<VisualPermissionType>('projectSysScreen');
const submitLoading = ref(false);
const menuTreeRequestParams = {
  menu_type_list: [menuNodeType.catalog, menuNodeType.menu, menuNodeType.button, menuNodeType.extLink],
  p_type: menuPlatformType.operation
};

/** 三类可视化资源共用同一套授权与控制交互。 */
const visualPanels = reactive<VisualPermissionPanel[]>([
  {
    type: 'projectSysScreen',
    label: '系统大屏',
    searchPlaceholder: '搜索大屏名称',
    searchKeyword: null,
    loading: false,
    items: [],
    selectedIds: [],
    controlIds: []
  },
  {
    type: 'configuration',
    label: '组态大屏',
    searchPlaceholder: '搜索组态名称',
    searchKeyword: null,
    loading: false,
    items: [],
    selectedIds: [],
    controlIds: []
  },
  {
    type: 'customScreen',
    label: '自定义大屏',
    searchPlaceholder: '搜索大屏名称',
    searchKeyword: null,
    loading: false,
    items: [],
    selectedIds: [],
    controlIds: []
  }
]);

const title = computed(() => {
  const roleName = props.rowData?.name?.trim();

  if (roleName) {
    return `${roleName} 权限配置`;
  }

  return '权限配置';
});

const canOperateVisualPermissions = computed(() => props.rowData?.p_type === menuPlatformType.project);

/**
 * 获取菜单树默认勾选项。
 *
 * @param role 角色详情
 * @returns 需要勾选的菜单 id 列表
 */
function getDefaultCheckedKeys(role?: Api.System.Role | null) {
  const menuAuth = role?.perm_auth?.menu_auth;

  if (!menuAuth || menuAuth.has_all) {
    return [];
  }

  return [...menuAuth.menu_id_list];
}

/**
 * 获取指定类型的可视化权限面板。
 *
 * @param type 可视化资源类型
 * @returns 对应面板状态
 */
function getVisualPanel(type: VisualPermissionType) {
  return visualPanels.find(item => item.type === type)!;
}

/**
 * 获取搜索关键字。
 *
 * @param panel 可视化权限面板
 * @returns 去除首尾空格后的关键字
 */
function getSearchText(panel: VisualPermissionPanel) {
  return panel.searchKeyword?.trim() || '';
}

/**
 * 按字符串值去重，兼容数字和字符串 id 混用。
 *
 * @param ids id 列表
 * @returns 去重后的 id 列表
 */
function uniqueIds(ids: CommonType.IdType[]) {
  return Array.from(new Map(ids.map(id => [String(id), id])).values());
}

/**
 * 判断 id 是否存在。
 *
 * @param ids id 列表
 * @param id 待判断 id
 * @returns 是否存在
 */
function hasId(ids: CommonType.IdType[], id: CommonType.IdType) {
  return ids.some(item => String(item) === String(id));
}

/**
 * 合并 id 列表并去重。
 *
 * @param sourceIds 原 id 列表
 * @param ids 新增 id 列表
 * @returns 合并后的 id 列表
 */
function addIds(sourceIds: CommonType.IdType[], ids: CommonType.IdType[]) {
  return uniqueIds([...sourceIds, ...ids]);
}

/**
 * 移除指定 id。
 *
 * @param sourceIds 原 id 列表
 * @param ids 需要移除的 id 列表
 * @returns 移除后的 id 列表
 */
function removeIds(sourceIds: CommonType.IdType[], ids: CommonType.IdType[]) {
  const removeIdSet = new Set(ids.map(String));

  return sourceIds.filter(id => !removeIdSet.has(String(id)));
}

/**
 * 构造名称搜索条件。
 *
 * @param keyword 名称关键字
 * @returns 后端列表查询 options
 */
function buildNameSearchOptions(keyword: string) {
  const options: CommonType.CommonTypeOptions[] = [];

  if (keyword) {
    options.push({ type: 1, value: keyword });
  }

  return options;
}

/**
 * 构造系统大屏查询参数。
 *
 * @param panel 当前面板状态
 * @returns 系统大屏列表查询参数
 */
function buildProjectSysScreenRequest(panel: VisualPermissionPanel): CommonType.CommonListQueryParams {
  return {
    list_option: {
      limit: 100,
      offset: 0,
      options: buildNameSearchOptions(getSearchText(panel))
    },
    options: [{ key: 1 }]
  };
}

/**
 * 构造组态大屏查询参数。
 *
 * @param panel 当前面板状态
 * @returns 组态大屏列表查询参数
 */
function buildConfigurationRequest(panel: VisualPermissionPanel): CommonType.CommonListQueryParams {
  return {
    list_option: {
      limit: 100,
      offset: 0,
      options: [{ type: 104, value: '101' }, { type: 5, value: '2' }, ...buildNameSearchOptions(getSearchText(panel))]
    },
    options: [{ key: 1 }, { key: 2 }]
  };
}

/**
 * 构造自定义大屏查询参数。
 *
 * @param panel 当前面板状态
 * @returns 自定义大屏列表查询参数
 */
function buildCustomScreenRequest(panel: VisualPermissionPanel): CommonType.CommonListQueryParams {
  return {
    list_option: {
      limit: 100,
      offset: 0,
      options: buildNameSearchOptions(getSearchText(panel))
    },
    options: [{ key: 1 }]
  };
}

/**
 * 加载系统大屏资源。
 *
 * @param panel 当前面板状态
 */
async function loadProjectSysScreenPanel(panel: VisualPermissionPanel) {
  const { data, error } = await fetchGetProjectSysScreenList(buildProjectSysScreenRequest(panel));
  if (error) return;

  const sysScreenMap = data?.sys_screen_map ?? {};

  panel.items = (data?.list ?? []).map(item => ({
    id: item.id,
    name: item.name || item.title || String(item.id),
    thumbUrl: sysScreenMap[String(item.sys_screen_id)]?.url || ''
  }));
}

/**
 * 加载组态大屏资源。
 *
 * @param panel 当前面板状态
 */
async function loadConfigurationPanel(panel: VisualPermissionPanel) {
  const { data, error } = await fetchGetConfigurationList(buildConfigurationRequest(panel));
  if (error) return;

  panel.items = (data?.list ?? []).map(item => ({
    id: item.id,
    name: item.name || String(item.id),
    thumbUrl: item.thumb_url ? getOssUrl(item.thumb_url) : ''
  }));
}

/**
 * 加载自定义大屏资源。
 *
 * @param panel 当前面板状态
 */
async function loadCustomScreenPanel(panel: VisualPermissionPanel) {
  const { data, error } = await fetchGetCustomScreenList(buildCustomScreenRequest(panel));
  if (error) return;

  panel.items = (data?.list ?? []).map(item => ({
    id: item.id,
    name: item.name || String(item.id),
    thumbUrl: item.thumb_url ? getOssUrl(item.thumb_url) : ''
  }));
}

/**
 * 按面板类型加载可视化资源。
 *
 * @param panel 当前面板状态
 */
async function loadVisualPanel(panel: VisualPermissionPanel) {
  panel.loading = true;

  if (panel.type === 'projectSysScreen') {
    await loadProjectSysScreenPanel(panel).finally(() => {
      panel.loading = false;
    });
    return;
  }

  if (panel.type === 'configuration') {
    await loadConfigurationPanel(panel).finally(() => {
      panel.loading = false;
    });
    return;
  }

  await loadCustomScreenPanel(panel).finally(() => {
    panel.loading = false;
  });
}

/**
 * 将角色详情中的单类可视化权限回填到面板。
 *
 * @param panel 当前面板状态
 * @param hasAll 是否拥有该类全部权限
 * @param conf 后端返回的授权配置
 */
function applyVisualPanelAuth(
  panel: VisualPermissionPanel,
  hasAll: boolean | undefined,
  conf: Api.System.VisualPermConf[] | undefined
) {
  const confList = conf ?? [];
  const confMap = new Map(confList.map(item => [String(item.biz_id), item.is_ctrl]));
  const selectedIds = hasAll ? panel.items.map(item => item.id) : confList.map(item => item.biz_id);

  panel.selectedIds = uniqueIds(selectedIds);
  panel.controlIds = panel.selectedIds.filter(id => confMap.get(String(id)) === true);
}

/**
 * 回填三类可视化权限。
 *
 * @param role 角色详情
 */
function applyVisualAuth(role?: Api.System.Role | null) {
  const permAuth = role?.perm_auth;

  applyVisualPanelAuth(
    getVisualPanel('projectSysScreen'),
    permAuth?.project_sys_screen_auth?.has_all,
    permAuth?.project_sys_screen_auth?.project_sys_screen_conf
  );
  applyVisualPanelAuth(
    getVisualPanel('configuration'),
    permAuth?.configuration_auth?.has_all,
    permAuth?.configuration_auth?.configuration_conf
  );
  applyVisualPanelAuth(
    getVisualPanel('customScreen'),
    permAuth?.custom_screen_auth?.has_all,
    permAuth?.custom_screen_auth?.custom_screen_conf
  );
}

/** 重置抽屉内的菜单和可视化权限状态。 */
function resetPermissions() {
  currentRole.value = null;
  checkedKeys.value = [];
  cascade.value = false;
  activePermissionTab.value = 'menu';
  activeVisualTab.value = 'projectSysScreen';

  visualPanels.forEach(panel => {
    panel.searchKeyword = null;
    panel.loading = false;
    panel.items = [];
    panel.selectedIds = [];
    panel.controlIds = [];
  });
}

/** 打开抽屉时加载角色详情与可视化资源，并回填权限状态。 */
async function handleUpdateModelWhenOpen() {
  resetPermissions();
  const roleId = props.rowData?.id;
  const canOperateVisual = canOperateVisualPermissions.value;

  if (roleId === undefined || roleId === null) {
    menuLoading.value = false;
    return;
  }

  menuLoading.value = true;
  const roleRequest = fetchGetRole({ id: roleId }).finally(() => {
    menuLoading.value = false;
  });

  if (canOperateVisual) {
    await Promise.all(visualPanels.map(panel => loadVisualPanel(panel)));
  }

  const roleResponse = await roleRequest;
  const { error, data } = roleResponse;
  if (error) {
    return;
  }

  if (visible.value && props.rowData?.id === roleId) {
    currentRole.value = data.role;
    checkedKeys.value = getDefaultCheckedKeys(data.role);

    if (canOperateVisual) {
      applyVisualAuth(data.role);
    }
  }
}

function closeDrawer() {
  visible.value = false;
}

/**
 * 判断可视化资源是否已授权。
 *
 * @param panel 当前面板状态
 * @param id 资源 id
 * @returns 是否已授权
 */
function isVisualSelected(panel: VisualPermissionPanel, id: CommonType.IdType) {
  return hasId(panel.selectedIds, id);
}

/**
 * 判断可视化资源是否可控制。
 *
 * @param panel 当前面板状态
 * @param id 资源 id
 * @returns 是否可控制
 */
function isVisualControlEnabled(panel: VisualPermissionPanel, id: CommonType.IdType) {
  return hasId(panel.controlIds, id);
}

/**
 * 获取当前列表资源 id。
 *
 * @param panel 当前面板状态
 * @returns 当前列表资源 id
 */
function getPanelItemIds(panel: VisualPermissionPanel) {
  return panel.items.map(item => item.id);
}

/**
 * 获取当前列表已授权资源 id。
 *
 * @param panel 当前面板状态
 * @returns 当前列表已授权资源 id
 */
function getPanelSelectedIds(panel: VisualPermissionPanel) {
  const itemIdSet = new Set(getPanelItemIds(panel).map(String));

  return panel.selectedIds.filter(id => itemIdSet.has(String(id)));
}

/**
 * 判断当前页资源是否全部授权。
 *
 * @param panel 当前面板状态
 * @returns 是否全部授权
 */
function isPanelAllSelected(panel: VisualPermissionPanel) {
  return panel.items.length > 0 && getPanelSelectedIds(panel).length === panel.items.length;
}

/**
 * 判断当前页资源是否部分授权。
 *
 * @param panel 当前面板状态
 * @returns 是否部分授权
 */
function isPanelPartiallySelected(panel: VisualPermissionPanel) {
  const selectedCount = getPanelSelectedCount(panel);

  return selectedCount > 0 && selectedCount < panel.items.length;
}

/**
 * 判断已授权资源是否全部可控制。
 *
 * @param panel 当前面板状态
 * @returns 是否全部可控制
 */
function isPanelControlAll(panel: VisualPermissionPanel) {
  const selectedIds = getPanelSelectedIds(panel);

  return selectedIds.length > 0 && selectedIds.every(id => isVisualControlEnabled(panel, id));
}

/**
 * 判断已授权资源是否部分可控制。
 *
 * @param panel 当前面板状态
 * @returns 是否部分可控制
 */
function isPanelControlPartiallyEnabled(panel: VisualPermissionPanel) {
  const selectedIds = getPanelSelectedIds(panel);
  const controlCount = selectedIds.filter(id => isVisualControlEnabled(panel, id)).length;

  return controlCount > 0 && controlCount < selectedIds.length;
}

/**
 * 获取当前列表已授权资源数量。
 *
 * @param panel 当前面板状态
 * @returns 当前列表已授权数量
 */
function getPanelSelectedCount(panel: VisualPermissionPanel) {
  return getPanelSelectedIds(panel).length;
}

/**
 * 获取可控制资源数量。
 *
 * @param panel 当前面板状态
 * @returns 可控制数量
 */
function getPanelControlCount(panel: VisualPermissionPanel) {
  return getPanelSelectedIds(panel).filter(id => isVisualControlEnabled(panel, id)).length;
}

/**
 * 获取可视化资源卡片样式。
 *
 * @param panel 当前面板状态
 * @param id 资源 id
 * @returns UnoCSS 类名
 */
function getVisualCardClass(panel: VisualPermissionPanel, id: CommonType.IdType) {
  return isVisualSelected(panel, id)
    ? 'border border-[rgba(148,163,184,0.36)] bg-[rgba(148,163,184,0.08)] dark:border-[rgba(148,163,184,0.3)] dark:bg-[rgba(148,163,184,0.08)]'
    : 'border border-[rgba(148,163,184,0.18)] bg-[rgba(148,163,184,0.035)] hover:(border-[rgba(148,163,184,0.28)] bg-[rgba(148,163,184,0.055)]) dark:border-[rgba(148,163,184,0.2)] dark:bg-[rgba(15,23,42,0.2)] dark:hover:(border-[rgba(148,163,184,0.3)] bg-[rgba(148,163,184,0.07)])';
}

/**
 * 切换当前页资源授权全开。
 *
 * @param panel 当前面板状态
 * @param checked 是否全开
 */
function handlePanelCheckAll(panel: VisualPermissionPanel, checked: boolean) {
  const itemIds = getPanelItemIds(panel);

  if (checked) {
    panel.selectedIds = getSearchText(panel) ? addIds(panel.selectedIds, itemIds) : itemIds;
    panel.controlIds = panel.controlIds.filter(id => isVisualSelected(panel, id));
    return;
  }

  if (!getSearchText(panel)) {
    panel.selectedIds = [];
    panel.controlIds = [];
    return;
  }

  panel.selectedIds = removeIds(panel.selectedIds, itemIds);
  panel.controlIds = removeIds(panel.controlIds, itemIds);
}

/**
 * 切换已授权资源控制全开。
 *
 * @param panel 当前面板状态
 * @param checked 是否全开
 */
function handlePanelControlAll(panel: VisualPermissionPanel, checked: boolean) {
  const selectedIds = getPanelSelectedIds(panel);

  if (checked) {
    panel.controlIds = addIds(panel.controlIds, selectedIds);
    return;
  }

  panel.controlIds = removeIds(panel.controlIds, selectedIds);
}

/**
 * 切换单个资源授权。
 *
 * @param panel 当前面板状态
 * @param id 资源 id
 * @param checked 是否授权
 */
function handleVisualItemChecked(panel: VisualPermissionPanel, id: CommonType.IdType, checked: boolean) {
  if (checked) {
    panel.selectedIds = addIds(panel.selectedIds, [id]);
    return;
  }

  panel.selectedIds = removeIds(panel.selectedIds, [id]);
  panel.controlIds = removeIds(panel.controlIds, [id]);
}

/**
 * 切换单个资源控制权限。
 *
 * @param panel 当前面板状态
 * @param id 资源 id
 * @param checked 是否可控制
 */
function handleVisualControlChecked(panel: VisualPermissionPanel, id: CommonType.IdType, checked: boolean) {
  if (!isVisualSelected(panel, id)) return;

  if (checked) {
    panel.controlIds = addIds(panel.controlIds, [id]);
    return;
  }

  panel.controlIds = removeIds(panel.controlIds, [id]);
}

/**
 * 构造可视化权限提交配置。
 *
 * @param panel 当前面板状态
 * @returns 后端授权配置
 */
function buildVisualSubmitConf(panel: VisualPermissionPanel): Api.System.VisualPermConf[] {
  return panel.selectedIds.map(id => ({
    biz_id: id,
    is_ctrl: isVisualControlEnabled(panel, id)
  }));
}

/**
 * 保留原可视化权限配置。
 *
 * @param role 角色详情
 * @returns 原可视化权限提交参数
 */
function getOriginalVisualSubmitParams(role?: Api.System.Role | null): VisualSubmitParams {
  const permAuth = role?.perm_auth;

  return {
    project_sys_screen_conf: [...(permAuth?.project_sys_screen_auth?.project_sys_screen_conf ?? [])],
    configuration_conf: [...(permAuth?.configuration_auth?.configuration_conf ?? [])],
    custom_screen_conf: [...(permAuth?.custom_screen_auth?.custom_screen_conf ?? [])]
  };
}

/**
 * 构造可视化权限提交参数。
 *
 * @returns 可视化权限提交参数
 */
function buildVisualSubmitParams(): VisualSubmitParams {
  if (!canOperateVisualPermissions.value) {
    return getOriginalVisualSubmitParams(currentRole.value ?? props.rowData);
  }

  const projectSysScreenPanel = getVisualPanel('projectSysScreen');
  const configurationPanel = getVisualPanel('configuration');
  const customScreenPanel = getVisualPanel('customScreen');

  return {
    project_sys_screen_conf: buildVisualSubmitConf(projectSysScreenPanel),
    configuration_conf: buildVisualSubmitConf(configurationPanel),
    custom_screen_conf: buildVisualSubmitConf(customScreenPanel)
  };
}

/** 提交菜单权限与三类可视化权限配置。 */
async function handleSubmit() {
  submitLoading.value = true;
  const menuIds = menuTreeRef.value?.getCheckedMenuIds() ?? checkedKeys.value;

  const { error } = await fetchAssignPermAuth({
    role_id: props.rowData?.id ?? 0,
    menu_id_list: menuIds,
    ...buildVisualSubmitParams()
  }).finally(() => {
    submitLoading.value = false;
  });
  if (error) return;
  window.$message?.success($t('common.updateSuccess'));
  emit('submitted');
  closeDrawer();
}

watch(visible, newValue => {
  if (newValue) {
    handleUpdateModelWhenOpen();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="920" class="max-w-95%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NTabs v-model:value="activePermissionTab" type="segment" animated>
        <NTabPane name="menu" tab="菜单权限" display-directive="show">
          <NForm>
            <NFormItem class="pr-24px">
              <MenuTree
                v-if="visible"
                ref="menuTreeRef"
                v-model:checked-keys="checkedKeys"
                v-model:cascade="cascade"
                v-model:loading="menuLoading"
                :request-params="menuTreeRequestParams"
                :show-button-menus="true"
                :immediate="true"
              />
            </NFormItem>
          </NForm>
        </NTabPane>
        <NTabPane v-if="canOperateVisualPermissions" name="visual" tab="可视化权限" display-directive="show">
          <NTabs v-model:value="activeVisualTab" type="card" animated>
            <NTabPane
              v-for="panel in visualPanels"
              :key="panel.type"
              :name="panel.type"
              :tab="panel.label"
              display-directive="show"
            >
              <div class="min-h-520px">
                <div class="mb-16px flex items-center justify-between gap-12px lt-sm:flex-col lt-sm:items-stretch">
                  <div class="flex flex-wrap items-center gap-14px">
                    <NCheckbox
                      :checked="isPanelAllSelected(panel)"
                      :indeterminate="isPanelPartiallySelected(panel)"
                      :disabled="panel.items.length === 0"
                      @update:checked="checked => handlePanelCheckAll(panel, Boolean(checked))"
                    >
                      权限全开
                    </NCheckbox>
                    <NCheckbox
                      :checked="isPanelControlAll(panel)"
                      :indeterminate="isPanelControlPartiallyEnabled(panel)"
                      :disabled="getPanelSelectedCount(panel) === 0"
                      @update:checked="checked => handlePanelControlAll(panel, Boolean(checked))"
                    >
                      控制全开
                    </NCheckbox>
                    <span class="text-13px text-[var(--n-text-color-3)] leading-none">
                      已授权 {{ getPanelSelectedCount(panel) }} / {{ panel.items.length }}，可控制
                      {{ getPanelControlCount(panel) }}
                    </span>
                  </div>
                  <NInputGroup class="w-280px lt-sm:w-full">
                    <NInput
                      v-model:value="panel.searchKeyword"
                      clearable
                      :placeholder="panel.searchPlaceholder"
                      @keyup.enter="loadVisualPanel(panel)"
                    />
                    <NButton :loading="panel.loading" @click="loadVisualPanel(panel)">
                      <template #icon>
                        <icon-ic-round-search class="text-icon" />
                      </template>
                    </NButton>
                  </NInputGroup>
                </div>

                <NSpin :show="panel.loading">
                  <NEmpty v-if="panel.items.length === 0" description="暂无大屏" class="h-360px justify-center" />
                  <NGrid v-else cols="2 s:3 m:4 l:5" responsive="screen" :x-gap="12" :y-gap="12">
                    <NGi v-for="item in panel.items" :key="String(item.id)">
                      <NCard
                        size="small"
                        hoverable
                        :bordered="false"
                        content-class="p-8px"
                        class="overflow-hidden rounded-6px transition-colors duration-200"
                        :class="getVisualCardClass(panel, item.id)"
                      >
                        <div class="flex flex-col gap-10px">
                          <div class="aspect-video w-full overflow-hidden rounded-6px bg-[rgba(148,163,184,0.08)]">
                            <NImage
                              v-if="item.thumbUrl"
                              :src="item.thumbUrl"
                              :alt="item.name"
                              width="100%"
                              height="100%"
                              object-fit="cover"
                              preview-disabled
                              class="block h-full w-full"
                            />
                            <div
                              v-else
                              class="h-full flex flex-col items-center justify-center gap-4px text-12px text-[var(--n-text-color-3)]"
                            >
                              <span>暂无缩略图</span>
                            </div>
                          </div>

                          <NEllipsis class="w-full text-center font-500">{{ item.name }}</NEllipsis>

                          <div class="grid grid-cols-2 gap-8px">
                            <NCheckbox
                              :checked="isVisualSelected(panel, item.id)"
                              @update:checked="checked => handleVisualItemChecked(panel, item.id, Boolean(checked))"
                            >
                              权限
                            </NCheckbox>
                            <NCheckbox
                              :checked="isVisualControlEnabled(panel, item.id)"
                              :disabled="!isVisualSelected(panel, item.id)"
                              @update:checked="checked => handleVisualControlChecked(panel, item.id, Boolean(checked))"
                            >
                              控制
                            </NCheckbox>
                          </div>
                        </div>
                      </NCard>
                    </NGi>
                  </NGrid>
                </NSpin>
              </div>
            </NTabPane>
          </NTabs>
        </NTabPane>
      </NTabs>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
