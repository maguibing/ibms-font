<script setup lang="ts">
import SectionHeader from '@/components/custom/section-header.vue';
import type { PhysicalPointProtocolModel } from './physical-point-operate-types';
import { byteOrderOptions, modbusRegisterTypeOptions } from './physical-point-shared';
import { $t } from '@/locales';

defineOptions({
  name: 'PhysicalPointModbusConfig'
});

interface Props {
  canEditBitIndex: boolean;
  isDataTypeDisabled: boolean;
  modbusBitIndexMax: number;
  modbusDataTypeOptions: CommonType.Option<number, string>[];
  showByteOrder: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  dataTypeChange: [value: number];
  registerTypeChange: [value: number];
}>();

const protocol = defineModel<PhysicalPointProtocolModel>('protocol', {
  required: true
});
</script>

<template>
  <NCard size="small" class="mb-18px">
    <template #header>
      <SectionHeader :title="$t('devicePointManage.modbusParameters')" />
    </template>

    <NGrid responsive="screen" item-responsive :x-gap="16">
      <NFormItemGi span="24 s:12" :label="$t('devicePointManage.slaveAddress')" path="protocol.modbus.slave_id">
        <NInputNumber
          v-model:value="protocol.modbus.slave_id"
          class="w-full"
          :min="1"
          :max="247"
          :precision="0"
          :placeholder="$t('devicePointManage.slaveAddressPlaceholder')"
        />
      </NFormItemGi>
      <NFormItemGi span="24 s:12" :label="$t('devicePointManage.registerAddress')" path="protocol.modbus.address">
        <NInputNumber
          v-model:value="protocol.modbus.address"
          class="w-full"
          :min="0"
          :precision="0"
          :placeholder="$t('devicePointManage.registerAddressPlaceholder')"
        />
      </NFormItemGi>
      <NFormItemGi span="24 s:12" :label="$t('devicePointManage.registerType')" path="protocol.modbus.register_type">
        <NSelect
          v-model:value="protocol.modbus.register_type"
          :options="modbusRegisterTypeOptions"
          :placeholder="$t('devicePointManage.registerTypePlaceholder')"
          @update:value="emit('registerTypeChange', $event)"
        />
      </NFormItemGi>
      <NFormItemGi span="24 s:12" :label="$t('devicePointManage.dataType')" path="protocol.modbus.data_type">
        <NSelect
          v-model:value="protocol.modbus.data_type"
          :options="modbusDataTypeOptions"
          :disabled="isDataTypeDisabled"
          :placeholder="$t('devicePointManage.dataTypePlaceholder')"
          @update:value="emit('dataTypeChange', $event)"
        />
      </NFormItemGi>
      <NFormItemGi span="24" :label="$t('devicePointManage.bitIndex')" path="protocol.modbus.bit_index">
        <NInputNumber
          v-model:value="protocol.modbus.bit_index"
          class="w-full"
          :min="0"
          :max="modbusBitIndexMax"
          :precision="0"
          :disabled="!canEditBitIndex"
        />
      </NFormItemGi>
      <NFormItemGi
        v-if="showByteOrder"
        span="24"
        :label="$t('devicePointManage.byteOrder')"
        path="protocol.modbus.byte_order"
      >
        <NSelect
          v-model:value="protocol.modbus.byte_order"
          :options="byteOrderOptions"
          :placeholder="$t('devicePointManage.byteOrderPlaceholder')"
        />
      </NFormItemGi>
    </NGrid>
  </NCard>
</template>
