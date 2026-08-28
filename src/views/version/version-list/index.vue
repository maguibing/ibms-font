<script setup lang="tsx">
import { computed, ref, useTemplateRef } from 'vue';
import { NTag, NTime } from 'naive-ui';
import { type FilterConfig, isValidFilterConfig } from '@sa/utils';
import { fetchGetVersionList } from '@/service/api/corp';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import ButtonIcon from '@/components/custom/button-icon.vue';
import { $t } from '@/locales';
import VersionBenefitDrawer from '../../corp/version/modules/version-benefit-drawer.vue';
import VersionSearch from './modules/version-search.vue';

defineOptions({
  name: 'VersionVersionList'
});

type SearchParams = CommonType.RecordNullable<Pick<Api.System.CorpProjectVersion, 'name'> & Api.Common.CommonSearchParams>;

const appStore = useAppStore();

const searchParams = ref<SearchParams>(createDefaultSearchParams());
const benefitDrawerRef = useTemplateRef<InstanceType<typeof VersionBenefitDrawer>>('benefitDrawerRef');

function createDefaultSearchParams(): SearchParams {
  return {
    pageNum: 1,
    pageSize: 15,
    name: null
  };
}

function transformSearchParamsToRequest(params: SearchParams): Api.System.CorpProjectVersionListParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 15;
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
        width: 100,
        render: row => (
          <div class="flex-center">
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:fact-check-outline"
              tooltipContent={$t('page.corp.version.benefitView')}
              onClick={() => handleViewBenefit(row)}
            />
          </div>
        )
      }
    ]
  });

const versionExtra = computed<Api.System.CorpProjectVersionListExtra>(() => {
  const raw = extraData.value as Partial<Api.System.CorpProjectVersionListExtra> | null;

  return {
    random_map: raw?.random_map ?? {},
    all_map: raw?.all_map ?? {},
    corp_map: raw?.corp_map ?? {}
  };
});

function getCorpName(corpId?: CommonType.IdType) {
  if (!corpId) return '-';

  return versionExtra.value.corp_map[String(corpId)]?.name || '-';
}

function handleViewBenefit(row: Api.System.CorpProjectVersion) {
  benefitDrawerRef.value?.open({
    row,
    corpName: getCorpName(row.corp_id),
    randomList: versionExtra.value.random_map[String(row.id)]?.random_list ?? [],
    allList: versionExtra.value.all_map[String(row.id)]?.all_list ?? []
  });
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <VersionSearch v-model:model="searchParams" @search="getDataByPage" />

    <NCard :title="$t('page.corp.version.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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
    </NCard>

    <VersionBenefitDrawer ref="benefitDrawerRef" />
  </div>
</template>

<style scoped></style>
