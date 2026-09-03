<script setup lang="tsx">
import { computed, h, ref } from 'vue';
import type { TreeOption } from 'naive-ui';
import { NDivider, NImage, NTag, NTooltip } from 'naive-ui';
import { useBoolean, useLoading } from '@sa/hooks';
import { formatDateTime } from '@sa/utils';
import {
  fetchDeleteConfiguration,
  fetchDeleteConfigurationCategory,
  fetchGetConfigurationList,
  fetchGetConfigurationCategoryTrees
} from '@/service/api/visual/configuration';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import { getOssUrl } from '@/utils/common-methods';
import ButtonIcon from '@/components/custom/button-icon.vue';
import CategoryOperateDrawer from './modules/category-operate-drawer.vue';
import ConfigurationCloneModal from './modules/configuration-clone-modal.vue';
import ConfigurationOperateDrawer from './modules/configuration-operate-drawer.vue';
import ConfigurationSearch from './modules/configuration-search.vue';
import CopyableValue from '@/components/custom/copyable-value.vue';
defineOptions({
  name: 'VisualConfiguration'
});

const props = withDefaults(
  defineProps<{
    configurationType?: number;
  }>(),
  {
    configurationType: 1
  }
);

const appStore = useAppStore();
const { hasAuth } = useAuth();
const LOCAL_CONFIGURATION_BASE_URL = 'http://localhost:7788/#/';
const LOCAL_FUXA_BASE_URL = 'http://localhost:4200/#/';

const ROOT_CATEGORY: Api.Visual.ConfigurationCategory = {
  id: 0,
  name: $t('visualConfiguration.all'),
  parent_id: 0
};

const selectedKeys = ref<CommonType.IdType[]>([0]);
const checkedRowKeys = ref<CommonType.IdType[]>([]);
const expandedKeys = ref<CommonType.IdType[]>([0]);
const categoryPattern = ref<string>();
const categoryData = ref<Api.Visual.ConfigurationCategory[]>([]);
const selectedCategoryId = ref<CommonType.IdType | null>(0);
const configurationOperateType = ref<NaiveUI.TableOperateType>('add');
const configurationOperateData = ref<Api.Visual.Configuration | null>(null);
const configurationCloneData = ref<Api.Visual.Configuration | null>(null);
const categoryOperateType = ref<NaiveUI.TableOperateType>('add');
const categoryOperateData = ref<Api.Visual.ConfigurationCategory | null>(null);
const { bool: configurationDrawerVisible, setTrue: openConfigurationDrawer } = useBoolean();
const { bool: cloneModalVisible, setTrue: openCloneModal } = useBoolean();
const { bool: categoryDrawerVisible, setTrue: openCategoryDrawer } = useBoolean();
const { loading: treeLoading, startLoading: startTreeLoading, endLoading: endTreeLoading } = useLoading();
const searchParams = ref<Api.Visual.ConfigurationSearchParams>({
  pageNum: 1,
  pageSize: 15,
  name: null
});

const treeData = computed<Api.Visual.ConfigurationCategory[]>(() => {
  const root: Api.Visual.ConfigurationCategory = { ...ROOT_CATEGORY };

  if (categoryData.value.length) {
    root.children = categoryData.value;
  }

  return [root];
});

const selectedCategoryName = computed(() => {
  if (selectedCategoryId.value === 0) return ROOT_CATEGORY.name;

  const category = findCategoryById(categoryData.value, selectedCategoryId.value);
  return category?.name || ROOT_CATEGORY.name;
});

const selectable = computed(() => !treeLoading.value);

