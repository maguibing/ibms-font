<script setup lang="ts">
import { computed, h, ref, shallowRef } from 'vue';
import { NTime } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { fetchBindVersionCorp, fetchGetVersionList } from '@/service/api/corp';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';

defineOptions({
  name: 'BindVersionDrawer'
});

interface Emits {
  (e: 'submitted'): void;
}

type SearchParams = {
  pageNum: number;
  pageSize: number;
  keyword: string | null;
};

const emit = defineEmits<Emits>();

const appStore = useAppStore();
const { loading: submitLoading, startLoading: startSubmitLoading, endLoading: endSubmitLoading } = useLoading();

const visible = shallowRef(false);
const corpId = shallowRef<CommonType.IdType | null>(null);
const boundVersionIds = shallowRef<CommonType.IdType[]>([]);
const searchParams = ref<SearchParams>(createDefaultSearchParams());

const boundVersionIdSet = computed(() => new Set(boundVersionIds.value.map(String)));

function createDefaultSearchParams(): SearchParams {
  return {
    pageNum: 1,
    pageSize: 10,
    keyword: null
  };
}

function transformSearchParamsToRequest(params: SearchParams): Api.System.CorpProjectVersionListParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const options = [
    { type: 3, value: 'true' },
    { type: 1, value: params.keyword }
  ].filter((item): item is { type: number; value: string } => Boolean(item.value));

  return {
    corp_id: 0,
    list_option: {
      options,
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    }
  };
}

const { columns, data, getData, getDataByPage, loading, mobilePagination, scrollX } = useNaivePaginatedTable({
  immediate: false,
  api: () => fetchGetVersionList(transformSearchParamsToRequest(searchParams.value)),
  transform: response => defaultTransform<Api.System.CorpProjectVersion>(response),
  onPaginationParamsChange: params => {
    searchParams.value.pageNum = params.page ?? 1;
    searchParams.value.pageSize = params.pageSize ?? 10;
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48,
      disabled: row => boundVersionIdSet.value.has(String(row.id))
    },
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: (_, index) => index + 1
    },
    {
      key: 'name',
      title: '名称',
      align: 'center',
      minWidth: 160,
      ellipsis: {
        tooltip: true
      }
    },
    {
      key: 'start_at',
      title: '开始时间',
      align: 'center',
      minWidth: 180,
      render: row => h(NTime, { time: row.start_at, unix: true })
    },
    {
      key: 'end_at',
      title: '结束时间',
      align: 'center',
      minWidth: 180,
      render: row => h(NTime, { time: row.end_at, unix: true })
    }
  ]
});

const { checkedRowKeys } = useTableOperate(data, 'id', getData);
const newVersionIds = computed(() => checkedRowKeys.value.filter(id => !boundVersionIdSet.value.has(String(id))));

function open(id: CommonType.IdType, selectedIds: CommonType.IdType[] = []) {
  corpId.value = id;
  boundVersionIds.value = selectedIds;
  checkedRowKeys.value = [...selectedIds];
  resetSearchParams();
  visible.value = true;
  getDataByPage();
}

function closeDrawer() {
  visible.value = false;
}

function resetSearchParams() {
  Object.assign(searchParams.value, createDefaultSearchParams());
}

function reset() {
  resetSearchParams();
  getDataByPage();
}

function clearSelected() {
  checkedRowKeys.value = [...boundVersionIds.value];
}

async function handleSubmit() {
  if (!corpId.value) return;

  if (!newVersionIds.value.length) {
    window.$message?.warning('请选择需要添加的版本');
    return;
  }

  startSubmitLoading();
  const { error } = await fetchBindVersionCorp({
    corp_id: corpId.value,
    version_id_list: newVersionIds.value
  }).finally(endSubmitLoading);

  if (error) return;

  window.$message?.success('添加成功');
  closeDrawer();
  emit('submitted');
}

defineExpose({
  open
});
</script>

<template>
  <NDrawer
    v-model:show="visible"
    title="添加已有版本"
    display-directive="show"
    :width="980"
    class="max-w-90%"
    content-class="h-full"
    wrapper-class="h-full"
  >
    <NDrawerContent
      title="添加已有版本"
      :native-scrollbar="false"
      closable
      body-class="h-full"
      body-content-class="h-full"
    >
      <div class="h-full flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto">
        <NForm :model="searchParams" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:8" label="版本名称" path="keyword" class="pr-24px">
              <NInput
                v-model:value="searchParams.keyword"
                clearable
                placeholder="请输入版本名称"
                @keyup.enter="() => getDataByPage()"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" :show-feedback="false">
              <NSpace class="w-full" justify="start">
                <NButton type="primary" ghost @click="() => getDataByPage()">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  {{ $t('common.search') }}
                </NButton>
                <NButton @click="reset">
                  <template #icon>
                    <icon-ic-round-refresh class="text-icon" />
                  </template>
                  {{ $t('common.reset') }}
                </NButton>
              </NSpace>
            </NFormItemGi>
          </NGrid>
        </NForm>

        <NAlert type="info">
          <span v-if="newVersionIds.length">
            已选择 {{ newVersionIds.length }} 个待添加版本
            <NButton class="pl-6px" text type="primary" @click="clearSelected">清空</NButton>
          </span>
          <span v-else>请选择需要添加的版本</span>
        </NAlert>

        <NCard :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
          <DataTable
            v-model:checked-row-keys="checkedRowKeys"
            :columns="columns"
            :data="data"
            size="small"
            :flex-height="!appStore.isMobile"
            :scroll-x="scrollX"
            :loading="loading"
            remote
            :row-key="row => row.id"
            :pagination="mobilePagination"
            class="h-full"
          />
        </NCard>
      </div>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
