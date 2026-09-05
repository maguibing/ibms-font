import type { TagProps } from 'naive-ui';
import { $t } from '@/locales';

export const alarmProjectFilterOption: CommonType.CommonTypeOptions = { type: 104, value: '101' };

export function createAlarmLevelOptions(): CommonType.Option<Api.Alarm.AlarmLevel>[] {
  return [
    { label: $t('alarmRule.levelNormal'), value: 1 },
    { label: $t('alarmRule.levelImportant'), value: 2 },
    { label: $t('alarmRule.levelUrgent'), value: 3 }
  ];
}

export function createAlarmLevelMap(): Record<
  Api.Alarm.AlarmLevel,
  { label: string; type: NonNullable<TagProps['type']> }
> {
  return {
    1: { label: $t('alarmRule.levelNormal'), type: 'info' },
    2: { label: $t('alarmRule.levelImportant'), type: 'warning' },
    3: { label: $t('alarmRule.levelUrgent'), type: 'error' }
  };
}

export function createAlarmRuleConditionTimeTypeMap(): Record<Api.Alarm.AlarmRuleConditionTimeType, string> {
  return {
    1: $t('alarmRule.durationSecond'),
    2: $t('alarmRule.durationMinute'),
    3: $t('alarmRule.durationHour')
  };
}

export function createAlarmBaseOptions(): CommonType.CommonTypeOptions[] {
  return [{ ...alarmProjectFilterOption }];
}

export function formatAlarmRuleFreq(freq?: Api.Alarm.AlarmRuleConditionFreq | null) {
  if (!freq) return '-';

  const durations = freq.durations ?? 0;
  const repeatTimes = freq.repeat_times ?? 0;
  const unit = freq.time_type ? createAlarmRuleConditionTimeTypeMap()[freq.time_type] : '';
  const durationText = unit ? $t('alarmRule.duration', { value: durations, unit }) : String(durations);

  return `${durationText} / ${$t('alarmRule.repeat', { value: repeatTimes })}`;
}
