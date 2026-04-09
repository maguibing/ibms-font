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

    /** role menu tree select */
    type RoleMenuTreeSelect = Common.CommonRecord<{
      checkedKeys: CommonType.IdType[];
      menus: MenuList;
    }>;
    /** teannt-package menu tree select */
    type TenantPackageMenuTreeSelect = Common.CommonRecord<{
      checkedKeys: CommonType.IdType[];
      menus: MenuList;
    }>;
    /** role dept tree select */
    type RoleDeptTreeSelect = Common.CommonRecord<{
      checkedKeys: CommonType.IdType[];
      depts: Dept[];
    }>;

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

    /**
     * 是否外链
     *
     * - "0": "是"
     * - "1": "否"
     * - "2": "iframe"
     */
    type IsMenuFrame = '0' | '1' | '2';

    type Menu = Common.CommonRecord<{
      /** 菜单 ID */
      menuId: CommonType.IdType;
      /** 父菜单 ID */
      parentId: CommonType.IdType;
      /** 菜单名称 */
      menuName: string;
      /** 显示顺序 */
      orderNum: number;
      /** 路由地址 */
      path: string;
      /** 组件路径 */
      component: string;
      /** 路由参数 */
      queryParam: string;
      /** 是否为外链（0是 1否 2iframe） */
      isFrame: IsMenuFrame;
      /** 是否缓存（0缓存 1不缓存） */
      isCache: Common.EnableStatus;
      /** 菜单类型（M目录 C菜单 F按钮） */
      menuType: MenuType;
      /** 显示状态（0显示 1隐藏） */
      visible: Common.VisibleStatus;
      /** 菜单状态（0正常 1停用） */
      status: Common.EnableStatus;
      /** 权限标识 */
      perms: string;
      /** 菜单图标 */
      icon: string;
      /** 备注 */
      remark?: string;
      /** 父菜单名称 */
      parentName: string;
      /** 子菜单 */
      children: MenuList;
      id?: CommonType.IdType;
      label?: string;
    }>;

    /** menu list */
    type MenuList = Menu[];

    /** menu search params */
    type MenuSearchParams = CommonType.RecordNullable<Pick<Menu, 'menuName' | 'status' | 'menuType' | 'parentId'>>;

    /** menu operate params */
    type MenuOperateParams = CommonType.RecordNullable<
      Pick<
        Menu,
        | 'menuId'
        | 'menuName'
        | 'parentId'
        | 'orderNum'
        | 'path'
        | 'component'
        | 'queryParam'
        | 'isFrame'
        | 'isCache'
        | 'menuType'
        | 'visible'
        | 'status'
        | 'perms'
        | 'icon'
        | 'remark'
      >
    >;

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

    /** dept search params */
    type DeptSearchParams = CommonType.RecordNullable<Pick<Api.System.Dept, 'name'> & Api.Common.CommonSearchParams>;

    /** dept operate params */
    type DeptOperateParams = CommonType.RecordNullable<
      Pick<Api.System.Dept, 'dept_id' | 'parent_id' | 'name' | 'sort' | 'leader_id'>
    >;

    /** dept list */
    type DeptList = Api.Common.PaginatingQueryRecord<Dept>;
  }
}
