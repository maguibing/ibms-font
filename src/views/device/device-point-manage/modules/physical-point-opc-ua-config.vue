<script setup lang="ts">
import SectionHeader from '@/components/custom/section-header.vue';
import type { PhysicalPointProtocolModel } from './physical-point-operate-types';
import { opcUaDataTypeOptions } from './physical-point-shared';
import { $t } from '@/locales';

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
      <SectionHeader :title="$t('devicePointManage.opcUaParameters')" type="info" />
    </template>

    <NFormItem :label="$t('devicePointManage.nodeId')" path="protocol.opcua.node_id">
      <NInput
        v-model:value="protocol.opcua.node_id"
        maxlength="50"
        show-count
        :placeholder="$t('devicePointManage.nodeIdPlaceholder')"
      />
    </NFormItem>
    <NFormItem :label="$t('devicePointManage.dataType')" path="protocol.opcua.data_type">
      <NSelect
        v-model:value="protocol.opcua.data_type"
        :options="opcUaDataTypeOptions"
        :placeholder="$t('devicePointManage.dataTypePlaceholder')"
        @update:value="emit('dataTypeChange', $event)"
      />
    </NFormItem>
  </NCard>
</template>
