<script setup lang="tsx">
import { computed, ref, shallowRef } from 'vue';
import { NDivider } from 'naive-ui';
import StatusTag, { type StatusTagMap } from '@/components/custom/status-tag.vue';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { fetchDeleteMessageRule, fetchGetMessageRuleList } from '@/service/api/rule';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import MessageRuleOperateDrawer from './modules/message-rule-operate-drawer.vue';
import MessageRuleSearch from './modules/message-rule-search.vue';

defineOptions({
  name: 'RuleMessageRule'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();

const ruleTypeStatusMap = computed<StatusTagMap>(() => ({
  '1': {
    label: $t('messageRule.report'),
    type: 'info'
  },
  '2': {
    label: $t('messageRule.command'),
    type: 'warning'
  }
}));

const searchParams = ref<Api.Rule.MessageRuleSearchParams>({
  pageNum: 1,
  pageSize: 15,
  name: null
});

function transformSearchParamsToRequest(params: Api.Rule.MessageRuleSearchParams): CommonType.CommonListQueryParams {
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
    }
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetMessageRuleList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Rule.MessageRule>(response),
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
        title: $t('messageRule.name'),
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'rule_type',
        title: $t('messageRule.type'),
        align: 'center',
        minWidth: 100,
        render: row => <StatusTag value={row.rule_type} statusMap={ruleTypeStatusMap.value} />
      },
      {
        key: 'status',
        title: $t('messageRule.status'),
        align: 'center',
        minWidth: 100,
        render: row => <StatusTag value={row.status} />
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 180,
        fixed: 'right',
        render: row => {
          const viewBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:visibility-outline"
              tooltipContent={$t('messageRule.view')}
              onClick={() => handleView(row)}
            />
          );

          const editBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => handleEdit(row)}
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
          if (hasAuth('rule:message-rule:view')) buttons.push(viewBtn());
          if (hasAuth('rule:message-rule:edit')) buttons.push(editBtn());
          if (hasAuth('rule:message-rule:delete')) buttons.push(deleteBtn());

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

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);

type MessageRuleOperateType = 'add' | 'edit' | 'view';

const operateDrawerVisible = shallowRef(false);
const operateType = shallowRef<MessageRuleOperateType>('add');
const editingData = shallowRef<Api.Rule.MessageRule | null>(null);

function handleSearch() {
  getDataByPage(1);
}

function handleAdd() {
  operateType.value = 'add';
  editingData.value = null;
  operateDrawerVisible.value = true;
}

function handleView(row: Api.Rule.MessageRule) {
  operateType.value = 'view';
  editingData.value = row;
  operateDrawerVisible.value = true;
}

function handleEdit(row: Api.Rule.MessageRule) {
  operateType.value = 'edit';
  editingData.value = row;
  operateDrawerVisible.value = true;
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteMessageRule({ id_list: [id] });
  if (error) return;

  checkedRowKeys.value = checkedRowKeys.value.filter(item => item !== id);
  await onDeleted();
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return;

  const { error } = await fetchDeleteMessageRule({ id_list: checkedRowKeys.value });
  if (error) return;

  await onBatchDeleted();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <MessageRuleSearch v-model:model="searchParams" @search="handleSearch" />
    <TableRowCheckAlert v-model:checked-row-keys="checkedRowKeys" />
    <NCard :title="$t('messageRule.management')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('rule:message-rule:add')"
          :show-delete="hasAuth('rule:message-rule:delete')"
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
      <MessageRuleOperateDrawer
        v-model:visible="operateDrawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
