import type { TagProps } from 'naive-ui';

export const alarmProjectFilterOption: CommonType.CommonTypeOptions = { type: 104, value: '101' };

export const alarmLevelOptions: CommonType.Option<Api.Alarm.AlarmLevel>[] = [
  { label: '普通', value: 1 },
  { label: '重要', value: 2 },
  { label: '紧急', value: 3 }
];

export const alarmLevelMap: Record<Api.Alarm.AlarmLevel, { label: string; type: NonNullable<TagProps['type']> }> = {
  1: { label: '普通', type: 'info' },
  2: { label: '重要', type: 'warning' },
  3: { label: '紧急', type: 'error' }
};

export const alarmRuleConditionTimeTypeMap: Record<Api.Alarm.AlarmRuleConditionTimeType, string> = {
  1: '秒',
  2: '分钟',
  3: '小时'
};

export function createAlarmBaseOptions(): CommonType.CommonTypeOptions[] {
  return [{ ...alarmProjectFilterOption }];
}

export function formatAlarmRuleFreq(freq?: Api.Alarm.AlarmRuleConditionFreq | null) {
  if (!freq) return '-';

  const durations = freq.durations ?? 0;
  const repeatTimes = freq.repeat_times ?? 0;
  const unit = freq.time_type ? alarmRuleConditionTimeTypeMap[freq.time_type] : '';
  const durationText = unit ? `${durations}${unit}` : String(durations);

  return `${durationText} / 重复${repeatTimes}次`;
}
