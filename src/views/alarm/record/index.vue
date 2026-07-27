<script setup lang="tsx">
import { computed, onMounted, ref, shallowRef } from 'vue';
import { NDivider, NTag } from 'naive-ui';
import type { TagProps } from 'naive-ui';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { useAppStore } from '@/store/modules/app';
import {
  fetchDeleteAlarmRecord,
  fetchGenerateAlarmRecordWorkorder,
  fetchGetAlarmRecordList,
  fetchGetAlarmRecordStat,
  fetchTransferAlarmRecord
} from '@/service/api/alarm';
import { $t } from '@/locales';
import { formatUnixDateTime } from '@/utils/common-methods';
import ButtonIcon from '@/components/custom/button-icon.vue';
import { alarmLevelMap, createAlarmBaseOptions } from '../shared';
import AlarmRecordSearch from './modules/alarm-record-search.vue';
import AlarmRecordViewDrawer from './modules/alarm-record-view-drawer.vue';

defineOptions({
  name: 'AlarmRecord'
});

const appStore = useAppStore();

const alarmRecordStatuses: Api.Alarm.AlarmRecordDealStatus[] = [1, 2, 3];

const dealStatusMap: Record<
  Api.Alarm.AlarmRecordDealStatus,
  { label: string; type: NonNullable<TagProps['type']>; icon: string; colorClass: string }
> = {
  1: { label: '待处理', type: 'error', icon: 'material-symbols:alarm-outline-rounded', colorClass: 'text-error' },
  2: { label: '已确认', type: 'primary', icon: 'material-symbols:progress-activity', colorClass: 'text-primary' },
  3: { label: '已解除', type: 'success', icon: 'material-symbols:check-circle-outline', colorClass: 'text-success' }
};

const alarmRecordStat = ref<Partial<Record<Api.Alarm.AlarmRecordDealStatus, number>>>({});
const searchParams = ref<Api.Alarm.AlarmRecordSearchParams>(createDefaultSearchParams());
const detailDrawerVisible = shallowRef(false);
const detailRowData = shallowRef<Api.Alarm.AlarmRecord | null>(null);

const statusCards = computed(() =>
  alarmRecordStatuses.map(status => ({
    status,
    ...dealStatusMap[status],
    count: alarmRecordStat.value[status] ?? 0
  }))
);

function createDefaultSearchParams(): Api.Alarm.AlarmRecordSearchParams {
  return {
    pageNum: 1,
    pageSize: 10,
    alarm_rule_id: null,
    alarm_level: null,
    dateRange: null
  };
}

function transformSearchParamsToRequest(params: Api.Alarm.AlarmRecordSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs = [
    ...createAlarmBaseOptions(),
    { type: 2, value: params.alarm_rule_id },
    { type: 51, value: params.alarm_level },
    {
      type: 103,
      value:
        params.dateRange?.length === 2
          ? `${params.dateRange[0]},${params.dateRange[1]}`
          : null
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

const { columns, data, extraData, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetAlarmRecordList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Alarm.AlarmRecord>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page;
      searchParams.value.pageSize = params.pageSize;
    },
    columns: (): NaiveUI.TableColumn<Api.Alarm.AlarmRecord>[] => [
      {
        type: 'selection',
        align: 'center',
        width: 48
      },
      {
        key: 'index',
        title: $t('common.index'),
        align: 'center',
        width: 64,
        render: (_, index) => index + 1
      },
      {
        key: 'alarm_level',
        title: '报警等级',
        align: 'center',
        minWidth: 110,
        render: row => renderAlarmLevel(row.alarm_rule_id)
      },
      {
        key: 'alarm_rule_id',
        title: '报警规则',
        align: 'center',
        minWidth: 180,
        ellipsis: { tooltip: true },
        render: row => getAlarmRuleName(row.alarm_rule_id)
      },
      {
        key: 'device_id',
        title: '报警设备',
        align: 'center',
        minWidth: 160,
        ellipsis: { tooltip: true },
        render: row => getDeviceName(row.device_id)
      },
      {
        key: 'content',
        title: '报警内容',
        align: 'left',
        minWidth: 320,
        ellipsis: { tooltip: true },
        render: row => getAlarmContentText(row)
      },
      {
        key: 'alarm_at',
        title: '报警时间',
        align: 'center',
        minWidth: 180,
        render: row => formatUnixDateTime(row.alarm_at)
      },
      {
        key: 'status',
        title: '状态',
        align: 'center',
        minWidth: 110,
        render: row => renderDealStatus(row.status)
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 220,
        fixed: 'right',
        render: row => {
          const buttons = [];

          if (canShowConfirm(row)) {
            buttons.push(
              <ButtonIcon
                text
                type="primary"
                icon="material-symbols:check-circle-outline"
                tooltipContent="确认处理"
                popconfirmContent="确认处理该报警记录吗？"
                onPositiveClick={() => handleTransfer(row, 2)}
              />
            );
          }

          if (canShowRecover(row)) {
            buttons.push(
              <ButtonIcon
                text
                type="success"
                icon="material-symbols:alarm-off-outline-rounded"
                tooltipContent="解除"
                popconfirmContent="确认解除该报警记录吗？"
                onPositiveClick={() => handleTransfer(row, 3)}
              />
            );
          }

          if (canShowGenerateWorkorder(row)) {
            buttons.push(
              <ButtonIcon
                text
                type="primary"
                icon="material-symbols:assignment-add-outline"
                tooltipContent="生成工单"
                popconfirmContent="确认生成工单吗？"
                onPositiveClick={() => handleGenerateWorkorder(row)}
              />
            );
          }

          if (canShowDelete(row)) {
            buttons.push(
              <ButtonIcon
                text
                type="error"
                icon="material-symbols:delete-outline"
                tooltipContent={$t('common.delete')}
                popconfirmContent={$t('common.confirmDelete')}
                onPositiveClick={() => handleDelete(row.id)}
              />
            );
          }

          buttons.push(
            <ButtonIcon
              text
              type="success"
              icon="material-symbols:visibility-outline"
              tooltipContent="详情"
              onClick={() => handleView(row)}
            />
          );

          return (
            <div class="flex-center gap-8px">
              {buttons.map((btn, index) => (
                <>
                  {index !== 0 && <NDivider vertical />}
                  {btn}
                </>
              ))}
            </div>
          );
        }
      }
    ]
  });

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);

