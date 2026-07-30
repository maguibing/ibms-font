export type WorkorderMode = 'repair' | 'deal';

export function buildWorkorderListRequest(
  params: Api.Workorder.WorkorderSearchParams,
  mode: WorkorderMode,
  fixedDeviceId?: CommonType.IdType | null
): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs = [
    { type: 104, value: '101' },
    { type: 51, value: mode === 'repair' ? '1' : '2' },
    { type: 4, value: mode === 'repair' ? params.repairman_uid : null },
    { type: 5, value: mode === 'deal' ? params.dealer_uid : null },
    { type: 7, value: params.deal_status },
    { type: 8, value: fixedDeviceId },
    {
      type: 103,
      value: params.dateRange?.length === 2 ? `${params.dateRange[0]},${params.dateRange[1]}` : null
    }
  ];

  const options = filterConfigs
    .filter(item => item.value !== null && item.value !== undefined && item.value !== '')
    .map(({ type, value }) => ({ type, value: String(value) }));

  return {
    list_option: {
      offset: (pageNum - 1) * pageSize,
      limit: pageSize,
      options
    },
    options: [{ key: 1 }, { key: 2 }, { key: 3 }, { key: 4 }]
  };
}
