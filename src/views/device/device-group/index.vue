<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NDivider } from 'naive-ui';
import { jsonClone } from '@sa/utils';
import { fetchDeleteDeviceGroup, fetchGetDeviceGroupTrees } from '@/service/api/device';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { treeTransform, useNaiveTreeTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import DeviceGroupOperateDrawer from './modules/device-group-operate-drawer.vue';
import DeviceGroupSearch from './modules/device-group-search.vue';

defineOptions({
  name: 'DeviceGroup'
});

type DeviceGroupTreeFlatResponse = {
  data: Api.Device.DeviceGroupTreeResponse | null;
  error?: unknown;
};

type DeviceGroupTreeResponse = Api.Device.DeviceGroupTreeResponse | DeviceGroupTreeFlatResponse;

const appStore = useAppStore();
const { hasAuth } = useAuth();

const searchParams = ref<Api.Device.DeviceGroupSearchParams>({
  group_name: null
});

function transformSearchParamsToRequest(params: Api.Device.DeviceGroupSearchParams): CommonType.CommonListQueryParams {
  const filterConfigs = [{ type: 1, value: params.group_name }];

  const options = filterConfigs
    .filter((item): item is { type: number; value: string } => Boolean(item.value))
    .map(({ type, value }) => ({ type, value }));

  return {
    list_option: {
      options
    },
    options: [{ key: 1 }]
  };
}

function isDeviceGroupTreeFlatResponse(response: DeviceGroupTreeResponse): response is DeviceGroupTreeFlatResponse {
  return 'data' in response && 'error' in response;
}

function getDeviceGroupTreePayload(response: DeviceGroupTreeResponse) {
  const payload = isDeviceGroupTreeFlatResponse(response) ? response.data : response;

  return {
    trees: payload?.device_group_trees ?? []
  };
}

const {
  columns,
  columnChecks,
  data,
  rows,
  getData,
  loading,
  expandedRowKeys,
  isCollapse,
  expandAll,
  collapseAll,
  scrollX
} = useNaiveTreeTable({
  keyField: 'group_id',
  api: () => fetchGetDeviceGroupTrees(transformSearchParamsToRequest(searchParams.value)),
  transform: response =>
    treeTransform<Api.Device.DeviceGroup>(getDeviceGroupTreePayload(response), {
      idField: 'group_id',
      parentIdField: 'parent_id'
    }),
  columns: () => [
    {
      key: 'group_name',
      title: $t('deviceGroup.name'),
      align: 'center',
      width: 160,
      ellipsis: true
    },
    {
      key: 'desc',
      title: $t('deviceGroup.description'),
      align: 'center',
      minWidth: 180,
      ellipsis: {
        tooltip: true
      },
      render: row => row.desc || '-'
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 150,
      render: row => {
        const addBtn = () => {
          return (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:add-2-rounded"
              tooltipContent={$t('common.add')}
              onClick={() => addInRow(row)}
            />
          );
        };

        const editBtn = () => {
          return (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => edit(row.group_id)}
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
              onPositiveClick={() => handleDelete(row.group_id)}
            />
          );
        };

        const buttons = [];
        if (hasAuth('device:device-group:add')) buttons.push(addBtn());
        if (hasAuth('device:device-group:edit')) buttons.push(editBtn());
        if (hasAuth('device:device-group:delete')) buttons.push(deleteBtn());

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

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, onDeleted } = useTableOperate(
  rows,
  'group_id',
  getData
);

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteDeviceGroup({ id_list: [id] });
  if (error) return;

  onDeleted();
}

function edit(id: CommonType.IdType) {
  handleEdit(id);
}

function handleAddRoot() {
  editingData.value = null;
  handleAdd();
}

function addInRow(row: Api.Device.DeviceGroup) {
  editingData.value = jsonClone(row);
  handleAdd();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <DeviceGroupSearch v-model:model="searchParams" @search="getData" />
    <NCard :title="$t('deviceGroup.management')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
          :show-add="hasAuth('device:device-group:add')"
          :show-delete="false"
          :show-export="false"
          @add="handleAddRoot"
          @refresh="getData"
        >
          <template #prefix>
            <NButton v-if="!isCollapse" :disabled="!data.length" size="small" @click="expandAll">
              <template #icon>
                <icon-quill-expand />
              </template>
              {{ $t('deviceGroup.expandAll') }}
            </NButton>
            <NButton v-if="isCollapse" :disabled="!data.length" size="small" @click="collapseAll">
              <template #icon>
                <icon-quill-collapse />
              </template>
              {{ $t('deviceGroup.collapseAll') }}
            </NButton>
          </template>
        </TableHeaderOperation>
      </template>
      <NDataTable
        v-model:expanded-row-keys="expandedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="scrollX"
        :loading="loading"
        :row-key="row => row.group_id"
        class="sm:h-full"
      />
      <DeviceGroupOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
