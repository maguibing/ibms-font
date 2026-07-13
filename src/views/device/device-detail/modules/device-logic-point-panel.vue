<script setup lang="ts">
import { computed, h, ref } from 'vue';
import { fetchGetLogicPointList } from '@/service/api/device';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import DataTypeTag from '@/components/custom/data-type-tag.vue';

defineOptions({
  name: 'DeviceLogicPointPanel'
});

interface Props {
  deviceId: CommonType.IdType;
}

const props = defineProps<Props>();

const appStore = useAppStore();

const searchParams = ref<Api.Device.LogicPointSearchParams>({
  pageNum: 1,
  pageSize: 10,
  name: null,
  key: null
});

function transformSearchParamsToRequest(params: Api.Device.LogicPointSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs = [
    { type: 2, value: props.deviceId },
    { type: 6, value: params.name },
    { type: 4, value: params.key }
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
    options: [{ key: 4 }]
  };
}

const { columns, columnChecks, data, extraData, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetLogicPointList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Device.LogicPoint>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page ?? 1;
      searchParams.value.pageSize = params.pageSize ?? 10;
    },
    columns: (): NaiveUI.TableColumn<Api.Device.LogicPoint>[] => [
      {
        key: 'index',
        title: $t('common.index'),
        align: 'center',
        width: 64,
        render: (_, index) => index + 1
      },
      {
        key: 'name',
        title: '点位名称',
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        },
        render: row => row.name || '-'
      },
      {
        key: 'key',
        title: '点位标识',
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        },
        render: row => row.key || '-'
      },
      {
        key: 'data_type',
        title: '数据类型',
        align: 'center',
        minWidth: 120,
        render: row => h(DataTypeTag, { value: getLogicPointDataType(row) })
      }
    ]
  });

const deviceTypePointMap = computed(() => {
  return (extraData.value?.device_type_point_map ?? {}) as NonNullable<
    Api.Device.LogicPointListExtra['device_type_point_map']
  >;
});

function getLogicPointDataType(row: Api.Device.LogicPoint) {
  return deviceTypePointMap.value[String(row.device_type_point_id)]?.data_type ?? row.data_type ?? null;
}

function handleSearch() {
  getDataByPage(1);
}

function handleResetSearch() {
  searchParams.value.name = null;
  searchParams.value.key = null;
  getDataByPage(1);
}
</script>

<template>
  <div class="h-full min-h-0 flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto">
    <NCard size="small" class="card-wrapper">
      <NForm :show-feedback="false" label-placement="left" :label-width="80">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi span="24 s:12 m:8" label="点位名称" label-width="auto" class="pr-24px">
            <NInput
              v-model:value="searchParams.name"
              clearable
              placeholder="请输入点位名称"
              @keyup.enter="handleSearch"
            />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:8" label="点位标识" label-width="auto" class="pr-24px">
            <NInput
              v-model:value="searchParams.key"
              clearable
              placeholder="请输入点位标识"
              @keyup.enter="handleSearch"
            />
          </NFormItemGi>
          <NFormItemGi :show-feedback="false" span="24 s:24 m:8" class="pr-24px">
            <NSpace class="w-full" justify="end">
              <NButton type="primary" ghost @click="handleSearch">
                <template #icon>
                  <icon-ic-round-search class="text-icon" />
                </template>
                {{ $t('common.search') }}
              </NButton>
              <NButton @click="handleResetSearch">
                <template #icon>
                  <icon-ic-round-refresh class="text-icon" />
                </template>
                {{ $t('common.reset') }}
              </NButton>
            </NSpace>
          </NFormItemGi>
        </NGrid>
      </NForm>
    </NCard>
    <NCard title="逻辑点位" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
          :show-add="false"
          :show-delete="false"
          :show-export="false"
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
    </NCard>
  </div>
</template>

<style scoped></style>
