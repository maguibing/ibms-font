import { request } from '@/service/request';

/** 获取设备列表 */
export function fetchGetDeviceList(data?: CommonType.CommonListQueryParams) {
  return request<Api.Device.DeviceList>({
    url: '/ListDevice',
    method: 'post',
    data
  });
}

/** 获取设备分组树 */
export function fetchGetDeviceGroupTrees(data?: CommonType.CommonListQueryParams) {
  return request<Api.Device.DeviceGroupTreeResponse>({
    url: '/GetDeviceGroupTree',
    method: 'post',
    data
  });
}

/** 获取设备分组详情 */
export function fetchGetDeviceGroup(data: { id: CommonType.IdType }) {
  return request<Api.Device.DeviceGroupDetailResponse>({
    url: '/GetDeviceGroup',
    method: 'post',
    data
  });
}

/** 新增设备分组 */
export function fetchCreateDeviceGroup(data: Api.Device.CreateDeviceGroupParams) {
  return request({
    url: '/CreateDeviceGroup',
    method: 'post',
    data
  });
}

/** 修改设备分组 */
export function fetchUpdateDeviceGroup(data: Api.Device.UpdateDeviceGroupParams) {
  return request({
    url: '/UpdateDeviceGroup',
    method: 'post',
    data
  });
}

/** 删除设备分组 */
export function fetchDeleteDeviceGroup(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteDeviceGroup',
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
