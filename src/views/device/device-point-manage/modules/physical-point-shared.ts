export const modbusRegisterTypeOptions: CommonType.Option<number, string>[] = [
  { label: '1-线圈寄存器', value: 1 },
  { label: '2-离散寄存器', value: 2 },
  { label: '3-保持寄存器', value: 3 },
  { label: '4-输入寄存器', value: 4 }
];

export const modbusDataTypeBaseOptions: CommonType.Option<number, string>[] = [
  { label: '无符号16位整数', value: 1 },
  { label: '有符号16位整数', value: 2 },
  { label: '无符号32位整数', value: 3 },
  { label: '有符号32位整数', value: 4 },
  { label: '32位浮点数', value: 5 },
  { label: '布尔值', value: 6 }
];

export const byteOrderOptions: CommonType.Option<number, string>[] = [
  { label: '大端', value: 1 },
  { label: '小端', value: 2 },
  { label: '大端字节交换', value: 3 },
  { label: '小端字节交换', value: 4 }
];

export const objectTypeOptions: CommonType.Option<number, string>[] = [
  { label: 'AI', value: 1 },
  { label: 'AO', value: 2 },
  { label: 'AV', value: 3 },
  { label: 'BI', value: 4 },
  { label: 'BO', value: 5 },
  { label: 'BV', value: 6 }
];

export const opcUaDataTypeOptions: CommonType.Option<number, string>[] = [
  { label: '开关量', value: 1 },
  { label: '有符号整数', value: 2 },
  { label: '无符号整数', value: 3 },
  { label: '浮点数', value: 4 },
  { label: '字符串', value: 5 }
];

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
