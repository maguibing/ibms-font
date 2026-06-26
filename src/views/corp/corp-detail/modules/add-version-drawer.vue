<script setup lang="ts">
import { useTemplateRef } from 'vue';
import VersionOperateDrawer from '@/components/custom/version-operate-drawer.vue';

defineOptions({
  name: 'AddVersionDrawer'
});

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const drawerRef = useTemplateRef<InstanceType<typeof VersionOperateDrawer>>('drawerRef');

function open(id: CommonType.IdType, name?: string) {
  drawerRef.value?.openAdd(id, name);
}

defineExpose({
  open
});
</script>

<template>
  <VersionOperateDrawer ref="drawerRef" @submitted="emit('submitted')" />
</template>
