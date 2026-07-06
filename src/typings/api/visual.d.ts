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

    type ProjectSysScreenUpdateItem = Pick<ProjectSysScreen, 'id' | 'name' | 'title'>;

    type ProjectSysScreenUpdateParams = {
      list: ProjectSysScreenUpdateItem[];
    };
  }
}
