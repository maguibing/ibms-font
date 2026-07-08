declare namespace Api {
  namespace Gateway {
    type ProtocolType = 1 | 2 | 3 | 4 | 5 | 6;
    type GatewayStatus = 1 | 2;

    type Gateway = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      name: string;
      key: string;
      status: GatewayStatus;
      link_status: number;
      protocol_type: ProtocolType;
    }>;

    type GatewayList = Api.Common.PaginatingQueryRecord<Gateway>;

    type GatewaySearchParams = CommonType.RecordNullable<
      Pick<Gateway, 'name' | 'protocol_type'> & Api.Common.CommonSearchParams
    >;
  }
}
