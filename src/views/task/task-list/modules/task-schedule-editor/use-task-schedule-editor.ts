export type TaskScheduleTimeNode = {
  _key: string;
  value: number | null;
};

export type TaskScheduleEditorModel = {
  type: Api.Task.TaskScheduleType;
  once: {
    execution_at: number | null;
  };
  daily: {
    repeat_type: Api.Task.TaskScheduleRepeatType;
    weekdays: Api.Task.TaskScheduleWeekday[];
    execution_at_list: TaskScheduleTimeNode[];
  };
  interval: {
    intervals: number | null;
    time_type: Api.Task.TaskConditionTimeType;
  };
  custom: {
    execution_date_list: number[];
    execution_at_list: TaskScheduleTimeNode[];
  };
};

let scheduleTimeKeySeed = 0;

export function createTaskScheduleTimeNode(value: number | null = null): TaskScheduleTimeNode {
  scheduleTimeKeySeed += 1;

  return {
    _key: `schedule-time-${scheduleTimeKeySeed}`,
    value
  };
}

export function createDefaultTaskScheduleModel(): TaskScheduleEditorModel {
  return {
    type: 1,
    once: {
      execution_at: null
    },
    daily: {
      repeat_type: 1,
      weekdays: [],
      execution_at_list: [createTaskScheduleTimeNode()]
    },
    interval: {
      intervals: null,
      time_type: 1
    },
    custom: {
      execution_date_list: [],
      execution_at_list: [createTaskScheduleTimeNode()]
    }
  };
}

export function normalizeTaskScheduleModel(sched?: Api.Task.TaskLogSchedule | null): TaskScheduleEditorModel {
  const model = createDefaultTaskScheduleModel();

  if (!sched) return model;

  model.type = sched.type;

  if (sched.once?.execution_at !== undefined) {
    model.once.execution_at = toMilliseconds(sched.once.execution_at);
  }

  if (sched.daily) {
    model.daily.repeat_type = sched.daily.repeat_type ?? 1;
    model.daily.weekdays = [...(sched.daily.weekdays ?? [])];
    model.daily.execution_at_list = normalizeTimeNodes(sched.daily.execution_at_list);
  }

  if (sched.interval) {
    model.interval.intervals = sched.interval.intervals ?? null;
    model.interval.time_type = sched.interval.time_type ?? 1;
  }

  if (sched.custom) {
    model.custom.execution_date_list = [
      ...new Set((sched.custom.execution_date_list ?? []).map(toLocalDayMilliseconds))
    ].sort((a, b) => a - b);
    model.custom.execution_at_list = normalizeTimeNodes(sched.custom.execution_at_list);
  }

  return model;
}

export function buildTaskScheduleSubmitModel(model: TaskScheduleEditorModel): Api.Task.TaskLogSchedule {
  if (model.type === 1) {
    return {
      type: 1,
      once: {
        execution_at: toUnixSeconds(model.once.execution_at as number)
      }
    };
  }

  if (model.type === 2) {
    return {
      type: 2,
      daily: {
        repeat_type: model.daily.repeat_type,
        weekdays: model.daily.repeat_type === 2 ? model.daily.weekdays : [],
        execution_at_list: buildTimeList(model.daily.execution_at_list)
      }
    };
  }

  if (model.type === 3) {
    return {
      type: 3,
      interval: {
        intervals: model.interval.intervals as number,
        time_type: model.interval.time_type
      }
    };
  }

  return {
    type: 4,
    custom: {
      execution_date_list: model.custom.execution_date_list.map(toUnixSeconds),
      execution_at_list: buildTimeList(model.custom.execution_at_list)
    }
  };
}

export function buildScheduledTaskConditionSetting(model: TaskScheduleEditorModel): Api.Task.TaskConditionSetting {
  return {
    task_type: 2,
    sched: buildTaskScheduleSubmitModel(model)
  };
}

export function getTaskScheduleValidationMessage(model: TaskScheduleEditorModel): string | null {
  if (model.type === 1) {
    if (model.once.execution_at === null) return '请选择执行时间';
    if (model.once.execution_at <= Date.now()) return '一次执行时间必须晚于当前时间';
  }

  if (model.type === 2) {
    if (model.daily.repeat_type === 2 && model.daily.weekdays.length === 0) return '请至少选择一个执行星期';
    const timeMessage = getTimeValidationMessage(model.daily.execution_at_list);
    if (timeMessage) return timeMessage;
  }

  if (model.type === 3) {
    const intervals = model.interval.intervals;
    if (intervals === null || !Number.isInteger(intervals) || intervals <= 0) return '间隔时间必须为正整数';
  }

  if (model.type === 4) {
    if (model.custom.execution_date_list.length === 0) return '请至少选择一个执行日期';
    const timeMessage = getTimeValidationMessage(model.custom.execution_at_list);
    if (timeMessage) return timeMessage;
  }

  return null;
}

function normalizeTimeNodes(values?: number[]): TaskScheduleTimeNode[] {
  return values?.length
    ? values.map(value => createTaskScheduleTimeNode(toMilliseconds(value)))
    : [createTaskScheduleTimeNode()];
}

function buildTimeList(nodes: TaskScheduleTimeNode[]) {
  return nodes.map(node => toUnixSeconds(node.value as number));
}

function getTimeValidationMessage(nodes: TaskScheduleTimeNode[]) {
  if (!nodes.some(node => node.value !== null)) return '请至少选择一个执行时间';
  if (nodes.some(node => node.value === null)) return '请完善所有执行时间节点';

  return null;
}

function toMilliseconds(seconds: number) {
  return seconds * 1000;
}

function toLocalDayMilliseconds(seconds: number) {
  const date = new Date(toMilliseconds(seconds));

  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function toUnixSeconds(milliseconds: number) {
  return Math.floor(milliseconds / 1000);
}
