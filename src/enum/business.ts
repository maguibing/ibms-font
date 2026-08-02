export enum AcceptType {
  Image = '.jpg,.jpeg,.png,.gif,.bmp,.webp',
  File = '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.pdf,.zip,.rar,.7z'
}

/** WebSocket 消息类型 */
export enum MessageType {
  /** 未知类型 */
  Nil = 0,
  /** accessToken 即将过期 */
  AccessTokenExpired = 100000,
  /** 用户权限变更 */
  SysUserPermChange = 100001,
  /** 身份唯一标识 */
  UniqueIdentity = 100002,
  /** 导入任务 */
  ImportTask = 100003,
  /** 导出任务 */
  ExportTask = 100004,
  /** 设备不活跃报警 */
  AlertDeviceInactive = 130101,
  /** 设备在线/离线状态 */
  DeviceLinkStatus = 130102,
  /** 设备点位实时数据 */
  DevicePointRealTimeData = 130202,
  /** 自定义大屏页面数据 */
  CustomScreenPageData = 130204,
  /** 分配工单 */
  AssigningWorkorder = 130301,
  /** 报警记录通知 */
  AlertAlarmRecord = 130401,
  /** 设备点位历史趋势 */
  DevicePointHistoryTrend = 130501,
  /** 设备点位历史统计 */
  DevicePointHistoryStat = 130502
}

/** 实时数据类型 */
export enum RealTimeType {
  /** 未知类型 */
  Nil = 0,
  /** 订阅 */
  Sub = 1,
  /** 取消订阅 */
  Unsub = 2,
  /** 推送 */
  Push = 3
}

/** 统计粒度 */
export enum StatType {
  /** 小时 */
  Hour = 1,
  /** 日 */
  Day,
  /** 月 */
  Month,
  /** 年 */
  Year
}

/** 统计方式 */
export enum AggType {
  /** 末值 */
  Last = 1,
  /** 平均值 */
  Average,
  /** 差值 */
  Difference,
  /** 首值 */
  First
}
