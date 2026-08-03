import { request } from '@/service/request';

/** 获取边缘设备列表 */
export function fetchGetGatewayList(data: CommonType.CommonListQueryParams) {
  return request<Api.Gateway.GatewayList>({
    url: '/ListGateway',
    method: 'post',
    data
  });
}

/** 获取边缘设备详情 */
export function fetchGetGateway(data: { id: CommonType.IdType; options?: CommonType.CommonKeysOptions[] }) {
  return request<Api.Gateway.GatewayDetailResponse>({
    url: '/GetGateway',
    method: 'post',
    data
  });
}

/** 新增边缘设备 */
export function fetchCreateGateway(data: Api.Gateway.GatewayCreateParams) {
  return request({
    url: '/CreateGateway',
    method: 'post',
    data
  });
}

/** 修改边缘设备 */
export function fetchUpdateGateway(data: Api.Gateway.GatewayUpdateParams) {
  return request({
    url: '/UpdateGateway',
    method: 'post',
    data
  });
}

/** 获取物联网网关网卡列表 */
export function fetchListIothubNetworkInterface() {
  return request<Api.Gateway.IothubNetworkInterfaceResponse>({
    url: '/ListIothubNetworkInterface',
    method: 'post'
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
