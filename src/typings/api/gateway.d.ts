declare namespace Api {
  namespace Gateway {
    type ProtocolType = 1 | 2 | 3 | 4 | 5 | 6;
    type GatewayStatus = 1 | 2;
    type DataFormat = 1 | 2 | 3 | 4;

    type Gateway = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      name: string;
      key: string;
      status: GatewayStatus;
      link_status: number;
      protocol_type: ProtocolType;
    }>;

    type GatewayList = Api.Common.PaginatingQueryRecord<Gateway>;

    type GatewayMqttProtocol = {
      domain: string;
      port: number;
    };

    type GatewayHttpServerProtocol = {
      addr: string;
      path: string;
    };

    type TokenPlacement = 1 | 2 | 3 | 4 | 5;

    type GatewayHttpClientRoute = {
      method: string;
      path: string;
      token_key: string;
      token_placement: TokenPlacement;
      with_auth: boolean;
    };

    type GatewayHttpClientToken = {
      body: Record<string, string>;
      expire_field: string;
      expire_seconds: number;
      headers: Record<string, string>;
      is_enable: boolean;
      method: string;
      path: string;
      token_field: string;
    };

    type GatewayHttpClientProtocol = {
      poll_interval: number;
      poll_route: GatewayHttpClientRoute;
      send_route: GatewayHttpClientRoute;
      server: string;
      timeout: number;
      token: GatewayHttpClientToken;
    };

    type GatewayHttpClientKeyValueRow = {
      key: string;
      value: string;
    };

    type GatewayHttpClientRouteModel = {
      method: string;
      path: string;
      token_key: string;
      token_placement: TokenPlacement;
      with_auth: boolean;
    };

    type GatewayHttpClientModel = {
      poll_interval: number | null;
      poll_route: GatewayHttpClientRouteModel;
      send_route: GatewayHttpClientRouteModel;
      server: string;
      timeout: number | null;
      token: {
        body: GatewayHttpClientKeyValueRow[];
        expire_field: string;
        expire_seconds: number | null;
        headers: GatewayHttpClientKeyValueRow[];
        is_enable: boolean;
        method: string;
        path: string;
        token_field: string;
      };
    };

    type GatewayModbusProtocol = {
      mode: 1;
      poll_interval: number;
      tcp: {
        host: string;
        port: number;
      };
      timeout: number;
    };

    type GatewayBacnetProtocol = {
      ip: {
        interface_name: string;
        local_port: number;
      };
      is_support_cov: boolean;
      network_type: 1;
      poll_interval: number;
      timeout: number;
    };

    type OpcUaSecurityMode = 1 | 2 | 3;
    type OpcUaAuthType = 1 | 2;

    type GatewayOpcUaProtocol = {
      authentication: {
        auth_type: OpcUaAuthType;
        user_auth: {
          password: string;
          username: string;
        };
      };
      endpoint_url: string;
      is_auto_discovery: boolean;
      is_subscription: boolean;
      poll_interval: number;
      request_timeout: number;
      security_policy: {
        mode: OpcUaSecurityMode;
        policy_uri: string;
      };
      session_timeout: number;
      timeout: number;
    };

    type GatewayCreateProtocol = {
      bacnet?: GatewayBacnetProtocol;
      data_format?: DataFormat;
      http_client?: GatewayHttpClientProtocol;
      http_server?: GatewayHttpServerProtocol;
      modbus?: GatewayModbusProtocol;
      mqtt?: GatewayMqttProtocol;
      opcua?: GatewayOpcUaProtocol;
      protocol_type: ProtocolType;
    };

    type GatewayCreateParams = {
      desc: string;
      key: string;
      name: string;
      p_key: string;
      password: string;
      protocol: GatewayCreateProtocol;
      protocol_type: ProtocolType;
      space_id: CommonType.IdType;
      status: GatewayStatus;
      username: string;
    };

    type GatewayOperateDrawerModel = {
      bacnet: {
        ip: {
          interface_name: string;
          local_port: number | null;
        };
        poll_interval: number | null;
        timeout: number | null;
      };
      data_format: DataFormat;
      desc: string;
      http_client: GatewayHttpClientModel;
      key: string;
      modbus: {
        poll_interval: number | null;
        tcp: {
          host: string;
          port: number | null;
        };
        timeout: number | null;
      };
      name: string;
      opcua: {
        authentication: {
          auth_type: OpcUaAuthType;
          user_auth: {
            password: string;
            username: string;
          };
        };
        endpoint_url: string;
        is_auto_discovery: boolean;
        is_subscription: boolean;
        poll_interval: number | null;
        request_timeout: number | null;
        security_policy: {
          mode: OpcUaSecurityMode;
          policy_uri: string;
        };
        session_timeout: number | null;
        timeout: number | null;
      };
      p_key: string;
      password: string;
      protocol_type: ProtocolType;
      space_id: CommonType.IdType | null;
      status: GatewayStatus;
      username: string;
    };

    type GatewaySearchParams = CommonType.RecordNullable<
      Pick<Gateway, 'name' | 'protocol_type'> & Api.Common.CommonSearchParams
    >;

    type IothubNetworkInterface = {
      broadcast_addr: string;
      cidr: string;
      local_addr: string;
      mac: string;
      name: string;
    };

    type IothubNetworkInterfaceResponse = {
      interfaces: IothubNetworkInterface[];
      os: string;
    };
  }
}
