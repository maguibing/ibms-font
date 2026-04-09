import { request } from '@/service/request';

/** 查询首页统计数据 */
export function fetchGetHomeStatisticData(data: CommonType.CommonRequestOptions) {
  return request<Api.Tool.GenTableList>({
    url: '/GetBaseStat',
    method: 'POST',
    data
  });
}
