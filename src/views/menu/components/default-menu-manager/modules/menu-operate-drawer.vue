<script setup lang="tsx">
import { computed, ref, watch } from 'vue';
import type { SelectOption } from 'naive-ui';
import { menuNodeType } from '@/constants/business';
import { fetchCreateMenuNode, fetchGetMenuNode, fetchUpdateMenuNode } from '@/service/api/system/menu';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { defaultMenuIcon, menuIconCollection, menuIconNames } from '@/plugins/iconify-offline-icons';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import {
  getMenuIsFrameOptions,
  getMenuLayoutOptions,
  getMenuNodeTypeOptions,
  translateMenuTree
} from '../shared';

defineOptions({
  name: 'MenuOperateDrawer'
});

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
  is_frame: Api.System.IsMenuFrame;
  status: PlatformBooleanStatus;
  title: string;
  icon: string;
  is_visible: boolean;
  keep_alive: boolean;
  menu_type: Api.System.MenuNodeType;
};

type PlatformBooleanStatus = '1' | '2';

const defaultIcon = defaultMenuIcon;
const menuIconPrefix = `${menuIconCollection}:`;
const layoutType = ref<Api.System.MenuLayout>('0');
const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule, createNumberRequiredRule } = useFormRules();
const buttonPermKey = ref('');
const addableMenuNodeTypeOptions = computed(() =>
  getMenuNodeTypeOptions([menuNodeType.catalog, menuNodeType.menu])
);
const menuIsFrameOptions = computed(getMenuIsFrameOptions);
const menuLayoutOptions = computed(getMenuLayoutOptions);

const drawerTitle = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, App.I18n.I18nKey> = {
    add: 'page.system.menu.addMenu',
    edit: 'page.system.menu.editMenu'
  };
  return $t(titles[props.operateType]);
});

const model = ref<Model>(createDefaultModel());

const isCatalog = computed(() => model.value.menu_type === menuNodeType.catalog);
const isMenu = computed(() => model.value.menu_type === menuNodeType.menu);
const isBtn = computed(() => model.value.menu_type === menuNodeType.button);
const isExternalType = computed(() => model.value.is_frame === '0');
const isInternalType = computed(() => model.value.is_frame === '1');
const isBlankLayout = computed(() => layoutType.value === '1');
const isIframeType = computed(() => model.value.is_frame === '2');
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

type RuleKey = Extract<keyof Model, 'title' | 'order_num' | 'path' | 'component'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  title: createRequiredRule($t('page.system.menu.form.menuName.required')),
  order_num: createNumberRequiredRule($t('page.system.menu.form.orderNum.required')),
  path: createRequiredRule($t('page.system.menu.form.path.required')),
  component: createRequiredRule($t('page.system.menu.form.component.required'))
};

const menuIconNameSet = new Set(menuIconNames);
const menuIconOptions = menuIconNames.map<SelectOption>(item => ({
  label: () => (
    <div class="flex-y-center gap-16px">
      <SvgIcon icon={`${menuIconPrefix}${item}`} class="text-icon" />
      <span>{item}</span>
    </div>
  ),
  value: `${menuIconPrefix}${item}`
}));

const translatedTreeData = computed(() => translateMenuTree(props.treeData ?? []));

function normalizeMenuIcon(icon?: string) {
  if (!icon?.startsWith(menuIconPrefix)) {
    return defaultIcon;
  }

  const name = icon.slice(menuIconPrefix.length);
  return menuIconNameSet.has(name) ? icon : defaultIcon;
}

function createDefaultModel(): Model {
  return {
    parent_id: props.pid ?? 0,
    p_type: props.pType,
    layout: '0',
    order_num: 1,
    path: '',
    component: '',
    name: '',
    is_frame: '1',
    status: '1',
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
    buttonPermKey.value = menu.detail.button.perm_key;
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
    is_frame: isFrame,
    status: normalizeBooleanField(menu.is_visible) ? '1' : '2',
    title: menu.name,
    icon: normalizeMenuIcon(menu.icon),
    is_visible: normalizeBooleanField(menu.is_visible),
    keep_alive: keepAlive,
    menu_type: menuType
  };
}

async function handleInitModel() {
  buttonPermKey.value = '';
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
        perm_key: buttonPermKey.value
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
        url: model.value.path
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
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="600" class="max-w-90%">
    <NDrawerContent :title="drawerTitle" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi :span="24" :label="$t('page.system.menu.parentId')">
            <NTreeSelect
              v-model:value="model.parent_id"
              filterable
              key-field="id"
              label-field="label"
              :options="translatedTreeData as []"
              :default-expanded-keys="[0]"
              :placeholder="$t('page.system.menu.form.parentId.required')"
            />
          </NFormItemGi>
          <NFormItemGi v-if="!isBtn" :span="12" :label="$t('page.system.menu.menuType')" path="menu_type">
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
          <NFormItemGi span="24" :label="$t('page.system.menu.menuName')" path="title">
            <NInput
              v-model:value="model.title"
              :placeholder="$t('page.system.menu.form.menuName.required')"
              :maxlength="48"
              show-count
            />
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
          <NFormItemGi v-if="!isBtn" :span="24" :label="$t('page.system.menu.path')" path="path">
            <NInput v-model:value="model.path" :placeholder="$t('page.system.menu.form.path.required')" />
          </NFormItemGi>
          <NFormItemGi v-if="isMenu" :span="24" :label="$t('page.system.menu.routeName')" path="name">
            <NInput v-model:value="model.name" :placeholder="$t('page.system.menu.form.routeName.required')" />
          </NFormItemGi>
          <NFormItemGi
            v-if="isMenu && isInternalType"
            :span="24"
            :label="$t('page.system.menu.component')"
            path="component"
          >
            <NInputGroup>
              <NInputGroupLabel>views/</NInputGroupLabel>
              <NInput v-model:value="model.component" :placeholder="$t('page.system.menu.form.component.required')" />
              <NInputGroupLabel>/index.vue</NInputGroupLabel>
            </NInputGroup>
          </NFormItemGi>
          <NFormItemGi v-if="!isBtn" span="24" :label="$t('page.system.menu.icon')" path="icon">
            <NSelect
              v-model:value="model.icon"
              filterable
              :options="menuIconOptions"
              :placeholder="$t('page.system.menu.form.icon.required')"
            />
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
                <NRadio value="1" :label="$t('dict.sys_show_hide.show')" />
                <NRadio value="2" :label="$t('dict.sys_show_hide.hide')" />
              </NSpace>
            </NRadioGroup>
          </NFormItemGi>
          <!--
 <NFormItemGi :span="12" path="status">
            <template #label>
              <div class="flex-center">
                <FormTip :content="$t('page.system.menu.statusTip')" />
                <span>{{ $t('page.system.menu.status') }}</span>
              </div>
            </template>
            <NRadioGroup v-model:value="visibleStatus">
              <NSpace>
                <NRadio value="1" :label="$t('dict.sys_normal_disable.normal')" />
                <NRadio value="2" :label="$t('dict.sys_normal_disable.disable')" />
              </NSpace>
            </NRadioGroup>
          </NFormItemGi>
-->
          <NFormItemGi :span="12" :label="$t('page.system.menu.orderNum')" path="order_num">
            <NInputNumber
              v-model:value="model.order_num"
              :placeholder="$t('page.system.menu.form.orderNum.required')"
            />
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
