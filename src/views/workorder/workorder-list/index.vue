<script setup lang="tsx">
import { computed, onMounted, ref } from 'vue';
import { NDivider, NTag } from 'naive-ui';
import type { TagProps } from 'naive-ui';
import { fetchDeleteWorkorder, fetchGetWorkorderList, fetchGetWorkorderStat } from '@/service/api/workorder';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { useAuth } from '@/hooks/business/auth';
import { $t } from '@/locales';
import { formatUnixDateTime } from '@/utils/common-methods';
import ButtonIcon from '@/components/custom/button-icon.vue';
import PhoneReveal from '@/components/business/phone-reveal.vue';
import { buildWorkorderListRequest, type WorkorderMode } from './modules/workorder-request';
import WorkorderOperateDrawer from './modules/workorder-operate-drawer.vue';
import WorkorderSearch from './modules/workorder-search.vue';

defineOptions({
  name: 'WorkorderList'
});

interface Props {
  defaultDevice?: Api.Device.Device | null;
  embedded?: boolean;
  fixedDeviceId?: CommonType.IdType | null;
}

const props = withDefaults(defineProps<Props>(), {
  defaultDevice: null,
  embedded: false,
  fixedDeviceId: null
});

const appStore = useAppStore();
const authStore = useAuthStore();
const { hasAuth } = useAuth();
const workorderMode = ref<WorkorderMode>('repair');
const checkedRowKeys = ref<CommonType.IdType[]>([]);
const workorderStat = ref<Partial<Record<Api.Workorder.WorkorderDealStatus, number>>>({});
const operateDrawerVisible = ref(false);
const operateType = ref<Api.Workorder.WorkorderOperateType>('add_workorder');
const operateRowData = ref<Api.Workorder.Workorder | null>(null);

const workorderModeOptions = [
  { label: '报修工单', value: 'repair' },
  { label: '处理工单', value: 'deal' }
];
const workorderStatuses: Api.Workorder.WorkorderDealStatus[] = [1, 2, 3, 4];
const currentUserId = computed(() => authStore.userInfo.user?.user_id ?? null);
const fixedDeviceId = computed(() => props.defaultDevice?.id ?? props.fixedDeviceId ?? null);

const statusMap: Record<
  Api.Workorder.WorkorderDealStatus,
  { label: string; type: NonNullable<TagProps['type']>; icon: string; colorClass: string }
> = {
  1: { label: '待处理', type: 'error', icon: 'material-symbols:alarm-outline-rounded', colorClass: 'text-error' },
  2: { label: '处理中', type: 'warning', icon: 'material-symbols:progress-activity', colorClass: 'text-warning' },
  3: { label: '已完成', type: 'success', icon: 'material-symbols:check-circle-outline', colorClass: 'text-success' },
  4: { label: '已取消', type: 'default', icon: 'material-symbols:cancel-outline', colorClass: 'text-gray' }
};

const statusCards = computed(() =>
  workorderStatuses.map(status => ({
    status,
    ...statusMap[status],
    count: workorderStat.value[status] ?? 0
  }))
);
const containerClass = computed(() => [
  props.embedded
    ? 'h-full min-h-0 flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto'
    : 'min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto'
]);

