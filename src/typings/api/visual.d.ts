declare namespace Api {
  namespace Visual {
    type ProjectSysScreenConf = {
      is_mock?: boolean;
      show_enter_system?: boolean;
    };

    type ProjectSysScreenDetail = {
      component_path: string;
      keep_alive?: boolean;
      route_name: string;
      route_path: string;
    };

    type ProjectSysScreen = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      sys_screen_id: CommonType.IdType;
      title: string;
      name: string;
      status: number;
      conf?: ProjectSysScreenConf;
      detail?: ProjectSysScreenDetail;
    }>;

    type ProjectSysScreenMapItem = {
      id: CommonType.IdType;
      url: string;
    };

    type ProjectSysScreenListExtra = {
      sys_screen_map: Record<string, ProjectSysScreenMapItem>;
    };

    type ProjectSysScreenList = Api.Common.PaginatingQueryRecord<ProjectSysScreen, ProjectSysScreenListExtra>;

    type ProjectSysScreenSearchParams = CommonType.RecordNullable<
      Pick<ProjectSysScreen, 'name'> & Api.Common.CommonSearchParams
    >;

    type ProjectSysScreenTag = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      project_sys_screen_id: CommonType.IdType;
      key: string;
      name: string;
      scope?: number;
    }>;

    type ProjectSysScreenTagListExtra = {
      project_sys_screen_map: Record<string, Pick<ProjectSysScreen, 'id' | 'name'>>;
    };

    type ProjectSysScreenTagList = Api.Common.PaginatingQueryRecord<
      ProjectSysScreenTag,
      ProjectSysScreenTagListExtra
    >;

    type ProjectSysScreenTagOperateParams = CommonType.RecordNullable<
      Pick<ProjectSysScreenTag, 'id' | 'key' | 'name' | 'project_sys_screen_id' | 'scope'>
    >;

    type ProjectSysScreenTagPoint = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      project_sys_screen_id: CommonType.IdType;
      project_sys_screen_tag_id: CommonType.IdType;
      device_id: CommonType.IdType;
      logic_point_id: CommonType.IdType;
      mapping_point_name: string;
    }>;

    type ProjectSysScreenTagPointMapItem = CommonType.IdNameRecord & {
      key?: string;
    };

    type ProjectSysScreenTagPointListExtra = {
      device_map: Record<string, ProjectSysScreenTagPointMapItem>;
      logic_point_map: Record<string, ProjectSysScreenTagPointMapItem>;
      project_sys_screen_tag_map: Record<string, Pick<ProjectSysScreenTag, 'id' | 'name'>>;
    };

    type ProjectSysScreenTagPointList = Api.Common.PaginatingQueryRecord<
      ProjectSysScreenTagPoint,
      ProjectSysScreenTagPointListExtra
    >;

    type GetProjectSysScreenTagPointParams = {
      id: CommonType.IdType;
      options: CommonType.CommonKeysOptions[];
    };

    type ProjectSysScreenTagPointDetailResponse = {
      project_sys_screen_tag_point: ProjectSysScreenTagPoint;
      device_map?: Record<string, ProjectSysScreenTagPointMapItem>;
      logic_point_map?: Record<string, ProjectSysScreenTagPointMapItem>;
    };

    type ProjectSysScreenTagPointSearchParams = CommonType.RecordNullable<
      Pick<ProjectSysScreenTagPoint, 'device_id' | 'logic_point_id' | 'mapping_point_name'> &
        Api.Common.CommonSearchParams
    >;

    type ProjectSysScreenTagPointOperateParams = CommonType.RecordNullable<
      Pick<
        ProjectSysScreenTagPoint,
        'id' | 'device_id' | 'logic_point_id' | 'mapping_point_name' | 'project_sys_screen_id' | 'project_sys_screen_tag_id'
      >
    >;

    type ProjectSysScreenUpdateItem = Pick<ProjectSysScreen, 'id' | 'name' | 'title'>;

    type ProjectSysScreenUpdateParams = {
      list: ProjectSysScreenUpdateItem[];
    };
  }
}
