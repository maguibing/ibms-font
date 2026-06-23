<script setup lang="ts">
import { computed } from 'vue';

defineOptions({
  name: 'DataTypeTag',
  inheritAttrs: false
});

interface Props {
  value?: CommonType.DataType | number | string | null;
}

type TagColor = {
  color?: string;
  borderColor?: string;
  textColor?: string;
};

const props = defineProps<Props>();

const tagInfo = computed<{ label: string; color: TagColor }>(() => {
  switch (Number(props.value)) {
    case 1:
      return { label: '数值', color: { color: '#e6f7ff', borderColor: '#91d5ff', textColor: '#0958d9' } };
    case 2:
      return { label: '开关', color: { color: '#f0fdf4', borderColor: '#86efac', textColor: '#15803d' } };
    case 3:
      return { label: '字符串', color: { color: '#f5f3ff', borderColor: '#c4b5fd', textColor: '#6d28d9' } };
    case 4:
      return { label: '枚举', color: { color: '#fffbeb', borderColor: '#fcd34d', textColor: '#b45309' } };
    default:
      return { label: '未知', color: { color: '#f8fafc', borderColor: '#cbd5e1', textColor: '#475569' } };
  }
});
</script>

<template>
  <NTag :color="tagInfo.color" v-bind="$attrs">{{ tagInfo.label }}</NTag>
</template>

<style scoped></style>
