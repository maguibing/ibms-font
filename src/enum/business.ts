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

/** 导入业务类型 */
export enum ImportBizType {
  /** 未知类型 */
  Nil = 0,
  /** 设备类型点位导入 */
  DeviceTypePoint = 1,
  /** 台账资产导入 */
  Assets = 2,
  /** 项目系统大屏点位 */
  ProjectSysScreenTagPoint = 3,
  /** 物理点位导入 */
  PhysicalPoint = 4,
  /** 设备点位映射导入 */
  DevicePointMapping = 5
}

/** 导入模板路径 */
export enum ImportTemplatePath {
  /** 物理点位导入模板 */
  PhysicalPoint = 'https://autodriver-ibms.oss-cn-beijing.aliyuncs.com/template/import/%E7%89%A9%E7%90%86%E7%82%B9%E4%BD%8D%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx',
  /** 点位映射导入模板 */
  DevicePointMapping = 'https://autodriver-ibms.oss-cn-beijing.aliyuncs.com/template/import/%E7%82%B9%E4%BD%8D%E6%98%A0%E5%B0%84%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx',
  /** 设备类型点位导入模板 */
  DeviceTypePoint = 'https://autodriver-ibms.oss-cn-beijing.aliyuncs.com/template/import/%E8%AE%BE%E5%A4%87%E7%B1%BB%E5%9E%8B%E7%82%B9%E4%BD%8D%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx',
  /** 台账导入模板 */
  Assets = 'https://autodriver-ibms.oss-cn-beijing.aliyuncs.com/template/import/%E5%8F%B0%E8%B4%A6%E5%AF%BC%E5%85%A5%E6%A8%A1%E7%89%88.xlsx',
  /** 系统大屏标签点位导入模板 */
  SysScreenTagPoint = 'https://autodriver-ibms.oss-cn-beijing.aliyuncs.com/template/import/%E7%B3%BB%E7%BB%9F%E5%A4%A7%E5%B1%8F%E6%A0%87%E7%AD%BE%E7%82%B9%E4%BD%8D%E5%AF%BC%E5%85%A5%E6%A8%A1%E7%89%88.xlsx'
}

/** 导入状态 */
export enum ImportStatus {
  /** 未开始 */
  NotStarted = 0,
  /** 开始导入 */
  Preparing = 1,
  /** 导入中 */
  Importing = 2,
  /** 导入完成 */
  Completed = 3,
  /** 导入失败 */
  Failed = 4,
  /** 部分成功 */
  PartiallySuccess = 5
}

/** 导出业务类型 */
export enum ExportBizType {
  /** 未知类型 */
  Nil = 0,
  /** 设备点位历史数据导出 */
  DevicePointHistory = 1,
  /** 台账资产导出 */
  Assets = 2,
  /** 香港大屏数据导出 */
  HongKongScreen = 3,
  /** 设备点位能源数据导出 */
  DevicePointEnergy = 4,
  /** 深汕站水泥浇筑中心数据导出 */
  SSZCementCenter = 5,
  /** 设备点位曲线对比 */
  DevicePointTrend = 6,
  /** 物理点位导出 */
  PhysicalPoint = 7,
  /** 逻辑点位导出 */
  LogicPoint = 8,
  /** 能效日历导出 */
  EnergyCalendar = 9
}

/** 导出文件类型 */
export enum ExportFileType {
  /** 未知类型 */
  Nil = 0,
  /** Excel */
  Excel = 1,
  /** CSV */
  CSV = 2,
  /** JSON */
  JSON = 3,
  /** ZIP */
  ZIP = 4
}

/** 导出状态 */
export enum ExportStatus {
  /** 未开始 */
  NotStarted = 0,
  /** 准备中 */
  Preparing = 1,
  /** 导出中 */
  Exporting = 2,
  /** 导出完成 */
  Completed = 3,
  /** 导出失败 */
  Failed = 4
}

/** 物理点位导出类型 */
export enum PhysicalPointType {
  /** 未知类型 */
  Nil = 0,
  /** 扫描结果导出 */
  ScanResult = 1,
  /** 原始物理点位导出 */
  OriginalPhysicalPoint = 2
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
