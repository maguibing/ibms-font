<script setup lang="ts">
import { computed, shallowRef } from 'vue';

defineOptions({
  name: 'VersionBenefitDrawer'
});

type BenefitPayload = {
  row: Api.System.CorpProjectVersion;
  corpName?: string;
  randomList?: string[];
  allList?: string[];
};

const visible = shallowRef(false);
const current = shallowRef<BenefitPayload | null>(null);

const row = computed(() => current.value?.row ?? null);
const randomList = computed(() => current.value?.randomList ?? []);
const allList = computed(() => current.value?.allList ?? []);
const menuIds = computed(() => row.value?.menu_conf?.menu_id_list ?? []);
const menuBenefitList = computed(() => {
  const menuNames = allList.value.filter(item => !isResourceOrPriceBenefit(item));

  if (menuNames.length) return menuNames;

  return menuIds.value.map(id => `菜单ID：${id}`);
});

const resourceItems = computed(() => {
  const resourceConf = row.value?.resource_conf;

  return [
    { label: '设备数', value: formatCount(resourceConf?.device_num, '个设备') },
    { label: '用户数', value: formatCount(resourceConf?.project_user_num, '个用户') },
    { label: '日消息数', value: formatCount(resourceConf?.day_msg_num, '条') },
    { label: '数据存储', value: formatCount(resourceConf?.data_store_day, '天') }
  ];
});

const priceItems = computed(() => {
  const priceConf = row.value?.price_conf;

  return [
    { label: '原价', value: formatPrice(priceConf?.original_price) },
    { label: '折扣价', value: formatPrice(priceConf?.discount_price) },
    { label: '时长', value: formatCount(priceConf?.day, '天') }
  ];
});

function formatCount(value: number | undefined, unit: string) {
  if (value === undefined || value === null) return '-';

  return `${value}${unit}`;
}

function formatPrice(value: number | undefined) {
  if (value === undefined || value === null) return '-';

  return `￥${Number(value).toFixed(2)}`;
}

function isResourceOrPriceBenefit(value: string) {
  return /^(\d+个设备|\d+天数据存储|\d+条日消息数|\d+个用户|\d+天 ￥)/.test(value);
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
  <NDrawer v-model:show="visible" title="权益查看" display-directive="show" :width="760" class="max-w-90%">
    <NDrawerContent title="权益查看" :native-scrollbar="false" closable>
      <div v-if="row" class="flex-col gap-18px">
        <NDescriptions label-placement="left" bordered size="small" :column="2">
          <NDescriptionsItem label="版本名称">{{ row.name || '-' }}</NDescriptionsItem>
          <NDescriptionsItem label="集成商">{{ current?.corpName || '-' }}</NDescriptionsItem>
          <NDescriptionsItem label="版本简介" :span="2">{{ row.desc || '-' }}</NDescriptionsItem>
        </NDescriptions>

        <div>
          <div class="mb-10px text-15px font-600">资源配置</div>
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
          <div class="mb-10px text-15px font-600">价格权益</div>
          <NDescriptions label-placement="left" bordered size="small" :column="3">
            <NDescriptionsItem v-for="item in priceItems" :key="item.label" :label="item.label">
              {{ item.value }}
            </NDescriptionsItem>
          </NDescriptions>
        </div>

        <div>
          <div class="mb-10px text-15px font-600">权益摘要</div>
          <NSpace v-if="randomList.length" :size="[8, 8]">
            <NTag v-for="item in randomList" :key="item" type="info">{{ item }}</NTag>
          </NSpace>
          <NEmpty v-else description="暂无权益摘要" />
        </div>

        <div>
          <div class="mb-10px text-15px font-600">菜单权益</div>
          <NSpace v-if="menuBenefitList.length" :size="[8, 8]">
            <NTag v-for="item in menuBenefitList" :key="item" type="success">{{ item }}</NTag>
          </NSpace>
          <NEmpty v-else description="暂无菜单权益" />
        </div>

        <div>
          <div class="mb-10px text-15px font-600">全部权益</div>
          <NSpace v-if="allList.length" :size="[8, 8]">
            <NTag v-for="item in allList" :key="item">{{ item }}</NTag>
          </NSpace>
          <NEmpty v-else description="暂无全部权益" />
        </div>
      </div>
      <NEmpty v-else description="暂无权益数据" />
    </NDrawerContent>
  </NDrawer>
</template>
