declare namespace Api {
  namespace Task {
    type TaskType = 1 | 2;

    type TaskStatus = 1 | 2;

    type TaskMapItem = {
      id: CommonType.IdType;
      name: string;
      task_type: TaskType;
    };

    type TaskDeviceRef = {
      id: CommonType.IdType;
    };

    type TaskDeviceTypePointRef = {
      id: CommonType.IdType;
    };

    type TaskLogicalOperatorType = 1 | 2;

    type TaskThresholdType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

    type TaskConditionTimeType = 1 | 2 | 3;

    type TaskPointValueContent = {
      value?: CommonType.IdType | boolean | null;
      alias?: string | null;
      unit?: string | null;
    };

    type TaskConditionSingleValue = {
      data_type?: CommonType.DataType;
      num_val?: TaskPointValueContent | null;
      switch_val?: TaskPointValueContent | null;
      str_val?: TaskPointValueContent | null;
      enum_val?: TaskPointValueContent | null;
    };

    type TaskConditionRangeValue = {
      min_val?: number | null;
      max_val?: number | null;
    };

    type TaskConditionSubCond = {
      device_type_point_id?: CommonType.IdType | null;
      logic_operator_type?: TaskLogicalOperatorType | null;
      threshold_type?: TaskThresholdType | null;
      range_val?: TaskConditionRangeValue | null;
      single_val?: TaskConditionSingleValue | null;
    };

    type TaskConditionFreq = {
      time_type?: TaskConditionTimeType;
      durations?: number;
      repeat_times?: number;
    };

    type TaskPointValue = {
      device?: TaskDeviceRef;
      device_type_point?: TaskDeviceTypePointRef;
      data_type: CommonType.DataType;
      num_val?: TaskPointValueContent;
      switch_val?: TaskPointValueContent;
      enum_val?: TaskPointValueContent;
      text_val?: TaskPointValueContent;
      str_val?: TaskPointValueContent;
    };

    type TaskCondition = {
      logic_operator_type?: TaskLogicalOperatorType;
      sub_conds?: TaskConditionSubCond[];
      device_source_type?: number;
      device_source_id?: CommonType.IdType;
    };

    type TaskConditionSetting = {
      task_type: TaskType;
      conds?: TaskCondition[];
      freq?: TaskConditionFreq;
      sched?: TaskLogSchedule;
    };

    type TaskAction = {
      point_vals?: TaskPointValue[];
      delay_seconds?: number;
      continuous_times?: number;
    };

    type TaskActionSetting = {
      actions?: TaskAction[];
      out_actions?: TaskAction[];
    };

    type Task = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      name: string;
      desc?: string;
      task_type: TaskType;
      status: TaskStatus;
      device_source_type: number;
      cond_setting: TaskConditionSetting;
      action_setting: TaskActionSetting;
    }>;

    type TaskOperateParams = {
      name: string;
      desc?: string;
      task_type: TaskType;
      status: TaskStatus;
      cond_setting: TaskConditionSetting;
      action_setting: TaskActionSetting;
    };

    type TaskUpdateParams = TaskOperateParams & Pick<Task, 'id'>;

    type TaskListExtra = {
      device_map: CommonType.IdNameMap;
    };

    type TaskList = Api.Common.PaginatingQueryRecord<Task, TaskListExtra>;

    type TaskDeviceTypePointMapItem = CommonType.IdNameRecord & {
      data_type: CommonType.DataType;
      setting?: Api.Device.DeviceTypePointSetting | null;
    };

    type TaskDetailData = TaskListExtra & {
      task: Task;
      device_type_point_map: Record<string, TaskDeviceTypePointMapItem>;
    };

    type TaskSearchParams = CommonType.RecordNullable<
      Api.Common.CommonSearchParams & {
        name: string;
      }
    >;

    type TaskLogDeviceTypePoint = {
      device_type_point_id: CommonType.IdType;
      content: string;
      is_success?: boolean;
    };

    type TaskLogDevicePoint = {
      device_id: CommonType.IdType;
      device_type_point_list?: TaskLogDeviceTypePoint[];
      exec_at?: number;
      continuous_times?: number;
      calendar_branch?: 1 | 2;
      time_range?: {
        start_at?: number;
        end_at?: number;
      };
    };

    type TaskScheduleType = 1 | 2 | 3 | 4 | 5;

    type TaskScheduleRepeatType = 1 | 2;

    type TaskScheduleWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

    type TaskLogScheduleCustom = {
      execution_date_list?: number[];
      execution_at_list?: number[];
    };

    type TaskLogScheduleDaily = {
      repeat_type?: TaskScheduleRepeatType;
      execution_at_list?: number[];
      weekdays?: TaskScheduleWeekday[];
    };

    type TaskLogScheduleOnce = {
      execution_at?: number;
    };

    type TaskLogScheduleInterval = {
      time_type?: TaskConditionTimeType;
      intervals?: number;
    };

    type TaskLogScheduleTimeRange = {
      start_at?: number;
      end_at?: number;
    };

    type TaskLogScheduleCalendarDateGroup = {
      execution_date_list?: number[];
      time_ranges?: TaskLogScheduleTimeRange[];
    };

    type TaskLogScheduleCalendar = {
      date_groups?: TaskLogScheduleCalendarDateGroup[];
      poll_interval_seconds?: number;
    };

    type TaskLogSchedule = {
      type: TaskScheduleType;
      once?: TaskLogScheduleOnce;
      custom?: TaskLogScheduleCustom;
      daily?: TaskLogScheduleDaily;
      interval?: TaskLogScheduleInterval;
      calendar?: TaskLogScheduleCalendar;
    };

    type TaskLogConditionDetail = {
      task_type: TaskType;
      device_point_list?: TaskLogDevicePoint[];
      sched?: TaskLogSchedule;
    };

    type TaskLogActionDetail = {
      device_point_list?: TaskLogDevicePoint[];
    };

    type TaskLog = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      task_id: CommonType.IdType;
      cond_detail: TaskLogConditionDetail;
      action_detail: TaskLogActionDetail;
    }>;

    type TaskLogListExtra = {
      task_map: Record<string, TaskMapItem>;
      device_map: CommonType.IdNameMap;
      device_type_point_map: CommonType.IdNameMap;
    };

    type TaskLogList = Api.Common.PaginatingQueryRecord<TaskLog, TaskLogListExtra>;

    type TaskLogDetailData = TaskLogListExtra & {
      task_log: TaskLog;
    };

    type TaskLogSearchParams = CommonType.RecordNullable<
      Api.Common.CommonSearchParams & {
        task_name: string;
        task_type: TaskType;
      }
    >;
  }
}
