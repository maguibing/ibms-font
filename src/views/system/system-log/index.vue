<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import DeviceOperationLog from './modules/device-operation-log.vue';
import SystemOperationLog from './modules/system-operation-log.vue';

defineOptions({
  name: 'SystemLog'
});

type LogType = 'system' | 'device';

type LogTab = {
  key: LogType;
  label: string;
  icon: string;
  disabled?: boolean;
};

const activeLogType = shallowRef<LogType>('system');
const breakpoints = useBreakpoints(breakpointsTailwind);
const isCompact = breakpoints.smaller('lg');

const logTitleMap: Record<LogType, string> = {
  system: '系统日志',
  device: '设备操作日志'
};

const logMenuOptions: LogTab[] = [
  {
    label: logTitleMap.system,
    key: 'system',
    icon: 'lucide:file-text'
  },
  {
    label: logTitleMap.device,
    key: 'device',
    icon: 'material-symbols:devices-outline-rounded'
  }
];

const tabPlacement = computed<'left' | 'top'>(() => (isCompact.value ? 'top' : 'left'));
const activeLogComponent = computed(() => (activeLogType.value === 'system' ? SystemOperationLog : DeviceOperationLog));
</script>

<template>
  <div class="system-log-layout flex items-stretch gap-16px overflow-hidden lt-lg:flex-col lt-sm:overflow-auto">
    <NCard
      :bordered="false"
      size="small"
      class="system-log-sider card-wrapper flex-shrink-0 self-stretch lt-lg:w-full lg:w-180px"
      content-class="lg:h-full"
    >
      <NTabs
        v-model:value="activeLogType"
        type="line"
        :placement="tabPlacement"
        animated
        pane-class="hidden"
        class="lg:h-full"
      >
        <NTabPane v-for="item in logMenuOptions" :key="item.key" :name="item.key" :disabled="item.disabled">
          <template #tab>
            <span class="system-log-tab-label">
              <SvgIcon :icon="item.icon" class="text-icon" />
              <span>{{ item.label }}</span>
            </span>
          </template>
        </NTabPane>
      </NTabs>
    </NCard>

    <div class="min-w-0 flex-col-stretch lg:flex-1-hidden">
      <KeepAlive>
        <component :is="activeLogComponent" />
      </KeepAlive>
    </div>
  </div>
</template>

<style scoped>
.system-log-sider :deep(.n-tabs-nav) {
  width: 100%;
}

.system-log-layout {
  --system-log-min-height: max(500px, calc(100vh - 85px - var(--calc-footer-height, 0px)));

  min-height: var(--system-log-min-height);
}

.system-log-sider :deep(.n-tabs-tab) {
  justify-content: flex-start;
}

.system-log-tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
