<script setup lang="ts">
import SectionHeader from '@/components/custom/section-header.vue';
import type { PhysicalPointProtocolModel } from './physical-point-operate-types';
import { objectTypeOptions } from './physical-point-shared';
import { $t } from '@/locales';

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
      <SectionHeader :title="$t('devicePointManage.bacnetParameters')" type="success" />
    </template>

    <NGrid responsive="screen" item-responsive :x-gap="16">
      <NFormItemGi span="24" :label="$t('devicePointManage.objectType')" path="protocol.bacnet.object_type">
        <NSelect
          v-model:value="protocol.bacnet.object_type"
          :options="objectTypeOptions"
          :placeholder="$t('devicePointManage.objectTypePlaceholder')"
        />
      </NFormItemGi>
      <NFormItemGi
        span="24 s:12"
        :label="$t('devicePointManage.deviceInstance')"
        path="protocol.bacnet.device_instance"
      >
        <NInputNumber v-model:value="protocol.bacnet.device_instance" class="w-full" :min="1" :precision="0" />
      </NFormItemGi>
      <NFormItemGi
        span="24 s:12"
        :label="$t('devicePointManage.objectInstance')"
        path="protocol.bacnet.object_instance"
      >
        <NInputNumber v-model:value="protocol.bacnet.object_instance" class="w-full" :min="1" :precision="0" />
      </NFormItemGi>
    </NGrid>
  </NCard>
</template>
