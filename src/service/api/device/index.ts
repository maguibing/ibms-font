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
export function fetchGetDevice(data: { id: CommonType.IdType; options?: CommonType.CommonKeysOptions[] }) {
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

/** 获取逻辑点位详情 */
export function fetchGetLogicPoint(data: Api.Device.LogicPointDetailParams) {
  return request<Api.Device.LogicPointDetailResponse>({
    url: '/GetLogicPoint',
    method: 'post',
    data
  });
}

/** 下发点位指令 */
export function fetchDevicePointCmd(data: Api.Device.DevicePointCmdParams) {
  return request({
    url: '/DevicePointCmd',
    method: 'post',
    data
  });
}

/** 获取设备点位历史统计 */
export function fetchGetDevicePointHistoryStat(data: Api.Device.DevicePointHistoryParams) {
  return request<Api.Device.DevicePointHistoryStatData>({
    url: '/GetDevicePointHistoryStat',
    method: 'post',
    data
  });
}

/** 获取设备点位历史趋势 */
export function fetchGetDevicePointHistoryTrend(data: Api.Device.DevicePointHistoryParams) {
  return request<Api.Device.DevicePointHistoryTrendData>({
    url: '/ListDevicePointHistoryTrend',
    method: 'post',
    data
  });
}

/** 获取逻辑点位树 */
export function fetchGetLogicPointTree(data?: {
  filter_not_storage?: boolean;
  filter_device_type?: boolean;
  data_type_list?: CommonType.DataType[];
}) {
  return request<Api.Device.LogicPointTreeResponse>({
    url: '/GetLogicPointTree',
    method: 'post',
    data
  });
}

/** 绑定设备点位 */
export function fetchBindDevicePoint(data: Api.Device.BindDevicePointParams) {
  return request({
    url: '/BindDevicePoint',
    method: 'post',
    data
  });
}

/** 获取物理点位列表 */
export function fetchGetPhysicalPointList(data?: CommonType.CommonListQueryParams) {
  return request<Api.Device.PhysicalPointList>({
    url: '/ListPhysicalPoint',
    method: 'post',
    data
  });
}

/** 获取物理点位详情 */
export function fetchGetPhysicalPoint(data: Api.Device.PhysicalPointDetailParams) {
  return request<Api.Device.PhysicalPointDetailResponse>({
    url: '/GetPhysicalPoint',
    method: 'post',
    data
  });
}

/** 新增物理点位 */
export function fetchCreatePhysicalPoint(data: Api.Device.CreatePhysicalPointParams) {
  return request({
    url: '/CreatePhysicalPoint',
    method: 'post',
    data
  });
}

/** 修改物理点位 */
export function fetchUpdatePhysicalPoint(data: Api.Device.UpdatePhysicalPointParams) {
  return request({
    url: '/UpdatePhysicalPoint',
    method: 'post',
    data
  });
}

/** 扫描物理设备 */
export function fetchScanPhysicalDevice(data: Api.Device.ScanPhysicalDeviceParams) {
  return request<Api.Device.ScanPhysicalDeviceResponse>({
    url: '/ScanPhysicalDevice',
    method: 'post',
    data
  });
}

/** 扫描物理设备点位 */
export function fetchScanPhysicalDevicePoint(data: Api.Device.ScanPhysicalDevicePointParams) {
  return request<Api.Device.ScanPhysicalDevicePointResponse>({
    url: '/ScanPhysicalDevicePoint',
    method: 'post',
    data
  });
}

/** 删除物理点位 */
export function fetchDeletePhysicalPoint(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeletePhysicalPoint',
    method: 'post',
    data
  });
}

/** 获取虚拟点列表 */
export function fetchGetVirtualPointList(data: CommonType.CommonListQueryParams) {
  return request<Api.Device.VirtualPointList>({
    url: '/ListVirtualPoint',
    method: 'post',
    data
  });
}

/** 获取虚拟点详情 */
export function fetchGetVirtualPoint(data: CommonType.CommonRequestOptions & { id: CommonType.IdType }) {
  return request<Api.Device.VirtualPointDetailResponse>({
    url: '/GetVirtualPoint',
    method: 'post',
    data
  });
}

/** 新增虚拟点 */
export function fetchCreateVirtualPoint(data: Api.Device.VirtualPointOperateParams) {
  return request({
    url: '/CreateVirtualPoint',
    method: 'post',
    data
  });
}

/** 修改虚拟点 */
export function fetchUpdateVirtualPoint(data: Api.Device.VirtualPointOperateParams) {
  return request({
    url: '/UpdateVirtualPoint',
    method: 'post',
    data
  });
}

/** 删除虚拟点 */
export function fetchDeleteVirtualPoint(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteVirtualPoint',
    method: 'post',
    data
  });
}

/** 校验虚拟点公式 */
export function fetchValidateVirtualPointFormula(data: Api.Device.ValidateVirtualPointFormulaParams) {
  return request<Api.Device.ValidateVirtualPointFormulaResponse>({
    url: '/ValidateVirtualPointFormula',
    method: 'post',
    data
  });
}
