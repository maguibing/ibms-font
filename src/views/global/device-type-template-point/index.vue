<script setup lang="tsx">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { formatDateTime } from '@sa/utils';
import {
  fetchDeleteDeviceTypeTemplatePoint,
  fetchGetDeviceTypeTemplatePointList
} from '@/service/api/device-type-template';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import DataTypeTag from '@/components/custom/data-type-tag.vue';
import PointOperateDrawer from './modules/point-operate-drawer.vue';
import { useAuth } from '@/hooks/business/auth';
defineOptions({
  name: 'DeviceTypeTemplatePointList'
});

const route = useRoute();
const appStore = useAppStore();
const { hasAuth } = useAuth();
const checkedRowKeys = ref<CommonType.IdType[]>([]);
const pointOperateVisible = ref(false);
const pointOperateType = ref<NaiveUI.TableOperateType>('add');
const editingPointId = ref<CommonType.IdType | null>(null);

const templateId = computed(() => route.query.template_id as string | undefined);

const searchParams = ref<Api.System.DeviceTypeTemplatePointSearchParams>({
  pageNum: 1,
  pageSize: 10,
  name: null
});

function transformSearchParamsToRequest(
  params: Api.System.DeviceTypeTemplatePointSearchParams
): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const filterConfigs = [
    { type: 1, value: templateId.value },
    { type: 2, value: params.name }
  ];

  const options = filterConfigs
    .filter((item): item is { type: number; value: string } => Boolean(item.value))
    .map(({ type, value }) => ({ type, value }));

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
    api: () => fetchGetDeviceTypeTemplatePointList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.System.DeviceTypeTemplatePoint>(response),
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
        title: '点位名称',
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        },
        render: row => row.name || '-'
      },
      {
        key: 'key',
        title: '点位标识',
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        },
        render: row => row.key || '-'
      },
      {
        key: 'data_type',
        title: '数据类型',
        align: 'center',
        minWidth: 120,
        render: row => <DataTypeTag value={row.data_type} />
      },
      {
        key: 'desc',
        title: '描述',
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        },
        render: row => row.desc || '-'
      },
      {
        key: 'updated_at',
        title: '更新时间',
        align: 'center',
        minWidth: 180,
        render: row => formatDateTime(row.updated_at)
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 120,
        render: row => {
          const editBtn = () => {
            if (!hasAuth('demo:demo:edit')) {
              return null;
            }
            return (
              <ButtonIcon
                text
                type="primary"
                icon="material-symbols:edit-outline"
                tooltipContent={$t('common.edit')}
                onClick={() => handleEdit(row.id)}
              />
            );
          };

          const deleteBtn = () => {
            if (!hasAuth('demo:demo:remove')) {
              return null;
            }
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
          buttons.push(editBtn());
          buttons.push(deleteBtn());

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

function handleResetSearch() {
  searchParams.value.name = null;
  getDataByPage();
}

function handleAdd() {
  if (!templateId.value) {
    window.$message?.warning('缺少模板ID');
    return;
  }

  pointOperateType.value = 'add';
  editingPointId.value = null;
  pointOperateVisible.value = true;
}

function handleEdit(id: CommonType.IdType) {
  pointOperateType.value = 'edit';
  editingPointId.value = id;
  pointOperateVisible.value = true;
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteDeviceTypeTemplatePoint({ id_list: [id] });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = checkedRowKeys.value.filter(item => item !== id);
  await getData();
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return;

  const { error } = await fetchDeleteDeviceTypeTemplatePoint({ id_list: checkedRowKeys.value });
  if (error) return;

  window.$message?.success($t('common.deleteSuccess'));
  checkedRowKeys.value = [];
  await getData();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NCollapse>
        <NCollapseItem :title="$t('common.search')" name="point-keyword-search">
          <NForm :show-feedback="false" label-placement="left" :label-width="80">
            <NGrid responsive="screen" item-responsive>
              <NFormItemGi span="24 s:12 m:8" label="点位关键字" label-width="auto" class="pr-24px">
                <NInput
                  v-model:value="searchParams.name"
                  clearable
                  placeholder="请输入点位关键字"
                  @keyup.enter="getDataByPage()"
                />
              </NFormItemGi>
              <NFormItemGi :show-feedback="false" span="24 s:12 m:16" class="pr-24px">
                <NSpace class="w-full" justify="end">
                  <NButton type="primary" ghost @click="getDataByPage()">
                    <template #icon>
                      <icon-ic-round-search class="text-icon" />
                    </template>
                    {{ $t('common.search') }}
                  </NButton>
                  <NButton @click="handleResetSearch">
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
    <NCard title="模板点位" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="true"
          :show-delete="true"
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
    <PointOperateDrawer
      v-model:visible="pointOperateVisible"
      :template-id="templateId"
      :operate-type="pointOperateType"
      :row-id="editingPointId"
      @submitted="getData"
    />
  </div>
</template>

<style scoped></style>
