<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth';
import { getExternalReturnUrl } from '@/utils/externalReturn';

defineOptions({
  name: 'CockpitButton'
});

const authStore = useAuthStore();
const route = useRoute();
const isEnteringCockpit = shallowRef(false);

const cockpitScreenList = computed(() => authStore.userInfo.role?.project_sys_screen_list ?? []);
const cockpitReturnUrl = computed(() => {
  // 让当前路由参与依赖收集，路由切换时重新读取统一记录的 return_url。
  const currentPath = route.fullPath;
  if (!currentPath) return '';

  return getExternalReturnUrl();
});

const showCockpitButton = computed(() => Boolean(cockpitReturnUrl.value || cockpitScreenList.value.length));

function resolveCockpitPath(screen?: Api.Auth.ProjectSysScreenRouteItem) {
  if (!screen?.path) return '';

  const projectSysScreenId = screen.meta?.project_sys_screen_id;
  if (!projectSysScreenId) return screen.path;

  const separator = screen.path.includes('?') ? '&' : '?';

  return `${screen.path}${separator}project_sys_screen_id=${encodeURIComponent(String(projectSysScreenId))}`;
}

async function resolveLatestCockpitPath() {
  try {
    // 进入前先刷新用户信息，避免驾驶舱列表还是旧的角色数据。
    await authStore.refreshUserInfo();
  } catch (error) {
    console.error('Refresh user info before entering cockpit failed:', error);
  }

  return resolveCockpitPath(authStore.userInfo.role?.project_sys_screen_list?.[0]);
}

function buildCockpitUrl(path: string) {
  const targetPath = path || '/';

  return `/screen/#${targetPath}`;
}

function redirectToCockpit(url: string) {
  window.location.href = url;
}

async function enterCockpit() {
  if (isEnteringCockpit.value) return;

  isEnteringCockpit.value = true;
  window.setTimeout(() => {
    isEnteringCockpit.value = false;
  }, 3000);

  // 有回跳地址时，优先回到原来的大屏；否则进入当前角色可用的最新大屏。
  if (cockpitReturnUrl.value) {
    redirectToCockpit(cockpitReturnUrl.value);
    return;
  }

  const cockpitPath = await resolveLatestCockpitPath();
  if (!cockpitPath) {
    window.$message?.warning('暂无可进入的大屏');
    return;
  }

  redirectToCockpit(buildCockpitUrl(cockpitPath));
}
</script>

<template>
  <NButton
    v-if="showCockpitButton"
    type="primary"
    secondary
    size="small"
    class="cockpit-entry mr-8px h-36px"
    :focusable="false"
    :aria-busy="isEnteringCockpit"
    aria-label="驾驶舱"
    @click="enterCockpit"
  >
    <span class="cockpit-entry__content">
      <span class="cockpit-entry__emblem" aria-hidden="true">
        <span class="cockpit-entry__halo cockpit-entry__halo--outer"></span>
        <span class="cockpit-entry__halo cockpit-entry__halo--inner"></span>
        <SvgIcon icon="mdi:monitor-dashboard" class="cockpit-entry__icon text-18px" />
      </span>

      <span class="cockpit-entry__copy lt-sm:hidden">
        <span class="cockpit-entry__title">驾驶舱</span>
        <span class="cockpit-entry__code">COCKPIT</span>
      </span>

      <span class="cockpit-entry__signal lt-sm:hidden" aria-hidden="true">
        <span class="cockpit-entry__signal-line"></span>
        <span class="cockpit-entry__signal-line"></span>
        <span class="cockpit-entry__signal-line"></span>
      </span>
    </span>
  </NButton>
</template>

<style scoped>
.cockpit-entry {
  --n-color: transparent;
  --n-color-hover: transparent;
  --n-color-pressed: transparent;
  --n-border: 1px solid rgba(var(--primary-color), 0.34);
  --n-border-hover: 1px solid rgba(var(--info-color), 0.58);
  --n-border-pressed: 1px solid rgba(var(--info-color), 0.68);
  --n-text-color: rgb(var(--primary-color));
  --n-text-color-hover: rgb(var(--primary-color));
  --n-text-color-pressed: rgb(var(--primary-color));

  position: relative;
  min-width: 118px;
  overflow: hidden;
  isolation: isolate;
  padding: 0 10px;
  border-radius: 6px;
  background: transparent;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 0 12px rgba(var(--primary-color), 0.12);
  transition:
    box-shadow 0.22s ease,
    filter 0.22s ease;
}

.cockpit-entry__content {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.cockpit-entry__emblem {
  position: relative;
  display: inline-flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(var(--info-color), 0.3);
  border-radius: 50%;
}

.cockpit-entry__halo {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.cockpit-entry__halo--outer {
  inset: 2px;
  background: conic-gradient(
    from 0deg,
    transparent 0 24%,
    rgba(var(--info-color), 0.78) 30%,
    transparent 40% 68%,
    rgba(var(--primary-color), 0.48) 74%,
    transparent 84%
  );
  animation: cockpit-orbit 2.4s linear infinite;
}

.cockpit-entry__halo--inner {
  inset: 7px;
  border: 1px solid rgba(var(--primary-color), 0.32);
  animation: cockpit-ring-pulse 1.8s ease-in-out infinite;
}

.cockpit-entry__icon {
  position: relative;
  z-index: 1;
  color: rgb(var(--info-color));
  filter: drop-shadow(0 0 7px rgba(var(--info-color), 0.58));
}

.cockpit-entry__copy {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  text-align: left;
}

.cockpit-entry__title {
  color: rgb(var(--primary-color));
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
}

.cockpit-entry__code {
  color: rgba(var(--info-color), 0.82);
  font-size: 8px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
}

.cockpit-entry__signal {
  display: inline-flex;
  width: 18px;
  flex-direction: column;
  gap: 2px;
}

.cockpit-entry__signal-line {
  display: block;
  width: 100%;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, rgb(var(--info-color)));
  box-shadow: 0 0 7px rgba(var(--info-color), 0.36);
  transform-origin: right center;
  animation: cockpit-signal 1.2s ease-in-out infinite;
}

.cockpit-entry__signal-line:nth-child(2) {
  width: 72%;
  animation-delay: 0.16s;
}

.cockpit-entry__signal-line:nth-child(3) {
  width: 48%;
  animation-delay: 0.32s;
}

.cockpit-entry:hover {
  filter: saturate(1.12);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.12),
    0 0 16px rgba(var(--info-color), 0.16);
}

.cockpit-entry:active {
  filter: saturate(1.18) brightness(1.04);
}

@keyframes cockpit-orbit {
  to {
    transform: rotate(1turn);
  }
}

@keyframes cockpit-ring-pulse {
  0%,
  100% {
    opacity: 0.46;
    transform: scale(0.92);
  }

  50% {
    opacity: 0.88;
    transform: scale(1.08);
  }
}

@keyframes cockpit-signal {
  0%,
  100% {
    opacity: 0.42;
    transform: scaleX(0.52);
  }

  50% {
    opacity: 0.95;
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cockpit-entry,
  .cockpit-entry__halo,
  .cockpit-entry__signal-line {
    animation: none;
    transition: none;
  }
}

@media (max-width: 640px) {
  .cockpit-entry {
    min-width: 42px;
    padding: 0 8px;
  }
}
</style>
