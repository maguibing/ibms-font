<script setup lang="tsx">
import { computed, ref } from 'vue';
import { NCard, NDivider, NImage } from 'naive-ui';
import { StatusTag } from '@sa/materials';
import { formatDateTime } from '@sa/utils';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { useRouterPush } from '@/hooks/common/router';
import { fetchGetProjectSysScreenList } from '@/service/api/visual/screen';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import ProjectSysScreenOperateDrawer from './modules/project-sys-screen-operate-drawer.vue';
import ProjectSysScreenSearch from './modules/project-sys-screen-search.vue';

defineOptions({
  name: 'VisualSysScreen'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();
const { routerPushByKey } = useRouterPush();
const drawerVisible = ref(false);
const editingData = ref<Api.Visual.ProjectSysScreen | null>(null);
const editingCoverUrl = ref('');

const searchParams = ref<Api.Visual.ProjectSysScreenSearchParams>({
  pageNum: 1,
  pageSize: 10,
  name: null
});

function transformSearchParamsToRequest(params: Api.Visual.ProjectSysScreenSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const options: CommonType.CommonTypeOptions[] = [{ type: 51, value: 'true' }];

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

const { columns, columnChecks, data, extraData, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetProjectSysScreenList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Visual.ProjectSysScreen>(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page ?? 1;
      searchParams.value.pageSize = params.pageSize ?? 10;
    },
    columns: () => [
      {
        key: 'index',
        title: $t('common.index'),
        align: 'center',
        width: 64,
        render: (_, index) => index + 1
      },
      {
        key: 'title',
        title: '大屏标题',
        align: 'center',
        minWidth: 180,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'name',
        title: '系统名称',
        align: 'center',
        minWidth: 180,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'cover',
        title: '封面',
        align: 'center',
        minWidth: 160,
        render: row => {
          const coverUrl = getCoverUrl(row.sys_screen_id);

          if (!coverUrl) {
            return '-';
          }

          return (
            <div class="flex-center">
              <NImage src={coverUrl} width={56} height={56} objectFit="cover" />
            </div>
          )
        }
      },
      {
        key: 'status',
        title: '状态',
        align: 'center',
        minWidth: 100,
        render: row => <StatusTag value={row.status} />
      },
      {
        key: 'created_at',
        title: '创建时间',
        align: 'center',
        minWidth: 180,
        render: row => (row.created_at ? formatDateTime(row.created_at) : '-')
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
              onClick={() => handleEdit(row)}
            />
          );

          const tagBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:bookmark-manager-outline"
              tooltipContent="标签管理"
              onClick={() => handleTagManagement(row)}
            />
          );

          const buttons = [];
          if (hasAuth('visual:sys-screen:edit')) buttons.push(editBtn());
          if (hasAuth('visual:sys-screen:view')) buttons.push(tagBtn());

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

const screenExtra = computed<Api.Visual.ProjectSysScreenListExtra>(() => {
  const raw = extraData.value as Partial<Api.Visual.ProjectSysScreenListExtra> | null;

  return {
    sys_screen_map: raw?.sys_screen_map ?? {}
  };
});

function getCoverUrl(sysScreenId: CommonType.IdType) {
  return screenExtra.value.sys_screen_map[String(sysScreenId)]?.url || '';
}

function handleEdit(row: Api.Visual.ProjectSysScreen) {
  editingData.value = row;
  editingCoverUrl.value = getCoverUrl(row.sys_screen_id);
  drawerVisible.value = true;
}

function handleTagManagement(row: Api.Visual.ProjectSysScreen) {
  routerPushByKey('visual_sys-screen-tag', {
    query: {
      project_sys_screen_id: String(row.id)
    }
  });
}

function handleSearch() {
  getDataByPage(1);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ProjectSysScreenSearch v-model:model="searchParams" @search="handleSearch" />
    <NCard title="可视化大屏" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
          :show-add="false"
          :show-delete="false"
          :show-export="false"
          @refresh="getData"
        />
      </template>
      <DataTable
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
      <ProjectSysScreenOperateDrawer
        v-model:visible="drawerVisible"
        :row-data="editingData"
        :cover-url="editingCoverUrl"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
