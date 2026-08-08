import { localStg } from '@/utils/storage';

/** 去掉 token 里可能携带的 Bearer 前缀 */
export function normalizeAccessToken(token: string) {
  return token.replace(/^Bearer\s+/i, '');
}

/** Get token */
export function getToken() {
  return normalizeAccessToken(localStg.get('token') || '');
}

/** Clear auth storage */
export function clearAuthStorage() {
  localStg.remove('token');
  localStg.remove('refreshToken');
  localStg.remove('loginToken');
  localStg.remove('corpId');
  localStg.remove('projectId');
}
