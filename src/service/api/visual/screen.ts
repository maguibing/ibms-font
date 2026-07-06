import { request } from '@/service/request';

/** 获取项目大屏列表 */
export function fetchGetProjectSysScreenList(data: CommonType.CommonListQueryParams) {
  return request<Api.Visual.ProjectSysScreenList>({
    url: '/ListProjectSysScreen',
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
