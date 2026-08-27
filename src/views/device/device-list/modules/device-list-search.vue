<script setup lang="ts">
import { computed, onMounted, ref, toRaw } from 'vue';
import { useLoading } from '@sa/hooks';
import { jsonClone } from '@sa/utils';
import { fetchGetDeviceGroupTrees, fetchGetDeviceTypeList } from '@/service/api/device';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'DeviceListSearch'
});

interface Emits {
  (e: 'search'): void;
}

interface Props {
  showDeviceType?: boolean;
  showDeviceGroup?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDeviceType: true,
  showDeviceGroup: true
});
const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();
const { loading: groupLoading, startLoading: startGroupLoading, endLoading: endGroupLoading } = useLoading();

const model = defineModel<Api.Device.DeviceSearchParams>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));
const groupData = ref<Api.Device.DeviceGroup[]>([]);
const expandedKeys = ref<CommonType.IdType[]>([]);

const deviceTypeRequestParams: CommonType.CommonListQueryParams = {
  list_option: {
    options: [{ type: 104, value: '101' }]
  }
};

const searchItemSpan = '24 s:12 m:8 xl:5';

const actionItemSpan = computed(() => {
  const visibleFieldCount = 2 + Number(props.showDeviceType) + Number(props.showDeviceGroup);
  const xlSpan = Math.max(4, 24 - visibleFieldCount * 5);

  return `24 s:12 m:8 xl:${xlSpan}`;
});

function fetchDeviceTypeList(params: Record<string, any>) {
  return fetchGetDeviceTypeList(params as CommonType.CommonListQueryParams);
}

async function getGroupData() {
  startGroupLoading();
  const { data, error } = await fetchGetDeviceGroupTrees().finally(endGroupLoading);

  if (error) {
    groupData.value = [];
    return;
  }

  groupData.value = Array.isArray(data?.device_group_trees) ? data.device_group_trees : [];
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

onMounted(() => {
  if (props.showDeviceGroup) {
    getGroupData();
  }
});
</script>

<template>
  <NCard size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="device-list-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="100">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi :span="searchItemSpan" label="设备名称" path="name" class="pr-24px" label-width="auto">
              <NInput v-model:value="model.name" clearable placeholder="请输入设备名称" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi :span="searchItemSpan" label="设备标识" path="key" class="pr-24px" label-width="auto">
              <NInput v-model:value="model.key" clearable placeholder="请输入设备标识" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi
              v-if="props.showDeviceType"
              :span="searchItemSpan"
              label="设备类型"
              path="device_type_id"
              class="pr-24px"
              label-width="auto"
            >
              <RemoteSearchSelect
                v-model:value="model.device_type_id"
                :request="fetchDeviceTypeList"
                :request-params="deviceTypeRequestParams"
                :search-type="1"
                label-field="name"
                value-field="id"
                clearable
                placeholder="请选择设备类型"
              />
            </NFormItemGi>
            <NFormItemGi
              v-if="props.showDeviceGroup"
              :span="searchItemSpan"
              label="设备组"
              path="device_group_id"
              class="pr-24px"
              label-width="auto"
            >
              <NTreeSelect
                v-model:value="model.device_group_id"
                v-model:expanded-keys="expandedKeys"
                :loading="groupLoading"
                :options="groupData"
                clearable
                filterable
                label-field="group_name"
                key-field="group_id"
                placeholder="请选择设备组"
              />
            </NFormItemGi>
            <NFormItemGi :show-feedback="false" :span="actionItemSpan" class="pr-24px">
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
