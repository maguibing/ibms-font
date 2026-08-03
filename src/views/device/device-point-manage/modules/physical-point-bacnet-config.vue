<script setup lang="ts">
import SectionHeader from '@/components/custom/section-header.vue';
import type { PhysicalPointProtocolModel } from './physical-point-operate-types';
import { objectTypeOptions } from './physical-point-shared';

defineOptions({
  name: 'PhysicalPointBacnetConfig'
});

const protocol = defineModel<PhysicalPointProtocolModel>('protocol', {
  required: true
});
</script>

<template>
  <NCard size="small" class="mb-18px">
    <template #header>
      <SectionHeader title="BACnet 参数" type="success" />
    </template>

    <NGrid responsive="screen" item-responsive :x-gap="16">
      <NFormItemGi span="24" label="对象类型" path="protocol.bacnet.object_type">
        <NSelect
          v-model:value="protocol.bacnet.object_type"
          :options="objectTypeOptions"
          placeholder="请选择对象类型"
        />
      </NFormItemGi>
      <NFormItemGi span="24 s:12" label="设备实例" path="protocol.bacnet.device_instance">
        <NInputNumber v-model:value="protocol.bacnet.device_instance" class="w-full" :min="1" :precision="0" />
      </NFormItemGi>
      <NFormItemGi span="24 s:12" label="对象实例" path="protocol.bacnet.object_instance">
        <NInputNumber v-model:value="protocol.bacnet.object_instance" class="w-full" :min="1" :precision="0" />
      </NFormItemGi>
    </NGrid>
  </NCard>
</template>
