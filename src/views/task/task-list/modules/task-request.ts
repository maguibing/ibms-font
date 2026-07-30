export function buildTaskListRequest(
  params: Api.Task.TaskSearchParams,
  fixedDeviceId?: CommonType.IdType | null
): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs = [
    { type: 104, value: '101' },
    { type: 1, value: params.name },
    { type: 51, value: fixedDeviceId ? '1' : null },
    { type: 52, value: fixedDeviceId }
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
    options: [{ key: 1 }]
  };
}
