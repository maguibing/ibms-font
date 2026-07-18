<script setup lang="ts">
import { computed } from 'vue';
import { copyText, isClipboardSupported } from '@sa/utils';

defineOptions({
  name: 'CopyableValue'
});

interface Props {
  value?: string | number | null;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: null,
  placeholder: '-'
});

const copyValue = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') return '';
  return String(props.value);
});

const displayValue = computed(() => copyValue.value || props.placeholder);
const canCopy = computed(() => Boolean(copyValue.value));

async function handleCopy() {
  if (!canCopy.value) return;

  if (!isClipboardSupported()) {
    window.$message?.error('当前浏览器不支持复制');
    return;
  }

  const copied = await copyText(copyValue.value);
  if (copied) {
    window.$message?.success('复制成功');
    return;
  }

  window.$message?.error('复制失败，请手动复制');
}
</script>

<template>
  <span
    class="group inline-flex max-w-full items-center gap-6px text-primary"
    :class="canCopy ? 'cursor-pointer' : 'cursor-default'"
    :role="canCopy ? 'button' : undefined"
    :tabindex="canCopy ? 0 : -1"
    :title="canCopy ? '点击复制' : undefined"
    @click="handleCopy"
    @keydown.enter="handleCopy"
    @keydown.space.prevent="handleCopy"
  >
    <NEllipsis class="max-w-240px">{{ displayValue }}</NEllipsis>
    <SvgIcon v-if="canCopy" icon="ep:copy-document" class="flex-none text-16px text-primary" />
  </span>
</template>
