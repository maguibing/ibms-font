<script setup lang="ts">
import { computed } from 'vue';
import { twMerge } from 'tailwind-merge';
import { usePhoneReveal } from '@/hooks/business/use-phone-reveal';

defineOptions({
  name: 'PhoneReveal'
});

interface Props {
  userId: CommonType.IdType;
  maskedPhone?: string | null;
  maxWidth?: string;
  contentClass?: string;
  buttonClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  maskedPhone: null,
  maxWidth: '120px',
  contentClass: '',
  buttonClass: ''
});

const { isPhoneVisible, isPhoneLoading, getDisplayPhone, togglePhone } = usePhoneReveal();

// 留着吧 gap-8px
const contentClass = computed(() => twMerge('flex items-center justify-center', props.contentClass));
</script>

<template>
  <div :class="contentClass">
    <NEllipsis :style="{ maxWidth }">
      {{ getDisplayPhone(userId, maskedPhone) }}
    </NEllipsis>
    <ButtonIcon
      :class="buttonClass"
      :loading="isPhoneLoading(userId)"
      :icon="isPhoneVisible(userId) ? 'material-symbols:visibility-off-outline' : 'material-symbols:visibility-outline'"
      :tooltip-content="isPhoneVisible(userId) ? '隐藏手机号' : '显示手机号'"
      @click="togglePhone(userId)"
    />
  </div>
</template>

<style scoped></style>
