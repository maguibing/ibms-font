<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { $t, hasLocaleKey } from '@/locales';

defineOptions({
  name: 'VersionBenefitDrawer'
});

type BenefitPayload = {
  row: Api.System.CorpProjectVersion;
  corpName?: string;
  randomList?: string[];
  allList?: string[];
};

type BenefitDisplayItem = {
  raw: string;
  label: string;
};

const visible = shallowRef(false);
const current = shallowRef<BenefitPayload | null>(null);
const timeTypeLabelMap = computed<Record<Api.System.VersionTimeType, string>>(() => ({
  4: $t('page.corp.version.dayDurationUnit'),
  5: $t('page.corp.version.monthDurationUnit'),
  6: $t('page.corp.version.yearDurationUnit')
}));
const legacyBenefitI18nKeyMap = computed<Record<string, App.I18n.I18nKey>>(() => ({
  '\u8fb9\u7f18\u8bbe\u5907\u7ba1\u7406': 'page.corp.version.legacy.gatewayManagement',
  '\u80fd\u6e90\u5927\u5c4f': 'page.corp.version.legacy.energyScreen',
  '\u8868\u8ba1\u8bbe\u7f6e': 'page.corp.version.legacy.meterSetting',
  '\u7528\u80fd\u4ef7\u683c\u7ba1\u7406': 'page.corp.version.legacy.energyPriceManagement',
  '\u80fd\u6e90\u5206\u7c7b': 'page.corp.version.legacy.energyCategory'
}));

const row = computed(() => current.value?.row ?? null);
const randomList = computed(() => current.value?.randomList ?? []);
const allList = computed(() => current.value?.allList ?? []);
const menuIds = computed(() => row.value?.menu_conf?.menu_id_list ?? []);
const benefitSummaryList = computed(() => randomList.value.map(createBenefitDisplayItem));
const allBenefitList = computed(() => allList.value.map(createBenefitDisplayItem));

const resourceItems = computed(() => {
  const resourceConf = row.value?.resource_conf;
  const timeTypeLabel = getTimeTypeLabel(resourceConf?.time_type);

  return [
    {
      label: $t('page.corp.version.deviceCount'),
      value: formatCount(resourceConf?.device_num ?? 0, $t('page.corp.version.deviceUnit'))
    },
    {
      label: $t('page.corp.version.userCount'),
      value: formatCount(resourceConf?.project_user_num ?? 0, $t('page.corp.version.userUnit'))
    },
    {
      label: $t('page.corp.version.dailyMessageCount'),
      value: formatCount(resourceConf?.day_msg_num ?? 0, $t('page.corp.version.messageUnit'))
    },
    { label: $t('page.corp.version.dataStore'), value: formatCount(resourceConf?.data_store_day ?? 0, timeTypeLabel) }
  ];
});

const priceItems = computed(() => {
  const priceConf = row.value?.price_conf;
  const timeTypeLabel = getTimeTypeLabel(priceConf?.time_type);

  return [
    { label: $t('page.corp.version.originalPrice'), value: formatPrice(priceConf?.original_price ?? 0) },
    { label: $t('page.corp.version.discountPrice'), value: formatPrice(priceConf?.discount_price ?? 0) },
    { label: $t('page.corp.version.duration'), value: formatCount(priceConf?.day ?? 0, timeTypeLabel) }
  ];
});

const menuBenefitList = computed(() => {
  const menuNames = allList.value.filter(item => !parseBenefitText(item));

  if (menuNames.length) return menuNames.map(createBenefitDisplayItem);

  return menuIds.value.map(id =>
    createBenefitDisplayItem(
      $t('page.corp.version.menuId', {
        id
      })
    )
  );
});

function formatCount(value: number | undefined, unit: string) {
  if (value === undefined || value === null) return '-';

  return $t('page.corp.version.countWithUnit', { count: value, unit });
}

function formatPrice(value: number | undefined) {
  if (value === undefined || value === null) return '-';

  return `￥${Number(value).toFixed(2)}`;
}

function getTimeTypeLabel(timeType?: Api.System.VersionTimeType) {
  if (!timeType) return $t('page.corp.version.dayDurationUnit');

  return timeTypeLabelMap.value[timeType] ?? $t('page.corp.version.dayDurationUnit');
}

function createBenefitDisplayItem(raw: string): BenefitDisplayItem {
  return {
    raw,
    label: formatBenefitText(raw)
  };
}

function formatBenefitText(value: string) {
  const benefitText = parseBenefitText(value);
  if (benefitText) return benefitText;

  const legacyI18nKey = legacyBenefitI18nKeyMap.value[value];
  if (legacyI18nKey) return $t(legacyI18nKey);

  const i18nKey = value as App.I18n.I18nKey;
  if (value.startsWith('route.') && hasLocaleKey(i18nKey)) {
    return $t(i18nKey);
  }

  return value;
}

