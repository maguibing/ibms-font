import { request } from '@/service/request';

/** 获取报警规则列表 */
export function fetchGetAlarmRuleList(data: CommonType.CommonListQueryParams) {
  return request<Api.Alarm.AlarmRuleList>({
    url: '/ListAlarmRule',
    method: 'post',
    data
  });
}

/** 获取报警记录列表 */
export function fetchGetAlarmRecordList(data: CommonType.CommonListQueryParams) {
  return request<Api.Alarm.AlarmRecordList>({
    url: '/ListAlarmRecord',
    method: 'post',
    data
  });
}

/** 获取报警记录状态统计 */
export function fetchGetAlarmRecordStat() {
  return request<Api.Alarm.AlarmRecordStat>({
    url: '/GetAlarmRecordStat',
    method: 'post'
  });
}

/** 删除报警记录 */
export function fetchDeleteAlarmRecord(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteAlarmRecord',
    method: 'post',
    data
  });
}

/** 处理报警记录 */
export function fetchTransferAlarmRecord(data: Api.Alarm.AlarmRecordTransferParams) {
  return request({
    url: '/TransferAlarmRecord',
    method: 'post',
    data
  });
}

/** 生成报警工单 */
export function fetchGenerateAlarmRecordWorkorder(data: Api.Alarm.AlarmRecordGenerateWorkorderParams) {
  return request({
    url: '/GenWorkorder',
    method: 'post',
    data
  });
}

/** 获取通知组列表 */
export function fetchGetNoticeGroupList(data: CommonType.CommonListQueryParams) {
  return request<Api.Alarm.NoticeGroupList>({
    url: '/ListNoticeGroup',
    method: 'post',
    data
  });
}

/** 新增通知组 */
export function fetchCreateNoticeGroup(data: Api.Alarm.NoticeGroupCreateParams) {
  return request({
    url: '/CreateNoticeGroup',
    method: 'post',
    data
  });
}

/** 修改通知组 */
export function fetchUpdateNoticeGroup(data: Api.Alarm.NoticeGroupUpdateParams) {
  return request({
    url: '/UpdateNoticeGroup',
    method: 'post',
    data
  });
}

/** 删除通知组 */
export function fetchDeleteNoticeGroup(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteNoticeGroup',
    method: 'post',
    data
  });
}
