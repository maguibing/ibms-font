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
