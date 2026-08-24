<script setup lang="ts">
import { computed } from 'vue';
import { $t } from '@/locales';

defineOptions({
  name: 'EnumTag',
  inheritAttrs: false
});

interface Props {
  variant?: 'dataType' | 'accessLevel' | 'protocol';
  value?: CommonType.DataType | number | string | null;
}

type TagColor = {
  color?: string;
  borderColor?: string;
  textColor?: string;
};

type TagConfig = {
  label: string;
  color: TagColor;
};

const props = defineProps<Props>();

const tagConfigMap = computed<Record<NonNullable<Props['variant']>, Record<number, TagConfig>>>(() => ({
  dataType: {
    1: {
      label: $t('dict.data_type.number'),
      color: { color: '#e6f7ff', borderColor: '#91d5ff', textColor: '#0958d9' }
    },
    2: {
      label: $t('dict.data_type.switch'),
      color: { color: '#f0fdf4', borderColor: '#86efac', textColor: '#15803d' }
    },
    3: { label: $t('dict.data_type.text'), color: { color: '#f5f3ff', borderColor: '#c4b5fd', textColor: '#6d28d9' } },
    4: { label: $t('dict.data_type.enum'), color: { color: '#fffbeb', borderColor: '#fcd34d', textColor: '#b45309' } }
  },
  accessLevel: {
    1: {
      label: $t('dict.access_level.readOnly'),
      color: { color: '#e6f7ff', borderColor: '#91d5ff', textColor: '#0958d9' }
    },
    2: {
      label: $t('dict.access_level.writeOnly'),
      color: { color: '#fffbeb', borderColor: '#fcd34d', textColor: '#b45309' }
    },
    3: {
      label: $t('dict.access_level.readWrite'),
      color: { color: '#f0fdf4', borderColor: '#86efac', textColor: '#15803d' }
    }
  },
  protocol: {
    1: { label: 'MQTT', color: { color: '#e6f7ff', borderColor: '#91d5ff', textColor: '#0958d9' } },
    2: { label: 'HTTP Server', color: { color: '#f0fdf4', borderColor: '#86efac', textColor: '#15803d' } },
    3: { label: 'HTTP Client', color: { color: '#f5f3ff', borderColor: '#c4b5fd', textColor: '#6d28d9' } },
    4: { label: 'Modbus', color: { color: '#fffbeb', borderColor: '#fcd34d', textColor: '#b45309' } },
    5: { label: 'BACnet', color: { color: '#ecfeff', borderColor: '#67e8f9', textColor: '#0e7490' } },
    6: { label: 'OPC UA', color: { color: '#fff1f2', borderColor: '#fda4af', textColor: '#be123c' } }
  }
}));

const defaultTagInfo = computed<TagConfig>(() => ({
  label: $t('common.unknown'),
  color: { color: '#f8fafc', borderColor: '#cbd5e1', textColor: '#475569' }
}));

const tagInfo = computed<{ label: string; color: TagColor }>(() => {
  const variant = props.variant ?? 'dataType';
  return tagConfigMap.value[variant][Number(props.value)] ?? defaultTagInfo.value;
});
</script>

<template>
  <NTag :color="tagInfo.color" v-bind="$attrs">{{ tagInfo.label }}</NTag>
</template>

<style scoped></style>
