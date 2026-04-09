import { request } from '@/service/request';

/** 生成系统激活码 */
export function fetchGenerateSysCert(data: Api.System.GenerateSysCertParams) {
  return request<Api.System.GenerateSysCertResponse>({
    url: '/GenerateSysCert',
    method: 'post',
    data
  });
}
