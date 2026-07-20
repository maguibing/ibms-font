import { request } from '@/service/request';

/** 新增工单 */
export function fetchCreateWorkorder(data: Api.Workorder.CreateWorkorderParams) {
  return request({
    url: '/CreateWorkorder',
    method: 'post',
    data
  });
}

/** 获取工单详情 */
export function fetchGetWorkorder(data: Api.Workorder.GetWorkorderParams) {
  return request<Api.Workorder.WorkorderDetailResponse>({
    url: '/GetWorkorder',
    method: 'post',
    headers: {
      repeatSubmit: false
    },
    data
  });
}

/** 获取工单列表 */
export function fetchGetWorkorderList(data: CommonType.CommonListQueryParams) {
  return request<Api.Workorder.WorkorderList>({
    url: '/ListWorkorder',
    method: 'post',
    data
  });
}

/** 更新工单 */
export function fetchUpdateWorkorder(data: Api.Workorder.UpdateWorkorderParams) {
  return request({
    url: '/UpdateWorkorder',
    method: 'post',
    data
  });
}

/** 获取工单状态统计 */
export function fetchGetWorkorderStat() {
  return request<Api.Workorder.WorkorderStat>({
    url: '/GetWorkorderStat',
    method: 'post'
  });
}

/** 删除工单 */
export function fetchDeleteWorkorder(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteWorkorder',
    method: 'post',
    data
  });
}
