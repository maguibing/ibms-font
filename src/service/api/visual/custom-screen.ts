import { request } from '@/service/request';

/** 获取自定义大屏列表 */
export function fetchGetCustomScreenList(data: CommonType.CommonListQueryParams) {
  return request<Api.Visual.CustomScreenList>({
    url: '/ListCustomScreen',
    method: 'post',
    data
  });
}

/** 新增自定义大屏 */
export function fetchCreateCustomScreen(data: Api.Visual.CustomScreenOperateParams) {
  return request({
    url: '/CreateCustomScreen',
    method: 'post',
    data
  });
}

/** 修改自定义大屏 */
export function fetchUpdateCustomScreen(data: Api.Visual.CustomScreenOperateParams) {
  return request({
    url: '/UpdateCustomScreen',
    method: 'post',
    data
  });
}

/** 克隆自定义大屏 */
export function fetchCloneCustomScreen(data: Api.Visual.CustomScreenOperateParams) {
  return request({
    url: '/CloneCustomScreen',
    method: 'post',
    data
  });
}

/** 删除自定义大屏 */
export function fetchDeleteCustomScreen(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteCustomScreen',
    method: 'post',
    data
  });
}
