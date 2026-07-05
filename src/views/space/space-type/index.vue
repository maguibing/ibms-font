<script setup lang="tsx">
import { ref } from 'vue';
import { NDivider } from 'naive-ui';
import { formatDateTime } from '@sa/utils';
import { fetchDeleteSpaceType, fetchGetSpaceTypeList } from '@/service/api/space';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import SpaceTypeOperateDrawer from './modules/space-type-operate-drawer.vue';
import SpaceTypeSearch from './modules/space-type-search.vue';

defineOptions({
  name: 'SpaceType'
});

const appStore = useAppStore();

const searchParams = ref<Api.Space.SpaceTypeSearchParams>({
  pageNum: 1,
  pageSize: 10,
  keyword: null
});

function transformSearchParamsToRequest(params: Api.Space.SpaceTypeSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs = [{ type: 1, value: params.keyword }];

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

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetSpaceTypeList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Space.SpaceType>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page;
      searchParams.value.pageSize = params.pageSize;
    },
    columns: () => [
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
        key: 'name',
        title: '空间类型名称',
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'desc',
        title: '描述',
        align: 'center',
        minWidth: 180,
        ellipsis: {
          tooltip: true
        },
        render: row => row.desc || '-'
      },
      {
        key: 'created_at',
        title: '创建时间',
        align: 'center',
        minWidth: 180,
        render: row => formatDateTime(row.created_at)
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 130,
        render: row => {
          const editBtn = () => {
            return (
              <ButtonIcon
                text
                type="primary"
                icon="material-symbols:drive-file-rename-outline-outline"
                tooltipContent={$t('common.edit')}
                onClick={() => edit(row.id)}
              />
            );
          };

          const deleteBtn = () => {
            return (
              <ButtonIcon
                text
                type="error"
                icon="material-symbols:delete-outline"
                tooltipContent={$t('common.delete')}
                popconfirmContent={$t('common.confirmDelete')}
                onPositiveClick={() => handleDelete(row.id)}
              />
            );
          };

          const buttons = [editBtn(), deleteBtn()];

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

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'id', getData);

async function handleBatchDelete() {
  const { error } = await fetchDeleteSpaceType({ id_list: checkedRowKeys.value });
  if (error) return;

  onBatchDeleted();
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteSpaceType({ id_list: [id] });
  if (error) return;

  onDeleted();
}

function edit(id: CommonType.IdType) {
  handleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <SpaceTypeSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard title="空间类型管理" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="true"
          :show-delete="true"
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
      <SpaceTypeOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
