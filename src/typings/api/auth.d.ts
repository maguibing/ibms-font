declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    /** base login form */
    interface LoginForm {
      /** 客户端 ID */
      clientId?: string;
      /** 授权类型 */
      grantType?: string;
      /** 验证码 */
      captcha_answer?: string;
      /** 验证码唯一标识 */
      captcha_id?: string;
    }

    /** password login form */
    interface PwdLoginForm extends LoginForm {
      /** 手机号 */
      phone?: string;
      /** rsa加密的密码 */
      rsa_pwd?: string;
    }

    /** social login form */
    interface SocialLoginForm extends LoginForm {
      /** 授权码 */
      socialCode?: string;
      /** 授权状态 */
      socialState?: string;
      /** 来源 */
      source?: string;
    }

    /** register form */
    interface RegisterForm extends LoginForm {
      /** 用户名 */
      username?: string;
      /** 密码 */
      password?: string;
      /** 确认密码 */
      confirmPassword?: string;
      /** 用户类型 */
      userType?: string;
    }

    /** login token data */
    interface LoginToken {
      /** 授权令牌 */
      access_token?: string;
      /** 刷新令牌 */
      refresh_token?: string;
      /** 用户id */
      user_id?: string;
    }

    /** 用户基础信息 */
    interface UserInfoUser {
      user_id: number;
      created_at?: number;
      p_type: number;
      username: string;
      account_id: number;
      dept_id?: number;
      gender?: number;
      role_id: number;
      phone: string;
      email?: string;
      status?: number;
    }

    /** 菜单元信息 */
    interface UserInfoMenuMeta {
      id: number;
      title: string;
      icon: string;
      is_visible?: boolean;
      keep_alive?: boolean;
      menu_type: number;
    }

    /** 角色菜单树节点 */
    interface UserInfoMenuTreeItem {
      path: string;
      component: string;
      name?: string;
      redirect?: string;
      meta: UserInfoMenuMeta;
      children?: UserInfoMenuTreeItem[];
    }

    /** 角色信息 */
    interface UserInfoRole {
      role_id: number;
      role_name: string;
      role_type: number;
      menu_tree: UserInfoMenuTreeItem[];
      button_perm_key_list: string[];
    }

    /** userinfo - 对应 /GetBaseInfo 接口 data 字段 */
    interface BaseInfo {
      user?: UserInfoUser;
      role?: UserInfoRole;
      /** 以 dept_id 作为键的部门映射，如 { 1: { dept_id: 1, dept_name: 'xx' } } */
      dept?: {
        dept_id: number;
        dept_name: string;
      };
    }

    interface CaptchaCode {
      /** 唯一标识 */
      captcha_id?: string;
      /** 验证码图片 */
      captcha_img?: string;
    }
  }
}
