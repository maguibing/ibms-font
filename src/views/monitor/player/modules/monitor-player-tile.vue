<script setup lang="ts">
import SvgIcon from '@/components/custom/svg-icon.vue';
import { canFullscreenCamera, getMonitorPlayerId, isEzopenCamera, isFlvCamera, isHlsCamera } from '../shared';
import type { MonitorCamera } from '../shared';

defineOptions({
  name: 'MonitorPlayerTile'
});

const props = defineProps<{
  camera?: MonitorCamera;
  toneClass: string;
}>();

const emit = defineEmits<{
  removeCamera: [camera: MonitorCamera];
}>();

function getFullscreenDocument() {
  return document as Document & {
    webkitFullscreenElement?: Element | null;
    msFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => Promise<void> | void;
    msExitFullscreen?: () => Promise<void> | void;
  };
}

function getCurrentFullscreenElement() {
  const fullscreenDocument = getFullscreenDocument();
  return (
    fullscreenDocument.fullscreenElement ||
    fullscreenDocument.webkitFullscreenElement ||
    fullscreenDocument.msFullscreenElement ||
    null
  );
}

function getRemoveAriaLabel(camera: MonitorCamera) {
  return `关闭 ${camera.name}`;
}

function getFullscreenAriaLabel(camera: MonitorCamera) {
  return `全屏查看 ${camera.name}`;
}

function handleRemoveCamera(camera: MonitorCamera) {
  emit('removeCamera', camera);
}

async function handleToggleFullscreen(event: MouseEvent) {
  const button = event.currentTarget as HTMLElement | null;
  const target = button?.closest('.player-tile') as
    | (HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
        msRequestFullscreen?: () => Promise<void> | void;
      })
    | null;

  if (!target) return;

  const fullscreenDocument = getFullscreenDocument();
  const fullscreenElement = getCurrentFullscreenElement();

  if (fullscreenElement === target) {
    await (fullscreenDocument.exitFullscreen?.() ||
      fullscreenDocument.webkitExitFullscreen?.() ||
      fullscreenDocument.msExitFullscreen?.());
    return;
  }

  await (target.requestFullscreen?.() || target.webkitRequestFullscreen?.() || target.msRequestFullscreen?.());
}
</script>

<template>
  <div
    class="player-tile relative min-h-0 min-w-0 overflow-hidden rounded-8px"
    :class="props.camera ? props.toneClass : 'bg-[#111827]'"
  >
    <template v-if="props.camera">
      <button
        type="button"
        class="player-close-btn"
        :aria-label="getRemoveAriaLabel(props.camera)"
        @click.stop="handleRemoveCamera(props.camera)"
      >
        <SvgIcon icon="material-symbols:cancel-rounded" class="text-18px" />
      </button>
      <button
        v-if="canFullscreenCamera(props.camera)"
        type="button"
        class="player-fullscreen-btn"
        :aria-label="getFullscreenAriaLabel(props.camera)"
        @click.stop="handleToggleFullscreen($event)"
      >
        <SvgIcon icon="material-symbols:fullscreen-rounded" class="text-18px" />
      </button>
      <div v-if="isEzopenCamera(props.camera)" :id="getMonitorPlayerId(props.camera)" class="h-full w-full bg-black" />
      <video
        v-else-if="isHlsCamera(props.camera) || isFlvCamera(props.camera)"
        :id="getMonitorPlayerId(props.camera)"
        class="h-full w-full bg-black object-contain"
        autoplay
        muted
        playsinline
      />
      <div
        v-else-if="props.camera.liveUrl"
        class="absolute inset-0 flex items-center justify-center bg-[#111827] px-20px text-center text-15px text-white/80"
      >
        当前流地址已获取，但浏览器暂不支持播放。
      </div>
      <div
        v-if="props.camera.playErrorMessage"
        class="absolute inset-0 z-10 flex items-center justify-center bg-black/70 px-20px text-center text-14px leading-22px text-white"
      >
        {{ props.camera.playErrorMessage }}
      </div>
      <div
        class="absolute bottom-8px left-8px z-10 max-w-70% inline-flex items-center rounded-8px bg-black/45 px-12px py-6px"
      >
        <span class="truncate whitespace-nowrap text-12px text-white">
          {{ props.camera.name }}
        </span>
      </div>
      <div v-if="!props.camera.liveUrl" class="absolute inset-0 flex-center opacity-30">
        <SvgIcon
          :icon="
            props.camera.status === 'online'
              ? 'material-symbols:photo-camera-outline-rounded'
              : 'material-symbols:videocam-outline-rounded'
          "
          class="text-72px text-white"
        />
      </div>
      <div
        v-if="props.camera.status === 'offline' && !props.camera.liveUrl"
        class="absolute inset-0 flex-center text-18px text-white font-600"
      >
        无信号
      </div>
    </template>
    <div v-else class="player-empty absolute inset-0 flex-col-center">
      <SvgIcon icon="material-symbols:videocam-outline-rounded" class="mb-10px text-54px" />
      <span>暂无摄像头</span>
    </div>
  </div>
</template>

<style scoped>
.player-tile {
  width: 100%;
  height: 100%;
}

.player-empty {
  color: var(--monitor-player-empty-text);
}

.player-close-btn,
.player-fullscreen-btn {
  position: absolute;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: var(--monitor-player-close-btn-color);
  background: var(--monitor-player-close-btn-bg);
  border: 0;
  border-radius: 9999px;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(-4px);
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.player-close-btn {
  top: 8px;
  right: 8px;
}

.player-fullscreen-btn {
  right: 8px;
  bottom: 8px;
  color: var(--monitor-player-fullscreen-btn-color);
  background: var(--monitor-player-fullscreen-btn-bg);
}

.player-tile:hover .player-close-btn,
.player-tile:focus-within .player-close-btn,
.player-tile:hover .player-fullscreen-btn,
.player-tile:focus-within .player-fullscreen-btn {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0);
}

.player-close-btn:hover {
  background: var(--monitor-player-close-btn-hover-bg);
  transform: scale(1.06);
}

.player-fullscreen-btn:hover {
  background: var(--monitor-player-fullscreen-btn-hover-bg);
  transform: scale(1.06);
}

.player-close-btn:focus-visible,
.player-fullscreen-btn:focus-visible {
  outline: 2px solid rgb(255 255 255 / 75%);
  outline-offset: 2px;
}

@media (hover: none) {
  .player-close-btn,
  .player-fullscreen-btn {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateY(0);
  }
}

.player-tile :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.player-tile :deep(.ezuikit-player),
.player-tile :deep(.ezuikit-player-container),
.player-tile :deep(.ezuikit-video-wrap),
.player-tile :deep(.ezuikit-video) {
  width: 100% !important;
  height: 100% !important;
}

.player-tile :deep(.ezuikit-player video),
.player-tile :deep(.ezuikit-player-container video),
.player-tile :deep(.ezuikit-video-wrap video),
.player-tile :deep(.ezuikit-video video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
}
</style>
