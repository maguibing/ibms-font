<script setup lang="tsx">
import { computed, h, ref, shallowRef } from 'vue';
import { NDivider, NImage, NTag } from 'naive-ui';
import type { ImageRenderToolbar } from 'naive-ui/es/image';
import { formatDateTime } from '@sa/utils';
import { fetchDeleteAssets, fetchGetAssetsList } from '@/service/api/ledger';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { downloadLedgerQrCode, downloadLedgerQrCodes, getLedgerQrCodeUrl } from '@/utils/ledger-qr-code';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import AssetsOperateDrawer from './modules/assets-operate-drawer.vue';
import AssetsSearch from './modules/assets-search.vue';
import AssetsViewDrawer from './modules/assets-view-drawer.vue';

defineOptions({
  name: 'LedgerAssets'
});

const appStore = useAppStore();

const searchParams = ref<Api.Ledger.AssetsSearchParams>({
  pageNum: 1,
  pageSize: 10,
  sn: null,
  name: null,
  status: null,
  dateRange: null
});

function transformSearchParamsToRequest(params: Api.Ledger.AssetsSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  const options: CommonType.CommonTypeOptions[] = [{ type: 104, value: '101' }];

  if (params.sn) {
    options.push({ type: 1, value: params.sn });
  }

  if (params.name) {
    options.push({ type: 2, value: params.name });
  }

  if (params.status) {
    options.push({ type: 4, value: String(params.status) });
  }

  if (Array.isArray(params.dateRange) && params.dateRange.length === 2) {
    options.push({ type: 103, value: `${params.dateRange[0]},${params.dateRange[1]}` });
  }

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
    api: () => fetchGetAssetsList(transformSearchParamsToRequest(searchParams.value)),
    transform: response => defaultTransform<Api.Ledger.Assets>(response),
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
        key: 'sn',
        title: '资产编号',
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'name',
        title: '资产名称',
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'qr_code',
        title: '二维码',
        align: 'center',
        width: 100,
        render: row => renderLedgerQrCode(row)
      },
      {
        key: 'assets_type_id',
        title: '资产类型',
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        },
        render: row => getAssetsTypeName(row.assets_type_id)
      },
      {
        key: 'dept_id',
        title: '归属部门',
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        },
        render: row => getDeptName(row.detail?.attribution?.dept_id)
      },
      {
        key: 'purchase_price',
        title: '采购金额',
        align: 'center',
        minWidth: 120,
        render: row => renderPrice(row.detail?.procurement?.purchase_price)
      },
      {
        key: 'status',
        title: '资产状态',
        align: 'center',
        minWidth: 100,
        render: row => renderAssetsStatus(row.status)
      },
      {
        key: 'created_at',
        title: '创建时间',
        align: 'center',
        minWidth: 180,
        render: row => (row.created_at ? formatDateTime(row.created_at * 1000) : '-')
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 180,
        render: row => {
          const buttons = [
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:visibility-outline"
              tooltipContent="查看"
              onClick={() => handleView(row)}
            />,
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => handleEdit(row)}
            />,
            <ButtonIcon
              text
              type="error"
              icon="material-symbols:delete-outline"
              tooltipContent={$t('common.delete')}
              popconfirmContent={$t('common.confirmDelete')}
              onPositiveClick={() => handleDelete(row.id)}
            />
          ];

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

const operateDrawerVisible = ref(false);
const viewDrawerVisible = ref(false);
const operateType = shallowRef<NaiveUI.TableOperateType>('add');
const editingData = shallowRef<Api.Ledger.Assets | null>(null);
const viewingData = shallowRef<Api.Ledger.Assets | null>(null);

const assetsExtra = computed<Api.Ledger.AssetsListExtra>(() => {
  const raw = extraData.value as Partial<Api.Ledger.AssetsListExtra> | null;

  return {
    assets_type_map: raw?.assets_type_map ?? {},
    dept_map: raw?.dept_map ?? {}
  };
});

function getAssetsTypeName(assetsTypeId?: CommonType.IdType) {
  if (!assetsTypeId) return '-';

  return assetsExtra.value.assets_type_map[String(assetsTypeId)]?.name || '-';
}

function getDeptName(deptId?: CommonType.IdType | null) {
  if (!deptId) return '-';

  return assetsExtra.value.dept_map[String(deptId)]?.name || '-';
}

function renderPrice(price?: number | null) {
  if (price === undefined || price === null) return '-';

  return Number(price).toFixed(2);
}

function renderAssetsStatus(status?: number | string) {
  const statusValue = Number(status);

  if (statusValue === 1) {
    return <NTag type="success">正常</NTag>;
  }

  if (statusValue === 2) {
    return <NTag type="warning">维修</NTag>;
  }

  if (statusValue === 3) {
    return <NTag type="error">报废</NTag>;
  }

  return status ?? '-';
}

function renderLedgerQrToolbar(row: Api.Ledger.Assets): ImageRenderToolbar {
  return ({ nodes }) => (
    <>
      {nodes.rotateCounterclockwise}
      {nodes.rotateClockwise}
      {nodes.resizeToOriginalSize}
      {nodes.zoomOut}
      {nodes.zoomIn}
      {h(
        'span',
        {
          class: 'ledger-qr-download-wrap',
          onClickCapture: (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            downloadLedgerQrCode(row);
          }
        },
        nodes.download
      )}
      {nodes.close}
    </>
  );
}

function renderLedgerQrCode(row: Api.Ledger.Assets) {
  const qrCodeUrl = getLedgerQrCodeUrl(row);

  if (!qrCodeUrl) return '-';

  return (
    <NImage
      class="ledger-qr-image"
      src={qrCodeUrl}
      previewSrc={qrCodeUrl}
      width={56}
      height={56}
      objectFit="contain"
      alt="资产二维码"
      imgProps={{ style: { imageRendering: 'pixelated' } }}
      previewedImgProps={{ style: { imageRendering: 'pixelated' } }}
      renderToolbar={renderLedgerQrToolbar(row)}
    />
  );
}

function handleBatchDownloadLedgerQrCodes() {
  const count = downloadLedgerQrCodes(data.value);

  if (!count) {
    window.$message?.warning('当前列表暂无可下载二维码');
    return;
  }

  window.$message?.success(`已开始下载 ${count} 个二维码压缩包`);
}

function handleAdd() {
  operateType.value = 'add';
  editingData.value = null;
  operateDrawerVisible.value = true;
}

function handleView(row: Api.Ledger.Assets) {
  viewingData.value = row;
  viewDrawerVisible.value = true;
}

function handleEdit(row: Api.Ledger.Assets) {
  operateType.value = 'edit';
  editingData.value = row;
  operateDrawerVisible.value = true;
}

async function handleBatchDelete() {
  const { error } = await fetchDeleteAssets({ id_list: checkedRowKeys.value });
  if (error) return;

  onBatchDeleted();
}

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteAssets({ id_list: [id] });
  if (error) return;

  onDeleted();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <AssetsSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard title="资产管理" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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
        >
          <template #after>
            <NButton size="small" ghost :disabled="data.length === 0" @click="handleBatchDownloadLedgerQrCodes">
              <template #icon>
                <icon-material-symbols-download-rounded class="text-icon" />
              </template>
              批量下载二维码
            </NButton>
          </template>
        </TableHeaderOperation>
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
      <AssetsOperateDrawer
        v-model:visible="operateDrawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
      <AssetsViewDrawer v-model:visible="viewDrawerVisible" :row-data="viewingData" />
    </NCard>
  </div>
</template>

<style scoped>
.ledger-qr-download-wrap {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.ledger-qr-image {
  cursor: pointer;
}
</style>
