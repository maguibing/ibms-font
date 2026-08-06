<script setup lang="ts">
defineOptions({
  name: 'CockpitButton'
});
</script>

<template>
  <NButton
    type="primary"
    secondary
    size="small"
    class="cockpit-entry mr-8px h-36px"
    :focusable="false"
    aria-label="驾驶舱"
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
