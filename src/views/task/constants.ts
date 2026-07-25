import type { SelectOption, TagProps } from 'naive-ui';

export const taskTypeMap: Record<Api.Task.TaskType, { label: string; type: NonNullable<TagProps['type']> }> = {
  1: { label: '条件任务', type: 'success' },
  2: { label: '定时任务', type: 'info' }
};

export const taskTypeOptions: SelectOption[] = Object.entries(taskTypeMap).map(([value, config]) => ({
  label: config.label,
  value: Number(value)
}));

export const scheduleTypeMap: Record<number, string> = {
  1: '一次执行',
  2: '按周期执行',
  3: '间隔时间重复执行',
  4: '按日程执行'
};

export const weekdayMap: Record<number, string> = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六'
};

export const repeatTypeMap: Record<number, string> = {
  1: '每天',
  2: '自定义'
};

export const intervalTimeTypeMap: Record<number, string> = {
  1: '秒',
  2: '分',
  3: '时'
};
