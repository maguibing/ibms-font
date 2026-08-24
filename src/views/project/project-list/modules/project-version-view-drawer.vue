<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchGetVersion } from '@/service/api/corp';
import { $t } from '@/locales';

defineOptions({
  name: 'ProjectVersionViewDrawer'
});

const visible = shallowRef(false);
const detail = shallowRef<Api.System.GetVersionResponse | null>(null);
const { loading, startLoading, endLoading } = useLoading();

const currentVersion = computed(() => {
  const response = detail.value;
  return response?.version ?? null;
});

const menuList = computed(() => {
  const response = detail.value;
  if (!response) return [];

  return Object.values(response.menu_map ?? {}).filter(item => Number(item.type) !== 3);
});

const resourceItems = computed(() => {
  const resourceConf = currentVersion.value?.resource_conf;

  return [
    { label: $t('page.corp.version.deviceCount'), value: formatCount(resourceConf?.device_num, $t('page.corp.version.deviceUnit')) },
    { label: $t('page.corp.version.userCount'), value: formatCount(resourceConf?.project_user_num, $t('page.corp.version.userUnit')) },
    { label: $t('page.corp.version.dailyMessageCount'), value: formatCount(resourceConf?.day_msg_num, $t('page.corp.version.messageUnit')) },
    { label: $t('page.corp.version.dataStore'), value: formatCount(resourceConf?.data_store_day, $t('page.corp.version.dayDurationUnit')) }
  ];
});

const priceTimeText = computed(() => {
  const priceConf = currentVersion.value?.price_conf;

  return `${formatDiscountPrice(priceConf?.discount_price, Boolean(priceConf))} / ${formatCount(priceConf?.day, $t('page.corp.version.dayDurationUnit'))}`;
});

const corpName = computed(() => {
  const response = detail.value;
  const version = currentVersion.value;
  if (!response) return '-';

  return response.corp_map?.[String(version?.corp_id)]?.name ?? '-';
});

function formatCount(value: number | undefined, unit: string) {
  if (value === undefined || value === null) return '-';
  return $t('page.corp.version.countWithUnit', { count: value, unit });
}

function formatDiscountPrice(value: number | undefined, hasPriceConf: boolean) {
  if (!hasPriceConf) return '-';
  return `￥${Number(value ?? 0).toFixed(2)}`;
}

function getMenuLabel(item: Api.System.VersionMenuItem) {
  return item.name ?? '-';
}

async function open(versionId?: CommonType.IdType | null) {
  if (!versionId) {
    window.$message?.warning($t('page.project.list.message.unboundVersion'));
    return;
  }

  detail.value = null;
  visible.value = true;
  startLoading();

  const { data, error } = await fetchGetVersion({
    options: [{ key: 2 }, { key: 3 }],
    version_id: versionId
  }).finally(endLoading);

  if (error) return;

  detail.value = data;
}

defineExpose({
  open
});
</script>

<template>
  <NDrawer
    v-model:show="visible"
    :title="$t('page.project.list.versionViewTitle')"
    display-directive="show"
    :width="760"
    class="max-w-90%"
  >
    <NDrawerContent :title="$t('page.project.list.versionViewTitle')" :native-scrollbar="false" closable>
      <NSpin :show="loading">
        <div v-if="currentVersion" class="flex-col gap-18px">
          <div>
            <div class="mb-10px text-15px font-600">{{ $t('page.project.list.currentVersion') }}</div>
            <NDescriptions label-placement="left" bordered size="small" :column="2">
              <NDescriptionsItem :label="$t('page.corp.version.versionName')">
                {{ currentVersion.name ?? '-' }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.corp.version.corp')">{{ corpName }}</NDescriptionsItem>
              <NDescriptionsItem :label="$t('page.project.list.priceTime')" :span="2">
                {{ priceTimeText }}
              </NDescriptionsItem>
            </NDescriptions>
          </div>

          <div>
            <div class="mb-10px text-15px font-600">{{ $t('page.corp.version.resourceConfig') }}</div>
            <NGrid responsive="screen" item-responsive :x-gap="12" :y-gap="12">
              <NGridItem v-for="item in resourceItems" :key="item.label" span="24 s:12">
                <div class="rounded-6px border border-#e5e7eb border-solid px-12px py-10px dark:border-#2f3338">
                  <div class="text-12px text-#8a9099">{{ item.label }}</div>
                  <div class="mt-4px text-18px text-#1f2329 font-600 dark:text-#f2f3f5">{{ item.value }}</div>
                </div>
              </NGridItem>
            </NGrid>
          </div>

          <div>
            <div class="mb-10px text-15px font-600">{{ $t('page.project.list.versionMenu') }}</div>
            <NSpace v-if="menuList.length" :size="[8, 8]">
              <NTag v-for="item in menuList" :key="item.id" type="success">
                {{ getMenuLabel(item) }}
              </NTag>
            </NSpace>
            <NEmpty v-else :description="$t('page.project.list.message.emptyVersionMenu')" />
          </div>
        </div>

        <NEmpty v-else-if="!loading" :description="$t('page.project.list.message.emptyVersionData')" />
      </NSpin>
    </NDrawerContent>
  </NDrawer>
</template>
