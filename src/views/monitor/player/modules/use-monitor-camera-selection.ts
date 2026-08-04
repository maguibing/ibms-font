import { computed, onActivated, onBeforeUnmount, onDeactivated, reactive, shallowRef, watch } from 'vue';
import type { Ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import {
  fetchCloseMonitorChannelLive,
  fetchGetMonitorChannel,
  fetchGetMonitorChannelLiveUrl
} from '@/service/api/monitor';
import { STREAM_PROTOCOL, getErrorMessage, normalizeStreamProtocol, wait } from '../shared';
import type { ChannelItem, DeviceItem, MonitorCamera, StreamProtocol } from '../shared';

const MAX_SCREEN_COUNT = 16;
const CHANNEL_CLICK_DEBOUNCE_MS = 250;
const CHANNEL_CLOSE_SETTLE_MS = 800;
const CHANNEL_REOPEN_COOLDOWN_MS = 1200;

interface ChannelActionState {
  timerId?: number;
  processing: boolean;
  reopenReadyAt: number;
}

interface CreateMonitorCameraOptions {
  liveUrl?: string;
  onlineStatus?: 'online' | 'offline';
  liveProtocol?: StreamProtocol;
  liveAccessToken?: string;
  videoCodec?: number;
}

interface DeviceChannelSiderExpose {
  getDevice: (deviceId: CommonType.IdType) => DeviceItem | undefined;
  getDeviceChannels: (deviceId: CommonType.IdType) => ChannelItem[];
  hasLoadedDeviceChannels: (deviceId: CommonType.IdType) => boolean;
  loadDeviceChannels: (device: DeviceItem, force?: boolean) => Promise<ChannelItem[]>;
  refreshDeviceChannels: (deviceId: CommonType.IdType) => Promise<ChannelItem[]>;
}

interface UseMonitorCameraSelectionOptions {
  currentDisplayCount: Readonly<Ref<number>>;
  getDeviceChannelSider: () => DeviceChannelSiderExpose | null | undefined;
}

export function useMonitorCameraSelection(options: UseMonitorCameraSelectionOptions) {
  const selectedCameraList = shallowRef<MonitorCamera[]>([]);
  const channelActionMap = reactive<Record<string, ChannelActionState>>({});
  const leaveCleanupDone = shallowRef(false);
  const closingErrorLiveKeySet = new Set<string>();
  const playErrorMessageTimeMap = new Map<string, number>();

  const visibleCameras = computed(() => {
    return selectedCameraList.value.slice(0, options.currentDisplayCount.value);
  });

  const hasSelectedCameras = computed(() => selectedCameraList.value.length > 0);

  const selectedChannelIds = computed(() =>
    visibleCameras.value.flatMap(camera => (camera.channelId ? [camera.channelId] : []))
  );

  const processingChannelIds = computed(() => {
    return Object.entries(channelActionMap)
      .filter(([, actionState]) => actionState.processing)
      .map(([channelId]) => channelId);
  });

  function createCameraId(deviceId: CommonType.IdType, channelId: CommonType.IdType) {
    return `${deviceId}-${channelId}`;
  }

  function ensureChannelActionState(channelId: CommonType.IdType) {
    const key = String(channelId);
    if (!channelActionMap[key]) {
      channelActionMap[key] = {
        processing: false,
        reopenReadyAt: 0
      };
    }
    return channelActionMap[key];
  }

  function createMonitorCamera(
    device: DeviceItem,
    channel: ChannelItem,
    cameraOptions: CreateMonitorCameraOptions = {}
  ): MonitorCamera {
    return {
      ...device,
      id: createCameraId(device.id, channel.id),
      deviceId: device.id,
      name: channel.name || `通道 ${channel.channel_no}`,
      status: cameraOptions.onlineStatus || (channel.status === 1 ? 'online' : 'offline'),
      location: device.name || `设备 ${device.id}`,
      channelNo: channel.channel_no,
      channelId: channel.id,
      liveUrl: cameraOptions.liveUrl || '',
      liveProtocol: cameraOptions.liveProtocol,
      liveAccessToken: cameraOptions.liveAccessToken || '',
      videoCodec: cameraOptions.videoCodec,
      playErrorMessage: '',
      proxyKey: channel.proxy_key || channel.setting?.local_pull?.proxy_key
    };
  }

  function showPlayErrorMessage(channelId: CommonType.IdType, cameraName: string, message: string) {
    const key = String(channelId);
    const now = Date.now();
    if (now - (playErrorMessageTimeMap.get(key) || 0) < 3000) return;
    playErrorMessageTimeMap.set(key, now);
    window.$message?.error(`${cameraName}：${message}`);
  }

  async function resolveMonitorCamera(device: DeviceItem, channel: ChannelItem) {
    const { data: channelData, error: channelError } = await fetchGetMonitorChannel({ id: channel.id });
    if (channelError) {
      throw new Error(getErrorMessage(channelError, '获取通道详情失败'));
    }

    const detail = channelData?.monitor_channel ?? channel;
    const liveProtocol = normalizeStreamProtocol(detail.setting?.play_protocol) || STREAM_PROTOCOL.HLS;

    const { data: liveUrlData, error: liveUrlError } = await fetchGetMonitorChannelLiveUrl({ id: channel.id });
    if (liveUrlError) {
      throw new Error(getErrorMessage(liveUrlError, '获取实时播放地址失败'));
    }

    const liveUrl = liveUrlData?.data?.url || liveUrlData?.live_url?.url || liveUrlData?.url || '';
    const liveAccessToken =
      liveUrlData?.data?.access_token ||
      liveUrlData?.data?.live_access_token ||
      liveUrlData?.live_url?.access_token ||
      liveUrlData?.live_url?.live_access_token ||
      liveUrlData?.access_token ||
      liveUrlData?.live_access_token ||
      '';
    const videoCodec = liveUrlData?.data?.video_codec || liveUrlData?.live_url?.video_codec || liveUrlData?.video_codec;
    const onlineStatus = detail.status === 1 ? 'online' : 'offline';

    if (!liveUrl) {
      throw new Error('未获取到实时播放地址');
    }

    return createMonitorCamera(device, detail, {
      liveUrl,
      onlineStatus,
      liveProtocol,
      liveAccessToken,
      videoCodec
    });
  }

  function appendCamera(camera: MonitorCamera) {
    const exists = selectedCameraList.value.find(item => String(item.channelId) === String(camera.channelId));
    if (exists) return;

    selectedCameraList.value = [...selectedCameraList.value, camera].slice(0, MAX_SCREEN_COUNT);
  }

  function replaceSingleCamera(camera: MonitorCamera) {
    selectedCameraList.value = [camera];
  }

  function removeCamera(channelId: CommonType.IdType) {
    selectedCameraList.value = selectedCameraList.value.filter(item => String(item.channelId) !== String(channelId));
  }

  function updateCameraPlayError(channelId: CommonType.IdType, message: string) {
    selectedCameraList.value = selectedCameraList.value.map(camera =>
      String(camera.channelId) === String(channelId)
        ? {
            ...camera,
            playErrorMessage: message
          }
        : camera
    );
  }

  function clearCameraPlayError(channelId: CommonType.IdType) {
    selectedCameraList.value = selectedCameraList.value.map(camera =>
      String(camera.channelId) === String(channelId)
        ? {
            ...camera,
            playErrorMessage: ''
          }
        : camera
    );
  }

  async function closeMonitorChannelLive(camera: MonitorCamera) {
    if (!camera.channelId) return;
    try {
      if (camera.liveUrl) {
        await fetchCloseMonitorChannelLive({
          id: camera.channelId,
          url: camera.liveUrl
        });
      }
    } catch {
    } finally {
      ensureChannelActionState(camera.channelId).reopenReadyAt = Date.now() + CHANNEL_REOPEN_COOLDOWN_MS;
      await wait(CHANNEL_CLOSE_SETTLE_MS);
    }
  }

  async function closeMonitorChannelLives(cameraList: MonitorCamera[]) {
    await Promise.allSettled(cameraList.map(camera => closeMonitorChannelLive(camera)));
  }

  async function handleRemoveSelectedCamera(camera: MonitorCamera) {
    if (!camera.channelId) return;
    const actionState = ensureChannelActionState(camera.channelId);
    if (actionState.processing) return;

    actionState.processing = true;
    try {
      removeCamera(camera.channelId);
      await closeMonitorChannelLive(camera);
    } finally {
      actionState.processing = false;
    }
  }

  async function handleClearSelectedCameras() {
    const cameraList = [...selectedCameraList.value];
    if (cameraList.length === 0) return;

    cameraList.forEach(camera => {
      if (camera.channelId) {
        ensureChannelActionState(camera.channelId).processing = true;
      }
    });

    selectedCameraList.value = [];

    try {
      await closeMonitorChannelLives(cameraList);
    } finally {
      cameraList.forEach(camera => {
        if (camera.channelId) {
          ensureChannelActionState(camera.channelId).processing = false;
        }
      });
    }
  }

  async function executeChannelToggle(device: DeviceItem, channel: ChannelItem) {
    const channelId = channel.id;
    const actionState = ensureChannelActionState(channelId);
    if (actionState.processing) return;

    actionState.processing = true;
    try {
      const currentCamera = selectedCameraList.value.find(item => String(item.channelId) === String(channelId));
      if (currentCamera) {
        removeCamera(channelId);
        await closeMonitorChannelLive(currentCamera);
        return;
      }

      if (options.currentDisplayCount.value === 1) {
        const activeCamera = visibleCameras.value[0];
        if (activeCamera?.channelId && String(activeCamera.channelId) !== String(channelId)) {
          removeCamera(activeCamera.channelId);
          await closeMonitorChannelLive(activeCamera);
        }
      }

      const remaining = actionState.reopenReadyAt - Date.now();
      if (remaining > 0) {
        await wait(remaining);
      }

      const camera = await resolveMonitorCamera(device, channel);
      if (options.currentDisplayCount.value === 1) {
        replaceSingleCamera(camera);
      } else {
        appendCamera(camera);
      }
    } catch (error) {
      const message = getErrorMessage(error, '获取实时播放地址失败');
      console.error('[MonitorPlayer] 获取实时播放地址失败', {
        device,
        channel,
        message,
        error
      });
      window.$message?.error(`${channel.name || `通道 ${channel.channel_no}`}：${message}`);
    } finally {
      actionState.processing = false;
    }
  }

  async function syncSelectedCameras() {
    const deviceChannelSider = options.getDeviceChannelSider();
    if (!deviceChannelSider) return;

    const nextCameraList = await Promise.all(
      selectedCameraList.value.map(async camera => {
        const device = deviceChannelSider.getDevice(camera.deviceId);
        if (device && !deviceChannelSider.hasLoadedDeviceChannels(camera.deviceId)) {
          await deviceChannelSider.loadDeviceChannels(device);
        }
        const currentDeviceChannels = deviceChannelSider.getDeviceChannels(camera.deviceId);
        const channel = currentDeviceChannels.find(item => String(item.id) === String(camera.channelId));
        if (!device || !channel) return camera;
        try {
          return await resolveMonitorCamera(device, channel);
        } catch {
          return camera;
        }
      })
    );
    selectedCameraList.value = nextCameraList;
  }

  function handleChannelClick(device: DeviceItem, channel: ChannelItem) {
    const actionState = ensureChannelActionState(channel.id);
    if (actionState.processing) return;

    if (actionState.timerId) {
      window.clearTimeout(actionState.timerId);
    }

    actionState.timerId = window.setTimeout(() => {
      actionState.timerId = undefined;
      executeChannelToggle(device, channel);
    }, CHANNEL_CLICK_DEBOUNCE_MS);
  }

  async function handlePlaySuccess(camera: MonitorCamera) {
    if (!camera.channelId) return;
    clearCameraPlayError(camera.channelId);
    await options.getDeviceChannelSider()?.refreshDeviceChannels(camera.deviceId);
  }

  async function closeErroredCameraLive(camera: MonitorCamera) {
    if (!camera.channelId || !camera.liveUrl) return;
    const closeKey = `${camera.channelId}-${camera.liveUrl}`;
    if (closingErrorLiveKeySet.has(closeKey)) return;

    closingErrorLiveKeySet.add(closeKey);
    const actionState = ensureChannelActionState(camera.channelId);
    actionState.processing = true;
    try {
      await closeMonitorChannelLive(camera);
    } finally {
      actionState.processing = false;
      closingErrorLiveKeySet.delete(closeKey);
    }
  }

  async function handlePlayError(camera: MonitorCamera, message?: string, error?: unknown) {
    const errorMessage = getErrorMessage(error, message || '监控播放失败');
    console.error('[MonitorPlayer] 播放器捕获播放错误', {
      camera,
      message: errorMessage,
      error
    });

    if (!camera.channelId) return;
    updateCameraPlayError(camera.channelId, errorMessage);
    showPlayErrorMessage(camera.channelId, camera.name, errorMessage);
    await closeErroredCameraLive(camera);
  }

  function clearChannelActionTimers() {
    Object.values(channelActionMap).forEach(actionState => {
      if (actionState.timerId) {
        window.clearTimeout(actionState.timerId);
        actionState.timerId = undefined;
      }
    });
  }

  watch(options.currentDisplayCount, async (nextCount, prevCount) => {
    if (nextCount >= prevCount || selectedCameraList.value.length <= nextCount) return;

    const removedCameras = selectedCameraList.value.slice(nextCount);
    selectedCameraList.value = selectedCameraList.value.slice(0, nextCount);
    await closeMonitorChannelLives(removedCameras);
  });

  async function handleLeavePage() {
    if (leaveCleanupDone.value) return;
    leaveCleanupDone.value = true;
    clearChannelActionTimers();

    const cameraList = [...selectedCameraList.value];
    selectedCameraList.value = [];
    await closeMonitorChannelLives(cameraList);
  }

  onBeforeRouteLeave(async () => {
    await handleLeavePage();
  });

  onActivated(() => {
    leaveCleanupDone.value = false;
  });

  onDeactivated(() => {
    void handleLeavePage();
  });

  onBeforeUnmount(() => {
    clearChannelActionTimers();
    if (leaveCleanupDone.value) return;
    leaveCleanupDone.value = true;
    const cameraList = [...selectedCameraList.value];
    selectedCameraList.value = [];
    void closeMonitorChannelLives(cameraList);
  });

  return {
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
  };
}
