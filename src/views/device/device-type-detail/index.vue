<script setup lang="ts">
import { onMounted, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import { useLoading } from '@sa/hooks';
import StatusTag from '@/components/custom/status-tag.vue';
import { fetchGetDeviceType } from '@/service/api/device';
import CopyableValue from '@/components/custom/copyable-value.vue';
import { useRouterPush } from '@/hooks/common/router';
import { useAppStore } from '@/store/modules/app';
import { displayValue, formatTime, getOssUrl } from '@/utils/common-methods';
import { $t } from '@/locales';
import AlarmRulePanel from '@/views/alarm/rule/modules/alarm-rule-panel.vue';
import DeviceListPanel from '../device-list/modules/device-list-panel.vue';
import DeviceTypePointPanel from './modules/device-type-point-panel.vue';

defineOptions({
  name: 'DeviceTypeDetail'
});

const route = useRoute();
const deviceTypeId = Number(route.query.id);
const { routerBack } = useRouterPush();
const { loading, startLoading, endLoading } = useLoading();
const appStore = useAppStore();

const deviceType = shallowRef<Api.Device.DeviceType | null>(null);
const activeModule = shallowRef('devices');

async function getDeviceTypeDetail(id: number) {
  startLoading();
  const { data, error } = await fetchGetDeviceType({ id }).finally(endLoading);
  if (error) return;
  deviceType.value = data.device_type;
}

onMounted(() => {
  getDeviceTypeDetail(deviceTypeId);
});
</script>

<template>
  <div class="h-full min-h-500px flex-col-stretch gap-16px overflow-auto">
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NPageHeader :title="$t('deviceTypeDetail.title')" @back="routerBack">
        <NSpin :show="loading">
          <NEmpty v-if="!deviceType && !loading" :description="$t('deviceTypeDetail.noData')" class="py-48px" />
          <div
            v-else-if="deviceType"
            class="mt-16px grid grid-cols-[128px_minmax(0,1fr)] items-stretch lt-sm:grid-cols-1"
          >
            <div
              class="flex min-h-full items-center justify-center rounded-l-8px border border-r-0 border-[var(--n-border-color)] lt-sm:min-h-104px lt-sm:rounded-b-0 lt-sm:rounded-t-8px lt-sm:border-b-0 lt-sm:border-r"
            >
              <span class="size-72px inline-flex items-center justify-center rounded-6px">
                <NImage
                  v-if="deviceType.icon"
                  :src="getOssUrl(deviceType.icon)"
                  :preview-disabled="true"
                  object-fit="contain"
                  class="size-56px"
                />
                <SvgIcon v-else icon="material-symbols:category-outline-rounded" class="text-32px text-primary" />
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
              <NDescriptionsItem :label="$t('deviceTypeDetail.name')">
                {{ displayValue(deviceType.name) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('deviceTypeDetail.identifier')">
                <CopyableValue :value="deviceType.key" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('deviceTypeDetail.status')">
                <StatusTag :value="deviceType.status" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('deviceTypeDetail.createdAt')">
                {{ formatTime(deviceType.created_at) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('deviceTypeDetail.updatedAt')">
                {{ formatTime(deviceType.updated_at) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('deviceTypeDetail.description')" :span="appStore.isMobile ? 1 : 2">
                <span class="whitespace-pre-line">{{ displayValue(deviceType.desc) }}</span>
              </NDescriptionsItem>
            </NDescriptions>
          </div>
        </NSpin>
      </NPageHeader>
    </NCard>

    <NCard
      :bordered="false"
      size="small"
      class="device-type-module-card card-wrapper"
      content-class="h-full min-h-0 flex-col-stretch"
    >
      <NTabs v-model:value="activeModule" type="line" animated class="h-full min-h-0">
        <NTabPane name="devices" :tab="$t('deviceTypeDetail.devices')">
          <DeviceListPanel
            embedded
            :fixed-device-type-id="deviceTypeId"
            :fixed-device-type="deviceType"
            :show-device-type-search="false"
            :show-device-group-search="false"
          />
        </NTabPane>
        <NTabPane name="points" :tab="$t('deviceTypeDetail.points')">
          <DeviceTypePointPanel :device-type-id="deviceTypeId" />
        </NTabPane>
        <NTabPane name="alarms" :tab="$t('deviceTypeDetail.alarms')">
          <AlarmRulePanel :fixed-device-type-id="deviceTypeId" />
        </NTabPane>
      </NTabs>
    </NCard>
  </div>
</template>

<style scoped>
.device-type-module-card :deep(.n-tabs) {
  display: flex;
  flex-direction: column;
}

.device-type-module-card {
  height: max(560px, calc(100vh - 360px));
  overflow: hidden;
}

.device-type-module-card :deep(.n-tabs-pane-wrapper),
.device-type-module-card :deep(.n-tab-pane) {
  height: 100% !important;
  min-height: 0;
  flex: 1;
  overflow: hidden;
}
</style>
