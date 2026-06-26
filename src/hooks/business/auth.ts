import { useAuthStore } from '@/store/modules/auth';

export function useAuth() {
  const authStore = useAuthStore();

  function hasAuth(codes: string | string[]) {
    if (!authStore.isLogin) {
      return false;
    }

    const role = authStore.userInfo.role;
    if (!role) {
      return false;
    }

    // 超级管理员拥有所有权限
    if (role.role_type === 1) {
      return true;
    }

    // 将单个权限转换为数组统一处理
    const codeList = Array.isArray(codes) ? codes : [codes];

    return codeList.some(code => role.button_perm_key_list.includes(code));
  }

  return {
    hasAuth,
  };
}
