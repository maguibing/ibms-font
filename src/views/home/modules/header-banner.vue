<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue';
import { fetchGetWeather } from '@/service/api/home';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';
import { sessionStg } from '@/utils/storage';
import defaultAvatar from '@/assets/imgs/soybean.jpg';
import { $t } from '@/locales';

defineOptions({
  name: 'HeaderBanner'
});

const ipLocationUrl = 'https://api.ip.sb/geoip/';

const appStore = useAppStore();
const authStore = useAuthStore();

const weather = shallowRef<Api.Home.Weather | null>(null);
const gap = computed(() => (appStore.isMobile ? 0 : 16));

const weatherSummary = computed(() => {
  if (!weather.value) {
    return '';
  }

  return `${weather.value.date}，${weather.value.weather}，${weather.value.min_temperature}℃ - ${weather.value.max_temperature}℃，${weather.value.wind_direction} ${weather.value.wind_speed}`;
});

async function getWeatherCoordinates() {
  const cachedCoordinates = sessionStg.get('weatherCoordinates');
  if (cachedCoordinates) {
    return cachedCoordinates;
  }

  const response = await fetch(ipLocationUrl);
  const data = (await response.json()) as Api.Home.WeatherCoordinates;
  const coordinates = {
    latitude: data.latitude,
    longitude: data.longitude
  };

  sessionStg.set('weatherCoordinates', coordinates);

  return coordinates;
}

async function loadWeather() {
  try {
    const coordinates = await getWeatherCoordinates();
    const { data, error } = await fetchGetWeather({
      coordinates,
      weather_way: 1
    });

    if (error || !data) {
      return;
    }

    weather.value = data.weather;
  } catch {
    weather.value = null;
  }
}

onMounted(loadWeather);
</script>

<template>
  <NCard :bordered="false" class="card-wrapper">
    <NGrid :x-gap="gap" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="24">
        <div class="flex-y-center">
          <div class="size-72px shrink-0 overflow-hidden rd-1/2">
            <img :src="defaultAvatar" class="size-full" />
          </div>
          <div class="pl-12px">
            <h3 class="text-18px font-semibold">
              {{
                $t('page.home.greeting', {
                  userName: authStore.userInfo.user?.username || 'admin'
                })
              }}
            </h3>
            <p v-if="weatherSummary" class="text-#999 leading-30px">{{ weatherSummary }}</p>
          </div>
        </div>
      </NGi>
    </NGrid>
  </NCard>
</template>

<style scoped></style>
