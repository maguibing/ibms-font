import { request } from '@/service/request';

/** 获取设备列表 */
export function fetchGetDeviceList(data?: CommonType.CommonListQueryParams) {
  return request<Api.Device.DeviceList>({
    url: '/ListDevice',
    method: 'post',
    data
  });
}

/** 获取逻辑点位列表 */
export function fetchGetLogicPointList(data?: CommonType.CommonListQueryParams) {
  return request<Api.Device.LogicPointList>({
    url: '/ListLogicPoint',
    method: 'post',
    data
  });
}
