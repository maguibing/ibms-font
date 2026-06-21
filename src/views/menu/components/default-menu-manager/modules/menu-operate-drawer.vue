<script setup lang="tsx">
import { computed, ref, watch } from 'vue';
import type { SelectOption } from 'naive-ui';
import {
  menuIconTypeOptions,
  menuIsFrameOptions,
  menuLayoutOptions,
  menuNodeType,
  menuNodeTypeOptions
} from '@/constants/business';
import { fetchCreateMenuNode, fetchGetMenuNode, fetchUpdateMenuNode } from '@/service/api/system/menu';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { getLocalMenuIcons } from '@/utils/icon';
import { isNotNull } from '@/utils/common';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';

defineOptions({
  name: 'MenuOperateDrawer'
});

const addableMenuNodeTypeOptions = menuNodeTypeOptions.filter(
  item => item.value !== menuNodeType.button && item.value !== menuNodeType.extLink
);

interface Props {
  pType: CommonType.IdType;
  operateType: NaiveUI.TableOperateType;
  menuId?: CommonType.IdType;
  treeData?: Api.System.MenuNode[] | null;
  pid?: CommonType.IdType;
  menuType?: Api.System.MenuNodeType;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted', menuType: Api.System.MenuNodeType): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

type Model = {
  id?: CommonType.IdType;
  parent_id: CommonType.IdType;
  p_type: CommonType.IdType;
  layout: Api.System.MenuLayout;
  order_num: number;
  path: string;
  component: string;
  name: string;
  query_param: string;
  is_frame: Api.System.IsMenuFrame;
  status: PlatformBooleanStatus;
  perm_key: string;
  title: string;
  icon: string;
  is_visible: boolean;
  keep_alive: boolean;
  menu_type: Api.System.MenuNodeType;
};

type PlatformBooleanStatus = '1' | '2';

const defaultIcon = import.meta.env.VITE_MENU_ICON;
const layoutType = ref<Api.System.MenuLayout>('0');
const iconType = ref<Api.System.IconType>('1');
const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule, createNumberRequiredRule } = useFormRules();
const queryList = ref<{ key: string; value: string }[]>([]);

const drawerTitle = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增菜单',
    edit: '编辑菜单'
  };
  return titles[props.operateType];
});

const model = ref<Model>(createDefaultModel());

const isCatalog = computed(() => model.value.menu_type === menuNodeType.catalog);
const isMenu = computed(() => model.value.menu_type === menuNodeType.menu);
const isBtn = computed(() => model.value.menu_type === menuNodeType.button);
const isExternalType = computed(() => model.value.is_frame === '0');
const isInternalType = computed(() => model.value.is_frame === '1');
const isBlankLayout = computed(() => layoutType.value === '1');
const isIframeType = computed(() => model.value.is_frame === '2');
const isLocalIcon = computed(() => iconType.value === '2');
const layoutDisabled = computed(() => !(isMenu.value && Number(model.value.parent_id) === 0));
const visibleStatus = computed<PlatformBooleanStatus>({
  get: () => (model.value.is_visible ? '1' : '2'),
  set: value => {
    model.value.is_visible = value === '1';
  }
});
const cacheStatus = computed<PlatformBooleanStatus>({
  get: () => (model.value.keep_alive ? '1' : '2'),
  set: value => {
    model.value.keep_alive = value === '1';
  }
});

type RuleKey = Extract<keyof Model, 'title' | 'order_num' | 'path' | 'component' | 'perm_key'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  title: createRequiredRule('请输入菜单名称'),
  order_num: createNumberRequiredRule('请输入显示排序'),
  path: createRequiredRule('请输入路由地址'),
  component: createRequiredRule('请输入组件路径'),
  perm_key: createRequiredRule('请输入权限标识')
};

const localIcons = getLocalMenuIcons();
const localIconOptions = localIcons.map<SelectOption>(item => ({
  label: () => (
    <div class="flex-y-center gap-16px">
      <SvgIcon localIcon={`menu-${item}`} class="text-icon" />
      <span>{item}</span>
    </div>
  ),
  value: `local-icon-${item}`
}));

