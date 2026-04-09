<script setup lang="ts">
import { computed } from 'vue';
import { NTag } from 'naive-ui';
import type { StatusTagProps } from './shared';
import { resolveStatusTagOption } from './shared';

defineOptions({
  name: 'StatusTag'
});

const props = withDefaults(defineProps<StatusTagProps>(), {
  preset: 'enable',
  unknown: () => ({
    label: '-',
    type: 'default'
  }),
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
    <slot :option="option" :label="option.label">
      {{ option.label }}
    </slot>
  </NTag>
</template>

<style scoped></style>
