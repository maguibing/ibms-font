import { transformRecordToOption, transformRecordToNumberOption } from '@/utils/common';

/** enable status */
export const enableStatusRecord: Record<Api.Common.EnableStatus, string> = {
  '1': '启用',
  '2': '停用'
};

export const enableStatusOptions = transformRecordToNumberOption(enableStatusRecord);

/** yes or no status */
export const yesOrNoStatusRecord: Record<Api.Common.YesOrNoStatus, string> = {
  Y: '是',
  N: '否'
};

export const yesOrNoStatusOptions = transformRecordToOption(yesOrNoStatusRecord);

/** menu type */
export const menuTypeRecord: Record<Api.System.MenuType, string> = {
  M: '目录',
  C: '菜单',
  F: '按钮'
};

export const menuTypeOptions = transformRecordToOption(menuTypeRecord);

/** menu node type */
export const menuNodeType = {
  catalog: 1,
  menu: 2,
  button: 3,
  extLink: 4
} as const;

export const menuNodeTypeRecord: Record<Api.System.MenuNodeType, string> = {
  [menuNodeType.catalog]: '目录',
  [menuNodeType.menu]: '菜单',
  [menuNodeType.button]: '按钮',
  [menuNodeType.extLink]: '外链'
};

export const menuNodeTypeOptions: CommonType.Option<Api.System.MenuNodeType>[] = [
  { value: menuNodeType.catalog, label: menuNodeTypeRecord[menuNodeType.catalog] },
  { value: menuNodeType.menu, label: menuNodeTypeRecord[menuNodeType.menu] },
  { value: menuNodeType.button, label: menuNodeTypeRecord[menuNodeType.button] },
  { value: menuNodeType.extLink, label: menuNodeTypeRecord[menuNodeType.extLink] }
];

/** menu platform type */
export const menuPlatformType = {
  operation: 1,
  integrator: 2,
  project: 3
} as const;

/** menu is frame */
export const menuIsFrameRecord: Record<Api.System.IsMenuFrame, string> = {
  '0': '是',
  '1': '否',
  '2': 'iframe'
};

export const menuIsFrameOptions = transformRecordToOption(menuIsFrameRecord);

/** menu layout */
export const menuLayoutRecord: Record<Api.System.MenuLayout, string> = {
  '0': '默认布局',
  '1': '空白布局'
};

export const menuLayoutOptions = transformRecordToOption(menuLayoutRecord);

/** data scope */
export const dataScopeRecord: Record<Api.System.DataScope, string> = {
  '1': '全部数据权限',
  '2': '仅本人数据权限',
  '3': '本部门数据权限',
  '4': '本部门及自部门数据权限'
};

export const dataScopeOptions = transformRecordToOption(dataScopeRecord);
