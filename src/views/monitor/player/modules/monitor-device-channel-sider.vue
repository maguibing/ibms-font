<script setup lang="ts">
import { computed, h, onMounted, reactive, shallowRef } from 'vue';
import type { TreeOption } from 'naive-ui';
import { fetchGetMonitorChannelList, fetchGetMonitorList } from '@/service/api/monitor';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { getChannelTreeKey, getDeviceTreeKey, getEmptyTreeKey, getErrorMessage } from '../shared';
import type { ChannelItem, DeviceItem, MonitorDeviceQueryParams, MonitorTreeOption } from '../shared';
import MonitorDeviceQueryForm from './monitor-device-query-form.vue';

defineOptions({
  name: 'MonitorDeviceChannelSider'
});

const props = defineProps<{
  selectedChannelIds: CommonType.IdType[];
  processingChannelIds: CommonType.IdType[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  channelClick: [device: DeviceItem, channel: ChannelItem];
  refreshed: [];
}>();

const loading = shallowRef(false);
const channelLoading = shallowRef(false);
const deviceList = shallowRef<DeviceItem[]>([]);
const deviceChannelMap = shallowRef<Record<string, ChannelItem[]>>({});
const channelOnlineMap = shallowRef<Record<string, boolean>>({});
const expandedTreeKeys = shallowRef<Array<string | number>>([]);
const deviceChannelRequestMap = new Map<string, Promise<ChannelItem[]>>();
const queryParams = reactive<MonitorDeviceQueryParams>({
  deviceName: ''
});
const appliedQueryParams = reactive<MonitorDeviceQueryParams>({
  deviceName: ''
});

const treeLoading = computed(() => loading.value || channelLoading.value || props.disabled === true);

const selectedTreeKeys = computed(() => {
  return props.selectedChannelIds.map(channelId => getChannelTreeKey(channelId));
});

const processingChannelKeySet = computed(() => {
  return new Set(props.processingChannelIds.map(channelId => String(channelId)));
});

const filteredDeviceList = computed(() => {
  const deviceKeyword = appliedQueryParams.deviceName.trim();
  return deviceList.value.filter(device => !deviceKeyword || device.name?.includes(deviceKeyword));
});

const monitorTreeData = computed<MonitorTreeOption[]>(() => {
  return filteredDeviceList.value.map(device => {
    const loaded = hasLoadedDeviceChannels(device.id);
    const channelList = getDeviceChannels(device.id);

    return {
      key: getDeviceTreeKey(device.id),
      label: device.name || `设备 ${device.id}`,
      type: 'device',
      device,
      isLeaf: false,
      children: loaded ? buildChannelTreeChildren(device, channelList) : undefined
    };
  });
});

function buildChannelTreeChildren(device: DeviceItem, channelList: ChannelItem[]): MonitorTreeOption[] {
  if (!channelList.length) {
    return [
      {
        key: getEmptyTreeKey(device.id),
        label: '暂无通道',
        type: 'empty',
        disabled: true,
        isLeaf: true
      }
    ];
  }

  return channelList.map(channel => ({
    key: getChannelTreeKey(channel.id),
    label: channel.name || `通道 ${channel.channel_no}`,
    type: 'channel',
    device,
    channel,
    isLeaf: true
  }));
}

function buildDeviceListOptions() {
  const options: CommonType.CommonTypeOptions[] = [];
  const deviceName = appliedQueryParams.deviceName.trim();
  if (deviceName) {
    options.push({
      type: 1,
      value: deviceName
    });
  }
  return options;
}

function getDevice(deviceId: CommonType.IdType) {
  return deviceList.value.find(device => String(device.id) === String(deviceId));
}

function getDeviceChannels(deviceId: CommonType.IdType) {
  return deviceChannelMap.value[String(deviceId)] || [];
}

function hasLoadedDeviceChannels(deviceId: CommonType.IdType) {
  return Object.hasOwn(deviceChannelMap.value, String(deviceId));
}

function getChannelOnlineStatus(channelId: CommonType.IdType) {
  return channelOnlineMap.value[String(channelId)] === true;
}

function isChannelProcessing(channelId: CommonType.IdType) {
  return processingChannelKeySet.value.has(String(channelId));
}

async function loadMonitorData() {
  loading.value = true;

  const deviceParams: CommonType.CommonListQueryParams = {
    list_option: {
      offset: 0,
      options: buildDeviceListOptions()
    }
  };

  try {
    const { data: responseData, error } = await fetchGetMonitorList(deviceParams);
    if (error) throw error;

    deviceList.value = responseData?.list ?? [];
    deviceChannelMap.value = {};
    channelOnlineMap.value = {};
    expandedTreeKeys.value = [];
  } catch (error) {
    deviceList.value = [];
    deviceChannelMap.value = {};
    channelOnlineMap.value = {};
    expandedTreeKeys.value = [];
    window.$message?.error(getErrorMessage(error, '获取实时监控数据失败'));
  } finally {
    loading.value = false;
  }
}

async function refreshDeviceList() {
  await loadMonitorData();
  emit('refreshed');
}

async function loadDeviceChannels(device: DeviceItem, force = false) {
  const deviceIdKey = String(device.id);
  if (!force && hasLoadedDeviceChannels(device.id)) return deviceChannelMap.value[deviceIdKey];
  if (!force && deviceChannelRequestMap.has(deviceIdKey)) return deviceChannelRequestMap.get(deviceIdKey)!;

  const channelParams: CommonType.CommonListQueryParams = {
    options: [{ key: 1 }],
    list_option: {
      offset: 0,
      options: [
        {
          type: 3,
          value: String(device.id)
        }
      ]
    }
  };

  const request = (async () => {
    channelLoading.value = true;

    try {
      const { data: responseData, error } = await fetchGetMonitorChannelList(channelParams);
      if (error) throw error;

      const channelList = responseData?.list || [];
      channelOnlineMap.value = {
        ...channelOnlineMap.value,
        ...responseData?.is_online_map
      };
      deviceChannelMap.value = {
        ...deviceChannelMap.value,
        [deviceIdKey]: channelList
      };
      return channelList;
    } catch {
      return [];
    } finally {
      channelLoading.value = false;
      deviceChannelRequestMap.delete(deviceIdKey);
    }
  })();

  deviceChannelRequestMap.set(deviceIdKey, request);
  return request;
}

async function refreshDeviceChannels(deviceId: CommonType.IdType) {
  const device = getDevice(deviceId);
  if (!device) return [];

  return loadDeviceChannels(device, true);
}

function handleChannelClick(device: DeviceItem, channel: ChannelItem) {
  if (props.disabled) return;

  emit('channelClick', device, channel);
}

async function handleSearch() {
  appliedQueryParams.deviceName = queryParams.deviceName;
  await refreshDeviceList();
}

async function handleResetQuery() {
  queryParams.deviceName = '';
  appliedQueryParams.deviceName = '';
  await refreshDeviceList();
}

async function handleRefreshDeviceList() {
  await refreshDeviceList();
}

async function handleLoadDeviceTreeNode(option: TreeOption) {
  const device = option.device as DeviceItem | undefined;
  if (!device) return;

  await loadDeviceChannels(device);
}

function handleTreeNodeClickBehavior({ option }: { option: TreeOption }) {
  if (option.type === 'device') return 'toggleExpand';
  if (option.type === 'channel') return 'toggleSelect';
  return 'none';
}

async function handleUpdateExpandedTreeKeys(
  _: Array<string | number>,
  __: Array<TreeOption | null>,
  meta: { node: TreeOption; action: 'expand' | 'collapse' } | { node: null; action: 'filter' }
) {
  const option = meta.node as MonitorTreeOption | null;
  if (meta.action !== 'expand' || option?.type !== 'device' || !option.device) return;

  await loadDeviceChannels(option.device);
}

function handleUpdateSelectedTreeKeys(
  _: Array<string | number>,
  __: Array<TreeOption | null>,
  meta: { node: TreeOption | null; action: 'select' | 'unselect' }
) {
  const option = meta.node as MonitorTreeOption | null;
  if (option?.type !== 'channel' || !option.device || !option.channel) return;

  handleChannelClick(option.device, option.channel);
}

function getMonitorTreeNodeProps({ option }: { option: TreeOption }) {
  if (option.type === 'device') return { class: 'monitor-device-tree-node' };
  return option.type === 'channel' ? { class: 'monitor-channel-tree-node' } : {};
}

function renderMonitorTreePrefix({ option }: { option: TreeOption }) {
  if (option.type === 'device') {
    return h(SvgIcon, { icon: 'material-symbols:videocam-outline-rounded', class: 'text-16px text-primary' });
  }

  if (option.type === 'channel') {
    return h(SvgIcon, {
      icon: 'material-symbols:photo-camera-outline-rounded',
      class: 'text-16px text-[var(--n-text-color-3)]'
    });
  }

  return null;
}

function renderMonitorTreeSuffix({ option }: { option: TreeOption }) {
  if (option.type === 'device') {
    return null;
  }

  const channel = option.channel as ChannelItem | undefined;
  if (!channel) return null;

  if (isChannelProcessing(channel.id)) {
    return h(SvgIcon, { icon: 'material-symbols:sync-rounded', class: 'text-16px text-primary' });
  }

  const isOnline = getChannelOnlineStatus(channel.id);
  return h(SvgIcon, {
    icon: isOnline ? 'ic:round-cloud-done' : 'ic:round-cloud-off',
    class: `text-16px ${isOnline ? 'text-success' : 'text-error-200'}`
  });
}

onMounted(async () => {
  await loadMonitorData();
});

defineExpose({
  getDevice,
  getDeviceChannels,
  getChannelOnlineStatus,
  hasLoadedDeviceChannels,
  loadDeviceChannels,
  refreshDeviceChannels
});
</script>

<template>
  <TableSiderLayout sider-title="监控设备" default-expanded>
    <template #header-extra>
      <NButton size="small" text class="h-18px" :loading="loading" @click.stop="handleRefreshDeviceList">
        <template #icon>
          <SvgIcon icon="ic:round-refresh" />
        </template>
      </NButton>
    </template>

    <template #sider>
      <div class="h-full min-h-0 flex-col-stretch gap-12px overflow-hidden">
        <MonitorDeviceQueryForm v-model:model="queryParams" @search="handleSearch" @reset="handleResetQuery" />

        <NSpin class="monitor-device-tree min-h-0 flex-1 overflow-hidden" :show="treeLoading">
          <NTree
            v-model:expanded-keys="expandedTreeKeys"
            :data="monitorTreeData"
            :selected-keys="selectedTreeKeys"
            :on-load="handleLoadDeviceTreeNode"
            :node-props="getMonitorTreeNodeProps"
            :render-prefix="renderMonitorTreePrefix"
            :render-suffix="renderMonitorTreeSuffix"
            :override-default-node-click-behavior="handleTreeNodeClickBehavior"
            :selectable="!treeLoading"
            block-node
            show-line
            virtual-scroll
            multiple
            class="monitor-device-tree__content h-full min-h-0 overflow-auto"
            @update:expanded-keys="handleUpdateExpandedTreeKeys"
            @update:selected-keys="handleUpdateSelectedTreeKeys"
          >
            <template #empty>
              <NEmpty description="暂无设备" class="h-full min-h-200px justify-center" />
            </template>
          </NTree>
        </NSpin>
      </div>
    </template>

    <slot />
  </TableSiderLayout>
</template>

<style scoped>
:deep(.sider-layout-card) {
  min-height: 0;
  overflow: hidden;
}

:deep(.sider-layout-card-content) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.monitor-device-tree :deep(.n-tree__empty) {
  height: 100%;
  justify-content: center;
}

.monitor-device-tree :deep(.n-spin-content),
.monitor-device-tree :deep(.n-spin-container) {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.monitor-device-tree :deep(.monitor-device-tree__content) {
  height: 100% !important;
  max-height: 100% !important;
}

.monitor-device-tree :deep(.n-tree-node) {
  height: 30px;
}

.monitor-device-tree :deep(.n-tree-node-switcher) {
  height: 30px;
}

.monitor-device-tree :deep(.n-tree-node-switcher__icon) {
  width: 16px !important;
  height: 16px !important;
  font-size: 16px !important;
}
</style>
