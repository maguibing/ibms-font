export enum AcceptType {
  Image = '.jpg,.jpeg,.png,.gif,.bmp,.webp',
  File = '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.pdf,.zip,.rar,.7z'
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
