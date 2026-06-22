import { request } from '@/service/request';

/** 获取设备类型模板列表 */
export function fetchGetDeviceTypeTemplateList(data: CommonType.CommonListQueryParams) {
  return request<Api.System.DeviceTypeTemplateList>({
    url: '/ListDeviceTypeTemplate',
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
