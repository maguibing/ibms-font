<script setup lang="ts">
import { computed } from 'vue';
import { getDisplayModeCount } from '../shared';
import type { DisplayMode, MonitorCamera } from '../shared';
import MonitorPlayerTile from './monitor-player-tile.vue';
import { useMonitorPlayers } from './use-monitor-players';

defineOptions({
  name: 'MonitorPlayerPanel'
});

interface PlayerSlot {
  key: string;
  camera?: MonitorCamera;
}

const props = defineProps<{
  cameras: MonitorCamera[];
  displayMode: DisplayMode;
}>();

const emit = defineEmits<{
  removeCamera: [camera: MonitorCamera];
  playSuccess: [camera: MonitorCamera];
  playError: [camera: MonitorCamera, message?: string, error?: unknown];
}>();

const playerSlots = computed<PlayerSlot[]>(() => {
  const count = getDisplayModeCount(props.displayMode);
  return Array.from({ length: count }, (_, index) => ({
    key: props.cameras[index] ? `camera-${props.cameras[index].id}` : `empty-${props.displayMode}-${index}`,
    camera: props.cameras[index]
  }));
});

const playerGridStyle = computed(() => {
  const sideCount = Math.sqrt(getDisplayModeCount(props.displayMode));

  return {
    gridTemplateColumns: `repeat(${sideCount}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${sideCount}, minmax(0, 1fr))`
  };
});

function handleRemoveCamera(camera: MonitorCamera) {
  emit('removeCamera', camera);
}

function getCameraToneClass(index: number) {
  const toneClasses = ['bg-[#073b3a]', 'bg-[#443819]', 'bg-[#465364]', 'bg-[#2f286f]', 'bg-[#203447]', 'bg-[#3b2f4a]'];
  return toneClasses[index % toneClasses.length];
}

useMonitorPlayers({
  getCameras: () => props.cameras,
  getDisplayMode: () => props.displayMode,
  onPlaySuccess: camera => emit('playSuccess', camera),
  onPlayError: (camera, message, error) => emit('playError', camera, message, error)
});
</script>

<template>
  <div class="player-panel" :style="playerGridStyle">
    <MonitorPlayerTile
      v-for="(slot, index) in playerSlots"
      :key="slot.key"
      :camera="slot.camera"
      :tone-class="getCameraToneClass(index)"
      @remove-camera="handleRemoveCamera"
    />
  </div>
</template>

<style scoped>
.player-panel {
  --monitor-player-empty-text: #9ca3af;
  --monitor-player-close-btn-bg: rgb(15 23 42 / 52%);
  --monitor-player-close-btn-color: #fff;
  --monitor-player-close-btn-hover-bg: rgb(220 38 38 / 86%);
  --monitor-player-fullscreen-btn-bg: rgb(15 23 42 / 52%);
  --monitor-player-fullscreen-btn-color: #fff;
  --monitor-player-fullscreen-btn-hover-bg: rgb(59 130 246 / 84%);
  display: grid;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  gap: 4px;
}

:global(html.dark) .player-panel {
  --monitor-player-empty-text: rgb(148 163 184);
  --monitor-player-close-btn-bg: rgb(15 23 42 / 62%);
  --monitor-player-close-btn-color: #fff;
  --monitor-player-close-btn-hover-bg: rgb(248 113 113 / 88%);
  --monitor-player-fullscreen-btn-bg: rgb(15 23 42 / 62%);
  --monitor-player-fullscreen-btn-color: #fff;
  --monitor-player-fullscreen-btn-hover-bg: rgb(96 165 250 / 88%);
}
</style>
