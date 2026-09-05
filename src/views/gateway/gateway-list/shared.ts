import { computed } from 'vue';
import type { StatusTagMap, StatusTagOption } from '@/components/custom/status-tag.vue';
import { $t } from '@/locales';

export const GATEWAY_PROTOCOL_OPTIONS = computed<CommonType.Option<Api.Gateway.ProtocolType, string>[]>(() => [
  { label: $t('gatewayList.mqttProtocol'), value: 1 },
  { label: $t('gatewayList.httpServerProtocol'), value: 2 },
  { label: $t('gatewayList.httpClientProtocol'), value: 3 },
  { label: $t('gatewayList.modbusProtocol'), value: 4 },
  { label: $t('gatewayList.bacnetProtocol'), value: 5 },
  { label: $t('gatewayList.opcUaProtocol'), value: 6 }
]);

export const opcUaSecurityModeOptions = computed<CommonType.Option<Api.Gateway.OpcUaSecurityMode, string>[]>(() => [
  { label: $t('gatewayList.noSecurity'), value: 1 },
  { label: $t('gatewayList.sign'), value: 2 },
  { label: $t('gatewayList.signEncrypt'), value: 3 }
]);

export const opcUaAuthTypeOptions = computed<CommonType.Option<Api.Gateway.OpcUaAuthType, string>[]>(() => [
  { label: $t('gatewayList.anonymous'), value: 1 },
  { label: $t('gatewayList.username'), value: 2 }
]);

export const dataFormatOptions = computed<CommonType.Option<Api.Gateway.DataFormat, string>[]>(() => [
  { label: $t('gatewayList.keyValue'), value: 1 },
  { label: $t('gatewayList.standard'), value: 2 },
  { label: $t('gatewayList.xunrao'), value: 3 },
  { label: $t('gatewayList.nz'), value: 4 }
]);

export const GATEWAY_LINK_STATUS_MAP = computed<StatusTagMap>(() => ({
  '1': { label: $t('gatewayList.inactive'), type: 'warning' },
  '2': { label: $t('gatewayList.online'), type: 'success' },
  '3': { label: $t('gatewayList.offline'), type: 'error' }
}));

export const GATEWAY_UNKNOWN_STATUS = computed<StatusTagOption>(() => ({
  label: $t('gatewayList.unknown'),
  type: 'default'
}));

export function getGatewayProtocolLabel(value: number | null | undefined) {
  return GATEWAY_PROTOCOL_OPTIONS.value.find(item => item.value === value)?.label || '-';
}
