declare namespace Api {
  namespace Device {
    type PointOption = CommonType.IdNameRecord & {
      key?: string;
    };

    type Device = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      device_type_id: CommonType.IdType;
      device_group_id?: CommonType.IdType;
      group_id?: CommonType.IdType;
      key: string;
      name: string;
      status: number;
    }>;

    type DeviceType = CommonType.IdNameRecord & {
      project_id?: CommonType.IdType;
      desc?: string;
      key?: string;
      icon?: string;
      status?: number;
      created_at?: number;
      updated_at?: number;
    };

    type DeviceListExtra = {
      device_type_map?: Record<string, DeviceType>;
      device_group_map?: Record<string, DeviceGroup>;
    };

    type DeviceList = Api.Common.PaginatingQueryRecord<Device, DeviceListExtra>;

    type CreateDeviceParams = {
      add_key_start: string;
      add_num: number;
      desc: string;
      device_group_id: CommonType.IdType;
      device_type_id: CommonType.IdType;
      key: string;
      name: string;
      space_id: CommonType.IdType;
      status: number;
    };

    type DeviceSearchParams = CommonType.RecordNullable<
      Pick<Device, 'name' | 'key'> & {
        device_type_id: CommonType.IdType;
        device_group_id: CommonType.IdType;
      } & Api.Common.CommonSearchParams
    >;

    type DeviceTypeList = Api.Common.PaginatingQueryRecord<DeviceType>;

    type DeviceTypeDetailResponse = {
      device_type: DeviceType;
    };

    type DeviceTypeOperateParams = {
      desc: string;
      icon: string;
      is_auto_create_point?: boolean;
      device_type_template_point_id_list?: CommonType.IdType[];
      key: string;
      name: string;
      status: number;
    };

    type UpdateDeviceTypeParams = Pick<DeviceTypeOperateParams, 'desc' | 'icon' | 'key' | 'name' | 'status'> & {
      id: CommonType.IdType;
    };

    type DeviceTypeSearchParams = CommonType.RecordNullable<
      Pick<DeviceType, 'name' | 'key'> & Api.Common.CommonSearchParams
    >;

    type DeviceGroup = {
      group_id: CommonType.IdType;
      group_name: string;
      parent_id?: CommonType.IdType;
      desc?: string;
      children?: DeviceGroup[];
    };

    type DeviceGroupTreeResponse = {
      device_group_trees: DeviceGroup[];
    };

    type DeviceGroupDetailResponse = {
      device_group: {
        id: CommonType.IdType;
        created_at: number;
        updated_at: number;
        project_id: CommonType.IdType;
        name: string;
        level: number;
      };
    };

    type DeviceGroupSearchParams = CommonType.RecordNullable<{
      group_name: string;
    }>;

    type CreateDeviceGroupParams = {
      desc: string;
      name: string;
      parent_id: CommonType.IdType;
    };

    type UpdateDeviceGroupParams = CreateDeviceGroupParams & {
      id: CommonType.IdType;
    };

    type LogicPoint = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      device_type_id: CommonType.IdType;
      device_id: CommonType.IdType;
      device_type_point_id: CommonType.IdType;
      key: string;
      name: string;
      physical_point_id: CommonType.IdType;
      source_type: number;
    }>;

    type LogicPointList = Api.Common.PaginatingQueryRecord<LogicPoint>;
  }
}
