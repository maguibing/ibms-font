<script setup lang="ts">
import { computed, h, ref, shallowRef } from 'vue';
import { NButton } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { fetchBindDevicePoint, fetchGetPhysicalPointList } from '@/service/api/device';
import { fetchGetGatewayList } from '@/service/api/gateway';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import CopyableValue from '@/components/custom/copyable-value.vue';
import EnumTag from '@/components/custom/enum-tag.vue';

defineOptions({
  name: 'BindPhysicalPointDrawer'
});

interface Emits {
  (e: 'submitted'): void;
}

type SearchParams = {
  pageNum: number;
  pageSize: number;
  name: string | null;
};

const GATEWAY_REQUEST_PARAMS: CommonType.CommonListQueryParams = {
  options: [{ key: 1 }],
  list_option: {
    options: [{ type: 104, value: '101' }]
  }
};

const emit = defineEmits<Emits>();
const appStore = useAppStore();
const { loading: submitLoading, startLoading, endLoading } = useLoading();

const visible = shallowRef(false);
const logicPoint = shallowRef<Api.Device.LogicPoint | null>(null);
const selectedGatewayId = shallowRef<CommonType.IdType | null>(null);
const selectedPhysicalPointId = shallowRef<CommonType.IdType | null>(null);
const searchParams = ref<SearchParams>(createDefaultSearchParams());

const drawerTitle = computed(() => `${$t('devicePointManage.selectPhysicalPoint')} - ${logicPoint.value?.name ?? '-'}`);

function createDefaultSearchParams(): SearchParams {
  return {
    pageNum: 1,
    pageSize: 10,
    name: null
  };
}

const { columns, data, extraData, getDataByPage, loading, mobilePagination, pagination, scrollX } =
  useNaivePaginatedTable({
    immediate: false,
    api: () =>
      fetchGetPhysicalPointList({
        list_option: {
          options: [
            { type: 5, value: searchParams.value.name?.trim() ?? '' },
            { type: 104, value: '101' },
            ...(selectedGatewayId.value ? [{ type: 1, value: String(selectedGatewayId.value) }] : [])
          ],
          offset: (searchParams.value.pageNum - 1) * searchParams.value.pageSize,
          limit: searchParams.value.pageSize
        }
      }),
    transform: response => defaultTransform<Api.Device.PhysicalPoint>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page ?? 1;
      searchParams.value.pageSize = params.pageSize ?? 10;
    },
    columns: (): NaiveUI.TableColumn<Api.Device.PhysicalPoint>[] => [
      {
        key: 'select',
        title: $t('devicePointManage.select'),
        align: 'center',
        width: 80,
        render: row =>
          h(
            NButton,
            {
              size: 'small',
              type: selectedPhysicalPointId.value === row.id ? 'primary' : 'default',
              onClick: () => {
                selectedPhysicalPointId.value = row.id;
              }
            },
            {
              default: () =>
                selectedPhysicalPointId.value === row.id
                  ? $t('devicePointManage.selected')
                  : $t('devicePointManage.select')
            }
          )
      },
      {
        key: 'name',
        title: $t('devicePointManage.pointName'),
        align: 'center',
        minWidth: 180,
        ellipsis: { tooltip: true },
        render: row => row.name || '-'
      },
      {
        key: 'key',
        title: $t('devicePointManage.pointIdentifier'),
        align: 'center',
        minWidth: 180,
        ellipsis: { tooltip: true },
        render: row => h(CopyableValue, { value: row.key })
      },
      {
        key: 'data_type',
        title: $t('devicePointManage.dataType'),
        align: 'center',
        minWidth: 120,
        render: row => h(EnumTag, { value: row.data_type })
      }
    ]
  });

function clearPhysicalPointData() {
  data.value = [];
  extraData.value = null;
  pagination.itemCount = 0;
  selectedPhysicalPointId.value = null;
}

function open(row: Api.Device.LogicPoint) {
  logicPoint.value = row;
  selectedGatewayId.value = null;
  searchParams.value = createDefaultSearchParams();
  clearPhysicalPointData();
  visible.value = true;
  getDataByPage(1);
}

function closeDrawer() {
  visible.value = false;
}

function handleGatewayChange(value: CommonType.IdType | CommonType.IdType[] | null | undefined) {
  const gatewayId = Array.isArray(value) ? (value[0] ?? null) : (value ?? null);

  selectedGatewayId.value = gatewayId;
  searchParams.value = createDefaultSearchParams();
  clearPhysicalPointData();
  getDataByPage(1);
}

function handleSearch() {
  getDataByPage(1);
}

function handleResetSearch() {
  searchParams.value.name = null;
  selectedPhysicalPointId.value = null;
  handleSearch();
}

async function handleSubmit() {
  if (!logicPoint.value || !selectedPhysicalPointId.value) {
    window.$message?.warning($t('devicePointManage.physicalPointRequired'));
    return;
  }

  startLoading();
  const { error } = await fetchBindDevicePoint({
    op_type: 1,
    bind_list: [
      {
        logic_point_id: logicPoint.value.id,
        physical_point_id: selectedPhysicalPointId.value
      }
    ]
  }).finally(endLoading);

  if (error) return;

  window.$message?.success($t('devicePointManage.bindSuccess'));
  closeDrawer();
  emit('submitted');
}

defineExpose({
  open
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="900" class="max-w-90%">
    <NDrawerContent :title="drawerTitle" :native-scrollbar="false" closable body-content-class="h-full">
      <div class="h-full min-h-0 flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto">
        <NForm label-placement="left">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12" :label="$t('devicePointManage.gateway')" label-width="auto" class="pr-24px">
              <RemoteSearchSelect
                v-model:value="selectedGatewayId"
                :request="fetchGetGatewayList"
                :request-params="GATEWAY_REQUEST_PARAMS"
                :search-type="1"
                label-field="name"
                value-field="id"
                clearable
                :placeholder="$t('devicePointManage.gatewayPlaceholder')"
                @update:value="handleGatewayChange"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12" :label="$t('devicePointManage.pointName')" label-width="auto">
              <NInput
                v-model:value="searchParams.name"
                clearable
                :placeholder="$t('devicePointManage.pointNamePlaceholder')"
                @keyup.enter="handleSearch"
              />
            </NFormItemGi>
            <NFormItemGi :show-feedback="false" span="24">
              <NSpace class="w-full" justify="end">
                <NButton type="primary" ghost @click="handleSearch">
                  <template #icon><icon-ic-round-search class="text-icon" /></template>
                  {{ $t('common.search') }}
                </NButton>
                <NButton @click="handleResetSearch">
                  <template #icon><icon-ic-round-refresh class="text-icon" /></template>
                  {{ $t('common.reset') }}
                </NButton>
              </NSpace>
            </NFormItemGi>
          </NGrid>
        </NForm>

        <NCard :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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
        </NCard>
      </div>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
