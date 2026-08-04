import { nextTick, onActivated, onBeforeUnmount, onDeactivated, watch } from 'vue';
import { EZUIKitPlayer } from 'ezuikit-js';
import flvjs from 'flv.js';
import Hls, { Events, type ErrorData } from 'hls.js';
import {
  getCameraPlayerKey,
  getErrorMessage,
  getMonitorPlayerId,
  isEzopenCamera,
  isFlvCamera,
  isHlsCamera,
  wait
} from '../shared';
import type { DisplayMode, MonitorCamera } from '../shared';

const HLS_LIVE_CONFIG = {
  enableWorker: true,
  lowLatencyMode: true,
  backBufferLength: 1,
  maxBufferLength: 8,
  maxBufferSize: 20 * 1000 * 1000,
  maxMaxBufferLength: 12,
  capLevelToPlayerSize: true,
  liveSyncDurationCount: 2,
  liveMaxLatencyDurationCount: 4
};

const FLV_LIVE_CONFIG = {
  isLive: true,
  enableStashBuffer: false,
  stashInitialSize: 128 * 1024,
  lazyLoad: false,
  autoCleanupSourceBuffer: true,
  autoCleanupMaxBackwardDuration: 8,
  autoCleanupMinBackwardDuration: 4,
  fixAudioTimestampGap: true
};

const PLAYER_INIT_BATCH_SIZE = 4;
const PLAYER_INIT_BATCH_DELAY_MS = 160;
const VIDEO_CODEC_H265 = 2;
const HEVC_MEDIA_SOURCE_MIME_TYPES = [
  'video/mp4; codecs="hvc1.1.6.L93.B0"',
  'video/mp4; codecs="hev1.1.6.L93.B0"',
  'video/mp4; codecs="hvc1"',
  'video/mp4; codecs="hev1"'
];
const HEVC_NATIVE_MIME_TYPES = [
  'application/vnd.apple.mpegurl; codecs="hvc1.1.6.L93.B0"',
  'application/vnd.apple.mpegurl; codecs="hev1.1.6.L93.B0"',
  'video/mp4; codecs="hvc1.1.6.L93.B0"',
  'video/mp4; codecs="hev1.1.6.L93.B0"'
];

interface UseMonitorPlayersOptions {
  getCameras: () => MonitorCamera[];
  getDisplayMode: () => DisplayMode;
  onPlaySuccess: (camera: MonitorCamera) => void;
  onPlayError: (camera: MonitorCamera, message?: string, error?: unknown) => void;
}

