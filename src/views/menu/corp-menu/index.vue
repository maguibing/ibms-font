<script setup lang="ts">
import { menuPlatformType } from '@/constants/business';
import DefaultMenuManager from '../components/default-menu-manager/index.vue';
</script>

<template>
  <DefaultMenuManager title="企业菜单" :p-type="menuPlatformType.integrator" />
</template>