const searchParams = ref<Api.Workorder.WorkorderSearchParams>({
  pageNum: 1,
  pageSize: 10,
  repairman_uid: null,
  dealer_uid: null,
  deal_status: null,
  dateRange: null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX, extraData } =
  useNaivePaginatedTable({
    api: () => fetchGetWorkorderList(buildWorkorderListRequest(searchParams.value, workorderMode.value, fixedDeviceId.value)),
    transform: response => defaultTransform<Api.Workorder.Workorder>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page;
      searchParams.value.pageSize = params.pageSize;
    },
    columns: (): NaiveUI.TableColumn<Api.Workorder.Workorder>[] => [
      { type: 'selection', align: 'center', width: 48 },
      {
        key: 'order_no',
        title: '工单编号',
        align: 'center',
        minWidth: 180,
        ellipsis: { tooltip: true }
      },
      {
        key: 'device_id',
        title: '故障设备',
        align: 'center',
        minWidth: 180,
        ellipsis: { tooltip: true },
        render: row => getDeviceName(row.device_id)
      },
      {
        key: 'repairman_uid',
        title: '报修人',
        align: 'center',
        minWidth: 130,
        render: row => getUserName(row.repairman_uid, '系统自动生成')
      },
      {
        key: 'repairman_phone',
        title: '报修人电话',
        align: 'center',
        minWidth: 180,
        render: row => renderPhone(row.repairman_uid, row.repairman_phone)
      },
      {
        key: 'dealer_uid',
        title: '处理人',
        align: 'center',
        minWidth: 130,
        render: row => getUserName(row.dealer_uid)
      },
      {
        key: 'dealer_phone',
        title: '处理人电话',
        align: 'center',
        minWidth: 180,
        render: row => renderPhone(row.dealer_uid, row.dealer_phone)
      },
      {
        key: 'created_at',
        title: '创建时间',
        align: 'center',
        minWidth: 180,
        render: row => formatUnixDateTime(row.created_at)
      },
      {
        key: 'deal_status',
        title: '状态',
        align: 'center',
        minWidth: 110,
        render: row => renderStatus(row.deal_status)
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 220,
        fixed: 'right',
        render: row => {
          const buttons = [];

          if (canShowAssign(row)) {
            buttons.push(
              <ButtonIcon
                text
                type="primary"
                icon="material-symbols:assignment-ind-outline"
                tooltipContent="分配"
                onClick={() => showWorkorderOperateDrawer('allocation_workorder', row)}
              />
            );
          }

          if (canShowDeal(row)) {
            buttons.push(
              <ButtonIcon
                text
                type="warning"
                icon="material-symbols:edit-outline"
                tooltipContent="处理"
                onClick={() => showWorkorderOperateDrawer('deal_workorder', row)}
              />
            );
          }

          if (canShowWatch(row)) {
            buttons.push(
              <ButtonIcon
                text
                type="success"
                icon="material-symbols:visibility-outline"
                tooltipContent="详情"
                onClick={() => showWorkorderOperateDrawer('watch_workorder', row)}
              />
            );
          }

          if (hasAuth('workorder:workorder-list:delete')) {
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

          if (buttons.length === 0) return null;

          return (
            <div class="flex-center gap-8px">
              {buttons.map((button, index) => (
                <>
                  {index !== 0 && <NDivider vertical />}
                  {button}
                </>
              ))}
            </div>
          );
        }
      }
    ]
  });

const workorderExtra = computed<Api.Workorder.WorkorderListExtra>(() => {
  const raw = extraData.value as Partial<Api.Workorder.WorkorderListExtra> | null;

  return {
    base_user_map: raw?.base_user_map ?? {},
    device_map: raw?.device_map ?? {},
    logic_point_map: raw?.logic_point_map ?? {}
  };
});

function getDeviceName(deviceId: CommonType.IdType) {
  return workorderExtra.value.device_map[String(deviceId)]?.name ?? '-';
}

function getUserName(userId?: CommonType.IdType, fallback = '-') {
  if (userId === 0) return fallback;
  if (!userId) return '-';

  return workorderExtra.value.base_user_map[String(userId)]?.username ?? fallback;
}

function renderPhone(userId?: CommonType.IdType, rowPhone?: string) {
  if (!userId) return '-';

  const maskedPhone = workorderExtra.value.base_user_map[String(userId)]?.phone ?? rowPhone;
  return <PhoneReveal userId={userId} maskedPhone={maskedPhone} />;
}

function renderStatus(status: Api.Workorder.WorkorderDealStatus) {
  const config = statusMap[status];
  return config ? <NTag type={config.type}>{config.label}</NTag> : status;
}

function isCurrentDealer(row: Api.Workorder.Workorder) {
  if (!row.dealer_uid || currentUserId.value === null || currentUserId.value === undefined) return false;

  return String(row.dealer_uid) === String(currentUserId.value);
}

function canShowAssign(row: Api.Workorder.Workorder) {
  return Number(row.deal_status) === 1 && hasAuth('workorder:workorder-list:assign');
}

function canShowDeal(row: Api.Workorder.Workorder) {
  return Number(row.deal_status) === 2 && isCurrentDealer(row) && hasAuth('workorder:workorder-list:deal');
}

function canShowWatch(row: Api.Workorder.Workorder) {
  const dealStatus = Number(row.deal_status);

  return (
    hasAuth('workorder:workorder-list:watch') &&
    ((dealStatus === 2 && !isCurrentDealer(row)) || dealStatus === 3 || dealStatus === 4)
  );
}

async function fetchWorkorderStat() {
  const { data: response, error } = await fetchGetWorkorderStat();
  if (error) return;

  workorderStat.value = response?.deal_status_map ?? {};
}

function handleModeChange() {
  checkedRowKeys.value = [];
  getDataByPage(1);
}

function handleSearch() {
  checkedRowKeys.value = [];
  getDataByPage(1);
}

function handleAdd() {
  operateType.value = 'add_workorder';
  operateRowData.value = null;
  operateDrawerVisible.value = true;
}

function showWorkorderOperateDrawer(type: Api.Workorder.WorkorderOperateType, row: Api.Workorder.Workorder) {
  operateType.value = type;
  operateRowData.value = row;
  operateDrawerVisible.value = true;
}

async function handleRefresh() {
  if (props.embedded) {
    await getData();
    return;
  }

  await Promise.all([getData(), fetchWorkorderStat()]);
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteWorkorder({ id_list: [id] });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = checkedRowKeys.value.filter(item => item !== id);
  await handleRefresh();
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return;

  const { error } = await fetchDeleteWorkorder({ id_list: checkedRowKeys.value });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = [];
  await handleRefresh();
}

onMounted(() => {
  if (!props.embedded) {
    fetchWorkorderStat();
  }
});
</script>

<template>
  <div :class="containerClass">
    <NGrid v-if="!embedded" cols="1 s:2 l:4" responsive="screen" :x-gap="16" :y-gap="16">
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

    <WorkorderSearch
      v-model:model="searchParams"
      :bordered="embedded"
      :collapsible="!embedded"
      :mode="workorderMode"
      @search="handleSearch"
    />

    <NCard title="工单列表" :bordered="embedded" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <NSpace align="center">
          <NTabs v-model:value="workorderMode" type="segment" animated class="w-200px" @update:value="handleModeChange">
            <NTab v-for="item in workorderModeOptions" :key="item.value" :name="item.value" :tab="item.label" />
          </NTabs>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            :show-add="true"
            @delete="handleBatchDelete"
            @add="handleAdd"
            @refresh="handleRefresh"
          />
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
      <WorkorderOperateDrawer
        v-model:visible="operateDrawerVisible"
        :default-device="props.defaultDevice"
        :operate-type="operateType"
        :row-data="operateRowData"
        @submitted="handleRefresh"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
