<script setup lang="ts">
import { computed, ref } from 'vue';
import { createReusableTemplate } from '@vueuse/core';
import { fetchGetHomeStatisticData } from '@/service/api/home';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
defineOptions({
  name: 'CardData'
});

interface StatisticData {
  corp_stat?: {
    total_num?: number;
  };
  project_stat?: {
    total_num?: number;
  };
  project_ad_stat?: {
    total_num?: number;
  };
  user_stat?: {
    total_num?: number;
  };
}

const statisticData = ref<StatisticData | null>(null);

async function getStatisticData() {
  const { data, error } = await fetchGetHomeStatisticData({
    options: [{ key: 1 }, { key: 2 }, { key: 3 }, { key: 4 }]
  });
  if (!error && data) {
    statisticData.value = data as unknown as StatisticData;
  }
}
getStatisticData();

interface CardData {
  key: string;
  title: string;
  value: number;
  unit: string;
  color: {
    start: string;
    end: string;
  };
  icon: string;
}

const cardData = computed<CardData[]>(() => [
  {
    key: 'integratorCount',
    title: $t('page.home.integratorCount'),
    value: statisticData.value?.corp_stat?.total_num ?? 0,
    unit: '',
    color: {
      start: '#ec4786',
      end: '#b955a4'
    },
    icon: 'ant-design:bar-chart-outlined'
  },
  {
    key: 'userCount',
    title: $t('page.home.userCount'),
    value: statisticData.value?.user_stat?.total_num ?? 0,
    unit: '$',
    color: {
      start: '#865ec0',
      end: '#5144b4'
    },
    icon: 'ant-design:money-collect-outlined'
  },
  {
    key: 'areaCount',
    title: $t('page.home.areaCount'),
    value: statisticData.value?.project_ad_stat?.total_num ?? 0,
    unit: '',
    color: {
      start: '#56cdf3',
      end: '#719de3'
    },
    icon: 'carbon:document-download'
  },
  {
    key: 'projectCount',
    title: $t('page.home.projectCount'),
    value: statisticData.value?.project_stat?.total_num ?? 0,
    unit: '',
    color: {
      start: '#fcbc25',
      end: '#f68057'
    },
    icon: 'ant-design:trademark-circle-outlined'
  }
]);

interface GradientBgProps {
  gradientColor: string;
}

const [DefineGradientBg, GradientBg] = createReusableTemplate<GradientBgProps>();

const themeStore = useThemeStore();

function getGradientColor(color: CardData['color']) {
  return `linear-gradient(to bottom right, ${color.start}, ${color.end})`;
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <!-- define component start: GradientBg -->
    <DefineGradientBg v-slot="{ $slots, gradientColor }">
      <div
        class="px-16px pb-4px pt-8px text-white"
        :style="{ backgroundImage: gradientColor, borderRadius: themeStore.themeRadius + 'px' }"
      >
        <component :is="$slots.default" />
      </div>
    </DefineGradientBg>
    <!-- define component end: GradientBg -->

    <NGrid cols="s:1 m:2 l:4" responsive="screen" :x-gap="16" :y-gap="16">
      <NGi v-for="item in cardData" :key="item.key">
        <GradientBg :gradient-color="getGradientColor(item.color)" class="flex-1">
          <h3 class="text-16px">{{ item.title }}</h3>
          <div class="flex justify-between pt-12px">
            <SvgIcon :icon="item.icon" class="text-32px" />
            <CountTo
              :prefix="item.unit"
              :start-value="1"
              :end-value="item.value"
              class="text-30px text-white dark:text-dark"
            />
          </div>
        </GradientBg>
      </NGi>
    </NGrid>
  </NCard>
</template>

<style scoped></style>
