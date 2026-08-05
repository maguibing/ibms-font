import { request } from '@/service/request';
import type { ExportBizType, ExportFileType, PhysicalPointType } from '@/enum/business';

export type ExportTaskParams = {
  connection_id: string;
  export_biz_type: ExportBizType;
  file_type: ExportFileType;
  list_option: CommonType.CommonListOptions;
  physical_point: {
    scan?: {
      device_points: Api.Device.ScanPhysicalDevicePointGroup[];
      gateway_id: number;
    };
    source: PhysicalPointType;
  };
};

/** 获取 OSS 基本域名 */
export function fetchGetOssDomain() {
  return request<Api.Common.OssDomainResponse>({
    url: '/GetOssDomain',
    method: 'post'
  });
}

/** 创建导出任务 */
export function fetchExportTask(data: ExportTaskParams) {
  return request({
    url: '/ExportTask',
    method: 'post',
    data
  });
}
