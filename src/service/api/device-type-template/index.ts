import { request } from '@/service/request';

/** 获取设备类型模板列表 */
export function fetchGetDeviceTypeTemplateList(data: CommonType.CommonListQueryParams) {
  return request<Api.System.DeviceTypeTemplateList>({
    url: '/ListDeviceTypeTemplate',
    method: 'post',
    data
  });
}

/** 新增设备类型模板 */
export function fetchCreateDeviceTypeTemplate(data: Api.System.DeviceTypeTemplateOperateParams) {
  return request({
    url: '/CreateDeviceTypeTemplate',
    method: 'post',
    data
  });
}

/** 修改设备类型模板 */
export function fetchUpdateDeviceTypeTemplate(data: Api.System.DeviceTypeTemplateOperateParams) {
  return request({
    url: '/UpdateDeviceTypeTemplate',
    method: 'post',
    data
  });
}

/** 删除设备类型模板 */
export function fetchDeleteDeviceTypeTemplate(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteDeviceTypeTemplate',
    method: 'post',
    data
  });
}

/** 获取设备类型模板点位列表 */
export function fetchGetDeviceTypeTemplatePointList(data: CommonType.CommonListQueryParams) {
  return request<Api.System.DeviceTypeTemplatePointList>({
    url: '/ListDeviceTypeTemplatePoint',
    method: 'post',
    data
  });
}

/** 获取设备类型模板点位详情 */
export function fetchGetDeviceTypeTemplatePoint(data: { id: CommonType.IdType }) {
  return request<Api.System.DeviceTypeTemplatePointDetailResponse>({
    url: '/GetDeviceTypeTemplatePoint',
    method: 'post',
    data
  });
}

/** 新增设备类型模板点位 */
export function fetchCreateDeviceTypeTemplatePoint(data: Api.System.DeviceTypeTemplatePointOperateParams) {
  return request({
    url: '/CreateDeviceTypeTemplatePoint',
    method: 'post',
    data
  });
}

/** 修改设备类型模板点位 */
export function fetchUpdateDeviceTypeTemplatePoint(data: Api.System.DeviceTypeTemplatePointOperateParams) {
  return request({
    url: '/UpdateDeviceTypeTemplatePoint',
    method: 'post',
    data
  });
}

/** 删除设备类型模板点位 */
export function fetchDeleteDeviceTypeTemplatePoint(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteDeviceTypeTemplatePoint',
    method: 'post',
    data
  });
}

/** 获取设备类型模板分类列表 */
export function fetchGetDeviceTypeTemplateCategoryList(data: CommonType.CommonListQueryParams) {
  return request<Api.System.DeviceTypeTemplateCategoryList>({
    url: '/ListDeviceTypeTemplateCategory',
    method: 'post',
    data
  });
}

/** 新增设备类型模板分类 */
export function fetchCreateDeviceTypeTemplateCategory(data: Api.System.DeviceTypeTemplateCategoryOperateParams) {
  return request({
    url: '/CreateDeviceTypeTemplateCategory',
    method: 'post',
    data
  });
}

/** 修改设备类型模板分类 */
export function fetchUpdateDeviceTypeTemplateCategory(data: Api.System.DeviceTypeTemplateCategoryOperateParams) {
  return request({
    url: '/UpdateDeviceTypeTemplateCategory',
    method: 'post',
    data
  });
}

/** 删除设备类型模板分类 */
export function fetchDeleteDeviceTypeTemplateCategory(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteDeviceTypeTemplateCategory',
    method: 'post',
    data
  });
}
