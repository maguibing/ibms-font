export type PhysicalPointProtocolModel = {
  access_level: number;
  bacnet: {
    device_instance: number;
    object_instance: number;
    object_type: number;
    property_type_list: number[];
  };
  enable_linear_transform: boolean;
  modbus: {
    address: number;
    bit_index: number;
    byte_order?: number;
    data_type: number;
    register_type: number;
    slave_id: number;
  };
  offset: number;
  opcua: {
    data_type: number;
    node_id: string | null;
  };
  protocol_type: Api.Gateway.ProtocolType | null;
  scale: number;
};
