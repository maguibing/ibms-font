declare namespace Api {
  namespace Energy {
    type DevicePointEnergyPoint = {
      logic_point_id: CommonType.IdType;
      logic_point_key: string;
      energy_type: number;
      value?: number;
    };

    type DevicePointEnergy = {
      stat_at: number;
      device_id: CommonType.IdType;
      point_energy_list: DevicePointEnergyPoint[];
    };

    type DevicePointEnergyListExtra = {
      device_map: CommonType.IdNameMap;
      logic_point_map: Record<string, CommonType.IdNameRecord & { key?: string }>;
    };

    type DevicePointEnergyList = {
      paginate: Api.Common.PaginateMeta;
      energy_list: DevicePointEnergy[];
    } & DevicePointEnergyListExtra;

    type DevicePointEnergySearchParams = Api.Common.CommonSearchParams & {
      device_names: string[];
      dateRange: [number, number] | null;
    };

    type DevicePointEnergyListSearchParams = Api.Common.CommonSearchParams & {
      aggregation_type: number;
      energy_types: number[];
      space_id: CommonType.IdType | null;
      device_ids: CommonType.IdType[];
      dateRange: [number, number] | null;
    };

    type DevicePointEnergyListParams = CommonType.CommonListQueryParams & {
      time_range?: {
        start_at: number;
        end_at: number;
      };
    };

    type EnergyCalendarItem = {
      ts: number;
      energy?: number;
      cooling?: number;
      cop?: number;
    };

    type EnergyCalendarData = {
      list: EnergyCalendarItem[];
    };

    type EnergyCalendarParams = {
      stat_type: number;
      time_range: {
        start_at: number;
        end_at: number;
      };
    };
  }
}
