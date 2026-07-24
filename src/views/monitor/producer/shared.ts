export const PROVIDER_TYPE_OPTIONS: CommonType.Option<Api.Monitor.ProviderType, string>[] = [
  { label: '萤石云', value: 1 },
  { label: '海康云', value: 2 },
  { label: '大华云', value: 3 }
];

export const PROVIDER_STATUS_OPTIONS: CommonType.Option<Api.Monitor.ProviderStatus, string>[] = [
  { label: '启用', value: 1 },
  { label: '停用', value: 2 }
];

export function getProviderTypeLabel(value: number | null | undefined) {
  return PROVIDER_TYPE_OPTIONS.find(item => item.value === value)?.label || '-';
}
