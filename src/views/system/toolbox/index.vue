<script setup lang="ts">
import { shallowRef } from 'vue';
import NetworkDiscoveryCard from './components/NetworkDiscoveryCard.vue';
import PingTestCard from './components/PingTestCard.vue';
import TelnetTestCard from './components/TelnetTestCard.vue';
import { APP_DOWNLOAD_URL } from './components/shared';

type ToolTab = 'discovery' | 'ping' | 'telnet';

defineOptions({
  name: 'SystemToolbox'
});

const activeTab = shallowRef<ToolTab>('discovery');
</script>

<template>
  <div
    class="toolbox-page h-[calc(100vh-112px)] min-h-560px flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto"
  >
    <NCard :bordered="false" size="small" class="card-wrapper" content-class="!py-14px">
      <div class="flex items-center justify-between gap-16px lt-sm:flex-col lt-sm:items-stretch">
        <div class="min-w-0">
          <h2 class="m-0 text-18px text-primary font-600">系统工具箱</h2>
          <p class="mb-0 mt-8px text-13px text-gray-500">网络发现、Ping 测试、Telnet 端口连通性测试</p>
        </div>
        <NPopover placement="bottom-end" trigger="hover">
          <template #trigger>
            <NButton
              tag="a"
              :href="APP_DOWNLOAD_URL"
              target="_blank"
              rel="noopener noreferrer"
              download="android.apk.zip"
              type="primary"
            >
              <template #icon>
                <SvgIcon icon="material-symbols:download-rounded" />
              </template>
              下载安卓包
            </NButton>
          </template>
          <div class="flex-col-center gap-8px">
            <NQrCode :value="APP_DOWNLOAD_URL" :size="176" type="svg" />
            <span class="text-12px text-gray-500">扫码下载安装包</span>
          </div>
        </NPopover>
      </div>
    </NCard>

    <NCard
      :bordered="false"
      size="small"
      class="toolbox-tabs-card card-wrapper min-h-0 flex-1"
      content-class="h-full min-h-0 flex flex-col"
    >
      <NTabs
        v-model:value="activeTab"
        class="toolbox-tabs min-h-0 flex flex-1 flex-col"
        type="segment"
        size="small"
        animated
      >
        <NTabPane name="discovery" tab="网络发现" display-directive="show:lazy">
          <NetworkDiscoveryCard />
        </NTabPane>
        <NTabPane name="ping" tab="Ping 测试" display-directive="show:lazy">
          <PingTestCard />
        </NTabPane>
        <NTabPane name="telnet" tab="Telnet 测试" display-directive="show:lazy">
          <TelnetTestCard />
        </NTabPane>
      </NTabs>
    </NCard>
  </div>
</template>

<style scoped>
.toolbox-tabs :deep(.n-tabs-pane-wrapper) {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.toolbox-tabs :deep(.n-tab-pane) {
  height: 100%;
  min-height: 0;
}

@media (max-width: 900px) {
  .toolbox-page {
    height: auto;
    overflow: auto;
  }

  .toolbox-tabs-card {
    min-height: 620px;
  }
}
</style>
