<script setup lang="tsx">
import { computed, ref } from 'vue';
import type { TreeOption } from 'naive-ui';
import type { FlatResponseData } from '@sa/axios';
import { NEllipsis, NTag, NTooltip } from 'naive-ui';
import { useBoolean, useLoading } from '@sa/hooks';
import { formatDateTime } from '@sa/utils';
import {
  fetchDeleteDeviceTypeTemplateCategory,
  fetchGetDeviceTypeTemplateList,
  fetchGetDeviceTypeTemplateCategoryList
} from '@/service/api/device-type-template';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import CategoryOperateDrawer from './modules/category-operate-drawer.vue';

defineOptions({
  name: 'DeviceTypeTemplateList'
});

const appStore = useAppStore();
const selectedKeys = ref<CommonType.IdType[]>([]);
const categoryPattern = ref<string>();
const categoryData = ref<Api.System.DeviceTypeTemplateCategory[]>([]);
const selectedCategoryId = ref<CommonType.IdType | null>(null);
const categoryOperateType = ref<NaiveUI.TableOperateType>('add');
const categoryOperateData = ref<Api.System.DeviceTypeTemplateCategory>();
const { bool: categoryDrawerVisible, setTrue: openCategoryDrawer } = useBoolean();

const { loading: treeLoading, startLoading: startTreeLoading, endLoading: endTreeLoading } = useLoading();

const searchParams = ref<Api.System.DeviceTypeTemplateSearchParams>({
  pageNum: 1,
  pageSize: 10,
  name: null,
  category_id: null
});

const categoryTitle = computed(() => {
  const category = categoryData.value.find(item => item.id === selectedCategoryId.value);

  return category ? (
    <NEllipsis lineClamp={2} class="flex">
      <span>{category.name}</span>
    </NEllipsis>
  ) : (
    <div>设备类型模板</div>
  );
});

const selectable = computed(() => {
  return !treeLoading.value;
});

const hasSelectedCategory = computed(() => {
  return selectedCategoryId.value !== null && selectedCategoryId.value !== undefined;
});

function categoryFilter(pattern: string, node: TreeOption) {
  const name = String(node.name || '');
  return name.includes(pattern);
}

function transformSearchParamsToRequest(params: Api.System.DeviceTypeTemplateSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs = [
    { type: 1, value: params.category_id?.toString() },
    { type: 2, value: params.name }
  ];

  const options = filterConfigs
    .filter((item): item is { type: number; value: string } => Boolean(item.value))
    .map(({ type, value }) => ({ type, value }));

  return {
    list_option: {
      options,
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    }
  };
}

type DeviceTypeTemplateListResponse = FlatResponseData<App.Service.Response<any>, Api.System.DeviceTypeTemplateList>;

function getEmptyDeviceTypeTemplateListResponse(): DeviceTypeTemplateListResponse {
  const emptyData = {
    list: [],
    paginate: {
      limit: searchParams.value.pageSize || 10,
      offset: 0,
      total: 0
    }
  } as unknown as Api.System.DeviceTypeTemplateList;

  return {
    data: emptyData,
    error: null,
    response: null as unknown as DeviceTypeTemplateListResponse['response']
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable<DeviceTypeTemplateListResponse, Api.System.DeviceTypeTemplate>({
    api: () => {
      if (!hasSelectedCategory.value) {
        return Promise.resolve(getEmptyDeviceTypeTemplateListResponse());
      }

      return fetchGetDeviceTypeTemplateList(transformSearchParamsToRequest(searchParams.value));
    },
    transform: response => defaultTransform<Api.System.DeviceTypeTemplate>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page;
      searchParams.value.pageSize = params.pageSize;
    },
    columns: () => [
      {
        key: 'index',
        title: $t('common.index'),
        align: 'center',
        width: 64,
        render: (_, index) => index + 1
      },
      {
        key: 'name',
        title: '设备类型名称',
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'key',
        title: '标识',
        align: 'center',
        minWidth: 120,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'status',
        title: '状态',
        align: 'center',
        minWidth: 100,
        render: row => {
          if (row.status === 1) {
            return <NTag type="success">启用</NTag>;
          }

          return <NTag type="default">停用</NTag>;
        }
      },
      {
        key: 'created_at',
        title: '创建时间',
        align: 'center',
        minWidth: 180,
        render: row => formatDateTime(row.created_at)
      },
      {
        key: 'updated_at',
        title: '更新时间',
        align: 'center',
        minWidth: 180,
        render: row => formatDateTime(row.updated_at)
      }
    ]
  });

async function getCategoryData() {
  startTreeLoading();
  const { data: categoryResponse, error } = await fetchGetDeviceTypeTemplateCategoryList({
    list_option: {
      limit: 100,
      offset: 0
    }
  });

  if (!error) {
    categoryData.value = categoryResponse.list;
  }

  endTreeLoading();
}

function handleClickTree(keys: CommonType.IdType[]) {
  selectedKeys.value = keys;
  selectedCategoryId.value = keys.length ? keys[0] : null;
  searchParams.value.category_id = selectedCategoryId.value;
  getDataByPage();
}

function handleResetTreeData() {
  categoryPattern.value = '';
  getCategoryData();
}

function handleAddCategory() {
  categoryOperateType.value = 'add';
  categoryOperateData.value = undefined;
  openCategoryDrawer();
}

function handleEditCategory(category: Api.System.DeviceTypeTemplateCategory) {
  categoryOperateType.value = 'edit';
  categoryOperateData.value = category;
  openCategoryDrawer();
}

async function handleDeleteCategory(category: Api.System.DeviceTypeTemplateCategory) {
  const { error } = await fetchDeleteDeviceTypeTemplateCategory({ id_list: [category.id] });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));

  if (selectedCategoryId.value === category.id) {
    handleClickTree([]);
  }

  await getCategoryData();
}

