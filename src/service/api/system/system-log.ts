import { request } from '@/service/request';

/** 获取系统操作日志列表 */
export function fetchGetSystemLogList(data: CommonType.CommonListQueryParams) {
  return request<Api.System.SystemOperationLogList>({
    url: '/ListSysLog',
    method: 'post',
    data
  });
}

/** 获取设备操作日志列表 */
export function fetchGetDeviceOperationLogList(data: CommonType.CommonListQueryParams) {
  return request<Api.System.DeviceOperationLogList>({
    url: '/ListDevicePointCmdLog',
    method: 'post',
    data
  });
}
