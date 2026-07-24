import { request } from '@/service/request';

/** 获取设备点位能耗列表 */
export function fetchGetDevicePointEnergyList(data: Api.Energy.DevicePointEnergyListParams) {
  return request<Api.Energy.DevicePointEnergyList>({
    url: '/ListDevicePointEnergy',
    method: 'post',
    data
  });
}
