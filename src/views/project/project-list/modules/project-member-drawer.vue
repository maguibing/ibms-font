<script setup lang="tsx">
import { computed, reactive, ref } from 'vue';
import { NSwitch, NTag } from 'naive-ui';
import type { PaginationProps } from 'naive-ui';
import { formatDateTime } from '@sa/utils';
import { fetchGetProjectUserList, fetchUpdateProjectUser } from '@/service/api/sys-screen';
import PhoneReveal from '@/components/business/phone-reveal.vue';
import { $t } from '@/locales';

defineOptions({
  name: 'ProjectMemberDrawer'
});

const visible = ref(false);
const loading = ref(false);
const project = ref<Api.System.Project | null>(null);
const data = ref<Api.System.ProjectUser[]>([]);
const leaderMap = ref<Record<string, boolean>>({});
const statusLoadingMap = ref<Record<string, boolean>>({});
const searchModel = reactive({
  username: ''
});

const ENABLE_STATUS: Api.System.ProjectUserStatus = 1;
const DISABLE_STATUS: Api.System.ProjectUserStatus = 2;
const DEFAULT_NUMBER_VALUE = 0;
const DEFAULT_STRING_VALUE = '';

const drawerTitle = computed(() => {
  return project.value ? `项目成员：${project.value.name}` : '项目成员';
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 30, 50],
  prefix: page => $t('datatable.itemCount', { total: page.itemCount }),
  onUpdatePage(page) {
    pagination.page = page;
    void getData();
  },
  onUpdatePageSize(pageSize) {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    void getData();
  }
}) as PaginationProps;

const columns: NaiveUI.TableColumn<Api.System.ProjectUser>[] = [
  {
    key: 'username',
    title: '成员名称',
    align: 'center',
    minWidth: 60,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'phone',
    title: '手机号',
    align: 'center',
    minWidth: 80,
    render: row => <PhoneReveal userId={row.user_id} maskedPhone={row.phone} />
  },
  {
    key: 'status',
    title: '状态',
    align: 'center',
    minWidth: 60,
    render: row => renderStatus(row.status)
  },
  {
    key: 'created_at',
    title: '创建时间',
    align: 'center',
    minWidth: 100,
    render: row => (row.created_at ? formatDateTime(row.created_at) : '-')
  },
  {
    key: 'operate',
    title: '操作',
    align: 'center',
    minWidth: 80,
    render: row => {
      const rowKey = getRowKey(row);
      const disabled = isLeader(row);

      return (
        <NSwitch
          value={normalizeStatus(row.status)}
          checkedValue={ENABLE_STATUS}
          uncheckedValue={DISABLE_STATUS}
          disabled={disabled}
          loading={statusLoadingMap.value[rowKey]}
          rubberBand={false}
          onUpdateValue={status => handleUpdateStatus(row, normalizeStatus(status))}
        >
          {{
            checked: () => '启用',
            unchecked: () => '停用'
          }}
        </NSwitch>
      );
    }
  }
];

function renderStatus(status?: number | string) {
  const statusValue = getStatusValue(status);

  if (statusValue === ENABLE_STATUS) {
    return <NTag type="success">启用</NTag>;
  }

  if (statusValue === DISABLE_STATUS) {
    return <NTag type="default">停用</NTag>;
  }

  return status ?? '-';
}

function resetData() {
  data.value = [];
  leaderMap.value = {};
  statusLoadingMap.value = {};
  pagination.page = 1;
  pagination.itemCount = 0;
}

function getStatusValue(status: unknown) {
  const value = Number(status);

  if (value === ENABLE_STATUS || value === DISABLE_STATUS) {
    return value as Api.System.ProjectUserStatus;
  }

  return null;
}

function normalizeStatus(status: unknown): Api.System.ProjectUserStatus {
  return getStatusValue(status) ?? DISABLE_STATUS;
}

function getRowKey(row: Api.System.ProjectUser) {
  return String(row.user_id);
}

function isLeader(row: Api.System.ProjectUser) {
  return Boolean(leaderMap.value[getRowKey(row)]);
}

function setStatusLoading(row: Api.System.ProjectUser, value: boolean) {
  statusLoadingMap.value = {
    ...statusLoadingMap.value,
    [getRowKey(row)]: value
  };
}

function createUpdateParams(
  row: Api.System.ProjectUser,
  status: Api.System.ProjectUserStatus
): Api.System.ProjectUserUpdateParams {
  return {
    dept_id: row.dept_id ?? DEFAULT_NUMBER_VALUE,
    email: row.email ?? DEFAULT_STRING_VALUE,
    gender: row.gender ?? DEFAULT_NUMBER_VALUE,
    role_id: row.role_id ?? DEFAULT_NUMBER_VALUE,
    status,
    user_id: row.user_id,
    username: row.username || DEFAULT_STRING_VALUE
  };
}

function createListOptions() {
  const username = searchModel.username.trim();

  return username ? [{ type: 4, value: username }] : [{}];
}

async function getData() {
  if (!project.value) return;

  const projectId = project.value.id;
  const page = pagination.page ?? 1;
  const pageSize = pagination.pageSize ?? 10;

  loading.value = true;

  try {
    const { data: response, error } = await fetchGetProjectUserList({
      list_option: {
        options: createListOptions(),
        offset: (page - 1) * pageSize,
        limit: pageSize
      },
      options: [{ key: 1 }],
      project_id: projectId
    });

    if (project.value?.id !== projectId || error || !response) return;

    data.value = response.list ?? [];
    leaderMap.value = response.leader_map ?? {};
    pagination.itemCount = response.paginate?.total ?? 0;
  } finally {
    if (project.value?.id === projectId) {
      loading.value = false;
    }
  }
}

async function handleUpdateStatus(row: Api.System.ProjectUser, status: Api.System.ProjectUserStatus) {
  if (isLeader(row) || normalizeStatus(row.status) === status) return;

  setStatusLoading(row, true);

  try {
    const { error } = await fetchUpdateProjectUser(createUpdateParams(row, status));
    if (error) return;

    row.status = status;
    window.$message?.success('状态修改成功');
    await getData();
  } finally {
    setStatusLoading(row, false);
  }
}

function handleSearch() {
  pagination.page = 1;
  void getData();
}

function handleResetSearch() {
  searchModel.username = '';
  handleSearch();
}

function open(row: Api.System.Project) {
  project.value = row;
  visible.value = true;
  searchModel.username = '';
  resetData();
  void getData();
}

defineExpose({
  open
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="900" class="max-w-90%">
    <NDrawerContent :title="drawerTitle" :native-scrollbar="false" closable>
      <NForm :model="searchModel" label-placement="left" :show-feedback="false" class="mb-16px">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi span="24 s:12 m:8" label="成员名称" label-width="auto" class="pr-24px">
            <NInput
              v-model:value="searchModel.username"
              clearable
              placeholder="请输入成员名称"
              @keyup.enter="handleSearch"
            />
          </NFormItemGi>
          <NFormItemGi :show-feedback="false" span="24 s:12 m:16" class="pr-24px">
            <NSpace>
              <NButton type="primary" @click="handleSearch">查询</NButton>
              <NButton @click="handleResetSearch">重置</NButton>
            </NSpace>
          </NFormItemGi>
        </NGrid>
      </NForm>
      <DataTable
        :columns="columns"
        :data="data"
        :loading="loading"
        :row-key="row => row.user_id"
        :pagination="pagination"
        :scroll-x="780"
        remote
      />
    </NDrawerContent>
  </NDrawer>
</template>
