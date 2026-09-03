<script setup lang="ts">
import { computed, ref, toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { fetchGetDeviceList, fetchGetLogicPointList } from '@/service/api/device';
import { fetchGetUserList } from '@/service/api/system';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'DeviceOperationLogSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.System.DeviceOperationLogSearchParams>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));

const dateRangeCreateTime = ref<[string, string] | null>(null);

const logicPointRequestParams = computed<CommonType.CommonListQueryParams>(() => {
  const options =
    model.value.device_id === null || model.value.device_id === undefined || model.value.device_id === ''
      ? []
      : [{ type: 2, value: String(model.value.device_id) }];

  return {
    list_option: {
      options
    }
  };
});

function onDateRangeCreateTimeUpdate(value: [string, string] | null) {
  if (!value) {
    model.value.dateRange = null;
    return;
  }

  const start = Number(value[0]);
  const end = Number(value[1]);

  model.value.dateRange = Number.isFinite(start) && Number.isFinite(end) ? [start, end] : null;
}

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

function fetchLogicPointList(params: Record<string, any>) {
  return fetchGetLogicPointList(withDefaultSearchOption(params, { type: 7, value: '' }));
}

function fetchOperatorList(params: Record<string, any>) {
  return fetchGetUserList(withDefaultSearchOption(params, { type: 4, value: '' }));
}

function resetModel() {
  const pageSize = model.value.pageSize;

  dateRangeCreateTime.value = null;
  Object.assign(model.value, {
    ...defaultModel,
    pageSize
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
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="device-operation-log-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              span="24 s:12 m:8"
              :label="$t('systemLog.fields.device')"
              label-width="auto"
              path="device_id"
              class="pr-24px"
            >
              <RemoteSearchSelect
                v-model:value="model.device_id"
                :request="fetchDeviceList"
                :search-type="2"
                label-field="name"
                value-field="id"
                :placeholder="$t('systemLog.placeholders.device')"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:8"
              :label="$t('systemLog.fields.point')"
              label-width="auto"
              path="physical_point_id"
              class="pr-24px"
            >
              <RemoteSearchSelect
                v-model:value="model.physical_point_id"
                :request="fetchLogicPointList"
                :request-params="logicPointRequestParams"
                :search-type="7"
                label-field="name"
                value-field="id"
                :placeholder="$t('systemLog.placeholders.point')"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:8"
              :label="$t('systemLog.fields.operator')"
              label-width="auto"
              path="operator_id"
              class="pr-24px"
            >
              <RemoteSearchSelect
                v-model:value="model.operator_id"
                :request="fetchOperatorList"
                :search-type="4"
                label-field="username"
                value-field="user_id"
                :placeholder="$t('systemLog.placeholders.operator')"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:8"
              :label="$t('systemLog.fields.time')"
              label-width="auto"
              path="dateRange"
              class="pr-24px"
            >
              <NDatePicker
                v-model:formatted-value="dateRangeCreateTime"
                type="datetimerange"
                value-format="t"
                clearable
                :default-time="['00:00:00', '23:59:59']"
                @update:formatted-value="onDateRangeCreateTimeUpdate"
              />
            </NFormItemGi>
            <NFormItemGi :show-feedback="false" span="24 s:12 m:16" class="pr-24px">
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
