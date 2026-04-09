<script setup lang="tsx">
import { computed, h, ref } from 'vue';
import { NAvatar, NButton, NDivider, NEllipsis } from 'naive-ui';
import { useBoolean, useLoading } from '@sa/hooks';
import { type FilterConfig, formatDateTime, isValidFilterConfig } from '@sa/utils';
import { StatusTag } from '@sa/materials';
import {
  fetchBatchDeleteUser,
  fetchGetDeptTree,
  fetchGetPhone,
  fetchGetUserList,
  fetchResetPassword
} from '@/service/api/system';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { useAuth } from '@/hooks/business/auth';
import { useDownload } from '@/hooks/business/download';
import ButtonIcon from '@/components/custom/button-icon.vue';
import { $t } from '@/locales';
import UserOperateDrawer from './modules/user-operate-drawer.vue';
import UserImportModal from './modules/user-import-modal.vue';
import UserSearch from './modules/user-search.vue';

defineOptions({
  name: 'UserList'
});

const { hasAuth } = useAuth();
const appStore = useAppStore();
const { download } = useDownload();

const { bool: importVisible, setTrue: openImportModal } = useBoolean();
const DEFAULT_RESET_PASSWORD = '123456789##';

const searchParams = ref<Api.System.UserSearchParams>({
  pageNum: 1,
  pageSize: 10,
  username: '',
  phone: '',
  dept_id: undefined,
  dateRange: null
});

const phoneVisibleMap = ref<Record<string, boolean>>({});
const phoneLoadingMap = ref<Record<string, boolean>>({});
const phoneValueMap = ref<Record<string, string>>({});

function getPhoneMapKey(userId: CommonType.IdType) {
  return String(userId);
}

function isPhoneVisible(userId: CommonType.IdType) {
  return Boolean(phoneVisibleMap.value[getPhoneMapKey(userId)]);
}

function isPhoneLoading(userId: CommonType.IdType) {
  return Boolean(phoneLoadingMap.value[getPhoneMapKey(userId)]);
}

function getDisplayPhone(row: Api.System.User) {
  const key = getPhoneMapKey(row.user_id);
  const realPhone = phoneValueMap.value[key];

  if (isPhoneVisible(row.user_id) && realPhone) {
    return realPhone;
  }

  return row.phone || '-';
}

async function handleTogglePhone(row: Api.System.User) {
  const key = getPhoneMapKey(row.user_id);

  if (isPhoneLoading(row.user_id)) {
    return;
  }

  if (isPhoneVisible(row.user_id)) {
    phoneVisibleMap.value[key] = false;
    return;
  }

  if (!phoneValueMap.value[key]) {
    phoneLoadingMap.value[key] = true;
    const { data: phoneData, error } = await fetchGetPhone({ user_id: row.user_id });
    phoneLoadingMap.value[key] = false;

    if (error || !phoneData?.phone) {
      return;
    }

    phoneValueMap.value[key] = phoneData.phone;
  }

  phoneVisibleMap.value[key] = true;
}
/** 将 UserSearchParams 转换为 CommonListQueryParams */
function transformSearchParamsToRequest(params: Api.System.UserSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;

  const dateRangeValue =
    Array.isArray(params.dateRange) && params.dateRange.length === 2
      ? `${params.dateRange[0]},${params.dateRange[1]}`
      : null;

  const filterConfigs: FilterConfig[] = [
    { type: 51, value: 'true' },
    { type: 4, value: params.username },
    { type: 109, value: params.phone },
    { type: 5, value: params.dept_id?.toString() },
    { type: 103, value: dateRangeValue }
  ];

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

const userExtra = computed<Api.System.UserListExtra>(() => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const raw = extraData.value as Partial<Api.System.UserListExtra> | null;
  return {
    dept_info_map: raw?.dept_info_map ?? {},
    role_info_map: raw?.role_info_map ?? {},
    user_data_scope_map: raw?.user_data_scope_map ?? {}
  };
});

