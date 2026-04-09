import { request } from '@/service/request';

/** 获取行业列表 */
export function fetchGetIndustryList(data: CommonType.CommonListQueryParams) {
  return request<Api.System.IndustryList>({
    url: '/ListIndustry',
    method: 'post',
    data
  });
}

/** 新增行业 */
export function fetchAddIndustry(data: Api.System.IndustryOperateParams) {
  return request({
    url: '/CreateIndustry',
    method: 'post',
    data
  });
}

/** 修改行业 */
export function fetchUpdateIndustry(data: Api.System.IndustryOperateParams) {
  return request({
    url: '/UpdateIndustry',
    method: 'post',
    data
  });
}

/** 删除行业 */
export function fetchDeleteIndustry(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteIndustry',
    method: 'post',
    data
  });
}