async function handleSubmitCategory(id?: CommonType.IdType | null) {
  await getCategoryData();

  if (id) {
    handleClickTree([id]);
  }
}

function handleResetSearch() {
  searchParams.value.name = null;
  getDataByPage();
}

function renderLabel({ option }: { option: TreeOption }) {
  return (
    <NTooltip placement="left">
      {{
        trigger: () => (
          <div class="w-200px flex gap-6px overflow-hidden text-ellipsis whitespace-nowrap">
            <span>{option.name}</span>
            {option.desc ? <span class="text-12px text-gray-500">( {option.desc} )</span> : null}
          </div>
        ),
        default: () => (
          <div class="flex-col">
            <span>{option.name}</span>
            {option.desc ? <span>( {option.desc} )</span> : null}
          </div>
        )
      }}
    </NTooltip>
  );
}

function renderSuffix({ option }: { option: TreeOption }) {
  return (
    <div class="flex-center gap-12px">
      <ButtonIcon
        text
        type="primary"
        icon="material-symbols:drive-file-rename-outline-outline"
        tooltip-content={$t('common.edit')}
        onClick={(event: Event) => {
          event.stopPropagation();
          handleEditCategory(option as Api.System.DeviceTypeTemplateCategory);
        }}
      />
      <ButtonIcon
        text
        type="error"
        icon="material-symbols:delete-outline"
        tooltip-content={$t('common.delete')}
        popconfirm-content={$t('common.confirmDelete')}
        onClick={(event: Event) => event.stopPropagation()}
        onPositiveClick={() => handleDeleteCategory(option as Api.System.DeviceTypeTemplateCategory)}
      />
    </div>
  );
}

getCategoryData();
</script>

<template>
  <TableSiderLayout sider-title="设备类型模板分类">
    <template #header-extra>
      <ButtonIcon
        size="small"
        icon="material-symbols:add-rounded"
        class="h-18px text-icon"
        :tooltip-content="$t('common.add')"
        @click.stop="() => handleAddCategory()"
      />
      <ButtonIcon
        size="small"
        icon="material-symbols:refresh-rounded"
        class="h-18px text-icon"
        :tooltip-content="$t('common.refresh')"
        @click.stop="() => handleResetTreeData()"
      />
    </template>
    <template #sider>
      <NInput v-model:value="categoryPattern" clearable :placeholder="$t('common.keywordSearch')" />
      <NSpin class="device-type-template-tree" :show="treeLoading">
        <NTree
          v-model:selected-keys="selectedKeys"
          block-node
          show-line
          :data="categoryData as []"
          :show-irrelevant-nodes="false"
          :pattern="categoryPattern"
          :filter="categoryFilter"
          class="infinite-scroll h-full min-h-200px py-3"
          key-field="id"
          label-field="name"
          virtual-scroll
          :selectable="selectable"
          :render-label="renderLabel"
          :render-suffix="renderSuffix"
          @update:selected-keys="handleClickTree"
        >
          <template #empty>
            <NEmpty description="暂无设备类型模板分类" class="h-full min-h-200px justify-center" />
          </template>
        </NTree>
      </NSpin>
    </template>
    <div class="h-full flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto">
      <NCard v-if="hasSelectedCategory" :bordered="false" size="small" class="card-wrapper">
        <NForm inline :show-feedback="false" label-placement="left">
          <NFormItem label="设备类型名称">
            <NInput v-model:value="searchParams.name" clearable placeholder="请输入设备类型名称" />
          </NFormItem>
          <NFormItem>
            <NSpace>
              <NButton type="primary" @click="() => getDataByPage()">
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
          </NFormItem>
        </NForm>
      </NCard>
      <NCard
        v-if="hasSelectedCategory"
        :title="() => categoryTitle"
        :bordered="false"
        size="small"
        class="card-wrapper sm:flex-1-hidden"
      >
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
      <CategoryOperateDrawer
        v-model:visible="categoryDrawerVisible"
        :operate-type="categoryOperateType"
        :row-data="categoryOperateData"
        @submitted="handleSubmitCategory"
      />
    </div>
  </TableSiderLayout>
</template>

<style scoped lang="scss">
.device-type-template-tree {
  :deep(.n-tree__empty) {
    height: 100%;
    justify-content: center;
  }

  :deep(.n-spin-content) {
    height: 100%;
  }

  :deep(.infinite-scroll) {
    height: calc(100vh - 228px - var(--calc-footer-height, 0px)) !important;
    max-height: calc(100vh - 228px - var(--calc-footer-height, 0px)) !important;
  }

  @media screen and (max-width: 1024px) {
    :deep(.infinite-scroll) {
      height: calc(100vh - 227px - var(--calc-footer-height, 0px)) !important;
      max-height: calc(100vh - 227px - var(--calc-footer-height, 0px)) !important;
    }
  }

  :deep(.n-tree-node) {
    height: 30px;
  }

  :deep(.n-tree-node-switcher) {
    height: 30px;
  }

  :deep(.n-tree-node-switcher__icon) {
    font-size: 16px !important;
    height: 16px !important;
    width: 16px !important;
  }
}

:deep(.n-card-header__main) {
  min-width: 180px !important;
}
</style>
