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
    type UserInfoUser = Api.System.User;

    /** 部门信息 */
    type UserInfoDept = Api.Common.CommonRecord<{
      biz_id: CommonType.IdType;
      deleted_at: number;
      id: CommonType.IdType;
      leader_id: CommonType.IdType;
      level: number;
      name: string;
      p_type: number;
      parent_id: CommonType.IdType;
      sort: number;
    }>;

    /** 菜单详情 */
    interface UserInfoMenuDetail {
      button?: {
        perm_key: string;
      };
      dir?: {
        always_show: boolean;
        component_path: string;
        redirect_route: string;
        route_path: string;
      };
      ext_link?: {
        url: string;
      };
      page?: {
        component_path: string;
        keep_alive: boolean;
        route_name: string;
        route_path: string;
      };
    }

    /** 菜单信息 */
    type UserInfoMenu = Api.Common.CommonRecord<{
      deleted_at: number;
      detail: UserInfoMenuDetail;
      icon: string;
      id: CommonType.IdType;
      is_visible: boolean;
      level: number;
      name: string;
      p_type: number;
      parent_id: CommonType.IdType;
      sort: number;
      type: Api.System.MenuNodeType;
    }>;

    /** 项目信息 */
    type UserInfoProject = Api.Common.CommonRecord<{
      ad_address: string;
      ad_code: string;
      address: string;
      deleted_at: number;
      desc: string;
      id: CommonType.IdType;
      key: string;
      logo: string;
      main_custom_screen_id: CommonType.IdType;
      main_custom_screen_key: string;
      name: string;
      status: number;
      version_id: CommonType.IdType;
    }>;

    /** 版本信息 */
    type UserInfoVersion = Api.Common.CommonRecord<{
      corp_id: CommonType.IdType;
      deleted_at: number;
      desc: string;
      end_at: number;
      id: CommonType.IdType;
      menu_conf: {
        menu_id_list: CommonType.IdType[];
      };
      name: string;
      price_conf: {
        day: number;
        discount_price: number;
        original_price: number;
        time_type: Api.System.VersionTimeType;
      };
      project_id: CommonType.IdType;
      resource_conf: {
        data_store_day: number;
        day_msg_num: number;
        device_num: number;
        project_user_num: number;
        time_type: Api.System.VersionTimeType;
      };
      start_at: number;
    }>;

    /** 菜单元信息 */
    interface UserInfoMenuMeta {
      always_show: boolean;
      id: number;
      title: string;
      icon: string;
      is_visible: boolean;
      keep_alive: boolean;
      menu_type: number;
    }

    /** 角色菜单树节点 */
    interface UserInfoMenuTreeItem {
      path: string;
      component: string;
      name: string;
      redirect: string;
      meta: UserInfoMenuMeta;
      perm_key: string;
      children?: UserInfoMenuTreeItem[];
    }

    /** 项目大屏路由元信息 */
    interface ProjectSysScreenRouteMeta {
      id: CommonType.IdType;
      industry_id_list: CommonType.IdType[];
      name: string;
      project_sys_screen_id: CommonType.IdType;
      project_sys_screen_is_ctrl: boolean;
      project_sys_screen_is_mock: boolean;
      project_sys_screen_show_3d_visual: boolean;
      project_sys_screen_show_enter_system: boolean;
      project_sys_screen_show_logout_button: boolean;
      project_sys_screen_show_personal_info: boolean;
      status: number;
      title: string;
      url: string;
    }

    interface ProjectSysScreenRouteItem {
      component: string;
      name: string;
      path: string;
      redirect: string;
      meta: ProjectSysScreenRouteMeta;
    }

    /** 角色信息 */
    interface UserInfoRole {
      role_id: number;
      role_name: string;
      role_type: number;
      menu_tree: UserInfoMenuTreeItem[];
      button_perm_key_list: string[];
      project_sys_screen_list: ProjectSysScreenRouteItem[];
    }

    /** userinfo - 对应 /GetBaseInfo 接口 data 字段 */
    interface BaseInfo {
      corp?: CorpLoginCorp;
      dept?: UserInfoDept;
      menu_map?: Record<string, UserInfoMenu>;
      project?: UserInfoProject;
      role?: UserInfoRole;
      user?: UserInfoUser;
      version?: UserInfoVersion;
    }

    interface CaptchaCode {
      /** 唯一标识 */
      captcha_id?: string;
      /** 验证码图片 */
      captcha_img?: string;
    }
  }
}
