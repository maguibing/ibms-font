import { request } from '@/service/request';

/** 获取 OSS 基本域名 */
export function fetchGetOssDomain() {
  return request<Api.Common.OssDomainResponse>({
    url: '/GetOssDomain',
    method: 'post'
  });
}
