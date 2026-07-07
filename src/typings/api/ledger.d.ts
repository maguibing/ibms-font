declare namespace Api {
  namespace Ledger {
    type AssetsStatus = 1 | 2 | 3;

    type AssetsAttribution = {
      dept_id?: CommonType.IdType | null;
      location?: string;
      owner?: string;
    };

    type AssetsProcurement = {
      expire_at?: number | null;
      expire_notice_days?: number | null;
      purchase_at?: number | null;
      purchase_price?: number | null;
      supplier?: string;
    };

    type AssetsDetail = {
      device_id_list?: CommonType.IdType[];
      attribution?: AssetsAttribution;
      procurement?: AssetsProcurement;
    };

    type Assets = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      name: string;
      sn: string;
      assets_type_id: CommonType.IdType;
      status: AssetsStatus;
      desc?: string;
      device_id_list?: CommonType.IdType[];
      detail?: AssetsDetail;
    }>;

    type AssetsMapItem = CommonType.IdNameRecord;

    type AssetsListExtra = {
      assets_type_map: Record<string, AssetsMapItem>;
      dept_map: Record<string, AssetsMapItem>;
    };

    type AssetsList = Api.Common.PaginatingQueryRecord<Assets, AssetsListExtra>;

    type AssetsDetailData = AssetsListExtra & {
      assets: Assets;
      device_map?: Record<string, AssetsMapItem>;
    };

    type AssetsOperateParams = {
      id?: CommonType.IdType | null;
      assets_type_id: CommonType.IdType | null;
      attribution: AssetsAttribution;
      desc: string;
      device_id_list: CommonType.IdType[];
      name: string;
      procurement: AssetsProcurement;
      sn: string;
      status: AssetsStatus | null;
    };

    type AssetsSearchParams = CommonType.RecordNullable<
      Pick<Assets, 'sn' | 'name' | 'status'> & { dateRange?: [number, number] } & Api.Common.CommonSearchParams
    >;

    type AssetsTypeStatus = 1 | 2;

    type AssetsType = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      name: string;
      status: AssetsTypeStatus;
      desc?: string;
    }>;

    type AssetsTypeList = Api.Common.PaginatingQueryRecord<AssetsType>;

    type AssetsTypeOperateParams = CommonType.RecordNullable<Pick<AssetsType, 'id' | 'name' | 'status' | 'desc'>>;

    type AssetsTypeSearchParams = CommonType.RecordNullable<
      Pick<AssetsType, 'name' | 'status'> & Api.Common.CommonSearchParams
    >;
  }
}
