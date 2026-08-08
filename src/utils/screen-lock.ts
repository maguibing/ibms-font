import { readonly, shallowRef } from 'vue';

const SCREEN_LOCK_CODES = ['100008', '100026'] as const;

type ScreenLockCode = (typeof SCREEN_LOCK_CODES)[number];

const locked = shallowRef(false);

export function isScreenLockCode(code: unknown): code is ScreenLockCode {
  return SCREEN_LOCK_CODES.includes(String(code) as ScreenLockCode);
}

export function useScreenLockState() {
  return {
    locked: readonly(locked)
  };
}

export function showScreenLock() {
  locked.value = true;
}

export function hideScreenLock() {
  locked.value = false;
}
