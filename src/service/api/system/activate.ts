import { request } from '@/service/request';

/** 生成系统激活码 */
export function fetchGenerateSysCert(data: Api.System.GenerateSysCertParams) {
  return request<Api.System.GenerateSysCertResponse>({
    url: '/GenerateSysCert',
    method: 'post',
    data
  });
}

/** 激活系统证书 */
export function fetchActiveSysCert(data: Api.System.ActiveSysCertParams) {
  return request({
    url: '/ActiveSysCert',
    method: 'post',
    data
  });
}
