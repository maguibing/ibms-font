import type { StatusTagMap } from '@sa/materials';

export const GATEWAY_PROTOCOL_OPTIONS: CommonType.Option<Api.Gateway.ProtocolType, string>[] = [
  { label: 'MQTT', value: 1 },
  { label: 'HTTP Server', value: 2 },
  { label: 'HTTP Client', value: 3 },
  { label: 'Modbus', value: 4 },
  { label: 'BACnet', value: 5 },
  { label: 'OPC UA', value: 6 }
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
