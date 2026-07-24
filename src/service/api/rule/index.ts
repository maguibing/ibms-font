import { request } from '@/service/request';

/** 获取消息规则列表 */
export function fetchGetMessageRuleList(data: CommonType.CommonListQueryParams) {
  return request<Api.Rule.MessageRuleList>({
    url: '/ListMessageRule',
    method: 'post',
    data
  });
}

/** 删除消息规则 */
export function fetchDeleteMessageRule(data: Api.Common.CommonIdList) {
  return request({
    url: '/DeleteMessageRule',
    method: 'post',
    data
  });
}

/** 新增消息规则 */
export function fetchCreateMessageRule(data: Api.Rule.MessageRuleOperateParams) {
  return request({
    url: '/CreateMessageRule',
    method: 'post',
    data
  });
}

/** 修改消息规则 */
export function fetchUpdateMessageRule(data: Api.Rule.MessageRuleOperateParams) {
  return request({
    url: '/UpdateMessageRule',
    method: 'post',
    data
  });
}

/** 验证消息规则 */
export function fetchValidateMessageRule(data: Api.Rule.MessageRuleValidateParams) {
  return request<Api.Rule.MessageRuleValidateResult>({
    url: '/ValidateMessageRule',
    method: 'post',
    data
  });
}
