<script setup lang="ts">
import { computed, nextTick, onMounted, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import { useLoading } from '@sa/hooks';
import { fetchGetPhysicalPoint } from '@/service/api/device';
import CopyableValue from '@/components/custom/copyable-value.vue';
import EnumTag from '@/components/custom/enum-tag.vue';
import { MessageType } from '@/enum/business';
import type { RealTimeType } from '@/enum/business';
import { useRealtimeSubscription } from '@/hooks/business/realtime-subscription';
import { useRouterPush } from '@/hooks/common/router';
import { useAppStore } from '@/store/modules/app';
import { displayValue } from '@/utils/common-methods';
import { sendWebSocketMessage } from '@/utils/websocket';
import PhysicalPointCommandHistoryPanel from './modules/physical-point-command-history-panel.vue';
import PhysicalPointRealtimeDataPanel from './modules/physical-point-realtime-data-panel.vue';
import PhysicalPointReportHistoryPanel from './modules/physical-point-report-history-panel.vue';

defineOptions({
  name: 'PhysicalPointDetail'
});

const route = useRoute();
const physicalPointId = Number(route.query.id);
const { routerBack } = useRouterPush();
const { loading, startLoading, endLoading } = useLoading();
const appStore = useAppStore();

const physicalPoint = shallowRef<Api.Device.PhysicalPoint | null>(null);
const activeTab = shallowRef('realtime-data');
const accessLevel = computed(() => Number(physicalPoint.value?.protocol?.access_level));
const isNumberDataType = computed(() => Number(physicalPoint.value?.data_type) === 1);
const isReadableAccess = computed(() => accessLevel.value === 1 || accessLevel.value === 3);
const showRealtimeDataTab = computed(() => isNumberDataType.value && isReadableAccess.value);
const showReportHistoryTab = computed(() => accessLevel.value !== 2);
const showCommandHistoryTab = computed(() => accessLevel.value !== 1);

function getDefaultTab() {
  if (showRealtimeDataTab.value) return 'realtime-data';
  if (showReportHistoryTab.value) return 'report-history';

  return 'command-history';
}

function buildRealtimePayload(realTimeType: RealTimeType) {
  if (!physicalPoint.value) return null;

  return {
    project_id: Number(physicalPoint.value.project_id),
    real_time_type: realTimeType,
    biz_type: 1,
    physical_point_key_list: [String(physicalPoint.value.key)]
  };
}

function sendRealtimeMessage(realTimeType: RealTimeType) {
  const payload = buildRealtimePayload(realTimeType);
  if (!payload) return false;

  return sendWebSocketMessage({
    type: MessageType.DevicePointRealTimeData,
    payload
  });
}

const { subscribe: subscribeRealtimeData, isActive: isRealtimeActive } = useRealtimeSubscription(sendRealtimeMessage);

async function getPhysicalPointDetail(id: number) {
  startLoading();
  const { data, error } = await fetchGetPhysicalPoint({ id }).finally(endLoading);
  if (error || !isRealtimeActive()) return;

  physicalPoint.value = data.physical_point;
  activeTab.value = getDefaultTab();

  if (showRealtimeDataTab.value) {
    await nextTick();
    subscribeRealtimeData();
  }
}

onMounted(() => {
  getPhysicalPointDetail(physicalPointId);
});
</script>

<template>
  <div class="h-full min-h-500px flex-col-stretch gap-16px overflow-auto">
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NPageHeader title="物理点位详情" @back="routerBack">
        <NSpin :show="loading">
          <NEmpty v-if="!physicalPoint && !loading" description="暂无物理点位详情" class="py-48px" />
          <div
            v-else-if="physicalPoint"
            class="mt-16px grid grid-cols-[128px_minmax(0,1fr)] items-stretch lt-sm:grid-cols-1"
          >
            <div
              class="flex min-h-full items-center justify-center rounded-l-8px border border-r-0 border-[var(--n-border-color)] lt-sm:min-h-104px lt-sm:rounded-b-0 lt-sm:rounded-t-8px lt-sm:border-b-0 lt-sm:border-r"
            >
              <span class="size-72px inline-flex items-center justify-center rounded-6px">
                <SvgIcon icon="material-symbols:sensors-outline-rounded" class="text-32px text-primary" />
              </span>
            </div>
            <NDescriptions
              label-placement="left"
              :column="appStore.isMobile ? 1 : 2"
              bordered
              size="small"
              label-class="min-w-104px"
              class="min-w-0 [&_.n-descriptions-table-wrapper]:rounded-bl-0 [&_.n-descriptions-table-wrapper]:rounded-tl-0 lt-sm:[&_.n-descriptions-table-wrapper]:rounded-bl-8px lt-sm:[&_.n-descriptions-table-wrapper]:rounded-t-0"
            >
              <NDescriptionsItem label="物理点位名称">
                {{ displayValue(physicalPoint.name) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="物理点位标识">
                <CopyableValue :value="physicalPoint.key" />
              </NDescriptionsItem>
              <NDescriptionsItem label="是否存储">
                <NTag :type="physicalPoint.is_storage ? 'success' : 'default'" :bordered="false">
                  {{ physicalPoint.is_storage ? '是' : '否' }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem label="访问权限">
                <EnumTag variant="accessLevel" :value="physicalPoint.protocol?.access_level" />
              </NDescriptionsItem>
              <NDescriptionsItem label="数据类型">
                <EnumTag :value="physicalPoint.data_type" />
              </NDescriptionsItem>
            </NDescriptions>
          </div>
        </NSpin>
      </NPageHeader>
    </NCard>

    <NCard
      v-if="physicalPoint"
      :bordered="false"
      size="small"
      class="physical-point-module-card card-wrapper"
      content-class="h-full min-h-0 flex-col-stretch"
    >
      <NTabs v-model:value="activeTab" type="line" animated class="h-full min-h-0">
        <NTabPane v-if="showRealtimeDataTab" name="realtime-data" tab="实时数据" display-directive="show">
          <PhysicalPointRealtimeDataPanel :physical-point="physicalPoint" />
        </NTabPane>
        <NTabPane v-if="showReportHistoryTab" name="report-history" tab="上报历史">
          <PhysicalPointReportHistoryPanel :physical-point="physicalPoint" />
        </NTabPane>
        <NTabPane v-if="showCommandHistoryTab" name="command-history" tab="下发历史">
          <PhysicalPointCommandHistoryPanel :physical-point="physicalPoint" />
        </NTabPane>
      </NTabs>
    </NCard>
  </div>
</template>

<style scoped>
.physical-point-module-card :deep(.n-tabs) {
  display: flex;
  flex-direction: column;
}

.physical-point-module-card {
  height: max(420px, calc(100vh - 300px));
  overflow: hidden;
}

.physical-point-module-card :deep(.n-tabs-pane-wrapper),
.physical-point-module-card :deep(.n-tab-pane) {
  height: 100% !important;
  min-height: 0;
  flex: 1;
  overflow: hidden;
}
</style>
