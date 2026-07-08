import { request } from '@/service/request';

/** 获取边缘设备列表 */
export function fetchGetGatewayList(data: CommonType.CommonListQueryParams) {
  return request<Api.Gateway.GatewayList>({
    url: '/ListGateway',
    method: 'post',
    data
  });
}

/** 删除边缘设备 */
export function fetchDeleteGateway(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteGateway',
    method: 'post',
    data
  });
}
