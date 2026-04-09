import { request } from '@/service/request';

/** 获取用户信息列表 */
export function fetchGetUserList(data?: CommonType.CommonListQueryParams) {
  return request<Api.System.UserList>({
    url: '/ListUser',
    method: 'post',
    data
  });
}
/** 获取部门用户信息列表 */
export function fetchGetDeptUserList(deptId: CommonType.IdType) {
  return request<Api.System.User[]>({
    url: `/system/user/list/dept/${deptId}`,
    method: 'get'
  });
}

/** 新增用户信息 */
export function fetchCreateUser(data: { rsa_pwd: string; user: Api.System.UserOperateParams }) {
  return request<boolean>({
    url: '/CreateUser',
    method: 'post',
    data
  });
}

/** 获取用户选择框列表 */
export function fetchGetUserSelect() {
  return request<Api.System.User[]>({
    url: '/system/user/optionselect',
    method: 'get'
  });
}

/** 批量删除用户信息 */
export function fetchBatchDeleteUser(data: { id_list: CommonType.IdType[] }) {
  return request({
    url: `/DeleteUser`,
    method: 'post',
    data
  });
}

/** 根据用户编号获取详细信息 */
export function fetchGetUserInfo(data: { id: CommonType.IdType; options?: CommonType.CommonKeysOptions[] }) {
  return request<Api.System.User>({
    url: `/GetUser`,
    method: 'post',
    data
  });
}

/** 获取部门树列表 */
export function fetchGetDeptTree(data: CommonType.CommonRequestOptions) {
  return request<Api.Common.DeptTreeResponse>({
    url: '/GetDeptTrees',
    method: 'post',
    data
  });
}

/** 获取用户手机号 */
export function fetchGetPhone(data: Api.System.UserPhoneParams) {
  return request<Api.System.UserPhone>({
    url: '/GetPhone',
    method: 'post',
    data
  });
}

/** 重置用户密码 */
export function fetchResetPassword(data: Api.System.UserPhoneParams) {
  return request<boolean>({
    url: '/ResetPassword',
    method: 'post',
    data
  });
}

/** 根据用户编号获取授权角色 */
export function fetchGetAuthRole(userId: CommonType.IdType) {
  return request<Api.System.AuthRole>({
    url: `/system/user/authRole/${userId}`,
    method: 'get'
  });
}

/** 用户授权角色 */
export function fetchAuthUserRole(userId: CommonType.IdType, roleIds: CommonType.IdType[]) {
  return request<boolean>({
    url: '/system/user/authRole',
    method: 'put',
    data: { userId, roleIds }
  });
}

/** 修改用户基本信息 */
export function fetchUpdateUser(data: Api.System.UserOperateParams) {
  return request<boolean>({
    url: '/UpdateUser',
    method: 'post',
    data
  });
}

/** 修改用户密码 */
export function fetchUpdatePassword(data: Api.System.UserPasswordOperateParams) {
  return request<boolean>({
    url: '/UpdatePassword',
    method: 'post',
    data
  });
}

/** 修改用户头像 */
export function fetchUpdateUserAvatar(formData: FormData) {
  return request<boolean>({
    url: '/system/user/profile/avatar',
    method: 'post',
    data: formData
  });
}
