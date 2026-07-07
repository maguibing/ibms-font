<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { formatDateTime } from '@sa/utils';
import { fetchGetAssets } from '@/service/api/ledger';
import { $t } from '@/locales';
import { displayValue, formatPrice } from '@/utils/common-methods';

defineOptions({
  name: 'AssetsViewDrawer'
});

interface Props {
  rowData?: Api.Ledger.Assets | null;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { loading, startLoading, endLoading } = useLoading();
const detail = shallowRef<Api.Ledger.AssetsDetailData | null>(null);

const assets = computed(() => detail.value?.assets ?? null);
const attribution = computed(() => assets.value?.detail?.attribution ?? {});
const procurement = computed(() => assets.value?.detail?.procurement ?? {});

const assetsTypeName = computed(() => {
  const assetsTypeId = assets.value?.assets_type_id;
  if (!assetsTypeId) return '-';

  return detail.value?.assets_type_map?.[String(assetsTypeId)]?.name ?? '-';
});

const deptName = computed(() => {
  const deptId = attribution.value.dept_id;
  if (!deptId) return '-';

  return detail.value?.dept_map?.[String(deptId)]?.name ?? '-';
});

const deviceNames = computed(() => {
  const deviceIdList = assets.value?.detail?.device_id_list ?? assets.value?.device_id_list ?? [];
  const deviceMap = detail.value?.device_map ?? {};

  return deviceIdList.map(id => deviceMap[String(id)]?.name).filter((name): name is string => Boolean(name));
});

const statusTag = computed(() => {
  const statusValue = Number(assets.value?.status);

  if (statusValue === 1) return { label: '正常', type: 'success' as const };
  if (statusValue === 2) return { label: '维修', type: 'warning' as const };
  if (statusValue === 3) return { label: '报废', type: 'error' as const };

  return null;
});

function formatUnixTime(value?: number | null) {
  if (!value) return '-';

  return formatDateTime(value * 1000);
}

async function getAssetsDetail(id: CommonType.IdType) {
  startLoading();
  const { data, error } = await fetchGetAssets({
    id,
    options: [{ key: 1 }, { key: 2 }, { key: 3 }]
  }).finally(endLoading);

  if (error) return;

  detail.value = data;
}

function closeDrawer() {
  visible.value = false;
}

watch(visible, () => {
  if (!visible.value) return;

  detail.value = null;

  if (props.rowData?.id) {
    getAssetsDetail(props.rowData.id);
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="760" class="max-w-90%">
    <NDrawerContent title="查看台账" :native-scrollbar="false" closable>
      <NSpin :show="loading">
        <div v-if="assets" class="flex-col gap-18px">
          <div>
            <div class="mb-10px text-15px font-600">基本信息</div>
            <NDescriptions label-placement="left" bordered size="small" :column="2">
              <NDescriptionsItem label="资产ID">{{ displayValue(assets.id) }}</NDescriptionsItem>
              <NDescriptionsItem label="项目ID">{{ displayValue(assets.project_id) }}</NDescriptionsItem>
              <NDescriptionsItem label="资产编号">{{ displayValue(assets.sn) }}</NDescriptionsItem>
              <NDescriptionsItem label="资产名称">{{ displayValue(assets.name) }}</NDescriptionsItem>
              <NDescriptionsItem label="资产类型">{{ assetsTypeName }}</NDescriptionsItem>
              <NDescriptionsItem label="资产状态">
                <NTag v-if="statusTag" :type="statusTag.type">{{ statusTag.label }}</NTag>
                <span v-else>{{ displayValue(assets.status) }}</span>
              </NDescriptionsItem>
              <NDescriptionsItem label="创建时间">{{ formatUnixTime(assets.created_at) }}</NDescriptionsItem>
              <NDescriptionsItem label="更新时间">{{ formatUnixTime(assets.updated_at) }}</NDescriptionsItem>
            </NDescriptions>
          </div>

          <div>
            <div class="mb-10px text-15px font-600">归属设备</div>
            <NDescriptions label-placement="left" bordered size="small" :column="1">
              <NDescriptionsItem label="归属设备">
                <NSpace v-if="deviceNames.length" :size="[8, 8]">
                  <NTag v-for="item in deviceNames" :key="item" type="info">{{ item }}</NTag>
                </NSpace>
                <span v-else>-</span>
              </NDescriptionsItem>
            </NDescriptions>
          </div>

          <div>
            <div class="mb-10px text-15px font-600">归属信息</div>
            <NDescriptions label-placement="left" bordered size="small" :column="2">
              <NDescriptionsItem label="归属部门">{{ deptName }}</NDescriptionsItem>
              <NDescriptionsItem label="存放位置">{{ displayValue(attribution.location) }}</NDescriptionsItem>
              <NDescriptionsItem label="责任人">{{ displayValue(attribution.owner) }}</NDescriptionsItem>
            </NDescriptions>
          </div>

          <div>
            <div class="mb-10px text-15px font-600">采购信息</div>
            <NDescriptions label-placement="left" bordered size="small" :column="2">
              <NDescriptionsItem label="采购日期">{{ formatUnixTime(procurement.purchase_at) }}</NDescriptionsItem>
              <NDescriptionsItem label="采购金额">{{ formatPrice(procurement.purchase_price) }}</NDescriptionsItem>
              <NDescriptionsItem label="供应商">{{ displayValue(procurement.supplier) }}</NDescriptionsItem>
              <NDescriptionsItem label="到期时间">{{ formatUnixTime(procurement.expire_at) }}</NDescriptionsItem>
              <NDescriptionsItem label="到期提前通知">
                {{ displayValue(procurement.expire_notice_days) }}
              </NDescriptionsItem>
            </NDescriptions>
          </div>

          <div>
            <div class="mb-10px text-15px font-600">备注</div>
            <NDescriptions label-placement="left" bordered size="small" :column="1">
              <NDescriptionsItem label="备注">{{ displayValue(assets.desc) }}</NDescriptionsItem>
            </NDescriptions>
          </div>
        </div>

        <NEmpty v-else-if="!loading" description="暂无资产数据" />
      </NSpin>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.close') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
