import { request } from '@/service/request';

/** 获取大屏列表 */
export function fetchGetSysScreenList(data: CommonType.CommonListQueryParams) {
  return request<Api.System.SysScreenList>({
    url: '/ListSysScreen',
    method: 'post',
    data
  });
}
