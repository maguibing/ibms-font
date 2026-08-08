import type { VNodeChild } from 'vue';

/** 通知展示类型。 */
export type GlobalWebSocketNoticeType = 'default' | 'info' | 'success' | 'warning' | 'error';

/** 通知操作按钮类型。 */
export type GlobalWebSocketNoticeActionType = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error';

/** 全局通知配置。 */
export type GlobalWebSocketNoticeOptions = {
  actionText?: string;
  actionType?: GlobalWebSocketNoticeActionType;
  content: string | (() => VNodeChild);
  duration?: number;
  onAction?: () => void;
  title: string;
  type: GlobalWebSocketNoticeType;
};

/** 报警等级展示配置。 */
export type AlarmLevelMeta = {
  label: string;
  type: GlobalWebSocketNoticeType;
};

/** 分配工单通知内容。 */
export type WorkorderNoticePayload = {
  order_no?: string;
};

/** 角色变更通知内容。 */
export type RoleChangeNoticePayload = {
  new_role?: {
    role_name?: string;
  };
};

/** 设备上下线通知内容。 */
export type DeviceLinkStatusNoticePayload = {
  device_id?: CommonType.IdType;
  device_name?: string;
  link_status?: number;
};

/** 报警记录通知内容。 */
export type AlarmRecordNoticePayload = {
  alarm_rule_id?: CommonType.IdType;
  alarm_rule_name?: string;
  alarm_level?: number;
  alarm_record_id_list?: CommonType.IdType[];
};