const alarmRecordExtra = computed<Api.Alarm.AlarmRecordListExtra>(() => {
  const raw = extraData.value as Partial<Api.Alarm.AlarmRecordListExtra> | null;

  return {
    device_map: raw?.device_map ?? {},
    logic_point_map: raw?.logic_point_map ?? {},
    alarm_rule_map: raw?.alarm_rule_map ?? {},
    base_user_map: raw?.base_user_map ?? {}
  };
});

function getAlarmRuleName(alarmRuleId: CommonType.IdType) {
  return alarmRecordExtra.value.alarm_rule_map[String(alarmRuleId)]?.name ?? '-';
}

function getDeviceName(deviceId: CommonType.IdType) {
  return alarmRecordExtra.value.device_map[String(deviceId)]?.name ?? '-';
}

function getAlarmPointList(row: Api.Alarm.AlarmRecord) {
  return row.detail?.alarm_point_list ?? [];
}

function getAlarmContentText(row: Api.Alarm.AlarmRecord) {
  const content = getAlarmPointList(row)
    .map(item => item.content)
    .filter(Boolean)
    .join('；');

  return content || '-';
}

function renderAlarmLevel(alarmRuleId: CommonType.IdType) {
  const level = alarmRecordExtra.value.alarm_rule_map[String(alarmRuleId)]?.alarm_level;
  if (!level) return '-';

  const config = alarmLevelMap[level];

  return config ? <NTag type={config.type}>{config.label}</NTag> : '-';
}

function renderDealStatus(status: Api.Alarm.AlarmRecordDealStatus) {
  const config = dealStatusMap[status];

  return config ? <NTag type={config.type}>{config.label}</NTag> : '-';
}

function handleSearch() {
  checkedRowKeys.value = [];
  getDataByPage(1);
}

function handleView(row: Api.Alarm.AlarmRecord) {
  detailRowData.value = row;
  detailDrawerVisible.value = true;
}

function canShowConfirm(row: Api.Alarm.AlarmRecord) {
  return Number(row.status) === 1;
}

function canShowRecover(row: Api.Alarm.AlarmRecord) {
  return Number(row.status) === 2;
}

function canShowGenerateWorkorder(row: Api.Alarm.AlarmRecord) {
  return Number(row.status) !== 3 && !row.detail?.workorder?.is_workorder_generated;
}

function canShowDelete(row: Api.Alarm.AlarmRecord) {
  return Number(row.status) === 3;
}

async function handleRefresh() {
  await Promise.all([getData(), fetchAlarmRecordStat()]);
}

