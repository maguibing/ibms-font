import { menuNodeType } from '@/constants/business';
import { $t } from '@/locales';
import { translateRouteTitle } from '@/utils/common';

/** 菜单国际化选项配置。 */
type MenuI18nOptionConfig<T extends string | number> = Readonly<{
  value: T;
  labelKey: App.I18n.I18nKey;
}>;

/** 菜单树选择器节点。 */
export type MenuTreeSelectOption = Omit<Api.System.MenuNode, 'children'> & {
  label?: string;
  icon?: string;
  children?: MenuTreeSelectOption[];
};

/** 菜单枚举国际化配置，作为单值展示和选项展示的唯一来源。 */
const menuNodeTypeConfigs = [
  { value: menuNodeType.catalog, labelKey: 'page.system.menu.directory' },
  { value: menuNodeType.menu, labelKey: 'page.system.menu.menu' },
  { value: menuNodeType.button, labelKey: 'page.system.menu.button' },
  { value: menuNodeType.extLink, labelKey: 'page.system.menu.extLink' }
] as const satisfies readonly MenuI18nOptionConfig<Api.System.MenuNodeType>[];

const menuIsFrameConfigs = [
  { value: '0', labelKey: 'common.yesOrNo.yes' },
  { value: '1', labelKey: 'common.yesOrNo.no' },
  { value: '2', labelKey: 'page.system.menu.iframe' }
] as const satisfies readonly MenuI18nOptionConfig<Api.System.IsMenuFrame>[];

const menuLayoutConfigs = [
  { value: '0', labelKey: 'page.system.menu.defaultLayout' },
  { value: '1', labelKey: 'page.system.menu.blankLayout' }
] as const satisfies readonly MenuI18nOptionConfig<Api.System.MenuLayout>[];

function getOptionLabelKey<T extends string | number>(configs: readonly MenuI18nOptionConfig<T>[], value: T) {
  return configs.find(item => item.value === value)?.labelKey;
}

function createI18nOption<T extends string | number>(value: T, labelKey: App.I18n.I18nKey): CommonType.Option<T> {
  return {
    value,
    label: $t(labelKey)
  };
}

function createI18nOptionByValue<T extends string | number>(
  configs: readonly MenuI18nOptionConfig<T>[],
  value: T,
  fallbackKey: App.I18n.I18nKey = 'common.unknown'
) {
  return createI18nOption(value, getOptionLabelKey(configs, value) || fallbackKey);
}

function translateI18nOptions<T extends string | number>(configs: readonly MenuI18nOptionConfig<T>[]) {
  return configs.map(item => createI18nOption(item.value, item.labelKey));
}

/**
 * 获取菜单节点类型文案。
 * @param menuType 入参：菜单节点类型
 * @returns 出参：当前语言文案
 */
export function getMenuNodeTypeLabel(menuType: Api.System.MenuNodeType) {
  return $t(getOptionLabelKey(menuNodeTypeConfigs, menuType) || 'common.unknown');
}

/**
 * 获取菜单节点类型选项。
 * @param types 入参：需要展示的菜单节点类型
 * @returns 出参：当前语言选项列表
 */
export function getMenuNodeTypeOptions(types: readonly Api.System.MenuNodeType[]) {
  return types.map(type => createI18nOptionByValue(menuNodeTypeConfigs, type));
}

/**
 * 获取外链类型选项。
 * @returns 出参：当前语言选项列表
 */
export function getMenuIsFrameOptions() {
  return translateI18nOptions(menuIsFrameConfigs);
}

/**
 * 获取布局方式选项。
 * @returns 出参：当前语言选项列表
 */
export function getMenuLayoutOptions() {
  return translateI18nOptions(menuLayoutConfigs);
}

/**
 * 获取菜单树节点展示名称。
 * @param option 入参：菜单树节点
 * @returns 出参：当前语言展示名称
 */
export function getMenuTreeLabel(option: MenuTreeSelectOption) {
  if (option.id === 0 || option.meta.id === 0) {
    return $t('common.rootDirectory');
  }

  return translateRouteTitle(String(option.label || option.meta.title || option.name || ''));
}

/**
 * 翻译菜单树展示名称。
 * @param list 入参：菜单树
 * @returns 出参：翻译后的菜单树
 */
export function translateMenuTree(list: Api.System.MenuNode[] = []): MenuTreeSelectOption[] {
  return list.map(item => {
    const option = item as MenuTreeSelectOption;
    const label = getMenuTreeLabel(option);
    const children = option.children ? translateMenuTree(option.children) : undefined;

    return {
      ...option,
      label,
      meta: {
        ...option.meta,
        title: label
      },
      ...(children ? { children } : {})
    };
  });
}
