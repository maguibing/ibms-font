<script setup lang="ts">
import { useTemplateRef } from 'vue';
import type { FormInst } from 'naive-ui';
import SvgIcon from '@/components/custom/svg-icon.vue';
import type { MonitorDeviceQueryParams } from '../shared';

defineOptions({
  name: 'MonitorDeviceQueryForm'
});

const model = defineModel<MonitorDeviceQueryParams>('model', { required: true });

const emit = defineEmits<{
  search: [];
  reset: [];
}>();

const queryFormRef = useTemplateRef<FormInst>('queryFormRef');

function handleSearch() {
  emit('search');
}

function handleReset() {
  queryFormRef.value?.restoreValidation?.();
  emit('reset');
}
</script>

<template>
  <NForm ref="queryFormRef" :model="model" label-placement="top" class="shrink-0">
    <NFormItem label="设备名称" path="deviceName">
      <NInput v-model:value="model.deviceName" clearable placeholder="请输入设备名称" @keyup.enter="handleSearch" />
    </NFormItem>
    <NSpace :size="8">
      <NButton type="primary" size="small" @click="handleSearch">
        <template #icon>
          <SvgIcon icon="material-symbols:search-rounded" />
        </template>
        搜索
      </NButton>
      <NButton size="small" @click="handleReset">
        <template #icon>
          <SvgIcon icon="material-symbols:refresh-rounded" />
        </template>
        重置
      </NButton>
    </NSpace>
  </NForm>
</template>
