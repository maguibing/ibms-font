/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  /**
   * namespace System
   *
   * backend api module: "system"
   */
  namespace System {
    /** data scope */
    type DataScope = '1' | '2' | '3' | '4';

    type Role = Common.CommonRecord<{
      id: CommonType.IdType;
      created_at: number;
      updated_at: number;
      p_type: number;
      name: string;
      role_type: number;
      data_scope: number;
      perm_auth: PermAuth;
      desc?: string;
    }>;

    /** role search params */
    type RoleSearchParams = CommonType.RecordNullable<Pick<Api.System.Role, 'name'> & Api.Common.CommonSearchParams>;

    /** role operate params */
    type RoleOperateParams = CommonType.RecordNullable<
      Pick<Api.System.Role, 'id' | 'name' | 'desc'> & { menu_id_list: CommonType.IdType[] }
    >;

    /** role list */

    type MenuAuth =
      | {
        menu_id_list: number[];
        has_all?: false;
      }
      | {
        has_all: true;
        menu_id_list?: number[];
      };

    interface PermAuth {
      menu_auth?: MenuAuth;
      [key: string]: unknown;
    }

    /** role list */
    type RoleList = Common.PaginatingQueryRecord<Role>;

    type RoleDetailResponse = {
      role: Role;
    };

    /** corp */
    type Corp = Common.CommonRecord<{
      id: CommonType.IdType;
      name: string;
      status: number;
      audit_status: number;
      contact_id: CommonType.IdType;
      address?: string;
      ad_code?: string;
      ad_address?: string;
    }>;

    /** corp base user */
    type CorpBaseUser = {
      user_id: CommonType.IdType;
      created_at: number;
      p_type: number;
      username: string;
      account_id: CommonType.IdType;
      gender?: number;
      role_id: CommonType.IdType;
      phone: string;
      email?: string;
      status: number;
      biz_id: CommonType.IdType;
    };

    /** corp list extra */
    type CorpListExtra = {
      base_user_map: Record<string, CorpBaseUser>;
    };

    /** corp list */
    type CorpList = Common.PaginatingQueryRecord<Corp, CorpListExtra>;

    /** corp project version */
    type CorpProjectVersion = Common.CommonRecord<{
      id: CommonType.IdType;
      corp_id?: CommonType.IdType;
      corp_name?: string;
      project_id?: CommonType.IdType;
      name: string;
      desc?: string;
      menu_conf?: {
        menu_id_list?: CommonType.IdType[];
      };
      resource_conf?: {
        device_num?: number;
        data_store_day?: number;
        day_msg_num?: number;
        project_user_num?: number;
      };
      price_conf?: {
        day?: number;
        discount_price?: number;
        original_price?: number;
      };
      start_at: number;
      end_at: number;
    }>;

    type CorpProjectVersionListExtra = {
      random_map: Record<string, { random_list?: string[] }>;
      all_map: Record<string, { all_list?: string[] }>;
      corp_map: Record<string, Pick<Corp, 'id' | 'name'>>;
    };

    type CorpProjectVersionList = Common.PaginatingQueryRecord<CorpProjectVersion, CorpProjectVersionListExtra>;

    type CorpProjectVersionListParams = CommonType.CommonListQueryParams & {
      corp_id?: CommonType.IdType;
    };

    type VersionMenuItem = {
      id?: CommonType.IdType;
      menu_id?: CommonType.IdType;
      type?: number | string;
      name?: string;
      title?: string;
      label?: string;
      path?: string;
      children?: VersionMenuItem[];
      [key: string]: unknown;
    };

    type GetVersionParams = {
      version_id: CommonType.IdType;
      options: CommonType.CommonKeysOptions[];
    };

    type GetVersionResponse = {
      current_version?: CorpProjectVersion;
      version?: CorpProjectVersion;
      corp_project_version?: CorpProjectVersion;
      corp?: Pick<Corp, 'id' | 'name'>;
      corp_name?: string;
      corp_map?: Record<string, Pick<Corp, 'id' | 'name'>>;
      menu_list?: VersionMenuItem[];
      menu_tree?: VersionMenuItem[];
      version_menu?: VersionMenuItem[];
      menu_map?: Record<string, VersionMenuItem>;
      random_list?: string[];
      all_list?: string[];
    };

    type CorpProjectVersionSearchParams = CommonType.RecordNullable<
      Pick<CorpProjectVersion, 'name' | 'corp_id'> & Api.Common.CommonSearchParams
    >;

    type RenewalVersionParams = {
      id: CommonType.IdType;
      days: number;
    };

    type BindVersionCorpParams = {
      corp_id: CommonType.IdType;
      version_id_list: CommonType.IdType[];
    };

    type CreateVersionParams = {
      corp_id?: CommonType.IdType;
      desc: string;
      menu_conf: {
        menu_id_list: CommonType.IdType[];
      };
      name: string;
      price_conf: {
        day: number;
        discount_price: number;
        original_price: number;
      };
      resource_conf: {
        data_store_day: number;
        day_msg_num: number;
        device_num: number;
        project_user_num: number;
      };
      start_at: number;
    };

    type UpdateVersionParams = CreateVersionParams & {
      id: CommonType.IdType;
    };

    /** corp detail */
    type CorpDetail = {
      corp: Corp;
      base_user_map: Record<string, CorpBaseUser>;
    };

    /** corp operate params */
    type CorpOperateParams = CommonType.RecordNullable<
      Pick<Corp, 'name' | 'address' | 'ad_code' | 'ad_address'> & {
        contact_name: string;
        contact_phone: string;
        contact_email: string;
        rsa_pwd: string;
      }
    >;

    /** corp audit status params */
    type CorpAuditStatusParams = Pick<Corp, 'id' | 'audit_status'>;

    /** corp status params */
    type CorpStatusParams = Pick<Corp, 'id' | 'status'>;

    /** corp search params */
    type CorpSearchParams = CommonType.RecordNullable<
      Pick<Corp, 'name'> & {
        contact_name: string;
        contact_phone: string;
      } & Api.Common.CommonSearchParams
    >;

    type IndustryOperateParams = CommonType.RecordNullable<Pick<Api.System.Industry, 'id' | 'name' | 'sort' | 'desc'>>;

    /** industry */
    type Industry = Common.CommonRecord<{
      /** 行业ID */
      id: CommonType.IdType;
      /** 行业名称 */
      name: string;
      sort: number;
      desc: string;
    }>;

    /** industry list */
    type IndustryList = Common.PaginatingQueryRecord<Industry>;

    /** industry search params */
    type IndustrySearchParams = CommonType.RecordNullable<
      Pick<Api.System.Industry, 'name'> & Api.Common.CommonSearchParams
    >;

    /** device type template category */
    type DeviceTypeTemplateCategory = Common.CommonRecord<{
      id: CommonType.IdType;
      deleted_at: number;
      name: string;
      sort: number;
      desc: string;
    }>;

    type DeviceTypeTemplateCategoryOperateParams = CommonType.RecordNullable<
      Pick<DeviceTypeTemplateCategory, 'id' | 'name' | 'sort' | 'desc'>
    >;

    /** device type template category list */
    type DeviceTypeTemplateCategoryList = Common.PaginatingQueryRecord<DeviceTypeTemplateCategory>;

    /** device type template */
    type DeviceTypeTemplate = Common.CommonRecord<{
      id: CommonType.IdType;
      category_id: CommonType.IdType;
      desc: string;
      icon: string;
      name: string;
      key: string;
      status: number;
    }>;

    /** device type template list */
    type DeviceTypeTemplateList = Common.PaginatingQueryRecord<DeviceTypeTemplate>;

    /** device type template operate params */
    type DeviceTypeTemplateOperateParams = CommonType.RecordNullable<
      Pick<DeviceTypeTemplate, 'id' | 'category_id' | 'desc' | 'icon' | 'key' | 'name' | 'status'>
    >;

    /** device type template search params */
    type DeviceTypeTemplateSearchParams = CommonType.RecordNullable<
      Pick<DeviceTypeTemplate, 'name' | 'category_id'> & Api.Common.CommonSearchParams
    >;

    /** device type template point value item */
    type DeviceTypeTemplatePointValueItem = {
      value: string;
      alias: string;
    };

    /** device type template point setting */
    type DeviceTypeTemplatePointSetting =
      | {
        data_type: 1;
        num_val: {
          default_value: number;
          scale: 1 | 2 | 3 | 4;
          unit: string;
        };
      }
      | {
        data_type: 2;
        switch_val: {
          cmd_val_data_type: 1 | 2 | 3;
          false_val: DeviceTypeTemplatePointValueItem;
          true_val: DeviceTypeTemplatePointValueItem;
        };
      }
      | {
        data_type: 3;
        str_val: {
          default_value: string;
        };
      }
      | {
        data_type: 4;
        enum_val: {
          cmd_val_data_type: 1 | 2;
          enum_list: DeviceTypeTemplatePointValueItem[];
        };
      };

    /** device type template point */
    type DeviceTypeTemplatePoint = Common.CommonRecord<{
      id: CommonType.IdType;
      template_id: CommonType.IdType;
      name: string;
      key: string;
      energy_type?: number;
      data_type: CommonType.DataType;
      setting: DeviceTypeTemplatePointSetting;
      desc?: string;
    }>;

    /** device type template point list */
    type DeviceTypeTemplatePointList = Common.PaginatingQueryRecord<DeviceTypeTemplatePoint>;

    /** device type template point detail response */
    type DeviceTypeTemplatePointDetailResponse = {
      device_type_template_point: DeviceTypeTemplatePoint;
    };

    /** device type template point operate params */
    type DeviceTypeTemplatePointOperateParams = CommonType.RecordNullable<
      Pick<
        DeviceTypeTemplatePoint,
        'id' | 'template_id' | 'name' | 'key' | 'energy_type' | 'data_type' | 'setting' | 'desc'
      >
    >;

    /** device type template point search params */
    type DeviceTypeTemplatePointSearchParams = CommonType.RecordNullable<
      Pick<DeviceTypeTemplatePoint, 'name'> & Api.Common.CommonSearchParams
    >;

    /** sys screen */
    type SysScreen = Common.CommonRecord<{
      /** 大屏ID */
      id: CommonType.IdType;
      /** 大屏名称 */
      name: string;
      /** 大屏封面 */
      url: string;
      /** 行业类型 */
      industry_type: string;
      /** 状态：1启用 2停用 */
      status: 1 | 2;
      sort: number;
      desc: string;
      detail?: SysScreenDetail;
      industry_conf?: SysScreenIndustryConf;
      project_conf?: SysScreenDetailProjectConf;
    }>;

    type SysScreenDetailResponse = {
      sys_screen: SysScreenDetailData;
      industry_map?: CommonType.IdNameMap;
      project_map?: CommonType.IdNameMap;
    };

    type SysScreenDetailData = Common.CommonRecord<{
      /** 大屏ID */
      id: CommonType.IdType;
      /** 大屏名称 */
      name: string;
      /** 大屏封面 */
      url: string;
      /** 状态：1启用 2停用 */
      status: 1 | 2;
      detail?: SysScreenDetail;
      industry_conf?: SysScreenIndustryConf;
      project_conf?: SysScreenDetailProjectConf;
    }>;

    type SysScreenDetail = {
      component_path: string;
      keep_alive?: boolean;
      route_name: string;
      route_path: string;
    };

    type SysScreenProjectConf = {
      is_mock: boolean;
      project_id: number | null;
      show_3d_visual: boolean;
      show_enter_system: boolean;
      show_logout_button: boolean;
      show_personal_info: boolean;
    };

    type SysScreenDetailProjectConf = {
      sub_conf_list?: SysScreenProjectConf[];
    };

    type SysScreenIndustryConf = {
      industry_id_list: CommonType.IdType[];
    };

    type SysScreenOperateParams = {
      detail: SysScreenDetail;
      industry_id_list: CommonType.IdType[];
      name: string;
      project_conf: SysScreenProjectConf[];
      status: 1 | 2;
      url: string;
    };

    type SysScreenUpdateParams = SysScreenOperateParams & {
      id: CommonType.IdType;
    };

    /** sys screen list */
    type SysScreenList = Common.PaginatingQueryRecord<SysScreen>;

    /** sys screen search params */
    type SysScreenSearchParams = CommonType.RecordNullable<
      Pick<Api.System.SysScreen, 'name' | 'industry_type'> & Api.Common.CommonSearchParams
    >;

    type Project = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      ad_code?: string;
      ad_address?: string;
      address?: string;
      corp_leader_id?: CommonType.IdType;
      desc?: string;
      leader_phone?: string;
      leader_username?: string;
      name: string;
      project_leader_id?: CommonType.IdType;
      status?: number;
      version_id?: CommonType.IdType;
      version_name?: string;
    }>;

    type ProjectListExtra = {
      base_user_map: Record<string, Pick<User, 'user_id' | 'username' | 'phone'>>;
      version_map: Record<string, Pick<CorpProjectVersion, 'id' | 'name'>>;
    };

    type ProjectList = Api.Common.PaginatingQueryRecord<Project, ProjectListExtra>;

    type ProjectUserStatus = 1 | 2;

    type ProjectUser = Omit<User, 'status'> & {
      biz_id: CommonType.IdType;
      status?: ProjectUserStatus;
    };

    type ProjectUserListParams = {
      list_option: {
        options: Array<Partial<CommonType.CommonTypeOptions>>;
        offset: number;
        limit: number;
      };
      options: CommonType.CommonKeysOptions[];
      project_id: CommonType.IdType;
    };

    type ProjectUserListExtra = {
      leader_map: Record<string, boolean>;
    };

    type ProjectUserList = Api.Common.PaginatingQueryRecord<ProjectUser, ProjectUserListExtra>;

    type ProjectUserUpdateParams = {
      dept_id: number;
      email: string;
      gender: number;
      role_id: number;
      status: ProjectUserStatus;
      user_id: number;
      username: string;
    };

    type ProjectOperateParams = {
      ad_address: string;
      ad_code: string;
      address: string;
      desc: string;
      leader_id: CommonType.IdType;
      name: string;
      rsa_pwd: string;
      version_id: CommonType.IdType;
    };

    type ProjectUpdateParams = Omit<ProjectOperateParams, 'rsa_pwd'> & {
      id: CommonType.IdType;
    };

    type ProjectSearchParams = CommonType.RecordNullable<Pick<Project, 'name'> & Api.Common.CommonSearchParams>;

    /** license type */
    type LicenseType = 1 | 2;

    /** generate system cert params */
    type GenerateSysCertParams = {
      license_expire_at: number;
      license_type: LicenseType;
    };

    /** generate system cert response */
    type GenerateSysCertResponse = {
      license_content: string;
    };

    /** all role */
    type AllRole = Pick<Api.System.Role, 'id' | 'name'>;

    /**
     * user gender
     *
     * - "1": "male"
     * - "2": "female"
     */
    type UserGender = '1' | '2';

    /** user */
    type User = {
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
    };

    /** user search params */
    type UserSearchParams = CommonType.RecordNullable<
      Pick<User, 'username' | 'phone' | 'dept_id'> & { dateRange?: [number, number] } & Common.CommonSearchParams
    >;

    /** user operate params */
    type UserOperateParams = CommonType.RecordNullable<
      Pick<User, 'user_id' | 'dept_id' | 'username' | 'email' | 'phone' | 'gender' | 'status' | 'role_id'> & {
        password: string;
      }
    >;

    /** user profile operate params */
    type UserProfileOperateParams = CommonType.RecordNullable<Pick<User, 'username' | 'email' | 'phone' | 'gender'>>;

    /** user password operate params */
    type UserPasswordOperateParams = CommonType.RecordNullable<{
      old_rsa_pwd: string;
      new_rsa_pwd: string;
      confirm_rsa_pwd?: string;
    }>;

    /** get real phone params */
    type UserPhoneParams = {
      user_id: CommonType.IdType;
    };

    /** get real phone response */
    type UserPhone = {
      phone: string;
    };

    /** user list */
    type UserListDeptInfo = {
      id: number;
      name: string;
    };

    type UserListRoleInfo = {
      id: number;
      name: string;
      role_type: number;
    };

    type UserListExtra = {
      dept_info_map: Record<string, UserListDeptInfo>;
      role_info_map: Record<string, UserListRoleInfo>;
      user_data_scope_map: Record<string, boolean>;
    };

    type UserList = Common.PaginatingQueryRecord<User, UserListExtra>;

    /** auth role */
    type AuthRole = {
      user: User;
      roles: Role[];
    };

    /**
     * icon type
     *
     * - "1": iconify icon
     * - "2": local icon
     */
    type IconType = '1' | '2';

    /**
     * menu layout
     *
     * - "0": "默认布局"
     * - "1": "空白布局"
     */
    type MenuLayout = '0' | '1';

    /**
     * menu type
     *
     * - "M": "目录"
     * - "C": "菜单"
     * - "F": "按钮"
     */
    type MenuType = 'M' | 'C' | 'F';

    /** backend menu tree type */
    type BackendMenuType = 1 | 2 | 3 | 4;

    interface MenuTreeMeta {
      id: CommonType.IdType;
      title: string;
      icon?: string;
      /** 为 true 时返回该字段，为 false 时后端不返回 */
      is_visible?: boolean;
      keep_alive?: boolean;
      menu_type?: BackendMenuType | number;
    }

    interface MenuTreeNode {
      path?: string;
      component?: string;
      name?: string;
      redirect?: string;
      meta?: MenuTreeMeta;
      children?: MenuTreeNode[];
      perm_key?: string;
    }

    /**
     * 是否外链
     *
     * - "0": "是"
     * - "1": "否"
     * - "2": "iframe"
     */
    type IsMenuFrame = '0' | '1' | '2';

    type MenuNodeType = 1 | 2 | 3 | 4;

    type PlatformBooleanStatus = boolean | 1 | 2 | '1' | '2';

    interface MenuNodeMeta {
      id: CommonType.IdType;
      title: string;
      icon?: string;
      /** 1/true 表示启用，2/false 或不返回表示停用 */
      is_visible?: PlatformBooleanStatus;
      /** 1/true 表示缓存，2/false 或不返回表示不缓存 */
      keep_alive?: PlatformBooleanStatus;
      /** 1目录 2菜单 3按钮；为 0 时后端不返回 */
      menu_type?: MenuNodeType | number;
    }

    type MenuNodeBaseDetail = {
      id: CommonType.IdType;
      parent_id?: CommonType.IdType;
      p_type?: CommonType.IdType;
      name: string;
      icon?: string;
      sort?: number;
      is_visible?: PlatformBooleanStatus;
    };

    type MenuNodeDetail =
      | (MenuNodeBaseDetail & {
        type: 1;
        detail: {
          dir: {
            component_path: string;
            route_path: string;
          };
        };
      })
      | (MenuNodeBaseDetail & {
        type: 2;
        detail: {
          page: {
            component_path: string;
            keep_alive?: PlatformBooleanStatus;
            route_name: string;
            route_path: string;
          };
        };
      })
      | (MenuNodeBaseDetail & {
        type: 3;
        detail: {
          button: {
            perm_key: string;
          };
        };
      });

    interface MenuNode {
      id?: CommonType.IdType;
      parent_id?: CommonType.IdType;
      p_type?: CommonType.IdType;
      layout?: MenuLayout;
      order_num?: number;
      path?: string;
      component?: string;
      name?: string;
      query_param?: string;
      is_frame?: IsMenuFrame;
      status?: Common.EnableStatus;
      perm_key?: string;
      meta: MenuNodeMeta;
      children?: MenuNode[];
    }

    type MenuNodeList = MenuNode[];

    type MenuNodeTreeResponse = {
      trees: MenuNode[];
      menu_type_map?: Record<string, MenuNodeType | number>;
    };

    type MenuNodeDetailResponse = {
      menu: MenuNodeDetail;
    };

    type MenuNodeOperateDetail = {
      button?: {
        perm_key: string;
      };
      dir?: {
        always_show: boolean;
        component_path: string;
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
    };

    type MenuNodeOperateParams = {
      id?: CommonType.IdType;
      detail: MenuNodeOperateDetail;
      icon: string;
      is_visible: boolean;
      name: string;
      p_type: CommonType.IdType;
      parent_id: CommonType.IdType;
      sort: number;
      type: MenuNodeType;
    };

    /** dept */
    type Dept = Api.Common.CommonRecord<{
      /** 部门id */
      dept_id: CommonType.IdType;
      /** 父部门id */
      parent_id: CommonType.IdType;
      /** 部门名称 */
      name: string;
      /** 显示顺序 */
      sort: number;
      /** 负责人 */
      leader_id: number;
    }>;

    type DeptDetailResponse = {
      dept: {
        id: CommonType.IdType;
        parent_id?: CommonType.IdType;
        name?: string;
        sort?: number;
        leader_id?: number;
      };
    };

    /** dept search params */
    type DeptSearchParams = CommonType.RecordNullable<Pick<Api.System.Dept, 'name'> & Api.Common.CommonSearchParams>;

    /** dept operate params */
    type DeptOperateParams = CommonType.RecordNullable<
      Pick<Api.System.Dept, 'dept_id' | 'parent_id' | 'name' | 'sort' | 'leader_id'> & { id: CommonType.IdType }
    >;

    /** dept list */
    type DeptList = Api.Common.PaginatingQueryRecord<Dept>;
  }
}