function parseBenefitText(value: string) {
  const deviceMatch = value.match(/^(\d+)\u4e2a\u8bbe\u5907$/);
  if (deviceMatch) {
    return formatCount(Number(deviceMatch[1]), $t('page.corp.version.deviceUnit'));
  }

  const userMatch = value.match(/^(\d+)\u4e2a\u7528\u6237$/);
  if (userMatch) {
    return formatCount(Number(userMatch[1]), $t('page.corp.version.userUnit'));
  }

  const dailyMessageMatch = value.match(/^(\d+)\u6761\u65e5\u6d88\u606f\u6570$/);
  if (dailyMessageMatch) {
    return $t('page.corp.version.dailyMessageBenefit', {
      count: Number(dailyMessageMatch[1])
    });
  }

  const dataStoreMatch = value.match(/^(\d+)(\u5929|\u4e2a\u6708|\u6708|\u5e74)\u6570\u636e\u5b58\u50a8$/);
  if (dataStoreMatch) {
    return $t('page.corp.version.dataStoreBenefit', {
      count: Number(dataStoreMatch[1]),
      unit: getDurationUnitLabel(dataStoreMatch[2])
    });
  }

  const priceMatch = value.match(/^(\d+)(\u5929|\u4e2a\u6708|\u6708|\u5e74)\s*￥([\d.]+)$/);
  if (priceMatch) {
    return $t('page.corp.version.priceDurationBenefit', {
      count: Number(priceMatch[1]),
      unit: getDurationUnitLabel(priceMatch[2]),
      price: priceMatch[3]
    });
  }

  return null;
}

function getDurationUnitLabel(sourceUnit: string) {
  if (sourceUnit === '\u4e2a\u6708' || sourceUnit === '\u6708') {
    return $t('page.corp.version.monthDurationUnit');
  }

  if (sourceUnit === '\u5e74') {
    return $t('page.corp.version.yearDurationUnit');
  }

  return $t('page.corp.version.dayDurationUnit');
}

function open(payload: BenefitPayload) {
  current.value = payload;
  visible.value = true;
}

defineExpose({
  open
});
</script>

<template>
  <NDrawer
    v-model:show="visible"
    :title="$t('page.corp.version.benefitView')"
    display-directive="show"
    :width="760"
    class="max-w-90%"
  >
    <NDrawerContent :title="$t('page.corp.version.benefitView')" :native-scrollbar="false" closable>
      <div v-if="row" class="flex-col gap-18px">
        <NDescriptions label-placement="left" bordered size="small" :column="2">
          <NDescriptionsItem :label="$t('page.corp.version.versionName')">{{ row.name || '-' }}</NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.corp.version.corp')">{{ current?.corpName || '-' }}</NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.corp.version.versionDesc')" :span="2">
            {{ row.desc || '-' }}
          </NDescriptionsItem>
        </NDescriptions>

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
          <div class="mb-10px text-15px font-600">{{ $t('page.corp.version.priceBenefit') }}</div>
          <NDescriptions label-placement="left" bordered size="small" :column="3">
            <NDescriptionsItem v-for="item in priceItems" :key="item.label" :label="item.label">
              {{ item.value }}
            </NDescriptionsItem>
          </NDescriptions>
        </div>

        <div>
          <div class="mb-10px text-15px font-600">{{ $t('page.corp.version.benefitSummary') }}</div>
          <NSpace v-if="benefitSummaryList.length" :size="[8, 8]">
            <NTag v-for="item in benefitSummaryList" :key="item.raw" type="info">{{ item.label }}</NTag>
          </NSpace>
          <NEmpty v-else :description="$t('page.corp.version.emptyBenefitSummary')" />
        </div>

        <div>
          <div class="mb-10px text-15px font-600">{{ $t('page.corp.version.menuBenefit') }}</div>
          <NSpace v-if="menuBenefitList.length" :size="[8, 8]">
            <NTag v-for="item in menuBenefitList" :key="item.raw" type="success">{{ item.label }}</NTag>
          </NSpace>
          <NEmpty v-else :description="$t('page.corp.version.emptyMenuBenefit')" />
        </div>

        <div>
          <div class="mb-10px text-15px font-600">{{ $t('page.corp.version.allBenefit') }}</div>
          <NSpace v-if="allBenefitList.length" :size="[8, 8]">
            <NTag v-for="item in allBenefitList" :key="item.raw">{{ item.label }}</NTag>
          </NSpace>
          <NEmpty v-else :description="$t('page.corp.version.emptyAllBenefit')" />
        </div>
      </div>
      <NEmpty v-else :description="$t('page.corp.version.emptyBenefitData')" />
    </NDrawerContent>
  </NDrawer>
</template>
