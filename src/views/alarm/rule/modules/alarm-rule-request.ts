import { createAlarmBaseOptions } from '../../shared';

export function buildAlarmRuleListRequest(
  params: Api.Alarm.AlarmRuleSearchParams,
  fixedDeviceTypeId?: CommonType.IdType | null,
  fixedDeviceId?: CommonType.IdType | null
): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const hasFixedDeviceId = fixedDeviceId !== null && fixedDeviceId !== undefined;
  const hasFixedDeviceTypeId = fixedDeviceTypeId !== null && fixedDeviceTypeId !== undefined;
  const fixedSourceType = hasFixedDeviceId ? 1 : hasFixedDeviceTypeId ? 2 : null;
  const fixedSourceId = hasFixedDeviceId ? fixedDeviceId : fixedDeviceTypeId;
  const filterConfigs = [
    ...createAlarmBaseOptions(),
    { type: 51, value: fixedSourceType },
    { type: 52, value: fixedSourceId },
    { type: 4, value: params.alarm_level },
    { type: 2, value: params.name }
  ];

  const options = filterConfigs
    .filter(item => item.value !== null && item.value !== undefined && item.value !== '')
    .map(({ type, value }) => ({ type, value: String(value) }));

  return {
    list_option: {
      options,
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    },
    options: [{ key: 1 }, { key: 3 }]
  };
}
