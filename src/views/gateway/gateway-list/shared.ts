import type { StatusTagMap } from '@sa/materials';

export const GATEWAY_PROTOCOL_OPTIONS: CommonType.Option<Api.Gateway.ProtocolType, string>[] = [
  { label: 'MQTT', value: 1 },
  { label: 'HTTP Server', value: 2 },
  { label: 'HTTP Client', value: 3 },
  { label: 'Modbus', value: 4 },
  { label: 'BACnet', value: 5 },
  { label: 'OPC UA', value: 6 }
];

export const opcUaSecurityModeOptions: CommonType.Option<Api.Gateway.OpcUaSecurityMode, string>[] = [
  { label: '无安全', value: 1 },
  { label: '签名', value: 2 },
  { label: '签名并加密', value: 3 }
];

export const opcUaAuthTypeOptions: CommonType.Option<Api.Gateway.OpcUaAuthType, string>[] = [
  { label: '匿名', value: 1 },
  { label: '用户名', value: 2 }
];

export const httpMethodOptions = ['POST', 'GET', 'PUT', 'DELETE', 'PATCH'];

export const tokenPlacementOptions = [
  { label: '标准认证头（Bearer Token）', value: 1 },
  { label: '标准认证头（Raw Token）', value: 2 },
  { label: '自定义请求头（Header）', value: 3 },
  { label: 'URL 查询参数（Query）', value: 4 },
  { label: '请求体参数（Body）', value: 5 }
];

export const tokenKeyFixedByPlacement = {
  1: 'Authorization Bearer',
  2: 'Athorization'
};

export const dataFormatOptions: CommonType.Option<Api.Gateway.DataFormat, string>[] = [
  { label: 'Key-Value格式', value: 1 },
  { label: '标准格式', value: 2 },
  { label: '讯饶格式', value: 3 },
  { label: 'NZ格式', value: 4 }
];

export const GATEWAY_STATUS_MAP: StatusTagMap = {
  '1': { label: '启用', type: 'success' },
  '2': { label: '禁用', type: 'default' }
};

export const GATEWAY_LINK_STATUS_MAP: StatusTagMap = {
  '1': { label: '未激活', type: 'warning' },
  '2': { label: '在线', type: 'success' },
  '3': { label: '离线', type: 'error' }
};

export const GATEWAY_UNKNOWN_STATUS = {
  label: '未知',
  type: 'default'
} as const;

export function getGatewayProtocolLabel(value: number | null | undefined) {
  return GATEWAY_PROTOCOL_OPTIONS.find(item => item.value === value)?.label || '-';
}
