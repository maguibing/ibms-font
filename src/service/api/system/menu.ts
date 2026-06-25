import { request } from '@/service/request';

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
