<script setup lang="tsx">
import { computed, h, ref, useTemplateRef } from 'vue';
import { NDivider, NTag } from 'naive-ui';
import { formatDateTime, type FilterConfig, isValidFilterConfig } from '@sa/utils';
import { fetchDeleteProject, fetchGetProjectList } from '@/service/api/sys-screen';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import PhoneReveal from '@/components/business/phone-reveal.vue';
import ButtonIcon from '@/components/custom/button-icon.vue';
import { $t } from '@/locales';
import ProjectMemberDrawer from './modules/project-member-drawer.vue';
import ProjectOperateDrawer from './modules/project-operate-drawer.vue';
import ProjectVersionViewDrawer from './modules/project-version-view-drawer.vue';
import ProjectSearch from './modules/project-search.vue';
import CopyableValue from '@/components/custom/copyable-value.vue';

defineOptions({
  name: 'ProjectProjectList'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();

const searchParams = ref<Api.System.ProjectSearchParams>(createDefaultSearchParams());
const memberDrawerRef = useTemplateRef<InstanceType<typeof ProjectMemberDrawer>>('memberDrawerRef');
const versionViewDrawerRef = useTemplateRef<InstanceType<typeof ProjectVersionViewDrawer>>('versionViewDrawerRef');

function createDefaultSearchParams(): Api.System.ProjectSearchParams {
  return {
    pageNum: 1,
    pageSize: 10,
    name: null
  };
}

function transformSearchParamsToRequest(params: Api.System.ProjectSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs: FilterConfig[] = [
    { type: 104, value: '101' },
    { type: 1, value: params.name }
  ];
  const options = filterConfigs.filter(isValidFilterConfig).map(({ type, value }) => ({ type, value }));

  return {
    list_option: {
      options,
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    },
    options: [{ key: 1 }, { key: 2 }]
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX, extraData } =
  useNaivePaginatedTable({
    api: () => fetchGetProjectList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.System.Project>(response),
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
        title: $t('page.project.list.projectName'),
        align: 'center',
        minWidth: 180,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'key',
        title: $t('page.project.list.key'),
        align: 'center',
        minWidth: 180,
        ellipsis: {
          tooltip: true
        },
        render: row => h(CopyableValue, { value: row.key })
      },
      {
        key: 'address',
        title: $t('page.project.list.address'),
        align: 'center',
        minWidth: 220,
        ellipsis: {
          tooltip: true
        },
        render: row => row.address || row.ad_address || '-'
      },
      {
        key: 'leader_name',
        title: $t('page.project.list.leader'),
        align: 'center',
        minWidth: 120,
        ellipsis: {
          tooltip: true
        },
        render: row => getCorpLeader(row.corp_leader_id)?.username || '-'
      },
      {
        key: 'leader_phone',
        title: $t('page.project.list.contactPhone'),
        align: 'center',
        minWidth: 140,
        render: row => {
          const leader = getCorpLeader(row.corp_leader_id);

          if (!row.corp_leader_id || !leader?.phone) return '-';

          return <PhoneReveal userId={row.corp_leader_id} maskedPhone={leader.phone} />;
        }
      },
      {
        key: 'version_name',
        title: $t('page.project.list.version'),
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        },
        render: row => getProjectVersionName(row.version_id)
      },
      {
        key: 'status',
        title: $t('page.project.list.projectStatus'),
        align: 'center',
        minWidth: 100,
        render: row => renderProjectStatus(row.status)
      },
      {
        key: 'created_at',
        title: $t('page.common.createTime'),
        align: 'center',
        minWidth: 180,
        render: row => (row.created_at ? formatDateTime(row.created_at) : '-')
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 220,
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

          const viewBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:visibility-outline"
              tooltipContent={$t('page.project.list.view')}
              onClick={() => handleView(row)}
            />
          );

          const memberBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:groups-outline"
              tooltipContent={$t('page.project.list.member')}
              onClick={() => handleMembers(row)}
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

          const buttons = [editBtn()];
          if (hasAuth('project:project-list:view')) buttons.push(viewBtn());
          buttons.push(memberBtn());
          if (hasAuth('project:project-list:delete')) buttons.push(deleteBtn());

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

const {
  drawerVisible,
  operateType,
  handleAdd,
  editingData,
  handleEdit: handleTableEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
} = useTableOperate(data, 'id', getData);

const projectExtra = computed<Api.System.ProjectListExtra>(() => {
  const raw = extraData.value as Partial<Api.System.ProjectListExtra> | null;

  return {
    base_user_map: raw?.base_user_map ?? {},
    version_map: raw?.version_map ?? {}
  };
});

const currentEditingData = computed<Api.System.Project | null>(() => {
  if (!editingData.value) return null;

  const leader = getCorpLeader(editingData.value.corp_leader_id);
  const version = editingData.value.version_id
    ? projectExtra.value.version_map[String(editingData.value.version_id)]
    : undefined;

  return {
    ...editingData.value,
    leader_phone: leader?.phone || '',
    leader_username: leader?.username || '',
    version_name: version?.name || ''
  };
});

function renderProjectStatus(status?: number | string) {
  const statusValue = Number(status);

  if (statusValue === 1) {
    return <NTag type="success">{$t('page.project.list.enabled')}</NTag>;
  }

  if (statusValue === 2) {
    return <NTag type="default">{$t('page.project.list.disabled')}</NTag>;
  }

  return status ?? '-';
}

function getCorpLeader(leaderId?: CommonType.IdType) {
  if (!leaderId) return null;

  return projectExtra.value.base_user_map[String(leaderId)] ?? null;
}

function getProjectVersionName(versionId?: CommonType.IdType) {
  if (!versionId) return '-';

  return projectExtra.value.version_map[String(versionId)]?.name || '-';
}

function handleEdit(row: Api.System.Project) {
  handleTableEdit(row.id);
}

function handleView(row: Api.System.Project) {
  versionViewDrawerRef.value?.open(row.version_id);
}

function handleMembers(row: Api.System.Project) {
  memberDrawerRef.value?.open(row);
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteProject({ id_list: [id] });
  if (error) return;

  onDeleted();
}

async function handleBatchDelete() {
  const { error } = await fetchDeleteProject({ id_list: checkedRowKeys.value });
  if (error) return;

  onBatchDeleted();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ProjectSearch v-model:model="searchParams" @search="getDataByPage" />

    <NCard :title="$t('page.project.list.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('project:project-list:add')"
          :show-delete="hasAuth('project:project-list:delete')"
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
      <ProjectOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="currentEditingData"
        @submitted="getDataByPage"
      />
      <ProjectMemberDrawer ref="memberDrawerRef" />
      <ProjectVersionViewDrawer ref="versionViewDrawerRef" />
    </NCard>
  </div>
</template>

<style scoped></style>