const { columns, columnChecks, data, extraData, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetConfigurationList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Visual.Configuration>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page ?? 1;
      searchParams.value.pageSize = params.pageSize ?? 15;
    },
    columns: (): NaiveUI.TableColumn<Api.Visual.Configuration>[] => [
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
        key: 'thumb_url',
        title: $t('visualConfiguration.thumbnail'),
        align: 'center',
        minWidth: 140,
        render: row => {
          if (!row.thumb_url) return '-';

          return (<div class="flex-center">
              <NImage src={getOssUrl(row.thumb_url)} width={100} height={56} objectFit="cover" />
            </div>
          );
        }
      },
      {
        key: 'name',
        title: $t('visualConfiguration.name'),
        align: 'center',
        minWidth: 180,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'key',
        title: $t('visualConfiguration.key'),
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        },
        render: row => h(CopyableValue, { value: row.key })
      },
      {
        key: 'last_save_user_id',
        title: $t('visualConfiguration.lastSaveUser'),
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        },
        render: row => getUserName(row.last_save_user_id)
      },
      {
        key: 'last_publish_user_id',
        title: $t('visualConfiguration.lastPublishUser'),
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        },
        render: row => getUserName(row.last_publish_user_id)
      },
      {
        key: 'publish_status',
        title: $t('visualConfiguration.publishStatus'),
        align: 'center',
        minWidth: 100,
        render: row => <NTag type={row.publish_at ? 'success' : 'error'}>{row.publish_at ? $t('visualConfiguration.published') : $t('visualConfiguration.unpublished')}</NTag>
      },
      {
        key: 'updated_at',
        title: $t('visualConfiguration.updatedAt'),
        align: 'center',
        minWidth: 180,
        render: row => (row.updated_at ? formatDateTime(row.updated_at) : '-')
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 260,
        fixed: 'right',
        render: row => {
          const editBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => handleEditConfiguration(row)}
            />
          );

          const designBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:design-services-outline"
              tooltipContent={$t('visualConfiguration.design')}
              onClick={() => handleOpenDesign(row)}
            />
          );

          const viewBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:visibility-outline"
              tooltipContent={$t('visualConfiguration.preview')}
              onClick={() => handleOpenPreview(row)}
            />
          );

          const cloneBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:content-copy-outline"
              tooltipContent={$t('visualConfiguration.clone')}
              onClick={() => handleCloneConfiguration(row)}
            />
          );

          const deleteBtn = () => (
            <ButtonIcon
              text
              type="error"
              icon="material-symbols:delete-outline"
              tooltipContent={$t('common.delete')}
              popconfirmContent={$t('common.confirmDelete')}
              onPositiveClick={() => handleDeleteConfiguration(row.id)}
            />
          );

          const buttons = [];
          if (props.configurationType !== 2 || hasAuth('visual:fuxa:edit')) buttons.push(editBtn());
          if (props.configurationType !== 2 || hasAuth('visual:fuxa:design')) buttons.push(designBtn());
          if (props.configurationType !== 2 || hasAuth('visual:fuxa:view')) buttons.push(viewBtn());
          if (props.configurationType !== 2 || hasAuth('visual:fuxa:add')) buttons.push(cloneBtn());
          if (props.configurationType !== 2 || hasAuth('visual:fuxa:delete')) buttons.push(deleteBtn());

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

const configurationExtra = computed<Api.Visual.ConfigurationListExtra>(() => {
  const raw = extraData.value as Partial<Api.Visual.ConfigurationListExtra> | null;

  return {
    base_user_map: raw?.base_user_map ?? {}
  };
});

function findCategoryById(
  categories: Api.Visual.ConfigurationCategory[],
  id: CommonType.IdType | null
): Api.Visual.ConfigurationCategory | null {
  if (id === null || id === undefined) return null;

  for (const category of categories) {
    if (category.id === id) return category;

    const child = findCategoryById(category.children || [], id);
    if (child) return child;
  }

  return null;
}

function transformSearchParamsToRequest(params: Api.Visual.ConfigurationSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 15;
  const options: CommonType.CommonTypeOptions[] = [
    { type: 104, value: '101' },
    { type: 5, value: String(props.configurationType) },
    { type: 2, value: String(selectedCategoryId.value ?? 0) },
    { type: 51, value: 'true' }
  ];

  if (params.name) {
    options.push({ type: 1, value: params.name });
  }

  return {
    list_option: {
      options,
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    },
    options: [{ key: 1 }, { key: 2 }]
  };
}

function getUserName(userId: CommonType.IdType | null | undefined) {
  if (!userId) return '-';

  return configurationExtra.value.base_user_map[String(userId)]?.username || String(userId);
}

function normalizeUrlWithTrailingSlash(url: string) {
  return url.endsWith('/') ? url : `${url}/`;
}

function isLocalConfigurationEnv() {
  const localHostnames = ['localhost', '127.0.0.1', '::1', '[::1]'];

  return localHostnames.includes(window.location.hostname);
}

