import { request } from '../request';

/** Get image code */
export function fetchCaptchaCode() {
  return request<Api.Auth.CaptchaCode>({
    url: '/GetCaptcha',
    method: 'POST'
  });
}

/**
 * Login
 *
 * @param username User name
 * @param password Password
 */
export function fetchLogin(data: Api.Auth.PwdLoginForm) {
  return request<Api.Auth.LoginToken>({
    url: '/Login',
    method: 'POST',
    data
  });
}

/** social login callback */
export function fetchSocialLoginCallback(data: Api.Auth.SocialLoginForm) {
  return request({
    url: '/auth/social/callback',
    method: 'post',
    data
  });
}

/** Register */
export function fetchRegister(data: Api.Auth.RegisterForm) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/register',
    method: 'post',
    headers: {
      isToken: false,
      isEncrypt: true,
      repeatSubmit: false
    },
    data
  });
}

/** Get user info */
export function fetchGetBaseInfo(data: CommonType.CommonRequestOptions) {
  return request<Api.Auth.BaseInfo>({ url: '/GetBaseInfo', method: 'POST', data });
}

/** Logout */
export function fetchLogout() {
  if (import.meta.env.VITE_APP_SSE === 'Y') {
    request({
      url: '/resource/sse/close',
      method: 'get'
    });
  }
  return request({
    url: '/auth/logout',
    method: 'post'
  });
}
