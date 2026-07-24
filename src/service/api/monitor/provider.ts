import { request } from '@/service/request';

/** 获取视频厂商列表 */
export function fetchGetProviderList(data: CommonType.CommonListQueryParams) {
  return request<Api.Monitor.ProviderList>({
    url: '/ListProvider',
    method: 'post',
    data
  });
}

/** 新增视频厂商 */
export function fetchCreateProvider(data: Api.Monitor.ProviderOperateParams) {
  return request({
    url: '/CreateProvider',
    method: 'post',
    data
  });
}

/** 编辑视频厂商 */
export function fetchUpdateProvider(data: Api.Monitor.ProviderOperateParams) {
  return request({
    url: '/UpdateProvider',
    method: 'post',
    data
  });
}

/** 删除视频厂商 */
export function fetchDeleteProvider(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteProvider',
    method: 'post',
    data
  });
}
