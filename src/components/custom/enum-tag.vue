<script setup lang="ts">
import { computed } from 'vue';

defineOptions({
  name: 'EnumTag',
  inheritAttrs: false
});

interface Props {
  variant?: 'dataType' | 'accessLevel';
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

const tagConfigMap: Record<NonNullable<Props['variant']>, Record<number, TagConfig>> = {
  dataType: {
    1: { label: '数值', color: { color: '#e6f7ff', borderColor: '#91d5ff', textColor: '#0958d9' } },
    2: { label: '开关', color: { color: '#f0fdf4', borderColor: '#86efac', textColor: '#15803d' } },
    3: { label: '字符串', color: { color: '#f5f3ff', borderColor: '#c4b5fd', textColor: '#6d28d9' } },
    4: { label: '枚举', color: { color: '#fffbeb', borderColor: '#fcd34d', textColor: '#b45309' } }
  },
  accessLevel: {
    1: { label: '只读', color: { color: '#e6f7ff', borderColor: '#91d5ff', textColor: '#0958d9' } },
    2: { label: '只写', color: { color: '#fffbeb', borderColor: '#fcd34d', textColor: '#b45309' } },
    3: { label: '读写', color: { color: '#f0fdf4', borderColor: '#86efac', textColor: '#15803d' } }
  }
};

const defaultTagInfo: TagConfig = {
  label: '未知',
  color: { color: '#f8fafc', borderColor: '#cbd5e1', textColor: '#475569' }
};

const tagInfo = computed<{ label: string; color: TagColor }>(() => {
  const variant = props.variant ?? 'dataType';

  return tagConfigMap[variant][Number(props.value)] ?? defaultTagInfo;
});
</script>

<template>
  <NTag :color="tagInfo.color" v-bind="$attrs">{{ tagInfo.label }}</NTag>
</template>

<style scoped></style>
