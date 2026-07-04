<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
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
    icon: 'material-symbols:receipt-long-outline-rounded'
  },
  {
    label: logTitleMap.device,
    key: 'device',
    icon: 'material-symbols:devices-outline-rounded',
    disabled: true
  }
];

const activeLogTitle = computed(() => logTitleMap[activeLogType.value]);
const tabPlacement = computed<'left' | 'top'>(() => (isCompact.value ? 'top' : 'left'));
</script>

<template>
  <div class="min-h-880px flex items-stretch gap-16px overflow-hidden lt-lg:flex-col lt-lg:overflow-auto">
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

    <div class="min-w-0 flex-1-hidden flex-col-stretch">
      <SystemOperationLog v-if="activeLogType === 'system'" />
      <NCard v-else :title="activeLogTitle" :bordered="false" size="small" class="card-wrapper" />
    </div>
  </div>
</template>

<style scoped>
.system-log-sider :deep(.n-tabs-nav) {
  width: 100%;
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
