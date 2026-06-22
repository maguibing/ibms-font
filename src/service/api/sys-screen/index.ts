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
  return request<Api.Common.PaginatingQueryRecord<CommonType.IdNameRecord>>({
    url: '/ListProject',
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
