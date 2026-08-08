import { h } from 'vue';
import { fetchRefreshToken } from '@/service/api/auth';
import { useAuthStore } from '@/store/modules/auth';
import { normalizeAccessToken } from '@/store/modules/auth/shared';
import { localStg } from '@/utils/storage';
import type { RequestInstanceState } from './type';

export function getAuthorization() {
  const token = localStg.get('token');
  const Authorization = token ? `Bearer ${token}` : null;

  return Authorization;
}

/** refresh token */
async function handleRefreshToken() {
  const authStore = useAuthStore();
  const refreshToken = localStg.get('refreshToken') || '';

  const { error, data } = await fetchRefreshToken({ refresh_token: refreshToken });
  if (!error) {
    const accessToken = normalizeAccessToken(data.access_token);

    localStg.set('token', accessToken);
    localStg.set('refreshToken', data.refresh_token);
    authStore.token = accessToken;
    return true;
  }

  authStore.resetStore();

  return false;
}

export async function handleExpiredRequest(state: RequestInstanceState) {
  if (!state.refreshTokenPromise) {
    state.refreshTokenPromise = handleRefreshToken();
  }

  const success = await state.refreshTokenPromise;

  setTimeout(() => {
    state.refreshTokenPromise = null;
  }, 1000);

  return success;
}

export function showErrorMsg(state: RequestInstanceState, message: string) {
  if (!state.errMsgStack?.length) {
    state.errMsgStack = [];
  }

  const isExist = state.errMsgStack.includes(message);

  if (!isExist) {
    state.errMsgStack.push(message);

    window.$message?.error(() => h('span', { style: { whiteSpace: 'pre-line' } }, message), {
      onLeave: () => {
        state.errMsgStack = state.errMsgStack.filter(msg => msg !== message);

        setTimeout(() => {
          state.errMsgStack = [];
        }, 5000);
      }
    });
  }
}
