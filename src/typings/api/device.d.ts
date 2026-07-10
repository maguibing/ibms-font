declare namespace Api {
  namespace Device {
    type PointOption = CommonType.IdNameRecord & {
      key?: string;
    };

    type Device = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      device_type_id: CommonType.IdType;
      key: string;
      name: string;
      status: number;
    }>;

    type DeviceType = CommonType.IdNameRecord;

    type DeviceListExtra = {
      device_type_map: Record<string, DeviceType>;
    };

    type DeviceList = Api.Common.PaginatingQueryRecord<Device, DeviceListExtra>;

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
