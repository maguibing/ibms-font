import type { TagProps } from 'naive-ui';

export type StatusTagValue = string | number | boolean | null | undefined;

export type StatusTagPreset = 'enable' | 'none';

export type StatusTagType = NonNullable<TagProps['type']>;

export interface StatusTagOption {
  label: string;
  type?: StatusTagType;
  bordered?: boolean;
  round?: boolean;
  size?: TagProps['size'];
  strong?: boolean;
  checkable?: boolean;
}

export type StatusTagMap = Record<string, StatusTagOption>;

export interface StatusTagProps {
  value: StatusTagValue;
  preset?: StatusTagPreset;
  statusMap?: StatusTagMap;
  unknown?: StatusTagOption;
  tagProps?: Partial<TagProps>;
}

export const DEFAULT_UNKNOWN_OPTION: StatusTagOption = {
  label: '-',
  type: 'default'
};

const ENABLE_PRESET_MAP: StatusTagMap = {
  enabled: {
    label: '正常',
    type: 'success'
  },
  disabled: {
    label: '禁用',
    type: 'default'
  }
};

const ENABLE_ALIASES = new Set(['1', 'true', 'on', 'open', 'enable', 'enabled', 'normal', 'active']);
const DISABLE_ALIASES = new Set(['0', 'false', 'off', 'close', 'disable', 'disabled', 'inactive']);

function normalizeRawValue(value: StatusTagValue): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value).toLowerCase();
  }

  return value.trim().toLowerCase();
}

function toCanonicalStatusKey(rawKey: string): string {
  if (ENABLE_ALIASES.has(rawKey)) {
    return 'enabled';
  }

  if (DISABLE_ALIASES.has(rawKey)) {
    return 'disabled';
  }

  return rawKey;
}

function getPresetMap(preset: StatusTagPreset): StatusTagMap {
  if (preset === 'enable') {
    return ENABLE_PRESET_MAP;
  }

  return {};
}

export function resolveStatusTagOption(
  value: StatusTagValue,
  options: Pick<StatusTagProps, 'preset' | 'statusMap' | 'unknown'>
): StatusTagOption {
  const rawKey = normalizeRawValue(value);
  const canonicalKey = toCanonicalStatusKey(rawKey);
  const map = options.statusMap || {};
  const presetMap = getPresetMap(options.preset || 'enable');

  return (
    map[rawKey] ||
    map[canonicalKey] ||
    presetMap[canonicalKey] ||
    options.unknown || {
      ...DEFAULT_UNKNOWN_OPTION
    }
  );
}
