<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NDivider } from 'naive-ui';
import { jsonClone } from '@sa/utils';
import { fetchBatchDeleteDept, fetchGetDeptList } from '@/service/api/system/dept';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { treeTransform, useNaiveTreeTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import DeptOperateDrawer from './modules/dept-operate-drawer.vue';
import DeptSearch from './modules/dept-search.vue';

defineOptions({
  name: 'DeptList'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();

const searchParams = ref({
  name: null
});

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
  keyField: 'dept_id',
  api: () => fetchGetDeptList({ options: [{ key: 1 }] }),
  transform: response => treeTransform(response, { idField: 'dept_id' }),
  columns: () => [
    {
      key: 'dept_name',
      title: $t('page.system.dept.name'),
      align: 'center',
      width: 150,
      ellipsis: true
    },
    {
      key: 'leader_id',
      title: $t('page.system.dept.leader'),
      align: 'center',
      ellipsis: true,
      render: row => getLeaderName(row.leader_id)
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
              onClick={() => edit(row.dept_id)}
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
              onPositiveClick={() => handleDelete(row.dept_id)}
            />
          );
        };

        const buttons = [];
        if (hasAuth('system:dept:add')) buttons.push(addBtn());
        if (hasAuth('system:dept:edit')) buttons.push(editBtn());
        if (hasAuth('system:dept:remove')) buttons.push(deleteBtn());

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

function getLeaderName(leaderId: CommonType.IdType | undefined) {
  if (leaderId === undefined || leaderId === null) {
    return '-';
  }

  const raw = extraData.value as { leader_map?: Record<string, { username?: string }> } | null;
  return raw?.leader_map?.[String(leaderId)]?.username || '-';
}

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, onDeleted } = useTableOperate(
  rows,
  'dept_id',
  getData
);

async function handleDelete(deptId: CommonType.IdType) {
  // request
  const { error } = await fetchBatchDeleteDept({ id_list: [deptId] });
  if (error) return;
  onDeleted();
}

function edit(deptId: CommonType.IdType) {
  handleEdit(deptId);
}

function addInRow(row: Api.Common.DeptNode) {
  editingData.value = jsonClone(row);
  handleAdd();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <DeptSearch v-model:model="searchParams" @search="getData" />
    <NCard :title="$t('page.system.dept.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
          :show-add="hasAuth('system:dept:add')"
          :show-delete="false"
          @add="handleAdd"
          @refresh="getData"
        >
          <template #prefix>
            <NButton v-if="!isCollapse" :disabled="!data.length" size="small" @click="expandAll">
              <template #icon>
                <icon-quill-expand />
              </template>
              {{ $t('page.system.dept.expandAll') }}
            </NButton>
            <NButton v-if="isCollapse" :disabled="!data.length" size="small" @click="collapseAll">
              <template #icon>
                <icon-quill-collapse />
              </template>
              {{ $t('page.system.dept.collapseAll') }}
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
        :row-key="row => row.dept_id"
        class="sm:h-full"
      />
      <DeptOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
