<script setup lang="tsx">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import type { SelectOption, TreeOption } from 'naive-ui';
import { NDivider, NTooltip } from 'naive-ui';
import { useRoute } from 'vue-router';
import { useLoading } from '@sa/hooks';
import {
  fetchDeleteProjectSysScreenTag,
  fetchDeleteProjectSysScreenTagPoint,
  fetchGetProjectSysScreenTagList,
  fetchGetProjectSysScreenTagPointList
} from '@/service/api/visual/screen';
import { ImportBizType, ImportTemplatePath } from '@/enum/business';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import DataImportModal from '@/components/custom/data-import-modal.vue';
import TagOperateDrawer from './modules/tag-operate-drawer.vue';
import TagPointOperateDrawer from './modules/tag-point-operate-drawer.vue';
import TagPointSearch from './modules/tag-point-search.vue';

defineOptions({
  name: 'VisualSysScreenTag'
});

const route = useRoute();
const appStore = useAppStore();
const { hasAuth } = useAuth();
const checkedRowKeys = ref<CommonType.IdType[]>([]);
const selectedKeys = ref<CommonType.IdType[]>([]);
const tagPattern = ref<string>();
const tagData = ref<Api.Visual.ProjectSysScreenTag[]>([]);
const selectedTagId = ref<CommonType.IdType | null>(null);
const projectSysScreenMap = ref<Api.Visual.ProjectSysScreenTagListExtra['project_sys_screen_map']>({});
const tagOperateVisible = ref(false);
const tagOperateType = ref<NaiveUI.TableOperateType>('add');
const tagOperateData = ref<Api.Visual.ProjectSysScreenTag | null>(null);
const tagPointOperateVisible = ref(false);
const importTagPointVisible = ref(false);
const tagPointOperateType = ref<NaiveUI.TableOperateType>('add');
const tagPointOperateData = ref<Api.Visual.ProjectSysScreenTagPoint | null>(null);
const tagPointSearchRef = useTemplateRef<InstanceType<typeof TagPointSearch>>('tagPointSearchRef');
const { loading: treeLoading, startLoading: startTreeLoading, endLoading: endTreeLoading } = useLoading();
let isMounted = false;

const scopeOptions: SelectOption[] = [
  { label: '实时数据', value: 101 },
  { label: '导出', value: 201 },
  { label: '状态统计', value: 303 },
  { label: '变化量统计', value: 304 },
  { label: '平均值统计', value: 305 }
];

const projectSysScreenId = computed(() => route.query.project_sys_screen_id as string | undefined);

const searchParams = ref<Api.Visual.ProjectSysScreenTagPointSearchParams>({
  pageNum: 1,
  pageSize: 10,
  device_id: null,
  logic_point_id: null,
  mapping_point_name: null
});

type TagPointExtraMap = Record<string, Api.Visual.ProjectSysScreenTagPointMapItem>;

function getMapFieldValue(
  map: unknown,
  id: CommonType.IdType | null | undefined,
  field: 'name' | 'key'
) {
  if (!id) return '-';

  return (map as TagPointExtraMap | undefined)?.[String(id)]?.[field] || String(id);
}

const pageTitle = computed(() => {
  if (!projectSysScreenId.value) return '大屏标签';

  return projectSysScreenMap.value[projectSysScreenId.value]?.name || '大屏标签';
});

const selectable = computed(() => {
  return !treeLoading.value;
});

