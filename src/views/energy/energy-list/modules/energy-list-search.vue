<script setup lang="ts">
import { computed, onMounted, ref, toRaw, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { jsonClone } from '@sa/utils';
import { ENERGY_TYPE_OPTIONS, STAT_TYPE_OPTIONS } from '@/constants/business';
import { fetchGetDeviceList } from '@/service/api/device';
import { fetchGetSpaceTrees } from '@/service/api/space';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { createDefaultDateRange, getDatePickerFormat, getDatePickerType } from './energy-list-date';

defineOptions({
  name: 'EnergyListSearch'
});

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.Energy.DevicePointEnergyListSearchParams>('model', { required: true });

const { formRef, validate, restoreValidation } = useNaiveForm();
const { loading: spaceLoading, startLoading: startSpaceLoading, endLoading: endSpaceLoading } = useLoading();

const energyTypeOptions = computed(() =>
  ENERGY_TYPE_OPTIONS.value.filter(option => {
    const value = Number(option.value);

    return value > 0 && value !== 6;
  })
);

const defaultModel = jsonClone(toRaw(model.value));
const spaceData = ref<Api.Space.Space[]>([]);
const expandedSpaceKeys = ref<CommonType.IdType[]>([]);

const dateRangeValue = computed({
  get(): [string, string] | null {
    const value = model.value.dateRange;

    return value ? ([String(value[0]), String(value[1])] as [string, string]) : null;
  },
  set(value: [string, string] | null) {
    model.value.dateRange = value ? [Number(value[0]), Number(value[1])] : null;
  }
});

const datePickerType = computed(() => getDatePickerType(model.value.aggregation_type));
const datePickerFormat = computed(() => getDatePickerFormat(model.value.aggregation_type));

function withDefaultSearchOption(params: Record<string, any>, defaultOption: CommonType.CommonTypeOptions) {
  const requestParams = params as CommonType.CommonListQueryParams;
  const listOption = requestParams.list_option ?? {};
  const options = Array.isArray(listOption.options) ? listOption.options : [];

  return {
    ...requestParams,
    list_option: {
      ...listOption,
      options: options.some(item => item.type === defaultOption.type) ? options : [defaultOption, ...options]
    }
  };
}

function fetchDeviceList(params: Record<string, any>) {
  return fetchGetDeviceList(withDefaultSearchOption(params, { type: 2, value: '' }));
}

async function getSpaceData() {
  startSpaceLoading();
  const { data, error } = await fetchGetSpaceTrees().finally(endSpaceLoading);

  if (error) {
    spaceData.value = [];
    return;
  }

  spaceData.value = Array.isArray(data?.trees) ? data.trees : [];
}

function resetModel() {
  const pageSize = model.value.pageSize;

  Object.assign(model.value, {
    ...defaultModel,
    pageSize,
    dateRange: createDefaultDateRange(defaultModel.aggregation_type)
  });
}

async function reset() {
  await restoreValidation();
  resetModel();
  emit('search');
}

async function search() {
  await validate();
  emit('search');
}

watch(
  () => model.value.aggregation_type,
  value => {
    model.value.dateRange = createDefaultDateRange(value);
  }
);

onMounted(getSpaceData);
</script>

<template>
  <NCard :bordered="false" size="small" class="table-search card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="energy-list-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:8" :label="$t('energy.aggregation')" path="aggregation_type" class="pr-24px">
              <NSelect
                v-model:value="model.aggregation_type"
                :options="STAT_TYPE_OPTIONS"
                :placeholder="$t('energy.selectAggregation')"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" :label="$t('energy.range')" path="dateRange" class="pr-24px">
              <NDatePicker
                :key="datePickerType"
                v-model:formatted-value="dateRangeValue"
                :type="datePickerType"
                :format="datePickerFormat"
                value-format="t"
                clearable
                :default-time="['00:00:00', '23:59:59']"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" :label="$t('energy.energyType')" path="energy_types" class="pr-24px">
              <NSelect
                v-model:value="model.energy_types"
                :options="energyTypeOptions"
                multiple
                clearable
                :placeholder="$t('energy.selectEnergyType')"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" :label="$t('energy.space')" path="space_id" class="pr-24px">
              <NTreeSelect
                v-model:value="model.space_id"
                v-model:expanded-keys="expandedSpaceKeys"
                :loading="spaceLoading"
                :options="spaceData"
                clearable
                filterable
                label-field="space_name"
                key-field="space_id"
                :placeholder="$t('energy.selectSpace')"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" :label="$t('energy.device')" path="device_ids" class="pr-24px">
              <RemoteSearchSelect
                v-model:value="model.device_ids"
                :request="fetchDeviceList"
                :search-type="2"
                label-field="name"
                value-field="id"
                :placeholder="$t('energy.selectDevice')"
                multiple
                clearable
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
