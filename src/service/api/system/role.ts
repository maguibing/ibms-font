import { request } from '@/service/request';

/** 获取角色信息列表 */
export function fetchGetRoleList(data?: CommonType.CommonListQueryParams) {
  return request<Api.System.RoleList>({
    url: '/ListRole',
    method: 'post',
    data
  });
}

/** 新增角色信息 */
export function fetchCreateRole(data: Api.System.RoleOperateParams) {
  return request<boolean>({
    url: '/CreateRole',
    method: 'post',
    data
  });
}

/** 修改角色信息 */
export function fetchUpdateRole(data: Api.System.RoleOperateParams) {
  return request<boolean>({
    url: '/UpdateRole',
    method: 'post',
    data
  });
}

/** 分配菜单权限 */
export function fetchAssignPermAuth(data: { role_id: CommonType.IdType; menu_id_list: CommonType.IdType[] }) {
  return request<boolean>({
    url: '/AssignPermAuth',
    method: 'post',
    data
  });
}

/** 批量删除角色信息 */
export function fetchBatchDeleteRole(data: { id_list: CommonType.IdType[] }) {
  return request<boolean>({
    url: `/DeleteRole`,
    method: 'post',
    data
  });
}

/** 获取角色选择框列表 */
export function fetchGetRoleSelect(data?: CommonType.CommonListOptions) {
  return request<Api.System.Role[]>({
    url: '/ListRole',
    method: 'post',
    data
  });
}

/** 获取菜单树 */
export function fetchGetMenuTreeSelect() {
  return request<Api.System.MenuList>({
    url: 'system/menu/treeselect',
    method: 'get'
  });
}
