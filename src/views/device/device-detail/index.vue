<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import { useLoading } from '@sa/hooks';
import StatusTag from '@/components/custom/status-tag.vue';
import { fetchGetDevice } from '@/service/api/device';
import CopyableValue from '@/components/custom/copyable-value.vue';
import { useRouterPush } from '@/hooks/common/router';
import { useAppStore } from '@/store/modules/app';
import { displayValue, formatTime } from '@/utils/common-methods';
import { $t } from '@/locales';
import AlarmRulePanel from '@/views/alarm/rule/modules/alarm-rule-panel.vue';
import TaskList from '@/views/task/task-list/index.vue';
import WorkorderList from '@/views/workorder/workorder-list/index.vue';
import DeviceLogicPointPanel from './modules/device-logic-point-panel.vue';

defineOptions({
  name: 'DeviceDetail'
});

const route = useRoute();
const deviceId = Number(route.query.id);
const { routerBack, routerPushByKey } = useRouterPush();
const { loading, startLoading, endLoading } = useLoading();
const appStore = useAppStore();

const device = shallowRef<Api.Device.Device | null>(null);
const deviceTypeMap = shallowRef<Record<string, Api.Device.DeviceType>>({});
const activeModule = shallowRef('logic-points');

const deviceTypeName = computed(() => {
  if (!device.value) return '-';

  return deviceTypeMap.value[String(device.value.device_type_id)]?.name ?? '-';
});

async function getDeviceDetail(id: number) {
  startLoading();
  const { data, error } = await fetchGetDevice({
    id,
    options: [{ key: 1 }, { key: 2 }, { key: 4 }]
  }).finally(endLoading);
  if (error) return;

  device.value = data.device;
  deviceTypeMap.value = data.device_type_map ?? {};
}

function handleDeviceTypeClick() {
  if (!device.value?.device_type_id) return;

  routerPushByKey('device_device-type-detail', {
    query: {
      id: String(device.value.device_type_id)
    }
  });
}

onMounted(() => {
  getDeviceDetail(deviceId);
});
</script>

<template>
  <div class="h-full min-h-500px flex-col-stretch gap-16px overflow-auto">
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NPageHeader :title="$t('deviceDetail.title')" @back="routerBack">
        <NSpin :show="loading">
          <NEmpty v-if="!device && !loading" :description="$t('deviceDetail.noData')" class="py-48px" />
          <div v-else-if="device" class="mt-16px grid grid-cols-[128px_minmax(0,1fr)] items-stretch lt-sm:grid-cols-1">
            <div
              class="flex min-h-full items-center justify-center rounded-l-8px border border-r-0 border-[var(--n-border-color)] lt-sm:min-h-104px lt-sm:rounded-b-0 lt-sm:rounded-t-8px lt-sm:border-b-0 lt-sm:border-r"
            >
              <span class="size-72px inline-flex items-center justify-center rounded-6px">
                <SvgIcon icon="material-symbols:devices-outline-rounded" class="text-32px text-primary" />
              </span>
            </div>
            <NDescriptions
              label-placement="left"
              :column="appStore.isMobile ? 1 : 2"
              bordered
              size="small"
              label-class="min-w-88px"
              class="min-w-0 [&_.n-descriptions-table-wrapper]:rounded-bl-0 [&_.n-descriptions-table-wrapper]:rounded-tl-0 lt-sm:[&_.n-descriptions-table-wrapper]:rounded-bl-8px lt-sm:[&_.n-descriptions-table-wrapper]:rounded-t-0"
            >
              <NDescriptionsItem :label="$t('deviceDetail.name')">{{ displayValue(device.name) }}</NDescriptionsItem>
              <NDescriptionsItem :label="$t('deviceDetail.identifier')">
                <CopyableValue :value="device.key" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('deviceDetail.deviceType')">
                <NButton text type="primary" @click="handleDeviceTypeClick">{{ deviceTypeName }}</NButton>
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('deviceDetail.status')">
                <StatusTag :value="device.status" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('deviceDetail.createdAt')">
                {{ formatTime(device.created_at) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('deviceDetail.updatedAt')">
                {{ formatTime(device.updated_at) }}
              </NDescriptionsItem>
            </NDescriptions>
          </div>
        </NSpin>
      </NPageHeader>
    </NCard>

    <NCard
      v-if="device"
      :bordered="false"
      size="small"
      class="device-module-card card-wrapper"
      content-class="h-full min-h-0 flex-col-stretch"
    >
      <NTabs v-model:value="activeModule" type="line" animated class="h-full min-h-0">
        <NTabPane name="logic-points" :tab="$t('deviceDetail.logicPoints')">
          <DeviceLogicPointPanel :device-id="deviceId" />
        </NTabPane>
        <NTabPane name="alarms" :tab="$t('deviceDetail.alarms')">
          <AlarmRulePanel :fixed-device-id="deviceId" />
        </NTabPane>
        <NTabPane name="work-orders" :tab="$t('deviceDetail.workOrders')">
          <WorkorderList embedded :default-device="device" />
        </NTabPane>
        <NTabPane name="tasks" :tab="$t('deviceDetail.tasks')">
          <TaskList embedded :fixed-device-id="deviceId" />
        </NTabPane>
      </NTabs>
    </NCard>
  </div>
</template>

<style scoped>
.device-module-card :deep(.n-tabs) {
  display: flex;
  flex-direction: column;
}

.device-module-card {
  height: max(560px, calc(100vh - 320px));
  overflow: hidden;
}

.device-module-card :deep(.n-tabs-pane-wrapper),
.device-module-card :deep(.n-tab-pane) {
  height: 100% !important;
  min-height: 0;
  flex: 1;
  overflow: hidden;
}
</style>