async function handleTransfer(row: Api.Alarm.AlarmRecord, transferStatus: Api.Alarm.AlarmRecordTransferStatus) {
  const actionText = transferStatus === 2 ? '确认处理' : '解除';
  const { error } = await fetchTransferAlarmRecord({
    transfer_status: transferStatus,
    id_list: [row.id]
  });

  if (error) return;

  window.$message?.success(`${actionText}成功`);
  checkedRowKeys.value = checkedRowKeys.value.filter(item => item !== row.id);
  await handleRefresh();
}

async function handleGenerateWorkorder(row: Api.Alarm.AlarmRecord) {
  const { error } = await fetchGenerateAlarmRecordWorkorder({
    alarm_record_id: row.id,
    device_id: row.device_id,
    point_id: row.point_id,
    project_id: row.project_id
  });

  if (error) return;

  window.$message?.success('生成工单成功');
  checkedRowKeys.value = checkedRowKeys.value.filter(item => item !== row.id);
  await handleRefresh();
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteAlarmRecord({ id_list: [id] });
  if (error) return;

  checkedRowKeys.value = checkedRowKeys.value.filter(item => item !== id);
  await onDeleted();
  await fetchAlarmRecordStat();
}

async function handleBatchTransfer(transferStatus: Api.Alarm.AlarmRecordTransferStatus) {
  if (checkedRowKeys.value.length === 0) return;

  const actionText = transferStatus === 2 ? '批量确认' : '批量解除';
  const { error } = await fetchTransferAlarmRecord({
    transfer_status: transferStatus,
    id_list: checkedRowKeys.value
  });

  if (error) return;

  window.$message?.success(`${actionText}成功`);
  checkedRowKeys.value = [];
  await handleRefresh();
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return;

  const { error } = await fetchDeleteAlarmRecord({ id_list: checkedRowKeys.value });
  if (error) return;

  await onBatchDeleted();
  await fetchAlarmRecordStat();
}

async function fetchAlarmRecordStat() {
  const { data: response, error } = await fetchGetAlarmRecordStat();
  if (error) return;

  alarmRecordStat.value = response?.deal_status_map ?? {};
}

onMounted(fetchAlarmRecordStat);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NGrid cols="1 s:3" responsive="screen" :x-gap="16" :y-gap="16">
      <NGridItem v-for="item in statusCards" :key="item.status">
        <NCard :bordered="false" size="small" class="card-wrapper">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-14px text-gray-500">{{ item.label }}</div>
              <div class="mt-8px text-28px font-600" :class="item.colorClass">{{ item.count }}</div>
            </div>
            <SvgIcon :icon="item.icon" class="text-32px" :class="item.colorClass" />
          </div>
        </NCard>
      </NGridItem>
    </NGrid>

    <AlarmRecordSearch v-model:model="searchParams" @search="handleSearch" />
    <TableRowCheckAlert v-model:checked-row-keys="checkedRowKeys" />

    <NCard title="报警记录" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <NSpace align="center">
          <NPopconfirm @positive-click="() => handleBatchTransfer(2)">
            <template #trigger>
              <NButton size="small" ghost type="primary" :disabled="checkedRowKeys.length === 0">
                <template #icon>
                  <SvgIcon icon="material-symbols:check-circle-outline" class="text-icon" />
                </template>
                批量确认
              </NButton>
            </template>
            确认处理选中的报警记录吗？
          </NPopconfirm>
          <NPopconfirm @positive-click="() => handleBatchTransfer(3)">
            <template #trigger>
              <NButton size="small" ghost type="success" :disabled="checkedRowKeys.length === 0">
                <template #icon>
                  <SvgIcon icon="material-symbols:alarm-off-outline-rounded" class="text-icon" />
                </template>
                批量解除
              </NButton>
            </template>
            确认解除选中的报警记录吗？
          </NPopconfirm>
          <NPopconfirm @positive-click="handleBatchDelete">
            <template #trigger>
              <NButton size="small" ghost type="error" :disabled="checkedRowKeys.length === 0">
                <template #icon>
                  <icon-material-symbols-delete-outline class="text-icon" />
                </template>
                {{ $t('common.batchDelete') }}
              </NButton>
            </template>
            {{ $t('common.confirmDelete') }}
          </NPopconfirm>
        </NSpace>
      </template>
      <DataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        :flex-height="!appStore.isMobile"
        :scroll-x="scrollX"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <AlarmRecordViewDrawer
        v-model:visible="detailDrawerVisible"
        :row-data="detailRowData"
        :extra-data="alarmRecordExtra"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
