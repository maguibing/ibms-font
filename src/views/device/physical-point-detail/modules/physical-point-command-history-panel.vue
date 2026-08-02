<script setup lang="ts">
import { computed, h, ref } from 'vue';
import { NTag } from 'naive-ui';
import { fetchGetDeviceOperationLogList } from '@/service/api/system';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { displayValue, formatUnixDateTime } from '@/utils/common-methods';
import { $t } from '@/locales';

defineOptions({
  name: 'PhysicalPointCommandHistoryPanel'
});

interface Props {
  physicalPoint: Api.Device.PhysicalPoint;
}

const HOUR_SECONDS = 60 * 60;
const SECOND_MILLISECONDS = 1000;

const props = defineProps<Props>();

const searchParams = ref<Api.Common.CommonSearchParams>({
  pageNum: 1,
  pageSize: 10
});
const dateRange = ref<[number, number]>(createRecentHourDateRange());

const dateRangeFormattedValue = computed<[string, string]>(() => [
  String(dateRange.value[0]),
  String(dateRange.value[1])
]);

const { columns, data, extraData, getDataByPage, loading, mobilePagination, scrollX } = useNaivePaginatedTable({
  api: () => fetchGetDeviceOperationLogList(transformSearchParamsToRequest(searchParams.value)),
  transform: response => defaultTransform<Api.System.DeviceOperationLog>(response),
  onPaginationParamsChange: params => {
    searchParams.value.pageNum = params.page ?? 1;
    searchParams.value.pageSize = params.pageSize ?? 10;
  },
  columns: (): NaiveUI.TableColumn<Api.System.DeviceOperationLog>[] => [
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: (_, index) => index + 1
    },
    {
      key: 'created_at',
      title: '下发时间',
      align: 'center',
      minWidth: 180,
      render: row => formatUnixDateTime(row.created_at)
    },
    {
      key: 'command_target',
      title: '下发至',
      align: 'center',
      minWidth: 180,
      ellipsis: { tooltip: true },
      render: row => getCommandTarget(row)
    },
    {
      key: 'is_success',
      title: '下发状态',
      align: 'center',
      minWidth: 100,
      render: row => renderCommandStatus(row)
    },
    {
      key: 'operator_id',
      title: '操作人',
      align: 'center',
      minWidth: 120,
      ellipsis: { tooltip: true },
      render: row => getOperatorName(row.operator_id)
    }
  ]
});

function createRecentHourDateRange(): [number, number] {
  const endAt = Math.floor(Date.now() / SECOND_MILLISECONDS);

  return [endAt - HOUR_SECONDS, endAt];
}

function normalizeDateRange(value: [number, number]) {
  return `${value[0]},${value[1]}`;
}

function transformSearchParamsToRequest(params: Api.Common.CommonSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;

  return {
    list_option: {
      options: [
        { type: 104, value: '101' },
        { type: 1, value: String(props.physicalPoint.id) },
        { type: 103, value: normalizeDateRange(dateRange.value) }
      ],
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    },
    options: [{ key: 1 }]
  };
}

function getCommandTarget(row: Api.System.DeviceOperationLog) {
  return displayValue(
    row.point_val?.physical_point?.name ??
      row.point_val?.physical_point?.key ??
      row.point_val?.device_type_point?.name ??
      row.point_val?.logic_point?.name
  );
}

function getOperatorName(operatorId?: CommonType.IdType) {
  if (operatorId === undefined || operatorId === null || operatorId === '') return '系统';

  const raw = extraData.value as Api.System.OperationLogListExtra | null;

  return raw?.base_user_map?.[String(operatorId)]?.username ?? String(operatorId);
}

function renderCommandStatus(row: Api.System.DeviceOperationLog) {
  if (row.is_success === true) {
    return h(NTag, { type: 'success', bordered: false }, { default: () => '成功' });
  }

  return h(NTag, { type: 'error', bordered: false }, { default: () => '失败' });
}

function handleRefresh() {
  dateRange.value = createRecentHourDateRange();
  getDataByPage(1);
}

function handleDateRangeUpdate(value: [string, string] | null) {
  if (!value) return;

  dateRange.value = [Number(value[0]), Number(value[1])];
  getDataByPage(1);
}
</script>

<template>
  <div class="h-full min-h-0 flex-col-stretch gap-12px">
    <div class="flex shrink-0 flex-wrap items-center gap-8px">
      <span class="shrink-0 text-14px text-[var(--n-text-color-2)]">时间范围</span>
      <NDatePicker
        :formatted-value="dateRangeFormattedValue"
        type="datetimerange"
        value-format="t"
        :clearable="false"
        :default-time="['00:00:00', '23:59:59']"
        class="max-w-full lt-sm:w-full"
        @update:formatted-value="value => handleDateRangeUpdate(value as [string, string] | null)"
      />
      <NButton type="primary" :loading="loading" @click="handleRefresh">
        <template #icon>
          <SvgIcon icon="material-symbols:refresh-rounded" />
        </template>
        刷新
      </NButton>
    </div>

    <DataTable
      :columns="columns"
      :data="data"
      :loading="loading"
      :scroll-x="scrollX"
      :pagination="mobilePagination"
      :row-key="row => row.id"
      flex-height
      max-height="100%"
      remote
      virtual-scroll
      class="h-full min-h-0"
    />
  </div>
</template>

<style scoped></style>
