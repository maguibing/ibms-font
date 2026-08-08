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

/** Refresh token */
export function fetchRefreshToken(data: Api.Auth.RefreshTokenForm) {
  return request<Api.Auth.RefreshTokenData>({
    url: '/RefreshToken',
    method: 'POST',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    data
  });
}

export function fetchCpLogin(data: Api.Auth.PwdLoginForm) {
  return request<Api.Auth.CorpLoginData>({
    url: '/Login',
    method: 'POST',
    data
  });
}

export function fetchPjLogin(data: Api.Auth.PwdLoginForm) {
  return request<Api.Auth.ProjectLoginData>({
    url: '/Login',
    method: 'POST',
    data
  });
}

/** Get project list for switching */
export function fetchGetSwitchProjectList() {
  return request<Api.Auth.SwitchProjectListData>({
    url: '/GetProjectList',
    method: 'POST'
  });
}

/** Get corp list for switching */
export function fetchGetSwitchCorpList() {
  return request<Api.Auth.SwitchCorpListData>({
    url: '/GetCorpList',
    method: 'POST'
  });
}

export function fetchSelectCorp(data: Api.Auth.SelectCorpForm) {
  return request<Api.Auth.LoginToken>({
    url: '/SelectCorp',
    method: 'POST',
    data
  });
}

export function fetchSelectProject(data: Api.Auth.SelectProjectForm) {
  return request<Api.Auth.LoginToken>({
    url: '/SelectProject',
    method: 'POST',
    data
  });
}

/** Send verify code */
export function fetchSendVerifyCode(data: { phone: string }) {
  return request({
    url: '/SendVerifyCode',
    method: 'POST',
    data
  });
}

/** Check project */
export function fetchCheckProject(data: Api.Auth.CheckProjectForm) {
  return request<Api.Auth.CheckProjectData>({
    url: '/CheckProject',
    method: 'POST',
    headers: {
      isToken: false
    },
    data
  });
}

/** Forget password */
export function fetchForgetPassword(data: { phone: string; verify_code: string; rsa_pwd: string }) {
  return request({
    url: '/ForgetPassword',
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
    url: '/Register',
    method: 'POST',
    headers: {
      isToken: false,
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
    url: '/Logout',
    method: 'post'
  });
}