function createDefaultModel(): Model {
  return {
    parent_id: props.pid ?? 0,
    p_type: props.pType,
    layout: '0',
    order_num: 1,
    path: '',
    component: '',
    name: '',
    query_param: '',
    is_frame: '1',
    status: '1',
    perm_key: '',
    title: '',
    icon: defaultIcon,
    is_visible: true,
    keep_alive: false,
    menu_type: props.menuType ?? menuNodeType.catalog
  };
}

function normalizeBooleanField(value?: boolean | number | string): boolean {
  return value === true || value === 1 || value === '1';
}

function applyMenuDetail(menu: Api.System.MenuNodeDetail) {
  const menuType = menu.type;
  const isFrame: Api.System.IsMenuFrame = '1';
  let path = '';
  let component = '';
  let name = '';
  let permKey = '';
  let keepAlive = false;

  if (menu.type === menuNodeType.catalog) {
    path = menu.detail.dir.route_path;
    component = menu.detail.dir.component_path;
  }

  if (menu.type === menuNodeType.menu) {
    path = menu.detail.page.route_path;
    component = menu.detail.page.component_path;
    name = menu.detail.page.route_name;
    keepAlive = normalizeBooleanField(menu.detail.page.keep_alive);
  }

  if (menu.type === menuNodeType.button) {
    permKey = menu.detail.button.perm_key;
  }

  if (component.startsWith('layout.blank$view.')) {
    layoutType.value = '1';
    component = component.slice(18, component.length)?.replaceAll('_', '/');
  } else if (menuType === menuNodeType.menu && isFrame === '1' && component.endsWith('/index')) {
    component = component.slice(0, -6);
  }
  model.value = {
    id: menu.id,
    parent_id: menu.parent_id ?? props.pid ?? 0,
    p_type: menu.p_type ?? props.pType,
    layout: layoutType.value,
    order_num: menu.sort ?? 1,
    path,
    component,
    name,
    query_param: '',
    is_frame: isFrame,
    status: normalizeBooleanField(menu.is_visible) ? '1' : '2',
    perm_key: permKey,
    title: menu.name,
    icon: menu.icon || defaultIcon,
    is_visible: normalizeBooleanField(menu.is_visible),
    keep_alive: keepAlive,
    menu_type: menuType
  };
  iconType.value = model.value.icon?.startsWith('local-icon-') ? '2' : '1';
}

async function handleInitModel() {
  queryList.value = [];
  iconType.value = '1';
  layoutType.value = '0';
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.menuId) {
    const { data, error } = await fetchGetMenuNode({ id: props.menuId });
    if (error || !data) return;
    applyMenuDetail(data.menu);
  }
}

function closeDrawer() {
  visible.value = false;
}

function getPageComponentPath(component: string | null | undefined): string {
  if (isBlankLayout.value) {
    return `layout.blank$view.${component?.replaceAll('/', '_')}`;
  }
  return component?.endsWith('/index') ? component : `${component || ''}/index`;
}

function getExternalUrl() {
  if (isIframeType.value) {
    return model.value.query_param;
  }
  return model.value.path;
}

function getPayloadType(): Api.System.MenuNodeType {
  if (isCatalog.value) {
    return menuNodeType.catalog;
  }
  if (isBtn.value) {
    return menuNodeType.button;
  }
  if (isExternalType.value || isIframeType.value) {
    return menuNodeType.extLink;
  }
  return menuNodeType.menu;
}

function buildDetail(): Api.System.MenuNodeOperateDetail {
  if (isBtn.value) {
    return {
      button: {
        perm_key: model.value.perm_key
      }
    };
  }

  if (isCatalog.value) {
    return {
      dir: {
        always_show: true,
        component_path: model.value.component,
        route_path: model.value.path
      }
    };
  }

  if (isExternalType.value || isIframeType.value) {
    return {
      ext_link: {
        url: getExternalUrl()
      }
    };
  }

  return {
    page: {
      component_path: getPageComponentPath(model.value.component),
      keep_alive: model.value.keep_alive,
      route_name: model.value.name,
      route_path: model.value.path
    }
  };
}

function buildPayload(): Api.System.MenuNodeOperateParams {
  return {
    id: model.value.id,
    detail: buildDetail(),
    icon: model.value.icon || defaultIcon,
    is_visible: model.value.is_visible,
    name: model.value.title,
    p_type: model.value.p_type,
    parent_id: model.value.parent_id,
    sort: model.value.order_num,
    type: getPayloadType()
  };
}

