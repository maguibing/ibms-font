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

    type TaskPointValueContent = {
      value?: CommonType.IdType | boolean | null;
      alias?: string | null;
      unit?: string | null;
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
      logic_operator_type?: number;
      sub_conds?: Array<Record<string, unknown>>;
      device_source_type?: number;
      device_source_id?: CommonType.IdType;
    };

    type TaskConditionSetting = {
      task_type: TaskType;
      conds?: TaskCondition[];
      freq?: Record<string, unknown>;
      sched?: TaskLogSchedule;
    };

    type TaskActionSetting = {
      actions?: Array<{
        point_vals?: TaskPointValue[];
        delay_seconds?: number;
        continuous_times?: number;
      }>;
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

    type TaskListExtra = {
      device_map: CommonType.IdNameMap;
    };

    type TaskList = Api.Common.PaginatingQueryRecord<Task, TaskListExtra>;

    type TaskDetailData = TaskListExtra & {
      task: Task;
      device_type_point_map: CommonType.IdNameMap;
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
    };

    type TaskLogScheduleCustom = {
      execution_date_list?: number[];
      execution_at_list?: number[];
    };

    type TaskLogScheduleDaily = {
      repeat_type?: number;
      execution_at_list?: number[];
      weekdays?: number[];
    };

    type TaskLogScheduleOnce = {
      execution_at?: number;
    };

    type TaskLogScheduleInterval = {
      time_type?: number;
      intervals?: number;
    };

    type TaskLogSchedule = {
      type: number;
      once?: TaskLogScheduleOnce;
      custom?: TaskLogScheduleCustom;
      daily?: TaskLogScheduleDaily;
      interval?: TaskLogScheduleInterval;
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
