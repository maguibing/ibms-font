import { request } from '@/service/request';

/** 获取监控设备列表 */
export function fetchGetMonitorList(data: CommonType.CommonListQueryParams) {
  return request<Api.Monitor.MonitorList>({
    url: '/ListMonitor',
    method: 'post',
    data
  });
}

/** 获取监控设备详情 */
export function fetchGetMonitor(data: { id: CommonType.IdType }) {
  return request<Api.Monitor.MonitorDetailResponse>({
    url: '/GetMonitor',
    method: 'post',
    data
  });
}

/** 新增监控设备 */
export function fetchCreateMonitor(data: Api.Monitor.MonitorCreateParams) {
  return request({
    url: '/CreateMonitor',
    method: 'post',
    data,
    headers: {
      repeatSubmit: false
    }
  });
}

/** 编辑监控设备 */
export function fetchUpdateMonitor(data: Api.Monitor.MonitorOperateParams) {
  return request({
    url: '/UpdateMonitor',
    method: 'post',
    data
  });
}

/** 删除监控设备 */
export function fetchDeleteMonitor(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteMonitor',
    method: 'post',
    data
  });
}

/** 获取监控通道列表 */
export function fetchGetMonitorChannelList(data: CommonType.CommonListQueryParams) {
  return request<Api.Monitor.MonitorChannelList>({
    url: '/ListMonitorChannel',
    method: 'post',
    data
  });
}

/** 获取监控通道详情 */
export function fetchGetMonitorChannel(data: { id: CommonType.IdType }) {
  return request<Api.Monitor.MonitorChannelDetailResponse>({
    url: '/GetMonitorChannel',
    method: 'post',
    data
  });
}

/** 获取监控通道实时播放地址 */
export function fetchGetMonitorChannelLiveUrl(data: { id: CommonType.IdType }) {
  return request<Api.Monitor.MonitorChannelLiveUrlResponse>({
    url: '/GetMonitorChannelLiveURL',
    method: 'post',
    data
  });
}

/** 关闭监控通道实时播放 */
export function fetchCloseMonitorChannelLive(data: Api.Monitor.MonitorChannelLiveCloseParams) {
  return request({
    url: '/CloseMonitorChannelLive',
    method: 'post',
    data,
    headers: {
      repeatSubmit: false
    }
  });
}

/** 新增监控通道 */
export function fetchCreateMonitorChannel(data: Api.Monitor.MonitorChannelCreateParams) {
  return request({
    url: '/CreateMonitorChannel',
    method: 'post',
    data,
    headers: {
      repeatSubmit: false
    }
  });
}

/** 修改监控通道 */
export function fetchUpdateMonitorChannel(data: Api.Monitor.MonitorChannelOperateParams) {
  return request({
    url: '/UpdateMonitorChannel',
    method: 'post',
    data
  });
}

/** 删除监控通道 */
export function fetchDeleteMonitorChannel(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteMonitorChannel',
    method: 'post',
    data
  });
}
