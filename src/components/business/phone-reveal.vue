<script setup lang="ts">
import { usePhoneReveal } from '@/hooks/business/use-phone-reveal';

defineOptions({
  name: 'PhoneReveal'
});

interface Props {
  userId: CommonType.IdType;
  maskedPhone?: string | null;
  maxWidth?: string;
}

withDefaults(defineProps<Props>(), {
  maskedPhone: null,
  maxWidth: '120px'
});

const { isPhoneVisible, isPhoneLoading, getDisplayPhone, togglePhone } = usePhoneReveal();
</script>

<template>
  <div class="flex-center gap-8px">
    <NEllipsis :style="{ maxWidth }">
      {{ getDisplayPhone(userId, maskedPhone) }}
    </NEllipsis>
    <ButtonIcon
      :loading="isPhoneLoading(userId)"
      :icon="isPhoneVisible(userId) ? 'material-symbols:visibility-off-outline' : 'material-symbols:visibility-outline'"
      :tooltip-content="isPhoneVisible(userId) ? '隐藏手机号' : '显示手机号'"
      @click="togglePhone(userId)"
    />
  </div>
</template>

<style scoped></style>
