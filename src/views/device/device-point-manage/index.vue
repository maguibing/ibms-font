<script setup lang="ts">
import { computed, shallowRef, useTemplateRef } from 'vue';
import DeviceGatewayTree from './modules/device-gateway-tree.vue';
import LogicPointTree from './modules/logic-point-tree.vue';
import PhysicalPointPanel from './modules/physical-point-panel.vue';

defineOptions({
  name: 'DevicePointManage'
});

const activePointKind = shallowRef<'physical' | 'logic'>('physical');
const deviceGatewayTreeRef = useTemplateRef<InstanceType<typeof DeviceGatewayTree>>('deviceGatewayTreeRef');
const logicPointTreeRef = useTemplateRef<InstanceType<typeof LogicPointTree>>('logicPointTreeRef');
const selectedGatewayId = shallowRef<CommonType.IdType | null>(null);
const gatewayList = shallowRef<Api.Gateway.Gateway[]>([]);

const siderTitle = computed(() => (activePointKind.value === 'physical' ? '边缘设备' : '设备类型'));

function refreshSiderTree() {
  if (activePointKind.value === 'physical') {
    deviceGatewayTreeRef.value?.refreshExpandedGatewayData();
    return;
  }

  logicPointTreeRef.value?.refresh();
}

function handleUpdateGateways(gateways: Api.Gateway.Gateway[]) {
  gatewayList.value = gateways;
}
</script>

<template>
  <TableSiderLayout :sider-title="siderTitle" default-expanded>
    <template #header-extra>
      <NButton size="small" text class="h-18px" @click.stop="refreshSiderTree">
        <template #icon>
          <SvgIcon icon="ic:round-refresh" />
        </template>
      </NButton>
    </template>
    <template #sider>
      <DeviceGatewayTree
        v-show="activePointKind === 'physical'"
        ref="deviceGatewayTreeRef"
        v-model:selected-gateway-id="selectedGatewayId"
        @update:gateways="handleUpdateGateways"
      />
      <LogicPointTree v-if="activePointKind === 'logic'" ref="logicPointTreeRef" />
    </template>

    <div class="h-full min-h-0 flex-col-stretch overflow-hidden lt-sm:overflow-auto">
      <NTabs v-model:value="activePointKind" type="line" animated class="shrink-0 [&_.n-tabs-nav]:mb-0">
        <NTabPane name="physical" tab="物理点位" />
        <NTabPane name="logic" tab="逻辑点位" />
      </NTabs>

      <div v-if="activePointKind === 'physical'" class="min-h-0 flex-col-stretch gap-12px sm:flex-1-hidden">
        <PhysicalPointPanel :selected-gateway-id="selectedGatewayId" :gateway-list="gatewayList" />
      </div>

      <NCard v-else :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
        <NEmpty description="逻辑点位待接入" class="h-full min-h-320px justify-center" />
      </NCard>
    </div>
  </TableSiderLayout>
</template>
