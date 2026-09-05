import { computed } from 'vue';
import { $t } from '@/locales';

export const modbusRegisterTypeOptions = computed<CommonType.Option<number, string>[]>(() => [
  { label: $t('devicePointManage.modbusCoil'), value: 1 },
  { label: $t('devicePointManage.modbusDiscrete'), value: 2 },
  { label: $t('devicePointManage.modbusHolding'), value: 3 },
  { label: $t('devicePointManage.modbusInput'), value: 4 }
]);

export const modbusDataTypeBaseOptions = computed<CommonType.Option<number, string>[]>(() => [
  { label: $t('devicePointManage.uint16'), value: 1 },
  { label: $t('devicePointManage.int16'), value: 2 },
  { label: $t('devicePointManage.uint32'), value: 3 },
  { label: $t('devicePointManage.int32'), value: 4 },
  { label: $t('devicePointManage.float32'), value: 5 },
  { label: $t('devicePointManage.boolean'), value: 6 }
]);

export const byteOrderOptions = computed<CommonType.Option<number, string>[]>(() => [
  { label: $t('devicePointManage.bigEndian'), value: 1 },
  { label: $t('devicePointManage.littleEndian'), value: 2 },
  { label: $t('devicePointManage.bigEndianSwap'), value: 3 },
  { label: $t('devicePointManage.littleEndianSwap'), value: 4 }
]);

export const objectTypeOptions = computed<CommonType.Option<number, string>[]>(() => [
  { label: 'AI', value: 1 },
  { label: 'AO', value: 2 },
  { label: 'AV', value: 3 },
  { label: 'BI', value: 4 },
  { label: 'BO', value: 5 },
  { label: 'BV', value: 6 }
]);

export const opcUaDataTypeOptions = computed<CommonType.Option<number, string>[]>(() => [
  { label: $t('devicePointManage.switchValue'), value: 1 },
  { label: $t('devicePointManage.signedInteger'), value: 2 },
  { label: $t('devicePointManage.unsignedInteger'), value: 3 },
  { label: $t('devicePointManage.floatingPoint'), value: 4 },
  { label: $t('devicePointManage.stringValue'), value: 5 }
]);

export function resolveProtocolType(protocol: unknown): Api.Gateway.ProtocolType | null {
  const protocolType = Number(protocol);
  if ([1, 2, 3, 4, 5, 6].includes(protocolType)) return protocolType as Api.Gateway.ProtocolType;

  const raw = String(protocol ?? '')
    .trim()
    .toLowerCase();

  if (raw.includes('modbus')) return 4;
  if (raw.includes('bacnet')) return 5;
  if (raw.includes('opc')) return 6;
  if (raw.includes('mqtt')) return 1;
  if (raw.includes('http server')) return 2;
  if (raw.includes('http client') || raw.includes('http')) return 3;

  return null;
}

export function getProtocolTagType(protocol: unknown) {
  const protocolType = resolveProtocolType(protocol);

  if (protocolType === 4) return 'info';
  if (protocolType === 5) return 'success';
  if (protocolType === 6) return 'error';

  return 'default';
}
