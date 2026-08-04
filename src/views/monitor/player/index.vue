<script setup lang="ts">
import { computed, shallowRef, useTemplateRef } from 'vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { DISPLAY_MODE_OPTIONS, getDisplayModeCount } from './shared';
import type { DisplayMode } from './shared';
import MonitorDeviceChannelSider from './modules/monitor-device-channel-sider.vue';
import MonitorPlayerPanel from './modules/monitor-player-panel.vue';
import { useMonitorCameraSelection } from './modules/use-monitor-camera-selection';

defineOptions({
  name: 'MonitorPlayer'
});

const displayMode = shallowRef<DisplayMode>('quad');
const playerSectionRef = shallowRef<HTMLElement | null>(null);
const deviceChannelSiderRef = useTemplateRef<InstanceType<typeof MonitorDeviceChannelSider>>('deviceChannelSiderRef');
const displayModeOptions = DISPLAY_MODE_OPTIONS;

const currentDisplayCount = computed(() => getDisplayModeCount(displayMode.value));

const {
  visibleCameras,
  hasSelectedCameras,
  selectedChannelIds,
  processingChannelIds,
  handleChannelClick,
  handleClearSelectedCameras,
  handleRemoveSelectedCamera,
  handlePlaySuccess,
  handlePlayError,
  syncSelectedCameras
} = useMonitorCameraSelection({
  currentDisplayCount,
  getDeviceChannelSider: () => deviceChannelSiderRef.value
});

function handleFullscreen() {
  playerSectionRef.value?.requestFullscreen?.();
}
</script>

<template>
  <MonitorDeviceChannelSider
    ref="deviceChannelSiderRef"
    :selected-channel-ids="selectedChannelIds"
    :processing-channel-ids="processingChannelIds"
    @channel-click="handleChannelClick"
    @refreshed="syncSelectedCameras"
  >
    <div class="h-full min-h-0 flex-col-stretch overflow-hidden lt-sm:overflow-auto">
      <NCard
        :bordered="false"
        size="small"
        class="monitor-player-card card-wrapper sm:flex-1-hidden"
        content-class="min-h-0 flex flex-1 flex-col overflow-hidden"
      >
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-12px">
            <div class="flex flex-wrap items-center gap-14px">
              <span class="text-16px font-600">实时监控</span>
              <NButtonGroup size="small">
                <NButton
                  v-for="item in displayModeOptions"
                  :key="item.value"
                  :type="displayMode === item.value ? 'primary' : 'default'"
                  @click="displayMode = item.value"
                >
                  {{ item.label }}
                </NButton>
              </NButtonGroup>
            </div>
            <NSpace :size="8">
              <NButton size="small" :disabled="!hasSelectedCameras" @click="handleClearSelectedCameras">
                <template #icon>
                  <SvgIcon icon="material-symbols:close-rounded" />
                </template>
                一键清空
              </NButton>
              <NButton size="small" type="primary" @click="handleFullscreen">
                <template #icon>
                  <SvgIcon icon="material-symbols:fullscreen-rounded" />
                </template>
                全屏
              </NButton>
            </NSpace>
          </div>
        </template>

        <div ref="playerSectionRef" class="player-shell">
          <MonitorPlayerPanel
            :cameras="visibleCameras"
            :display-mode="displayMode"
            @remove-camera="handleRemoveSelectedCamera"
            @play-success="handlePlaySuccess"
            @play-error="handlePlayError"
          />
        </div>
      </NCard>
    </div>
  </MonitorDeviceChannelSider>
</template>

<style scoped>
.monitor-player-card {
  height: max(560px, calc(100vh - 145px - var(--calc-footer-height, 0px)));
  overflow: hidden;
}

.player-shell {
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

:deep(.n-card-header__main) {
  min-width: 0;
}
</style>
