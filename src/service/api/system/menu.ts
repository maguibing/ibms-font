import { request } from '@/service/request';

/** 获取菜单列表 */
export function fetchGetMenuList(params?: Api.System.MenuSearchParams, signal?: AbortSignal) {
  return request<Api.System.MenuList>({
    url: '/system/menu/list',
    method: 'get',
    params,
    signal
  });
}

/** 新增菜单 */
export function fetchCreateMenu(data: Api.System.MenuOperateParams) {
  return request<boolean>({
    url: '/system/menu',
    method: 'post',
    data
  });
}

/** 修改菜单 */
export function fetchUpdateMenu(data: Api.System.MenuOperateParams) {
  return request<boolean>({
    url: '/system/menu',
    method: 'put',
    data
  });
}

/** 删除菜单 */
export function fetchDeleteMenu(menuId: CommonType.IdType) {
  return request<boolean>({
    url: `/system/menu/${menuId}`,
    method: 'delete'
  });
}

/** 获取菜单树 */
export function fetchGetMenuTree(data: { p_type?: CommonType.IdType; menu_type_list?: CommonType.IdType[] }) {
  return request<Api.System.MenuTreeResponse>({
    url: '/GetMenuTrees',
    method: 'post',
    data
  });
}

/** 获取角色菜单权限 */
export function fetchGetMenuTrees(data: { p_type: CommonType.IdType; menu_type_list: CommonType.IdType[] }) {
  return request<Api.System.MenuTreeResponse>({
    url: `/GetMenuTrees`,
    method: 'post',
    data
  });
}

/** 获取菜单节点树 */
export function fetchGetMenuNodeTrees(data: { p_type: CommonType.IdType; menu_type_list?: CommonType.IdType[] }) {
  return request<Api.System.MenuNodeTreeResponse>({
    url: '/GetMenuTrees',
    method: 'post',
    data
  });
}

/** 获取菜单节点详情 */
export function fetchGetMenuNode(data: { id: CommonType.IdType }) {
  return request<Api.System.MenuNodeDetailResponse>({
    url: '/GetMenu',
    method: 'post',
    data
  });
}

/** 新增菜单节点 */
export function fetchCreateMenuNode(data: Api.System.MenuNodeOperateParams) {
  return request<boolean>({
    url: '/CreateMenu',
    method: 'post',
    data
  });
}

/** 修改菜单节点 */
export function fetchUpdateMenuNode(data: Api.System.MenuNodeOperateParams) {
  return request<boolean>({
    url: '/UpdateMenu',
    method: 'post',
    data
  });
}

/** 删除菜单节点 */
export function fetchDeleteMenuNode(data: { id_list: CommonType.IdType[] }) {
  return request<boolean>({
    url: '/DeleteMenu',
    method: 'post',
    data
  });
}

/** 获取租户套餐关联菜单 */
export function fetchGetTenantPackageMenuTreeSelect(packageId: CommonType.IdType) {
  return request<Api.System.TenantPackageMenuTreeSelect>({
    url: `/system/menu/tenantPackageMenuTreeselect/${packageId}`,
    method: 'get'
  });
}

/** 级联删除菜单 */
export function fetchCascadeDeleteMenu(menuIds: CommonType.IdType[]) {
  return request<boolean>({
    url: `/system/menu/cascade/${menuIds.join(',')}`,
    method: 'delete'
  });
}
