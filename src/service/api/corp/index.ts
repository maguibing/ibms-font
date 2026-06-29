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

/** 获取版本列表 */
export function fetchGetVersionList(data: Api.System.CorpProjectVersionListParams) {
  return request<Api.System.CorpProjectVersionList>({
    url: '/ListVersion',
    method: 'post',
    data
  });
}

/** 获取版本详情 */
export function fetchGetVersion(data: Api.System.GetVersionParams) {
  return request<Api.System.GetVersionResponse>({
    url: '/GetVersion',
    method: 'post',
    data
  });
}

/** 续费版本 */
export function fetchRenewalVersion(data: Api.System.RenewalVersionParams) {
  return request({
    url: '/RenewalVersion',
    method: 'post',
    data
  });
}

/** 新增版本 */
export function fetchCreateVersion(data: Api.System.CreateVersionParams) {
  return request({
    url: '/CreateVersion',
    method: 'post',
    data
  });
}

/** 修改版本 */
export function fetchUpdateVersion(data: Api.System.UpdateVersionParams) {
  return request({
    url: '/UpdateVersion',
    method: 'post',
    data
  });
}

/** 删除版本 */
export function fetchDeleteVersion(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteVersion',
    method: 'post',
    data
  });
}

/** 绑定已有版本 */
export function fetchBindVersionCorp(data: Api.System.BindVersionCorpParams) {
  return request({
    url: '/BindVersionCorp',
    method: 'post',
    data
  });
}

/** 校验手机号 */
export function fetchCheckPhone(data: { phone: string; p_type?: number }) {
  return request<{ is_exist?: boolean }>({
    url: '/CheckPhone',
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
