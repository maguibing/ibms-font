<script lang="ts">
import type { TagProps } from 'naive-ui';

export type StatusTagValue = string | number | boolean | null | undefined;

export type StatusTagPreset = 'enable' | 'none';

export type StatusTagType = NonNullable<TagProps['type']>;

export interface StatusTagOption {
  label: string;
  labelKey?: string;
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

const DEFAULT_UNKNOWN_OPTION: StatusTagOption = {
  label: '-',
  type: 'default'
};

const ENABLE_PRESET_MAP: StatusTagMap = {
  '1': {
    label: '启用',
    labelKey: 'dict.sys_normal_disable.normal',
    type: 'success'
  },
  '2': {
    label: '停用',
    labelKey: 'dict.sys_normal_disable.disable',
    type: 'error'
  }
};

const ENABLE_ALIASES = new Set(['1', 'true', 'on', 'open', 'enable', 'enabled', 'normal', 'active']);
const DISABLE_ALIASES = new Set(['2', 'false', 'off', 'close', 'disable', 'disabled', 'inactive']);

function normalizeRawValue(value: StatusTagValue): string {
  if (value === null || value === undefined) return '';

  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value).toLowerCase();
  }

  return value.trim().toLowerCase();
}

function toCanonicalStatusKey(rawKey: string): string {
  if (ENABLE_ALIASES.has(rawKey)) return '1';
  if (DISABLE_ALIASES.has(rawKey)) return '2';

  return rawKey;
}

function getPresetMap(preset: StatusTagPreset): StatusTagMap {
  return preset === 'enable' ? ENABLE_PRESET_MAP : {};
}

function resolveStatusTagOption(
  value: StatusTagValue,
  options: Pick<StatusTagProps, 'preset' | 'statusMap' | 'unknown'>
): StatusTagOption {
  const rawKey = normalizeRawValue(value);
  const canonicalKey = toCanonicalStatusKey(rawKey);
  const map = options.statusMap || {};
  const presetMap = getPresetMap(options.preset || 'enable');

  return map[rawKey] || map[canonicalKey] || presetMap[canonicalKey] || options.unknown || DEFAULT_UNKNOWN_OPTION;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { NTag } from 'naive-ui';

defineOptions({
  name: 'StatusTag'
});

const { t, te } = useI18n({ useScope: 'global' });

const props = withDefaults(defineProps<StatusTagProps>(), {
  preset: 'enable',
  unknown: () => DEFAULT_UNKNOWN_OPTION,
  statusMap: undefined,
  tagProps: undefined
});

const option = computed(() => {
  return resolveStatusTagOption(props.value, {
    preset: props.preset,
    statusMap: props.statusMap,
    unknown: props.unknown
  });
});

const displayOption = computed(() => {
  const label = option.value.labelKey && te(option.value.labelKey) ? t(option.value.labelKey) : option.value.label;

  return {
    ...option.value,
    label
  };
});

const mergedTagProps = computed(() => {
  const baseProps = props.tagProps || {};

  return {
    ...baseProps,
    type: option.value.type ?? baseProps.type,
    bordered: option.value.bordered ?? baseProps.bordered,
    round: option.value.round ?? baseProps.round,
    size: option.value.size ?? baseProps.size,
    strong: option.value.strong ?? baseProps.strong,
    checkable: option.value.checkable ?? baseProps.checkable
  };
});
</script>

<template>
  <NTag v-bind="mergedTagProps">
    <slot :option="displayOption" :label="displayOption.label">
      {{ displayOption.label }}
    </slot>
  </NTag>
</template>

<style scoped></style>