export function useMonitorPlayers(options: UseMonitorPlayersOptions) {
  const ezopenMap = new Map<CommonType.IdType, EZUIKitPlayer>();
  const hlsMap = new Map<CommonType.IdType, Hls>();
  const flvMap = new Map<CommonType.IdType, flvjs.Player>();
  const playerKeyMap = new Map<CommonType.IdType, string>();
  let playerInitToken = 0;
  let isPlayerPanelActive = true;
  let hasPlayerPanelDeactivated = false;

  function reportPlayError(camera: MonitorCamera, message?: string, error?: unknown) {
    console.error('[MonitorPlayerPanel] 捕获播放错误', {
      camera,
      message,
      error
    });
    options.onPlayError(camera, message, error);
  }

  function logPlayError(camera: MonitorCamera, message?: string, error?: unknown) {
    console.error('[MonitorPlayerPanel] 捕获播放错误', {
      camera,
      message,
      error
    });
  }

  function canUseMediaSourceType(mimeType: string) {
    if (typeof window === 'undefined' || !window.MediaSource?.isTypeSupported) return false;
    return window.MediaSource.isTypeSupported(mimeType);
  }

  function canUseNativeVideoType(mimeType: string) {
    if (typeof document === 'undefined') return false;
    const video = document.createElement('video');
    return Boolean(video.canPlayType(mimeType));
  }

  function canPlayHevc() {
    return (
      HEVC_MEDIA_SOURCE_MIME_TYPES.some(canUseMediaSourceType) || HEVC_NATIVE_MIME_TYPES.some(canUseNativeVideoType)
    );
  }

  function isH265Camera(camera: MonitorCamera) {
    return Number(camera.videoCodec) === VIDEO_CODEC_H265;
  }

  function ensureVideoCodecSupported(camera: MonitorCamera) {
    if (!isH265Camera(camera) || canPlayHevc()) return true;

    reportPlayError(camera, '当前浏览器不支持 H.265/HEVC 视频编码，请切换为 H.264 码流后播放', {
      videoCodec: camera.videoCodec,
      mediaSourceMimeTypes: HEVC_MEDIA_SOURCE_MIME_TYPES,
      nativeMimeTypes: HEVC_NATIVE_MIME_TYPES
    });
    return false;
  }

  function resetVideoElement(cameraId: CommonType.IdType) {
    const video = document.getElementById(`monitor-player-${cameraId}`);
    if (!(video instanceof HTMLVideoElement)) return;

    video.pause?.();
    video.removeAttribute('src');
    video.srcObject = null;
    video.load?.();
  }

  function resetPlayerContainer(cameraId: CommonType.IdType) {
    const container = document.getElementById(`monitor-player-${cameraId}`);
    if (!container || container instanceof HTMLVideoElement) return;
    container.replaceChildren();
  }

  function destroyPlayer(cameraId: CommonType.IdType) {
    const player = ezopenMap.get(cameraId);
    player?.stop?.();
    player?.destroy?.();
    ezopenMap.delete(cameraId);

    const hls = hlsMap.get(cameraId);
    hls?.stopLoad();
    hls?.detachMedia();
    hls?.destroy();
    hlsMap.delete(cameraId);

    const flv = flvMap.get(cameraId);
    flv?.pause();
    flv?.unload();
    flv?.detachMediaElement();
    flv?.destroy();
    flvMap.delete(cameraId);

    resetVideoElement(cameraId);
    resetPlayerContainer(cameraId);
    playerKeyMap.delete(cameraId);
  }

  function destroyAllPlayers() {
    const cameraIds = new Set([...playerKeyMap.keys(), ...ezopenMap.keys(), ...hlsMap.keys(), ...flvMap.keys()]);
    Array.from(cameraIds).forEach(destroyPlayer);
  }

  async function initHlsPlayer(camera: MonitorCamera) {
    const video = document.getElementById(getMonitorPlayerId(camera)) as HTMLVideoElement | null;
    const liveUrl = camera.liveUrl;
    if (!video || !liveUrl) return false;

    video.addEventListener('error', () => {
      reportPlayError(camera, video.error?.message || 'HLS 视频播放失败', video.error);
      destroyPlayer(camera.id);
    });

    // oxlint-disable-next-line import/no-named-as-default-member
    if (Hls.isSupported()) {
      return await new Promise<boolean>(resolve => {
        let resolved = false;
        const finish = (success: boolean) => {
          if (resolved) return;
          resolved = true;
          resolve(success);
        };
        const hls = new Hls(HLS_LIVE_CONFIG);
        hls.loadSource(liveUrl);
        hls.attachMedia(video);
        hls.on(Events.MANIFEST_PARSED, () => {
          video
            .play()
            .then(() => finish(true))
            .catch(error => {
              reportPlayError(camera, getErrorMessage(error, 'HLS 视频播放失败'), error);
              finish(false);
            });
        });
        hls.on(Events.ERROR, (_event: Events.ERROR, data: ErrorData) => {
          const message = getErrorMessage(data, 'HLS 流加载失败');
          logPlayError(camera, message, data);
          if (data?.fatal || data?.details === 'bufferAddCodecError') {
            reportPlayError(camera, message, data);
            destroyPlayer(camera.id);
            finish(false);
          }
        });
        hlsMap.set(camera.id, hls);
      });
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = liveUrl;
      const playSuccess = await video.play().catch(error => {
        reportPlayError(camera, getErrorMessage(error, 'HLS 视频播放失败'), error);
        return false;
      });
      return playSuccess !== false && !video.error;
    }

    reportPlayError(camera, '当前浏览器不支持 HLS 播放');
    return false;
  }

  async function initFlvPlayer(camera: MonitorCamera) {
    const video = document.getElementById(getMonitorPlayerId(camera)) as HTMLVideoElement | null;
    const liveUrl = camera.liveUrl;
    if (!video || !liveUrl) return false;
    if (!flvjs.isSupported()) {
      reportPlayError(camera, '当前浏览器不支持 HTTP-FLV 播放');
      return false;
    }

    video.addEventListener('error', () => {
      reportPlayError(camera, video.error?.message || 'HTTP-FLV 视频播放失败', video.error);
      destroyPlayer(camera.id);
    });

    const flv = flvjs.createPlayer(
      {
        type: 'flv',
        isLive: true,
        url: liveUrl
      },
      FLV_LIVE_CONFIG
    );
    flv.on(flvjs.Events.ERROR, (errorType: string, errorDetail: string) => {
      reportPlayError(camera, `${errorType || 'HTTP-FLV 播放失败'}${errorDetail ? `：${errorDetail}` : ''}`, {
        errorType,
        errorDetail
      });
      destroyPlayer(camera.id);
    });
    flv.attachMediaElement(video);
    flv.load();
    const playSuccess = await Promise.resolve(flv.play())
      .then(() => true)
      .catch((error: unknown) => {
        reportPlayError(camera, getErrorMessage(error, 'HTTP-FLV 视频播放失败'), error);
        return false;
      });
    flvMap.set(camera.id, flv);
    return playSuccess !== false;
  }

  async function initEzopenPlayer(camera: MonitorCamera) {
    const container = document.getElementById(getMonitorPlayerId(camera));
    if (!container || !camera.liveUrl || !camera.liveAccessToken) return false;

    ezopenMap.set(
      camera.id,
      new EZUIKitPlayer({
        id: getMonitorPlayerId(camera),
        accessToken: camera.liveAccessToken,
        url: camera.liveUrl,
        width: '100%',
        height: '100%',
        template: 'pcLive',
        scaleMode: 1,
        handleError: (error: unknown) => {
          reportPlayError(camera, getErrorMessage(error, '萤石云视频播放失败'), error);
        }
      })
    );
    return true;
  }

  async function initSinglePlayer(camera: MonitorCamera, token: number) {
    if (!isPlayerPanelActive || token !== playerInitToken) return;

    if (!isEzopenCamera(camera) && !isHlsCamera(camera) && !isFlvCamera(camera)) {
      destroyPlayer(camera.id);
      return;
    }

    const playerKey = getCameraPlayerKey(camera);
    if (playerKeyMap.get(camera.id) === playerKey) return;

    destroyPlayer(camera.id);
    if (!ensureVideoCodecSupported(camera)) return;

    const success =
      (isHlsCamera(camera) && (await initHlsPlayer(camera))) ||
      (isFlvCamera(camera) && (await initFlvPlayer(camera))) ||
      (isEzopenCamera(camera) && (await initEzopenPlayer(camera)));

    if (token !== playerInitToken) {
      destroyPlayer(camera.id);
      return;
    }
    if (!success) {
      destroyPlayer(camera.id);
      return;
    }

    playerKeyMap.set(camera.id, playerKey);
    options.onPlaySuccess(camera);
    await wait(120);
  }

  async function initPlayerBatch(cameras: MonitorCamera[], token: number, startIndex = 0): Promise<void> {
    if (!isPlayerPanelActive || token !== playerInitToken || startIndex >= cameras.length) return;

    const cameraBatch = cameras.slice(startIndex, startIndex + PLAYER_INIT_BATCH_SIZE);
    await Promise.all(cameraBatch.map(camera => initSinglePlayer(camera, token)));

    const nextIndex = startIndex + PLAYER_INIT_BATCH_SIZE;
    if (nextIndex >= cameras.length || token !== playerInitToken) return;

    await wait(PLAYER_INIT_BATCH_DELAY_MS);
    await initPlayerBatch(cameras, token, nextIndex);
  }

  async function initPlayers() {
    playerInitToken += 1;
    const token = playerInitToken;
    if (!isPlayerPanelActive) return;
    await nextTick();
    if (!isPlayerPanelActive || token !== playerInitToken) return;

    const cameras = options.getCameras();
    const visibleCameraIds = new Set(cameras.map(camera => camera.id));
    Array.from(playerKeyMap.keys()).forEach(cameraId => {
      if (!visibleCameraIds.has(cameraId)) {
        destroyPlayer(cameraId);
      }
    });

    await initPlayerBatch(cameras, token);
  }

  watch(
    () =>
      options
        .getCameras()
        .map(camera => getCameraPlayerKey(camera))
        .join('|'),
    () => {
      void initPlayers();
    },
    { immediate: true }
  );

  watch(options.getDisplayMode, async () => {
    await nextTick();
    Array.from(ezopenMap.values()).forEach(player => {
      player.resize?.('100%', '100%');
    });
  });

  onActivated(() => {
    isPlayerPanelActive = true;
    if (hasPlayerPanelDeactivated) {
      void initPlayers();
    }
  });

  onDeactivated(() => {
    hasPlayerPanelDeactivated = true;
    isPlayerPanelActive = false;
    playerInitToken += 1;
    destroyAllPlayers();
  });

  onBeforeUnmount(() => {
    isPlayerPanelActive = false;
    playerInitToken += 1;
    destroyAllPlayers();
  });
}