const {
  columns,
  columnChecks,
  data,
  getData,
  getDataByPage,
  loading,
  mobilePagination,
  scrollX,
  extraData,
  pagination
} = useNaivePaginatedTable({
  api: () => fetchGetUserList(transformSearchParamsToRequest(searchParams.value)),
  transform: response => defaultTransform<Api.System.User>(response),
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
      key: 'username',
      title: $t('page.system.user.userName'),
      align: 'left',
      width: 150,
      ellipsis: true,
      render: row => {
        return (
          <div class="flex items-center justify-center gap-2">
            <NAvatar class="bg-primary">{row.username?.charAt(0)}</NAvatar>
            <div class="max-w-160px flex flex-col">
              <NEllipsis>{row.username}</NEllipsis>
            </div>
          </div>
        );
      }
    },
    {
      key: 'dept_id',
      title: $t('page.system.user.deptName'),
      align: 'center',
      width: 120,
      ellipsis: true,
      render: row => userExtra.value.dept_info_map[String(row.dept_id)]?.name ?? '-'
    },
    {
      key: 'role_id',
      title: $t('page.system.user.roleName'),
      align: 'center',
      width: 120,
      ellipsis: true,
      render: row => userExtra.value.role_info_map[String(row.role_id)]?.name ?? '-'
    },
    {
      key: 'email',
      title: $t('page.system.user.email'),
      align: 'center',
      width: 120,
      ellipsis: true
    },
    {
      key: 'phone',
      title: $t('page.system.user.phonenumber'),
      align: 'center',
      width: 180,
      render: row => {
        const visible = isPhoneVisible(row.user_id);

        return (
          <div class="flex-center gap-4px">
            <NEllipsis class="max-w-120px">{getDisplayPhone(row)}</NEllipsis>
            <ButtonIcon
              text
              loading={isPhoneLoading(row.user_id)}
              icon={visible ? 'material-symbols:visibility-off-outline' : 'material-symbols:visibility-outline'}
              tooltipContent={visible ? '隐藏手机号' : '显示手机号'}
              onClick={() => handleTogglePhone(row)}
            />
          </div>
        );
      }
    },
    {
      key: 'status',
      title: $t('page.system.user.status'),
      align: 'center',
      width: 80,
      render(row) {
        return <StatusTag value={row.status} />;
      }
    },
    {
      key: 'created_at',
      title: $t('page.system.user.createTime'),
      align: 'center',
      width: 160,
      render: row => formatDateTime(row.created_at)
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 150,
      render: row => {
        const editBtn = () => {
          return (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => edit(row.user_id)}
            />
          );
        };

        const passwordBtn = () => {
          return (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:key-vertical-outline"
              tooltipContent="重置密码"
              onClick={() => handleResetPwd(row.user_id)}
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
              onPositiveClick={() => handleDelete(row.user_id)}
            />
          );
        };

        const buttons = [];
        if (hasAuth('system:user:edit')) buttons.push(editBtn());
        if (hasAuth('system:user:resetPwd')) buttons.push(passwordBtn());
        if (hasAuth('system:user:remove')) buttons.push(deleteBtn());

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
  useTableOperate(data, 'user_id', getData);

function shouldFallbackToPrevPage(deletingCount: number) {
  const currentPage = pagination.page ?? 1;

  return currentPage > 1 && data.value.length > 0 && data.value.length <= deletingCount;
}

async function refreshAfterDelete(deletingCount: number, isBatch: boolean) {
  const currentPage = pagination.page ?? 1;

  if (shouldFallbackToPrevPage(deletingCount)) {
    if (isBatch) {
      checkedRowKeys.value = [];
    }

    window.$message?.success($t('common.deleteSuccess'));
    await getDataByPage(currentPage - 1);
    return;
  }

  if (isBatch) {
    await onBatchDeleted();
    return;
  }

  await onDeleted();
}

async function handleBatchDelete() {
  const deletingCount = checkedRowKeys.value.length;
  // request
  const { error } = await fetchBatchDeleteUser({ id_list: checkedRowKeys.value });
  if (error) return;
  await refreshAfterDelete(deletingCount, true);
}

async function handleDelete(userId: CommonType.IdType) {
  // request
  const { error } = await fetchBatchDeleteUser({ id_list: [userId] });
  if (error) return;
  await refreshAfterDelete(1, false);
}

async function edit(userId: CommonType.IdType) {
  handleEdit(userId);
}

async function handleResetPwd(userId: CommonType.IdType) {
  window.$dialog?.warning({
    title: '重置密码确认',
    positiveText: '确认重置',
    negativeText: $t('common.cancel'),
    content: () =>
      h('div', [
        h('span', '确认将该用户密码重置为 '),
        h(
          'span',
          {
            style: {
              color: '#d03050',
              fontWeight: 700
            }
          },
          DEFAULT_RESET_PASSWORD
        ),
        h('span', ' 吗？')
      ]),
    onPositiveClick: async () => {
      const { error } = await fetchResetPassword({ user_id: userId });
      if (error) return;
      window.$message?.success(`密码已重置为 ${DEFAULT_RESET_PASSWORD}`);
      await getData();
    }
  });
}

const { loading: treeLoading, startLoading: startTreeLoading, endLoading: endTreeLoading } = useLoading();
const deptPattern = ref<string>();
const deptData = ref<Api.Common.DeptNode[]>([]);
const selectedKeys = ref<string[]>([]);

async function getTreeData() {
  startTreeLoading();
  const { data: tree, error } = await fetchGetDeptTree({ options: [{ key: 1 }] });
  if (!error) {
    deptData.value = tree.trees;
  }
  endTreeLoading();
}

getTreeData();

function handleClickTree(keys: string[]) {
  searchParams.value.dept_id = keys.length ? Number(keys[0]) : null;
  checkedRowKeys.value = [];
  getDataByPage();
}

function handleResetTreeData() {
  deptPattern.value = undefined;
  getTreeData();
}

function handleImport() {
  openImportModal();
}

function handleExport() {
  download('/system/user/export', searchParams.value, `${$t('page.system.user.title')}_${new Date().getTime()}.xlsx`);
}

const expandedKeys = ref<CommonType.IdType[]>([100]);

const selectable = computed(() => {
  return !loading.value;
});

function handleResetSearch() {
  selectedKeys.value = [];
  getDataByPage();
}
</script>

<template>
  <TableSiderLayout :sider-title="$t('page.system.dept.title')">
    <template #header-extra>
      <NButton size="small" text class="h-18px" @click.stop="() => handleResetTreeData()">
        <template #icon>
          <SvgIcon icon="ic:round-refresh" />
        </template>
      </NButton>
    </template>
    <template #sider>
      <NInput v-model:value="deptPattern" clearable :placeholder="$t('common.keywordSearch')" />
      <NSpin class="dept-tree" :show="treeLoading">
        <NTree
          v-model:expanded-keys="expandedKeys"
          v-model:selected-keys="selectedKeys"
          block-node
          show-line
          :data="deptData as []"
          :default-expanded-keys="deptData?.length ? [deptData[0].dept_id] : []"
          :show-irrelevant-nodes="false"
          :pattern="deptPattern"
          class="infinite-scroll h-full min-h-200px py-3"
          key-field="dept_id"
          label-field="dept_name"
          virtual-scroll
          :selectable="selectable"
          @update:selected-keys="handleClickTree"
        >
          <template #empty>
            <NEmpty :description="$t('page.system.dept.empty')" class="h-full min-h-200px justify-center" />
          </template>
        </NTree>
      </NSpin>
    </template>
    <div class="h-full flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto">
      <UserSearch v-model:model="searchParams" @reset="handleResetSearch" @search="getDataByPage" />
      <TableRowCheckAlert v-model:checked-row-keys="checkedRowKeys" />
      <NCard :title="$t('page.system.user.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
        <template #header-extra>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            :show-add="hasAuth('system:user:add')"
            :show-delete="hasAuth('system:user:remove')"
            :show-export="hasAuth('system:user:export')"
            @add="handleAdd"
            @delete="handleBatchDelete"
            @export="handleExport"
            @refresh="getData"
          >
            <template #after>
              <NButton v-if="hasAuth('system:user:import')" size="small" ghost @click="handleImport">
                <template #icon>
                  <icon-material-symbols-upload-rounded class="text-icon" />
                </template>
                {{ $t('common.import') }}
              </NButton>
            </template>
          </TableHeaderOperation>
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
          :row-key="row => row.user_id"
          :pagination="mobilePagination"
          class="h-full"
        />
        <UserImportModal v-model:visible="importVisible" @submitted="getData" />
        <UserOperateDrawer
          v-model:visible="drawerVisible"
          :operate-type="operateType"
          :row-data="editingData"
          :dept-data="deptData"
          :dept-id="searchParams.dept_id"
          @submitted="getDataByPage"
        />
      </NCard>
    </div>
  </TableSiderLayout>
</template>

<style scoped lang="scss">
.dept-tree {
  .n-button {
    --n-padding: 8px !important;
  }

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

:deep(.n-data-table-wrapper),
:deep(.n-data-table-base-table),
:deep(.n-data-table-base-table-body) {
  height: 100%;
}

@media screen and (max-width: 800px) {
  :deep(.n-data-table-base-table-body) {
    max-height: calc(100vh - 400px - var(--calc-footer-height, 0px));
  }
}

@media screen and (max-width: 802px) {
  :deep(.n-data-table-base-table-body) {
    max-height: calc(100vh - 473px - var(--calc-footer-height, 0px));
  }
}

:deep(.n-card-header__main) {
  min-width: 69px !important;
}
</style>