async function handleSubmit() {
  await validate();

  const payload = buildPayload();
  if (props.operateType === 'add') {
    const { error } = await fetchCreateMenuNode(payload);
    if (error) return;
    window.$message?.success($t('common.addSuccess'));
  }

  if (props.operateType === 'edit') {
    const { error } = await fetchUpdateMenuNode(payload);
    if (error) return;
    window.$message?.success($t('common.updateSuccess'));
  }

  closeDrawer();
  emit('submitted', model.value.menu_type);
}

watch(
  () => model.value.menu_type,
  menuType => {
    if (menuType === menuNodeType.catalog) {
      model.value.is_frame = '1';
      model.value.perm_key = '';
      model.value.keep_alive = false;
    }
  }
);

watch(
  layoutDisabled,
  () => {
    if (!layoutDisabled.value) {
      return;
    }
    layoutType.value = '0';
    model.value.layout = '0';
  },
  { immediate: true }
);

watch(visible, () => {
  if (visible.value) {
    handleInitModel().then(() => restoreValidation());
  }
});

function handleLayoutChange(value: string) {
  model.value.layout = value as Api.System.MenuLayout;
  model.value.is_visible = value === '0';
}

function onCreate() {
  return {
    key: '',
    value: ''
  };
}
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="600" class="max-w-90%">
    <NDrawerContent :title="drawerTitle" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi :span="24" label="上级菜单">
            <NTreeSelect
              v-model:value="model.parent_id"
              filterable
              key-field="id"
              label-field="label"
              :options="treeData as []"
              :default-expanded-keys="[0]"
              placeholder="请选择上级菜单"
            />
          </NFormItemGi>
          <NFormItemGi v-if="!isBtn" :span="12" label="菜单类型" path="menu_type">
            <NRadioGroup v-model:value="model.menu_type">
              <NRadioButton
                v-for="item in addableMenuNodeTypeOptions"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi :span="12" path="layout">
            <template #label>
              <div class="flex-center">
                <FormTip :content="$t('page.system.menu.layoutTip')" />
                <span>{{ $t('page.system.menu.layout') }}</span>
              </div>
            </template>
            <NRadioGroup v-model:value="layoutType" :disabled="layoutDisabled" @update:value="handleLayoutChange">
              <NRadio v-for="item in menuLayoutOptions" :key="item.value" :value="item.value" :label="item.label" />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi span="24" label="菜单名称" path="title">
            <NInput v-model:value="model.title" placeholder="请输入菜单名称" :maxlength="10" show-count />
          </NFormItemGi>
          <NFormItemGi v-if="!isBtn" span="12" label="图标类型">
            <NRadioGroup v-model:value="iconType">
              <NRadio v-for="item in menuIconTypeOptions" :key="item.value" :value="item.value" :label="item.label" />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi v-if="!isBtn" span="12" path="icon">
            <template #label>
              <div class="flex-center">
                <FormTip :content="$t('page.system.menu.iconifyTip')" />
                <span class="pl-3px">菜单图标</span>
              </div>
            </template>
            <NSelect
              v-if="isLocalIcon"
              v-model:value="model.icon"
              filterable
              :options="localIconOptions"
              placeholder="请选择本地图标"
            />
            <NInput v-else v-model:value="model.icon" placeholder="请输入 Iconify 图标" class="flex-1">
              <template #suffix>
                <SvgIcon v-if="model.icon" :icon="model.icon" class="text-icon" />
              </template>
            </NInput>
          </NFormItemGi>
          <NFormItemGi v-if="!isBtn" :span="12" path="is_frame">
            <template #label>
              <div class="flex-center">
                <FormTip :content="$t('page.system.menu.isFrameTip')" />
                <span>{{ $t('page.system.menu.isFrame') }}</span>
              </div>
            </template>
            <NRadioGroup v-model:value="model.is_frame">
              <NSpace>
                <NRadio
                  v-for="option in menuIsFrameOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                  :disabled="option.value === '2' && isCatalog"
                />
              </NSpace>
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi v-if="isMenu" :span="12" path="keep_alive">
            <template #label>
              <div class="flex-center">
                <FormTip :content="$t('page.system.menu.isCacheTip')" />
                <span>{{ $t('page.system.menu.isCache') }}</span>
              </div>
            </template>
            <NRadioGroup v-model:value="cacheStatus">
              <NSpace>
                <NRadio value="1" :label="$t('common.yesOrNo.yes')" />
                <NRadio value="2" :label="$t('common.yesOrNo.no')" />
              </NSpace>
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi v-if="!isBtn" :span="24" label="路由地址" path="path">
            <NInput v-model:value="model.path" placeholder="请输入路由地址" />
          </NFormItemGi>
          <NFormItemGi v-if="isMenu" :span="24" label="路由名称" path="name">
            <NInput v-model:value="model.name" placeholder="请输入路由名称" />
          </NFormItemGi>
          <NFormItemGi v-if="isMenu && isInternalType" :span="24" label="组件路径" path="component">
            <NInputGroup>
              <NInputGroupLabel>views/</NInputGroupLabel>
              <NInput v-model:value="model.component" placeholder="请输入组件路径" />
              <NInputGroupLabel>/index.vue</NInputGroupLabel>
            </NInputGroup>
          </NFormItemGi>
          <NFormItemGi
            v-if="isMenu && !isExternalType"
            span="24"
            :show-feedback="!queryList.length"
            :label="isInternalType ? $t('page.system.menu.query') : $t('page.system.menu.iframeQuery')"
          >
            <NDynamicInput
              v-if="isInternalType"
              v-model:value="queryList"
              item-style="margin-bottom: 0"
              :on-create="onCreate"
            >
              <template #default="{ index }">
                <div class="w-full flex">
                  <NFormItem
                    class="w-full"
                    ignore-path-change
                    :show-label="false"
                    :path="`query[${index}].key`"
                    :rule="{
                      ...createRequiredRule($t('page.system.menu.placeholder.queryKey')),
                      validator: value => isNotNull(value)
                    }"
                  >
                    <NInput v-model:value="queryList[index].key" placeholder="Key" @keydown.enter.prevent />
                  </NFormItem>
                  <div class="mx-8px h-34px lh-34px">=</div>
                  <NFormItem
                    class="w-full"
                    ignore-path-change
                    :show-label="false"
                    :path="`query[${index}].value`"
                    :rule="{
                      ...createRequiredRule($t('page.system.menu.placeholder.queryValue')),
                      validator: value => isNotNull(value)
                    }"
                  >
                    <NInput v-model:value="queryList[index].value" placeholder="Value" @keydown.enter.prevent />
                  </NFormItem>
                </div>
              </template>
            </NDynamicInput>
            <NInput
              v-else
              v-model:value="model.query_param"
              :placeholder="$t('page.system.menu.placeholder.queryIframe')"
            />
          </NFormItemGi>
          <NFormItemGi v-if="!isCatalog" :span="24" label="权限标识" path="perm_key">
            <NInput v-model:value="model.perm_key" placeholder="请输入权限标识" />
          </NFormItemGi>
          <NFormItemGi v-if="!isBtn" :span="12" path="is_visible">
            <template #label>
              <div class="flex-center">
                <FormTip :content="$t('page.system.menu.visibleTip')" />
                <span>{{ $t('page.system.menu.visible') }}</span>
              </div>
            </template>
            <NRadioGroup v-model:value="visibleStatus" :disabled="isBlankLayout">
              <NSpace>
                <NRadio value="1" label="显示" />
                <NRadio value="2" label="隐藏" />
              </NSpace>
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi :span="12" path="status">
            <template #label>
              <div class="flex-center">
                <FormTip :content="$t('page.system.menu.statusTip')" />
                <span>{{ $t('page.system.menu.status') }}</span>
              </div>
            </template>
            <NRadioGroup v-model:value="visibleStatus">
              <NSpace>
                <NRadio value="1" label="正常" />
                <NRadio value="2" label="停用" />
              </NSpace>
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi :span="12" label="显示排序" path="order_num">
            <NInputNumber v-model:value="model.order_num" placeholder="请输入显示排序" />
          </NFormItemGi>
        </NGrid>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.save') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
