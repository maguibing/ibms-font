import { request } from '@/service/request';

/** 获取集成商列表 */
export function fetchGetCorpList(data: CommonType.CommonListQueryParams) {
  return request<Api.System.CorpList>({
    url: '/ListCorp',
    method: 'post',
    data
  });
}

/** 获取集成商详情 */
export function fetchGetCorp(data: { id: CommonType.IdType; options?: CommonType.CommonKeysOptions[] }) {
  return request<Api.System.CorpDetail>({
    url: '/GetCorp',
    method: 'post',
    data
  });
}

/** 新增集成商 */
export function fetchAddCorp(data: Api.System.CorpOperateParams) {
  return request({
    url: '/CreateCorp',
    method: 'post',
    data
  });
}

/** 修改集成商 */
export function fetchUpdateCorp(data: Api.System.CorpOperateParams) {
  return request({
    url: '/UpdateCorp',
    method: 'post',
    data
  });
}

/** 修改集成商审核状态 */
export function fetchUpdateCorpAuditStatus(data: Api.System.CorpAuditStatusParams) {
  return request({
    url: '/UpdateCorpAuditStatus',
    method: 'post',
    data
  });
}

/** 修改集成商启停状态 */
export function fetchUpdateCorpStatus(data: Api.System.CorpStatusParams) {
  return request({
    url: '/UpdateCorpStatus',
    method: 'post',
    data
  });
}

/** 删除集成商 */
export function fetchDeleteCorp(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteCorp',
    method: 'post',
    data
  });
}
