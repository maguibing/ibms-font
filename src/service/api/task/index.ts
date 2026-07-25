import { request } from '@/service/request';

/** 获取任务日志列表 */
export function fetchGetTaskLogList(data: CommonType.CommonListQueryParams) {
  return request<Api.Task.TaskLogList>({
    url: '/ListTaskLog',
    method: 'post',
    data
  });
}

/** 获取任务日志详情 */
export function fetchGetTaskLog(data: { id: CommonType.IdType; options?: CommonType.CommonKeysOptions[] }) {
  return request<Api.Task.TaskLogDetailData>({
    url: '/GetTaskLog',
    method: 'post',
    data
  });
}
