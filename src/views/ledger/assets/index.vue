<script setup lang="tsx">
import { computed, h, ref, shallowRef } from 'vue';
import { NDivider, NImage, NTag } from 'naive-ui';
import type { ImageRenderToolbar } from 'naive-ui/es/image';
import { fetchDeleteAssets, fetchGetAssetsList } from '@/service/api/ledger';
import { fetchExportTask } from '@/service/api/common';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useExportProgress } from '@/hooks/business/export-progress';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { downloadLedgerQrCode, downloadLedgerQrCodes, getLedgerQrCodeUrl } from '@/utils/ledger-qr-code';
import { ExportBizType, ExportFileType, ImportBizType, ImportTemplatePath } from '@/enum/business';
import { $t } from '@/locales';
import { formatUnixDateTime } from '@/utils/common-methods';
import ButtonIcon from '@/components/custom/button-icon.vue';
import DataImportModal from '@/components/custom/data-import-modal.vue';
import { getWebSocketConnectionId } from '@/utils/websocket';
import AssetsOperateDrawer from './modules/assets-operate-drawer.vue';
import AssetsSearch from './modules/assets-search.vue';
import AssetsViewDrawer from './modules/assets-view-drawer.vue';

defineOptions({
  name: 'LedgerAssets'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();
const { startExport, stopExport } = useExportProgress();

const searchParams = ref<Api.Ledger.AssetsSearchParams>({
  pageNum: 1,
  pageSize: 15,
  sn: null,
  name: null,
  status: null,
  dateRange: null
});

function transformSearchParamsToRequest(params: Api.Ledger.AssetsSearchParams): CommonType.CommonListQueryParams {
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 15;
  const filterConfigs = [
    { type: 104, value: '101' },
    { type: 1, value: params.sn },
    { type: 2, value: params.name },
    { type: 4, value: params.status },
    {
      type: 103,
      value: Array.isArray(params.dateRange) && params.dateRange.length === 2 ? `${params.dateRange[0]},${params.dateRange[1]}` : null
    }
  ];

  const options = filterConfigs
    .filter(item => item.value !== null && item.value !== undefined && item.value !== '')
    .map(({ type, value }) => ({ type, value: String(value) }));

  return {
    list_option: {
      offset: (pageNum - 1) * pageSize,
      limit: pageSize,
      options
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
        title: $t('ledger.assetsNo'),
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'name',
        title: $t('ledger.assetsName'),
        align: 'center',
        minWidth: 160,
        ellipsis: {
          tooltip: true
        }
      },
      {
        key: 'qr_code',
        title: $t('ledger.qrCode'),
        align: 'center',
        width: 100,
        render: row => renderLedgerQrCode(row)
      },
      {
        key: 'assets_type_id',
        title: $t('ledger.assetsType'),
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        },
        render: row => getAssetsTypeName(row.assets_type_id)
      },
      {
        key: 'dept_id',
        title: $t('ledger.dept'),
        align: 'center',
        minWidth: 140,
        ellipsis: {
          tooltip: true
        },
        render: row => getDeptName(row.detail?.attribution?.dept_id)
      },
      {
        key: 'purchase_price',
        title: $t('ledger.purchasePrice'),
        align: 'center',
        minWidth: 120,
        render: row => renderPrice(row.detail?.procurement?.purchase_price)
      },
      {
        key: 'status',
        title: $t('ledger.assetsStatus'),
        align: 'center',
        minWidth: 100,
        render: row => renderAssetsStatus(row.status)
      },
      {
        key: 'created_at',
        title: $t('ledger.createdAt'),
        align: 'center',
        minWidth: 180,
        render: row => formatUnixDateTime(row.created_at)
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 180,
        render: row => {
          const viewBtn = () => (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:visibility-outline"
              tooltipContent={$t('ledger.view')}
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
          if (hasAuth('ledger:assets:view')) buttons.push(viewBtn());
          if (hasAuth('ledger:assets:edit')) buttons.push(editBtn());
          if (hasAuth('ledger:assets:delete')) buttons.push(deleteBtn());

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
const importAssetsVisible = shallowRef(false);

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
    return <NTag type="success">{$t('ledger.normal')}</NTag>;
  }

  if (statusValue === 2) {
    return <NTag type="warning">{$t('ledger.repair')}</NTag>;
  }

  if (statusValue === 3) {
    return <NTag type="error">{$t('ledger.scrapped')}</NTag>;
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
    <div class="flex-center">
      <NImage
        class="ledger-qr-image"
        src={qrCodeUrl}
        previewSrc={qrCodeUrl}
        width={56}
        height={56}
        objectFit="contain"
        alt={$t('ledger.qrAlt')}
        imgProps={{ style: { imageRendering: 'pixelated' } }}
        previewedImgProps={{ style: { imageRendering: 'pixelated' } }}
        renderToolbar={renderLedgerQrToolbar(row)}
      />
    </div>

  );
}

function handleBatchDownloadLedgerQrCodes() {
  const count = downloadLedgerQrCodes(data.value);

  if (!count) {
    window.$message?.warning($t('ledger.noQr'));
    return;
  }

  window.$message?.success($t('ledger.downloadStarted', { count }));
}

async function handleExport() {
  const connectionId = getWebSocketConnectionId();
  if (!connectionId) {
    window.$message?.warning($t('ledger.wsWarning'));
    return;
  }

  const { list_option } = transformSearchParamsToRequest(searchParams.value);
  startExport($t('ledger.exportName'));

  const { error } = await fetchExportTask({
    connection_id: connectionId,
    export_biz_type: ExportBizType.Assets,
    file_type: ExportFileType.Excel,
    list_option: list_option!
  });

  if (error) {
    stopExport();
    return;
  }

  window.$message?.success($t('ledger.exportSubmitted'));
}

function handleImportAssets() {
  importAssetsVisible.value = true;
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
    <NCard :title="$t('ledger.assetsManagement')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('ledger:assets:add')"
          :show-delete="hasAuth('ledger:assets:delete')"
          :show-export="hasAuth('ledger:assets:export')"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @export="handleExport"
          @refresh="getData"
        >
          <template #after>
            <NButton v-if="hasAuth('ledger:assets:import')" size="small" ghost @click="handleImportAssets">
              <template #icon>
                <SvgIcon icon="material-symbols:upload-rounded" class="text-icon" />
              </template>
              {{ $t('ledger.import') }}
            </NButton>
            <NButton size="small" ghost :disabled="data.length === 0" @click="handleBatchDownloadLedgerQrCodes">
              <template #icon>
                <icon-material-symbols-download-rounded class="text-icon" />
              </template>
              {{ $t('ledger.batchDownloadQr') }}
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
      <DataImportModal
        v-model:visible="importAssetsVisible"
        :biz-type="ImportBizType.Assets"
        :template-path="ImportTemplatePath.Assets"
        :template-file-name="`${$t('ledger.qrTaskName')}_${$t('common.importTemplate')}_${new Date().getTime()}.xlsx`"
        :task-name="$t('ledger.qrTaskName')"
        @submitted="getData"
      />
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
