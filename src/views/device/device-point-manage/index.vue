<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DeviceGatewayTree from './modules/device-gateway-tree.vue';
import LogicPointPanel from './modules/logic-point-panel.vue';
import LogicPointTree from './modules/logic-point-tree.vue';
import PhysicalPointPanel from './modules/physical-point-panel.vue';

defineOptions({
  name: 'DevicePointManage'
});

type PointKind = 'physical' | 'logic';

type LogicPointTreeSelection = {
  id: CommonType.IdType;
  type: 1 | 2;
};

const route = useRoute();
const router = useRouter();
const deviceGatewayTreeRef = useTemplateRef<InstanceType<typeof DeviceGatewayTree>>('deviceGatewayTreeRef');
const logicPointTreeRef = useTemplateRef<InstanceType<typeof LogicPointTree>>('logicPointTreeRef');
const selectedGatewayId = shallowRef<CommonType.IdType | null>(null);
const selectedLogicPointNode = shallowRef<LogicPointTreeSelection | null>(null);
const physicalPointSearchKey = shallowRef('');
const logicPointSearchKey = shallowRef('');
const gatewayList = shallowRef<Api.Gateway.Gateway[]>([]);

const activePointKind = computed<PointKind>({
  get: () => (route.query.tab === 'logic' ? 'logic' : 'physical'),
  set: tab => {
    physicalPointSearchKey.value = '';
    logicPointSearchKey.value = '';
    router.replace({
      query: {
        ...route.query,
        tab
      }
    });
  }
});

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

async function handleJumpToPhysicalPoint(key: string) {
  physicalPointSearchKey.value = key;
  selectedGatewayId.value = null;
  await router.replace({ query: { ...route.query, tab: 'physical' } });
  await nextTick();
  physicalPointSearchKey.value = '';
}

async function handleJumpToLogicPoint(key: string) {
  logicPointSearchKey.value = key;
  selectedLogicPointNode.value = null;
  await router.replace({ query: { ...route.query, tab: 'logic' } });
  await nextTick();
  logicPointSearchKey.value = '';
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
      <LogicPointTree
        v-if="activePointKind === 'logic'"
        ref="logicPointTreeRef"
        v-model:selected-node="selectedLogicPointNode"
      />
    </template>

    <div class="h-full min-h-0 flex-col-stretch overflow-hidden lt-sm:overflow-auto">
      <NTabs v-model:value="activePointKind" type="segment" animated class="shrink-0 [&_.n-tabs-nav]:mb-0">
        <NTabPane name="physical" tab="物理点位" />
        <NTabPane name="logic" tab="逻辑点位" />
      </NTabs>

      <div v-if="activePointKind === 'physical'" class="min-h-0 flex-col-stretch gap-12px sm:flex-1-hidden">
        <PhysicalPointPanel
          :selected-gateway-id="selectedGatewayId"
          :gateway-list="gatewayList"
          :initial-search-key="physicalPointSearchKey"
          @jump-to-logic-point="handleJumpToLogicPoint"
        />
      </div>

      <div v-else class="min-h-0 flex-col-stretch gap-12px sm:flex-1-hidden">
        <LogicPointPanel
          :selected-node="selectedLogicPointNode"
          :initial-search-key="logicPointSearchKey"
          @jump-to-physical-point="handleJumpToPhysicalPoint"
        />
      </div>
    </div>
  </TableSiderLayout>
</template>
