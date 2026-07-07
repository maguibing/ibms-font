import { request } from '@/service/request';

/** 获取组态列表 */
export function fetchGetConfigurationList(data: CommonType.CommonListQueryParams) {
  return request<Api.Visual.ConfigurationList>({
    url: '/ListConfiguration',
    method: 'post',
    data
  });
}

/** 新增组态 */
export function fetchCreateConfiguration(data: Api.Visual.ConfigurationOperateParams) {
  return request({
    url: '/CreateConfiguration',
    method: 'post',
    data
  });
}

/** 修改组态 */
export function fetchUpdateConfiguration(data: Api.Visual.ConfigurationOperateParams) {
  return request({
    url: '/UpdateConfiguration',
    method: 'post',
    data
  });
}

/** 删除组态 */
export function fetchDeleteConfiguration(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteConfiguration',
    method: 'post',
    data
  });
}

/** 克隆组态 */
export function fetchCloneConfiguration(data: Api.Visual.ConfigurationCloneParams) {
  return request({
    url: '/CloneConfiguration',
    method: 'post',
    data
  });
}

/** 获取配置分类树 */
export function fetchGetConfigurationCategoryTrees() {
  return request<Api.Visual.ConfigurationCategoryTreeResponse>({
    url: '/GetConfigurationCategoryTrees',
    method: 'post'
  });
}

/** 新增配置分类 */
export function fetchCreateConfigurationCategory(data: Api.Visual.ConfigurationCategoryOperateParams) {
  return request({
    url: '/CreateConfigurationCategory',
    method: 'post',
    data
  });
}

/** 修改配置分类 */
export function fetchUpdateConfigurationCategory(data: Api.Visual.ConfigurationCategoryOperateParams) {
  return request({
    url: '/UpdateConfigurationCategory',
    method: 'post',
    data
  });
}

/** 删除配置分类 */
export function fetchDeleteConfigurationCategory(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteConfigurationCategory',
    method: 'post',
    data
  });
}
