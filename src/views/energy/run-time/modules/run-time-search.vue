<script setup lang="ts">
import { computed } from 'vue';
import { fetchGetDeviceList } from '@/service/api/device';
import { $t } from '@/locales';

defineOptions({
  name: 'RunTimeSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.Energy.DevicePointEnergySearchParams>('model', { required: true });

const dateRangeValue = computed({
  get(): [string, string] | null {
    const value = model.value.dateRange;

    return value ? ([String(value[0]), String(value[1])] as [string, string]) : null;
  },
  set(value: [string, string] | null) {
    model.value.dateRange = value ? [Number(value[0]), Number(value[1])] : null;
  }
});

function search() {
  emit('search');
}

function reset() {
  emit('reset');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="table-search card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="energy-run-time-search">
        <NForm :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:8" label="设备名称" path="device_names" class="pr-24px">
              <RemoteSearchSelect
                v-model:value="model.device_names"
                :request="fetchGetDeviceList"
                :search-type="2"
                label-field="name"
                value-field="id"
                placeholder="请选择设备"
                multiple
                clearable
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" label="统计日期" path="dateRange" class="pr-24px">
              <NDatePicker
                v-model:formatted-value="dateRangeValue"
                type="datetimerange"
                value-format="t"
                clearable
                :default-time="['00:00:00', '23:59:59']"
              />
            </NFormItemGi>
            <NFormItemGi :show-feedback="false" span="24 s:12 m:8" class="pr-24px">
              <NSpace class="w-full" justify="end">
                <NButton type="primary" ghost @click="search">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  {{ $t('common.search') }}
                </NButton>
                <NButton @click="reset">
                  <template #icon>
                    <icon-ic-round-refresh class="text-icon" />
                  </template>
                  {{ $t('common.reset') }}
                </NButton>
              </NSpace>
            </NFormItemGi>
          </NGrid>
        </NForm>
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>

<style scoped></style>