function getConfigurationBaseUrl() {
  if (isLocalConfigurationEnv()) {
    return props.configurationType === 2 ? LOCAL_FUXA_BASE_URL : LOCAL_CONFIGURATION_BASE_URL;
  }

  const origin = normalizeUrlWithTrailingSlash(window.location.origin);
  const appPath = props.configurationType === 2 ? 'fuxa' : 'configuration';

  return `${origin}${appPath}/#/`;
}

function buildConfigurationUrl(path: 'edit' | 'view', params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();

  return `${getConfigurationBaseUrl()}${path}?${query}`;
}

function categoryFilter(pattern: string, node: TreeOption) {
  const name = String(node.name || '');
  return name.includes(pattern);
}

function normalizeCategoryTree(
  categories: Api.Visual.ConfigurationCategory[],
  parentId: CommonType.IdType
): Api.Visual.ConfigurationCategory[] {
  return categories.map(category => {
    const { children, ...rest } = category;
    const normalizedCategory: Api.Visual.ConfigurationCategory = {
      ...rest,
      parent_id: category.parent_id ?? parentId
    };
    const normalizedChildren = normalizeCategoryTree(Array.isArray(children) ? children : [], category.id);

    if (normalizedChildren.length) {
      normalizedCategory.children = normalizedChildren;
    }

    return normalizedCategory;
  });
}

async function getCategoryData() {
  startTreeLoading();
  const { data: categoryResponse, error } = await fetchGetConfigurationCategoryTrees().finally(endTreeLoading);

  if (error) return;

  categoryData.value = normalizeCategoryTree(Array.isArray(categoryResponse?.trees) ? categoryResponse.trees : [], 0);

  if (selectedCategoryId.value !== 0 && !findCategoryById(categoryData.value, selectedCategoryId.value)) {
    handleClickTree([0]);
  }
}

function handleClickTree(keys: CommonType.IdType[]) {
  const nextKeys = keys.length ? keys : [0];

  selectedKeys.value = nextKeys;
  selectedCategoryId.value = nextKeys[0];
  checkedRowKeys.value = [];
  getDataByPage(1);
}

function handleResetTreeData() {
  categoryPattern.value = '';
  getCategoryData();
}

function handleAddCategory() {
  categoryOperateType.value = 'add';
  categoryOperateData.value = null;
  openCategoryDrawer();
}

function handleAddConfiguration() {
  configurationOperateType.value = 'add';
  configurationOperateData.value = null;
  openConfigurationDrawer();
}

function handleEditConfiguration(row: Api.Visual.Configuration) {
  configurationOperateType.value = 'edit';
  configurationOperateData.value = row;
  openConfigurationDrawer();
}

function handleOpenDesign(row: Api.Visual.Configuration) {
  window.open(buildConfigurationUrl('edit', { key: row.key }), '_blank', 'noopener,noreferrer');
}

function handleOpenPreview(row: Api.Visual.Configuration) {
  if (!row.publish_at) {
    window.$message?.warning($t('visualConfiguration.notPublished'));
    return;
  }

  window.open(buildConfigurationUrl('view', { key: row.key, isClose: 'true' }), '_blank', 'noopener,noreferrer');
}

function handleCloneConfiguration(row: Api.Visual.Configuration) {
  configurationCloneData.value = row;
  openCloneModal();
}

async function handleDeleteConfiguration(id: CommonType.IdType) {
  const { error } = await fetchDeleteConfiguration({ id_list: [id] });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = checkedRowKeys.value.filter(item => item !== id);
  await getData();
}

async function handleBatchDeleteConfiguration() {
  if (checkedRowKeys.value.length === 0) return;

  const { error } = await fetchDeleteConfiguration({ id_list: checkedRowKeys.value });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = [];
  await getData();
}

function handleEditCategory(category: Api.Visual.ConfigurationCategory) {
  if (category.id === 0) return;

  categoryOperateType.value = 'edit';
  categoryOperateData.value = category;
  openCategoryDrawer();
}

async function handleDeleteCategory(category: Api.Visual.ConfigurationCategory) {
  if (category.id === 0) return;

  const { error } = await fetchDeleteConfigurationCategory({ id_list: [category.id] });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));

  if (selectedCategoryId.value === category.id) {
    handleClickTree([0]);
  }

  await getCategoryData();
}

async function handleSubmitCategory() {
  await getCategoryData();
}

function handleSearch() {
  getDataByPage(1);
}

function handleSubmitConfiguration() {
  getData();
}

