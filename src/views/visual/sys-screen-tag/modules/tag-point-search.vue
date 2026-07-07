<script setup lang="ts">
import { computed, toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { fetchGetDeviceList, fetchGetLogicPointList } from '@/service/api/device';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'ProjectSysScreenTagPointSearch'
});

interface Emits {
  (e: 'search'): void;
}

interface Props {
  projectSysScreenId?: CommonType.IdType | null;
  projectSysScreenTagId?: CommonType.IdType | null;
}

const props = withDefaults(defineProps<Props>(), {
  projectSysScreenId: null,
  projectSysScreenTagId: null
});
const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.Visual.ProjectSysScreenTagPointSearchParams>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));

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

function buildRequestParams(): CommonType.CommonListQueryParams {
  const pageNum = model.value.pageNum || 1;
  const pageSize = model.value.pageSize || 10;
  const filterConfigs = [
    { type: 1, value: props.projectSysScreenId },
    { type: 2, value: props.projectSysScreenTagId },
    { type: 3, value: model.value.logic_point_id },
    { type: 4, value: model.value.mapping_point_name }
  ];

  const options = filterConfigs
    .filter(item => item.value !== null && item.value !== undefined && item.value !== '')
    .map(({ type, value }) => ({ type, value: String(value) }));

  return {
    list_option: {
      offset: (pageNum - 1) * pageSize,
      limit: pageSize,
      options
    },
    options: [{ key: 1 }, { key: 2 }, { key: 4 }]
  };
}

function handleLogicPointSelectedChange() {
  model.value.logic_point_id = null;
}

function resetModel() {
  const pageSize = model.value.pageSize;

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

defineExpose({
  buildRequestParams
});
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="tag-point-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="90">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:8" label="设备名称" label-width="auto" path="device_id" class="pr-24px">
              <RemoteSearchSelect
                v-model:value="model.device_id"
                :request="fetchDeviceList"
                :search-type="2"
                label-field="name"
                value-field="id"
                placeholder="请选择设备"
                clearable
                @selected-change="handleLogicPointSelectedChange"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" label="点位标识" label-width="auto" path="logic_point_id" class="pr-24px">
              <RemoteSearchSelect
                v-model:value="model.logic_point_id"
                :request="fetchLogicPointList"
                :request-params="logicPointRequestParams"
                :search-type="7"
                label-field="name"
                value-field="id"
                placeholder="请选择点位标识"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:8"
              label="映射点位名称"
              label-width="auto"
              path="mapping_point_name"
              class="pr-24px"
            >
              <NInput
                v-model:value="model.mapping_point_name"
                clearable
                placeholder="请输入映射点位名称"
                @keyup.enter="search"
              />
            </NFormItemGi>
            <NFormItemGi :show-feedback="false" span="24 s:12 m:24" class="pr-24px">
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
