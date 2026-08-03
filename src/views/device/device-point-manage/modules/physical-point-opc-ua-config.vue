<script setup lang="ts">
import SectionHeader from '@/components/custom/section-header.vue';
import type { PhysicalPointProtocolModel } from './physical-point-operate-types';
import { opcUaDataTypeOptions } from './physical-point-shared';

defineOptions({
  name: 'PhysicalPointOpcUaConfig'
});

const emit = defineEmits<{
  dataTypeChange: [value: number];
}>();

const protocol = defineModel<PhysicalPointProtocolModel>('protocol', {
  required: true
});
</script>

<template>
  <NCard size="small" class="mb-18px">
    <template #header>
      <SectionHeader title="OPC UA 参数" type="info" />
    </template>

    <NFormItem label="节点 ID" path="protocol.opcua.node_id">
      <NInput v-model:value="protocol.opcua.node_id" maxlength="50" show-count placeholder="请输入节点 ID" />
    </NFormItem>
    <NFormItem label="数据类型" path="protocol.opcua.data_type">
      <NSelect
        v-model:value="protocol.opcua.data_type"
        :options="opcUaDataTypeOptions"
        placeholder="请选择数据类型"
        @update:value="emit('dataTypeChange', $event)"
      />
    </NFormItem>
  </NCard>
</template>
