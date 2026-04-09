import { request } from '@/service/request';

/** 获取部门列表 */
export function fetchGetDeptList(data?: CommonType.CommonRequestOptions) {
  return request<Api.Common.DeptTreeResponse>({
    url: '/GetDeptTrees',
    method: 'post',
    data
  });
}

/** 新增部门 */
export function fetchCreateDept(data: Api.System.DeptOperateParams) {
  return request<boolean>({
    url: '/CreateDept',
    method: 'post',
    data
  });
}

/** 修改部门 */
export function fetchUpdateDept(data: Api.System.DeptOperateParams) {
  return request<boolean>({
    url: '/UpdateDept',
    method: 'put',
    data
  });
}

/** 批量删除部门 */
export function fetchBatchDeleteDept(data: { id_list: CommonType.IdType[] }) {
  return request<boolean>({
    url: `/DeleteDept`,
    method: 'post',
    data
  });
}

/** 获取部门选择框列表 */
export function fetchGetDeptSelect() {
  return request<Api.System.Dept[]>({
    url: '/system/dept/optionselect',
    method: 'get'
  });
}
