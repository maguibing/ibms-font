declare namespace Api {
  namespace Task {
    type TaskType = 1 | 2;

    type TaskMapItem = {
      id: CommonType.IdType;
      name: string;
      task_type: TaskType;
    };

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

    type TaskLogSchedule = {
      type: number;
      custom?: TaskLogScheduleCustom;
      daily?: TaskLogScheduleDaily;
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
