import type { SelectOption, TagProps } from 'naive-ui';
import { $t } from '@/locales';

/** 创建任务类型映射。 */
export function createTaskTypeMap(): Record<Api.Task.TaskType, { label: string; type: NonNullable<TagProps['type']> }> {
  return {
    1: { label: $t('taskLog.taskTypeCondition'), type: 'success' },
    2: { label: $t('taskLog.taskTypeScheduled'), type: 'info' }
  };
}

/** 任务类型映射。 */
export const taskTypeMap = createTaskTypeMap();

/** 任务类型选项。 */
export const taskTypeOptions: SelectOption[] = Object.entries(taskTypeMap).map(([value, config]) => ({
  label: config.label,
  value: Number(value)
}));

/** 创建任务类型选项。 */
export function createTaskTypeOptions(): SelectOption[] {
  return Object.entries(createTaskTypeMap()).map(([value, config]) => ({ label: config.label, value: Number(value) }));
}

/** 创建调度类型映射。 */
export function createScheduleTypeMap(): Record<Api.Task.TaskScheduleType, string> {
  return {
    1: $t('taskLog.scheduleOnce'),
    2: $t('taskLog.schedulePeriodic'),
    3: $t('taskLog.scheduleInterval'),
    4: $t('taskLog.scheduleByPlan'),
    5: $t('taskLog.scheduleCalendar')
  };
}

/** 调度类型映射。 */
export const scheduleTypeMap = createScheduleTypeMap();

/** 创建星期映射。 */
export function createWeekdayMap(): Record<Api.Task.TaskScheduleWeekday, string> {
  return {
    0: $t('taskLog.sunday'),
    1: $t('taskLog.monday'),
    2: $t('taskLog.tuesday'),
    3: $t('taskLog.wednesday'),
    4: $t('taskLog.thursday'),
    5: $t('taskLog.friday'),
    6: $t('taskLog.saturday')
  };
}

/** 星期映射。 */
export const weekdayMap = createWeekdayMap();

/** 创建重复方式映射。 */
export function createRepeatTypeMap(): Record<Api.Task.TaskScheduleRepeatType, string> {
  return {
    1: $t('taskLog.repeatDaily'),
    2: $t('taskLog.repeatCustom')
  };
}

/** 重复方式映射。 */
export const repeatTypeMap = createRepeatTypeMap();

/** 创建时间单位映射。 */
export function createIntervalTimeTypeMap(): Record<Api.Task.TaskConditionTimeType, string> {
  return {
    1: $t('taskLog.intervalSecond'),
    2: $t('taskLog.intervalMinute'),
    3: $t('taskLog.intervalHour')
  };
}

/** 时间单位映射。 */
export const intervalTimeTypeMap = createIntervalTimeTypeMap();

/** 创建调度类型选项。 */
export function createScheduleTypeOptions() {
  return Object.entries(createScheduleTypeMap()).map(([value, label]) => ({
    label,
    value: Number(value) as Api.Task.TaskScheduleType
  }));
}

/** 创建重复方式选项。 */
export function createRepeatTypeOptions() {
  return Object.entries(createRepeatTypeMap()).map(([value, label]) => ({
    label,
    value: Number(value) as Api.Task.TaskScheduleRepeatType
  }));
}

/** 创建星期选项。 */
export function createWeekdayOptions() {
  return ([1, 2, 3, 4, 5, 6, 0] as Api.Task.TaskScheduleWeekday[]).map(value => ({
    label: createWeekdayMap()[value],
    value
  }));
}

/** 创建时间单位选项。 */
export function createIntervalTimeTypeOptions() {
  return Object.entries(createIntervalTimeTypeMap()).map(([value, label]) => ({
    label,
    value: Number(value) as Api.Task.TaskConditionTimeType
  }));
}

/** 创建条件逻辑关系选项。 */
export function createLogicOperatorOptions(): CommonType.Option<Api.Task.TaskLogicalOperatorType>[] {
  return [
    { label: $t('taskList.conditionAnd'), value: 1 },
    { label: $t('taskList.conditionRelationOr'), value: 2 }
  ];
}

/** 创建阈值关系选项。 */
export function createThresholdOptions(): CommonType.Option<Api.Task.TaskThresholdType>[] {
  return [
    { label: $t('taskList.greaterThan'), value: 1 },
    { label: $t('taskList.lessThan'), value: 2 },
    { label: $t('taskList.greaterOrEqual'), value: 3 },
    { label: $t('taskList.lessOrEqual'), value: 4 },
    { label: $t('taskList.between'), value: 5 },
    { label: $t('taskList.notBetween'), value: 6 },
    { label: $t('taskList.equal'), value: 7 },
    { label: $t('taskList.notEqual'), value: 8 }
  ];
}

/** 创建条件持续时间单位选项。 */
export function createConditionTimeTypeOptions(): CommonType.Option<Api.Task.TaskConditionTimeType>[] {
  return [
    { label: $t('taskList.seconds'), value: 1 },
    { label: $t('taskList.minutes'), value: 2 },
    { label: $t('taskList.hours'), value: 3 }
  ];
}

/** 根据数据类型获取可用阈值选项。 */
export function getThresholdOptions(dataType?: CommonType.DataType | null) {
  const options = createThresholdOptions();

  return dataType === 1 ? options : options.filter(item => [7, 8].includes(item.value));
}
