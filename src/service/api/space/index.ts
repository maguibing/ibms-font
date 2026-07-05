import { request } from '@/service/request';

/** 获取空间类型列表 */
export function fetchGetSpaceTypeList(data?: CommonType.CommonListQueryParams) {
  return request<Api.Space.SpaceTypeList>({
    url: '/ListSpaceType',
    method: 'post',
    data
  });
}

/** 新增空间类型 */
export function fetchCreateSpaceType(data: Api.Space.SpaceTypeOperateParams) {
  return request({
    url: '/CreateSpaceType',
    method: 'post',
    data
  });
}

/** 修改空间类型 */
export function fetchUpdateSpaceType(data: Api.Space.SpaceTypeOperateParams) {
  return request({
    url: '/UpdateSpaceType',
    method: 'post',
    data
  });
}

/** 删除空间类型 */
export function fetchDeleteSpaceType(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteSpaceType',
    method: 'post',
    data
  });
}

/** 获取空间树 */
export function fetchGetSpaceTrees(data?: CommonType.CommonListQueryParams) {
  return request<Api.Space.SpaceTreeResponse>({
    url: '/GetSpaceTrees',
    method: 'post',
    data
  });
}

/** 获取空间详情 */
export function fetchGetSpace(data: { id: CommonType.IdType }) {
  return request<Api.Space.SpaceDetailResponse>({
    url: '/GetSpace',
    method: 'post',
    data
  });
}

/** 新增空间 */
export function fetchCreateSpace(data: Api.Space.CreateSpaceParams) {
  return request({
    url: '/CreateSpace',
    method: 'post',
    data
  });
}

/** 修改空间 */
export function fetchUpdateSpace(data: Api.Space.UpdateSpaceParams) {
  return request({
    url: '/UpdateSpace',
    method: 'post',
    data
  });
}

/** 删除空间 */
export function fetchDeleteSpace(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteSpace',
    method: 'post',
    data
  });
}
