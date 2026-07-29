declare namespace Api {
  namespace Alarm {
    type AlarmLevel = 1 | 2 | 3;

    type AlarmRuleStatus = 1 | 2;

    type AlarmRuleTriggerType = 1;

    type AlarmRuleDeviceSourceType = 1 | 2;

    type AlarmRuleLogicOperatorType = 1 | 2;

    type AlarmRuleThresholdType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

    type AlarmRuleConditionTimeType = 1 | 2 | 3;

    type AlarmRecordDealStatus = 1 | 2 | 3;

    type AlarmRulePointValueContent = {
      value?: CommonType.IdType | boolean | null;
      alias?: string | null;
      unit?: string | null;
      scale?: number | null;
    };

    type AlarmRuleConditionSingleValue = {
      data_type?: CommonType.DataType;
      num_val?: AlarmRulePointValueContent | null;
      switch_val?: AlarmRulePointValueContent | null;
      str_val?: AlarmRulePointValueContent | null;
      enum_val?: AlarmRulePointValueContent | null;
    };

    type AlarmRuleConditionRangeValue = {
      min_val?: number | null;
      max_val?: number | null;
    };

    type AlarmRuleSubCondition = {
      logic_operator_type?: AlarmRuleLogicOperatorType | null;
      device_type_point_id?: CommonType.IdType | null;
      threshold_type?: AlarmRuleThresholdType | null;
      single_val?: AlarmRuleConditionSingleValue | null;
      range_val?: AlarmRuleConditionRangeValue | null;
    };

    type AlarmRuleCondition = {
      logic_operator_type?: AlarmRuleLogicOperatorType | null;
      device_source_type?: AlarmRuleDeviceSourceType | null;
      device_source_id?: CommonType.IdType | null;
      sub_conds?: AlarmRuleSubCondition[];
    };

    type AlarmRuleValidTimeRange = {
      start_at?: number | null;
      end_at?: number | null;
    };

    type AlarmRuleConditionFreq = {
      time_type?: AlarmRuleConditionTimeType;
      durations?: number;
      repeat_times?: number;
    };

    type AlarmRuleConditionSetting = {
      conds?: AlarmRuleCondition[];
      notice_group_id_list?: CommonType.IdType[];
      notice_limit?: number;
      valid_time_ranges?: AlarmRuleValidTimeRange[];
      freq?: AlarmRuleConditionFreq;
      is_autogen_workorder?: boolean;
      is_system_auto_recover?: boolean;
    };

    type AlarmRule = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id?: CommonType.IdType;
      name: string;
      desc?: string;
      trigger_type: AlarmRuleTriggerType;
      alarm_level: AlarmLevel;
      device_source_type: AlarmRuleDeviceSourceType;
      status: AlarmRuleStatus;
      cond_setting?: AlarmRuleConditionSetting;
    }>;

    type AlarmRuleMapItem = Pick<AlarmRule, 'id' | 'name' | 'alarm_level'>;

    type AlarmRuleListExtra = {
      device_map: CommonType.IdNameMap;
      device_type_map?: CommonType.IdNameMap;
      device_type_point_map?: Record<string, Api.Task.TaskDeviceTypePointMapItem>;
      notice_group_map?: CommonType.IdNameMap;
    };

    type AlarmRuleList = Api.Common.PaginatingQueryRecord<AlarmRule, AlarmRuleListExtra>;

    type AlarmRuleDetailData = AlarmRuleListExtra & {
      alarm_rule: AlarmRule;
    };

    type AlarmRuleOperateParams = {
      id?: CommonType.IdType | null;
      alarm_level: AlarmLevel;
      cond_setting: AlarmRuleConditionSetting;
      desc: string;
      device_source_type: AlarmRuleDeviceSourceType;
      name: string;
      status: AlarmRuleStatus;
      trigger_type: AlarmRuleTriggerType;
    };

    type AlarmRuleCreateParams = Omit<AlarmRuleOperateParams, 'id'>;

    type AlarmRuleUpdateParams = AlarmRuleCreateParams & {
      id: CommonType.IdType;
    };

    type AlarmRuleSearchParams = CommonType.RecordNullable<
      Api.Common.CommonSearchParams & {
        name: string;
        alarm_level: AlarmLevel;
      }
    >;

    type AlarmPointRecord = {
      logic_point_id: CommonType.IdType;
      content: string;
    };

    type AlarmRecordOperateLog = {
      operator_id: CommonType.IdType;
      operate_at: number;
      status: AlarmRecordDealStatus;
    };

    type AlarmRecordWorkorder = {
      is_workorder_generated?: boolean;
    };

    type AlarmRecordDetail = {
      alarm_point_list?: AlarmPointRecord[];
      workorder?: AlarmRecordWorkorder;
      operate_log_list?: AlarmRecordOperateLog[];
    };

    type AlarmRecord = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      alarm_rule_id: CommonType.IdType;
      device_id: CommonType.IdType;
      point_id: CommonType.IdType;
      status: AlarmRecordDealStatus;
      group_hash: string;
      cond_hash: string;
      alarm_at: number;
      detail?: AlarmRecordDetail;
    }>;

    type AlarmRecordListExtra = {
      device_map: CommonType.IdNameMap;
      logic_point_map: CommonType.IdNameMap;
      alarm_rule_map: Record<string, AlarmRuleMapItem>;
      base_user_map: Record<string, Api.System.User>;
    };

    type AlarmRecordList = Api.Common.PaginatingQueryRecord<AlarmRecord, AlarmRecordListExtra>;

    type AlarmRecordStat = {
      deal_status_map: Partial<Record<AlarmRecordDealStatus, number>>;
    };

    type AlarmRecordTransferStatus = 2 | 3;

    type AlarmRecordTransferParams = Api.Common.CommonIdList & {
      transfer_status: AlarmRecordTransferStatus;
    };

    type AlarmRecordGenerateWorkorderParams = {
      alarm_record_id: CommonType.IdType;
      device_id: CommonType.IdType;
      point_id: CommonType.IdType;
      project_id: CommonType.IdType;
    };

    type AlarmRecordSearchParams = CommonType.RecordNullable<
      Api.Common.CommonSearchParams & {
        alarm_rule_id: CommonType.IdType;
        alarm_level: AlarmLevel;
        dateRange?: [number, number];
      }
    >;

    type NoticeGroupNoticeType = 1;

    type NoticeWay = 1 | 2 | 3;

    type NoticeGroupNoticeUser = {
      user_id_list: CommonType.IdType[];
      notice_way_list: NoticeWay[];
    };

    type NoticeGroupNotice = {
      notice_type: NoticeGroupNoticeType;
      user: NoticeGroupNoticeUser;
      group_bot: Record<string, unknown>;
    };

    type NoticeGroup = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      name: string;
      desc?: string;
      notice_type: NoticeGroupNoticeType;
      notice: NoticeGroupNotice;
    }>;

    type NoticeGroupBaseUser = Api.System.User & {
      language?: number;
    };

    type NoticeGroupListExtra = {
      base_user_map: Record<string, NoticeGroupBaseUser>;
    };

    type NoticeGroupList = Api.Common.PaginatingQueryRecord<NoticeGroup, NoticeGroupListExtra>;

    type NoticeGroupSearchParams = CommonType.RecordNullable<Pick<NoticeGroup, 'name'> & Api.Common.CommonSearchParams>;

    type NoticeGroupOperateParams = {
      id?: CommonType.IdType | null;
      desc: string;
      name: string;
      notice: NoticeGroupNotice;
    };

    type NoticeGroupCreateParams = Omit<NoticeGroupOperateParams, 'id'>;

    type NoticeGroupUpdateParams = NoticeGroupCreateParams & {
      id: CommonType.IdType;
    };
  }
}
