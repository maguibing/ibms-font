<script setup lang="tsx">
import { computed, h, ref } from 'vue';
import { NDivider, NImage, NTag } from 'naive-ui';
import { useBoolean } from '@sa/hooks';
import { formatDateTime } from '@sa/utils';
import { fetchDeleteCustomScreen, fetchGetCustomScreenList } from '@/service/api/visual/custom-screen';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import { getOssUrl } from '@/utils/common-methods';
import ButtonIcon from '@/components/custom/button-icon.vue';
import CustomScreenCloneModal from './modules/custom-screen-clone-modal.vue';
import CustomScreenOperateDrawer from './modules/custom-screen-operate-drawer.vue';
import CustomScreenSearch from './modules/custom-screen-search.vue';
import CopyableValue from '@/components/custom/copyable-value.vue';
defineOptions({
  name: 'VisualCustomScreen'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();
const CUSTOM_SCREEN_DESIGN_URL = '/custom-screen/#/chart/home/';
const CUSTOM_SCREEN_PREVIEW_URL = '/custom-screen/#/chart/preview/';

const checkedRowKeys = ref<CommonType.IdType[]>([]);
const operateType = ref<NaiveUI.TableOperateType>('add');
const operateData = ref<Api.Visual.CustomScreen | null>(null);
const cloneData = ref<Api.Visual.CustomScreen | null>(null);
const { bool: drawerVisible, setTrue: openDrawer } = useBoolean();
const { bool: cloneModalVisible, setTrue: openCloneModal } = useBoolean();
const searchParams = ref<Api.Visual.CustomScreenSearchParams>({
  pageNum: 1,
  pageSize: 10,
  name: null
});

const { columns, columnChecks, data, extraData, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetCustomScreenList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Visual.CustomScreen>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page ?? 1;
      searchParams.value.pageSize = params.pageSize ?? 10;
    },
    columns: (): NaiveUI.TableColumn<Api.Visual.CustomScreen>[] => [
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
        title: '缩略图',
        align: 'center',
        minWidth: 140,
        render: row => {
          if (!row.thumb_url) return '-';

          return (
            <div class="flex-center">
              <NImage src={getOssUrl(row.thumb_url)} width={100} height={56} objectFit="cover" />
            </div>
          );
        }
      },
      {
        key: 'name',
        title: '大屏名称',
        align: 'center',
        minWidth: 180,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'key',
        title: '大屏标识',
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        },
        render: row => h(CopyableValue, { value: row.key })
      },
      {
        key: 'last_save_user_id',
        title: '最后保存人',
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        },
        render: row => getUserName(row.last_save_user_id)
      },
      {
        key: 'last_publish_user_id',
        title: '最后发布人',
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        },
        render: row => getUserName(row.last_publish_user_id)
      },
      {
        key: 'publish_status',
        title: '发布状态',
        align: 'center',
        minWidth: 100,
        render: row => <NTag type={row.publish_at ? 'success' : 'error'}>{row.publish_at ? '已发布' : '未发布'}</NTag>
      },
      {
        key: 'updated_at',
        title: '更新时间',
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
              onClick={() => handleEdit(row)}
            />
          );

          const designBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:design-services-outline"
              tooltipContent="设计"
              onClick={() => handleOpenDesign(row)}
            />
          );

          const viewBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:visibility-outline"
              tooltipContent="预览"
              onClick={() => handleOpenPreview(row)}
            />
          );

          const cloneBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:content-copy-outline"
              tooltipContent="克隆"
              onClick={() => handleClone(row)}
            />
          );

          const deleteBtn = () => (
            <ButtonIcon
              text
              type="error"
              icon="material-symbols:delete-outline"
              tooltipContent={$t('common.delete')}
              popconfirmContent={$t('common.confirmDelete')}
              onPositiveClick={() => handleDelete(row.id)}
            />
          );

          const buttons = [];
          if (hasAuth('visual:custom-screen:edit')) buttons.push(editBtn());
          if (hasAuth('visual:custom-screen:design')) buttons.push(designBtn());
          if (hasAuth('visual:custom-screen:view')) buttons.push(viewBtn());
          if (hasAuth('visual:custom-screen:add')) buttons.push(cloneBtn());
          if (hasAuth('visual:custom-screen:delete')) buttons.push(deleteBtn());

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

const customScreenExtra = computed<Api.Visual.CustomScreenListExtra>(() => {
  const raw = extraData.value as Partial<Api.Visual.CustomScreenListExtra> | null;

  return {
    base_user_map: raw?.base_user_map ?? {}
  };
});

function transformSearchParamsToRequest(params: Api.Visual.CustomScreenSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const options: CommonType.CommonTypeOptions[] = [];

  if (params.name) {
    options.push({ type: 1, value: params.name });
  }

  return {
    list_option: {
      options,
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    },
    options: [{ key: 1 }]
  };
}

function getUserName(userId: CommonType.IdType | null | undefined) {
  if (!userId) return '-';

  return customScreenExtra.value.base_user_map[String(userId)]?.username || String(userId);
}

function handleAdd() {
  operateType.value = 'add';
  operateData.value = null;
  openDrawer();
}

function handleEdit(row: Api.Visual.CustomScreen) {
  operateType.value = 'edit';
  operateData.value = row;
  openDrawer();
}

function handleOpenDesign(row: Api.Visual.CustomScreen) {
  if (!row.key) {
    window.$message?.warning('当前自定义大屏缺少唯一标识，暂时无法进入设计页');
    return;
  }

  window.location.assign(`${CUSTOM_SCREEN_DESIGN_URL}${row.key}`);
}

function handleOpenPreview(row: Api.Visual.CustomScreen) {
  if (!row.key) {
    window.$message?.warning('当前自定义大屏缺少唯一标识，暂时无法进入预览页');
    return;
  }

  window.location.assign(`${CUSTOM_SCREEN_PREVIEW_URL}${row.key}`);
}

function handleClone(row: Api.Visual.CustomScreen) {
  cloneData.value = row;
  openCloneModal();
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteCustomScreen({ id_list: [id] });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = checkedRowKeys.value.filter(item => item !== id);
  await getData();
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return;

  const { error } = await fetchDeleteCustomScreen({ id_list: checkedRowKeys.value });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = [];
  await getData();
}

function handleSearch() {
  getDataByPage(1);
}

function handleSubmit() {
  getData();
}
</script>

<template>
  <div class="h-full flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto">
    <CustomScreenSearch v-model:model="searchParams" @search="handleSearch" />
    <NCard title="自定义大屏列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('visual:custom-screen:add')"
          :show-delete="hasAuth('visual:custom-screen:delete')"
          :show-export="false"
          @add="handleAdd"
          @delete="handleBatchDelete"
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
      <CustomScreenOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="operateData"
        @submitted="handleSubmit"
      />
      <CustomScreenCloneModal v-model:visible="cloneModalVisible" :row-data="cloneData" @submitted="handleSubmit" />
    </NCard>
  </div>
</template>

<style scoped></style>