const {
  columns,
  columnChecks,
  data: tagPointData,
  extraData,
  getData,
  getDataByPage,
  loading,
  mobilePagination,
  scrollX
} = useNaivePaginatedTable({
  api: () => fetchGetProjectSysScreenTagPointList(tagPointSearchRef.value?.buildRequestParams() ?? {}),
  immediate: false,
  transform: response => defaultTransform<Api.Visual.ProjectSysScreenTagPoint>(response),
  onPaginationParamsChange: params => {
    searchParams.value.pageNum = params.page ?? 1;
    searchParams.value.pageSize = params.pageSize ?? 10;
  },
  columns: (): NaiveUI.TableColumn<Api.Visual.ProjectSysScreenTagPoint>[] => [
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
      key: 'device_id',
      title: '设备名称',
      align: 'center',
      minWidth: 160,
      ellipsis: {
        tooltip: true
      },
      render: row => getMapFieldValue(extraData.value?.device_map, row.device_id, 'name')
    },
    {
      key: 'logic_point_name',
      title: '点位名称',
      align: 'center',
      minWidth: 160,
      ellipsis: {
        tooltip: true
      },
      render: row => getMapFieldValue(extraData.value?.logic_point_map, row.logic_point_id, 'name')
    },
    {
      key: 'logic_point_key',
      title: '点位标识',
      align: 'center',
      minWidth: 160,
      ellipsis: {
        tooltip: true
      },
      render: row => getMapFieldValue(extraData.value?.logic_point_map, row.logic_point_id, 'key')
    },
    {
      key: 'mapping_point_name',
      title: '映射点位名称',
      align: 'center',
      minWidth: 160,
      ellipsis: {
        tooltip: true
      },
      render: row => row.mapping_point_name || '-'
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: row => {
        const editBtn = () => (
          <ButtonIcon
            text
            type="primary"
            icon="material-symbols:drive-file-rename-outline-outline"
            tooltipContent={$t('common.edit')}
            onClick={() => handleEditTagPoint(row)}
          />
        );

        const deleteBtn = () => (
          <ButtonIcon
            text
            type="error"
            icon="material-symbols:delete-outline"
            tooltipContent={$t('common.delete')}
            popconfirmContent={$t('common.confirmDelete')}
            onPositiveClick={() => handleDeleteTagPoint(row.id)}
          />
        );

        const buttons = [];
        if (hasAuth('visual:sys-screen-tag:point-mapping:edit')) buttons.push(editBtn());
        if (hasAuth('visual:sys-screen-tag:point-mapping:delete')) buttons.push(deleteBtn());

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

function tagFilter(pattern: string, node: TreeOption) {
  const name = String(node.name || '');
  const key = String(node.key || '');

  return name.includes(pattern) || key.includes(pattern);
}

function buildTagListRequest(): CommonType.CommonListQueryParams {
  return {
    list_option: {
      limit: 100,
      offset: 0,
      options: [{ type: 1, value: projectSysScreenId.value }]
    },
    options: [{ key: 1 }]
  };
}

async function getTagData() {
  if (!projectSysScreenId.value) {
    tagData.value = [];
    selectedKeys.value = [];
    selectedTagId.value = null;
    projectSysScreenMap.value = {};
    return;
  }

  startTreeLoading();
  const { data: tagResponse, error } = await fetchGetProjectSysScreenTagList(buildTagListRequest());

  if (!error) {
    tagData.value = Array.isArray(tagResponse?.list) ? tagResponse.list : [];
    projectSysScreenMap.value = tagResponse?.project_sys_screen_map ?? {};

    if (selectedTagId.value && !tagData.value.some(item => item.id === selectedTagId.value)) {
      handleClickTree([]);
    }
  }

  endTreeLoading();
}

function handleClickTree(keys: CommonType.IdType[]) {
  selectedKeys.value = keys;
  selectedTagId.value = keys.length ? keys[0] : null;
  checkedRowKeys.value = [];
  getDataByPage(1);
}

function handleResetTreeData() {
  tagPattern.value = '';
  getTagData();
}

function handleAddTag() {
  if (!projectSysScreenId.value) {
    window.$message?.warning('缺少大屏ID');
    return;
  }

  tagOperateType.value = 'add';
  tagOperateData.value = null;
  tagOperateVisible.value = true;
}

function handleEditTag(row: Api.Visual.ProjectSysScreenTag) {
  tagOperateType.value = 'edit';
  tagOperateData.value = row;
  tagOperateVisible.value = true;
}

async function handleDeleteTag(row: Api.Visual.ProjectSysScreenTag) {
  const { error } = await fetchDeleteProjectSysScreenTag({ id_list: [row.id] });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));

  if (selectedTagId.value === row.id) {
    handleClickTree([]);
  }

  await getTagData();
}

function handleSubmitTag() {
  getTagData();
}

function handleAddTagPoint() {
  if (!projectSysScreenId.value || !selectedTagId.value) {
    window.$message?.warning('请选择左侧标签');
    return;
  }

  tagPointOperateType.value = 'add';
  tagPointOperateData.value = null;
  tagPointOperateVisible.value = true;
}

function handleImportTagPoint() {
  if (!projectSysScreenId.value) {
    window.$message?.warning('缺少大屏ID');
    return;
  }

  importTagPointVisible.value = true;
}

function handleImportTagPointSubmitted() {
  getTagData();
  getData();
}

function handleEditTagPoint(row: Api.Visual.ProjectSysScreenTagPoint) {
  tagPointOperateType.value = 'edit';
  tagPointOperateData.value = row;
  tagPointOperateVisible.value = true;
}

async function handleDeleteTagPoint(id: CommonType.IdType) {
  const { error } = await fetchDeleteProjectSysScreenTagPoint({ id_list: [id] });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = checkedRowKeys.value.filter(item => item !== id);
  await getData();
}

async function handleBatchDeleteTagPoint() {
  if (checkedRowKeys.value.length === 0) return;

  const { error } = await fetchDeleteProjectSysScreenTagPoint({ id_list: checkedRowKeys.value });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = [];
  await getData();
}

function renderLabel({ option }: { option: TreeOption }) {
  return (
    <NTooltip placement="left">
      {{
        trigger: () => (
          <div class="w-200px flex gap-6px overflow-hidden text-ellipsis whitespace-nowrap">
            <span>{option.name}</span>
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
  const row = option as Api.Visual.ProjectSysScreenTag;

  const editBtn = () => (
    <ButtonIcon
      text
      type="primary"
      icon="material-symbols:drive-file-rename-outline-outline"
      tooltip-content={$t('common.edit')}
      onClick={(event: Event) => {
        event.stopPropagation();
        handleEditTag(row);
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
      onPositiveClick={() => handleDeleteTag(row)}
    />
  );

  const buttons = [];
  if (hasAuth('visual:sys-screen-tag:edit')) buttons.push(editBtn());
  if (hasAuth('visual:sys-screen-tag:delete')) buttons.push(deleteBtn());

  if (buttons.length === 0) return null;

  return (
    <div class="flex-center gap-12px">
      {buttons.map(button => button)}
    </div>
  );
}

watch(
  projectSysScreenId,
  () => {
    selectedKeys.value = [];
    selectedTagId.value = null;
    checkedRowKeys.value = [];
    searchParams.value.device_id = null;
    searchParams.value.logic_point_id = null;
    searchParams.value.mapping_point_name = null;
    getTagData();

    if (isMounted) {
      getDataByPage(1);
    }
  },
  { immediate: true }
);

onMounted(() => {
  isMounted = true;
  getDataByPage(1);
});
</script>

<template>
  <TableSiderLayout sider-title="大屏标签">
    <template #header-extra>
      <ButtonIcon
        v-if="hasAuth('visual:sys-screen-tag:add')"
        size="small"
        icon="material-symbols:add-rounded"
        class="h-18px text-icon"
        :tooltip-content="$t('common.add')"
        @click.stop="() => handleAddTag()"
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
      <NInput v-model:value="tagPattern" clearable :placeholder="$t('common.keywordSearch')" />
      <NSpin class="sys-screen-tag-tree" :show="treeLoading">
        <NTree
          v-model:selected-keys="selectedKeys"
          block-node
          show-line
          :data="tagData as []"
          :show-irrelevant-nodes="false"
          :pattern="tagPattern"
          :filter="tagFilter"
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
            <NEmpty description="暂无大屏标签" class="h-full min-h-200px justify-center" />
          </template>
        </NTree>
      </NSpin>
    </template>
    <div class="h-full flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto">
      <TagPointSearch
        ref="tagPointSearchRef"
        v-model:model="searchParams"
        :project-sys-screen-id="projectSysScreenId"
        :project-sys-screen-tag-id="selectedTagId"
        @search="getDataByPage(1)"
      />
      <NCard :title="pageTitle" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
        <template #header-extra>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disable-add="!selectedTagId"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            :show-add="hasAuth('visual:sys-screen-tag:point-mapping:add')"
            :show-delete="hasAuth('visual:sys-screen-tag:point-mapping:delete')"
            :show-export="false"
            @add="handleAddTagPoint"
            @delete="handleBatchDeleteTagPoint"
            @refresh="getData"
          >
            <template #after>
              <NButton
                v-if="hasAuth('visual:sys-screen-tag:point-mapping:import')"
                size="small"
                ghost
                :disabled="!projectSysScreenId"
                @click="handleImportTagPoint"
              >
                <template #icon>
                  <SvgIcon icon="material-symbols:upload-rounded" class="text-icon" />
                </template>
                导入
              </NButton>
            </template>
          </TableHeaderOperation>
        </template>
        <NEmpty v-if="!projectSysScreenId" description="缺少大屏ID" class="py-48px" />
        <NEmpty v-else-if="!selectedTagId" description="请选择左侧标签" class="py-48px" />
        <DataTable
          v-else
          v-model:checked-row-keys="checkedRowKeys"
          :columns="columns"
          :data="tagPointData"
          :flex-height="!appStore.isMobile"
          :scroll-x="scrollX"
          :loading="loading"
          remote
          :row-key="row => row.id"
          :pagination="mobilePagination"
          class="sm:h-full"
        />
      </NCard>
      <TagOperateDrawer
        v-model:visible="tagOperateVisible"
        :project-sys-screen-id="projectSysScreenId"
        :operate-type="tagOperateType"
        :row-data="tagOperateData"
        :scope-options="scopeOptions"
        @submitted="handleSubmitTag"
      />
      <TagPointOperateDrawer
        v-model:visible="tagPointOperateVisible"
        :operate-type="tagPointOperateType"
        :project-sys-screen-id="projectSysScreenId"
        :project-sys-screen-tag-id="selectedTagId"
        :row-data="tagPointOperateData"
        @submitted="getData"
      />
      <DataImportModal
        v-model:visible="importTagPointVisible"
        :biz-type="ImportBizType.ProjectSysScreenTagPoint"
        :template-path="ImportTemplatePath.SysScreenTagPoint"
        :template-file-name="`系统大屏标签点位_${$t('common.importTemplate')}_${new Date().getTime()}.xlsx`"
        :meta="{
          project_sys_screen_tag_point: {
            project_sys_screen_id: Number(projectSysScreenId)
          }
        }"
        task-name="系统大屏标签点位"
        @submitted="handleImportTagPointSubmitted"
      />
    </div>
  </TableSiderLayout>
</template>

<style scoped lang="scss">
.sys-screen-tag-tree {
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
</style>