function handleSubmitCloneConfiguration() {
  getData();
}

function renderLabel({ option }: { option: TreeOption }) {
  return (
    <NTooltip placement="left">
      {{
        trigger: () => (
          <div class="configuration-category-label">
            <span class="configuration-category-label__text">{option.name}</span>
          </div>
        ),
        default: () => (
          <div class="flex-col">
            <span>{option.name}</span>
          </div>
        )
      }}
    </NTooltip>
  );
}

function renderSuffix({ option }: { option: TreeOption }) {
  const row = option as Api.Visual.ConfigurationCategory;

  if (row.id === 0) return null;

  const editBtn = () => (
    <ButtonIcon
      text
      type="primary"
      icon="material-symbols:drive-file-rename-outline-outline"
      tooltip-content={$t('common.edit')}
      onClick={(event: Event) => {
        event.stopPropagation();
        handleEditCategory(row);
      }}
    />
  );

  const deleteBtn = () => (
    <ButtonIcon
      text
      type="error"
      icon="material-symbols:delete-outline"
      tooltip-content={$t('common.delete')}
      popconfirm-content={$t('common.confirmDelete')}
      onClick={(event: Event) => event.stopPropagation()}
      onPositiveClick={() => handleDeleteCategory(row)}
    />
  );

  const buttons = [];
  if (props.configurationType !== 2 || hasAuth('visual:fuxa:category:edit')) buttons.push(editBtn());
  if (props.configurationType !== 2 || hasAuth('visual:fuxa:category:delete')) buttons.push(deleteBtn());

  if (buttons.length === 0) return null;

  return (
    <div class="flex-center gap-10px">
      {buttons.map(button => button)}
    </div>
  );
}

getCategoryData();
</script>

<template>
  <TableSiderLayout :sider-title="$t('visualConfiguration.category')" default-expanded>
    <template #header-extra>
      <ButtonIcon
        v-if="props.configurationType !== 2 || hasAuth('visual:fuxa:category:add')"
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
      <NSpin class="configuration-category-tree" :show="treeLoading">
        <NTree
          v-model:selected-keys="selectedKeys"
          v-model:expanded-keys="expandedKeys"
          block-node
          show-line
          :data="treeData as []"
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
            <NEmpty :description="$t('visualConfiguration.emptyCategory')" class="h-full min-h-200px justify-center" />
          </template>
        </NTree>
      </NSpin>
    </template>
    <div class="h-full flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto">
      <ConfigurationSearch v-model:model="searchParams" @search="handleSearch" />
      <NCard
        :title="`${$t('visualConfiguration.list')} - ${selectedCategoryName}`"
        :bordered="false"
        size="small"
        class="card-wrapper sm:flex-1-hidden"
      >
        <template #header-extra>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            :show-add="props.configurationType !== 2 || hasAuth('visual:fuxa:add')"
            :show-delete="props.configurationType !== 2 || hasAuth('visual:fuxa:delete')"
            :show-export="false"
            @add="handleAddConfiguration"
            @delete="handleBatchDeleteConfiguration"
            @refresh="getData"
          />
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
      </NCard>
      <ConfigurationOperateDrawer
        v-model:visible="configurationDrawerVisible"
        :operate-type="configurationOperateType"
        :row-data="configurationOperateData"
        :categories="treeData"
        :category-id="selectedCategoryId"
        :configuration-type="props.configurationType"
        @submitted="handleSubmitConfiguration"
      />
      <ConfigurationCloneModal
        v-model:visible="cloneModalVisible"
        :row-data="configurationCloneData"
        @submitted="handleSubmitCloneConfiguration"
      />
      <CategoryOperateDrawer
        v-model:visible="categoryDrawerVisible"
        :operate-type="categoryOperateType"
        :row-data="categoryOperateData"
        :categories="treeData"
        :parent-id="selectedCategoryId"
        @submitted="handleSubmitCategory"
      />
    </div>
  </TableSiderLayout>
</template>

<style scoped lang="scss">
.configuration-category-tree {
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

  :deep(.n-tree-node-content) {
    min-width: 0;
  }

  :deep(.n-tree-node-content__text) {
    flex: 1;
    min-width: 0;
  }

  :deep(.n-tree-node-content__suffix) {
    flex-shrink: 0;
    margin-left: 8px;
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

.configuration-category-label {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.configuration-category-label__text {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
