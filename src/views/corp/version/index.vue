<script setup lang="tsx">
import { computed, ref, useTemplateRef } from 'vue';
import { NDivider, NTag, NTime } from 'naive-ui';
import { type FilterConfig, isValidFilterConfig } from '@sa/utils';
import { fetchDeleteVersion, fetchGetCorpList, fetchGetVersionList } from '@/service/api/corp';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import ButtonIcon from '@/components/custom/button-icon.vue';
import VersionOperateDrawer from '@/components/custom/version-operate-drawer.vue';
import { $t } from '@/locales';
import VersionBenefitDrawer from './modules/version-benefit-drawer.vue';

defineOptions({
  name: 'CorpVersion'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();

const searchParams = ref<Api.System.CorpProjectVersionSearchParams>(createDefaultSearchParams());
const operateDrawerRef = useTemplateRef<InstanceType<typeof VersionOperateDrawer>>('operateDrawerRef');
const benefitDrawerRef = useTemplateRef<InstanceType<typeof VersionBenefitDrawer>>('benefitDrawerRef');

function createDefaultSearchParams(): Api.System.CorpProjectVersionSearchParams {
  return {
    pageNum: 1,
    pageSize: 10,
    name: null,
    corp_id: null
  };
}

function transformSearchParamsToRequest(
  params: Api.System.CorpProjectVersionSearchParams
): Api.System.CorpProjectVersionListParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs: FilterConfig[] = [
    { type: 104, value: '101' },
    { type: 1, value: params.name },
    { type: 2, value: params.corp_id?.toString() }
  ];

  const options = filterConfigs.filter(isValidFilterConfig).map(({ type, value }) => ({ type, value }));

  return {
    list_option: {
      options,
      offset: (pageNum - 1) * pageSize,
      limit: pageSize
    },
    options: [{ key: 1 }, { key: 2 }, { key: 4 }]
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX, extraData } =
  useNaivePaginatedTable({
    api: () => fetchGetVersionList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.System.CorpProjectVersion>(response),
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
        title: $t('page.corp.version.versionName'),
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'corp_id',
        title: $t('page.corp.version.corp'),
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        },
        render: row => getCorpName(row.corp_id)
      },
      {
        key: 'status',
        title: $t('page.corp.common.status'),
        align: 'center',
        minWidth: 100,
        render: row => (
          <NTag type={row.corp_id ? 'success' : 'warning'}>
            {row.corp_id ? $t('page.corp.version.using') : $t('page.corp.version.unassigned')}
          </NTag>
        )
      },
      {
        key: 'start_at',
        title: $t('page.corp.version.startTime'),
        align: 'center',
        minWidth: 180,
        render: row => <NTime time={row.start_at} unix />
      },
      {
        key: 'end_at',
        title: $t('page.corp.version.endTime'),
        align: 'center',
        minWidth: 180,
        render: row => <NTime time={row.end_at} unix />
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 180,
        render: row => {
          const benefitBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:fact-check-outline"
              tooltipContent={$t('page.corp.version.benefitView')}
              onClick={() => handleViewBenefit(row)}
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
          buttons.push(benefitBtn());
          if (hasAuth('corp:version:edit')) buttons.push(editBtn());
          if (hasAuth('corp:version:delete')) buttons.push(deleteBtn());

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

const versionExtra = computed<Api.System.CorpProjectVersionListExtra>(() => {
  const raw = extraData.value as Partial<Api.System.CorpProjectVersionListExtra> | null;

  return {
    random_map: raw?.random_map ?? {},
    all_map: raw?.all_map ?? {},
    corp_map: raw?.corp_map ?? {}
  };
});

const corpSelectRequestParams: CommonType.CommonListQueryParams = {
  list_option: {
    options: [{ type: 104, value: '101' }]
  },
  options: [{ key: 1 }, { key: 2 }, { key: 3 }]
};

function getCorpName(corpId?: CommonType.IdType) {
  if (!corpId) return '-';

  return versionExtra.value.corp_map[String(corpId)]?.name || '-';
}

function handleSearch() {
  getDataByPage();
}

function handleReset() {
  const pageSize = searchParams.value.pageSize || 10;

  Object.assign(searchParams.value, {
    ...createDefaultSearchParams(),
    pageSize
  });
  getDataByPage();
}

function handleAdd() {
  operateDrawerRef.value?.openAdd();
}

function handleEdit(row: Api.System.CorpProjectVersion) {
  operateDrawerRef.value?.openEdit(row, getCorpName(row.corp_id));
}

function handleViewBenefit(row: Api.System.CorpProjectVersion) {
  benefitDrawerRef.value?.open({
    row,
    corpName: getCorpName(row.corp_id),
    randomList: versionExtra.value.random_map[String(row.id)]?.random_list ?? [],
    allList: versionExtra.value.all_map[String(row.id)]?.all_list ?? []
  });
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteVersion({ id_list: [id] });
  if (error) return;

  onDeleted();
}

async function handleBatchDelete() {
  const { error } = await fetchDeleteVersion({ id_list: checkedRowKeys.value });
  if (error) return;

  onBatchDeleted();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NCollapse>
        <NCollapseItem :title="$t('common.search')" name="corp-version-search">
          <NForm :model="searchParams" label-placement="left" :label-width="100">
            <NGrid responsive="screen" item-responsive>
              <NFormItemGi span="24 s:12 m:8" :label="$t('page.corp.version.versionName')" path="name" class="pr-24px">
                <NInput
                  v-model:value="searchParams.name"
                  :placeholder="$t('page.corp.version.form.versionName.required')"
                  @keyup.enter="handleSearch"
                />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:8" :label="$t('page.corp.version.corp')" path="corp_id" class="pr-24px">
                <RemoteSearchSelect
                  v-model:value="searchParams.corp_id"
                  :request="fetchGetCorpList"
                  :request-params="corpSelectRequestParams"
                  :search-type="1"
                  label-field="name"
                  value-field="id"
                  :placeholder="$t('page.corp.version.form.corp.required')"
                  clearable
                />
              </NFormItemGi>
              <NFormItemGi :show-feedback="false" span="24 s:12 m:8" class="pr-24px">
                <NSpace class="w-full" justify="end">
                  <NButton type="primary" ghost @click="handleSearch">
                    <template #icon>
                      <icon-ic-round-search class="text-icon" />
                    </template>
                    {{ $t('common.search') }}
                  </NButton>
                  <NButton @click="handleReset">
                    <template #icon>
                      <icon-ic-round-refresh class="text-icon" />
                    </template>
                    {{ $t('common.reset') }}
                  </NButton>
                </NSpace>
              </NFormItemGi>
            </NGrid>
          </NForm>
        </NCollapseItem>
      </NCollapse>
    </NCard>

    <NCard :title="$t('page.corp.version.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('corp:version:add')"
          :show-delete="hasAuth('corp:version:delete')"
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
    </NCard>

    <VersionOperateDrawer ref="operateDrawerRef" @submitted="getDataByPage" />
    <VersionBenefitDrawer ref="benefitDrawerRef" />
  </div>
</template>

<style scoped></style>
