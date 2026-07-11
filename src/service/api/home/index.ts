import { request } from '@/service/request';

/** 查询首页统计数据 */
export function fetchGetHomeStatisticData(data: CommonType.CommonRequestOptions) {
  return request<Api.Home.StatisticResponse>({
    url: '/GetBaseStat',
    method: 'POST',
    data
  });
}

/** 获取天气信息 */
export function fetchGetWeather(data: Api.Home.WeatherParams) {
  return request<Api.Home.WeatherResponse>({
    url: '/GetWeather',
    method: 'post',
    headers: {
      repeatSubmit: false
    },
    data
  });
}
