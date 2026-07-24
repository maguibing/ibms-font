declare namespace Api {
  namespace Alarm {
    type AlarmLevel = 1 | 2 | 3;

    type AlarmRecordDealStatus = 1 | 2 | 3;

    type AlarmRule = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id?: CommonType.IdType;
      name: string;
      alarm_level: AlarmLevel;
    }>;

    type AlarmRuleMapItem = Pick<AlarmRule, 'id' | 'name' | 'alarm_level'>;

    type AlarmRuleList = Api.Common.PaginatingQueryRecord<AlarmRule>;

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
