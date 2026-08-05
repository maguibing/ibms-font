export type GatewayWithProtocol = Omit<Api.Gateway.Gateway, 'protocol'> & {
  protocol?: Record<string, any>;
};

export type RemoteSelectRecord = Record<string, any>;

export type ScanFormModel = {
  bacnet: {
    interface_name: string;
    timeout: number | null;
  };
  gateway_id: CommonType.IdType | null;
  modbus: {
    end_slave_id: number | null;
    register_type: number | null;
    start_slave_id: number | null;
  };
  modbus_point: {
    count: number | null;
    start_register_address: number | null;
  };
  opcua: {
    max_depth: number | null;
    max_devices: number | null;
  };
  opcua_point: {
    max_depth: number | null;
    max_points_per_node: number | null;
  };
};

export type ScannedPhysicalPoint = {
  accessLevel: number;
  desc: string;
  key: string;
  modbusRegisterAddress: string;
  modbusRegisterType: number;
  modbusSlaveId: string;
  name: string;
  objectInstance: string;
  objectType: number;
  opcUaDataType: number;
  opcUaNodeId: string;
  pointKey: string;
  value: string;
};

export type ScannedDevice = Api.Device.ScanPhysicalDeviceItem & {
  address: string;
  deviceInstance: string | number;
  devicePointList: Api.Device.ScanPhysicalDevicePointGroup[];
  name: string;
  pointList: ScannedPhysicalPoint[];
  pointScanned: boolean;
  protocol: string | number;
  scanKey: string;
};
