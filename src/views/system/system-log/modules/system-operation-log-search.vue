<script setup lang="ts">
import { ref, toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { fetchGetUserList } from '@/service/api/system';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { operateModuleOptions, operateTypeOptions } from './system-operation-log.constants';

defineOptions({
  name: 'SystemOperationLogSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.System.SystemOperationLogSearchParams>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));

const dateRangeCreateTime = ref<[string, string] | null>(null);

function onDateRangeCreateTimeUpdate(value: [string, string] | null) {
  if (!value) {
    model.value.dateRange = null;
    return;
  }

  const start = Number(value[0]);
  const end = Number(value[1]);

  model.value.dateRange = Number.isFinite(start) && Number.isFinite(end) ? [start, end] : null;
}

function fetchOperatorList(params: Record<string, any>) {
  const requestParams = params as CommonType.CommonListQueryParams;
  const listOption = requestParams.list_option ?? {};
  const options = Array.isArray(listOption.options) ? listOption.options : [];

  return fetchGetUserList({
    ...requestParams,
    list_option: {
      ...listOption,
      options: options.length > 0 ? options : [{ type: 4, value: '' }]
    }
  });
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
      <NCollapseItem :title="$t('common.search')" name="system-operation-log-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              span="24 s:12 m:8"
              :label="$t('systemLog.fields.operator')"
              label-width="auto"
              path="user_id"
              class="pr-24px"
            >
              <RemoteSearchSelect
                v-model:value="model.user_id"
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
              :label="$t('systemLog.fields.operateType')"
              label-width="auto"
              path="operate_type"
              class="pr-24px"
            >
              <NSelect
                v-model:value="model.operate_type"
                :options="operateTypeOptions"
                :placeholder="$t('systemLog.placeholders.operateType')"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:8"
              :label="$t('systemLog.fields.operateModule')"
              label-width="auto"
              path="operate_module"
              class="pr-24px"
            >
              <NSelect
                v-model:value="model.operate_module"
                :options="operateModuleOptions"
                :placeholder="$t('systemLog.placeholders.operateModule')"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:8"
              :label="$t('systemLog.fields.ip')"
              label-width="auto"
              path="ip"
              class="pr-24px"
            >
              <NInput
                v-model:value="model.ip"
                :placeholder="$t('systemLog.placeholders.ip')"
                clearable
                @keyup.enter="search"
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
