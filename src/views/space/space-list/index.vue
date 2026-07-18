<script setup lang="tsx">
import { h, ref } from 'vue';
import { NButton, NDivider } from 'naive-ui';
import { jsonClone } from '@sa/utils';
import { fetchDeleteSpace, fetchGetSpaceTrees } from '@/service/api/space';
import { useAppStore } from '@/store/modules/app';
import { treeTransform, useNaiveTreeTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import CopyableValue from '@/components/custom/copyable-value.vue';
import SpaceOperateDrawer from './modules/space-operate-drawer.vue';
import SpaceSearch from './modules/space-search.vue';

defineOptions({
  name: 'SpaceList'
});

const appStore = useAppStore();

const searchParams = ref<Api.Space.SpaceSearchParams>({
  space_name: null
});

function transformSearchParamsToRequest(params: Api.Space.SpaceSearchParams): CommonType.CommonListQueryParams {
  const filterConfigs = [{ type: 1, value: params.space_name }];

  const options = filterConfigs
    .filter((item): item is { type: number; value: string } => Boolean(item.value))
    .map(({ type, value }) => ({ type, value }));

  return {
    list_option: {
      options
    },
    options: [{ key: 1 }]
  };
}

const {
  columns,
  columnChecks,
  data,
  rows,
  getData,
  loading,
  extraData,
  expandedRowKeys,
  isCollapse,
  expandAll,
  collapseAll,
  scrollX
} = useNaiveTreeTable({
  keyField: 'space_id',
  api: () => fetchGetSpaceTrees(transformSearchParamsToRequest(searchParams.value)),
  transform: response =>
    treeTransform<Api.Space.Space>(response, {
      idField: 'space_id',
      parentIdField: 'parent_id'
    }),
  columns: () => [
    {
      key: 'space_name',
      title: '空间名称',
      align: 'center',
      width: 160,
      ellipsis: true
    },
    {
      key: 'space_key',
      title: '空间标识',
      align: 'center',
      minWidth: 150,
      ellipsis: {
        tooltip: true
      },
      render: row => h(CopyableValue, { value: row.space_key })
    },
    {
      key: 'space_type_id',
      title: '空间类型',
      align: 'center',
      minWidth: 120,
      ellipsis: true,
      render: row => getSpaceTypeName(row)
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
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 150,
      render: row => {
        const addBtn = () => {
          return (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:add-2-rounded"
              tooltipContent={$t('common.add')}
              onClick={() => addInRow(row)}
            />
          );
        };

        const editBtn = () => {
          return (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => edit(row.space_id)}
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
              onPositiveClick={() => handleDelete(row.space_id)}
            />
          );
        };

        const buttons = [addBtn(), editBtn(), deleteBtn()];

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

function getSpaceTypeName(row: Api.Space.Space) {
  const raw = extraData.value as Api.Space.SpaceTreeResponse | null;
  return raw?.space_type_map?.[String(row.space_type_id)]?.name || '-';
}

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, onDeleted } = useTableOperate(
  rows,
  'space_id',
  getData
);

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteSpace({ id_list: [id] });
  if (error) return;

  onDeleted();
}

function edit(id: CommonType.IdType) {
  handleEdit(id);
}

function handleAddRoot() {
  editingData.value = null;
  handleAdd();
}

function addInRow(row: Api.Space.Space) {
  editingData.value = jsonClone(row);
  handleAdd();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <SpaceSearch v-model:model="searchParams" @search="getData" />
    <NCard title="空间管理" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
          :show-add="true"
          :show-delete="false"
          :show-export="false"
          @add="handleAddRoot"
          @refresh="getData"
        >
          <template #prefix>
            <NButton v-if="!isCollapse" :disabled="!data.length" size="small" @click="expandAll">
              <template #icon>
                <icon-quill-expand />
              </template>
              展开全部
            </NButton>
            <NButton v-if="isCollapse" :disabled="!data.length" size="small" @click="collapseAll">
              <template #icon>
                <icon-quill-collapse />
              </template>
              折叠全部
            </NButton>
          </template>
        </TableHeaderOperation>
      </template>
      <NDataTable
        v-model:expanded-row-keys="expandedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="scrollX"
        :loading="loading"
        :row-key="row => row.space_id"
        class="sm:h-full"
      />
      <SpaceOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
