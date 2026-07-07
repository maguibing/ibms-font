import { request } from '@/service/request';

/** 获取项目大屏列表 */
export function fetchGetProjectSysScreenList(data: CommonType.CommonListQueryParams) {
  return request<Api.Visual.ProjectSysScreenList>({
    url: '/ListProjectSysScreen',
    method: 'post',
    data
  });
}

/** 获取项目大屏标签列表 */
export function fetchGetProjectSysScreenTagList(data: CommonType.CommonListQueryParams) {
  return request<Api.Visual.ProjectSysScreenTagList>({
    url: '/ListProjectSysScreenTag',
    method: 'post',
    data
  });
}

/** 新增项目大屏标签 */
export function fetchCreateProjectSysScreenTag(data: Api.Visual.ProjectSysScreenTagOperateParams) {
  return request({
    url: '/CreateProjectSysScreenTag',
    method: 'post',
    data
  });
}

/** 更新项目大屏标签 */
export function fetchUpdateProjectSysScreenTag(data: Api.Visual.ProjectSysScreenTagOperateParams) {
  return request({
    url: '/UpdateProjectSysScreenTag',
    method: 'post',
    data
  });
}

/** 删除项目大屏标签 */
export function fetchDeleteProjectSysScreenTag(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteProjectSysScreenTag',
    method: 'post',
    data
  });
}

/** 获取项目大屏标签点位列表 */
export function fetchGetProjectSysScreenTagPointList(data: CommonType.CommonListQueryParams) {
  return request<Api.Visual.ProjectSysScreenTagPointList>({
    url: '/ListProjectSysScreenTagPoint',
    method: 'post',
    data
  });
}

/** 获取项目大屏标签点位详情 */
export function fetchGetProjectSysScreenTagPoint(data: Api.Visual.GetProjectSysScreenTagPointParams) {
  return request<Api.Visual.ProjectSysScreenTagPointDetailResponse>({
    url: '/GetProjectSysScreenTagPoint',
    method: 'post',
    data
  });
}

/** 新增项目大屏标签点位 */
export function fetchCreateProjectSysScreenTagPoint(data: Api.Visual.ProjectSysScreenTagPointOperateParams) {
  return request({
    url: '/CreateProjectSysScreenTagPoint',
    method: 'post',
    data
  });
}

/** 更新项目大屏标签点位 */
export function fetchUpdateProjectSysScreenTagPoint(data: Api.Visual.ProjectSysScreenTagPointOperateParams) {
  return request({
    url: '/UpdateProjectSysScreenTagPoint',
    method: 'post',
    data
  });
}

/** 删除项目大屏标签点位 */
export function fetchDeleteProjectSysScreenTagPoint(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteProjectSysScreenTagPoint',
    method: 'post',
    data
  });
}

/** 更新项目大屏 */
export function fetchUpdateProjectSysScreen(data: Api.Visual.ProjectSysScreenUpdateParams) {
  return request({
    url: '/UpdateProjectSysScreen',
    method: 'post',
    data
  });
}
