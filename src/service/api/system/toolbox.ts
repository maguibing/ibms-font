import { request } from '@/service/request';

/** 获取网卡接口列表 */
export function fetchListNetworkInterface() {
  return request<Api.System.NetworkInterfaceData>({
    url: '/ListNetworkInterface',
    method: 'post'
  });
}

/** 网络发现 */
export function fetchDiscoverNetwork(data: Api.System.DiscoverNetworkParams) {
  return request<Api.System.DiscoverNetworkData>({
    url: '/DiscoverNetwork',
    method: 'post',
    data
  });
}

/** Ping 测试 */
export function fetchPing(data: Api.System.PingParams) {
  return request<Api.System.PingData>({
    url: '/Ping',
    method: 'post',
    data
  });
}

/** Telnet 测试 */
export function fetchTelnet(data: Api.System.TelnetParams) {
  return request<Api.System.TelnetData>({
    url: '/Telnet',
    method: 'post',
    data
  });
}
