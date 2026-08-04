import type { TreeOption } from 'naive-ui';

export type DeviceItem = Api.Monitor.Monitor;

export type ChannelItem = Api.Monitor.MonitorChannel;

export type DisplayMode = 'single' | 'quad' | 'nine' | 'sixteen';

export type StreamProtocol = 1 | 2 | 3 | 4 | 5;

export interface DisplayModeOption {
  label: string;
  value: DisplayMode;
  count: number;
}

export interface MonitorCamera extends Omit<DeviceItem, 'id' | 'status'> {
  id: CommonType.IdType;
  deviceId: CommonType.IdType;
  status: 'online' | 'offline';
  location: string;
  channelNo?: number;
  channelId?: CommonType.IdType;
  liveUrl?: string;
  liveAccessToken?: string;
  liveProtocol?: StreamProtocol;
  videoCodec?: number;
  playErrorMessage?: string;
  proxyKey?: string;
}

export interface MonitorDeviceQueryParams {
  deviceName: string;
}

export type MonitorTreeOption = TreeOption & {
  key: string;
  label: string;
  type: 'device' | 'channel' | 'empty';
  device?: DeviceItem;
  channel?: ChannelItem;
  children?: MonitorTreeOption[];
};

export const ACCESS_TYPE_LOCAL_PULL = 1;

export const DISPLAY_MODE_OPTIONS: DisplayModeOption[] = [
  { label: '单屏', value: 'single', count: 1 },
  { label: '四分屏', value: 'quad', count: 4 },
  { label: '九分屏', value: 'nine', count: 9 },
  { label: '十六分屏', value: 'sixteen', count: 16 }
];

export const DISPLAY_MODE_COUNT_MAP: Record<DisplayMode, number> = {
  single: 1,
  quad: 4,
  nine: 9,
  sixteen: 16
};

export const DEVICE_TREE_KEY_PREFIX = 'device-';
export const CHANNEL_TREE_KEY_PREFIX = 'channel-';
export const EMPTY_TREE_KEY_PREFIX = 'empty-';

export const STREAM_PROTOCOL = {
  RTSP: 1,
  RTMP: 2,
  HLS: 3,
  HTTP_FLV: 4,
  EZOPEN: 5
} as const satisfies Record<string, StreamProtocol>;

export function normalizeStreamProtocol(protocol?: unknown): StreamProtocol | undefined {
  if (protocol === null || protocol === undefined || protocol === '') return undefined;

  const values = Object.values(STREAM_PROTOCOL) as StreamProtocol[];
  if (typeof protocol === 'number') {
    return values.includes(protocol as StreamProtocol) ? (protocol as StreamProtocol) : undefined;
  }

  if (typeof protocol !== 'string') return undefined;

  const trimmed = protocol.trim();
  if (!trimmed) return undefined;

  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric) && values.includes(numeric as StreamProtocol)) {
    return numeric as StreamProtocol;
  }

  const normalized = trimmed.toLowerCase();
  if (normalized === 'hls' || normalized === 'm3u8') return STREAM_PROTOCOL.HLS;
  if (normalized === 'flv' || normalized === 'http-flv' || normalized === 'httpflv') return STREAM_PROTOCOL.HTTP_FLV;
  if (normalized === 'ezopen') return STREAM_PROTOCOL.EZOPEN;
  if (normalized === 'rtmp') return STREAM_PROTOCOL.RTMP;
  if (normalized === 'rtsp') return STREAM_PROTOCOL.RTSP;

  return undefined;
}

export function getDisplayModeCount(displayMode: DisplayMode) {
  return DISPLAY_MODE_COUNT_MAP[displayMode];
}

export function getDeviceTreeKey(deviceId: CommonType.IdType) {
  return `${DEVICE_TREE_KEY_PREFIX}${deviceId}`;
}

export function getChannelTreeKey(channelId: CommonType.IdType) {
  return `${CHANNEL_TREE_KEY_PREFIX}${channelId}`;
}

export function getEmptyTreeKey(deviceId: CommonType.IdType) {
  return `${EMPTY_TREE_KEY_PREFIX}${deviceId}`;
}

export function getMonitorPlayerId(camera: MonitorCamera) {
  return `monitor-player-${camera.id}`;
}

export function getCameraPlayerKey(camera: MonitorCamera) {
  return `${camera.id}-${camera.liveUrl || ''}-${camera.liveAccessToken || ''}-${camera.liveProtocol || ''}-${
    camera.videoCodec || ''
  }`;
}

export function getCameraProtocol(camera?: MonitorCamera) {
  return normalizeStreamProtocol(camera?.liveProtocol);
}

export function isEzopenCamera(camera?: MonitorCamera) {
  return Boolean(camera?.liveUrl && camera.liveAccessToken && getCameraProtocol(camera) === STREAM_PROTOCOL.EZOPEN);
}

export function isHlsCamera(camera?: MonitorCamera) {
  return Boolean(camera?.liveUrl && getCameraProtocol(camera) === STREAM_PROTOCOL.HLS);
}

export function isFlvCamera(camera?: MonitorCamera) {
  return Boolean(camera?.liveUrl && getCameraProtocol(camera) === STREAM_PROTOCOL.HTTP_FLV);
}

export function canFullscreenCamera(camera?: MonitorCamera) {
  return Boolean(camera && (isEzopenCamera(camera) || isHlsCamera(camera) || isFlvCamera(camera)));
}

export function wait(ms: number) {
  return new Promise<void>(resolve => {
    window.setTimeout(resolve, ms);
  });
}

function getRecordString(data: unknown, keys: string[]) {
  if (!data || typeof data !== 'object') return '';
  const record = data as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return '';
}

export function getErrorMessage(error: unknown, fallback = '') {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    if (record.details === 'bufferAddCodecError') return '当前浏览器不支持该视频编码，请切换为 H.264 码流后播放';
  }
  return (
    getRecordString(error, [
      'err_msg',
      'error_msg',
      'msg',
      'message',
      'detail',
      'details',
      'error',
      'reason',
      'type'
    ]) || fallback
  );
}
