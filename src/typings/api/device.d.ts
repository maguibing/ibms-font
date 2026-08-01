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
      space_id?: CommonType.IdType;
      key: string;
      name: string;
      desc?: string;
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
      device_group_map?: Record<string, DeviceGroupMapItem>;
    };

    type DeviceList = Api.Common.PaginatingQueryRecord<Device, DeviceListExtra>;

    type DeviceDetailResponse = {
      device: Device;
      device_type_map?: Record<string, DeviceType>;
    };

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

    type UpdateDeviceParams = Pick<
      CreateDeviceParams,
      'desc' | 'device_group_id' | 'device_type_id' | 'space_id' | 'status'
    > & {
      id: CommonType.IdType;
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

    type DeviceTypePointValueItem = Api.System.DeviceTypeTemplatePointValueItem;

    type DeviceTypePointSetting = {
      data_type: CommonType.DataType;
      num_val?: {
        default_value?: number;
        scale?: 1 | 2 | 3 | 4;
        unit?: string;
      };
      switch_val?: {
        cmd_val_data_type?: 1 | 2 | 3;
        false_val?: DeviceTypePointValueItem;
        true_val?: DeviceTypePointValueItem;
      };
      str_val?: {
        default_value?: string;
      };
      enum_val?: {
        cmd_val_data_type?: 1 | 2;
        enum_list?: DeviceTypePointValueItem[];
      };
    };

    type DeviceTypePoint = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      device_type_id: CommonType.IdType;
      name: string;
      key: string;
      data_type: CommonType.DataType;
      energy_type?: number;
      setting: DeviceTypePointSetting;
      desc?: string;
    }>;

    type DeviceTypePointList = Api.Common.PaginatingQueryRecord<DeviceTypePoint>;

    type DeviceTypePointDetailResponse = {
      device_type_point: DeviceTypePoint;
    };

    type DeviceTypePointOperateParams = CommonType.RecordNullable<
      Pick<DeviceTypePoint, 'id' | 'device_type_id' | 'name' | 'key' | 'energy_type' | 'data_type' | 'setting' | 'desc'>
    >;

    type DeviceTypePointSearchParams = CommonType.RecordNullable<
      Pick<DeviceTypePoint, 'name' | 'key'> & Api.Common.CommonSearchParams
    >;

    type DeviceGroup = {
      group_id: CommonType.IdType;
      group_name: string;
      parent_id?: CommonType.IdType;
      desc?: string;
      children?: DeviceGroup[];
    };

    type DeviceGroupMapItem = CommonType.IdNameRecord & {
      group_id?: CommonType.IdType;
      group_name?: string;
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
      data_type?: CommonType.DataType;
      physical_point_id?: CommonType.IdType;
      source_type: number;
    }>;

    type DevicePointBinding = {
      logic_point_id: CommonType.IdType;
      physical_point_id: CommonType.IdType;
    };

    type BindDevicePointParams = {
      op_type: 1 | 2 | 3;
      bind_list?: DevicePointBinding[];
      unbind_list?: DevicePointBinding[];
    };

    type LogicPointListExtra = {
      device_type_map?: Record<string, DeviceType>;
      device_map?: Record<string, Pick<Device, 'id' | 'name' | 'key'>>;
      physical_point_map?: Record<string, Pick<PhysicalPoint, 'id' | 'name' | 'key'>>;
      device_type_point_map?: Record<string, Pick<DeviceTypePoint, 'id' | 'data_type' | 'setting'>>;
      current_value_map?: Record<string, PhysicalPointCurrentValue>;
    };

    type LogicPointList = Api.Common.PaginatingQueryRecord<LogicPoint, LogicPointListExtra>;

    type LogicPointDetailParams = CommonType.CommonRequestOptions & {
      id: CommonType.IdType;
    };

    type LogicPointDetailResponse = {
      logic_point: LogicPoint;
      device_type_point_map?: LogicPointListExtra['device_type_point_map'];
    };

    type DevicePointCommandValue = {
      data_type: CommonType.DataType;
      num_val?: {
        value: number;
        scale?: number;
        unit?: string;
      };
      switch_val?: DeviceTypePointValueItem;
      str_val?: {
        value: string;
      };
      enum_val?: DeviceTypePointValueItem;
    };

    type DevicePointCommand = {
      logic_point_key: string;
      physical_point_key: string;
      point_val: DevicePointCommandValue;
    };

    type DevicePointCmdParams = {
      cmd_list: DevicePointCommand[];
    };

    type DevicePointHistoryParams = {
      agg_type?: number;
      logic_point_key_list?: string[];
      physical_point_key_list?: string[];
      stat_type: number;
      time_range: {
        start_at: number;
        end_at: number;
      };
    };

    type DevicePointHistoryValue = {
      ts?: number;
      logic_point?: PointOption;
      num_val?: {
        value?: number | string;
        scale?: number;
        unit?: string;
      };
      switch_val?: {
        value?: string | number | boolean;
        alias?: string;
        unit?: string;
      };
      str_val?: {
        value?: string;
        unit?: string;
      };
      enum_val?: {
        value?: string | number;
        alias?: string;
        unit?: string;
      };
    };

    type DevicePointHistoryStatData = {
      device_point_stat?: {
        point_vals?: DevicePointHistoryValue[];
      };
    };

    type DevicePointHistoryTrend = {
      logic_point?: PointOption;
      physical_point?: PointOption;
      data_type?: CommonType.DataType | number;
      point_trends?: DevicePointHistoryValue[];
    };

    type DevicePointHistoryTrendData = {
      stat_type?: number;
      time_range?: {
        start_at?: number;
        end_at?: number;
      };
      trend_list?: DevicePointHistoryTrend[];
    };

    type LogicPointSearchParams = CommonType.RecordNullable<
      Pick<LogicPoint, 'name' | 'key'> & Api.Common.CommonSearchParams
    >;

    type LogicPointTreeNode = {
      id: CommonType.IdType;
      name: string;
      key: string;
      type: number;
      data_type?: CommonType.DataType;
      setting?: DeviceTypePointSetting;
      children?: LogicPointTreeNode[];
    };

    type LogicPointTreeResponse = {
      trees: LogicPointTreeNode[];
    };

    type PhysicalPointProtocol = {
      protocol_type?: Api.Gateway.ProtocolType;
      scale?: number;
      access_level?: number;
      [key: string]: unknown;
    };

    type PhysicalPointModbusParams = {
      address: number;
      bit_index: number;
      byte_order?: number;
      data_type: number;
      register_type: number;
      slave_id: number;
    };

    type PhysicalPointBacnetParams = {
      device_instance: number;
      object_instance: number;
      object_type: number;
      property_type_list: number[];
    };

    type PhysicalPointOpcUaParams = {
      data_type: number;
      node_id?: string | null;
    };

    type PhysicalPointOperateProtocol = {
      access_level: number;
      bacnet?: PhysicalPointBacnetParams;
      modbus?: PhysicalPointModbusParams;
      offset: number;
      opcua?: PhysicalPointOpcUaParams;
      protocol_type: Api.Gateway.ProtocolType;
      scale: number;
    };

    type PhysicalPointOperateItem = {
      data_type: CommonType.DataType;
      is_storage: boolean;
      key: string;
      logic_point_id?: CommonType.IdType | null;
      name: string;
      protocol: PhysicalPointOperateProtocol;
    };

    type CreatePhysicalPointParams = {
      gateway_id: CommonType.IdType;
      physical_point_list: PhysicalPointOperateItem[];
    };

    type PhysicalPoint = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      gateway_id: CommonType.IdType;
      logic_point_id?: CommonType.IdType;
      key: string;
      name: string;
      is_storage: boolean;
      data_type: CommonType.DataType;
      taos_table_name?: string;
      protocol_type?: Api.Gateway.ProtocolType;
      source_type: number;
      is_hidden?: boolean;
      protocol?: PhysicalPointProtocol;
    }>;

    type PhysicalPointDetailParams = {
      id: CommonType.IdType;
    };

    type PhysicalPointDetailResponse = {
      physical_point: PhysicalPoint;
    };

    type PhysicalPointCurrentValue = {
      ts?: number;
      logic_point?: PointOption;
      device_type?: PointOption;
      device?: PointOption;
      device_type_point?: PointOption;
      physical_point?: PointOption;
      data_type?: CommonType.DataType | number;
      num_val?: {
        value?: number;
        unit?: string;
        scale?: number;
        [key: string]: unknown;
      };
      switch_val?: {
        value?: string | number | boolean;
        alias?: string;
        [key: string]: unknown;
      };
      str_val?: {
        value?: string;
        [key: string]: unknown;
      };
      enum_val?: {
        value?: string | number;
        alias?: string;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };

    type PhysicalPointListExtra = {
      gateway_map?: Record<string, Pick<Api.Gateway.Gateway, 'id' | 'name'>>;
      logic_point_map?: Record<string, PointOption>;
      current_value_map?: Record<string, PhysicalPointCurrentValue>;
    };

    type PhysicalPointList = Api.Common.PaginatingQueryRecord<PhysicalPoint, PhysicalPointListExtra>;

    type PhysicalPointSearchParams = CommonType.RecordNullable<
      Api.Common.CommonSearchParams & {
        gateway_id: CommonType.IdType;
        name: string;
        key: string;
        data_type: CommonType.DataType;
      }
    >;

    type VirtualPointDurationSetting = {
      durations: number;
      time_type: Api.Task.TaskConditionTimeType;
    };

    type VirtualPointThresholdAssignRule = {
      repeat_times?: number;
      duration?: VirtualPointDurationSetting;
      assign_value: Api.Task.TaskConditionSingleValue;
    };

    type VirtualPointThresholdAssignSetting = {
      accumulate_type: 1 | 2 | 3;
      immediate_assign?: {
        assign_value: Api.Task.TaskConditionSingleValue;
      };
      count_accumulate?: {
        window: VirtualPointDurationSetting;
        assign_rules: VirtualPointThresholdAssignRule[];
      };
      duration_accumulate?: {
        window: VirtualPointDurationSetting;
        assign_rules: VirtualPointThresholdAssignRule[];
      };
      conds: Api.Task.TaskCondition[];
    };

    type VirtualPointSegmentMappingRule = {
      min_val: number;
      max_val: number;
      bound_type: 1 | 2 | 3 | 4;
      output_value: Api.Task.TaskConditionSingleValue;
      remark: string;
    };

    type VirtualPointSegmentMappingSetting = {
      match_source_type?: 1 | 2;
      source_logic_point_id?: CommonType.IdType;
      match_expression: string;
      has_default_value: boolean;
      default_value?: Api.Task.TaskConditionSingleValue;
      default_bound_type: 1 | 2 | 3 | 4;
      rules: VirtualPointSegmentMappingRule[];
    };

    type VirtualPointStatisticalSetting = {
      conds: Api.Task.TaskCondition[];
      accumulate_value: number;
    };

    type VirtualPointSetting = {
      valid_time_ranges?: Array<{ start_at: number; end_at: number }>;
      point?: DeviceTypePointSetting;
      formula?: { expression?: string };
      threshold_assign?: VirtualPointThresholdAssignSetting;
      segment_mapping?: VirtualPointSegmentMappingSetting;
      statistical?: VirtualPointStatisticalSetting;
      [key: string]: unknown;
    };

    type VirtualPoint = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      logic_point_id?: CommonType.IdType;
      physical_point_id?: CommonType.IdType;
      belong_device_id?: CommonType.IdType;
      device_id?: CommonType.IdType;
      compute_mode?: number;
      status?: number;
      setting?: VirtualPointSetting;
    }>;

    type VirtualPointListExtra = {
      logic_point_map?: Record<string, Pick<LogicPoint, 'id' | 'name' | 'key' | 'device_id'>>;
      physical_point_map?: Record<string, Pick<PhysicalPoint, 'id' | 'name' | 'key' | 'is_storage'>>;
    };

    type VirtualPointList = Api.Common.PaginatingQueryRecord<VirtualPoint, VirtualPointListExtra>;

    type VirtualPointDetailResponse = VirtualPointListExtra & {
      virtual_point: VirtualPoint;
      device_map?: Record<string, Pick<Device, 'id' | 'name' | 'key'>>;
      device_type_map?: CommonType.IdNameMap;
      device_type_point_map?: Record<string, Api.Task.TaskDeviceTypePointMapItem>;
    };

    type VirtualPointOperateParams = {
      id?: CommonType.IdType;
      name: string;
      key: string;
      belong_device_id: CommonType.IdType;
      compute_mode: number;
      status: number;
      is_storage: boolean;
      setting: VirtualPointSetting;
    };

    type ValidateVirtualPointFormulaParams = {
      expression: string;
    };

    type ValidateVirtualPointFormulaResponse = {
      is_valid?: boolean;
      result?: number | string;
      err_msg?: string;
      msg?: string;
      detail?: string;
    };
  }
}
