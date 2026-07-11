import { request } from '@/service/request';

/** 获取设备列表 */
export function fetchGetDeviceList(data?: CommonType.CommonListQueryParams) {
  return request<Api.Device.DeviceList>({
    url: '/ListDevice',
    method: 'post',
    data
  });
}

/** 获取设备详情 */
export function fetchGetDevice(data: { id: CommonType.IdType }) {
  return request<Api.Device.DeviceDetailResponse>({
    url: '/GetDevice',
    method: 'post',
    data
  });
}

/** 创建设备 */
export function fetchCreateDevice(data: Api.Device.CreateDeviceParams) {
  return request({
    url: '/CreateDevice',
    method: 'post',
    data
  });
}

/** 删除设备 */
export function fetchDeleteDevice(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteDevice',
    method: 'post',
    data
  });
}

/** 修改设备 */
export function fetchUpdateDevice(data: Api.Device.UpdateDeviceParams) {
  return request({
    url: '/UpdateDevice',
    method: 'post',
    data
  });
}

/** 获取设备类型列表 */
export function fetchGetDeviceTypeList(data: CommonType.CommonListQueryParams) {
  return request<Api.Device.DeviceTypeList>({
    url: '/ListDeviceType',
    method: 'post',
    data
  });
}

/** 获取设备类型详情 */
export function fetchGetDeviceType(data: { id: CommonType.IdType }) {
  return request<Api.Device.DeviceTypeDetailResponse>({
    url: '/GetDeviceType',
    method: 'post',
    data
  });
}

/** 新增设备类型 */
export function fetchCreateDeviceType(data: Api.Device.DeviceTypeOperateParams) {
  return request({
    url: '/CreateDeviceType',
    method: 'post',
    data
  });
}

/** 修改设备类型 */
export function fetchUpdateDeviceType(data: Api.Device.UpdateDeviceTypeParams) {
  return request({
    url: '/UpdateDeviceType',
    method: 'post',
    data
  });
}

/** 删除设备类型 */
export function fetchDeleteDeviceType(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteDeviceType',
    method: 'post',
    data
  });
}

/** 获取设备类型点位列表 */
export function fetchGetDeviceTypePointList(data: CommonType.CommonListQueryParams) {
  return request<Api.Device.DeviceTypePointList>({
    url: '/ListDeviceTypePoint',
    method: 'post',
    data
  });
}

/** 获取设备类型点位详情 */
export function fetchGetDeviceTypePoint(data: { id: CommonType.IdType }) {
  return request<Api.Device.DeviceTypePointDetailResponse>({
    url: '/GetDeviceTypePoint',
    method: 'post',
    data
  });
}

/** 新增设备类型点位 */
export function fetchCreateDeviceTypePoint(data: Api.Device.DeviceTypePointOperateParams) {
  return request({
    url: '/CreateDeviceTypePoint',
    method: 'post',
    data
  });
}

/** 修改设备类型点位 */
export function fetchUpdateDeviceTypePoint(data: Api.Device.DeviceTypePointOperateParams) {
  return request({
    url: '/UpdateDeviceTypePoint',
    method: 'post',
    data
  });
}

/** 删除设备类型点位 */
export function fetchDeleteDeviceTypePoint(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteDeviceTypePoint',
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
