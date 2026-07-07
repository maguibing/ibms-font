import { request } from '@/service/request';

/** 获取资产列表 */
export function fetchGetAssetsList(data: CommonType.CommonListQueryParams) {
  return request<Api.Ledger.AssetsList>({
    url: '/ListAssets',
    method: 'post',
    data
  });
}

/** 删除资产 */
export function fetchDeleteAssets(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteAssets',
    method: 'post',
    data
  });
}

/** 获取资产详情 */
export function fetchGetAssets(data: { id: CommonType.IdType; options?: CommonType.CommonKeysOptions[] }) {
  return request<Api.Ledger.AssetsDetailData>({
    url: '/GetAssets',
    method: 'post',
    data
  });
}

/** 新增资产 */
export function fetchCreateAssets(data: Api.Ledger.AssetsOperateParams) {
  return request({
    url: '/CreateAssets',
    method: 'post',
    data
  });
}

/** 修改资产 */
export function fetchUpdateAssets(data: Api.Ledger.AssetsOperateParams) {
  return request({
    url: '/UpdateAssets',
    method: 'post',
    data
  });
}

/** 获取资产类型列表 */
export function fetchGetAssetsTypeList(data: CommonType.CommonListQueryParams) {
  return request<Api.Ledger.AssetsTypeList>({
    url: '/ListAssetsType',
    method: 'post',
    data
  });
}

/** 新增资产类型 */
export function fetchCreateAssetsType(data: Api.Ledger.AssetsTypeOperateParams) {
  return request({
    url: '/CreateAssetsType',
    method: 'post',
    data
  });
}

/** 修改资产类型 */
export function fetchUpdateAssetsType(data: Api.Ledger.AssetsTypeOperateParams) {
  return request({
    url: '/UpdateAssetsType',
    method: 'post',
    data
  });
}

/** 删除资产类型 */
export function fetchDeleteAssetsType(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteAssetsType',
    method: 'post',
    data
  });
}
