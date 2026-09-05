<script setup lang="ts">
import { computed } from 'vue';
import { getGatewayProtocolLabel } from '@/views/gateway/gateway-list/shared';
import type { ScannedDevice } from './physical-point-scan-types';
import { getProtocolTagType, resolveProtocolType } from './physical-point-shared';
import { $t } from '@/locales';

defineOptions({
  name: 'PhysicalPointScanDeviceList'
});

interface Props {
  activeDeviceKey: string;
  filteredDeviceList: ScannedDevice[];
  isBacnetProtocol: boolean;
  isModbusProtocol: boolean;
  isOpcUaProtocol: boolean;
  keyword: string;
  totalDeviceCount: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [device: ScannedDevice];
  'update:keyword': [keyword: string];
}>();

const keywordModel = computed({
  get: () => props.keyword,
  set: value => emit('update:keyword', value)
});

function handleSelectDevice(device: ScannedDevice) {
  emit('select', device);
}
</script>

<template>
  <div
    class="h-full min-h-0 flex flex-col overflow-hidden rounded-8px border border-[var(--scan-params-border-color,var(--n-border-color))] border-solid bg-[var(--n-color)] p-12px"
  >
    <div class="mb-10px flex items-center justify-between gap-8px">
      <div class="text-14px text-[var(--n-text-color-1)] font-600">{{ $t('devicePointManage.deviceList') }}</div>
      <div
        class="shrink-0 rounded-full border border-primary/24 bg-primary/8 px-10px py-2px text-12px text-primary font-600"
      >
        {{ $t('devicePointManage.deviceCount', { count: totalDeviceCount }) }}
      </div>
    </div>
    <NInput
      v-model:value="keywordModel"
      clearable
      :placeholder="$t('devicePointManage.deviceSearchPlaceholder')"
      class="mx-2px mb-8px"
    />
    <NScrollbar
      class="mx-2px min-h-0 flex-1 border-t border-[var(--scan-params-border-color,var(--n-border-color))] border-t-solid pt-10px"
    >
      <div class="flex flex-col gap-8px">
        <NEmpty
          v-if="filteredDeviceList.length === 0"
          size="small"
          :description="$t('devicePointManage.noMatchingDevices')"
          class="py-24px"
        />
        <template v-else>
          <div
            v-for="device in filteredDeviceList"
            :key="device.scanKey"
            class="cursor-pointer rounded-8px border border-solid px-12px py-8px transition-colors"
            :class="
              activeDeviceKey === device.scanKey
                ? 'border-primary/32 bg-primary/8'
                : 'border-[var(--scan-params-border-color,var(--n-border-color))] bg-[var(--n-color)] hover:(border-primary/32 bg-primary/8)'
            "
            @click="handleSelectDevice(device)"
          >
            <div class="flex items-start justify-between gap-8px">
              <div
                class="min-w-0 overflow-hidden text-14px text-[var(--n-text-color-1)] font-600 leading-20px text-ellipsis whitespace-nowrap"
              >
                {{ device.name }}
              </div>
              <NTag size="small" :type="getProtocolTagType(device.protocol)" :bordered="false" class="flex-none">
                {{ getGatewayProtocolLabel(resolveProtocolType(device.protocol)) }}
              </NTag>
            </div>
            <div class="mt-4px flex flex-col gap-3px break-all text-12px text-[var(--n-text-color-3)] leading-18px">
              <div>{{ $t('devicePointManage.addressWithValue', { value: device.address }) }}</div>
              <div v-if="isBacnetProtocol">
                {{ $t('devicePointManage.deviceInstanceWithValue', { value: device.deviceInstance }) }}
              </div>
              <div v-if="isModbusProtocol">
                {{ $t('devicePointManage.slaveAddressWithValue', { value: device.modbus?.slave_id ?? '-' }) }}
              </div>
              <div v-if="isOpcUaProtocol">
                {{ $t('devicePointManage.nodeIdWithValue', { value: device.opcua?.node_id ?? '-' }) }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </NScrollbar>
  </div>
</template>
