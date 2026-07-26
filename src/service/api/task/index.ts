import { request } from '@/service/request';

/** 获取任务列表 */
export function fetchGetTaskList(data: CommonType.CommonListQueryParams) {
  return request<Api.Task.TaskList>({
    url: '/ListTask',
    method: 'post',
    data
  });
}

/** 获取任务详情 */
export function fetchGetTask(data: { id: CommonType.IdType; options?: CommonType.CommonKeysOptions[] }) {
  return request<Api.Task.TaskDetailData>({
    url: '/GetTask',
    method: 'post',
    data
  });
}

/** 创建任务 */
export function fetchCreateTask(data: Api.Task.TaskOperateParams) {
  return request({
    url: '/CreateTask',
    method: 'post',
    data
  });
}

/** 修改任务 */
export function fetchUpdateTask(data: Api.Task.TaskUpdateParams) {
  return request({
    url: '/UpdateTask',
    method: 'post',
    data
  });
}

/** 执行任务 */
export function fetchExecuteTask(data: Api.Common.CommonIdList) {
  return request({
    url: '/ExecuteTask',
    method: 'post',
    data
  });
}

/** 删除任务 */
export function fetchDeleteTask(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteTask',
    method: 'post',
    data
  });
}

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
