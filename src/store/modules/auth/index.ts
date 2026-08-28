import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import {
  fetchCpLogin,
  fetchGetBaseInfo,
  fetchLogin,
  fetchLogout,
  fetchPjLogin,
  fetchSelectCorp,
  fetchSelectProject
} from '@/service/api';
import { useRouterPush } from '@/hooks/common/router';
import { localStg } from '@/utils/storage';
import { SetupStoreId } from '@/enum';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { useNoticeStore } from '../notice';
import { clearAuthStorage, getToken } from './shared';
import { $t } from '@/locales';

type LoginListResult = Exclude<Api.Auth.LoginResult, undefined>;

type SceneLoginResult = { result: LoginListResult; error: null } | { result: undefined; error: unknown };

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const route = useRoute();
  const authStore = useAuthStore();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const noticeStore = useNoticeStore();
  const { toLogin, redirectFromLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();

  const token = ref('');

  const userInfo: Api.Auth.BaseInfo = reactive({
    user: undefined,
    role: undefined,
    dept: undefined,
    corp: undefined,
    project: undefined,
    version: undefined
  });

  const userRoles = computed(() => {
    return userInfo.role?.role_name ? [userInfo.role.role_name] : [];
  });

  const userProfile = computed(() => {
    return userInfo;
  });

  /** is super role in static route */
  const isStaticSuper = computed(() => {
    const { VITE_AUTH_ROUTE_MODE, VITE_STATIC_SUPER_ROLE } = import.meta.env;

    return VITE_AUTH_ROUTE_MODE === 'static' && userRoles.value.some(role => role.includes(VITE_STATIC_SUPER_ROLE));
  });

  /** Is login */
  const isLogin = computed(() => Boolean(token.value));

  /** Reset auth store */
  async function resetStore() {
    recordUserId();

    clearAuthStorage();

    authStore.$reset();

    if (!route.meta.constant) {
      await toLogin();
    }

    noticeStore.clearNotice();
    tabStore.cacheTabs();
    routeStore.resetStore();
  }

  async function logout() {
    await fetchLogout();
    resetStore();
  }

  /** Record the user ID of the previous login session Used to compare with the current user ID on next login */
  function recordUserId() {
    if (!userInfo.user?.user_id) {
      return;
    }

    // Store current user ID locally for next login comparison
    localStg.set('lastLoginUserId', userInfo.user?.user_id);
  }

  /**
   * Check if current login user is different from previous login user If different, clear all tabs
   *
   * @returns {boolean} Whether to clear all tabs
   */
  function checkTabClear(): boolean {
    if (!userInfo.user?.user_id) {
      return false;
    }

    const lastLoginUserId = localStg.get('lastLoginUserId');

    // Clear all tabs if current user is different from previous user
    if (!lastLoginUserId || lastLoginUserId !== userInfo.user?.user_id) {
      localStg.remove('globalTabs');
      tabStore.clearTabs();

      localStg.remove('lastLoginUserId');
      return true;
    }

    localStg.remove('lastLoginUserId');
    return false;
  }

  async function redirectAfterLogin(redirect: boolean) {
    checkTabClear();
    await redirectFromLogin(redirect);
  }

  /**
   * Login
   *
   * @param [redirect=true] Whether to redirect after login. Default is `true`
   */
  async function login(
    loginForm: Api.Auth.PwdLoginForm | Api.Auth.SocialLoginForm,
    redirect = true
  ): Promise<Api.Auth.LoginResult> {
    startLoading();

    const { VITE_APP_CLIENT_ID } = import.meta.env;

    const loginData: Api.Auth.PwdLoginForm = {
      ...loginForm,
      clientId: VITE_APP_CLIENT_ID!,
      grantType: loginForm.grantType ?? 'password'
    };

    let result: Api.Auth.LoginResult = undefined;
    let loginError: unknown = null;

    const sceneLoginResult = await getSceneLoginResult(loginData);

    if (sceneLoginResult) {
      result = sceneLoginResult.result;
      loginError = sceneLoginResult.error;
      if (loginError) resetStore();
    } else {
      const { data: loginToken, error } = await fetchLogin(loginData);

      if (!error) {
        const pass = await loginByToken(loginToken);

        if (pass) {
          await redirectAfterLogin(redirect);
          window.$notification?.success({
            title: $t('page.login.common.loginSuccess'),
            content: $t('page.login.common.welcomeBack', { userName: userInfo.user?.username }),
            duration: 4500
          });
        }
      } else {
        loginError = error;
        resetStore();
      }
    }

    endLoading();

    return loginError ? Promise.reject(loginError) : result;
  }

  async function getSceneLoginResult(loginData: Api.Auth.PwdLoginForm): Promise<SceneLoginResult | null> {
    if (import.meta.env.VITE_APP_SCENE === 'cp') {
      const { data, error } = await fetchCpLogin(loginData);

      return error ? { result: undefined, error } : { result: { type: 'corp-list', data }, error: null };
    }

    if (import.meta.env.VITE_APP_SCENE === 'pj') {
      const { data, error } = await fetchPjLogin(loginData);

      return error ? { result: undefined, error } : { result: { type: 'project-list', data }, error: null };
    }

    return null;
  }

  async function selectCorpLogin(selectCorpForm: Api.Auth.SelectCorpForm, redirect = true) {
    localStg.set('loginToken', selectCorpForm.login_token);
    await selectLoginToken(() => fetchSelectCorp(selectCorpForm), redirect);
  }

  async function selectProjectLogin(selectProjectForm: Api.Auth.SelectProjectForm, redirect = true) {
    localStg.set('loginToken', selectProjectForm.login_token);
    await selectLoginToken(() => fetchSelectProject(selectProjectForm), redirect);
  }

  async function selectLoginToken(fetchLoginToken: () => ReturnType<typeof fetchSelectCorp>, redirect = true) {
    startLoading();

    const { data: loginToken, error } = await fetchLoginToken();

    if (!error) {
      const pass = await loginByToken(loginToken);

      if (pass) {
        await redirectAfterLogin(redirect);
      }
    } else {
      resetStore();
    }

    endLoading();

    return error ? Promise.reject(error) : Promise.resolve();
  }

  async function loginByToken(loginToken: Api.Auth.LoginToken) {
    const accessToken = loginToken.access_token!;

    // 1. storage 保持后端返回的 access_token 原值
    localStg.set('token', accessToken);
    localStg.set('refreshToken', loginToken.refresh_token!);

    // 2. get user info
    const pass = await getUserInfo();

    if (pass) {
      token.value = accessToken;

      return true;
    }

    return false;
  }

  async function getUserInfo() {
    const { data: info, error } = await fetchGetBaseInfo({ options: [{ key: 1 }, { key: 2 }, { key: 3 }, { key: 4 }] });

    if (!error) {
      // update store
      Object.assign(userInfo, info);

      if (import.meta.env.VITE_APP_SCENE === 'cp') {
        if (info.corp) localStg.set('corp', info.corp);
        else localStg.remove('corp');
      }

      if (import.meta.env.VITE_APP_SCENE === 'pj') {
        if (info.project) localStg.set('project', info.project);
        else localStg.remove('project');
      }

      return true;
    }

    return false;
  }

  function updateUserProfile(user: Api.Auth.UserInfoUser) {
    if (!userInfo.user) return;

    Object.assign(userInfo.user, user);
  }

  async function refreshUserInfo() {
    return getUserInfo();
  }

  async function initUserInfo() {
    const maybeToken = getToken();

    if (maybeToken) {
      token.value = maybeToken;
      const pass = await getUserInfo();

      if (!pass) {
        resetStore();
      }
    }
  }

  return {
    token,
    userInfo,
    userRoles,
    userProfile,
    isStaticSuper,
    isLogin,
    loginLoading,
    updateUserProfile,
    refreshUserInfo,
    resetStore,
    login,
    selectCorpLogin,
    selectProjectLogin,
    logout,
    initUserInfo
  };
});
