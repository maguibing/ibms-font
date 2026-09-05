<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchGetAssets } from '@/service/api/ledger';
import { $t } from '@/locales';
import { displayValue, formatPrice, formatUnixDateTime } from '@/utils/common-methods';

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

  if (statusValue === 1) return { label: $t('ledger.normal'), type: 'success' as const };
  if (statusValue === 2) return { label: $t('ledger.repair'), type: 'warning' as const };
  if (statusValue === 3) return { label: $t('ledger.scrapped'), type: 'error' as const };

  return null;
});

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
    <NDrawerContent :title="$t('ledger.viewAssets')" :native-scrollbar="false" closable>
      <NSpin :show="loading">
        <div v-if="assets" class="flex-col gap-18px">
          <div>
            <div class="mb-10px text-15px font-600">{{ $t('ledger.basicInfo') }}</div>
            <NDescriptions label-placement="left" bordered size="small" :column="2">
              <NDescriptionsItem :label="$t('ledger.assetsId')">{{ displayValue(assets.id) }}</NDescriptionsItem>
              <NDescriptionsItem :label="$t('ledger.projectId')">
                {{ displayValue(assets.project_id) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('ledger.assetsNo')">{{ displayValue(assets.sn) }}</NDescriptionsItem>
              <NDescriptionsItem :label="$t('ledger.assetsName')">{{ displayValue(assets.name) }}</NDescriptionsItem>
              <NDescriptionsItem :label="$t('ledger.assetsType')">{{ assetsTypeName }}</NDescriptionsItem>
              <NDescriptionsItem :label="$t('ledger.assetsStatus')">
                <NTag v-if="statusTag" :type="statusTag.type">{{ statusTag.label }}</NTag>
                <span v-else>{{ displayValue(assets.status) }}</span>
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('ledger.createdAt')">
                {{ formatUnixDateTime(assets.created_at) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('ledger.updatedAt')">
                {{ formatUnixDateTime(assets.updated_at) }}
              </NDescriptionsItem>
            </NDescriptions>
          </div>

          <div>
            <div class="mb-10px text-15px font-600">{{ $t('ledger.belongDevice') }}</div>
            <NDescriptions label-placement="left" bordered size="small" :column="1">
              <NDescriptionsItem :label="$t('ledger.belongDevice')">
                <NSpace v-if="deviceNames.length" :size="[8, 8]">
                  <NTag v-for="item in deviceNames" :key="item" type="info">{{ item }}</NTag>
                </NSpace>
                <span v-else>-</span>
              </NDescriptionsItem>
            </NDescriptions>
          </div>

          <div>
            <div class="mb-10px text-15px font-600">{{ $t('ledger.attribution') }}</div>
            <NDescriptions label-placement="left" bordered size="small" :column="2">
              <NDescriptionsItem :label="$t('ledger.dept')">{{ deptName }}</NDescriptionsItem>
              <NDescriptionsItem :label="$t('ledger.location')">
                {{ displayValue(attribution.location) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('ledger.owner')">{{ displayValue(attribution.owner) }}</NDescriptionsItem>
            </NDescriptions>
          </div>

          <div>
            <div class="mb-10px text-15px font-600">{{ $t('ledger.procurement') }}</div>
            <NDescriptions label-placement="left" bordered size="small" :column="2">
              <NDescriptionsItem :label="$t('ledger.purchaseAt')">
                {{ formatUnixDateTime(procurement.purchase_at) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('ledger.purchasePrice')">
                {{ formatPrice(procurement.purchase_price) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('ledger.supplier')">
                {{ displayValue(procurement.supplier) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('ledger.expireAt')">
                {{ formatUnixDateTime(procurement.expire_at) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('ledger.expireNotice')">
                {{ displayValue(procurement.expire_notice_days) }}
              </NDescriptionsItem>
            </NDescriptions>
          </div>

          <div>
            <div class="mb-10px text-15px font-600">{{ $t('ledger.remark') }}</div>
            <NDescriptions label-placement="left" bordered size="small" :column="1">
              <NDescriptionsItem :label="$t('ledger.remark')">{{ displayValue(assets.desc) }}</NDescriptionsItem>
            </NDescriptions>
          </div>
        </div>

        <NEmpty v-else-if="!loading" :description="$t('ledger.noAssets')" />
      </NSpin>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.close') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
