declare namespace Api {
  namespace Workorder {
    type WorkorderDealStatus = 1 | 2 | 3 | 4;

    type WorkorderOperateType = 'add_workorder' | 'allocation_workorder' | 'deal_workorder' | 'watch_workorder';

    type WorkorderPointDetail = {
      logic_point_id_list?: CommonType.IdType[];
    };

    type WorkorderRepairDetail = {
      img_list?: string[];
      desc?: string;
    };

    type WorkorderDealDetail = {
      img_list?: string[];
      desc?: string;
    };

    type Workorder = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      order_no: string;
      space_id?: CommonType.IdType;
      device_id: CommonType.IdType;
      point_detail?: WorkorderPointDetail;
      repairman_uid: CommonType.IdType;
      repairman_phone?: string;
      dealer_uid?: CommonType.IdType;
      dealer_phone?: string;
      deal_status: WorkorderDealStatus;
      repair_detail?: WorkorderRepairDetail;
      deal_detail?: WorkorderDealDetail;
    }>;

    type WorkorderDeviceMapItem = CommonType.IdNameRecord;

    type WorkorderLogicPointMapItem = CommonType.IdNameRecord;

    type WorkorderListExtra = {
      base_user_map: Record<string, Api.System.User>;
      device_map: Record<string, WorkorderDeviceMapItem>;
      logic_point_map: Record<string, WorkorderLogicPointMapItem>;
    };

    type WorkorderList = Api.Common.PaginatingQueryRecord<Workorder, WorkorderListExtra>;

    type WorkorderDetailResponse = WorkorderListExtra & {
      workorder: Workorder;
    };

    type WorkorderStat = {
      deal_status_map: Partial<Record<WorkorderDealStatus, number>>;
    };

    type GetWorkorderParams = {
      id: CommonType.IdType;
      options?: CommonType.CommonKeysOptions[];
    };

    type CreateWorkorderParams = {
      break_desc: string;
      break_img_list: string[];
      device_id: CommonType.IdType;
      logic_point_id_list: CommonType.IdType[];
      space_id: CommonType.IdType;
    };

    type UpdateWorkorderParams = {
      id: CommonType.IdType;
      dealer_uid?: CommonType.IdType;
      deal_status?: WorkorderDealStatus;
      deal_desc?: string;
      deal_img_list?: string[];
      logic_point_id_list?: CommonType.IdType[];
    };

    type WorkorderSearchParams = CommonType.RecordNullable<
      Api.Common.CommonSearchParams & {
        repairman_uid: CommonType.IdType;
        dealer_uid: CommonType.IdType;
        deal_status: WorkorderDealStatus;
        dateRange?: [number, number];
      }
    >;
  }
}
