import { localStg } from '@/utils/storage';

/** Get token */
export function getToken() {
  return localStg.get('token') || '';
}

/** 获取请求头 token，storage 保持后端返回原值 */
export function getAuthorizationToken() {
  const token = getToken();

  if (!token) return '';

  return /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`;
}

/** Clear auth storage */
export function clearAuthStorage() {
  localStg.remove('token');
  localStg.remove('refreshToken');
  localStg.remove('loginToken');
  localStg.remove('corp');
  localStg.remove('project');
}
