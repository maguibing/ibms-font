<script setup lang="ts">
defineOptions({
  name: 'ManualButton'
});

const MANUAL_URL = import.meta.env.DEV ? 'http://192.168.60.22:8088/' : 'https://doc.csautodriver.com/';

function openManual() {
  window.open(MANUAL_URL, '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <ButtonIcon
    icon="material-symbols:menu-book-outline"
    :tooltip-content="$t('icon.manual')"
    :aria-label="$t('icon.manual')"
    @click="openManual"
  />
</template>

<style scoped></style>
