<script setup lang="ts">
import type { ScannedDevice, ScannedPhysicalPoint } from './physical-point-scan-types';
import { $t } from '@/locales';

defineOptions({
  name: 'PhysicalPointScanDeviceDetail'
});

interface Props {
  activeDevice: ScannedDevice | null;
  activeDevicePointCountText: string;
  activeDevicePointLoading: boolean;
  isBacnetProtocol: boolean;
  isModbusProtocol: boolean;
  isOpcUaProtocol: boolean;
  pointColumns: NaiveUI.TableColumn<ScannedPhysicalPoint>[];
  pointTableScrollX: number;
  registerTypeLabel: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  scanPoint: [device: ScannedDevice];
}>();

const modbusStartRegisterAddress = defineModel<number | null>('modbusStartRegisterAddress', { required: true });
const modbusPointCount = defineModel<number | null>('modbusPointCount', { required: true });
const opcUaMaxPointsPerNode = defineModel<number | null>('opcUaMaxPointsPerNode', { required: true });
const opcUaMaxDepth = defineModel<number | null>('opcUaMaxDepth', { required: true });

function handleScanPoint() {
  if (!props.activeDevice) return;

  emit('scanPoint', props.activeDevice);
}

function getPointRowKey(row: ScannedPhysicalPoint) {
  return row.pointKey;
}
</script>

<template>
  <div
    class="detail-panel h-full min-h-0 min-w-0 flex flex-col overflow-hidden rounded-8px border border-[var(--scan-params-border-color,var(--n-border-color))] border-solid bg-[var(--n-color)] p-14px"
  >
    <div v-if="!activeDevice" class="h-full flex items-center justify-center">
      <NEmpty :description="$t('devicePointManage.selectDevice')" />
    </div>

    <div v-else class="h-full min-h-0 flex flex-col">
      <div
        class="shrink-0 flex items-center justify-between gap-12px border-b border-[var(--scan-params-border-color,var(--n-border-color))] border-b-solid pb-12px"
      >
        <div class="min-w-0">
          <div class="overflow-hidden text-15px text-[var(--n-text-color-1)] font-600 text-ellipsis whitespace-nowrap">
            {{ activeDevice.name }}
          </div>
          <div class="mt-4px flex flex-wrap gap-x-12px gap-y-8px text-12px text-[var(--n-text-color-3)]">
            <span>{{ $t('devicePointManage.addressWithValue', { value: activeDevice.address }) }}</span>
            <span v-if="isModbusProtocol">
              {{ $t('devicePointManage.slaveAddressWithValue', { value: activeDevice.modbus?.slave_id ?? '-' }) }}
            </span>
            <span v-if="isBacnetProtocol">
              {{ $t('devicePointManage.deviceInstanceWithValue', { value: activeDevice.deviceInstance }) }}
            </span>
            <span v-if="isOpcUaProtocol">
              {{ $t('devicePointManage.nodeIdWithValue', { value: activeDevice.opcua?.node_id ?? '-' }) }}
            </span>
          </div>
        </div>
        <NButton type="primary" :loading="activeDevicePointLoading" class="shrink-0" @click="handleScanPoint">
          <template #icon>
            <SvgIcon icon="material-symbols:radar" class="text-icon" />
          </template>
          {{ $t(activeDevice.pointScanned ? 'devicePointManage.rescanPoints' : 'devicePointManage.scanPoints') }}
        </NButton>
      </div>

      <div
        v-if="isModbusProtocol || isOpcUaProtocol"
        class="mt-12px rounded-8px border border-[var(--scan-params-border-color,var(--n-border-color))] border-solid p-12px"
      >
        <div class="mb-10px flex items-center gap-8px text-13px text-[var(--n-text-color-1)] font-600">
          <span aria-hidden="true" class="h-16px w-4px rounded-4px bg-primary"></span>
          <span>{{ $t('devicePointManage.pointScanParameters') }}</span>
        </div>
        <NForm label-placement="top" :show-feedback="false">
          <NGrid v-if="isModbusProtocol" responsive="screen" item-responsive :x-gap="16">
            <NFormItemGi span="24 s:8" :label="$t('devicePointManage.startRegisterAddress')">
              <NInputNumber
                v-model:value="modbusStartRegisterAddress"
                class="w-full"
                :min="0"
                :max="65535"
                :precision="0"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:8" :label="$t('devicePointManage.pointCount')">
              <NInputNumber v-model:value="modbusPointCount" class="w-full" :min="1" :max="125" :precision="0" />
            </NFormItemGi>
            <NFormItemGi span="24 s:8" :label="$t('devicePointManage.registerType')">
              <NInput :value="registerTypeLabel" readonly />
            </NFormItemGi>
          </NGrid>

          <NGrid v-else-if="isOpcUaProtocol" responsive="screen" item-responsive :x-gap="16">
            <NFormItemGi span="24 s:12" :label="$t('devicePointManage.maxPointsPerNode')">
              <NInputNumber v-model:value="opcUaMaxPointsPerNode" class="w-full" :min="1" :max="10000" :precision="0" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12" :label="$t('devicePointManage.maxDepth')">
              <NInputNumber v-model:value="opcUaMaxDepth" class="w-full" :min="1" :max="1000" :precision="0" />
            </NFormItemGi>
          </NGrid>
        </NForm>
      </div>

      <NSpin :show="activeDevicePointLoading" class="mt-12px min-h-0 flex-1">
        <div class="mb-10px flex items-center justify-between gap-8px">
          <span class="text-13px text-[var(--n-text-color-2)] font-500">{{ $t('devicePointManage.pointList') }}</span>
          <span
            class="shrink-0 rounded-full border border-success/28 bg-success/10 px-10px py-2px text-12px text-success font-600"
          >
            {{ activeDevicePointCountText }}
          </span>
        </div>

        <NEmpty
          v-if="!activeDevice.pointScanned"
          :description="$t('devicePointManage.scanPointsHint')"
          class="min-h-240px flex items-center justify-center"
        />
        <NEmpty
          v-else-if="activeDevice.pointList.length === 0"
          :description="$t('devicePointManage.noPoints')"
          class="min-h-240px flex items-center justify-center"
        />
        <NDataTable
          v-else
          :columns="pointColumns"
          :data="activeDevice.pointList"
          :row-key="getPointRowKey"
          :scroll-x="pointTableScrollX"
          :max-height="340"
          size="small"
          remote
        />
      </NSpin>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 900px) {
  .detail-panel {
    min-height: 420px;
  }
}
</style>
