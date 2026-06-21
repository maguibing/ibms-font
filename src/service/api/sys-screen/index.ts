import { request } from '@/service/request';

/** 获取大屏列表 */
export function fetchGetSysScreenList(data: CommonType.CommonListQueryParams) {
  return request<Api.System.SysScreenList>({
    url: '/ListSysScreen',
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
