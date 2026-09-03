<script setup lang="tsx">
import { computed, ref } from 'vue';
import { NDivider, NTag } from 'naive-ui';
import { formatDateTime } from '@sa/utils';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { fetchDeleteNoticeGroup, fetchGetNoticeGroupList } from '@/service/api/alarm';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import NoticeGroupOperateDrawer from './modules/notice-group-operate-drawer.vue';
import NoticeGroupSearch from './modules/notice-group-search.vue';

defineOptions({
  name: 'AlarmNoticeGroup'
});

const NOTICE_TYPE_LABELS: Record<Api.Alarm.NoticeGroupNoticeType, string> = {
  1: $t('alarmNoticeGroup.member')
};

const NOTICE_WAY_LABELS: Record<Api.Alarm.NoticeWay, string> = {
  1: $t('alarmNoticeGroup.sms'),
  2: $t('alarmNoticeGroup.inApp'),
  3: $t('alarmNoticeGroup.app')
};

const appStore = useAppStore();
const { hasAuth } = useAuth();

const searchParams = ref<Api.Alarm.NoticeGroupSearchParams>({
  pageNum: 1,
  pageSize: 15,
  name: null
});

function transformSearchParamsToRequest(params: Api.Alarm.NoticeGroupSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 15;
  const options: CommonType.CommonTypeOptions[] = [{ type: 104, value: '101' }];

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
    api: () => fetchGetNoticeGroupList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Alarm.NoticeGroup>(response),
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
        title: $t('alarmNoticeGroup.name'),
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'notice_type',
        title: $t('alarmNoticeGroup.type'),
        align: 'center',
        minWidth: 120,
        render: row => {
          const noticeType = row.notice?.notice_type ?? row.notice_type;

          return <NTag type="info">{NOTICE_TYPE_LABELS[noticeType] ?? noticeType}</NTag>;
        }
      },
      {
        key: 'user_id_list',
        title: $t('alarmNoticeGroup.receiver'),
        align: 'center',
        minWidth: 180,
        render: row => renderUserTags(row.notice?.user?.user_id_list ?? [])
      },
      {
        key: 'notice_way_list',
        title: $t('alarmNoticeGroup.way'),
        align: 'center',
        minWidth: 160,
        render: row => formatNoticeWays(row.notice?.user?.notice_way_list ?? [])
      },
      {
        key: 'desc',
        title: $t('alarmNoticeGroup.description'),
        align: 'center',
        minWidth: 180,
        ellipsis: {
          tooltip: true
        },
        render: row => row.desc || '-'
      },
      {
        key: 'created_at',
        title: $t('alarmNoticeGroup.createdAt'),
        align: 'center',
        minWidth: 180,
        render: row => (row.created_at ? formatDateTime(row.created_at) : '-')
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 130,
        fixed: 'right',
        render: row => {
          const editBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => edit(row.id)}
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
          if (hasAuth('alarm:notice-group:edit')) buttons.push(editBtn());
          if (hasAuth('alarm:notice-group:delete')) buttons.push(deleteBtn());

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

const baseUserMap = computed<Api.Alarm.NoticeGroupListExtra['base_user_map']>(() => {
  const rawMap = extraData.value?.base_user_map;

  if (!rawMap || typeof rawMap !== 'object') return {};

  return rawMap as Api.Alarm.NoticeGroupListExtra['base_user_map'];
});

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'id', getData);

function renderUserTags(userIdList: CommonType.IdType[]) {
  if (!userIdList.length) return '-';

  return (
    <div class="flex-center flex-wrap gap-4px">
      {userIdList.map(userId => {
        const user = baseUserMap.value[String(userId)];
        const label = user?.username || String(userId);

        return <NTag key={userId}>{label}</NTag>;
      })}
    </div>
  );
}

function formatNoticeWays(noticeWayList: Api.Alarm.NoticeWay[]) {
  if (!noticeWayList.length) return '-';

  return noticeWayList.map(item => NOTICE_WAY_LABELS[item]).join('、');
}

function handleSearch() {
  getDataByPage(1);
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return;

  const { error } = await fetchDeleteNoticeGroup({ id_list: checkedRowKeys.value });
  if (error) return;

  await onBatchDeleted();
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteNoticeGroup({ id_list: [id] });
  if (error) return;

  await onDeleted();
}

function edit(id: CommonType.IdType) {
  handleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NoticeGroupSearch v-model:model="searchParams" @search="handleSearch" />
    <TableRowCheckAlert v-model:checked-row-keys="checkedRowKeys" />
    <NCard
      :title="$t('alarmNoticeGroup.management')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('alarm:notice-group:add')"
          :show-delete="hasAuth('alarm:notice-group:delete')"
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
      <NoticeGroupOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        :base-user-map="baseUserMap"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
