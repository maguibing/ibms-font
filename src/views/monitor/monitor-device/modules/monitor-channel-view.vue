<script setup lang="tsx">
import { computed, onMounted, ref, shallowRef } from 'vue';
import { NDivider, NTag } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { StatusTag } from '@sa/materials';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { useAppStore } from '@/store/modules/app';
import { fetchDeleteMonitorChannel, fetchGetMonitor, fetchGetMonitorChannelList } from '@/service/api/monitor';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import { displayValue, formatTime } from '@/utils/common-methods';
import MonitorChannelOperateDrawer from './monitor-channel-operate-drawer.vue';

defineOptions({
  name: 'MonitorChannelView'
});

interface Props {
  monitorId: CommonType.IdType;
}

interface Emits {
  (e: 'back'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const MONITOR_ACCESS_TYPE_OPTIONS: CommonType.Option<Api.Monitor.MonitorAccessType, string>[] = [
  { label: '本地源流拉流', value: 1 },
  { label: '云平台接入', value: 2 }
];

const PLAY_PROTOCOL_OPTIONS: CommonType.Option<Api.Monitor.MonitorChannelPlayProtocol, string>[] = [
  { label: 'HLS', value: 3 },
  { label: 'HTTP-FLV', value: 4 }
];

const SOURCE_TYPE_OPTIONS: CommonType.Option<number, string>[] = [
  { label: '手动创建', value: 1 },
  { label: '厂商同步', value: 2 }
];

const appStore = useAppStore();
const { loading: detailLoading, startLoading, endLoading } = useLoading();

const monitor = shallowRef<Api.Monitor.MonitorDetail | null>(null);
const searchParams = ref<Api.Monitor.MonitorChannelSearchParams>({
  pageNum: 1,
  pageSize: 10
});

function getMonitorAccessTypeLabel(value: Api.Monitor.MonitorAccessType | null | undefined) {
  return MONITOR_ACCESS_TYPE_OPTIONS.find(item => item.value === value)?.label || '-';
}

function getPlayProtocolLabel(value: Api.Monitor.MonitorChannelPlayProtocol | null | undefined) {
  return PLAY_PROTOCOL_OPTIONS.find(item => item.value === value)?.label || '-';
}

function getSourceTypeLabel(value: number | null | undefined) {
  return SOURCE_TYPE_OPTIONS.find(item => item.value === value)?.label || '-';
}

function transformSearchParamsToRequest(params: Api.Monitor.MonitorChannelSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;

  return {
    options: [{ key: 1 }],
    list_option: {
      limit: pageSize,
      offset: (pageNum - 1) * pageSize,
      options: [{ type: 3, value: String(props.monitorId) }]
    }
  };
}

const { columns, columnChecks, data, extraData, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetMonitorChannelList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Monitor.MonitorChannel>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page ?? 1;
      searchParams.value.pageSize = params.pageSize ?? 10;
    },
    columns: (): NaiveUI.TableColumn<Api.Monitor.MonitorChannel>[] => [
      {
        key: 'index',
        title: $t('common.index'),
        align: 'center',
        width: 64,
        render: (_, index) => index + 1
      },
      {
        key: 'name',
        title: '通道名称',
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        },
        render: row => row.name || '-'
      },
      {
        key: 'source_type',
        title: '源类型',
        align: 'center',
        minWidth: 110,
        render: row => <NTag>{getSourceTypeLabel(row.source_type)}</NTag>
      },
      {
        key: 'play_protocol',
        title: '播放协议',
        align: 'center',
        minWidth: 120,
        render: row => <NTag type="info">{getPlayProtocolLabel(row.setting?.play_protocol)}</NTag>
      },
      {
        key: 'source_url',
        title: '拉流地址',
        align: 'center',
        minWidth: 260,
        ellipsis: {
          tooltip: true
        },
        render: row => row.setting?.local_pull?.source_url || '-'
      },
      {
        key: 'online',
        title: '在线状态',
        align: 'center',
        minWidth: 100,
        render: row => {
          const isOnline = getChannelOnlineStatus(row.id);

          return <NTag type={isOnline ? 'success' : 'error'}>{isOnline ? '在线' : '离线'}</NTag>;
        }
      },
      {
        key: 'status',
        title: '状态',
        align: 'center',
        minWidth: 100,
        render: row => <StatusTag value={row.status} />
      },
      {
        key: 'created_at',
        title: '创建时间',
        align: 'center',
        minWidth: 180,
        render: row => formatTime(row.created_at)
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 130,
        fixed: 'right',
        render: row => {
          const buttons = [
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => edit(row.id)}
            />,
            <ButtonIcon
              text
              type="error"
              icon="material-symbols:delete-outline"
              tooltipContent={$t('common.delete')}
              popconfirmContent={$t('common.confirmDelete')}
              onPositiveClick={() => handleDelete(row.id)}
            />
          ];

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

const onlineMap = computed(() => {
  return (extraData.value?.is_online_map ?? {}) as NonNullable<Api.Monitor.MonitorChannelListExtra['is_online_map']>;
});

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, onDeleted } = useTableOperate(
  data,
  'id',
  getData
);

async function getMonitorDetail() {
  startLoading();
  const { data: responseData, error } = await fetchGetMonitor({ id: props.monitorId }).finally(endLoading);
  if (error) return;

  monitor.value = responseData.monitor;
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteMonitorChannel({ id_list: [id] });
  if (error) return;

  onDeleted();
}

function getChannelOnlineStatus(id: CommonType.IdType) {
  return onlineMap.value[String(id)] === true;
}

function edit(id: CommonType.IdType) {
  handleEdit(id);
}

function handleBack() {
  emit('back');
}

onMounted(() => {
  getMonitorDetail();
});
</script>

<template>
  <div class="h-full min-h-500px flex-col-stretch gap-16px overflow-auto">
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NPageHeader title="监控通道" @back="handleBack">
        <NSpin :show="detailLoading">
          <NEmpty v-if="!monitor && !detailLoading" description="暂无监控设备详情" class="py-48px" />
          <div v-else-if="monitor" class="mt-16px grid grid-cols-[128px_minmax(0,1fr)] items-stretch lt-sm:grid-cols-1">
            <div
              class="flex min-h-full items-center justify-center rounded-l-8px border border-r-0 border-[var(--n-border-color)] lt-sm:min-h-104px lt-sm:rounded-b-0 lt-sm:rounded-t-8px lt-sm:border-b-0 lt-sm:border-r"
            >
              <span class="size-72px inline-flex items-center justify-center rounded-6px">
                <SvgIcon icon="material-symbols:videocam-outline-rounded" class="text-32px text-primary" />
              </span>
            </div>
            <NDescriptions
              label-placement="left"
              :column="appStore.isMobile ? 1 : 2"
              bordered
              size="small"
              label-class="min-w-88px"
              class="min-w-0 [&_.n-descriptions-table-wrapper]:rounded-bl-0 [&_.n-descriptions-table-wrapper]:rounded-tl-0 lt-sm:[&_.n-descriptions-table-wrapper]:rounded-bl-8px lt-sm:[&_.n-descriptions-table-wrapper]:rounded-t-0"
            >
              <NDescriptionsItem label="设备名称">{{ displayValue(monitor.name) }}</NDescriptionsItem>
              <NDescriptionsItem label="接入类型">
                <NTag type="info">{{ getMonitorAccessTypeLabel(monitor.access_type) }}</NTag>
              </NDescriptionsItem>
              <NDescriptionsItem label="状态">
                <StatusTag :value="monitor.status" />
              </NDescriptionsItem>
              <NDescriptionsItem label="创建时间">{{ formatTime(monitor.created_at) }}</NDescriptionsItem>
            </NDescriptions>
          </div>
        </NSpin>
      </NPageHeader>
    </NCard>

    <NCard
      v-if="monitor"
      title="通道列表"
      :bordered="false"
      size="small"
      class="monitor-channel-card card-wrapper"
      content-class="h-full min-h-0 flex-col-stretch"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
          :show-add="true"
          :show-delete="false"
          :show-export="false"
          @add="handleAdd"
          @refresh="getData"
        />
      </template>
      <DataTable
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
      <MonitorChannelOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :monitor-id="monitorId"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped>
.monitor-channel-card {
  height: max(560px, calc(100vh - 320px));
  overflow: hidden;
}
</style>
