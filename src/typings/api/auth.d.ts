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

    /** check project form */
    interface CheckProjectForm {
      /** 项目名称 */
      project_name: string;
    }

    /** check project data */
    interface CheckProjectData {
      /** 项目 ID */
      project_id?: CommonType.IdType;
      /** 项目 ID */
      id?: CommonType.IdType;
      /** 项目名称 */
      project_name?: string;
      /** 项目名称 */
      name?: string;
    }

    /** register form */
    interface RegisterForm {
      /** 确认密码 */
      confirm_rsa_pwd: string;
      /** 用户名称 */
      name: string;
      /** 手机号码 */
      phone: string;
      /** 项目 ID */
      project_id: CommonType.IdType;
      /** 密码 */
      rsa_pwd: string;
      /** 验证码 */
      verify_code: string;
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

    interface RefreshTokenForm {
      /** 刷新令牌 */
      refresh_token: string;
    }

    interface RefreshTokenData {
      /** 授权令牌 */
      access_token: string;
      /** 刷新令牌 */
      refresh_token: string;
    }

    interface CorpLoginCorp {
      corp_id: number;
      name: string;
      status?: number;
      biz_id?: CommonType.IdType;
      audit_status?: number;
      contact_id?: number;
      ad_code?: string;
      ad_address?: string;
      address?: string;
    }

    interface CorpLoginUser {
      user_id: number;
      created_at?: number;
      p_type?: number;
      username: string;
      account_id?: number;
      gender?: number;
      role_id?: number;
      phone?: string;
      status?: number;
      biz_id?: number;
    }

    interface CorpLoginItem {
      corp: CorpLoginCorp;
      user: CorpLoginUser;
    }

    interface CorpLoginData {
      corp_list: CorpLoginItem[];
      login_token: string;
    }

    interface ProjectLoginItem {
      id: number;
      name: string;
      leader_id: number;
      user_id: number;
      can_use: boolean;
    }

    interface ProjectLoginData {
      project_list: ProjectLoginItem[];
      login_token: string;
    }

    interface SwitchProjectListData {
      project_list: ProjectLoginItem[];
    }

    interface SwitchCorpListData {
      corp_list: CorpLoginItem[];
    }

    interface SelectCorpForm {
      corp_id: number;
      login_token: string;
      user_id: number;
    }

    interface SelectProjectForm {
      project_id: number;
      login_token: string;
      user_id: number;
    }

    type LoginResult =
      | { type: 'corp-list'; data: CorpLoginData }
      | { type: 'project-list'; data: ProjectLoginData }
      | undefined;

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
      /** 以 id 作为键的部门映射，如 { 1: { id: 1, name: 'xx' } } */
      dept?: {
        id: number;
        name: string;
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
