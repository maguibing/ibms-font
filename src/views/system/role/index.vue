<script setup lang="tsx">
import { ref } from 'vue';
import { NDivider, NTag } from 'naive-ui';
import { type FilterConfig, formatDateTime, isValidFilterConfig, jsonClone } from '@sa/utils';
import { useBoolean } from '@sa/hooks';
import { dataScopeRecord } from '@/constants/business';
import { fetchBatchDeleteRole, fetchGetRoleList } from '@/service/api/system/role';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import RoleOperateDrawer from './modules/role-operate-drawer.vue';
import RolePermissionsDrawer from './modules/role-permissions-drawer.vue';
import RoleSearch from './modules/role-search.vue';

defineOptions({
  name: 'RoleList'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();

const { bool: permissionsDrawerVisible, setTrue: openPermissionsDrawer } = useBoolean(false);

const searchParams = ref<Api.System.RoleSearchParams>({
  pageNum: 1,
  pageSize: 10,
  name: null
});

/** 将 RoleSearchParams 转换为 CommonListQueryParams */
function transformSearchParamsToRequest(params: Api.System.RoleSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;

  const filterConfigs: FilterConfig[] = [{ type: 1, value: params.name }];

  const options = filterConfigs.filter(isValidFilterConfig).map(({ type, value }) => ({ type, value }));

  return {
    list_option: {
      options,
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    },
    options: [{ key: 1 }, { key: 2 }, { key: 3 }]
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetRoleList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.System.Role>(response),
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
        title: '角色名称',
        align: 'center',
        minWidth: 120
      },
      {
        key: 'role_type',
        title: '角色类型',
        align: 'center',
        minWidth: 100,
        render: row => {
          const isSuperAdmin = row.role_type === 1;
          return <NTag type={isSuperAdmin ? 'success' : 'default'}>{isSuperAdmin ? '系统管理员' : '普通成员'}</NTag>;
        }
      },
      {
        key: 'data_scope',
        title: '数据范围',
        align: 'center',
        minWidth: 180,
        render: row => {
          return <NTag type="info">{dataScopeRecord[String(row.data_scope) as Api.System.DataScope] || '-'}</NTag>;
        }
      },
      {
        key: 'desc',
        title: '备注',
        align: 'center',
        minWidth: 160
      },
      {
        key: 'created_at',
        title: '创建时间',
        align: 'center',
        minWidth: 160,
        render: row => formatDateTime(row.created_at)
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 150,
        render: row => {
          if (row.role_type === 1) return null;

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

          const dataScopeBtn = () => {
            return (
              <ButtonIcon
                text
                type="primary"
                icon="material-symbols:database"
                tooltipContent="数据范围权限"
                onClick={() => handleMenuAuthScope(row)}
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

          const buttons = [];
          if (hasAuth('system:role:edit')) {
            buttons.push(editBtn());
            buttons.push(dataScopeBtn());
          }
          if (hasAuth('system:role:remove')) buttons.push(deleteBtn());

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
  // request
  const { error } = await fetchBatchDeleteRole({ id_list: checkedRowKeys.value });
  if (error) return;
  onBatchDeleted();
}

async function handleDelete(id: CommonType.IdType) {
  // request
  const { error } = await fetchBatchDeleteRole({ id_list: [id] });
  if (error) return;
  onDeleted();
}

async function edit(roleId: CommonType.IdType) {
  handleEdit(roleId);
}


function handleMenuAuthScope(row: Api.System.Role) {
  const findItem = data.value.find(item => item.id === row.id) || null;
  editingData.value = jsonClone(findItem);
  openPermissionsDrawer();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <RoleSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard title="角色列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('system:role:add')"
          :show-delete="hasAuth('system:role:remove')"
          :show-export="false"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </template>
      <NDataTable
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
        class="sm:h-full"
      />

      <RoleOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getData"
      />

      <RolePermissionsDrawer v-model:visible="permissionsDrawerVisible" :row-data="editingData" @submitted="getData" />
    </NCard>
  </div>
</template>

<style scoped></style>
