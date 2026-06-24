<script setup lang="tsx">
import { computed, ref } from 'vue';
import { StatusTag, type StatusTagMap } from '@sa/materials';
import { fetchDeleteCorp, fetchGetCorpList, fetchUpdateCorpStatus } from '@/service/api/corp';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import PhoneReveal from '@/components/business/phone-reveal.vue';
import CorpAuditDrawer from './modules/corp-audit-drawer.vue';
import CorpOperateDrawer from './modules/corp-operate-drawer.vue';
import CorpSearch from './modules/corp-search.vue';

defineOptions({
  name: 'CorpList'
});

const appStore = useAppStore();

const AUDIT_PASS_STATUS = 2;
const PENDING_AUDIT_STATUS = 1;
const ENABLE_STATUS = 1;
const DISABLE_STATUS = 2;

const CORP_AUDIT_STATUS_MAP: StatusTagMap = {
  '1': {
    label: '审核中',
    type: 'warning'
  },
  '3': {
    label: '已拒绝',
    type: 'error'
  }
};

const CORP_STATUS_MAP: StatusTagMap = {
  '1': {
    label: '启用',
    type: 'success'
  },
  '2': {
    label: '停用',
    type: 'default'
  }
};

function renderCorpStatusTag(row: Api.System.Corp) {
  if (row.audit_status !== AUDIT_PASS_STATUS) {
    return <StatusTag value={row.audit_status} statusMap={CORP_AUDIT_STATUS_MAP} />;
  }

  return <StatusTag value={row.status} statusMap={CORP_STATUS_MAP} />;
}

function createDefaultCorpSearchParams(): Api.System.CorpSearchParams {
  return {
    pageNum: 1,
    pageSize: 10,
    name: null,
    contact_name: null,
    contact_phone: null
  };
}

function transformCorpSearchParamsToRequest(
  params: Api.System.CorpSearchParams
): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs = [
    { type: 104, value: '101' },
    { type: 1, value: params.name },
    { type: 4, value: params.contact_name },
    { type: 5, value: params.contact_phone }
  ];

  const options = filterConfigs
    .filter((item): item is { type: number; value: string } => Boolean(item.value))
    .map(({ type, value }) => ({ type, value }));

  return {
    list_option: {
      options,
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    },
    options: [{ key: 1 }, { key: 2 }, { key: 3 }]
  };
}


const searchParams = ref<Api.System.CorpSearchParams>(createDefaultCorpSearchParams());
const auditDrawerVisible = ref(false);
const auditCorpId = ref<CommonType.IdType | null>(null);

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX, extraData } =
  useNaivePaginatedTable({
    api: () => fetchGetCorpList(transformCorpSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.System.Corp>(response),
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
        title: '集成商名称',
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'contact_name',
        title: '联系人',
        align: 'center',
        minWidth: 120,
        render: row => getContactUser(row)?.username || '-'
      },
      {
        key: 'contact_phone',
        title: '联系电话',
        align: 'center',
        minWidth: 180,
        render: row => <PhoneReveal userId={row.contact_id} maskedPhone={getContactUser(row)?.phone} />
      },
      {
        key: 'address',
        title: '详细地址',
        align: 'center',
        minWidth: 220,
        ellipsis: {
          tooltip: true
        },
        render: row => row.address || '-'
      },
      {
        key: 'email',
        title: '邮箱',
        align: 'center',
        minWidth: 180,
        ellipsis: {
          tooltip: true
        },
        render: row => getContactUser(row)?.email || '-'
      },
      {
        key: 'audit_status',
        title: '状态',
        align: 'center',
        minWidth: 100,
        render: row => renderCorpStatusTag(row)
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 120,
        render: row => {
          const statusBtn = () => {
            const isEnabled = row.status === ENABLE_STATUS;
            const nextStatus = isEnabled ? DISABLE_STATUS : ENABLE_STATUS;
            const text = isEnabled ? '停用' : '启用';

            return (
              <ButtonIcon
                text
                type={isEnabled ? 'error' : 'primary'}
                icon={isEnabled ? 'material-symbols:pause-circle-outline' : 'material-symbols:play-circle-outline'}
                tooltipContent={text}
                popconfirmContent={`确认${text}该集成商吗？`}
                onPositiveClick={() => handleUpdateStatus(row.id, nextStatus)}
              />
            );
          };

          const auditBtn = () => {
            return (
              <ButtonIcon
                text
                type="primary"
                icon="material-symbols:fact-check-outline"
                tooltipContent="审核"
                onClick={() => handleAudit(row.id)}
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

          if (row.audit_status === PENDING_AUDIT_STATUS) {
            buttons.push(auditBtn());
          } else {
            if (row.audit_status === AUDIT_PASS_STATUS) {
              buttons.push(statusBtn());
            }

            buttons.push(deleteBtn());
          }

          return <div class="flex-center gap-8px">{
            buttons.map((btn, index) => (
              <>
                {index !== 0 && <NDivider vertical />}
                {btn}
              </>
            ))
            }</div>;
        }
      }
    ]
  });

const { drawerVisible, handleAdd, checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);

const corpExtra = computed<Api.System.CorpListExtra>(() => {
  const raw = extraData.value as Partial<Api.System.CorpListExtra> | null;

  return {
    base_user_map: raw?.base_user_map ?? {}
  };
});

function getContactUser(row: Api.System.Corp) {
  return corpExtra.value.base_user_map[String(row.contact_id)];
}

function handleAudit(id: CommonType.IdType) {
  auditCorpId.value = id;
  auditDrawerVisible.value = true;
}

async function handleUpdateStatus(id: CommonType.IdType, status: number) {
  const { error } = await fetchUpdateCorpStatus({ id, status });
  if (error) return;

  window.$message?.success('状态修改成功');
  getData();
}

async function handleBatchDelete() {
  const { error } = await fetchDeleteCorp({ id_list: checkedRowKeys.value });
  if (error) return;

  onBatchDeleted();
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteCorp({ id_list: [id] });
  if (error) return;

  onDeleted();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <CorpSearch v-model:model="searchParams" @search="getDataByPage" />

    <NCard title="集成商列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
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
      <CorpOperateDrawer v-model:visible="drawerVisible" @submitted="getDataByPage" />
      <CorpAuditDrawer v-model:visible="auditDrawerVisible" :row-id="auditCorpId" @submitted="getData" />
    </NCard>
  </div>
</template>

<style scoped></style>
