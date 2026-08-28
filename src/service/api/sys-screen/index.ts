import { request } from '@/service/request';

/** 获取大屏列表 */
export function fetchGetSysScreenList(data: CommonType.CommonListQueryParams) {
  return request<Api.System.SysScreenList>({
    url: '/ListSysScreen',
    method: 'post',
    data
  });
}

/** 获取大屏详情 */
export function fetchGetSysScreen(data: { id: CommonType.IdType; options?: CommonType.CommonKeysOptions[] }) {
  return request<Api.System.SysScreenDetailResponse>({
    url: '/GetSysScreen',
    method: 'post',
    data
  });
}

/** 获取项目列表 */
export function fetchGetProjectList(data: CommonType.CommonListQueryParams) {
  return request<Api.System.ProjectList>({
    url: '/ListProject',
    method: 'post',
    data
  });
}

/** 获取项目成员列表 */
export function fetchGetProjectUserList(data: Api.System.ProjectUserListParams) {
  return request<Api.System.ProjectUserList>({
    url: '/ListProjectUser',
    method: 'post',
    data
  });
}

/** 修改项目成员 */
export function fetchUpdateProjectUser(data: Api.System.ProjectUserUpdateParams) {
  return request({
    url: '/UpdateProjectUser',
    method: 'post',
    data
  });
}

/** 创建项目 */
export function fetchCreateProject(data: Api.System.ProjectOperateParams) {
  return request({
    url: '/CreateProject',
    method: 'post',
    data
  });
}

/** 修改项目 */
export function fetchUpdateProject(data: Api.System.ProjectUpdateParams) {
  return request({
    url: '/UpdateProject',
    method: 'post',
    data
  });
}

/** 修改项目 Logo */
export function fetchUpdateProjectLogo(data: Api.System.ProjectLogoUpdateParams) {
  return request({
    url: '/UpdateProjectLogo',
    method: 'post',
    data
  });
}

/** 删除项目 */
export function fetchDeleteProject(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteProject',
    method: 'post',
    data
  });
}

/** 创建大屏 */
export function fetchCreateSysScreen(data: Api.System.SysScreenOperateParams) {
  return request({
    url: '/CreateSysScreen',
    method: 'post',
    data
  });
}

/** 修改大屏 */
export function fetchUpdateSysScreen(data: Api.System.SysScreenUpdateParams) {
  return request({
    url: '/UpdateSysScreen',
    method: 'post',
    data
  });
}

/** 删除大屏 */
export function fetchDeleteSysScreen(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteSysScreen',
    method: 'post',
    data
  });
}
