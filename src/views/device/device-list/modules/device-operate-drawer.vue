<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import {
  fetchCreateDevice,
  fetchGetDevice,
  fetchGetDeviceGroupTrees,
  fetchGetDeviceTypeList,
  fetchUpdateDevice
} from '@/service/api/device';
import { fetchGetSpaceTrees } from '@/service/api/space';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'DeviceOperateDrawer'
});

interface Emits {
  (e: 'submitted'): void;
}

interface Props {
  operateType?: NaiveUI.TableOperateType;
  rowId?: CommonType.IdType | null;
  defaultDeviceTypeId?: CommonType.IdType | null;
  defaultDeviceType?: Api.Device.DeviceType | null;
  lockDeviceType?: boolean;
}

type CreateMode = 'batch' | 'custom';
type Model = Omit<Api.Device.CreateDeviceParams, 'add_num' | 'device_group_id' | 'device_type_id' | 'space_id'> & {
  add_num: number | null;
  device_group_id: CommonType.IdType | null;
  device_type_id: CommonType.IdType | null;
  space_id: CommonType.IdType | null;
};

const props = withDefaults(defineProps<Props>(), {
  operateType: 'add',
  rowId: null,
  defaultDeviceTypeId: null,
  defaultDeviceType: null,
  lockDeviceType: false
});
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();
const { loading: groupLoading, startLoading: startGroupLoading, endLoading: endGroupLoading } = useLoading();
const { loading: spaceLoading, startLoading: startSpaceLoading, endLoading: endSpaceLoading } = useLoading();

const createMode = shallowRef<CreateMode>('batch');
const selectedDeviceType = shallowRef<Api.Device.DeviceType | null>(null);
const spaceData = ref<Api.Space.Space[]>([]);
const groupData = ref<Api.Device.DeviceGroup[]>([]);
const expandedSpaceKeys = ref<CommonType.IdType[]>([]);
const expandedKeys = ref<CommonType.IdType[]>([]);
const model = ref<Model>(createDefaultModel());

const deviceTypeRequestParams: CommonType.CommonListQueryParams = {
  list_option: {
    options: [{ type: 104, value: '101' }]
  }
};

const fixedDefaultDeviceTypeId = computed(() => props.defaultDeviceType?.id ?? props.defaultDeviceTypeId ?? null);

const defaultDeviceTypeName = computed(() => props.defaultDeviceType?.name ?? '');

const isEdit = computed(() => props.operateType === 'edit');

const title = computed(() => (isEdit.value ? $t('deviceList.edit') : $t('deviceList.add')));

const rules = computed<Record<string, App.Global.FormRule | App.Global.FormRule[]>>(() => {
  const baseRules: Record<string, App.Global.FormRule | App.Global.FormRule[]> = {
    device_type_id: createRequiredRule($t('deviceList.typePlaceholder')),
    status: createRequiredRule($t('deviceList.statusPlaceholder'))
  };

  if (isEdit.value) return baseRules;

  if (createMode.value === 'batch') {
    return {
      ...baseRules,
      add_num: [
        createRequiredRule($t('deviceList.addCountPlaceholder')),
        {
          trigger: ['input', 'blur'],
          validator: (_rule: unknown, value: number | null) => {
            if (value === null || value === undefined) return true;

            if (!Number.isInteger(value) || Number(value) < 1) {
              return new Error($t('deviceList.addCountInvalid'));
            }

            return true;
          }
        }
      ],
      add_key_start: [
        createRequiredRule($t('deviceList.keyStartPlaceholder')),
        {
          trigger: ['input', 'blur'],
          validator: (_rule: unknown, value: string | null) => {
            const inputValue = String(value ?? '');

            if (!inputValue) return true;

            const start = inputValue.trim();

            if (!start || !/^\d+$/.test(start)) {
              return new Error($t('deviceList.keyStartInvalid'));
            }

            return true;
          }
        }
      ]
    };
  }

  return {
    ...baseRules,
    name: createRequiredRule($t('deviceList.namePlaceholder')),
    key: createRequiredRule($t('deviceList.customIdentifierPlaceholder'))
  };
});

const selectedDeviceTypeKey = computed(() => selectedDeviceType.value?.key?.trim() || '');

const previewData = computed(() => {
  const typeKey = selectedDeviceTypeKey.value;
  const start = String(model.value.add_key_start ?? '').trim();
  const count = Number(model.value.add_num ?? 0);

  if (!typeKey || !/^\d+$/.test(start) || !Number.isInteger(count) || count < 1) {
    return {
      firstItems: [],
      lastItem: '',
      omittedItems: []
    };
  }

  const startNumber = Number(start);
  const width = start.length;
  const createPreviewItem = (index: number) => `${typeKey}_${String(startNumber + index).padStart(width, '0')}`;

  if (count <= 5) {
    return {
      firstItems: Array.from({ length: count }, (_, index) => createPreviewItem(index)),
      lastItem: '',
      omittedItems: []
    };
  }

  return {
    firstItems: Array.from({ length: 4 }, (_, index) => createPreviewItem(index)),
    lastItem: createPreviewItem(count - 1),
    omittedItems: Array.from({ length: count - 5 }, (_, index) => createPreviewItem(index + 4))
  };
});

const previewItems = computed(() => previewData.value.firstItems);

const hasMorePreview = computed(() => Boolean(previewData.value.lastItem));

const lastPreviewItem = computed(() => previewData.value.lastItem);

const omittedPreviewTitle = computed(() => {
  return previewData.value.omittedItems.join('、');
});

function createDefaultModel(): Model {
  return {
    add_key_start: '01',
    add_num: 1,
    desc: '',
    device_group_id: null,
    device_type_id: null,
    key: '',
    name: '',
    space_id: null,
    status: 1
  };
}

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

async function getSpaceData() {
  startSpaceLoading();
  const { data, error } = await fetchGetSpaceTrees().finally(endSpaceLoading);

  if (error) {
    spaceData.value = [];
    return;
  }

  spaceData.value = Array.isArray(data?.trees) ? data.trees : [];
}

function handleDeviceTypeChange(option: Record<string, any> | Record<string, any>[] | null) {
  selectedDeviceType.value = Array.isArray(option) ? null : (option as Api.Device.DeviceType | null);
}

function resetModel() {
  const defaultModel = createDefaultModel();

  defaultModel.device_type_id = fixedDefaultDeviceTypeId.value;
  model.value = defaultModel;
  createMode.value = 'batch';
  selectedDeviceType.value = props.defaultDeviceType ?? null;
  expandedSpaceKeys.value = [];
  expandedKeys.value = [];
}

function getDeviceGroupId(device: Api.Device.Device) {
  return device.device_group_id ?? device.group_id ?? null;
}

function fillModel(device: Api.Device.Device) {
  model.value = {
    ...createDefaultModel(),
    desc: device.desc ?? '',
    device_group_id: getDeviceGroupId(device),
    device_type_id: props.lockDeviceType
      ? fixedDefaultDeviceTypeId.value
      : (device.device_type_id ?? fixedDefaultDeviceTypeId.value),
    space_id: device.space_id ?? null,
    status: Number(device.status) === 1 ? 1 : 2
  };
  selectedDeviceType.value = props.defaultDeviceType ?? null;
}

async function handleUpdateModel() {
  resetModel();

  if (!isEdit.value || props.rowId === null || props.rowId === undefined) return;

  startLoading();
  const { data, error } = await fetchGetDevice({ id: props.rowId }).finally(endLoading);
  if (error || !visible.value || !isEdit.value) return;

  const device = data?.device;
  if (device) {
    fillModel(device);
  }
}

function closeDrawer() {
  visible.value = false;
}

function buildCommonSubmitData(): Omit<Api.Device.UpdateDeviceParams, 'id'> {
  return {
    desc: model.value.desc ?? '',
    device_group_id: model.value.device_group_id ?? 0,
    device_type_id: model.value.device_type_id as CommonType.IdType,
    space_id: model.value.space_id ?? 0,
    status: Number(model.value.status ?? 1)
  };
}

function buildCreateSubmitData(): Api.Device.CreateDeviceParams {
  const commonParams = buildCommonSubmitData();

  if (createMode.value === 'batch') {
    return {
      ...commonParams,
      add_key_start: String(model.value.add_key_start ?? '').trim(),
      add_num: Number(model.value.add_num ?? 0),
      key: '',
      name: ''
    };
  }

  return {
    ...commonParams,
    add_key_start: '',
    add_num: 0,
    key: String(model.value.key ?? '').trim(),
    name: String(model.value.name ?? '').trim()
  };
}

async function handleSubmit() {
  if (loading.value) return;

  await validate();
  startLoading();

  if (isEdit.value) {
    if (props.rowId === null || props.rowId === undefined) {
      endLoading();
      return;
    }

    const { error } = await fetchUpdateDevice({
      id: props.rowId,
      ...buildCommonSubmitData()
    }).finally(endLoading);
    if (error) return;

    window.$message?.success($t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
    return;
  }

  const { error } = await fetchCreateDevice(buildCreateSubmitData()).finally(endLoading);
  if (error) return;

  window.$message?.success($t('common.addSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    getSpaceData();
    getGroupData();
    handleUpdateModel().then(() => restoreValidation());
  }
});

watch(createMode, () => {
  restoreValidation();
});

watch(
  () => [props.defaultDeviceTypeId, props.defaultDeviceType] as const,
  () => {
    if (!visible.value || !props.lockDeviceType) return;

    model.value.device_type_id = fixedDefaultDeviceTypeId.value;
    selectedDeviceType.value = props.defaultDeviceType ?? null;
  }
);
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="720" class="max-w-95%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NSpin :show="loading">
        <NForm ref="formRef" :model="model" :rules="rules" label-placement="top" class="flex flex-col gap-6px">
          <NFormItem :label="$t('deviceList.space')" path="space_id">
            <NTreeSelect
              v-model:value="model.space_id"
              v-model:expanded-keys="expandedSpaceKeys"
              :loading="spaceLoading"
              :options="spaceData"
              clearable
              filterable
              label-field="space_name"
              key-field="space_id"
              :placeholder="$t('deviceList.spacePlaceholder')"
            />
          </NFormItem>

          <NFormItem :label="$t('deviceList.type')" path="device_type_id">
            <NInput
              v-if="props.lockDeviceType || isEdit"
              :value="defaultDeviceTypeName"
              disabled
              :placeholder="$t('deviceList.currentTypePlaceholder')"
            />
            <RemoteSearchSelect
              v-else
              v-model:value="model.device_type_id"
              :request="fetchDeviceTypeList"
              :request-params="deviceTypeRequestParams"
              :search-type="1"
              :selected-options="selectedDeviceType"
              label-field="name"
              value-field="id"
              clearable
              :placeholder="$t('deviceList.typePlaceholder')"
              @selected-change="handleDeviceTypeChange"
            />
          </NFormItem>

          <div
            v-if="!isEdit"
            class="mb-8px rounded-8px border border-primary/45 bg-primary/8 px-12px pb-0 pt-10px [&_.n-form-item]:mb-8px"
          >
            <div class="mb-8px flex items-center justify-between gap-8px lt-sm:flex-col lt-sm:items-start">
              <div class="inline-flex items-center gap-4px text-13px text-primary font-600 leading-18px">
                <icon-ic-round-settings class="text-14px" />
                <span>{{ $t('deviceList.createSettings') }}</span>
              </div>
              <NRadioGroup v-model:value="createMode" name="device-create-mode" size="small">
                <NRadioButton value="batch">{{ $t('deviceList.batchAdd') }}</NRadioButton>
                <NRadioButton value="custom">{{ $t('deviceList.customAdd') }}</NRadioButton>
              </NRadioGroup>
            </div>

            <template v-if="createMode === 'batch'">
              <NGrid responsive="screen" item-responsive class="setting-grid">
                <NFormItemGi
                  span="24 m:12"
                  :label="$t('deviceList.addCount')"
                  path="add_num"
                  class="pr-16px"
                  feedback-class="whitespace-nowrap"
                >
                  <NInputNumber
                    v-model:value="model.add_num"
                    class="w-full"
                    :min="1"
                    :precision="0"
                    :placeholder="$t('deviceList.addCountPlaceholder')"
                  />
                </NFormItemGi>
                <NFormItemGi
                  span="24 m:12"
                  :label="$t('deviceList.keyStart')"
                  path="add_key_start"
                  feedback-class="whitespace-nowrap"
                >
                  <NInput
                    v-model:value="model.add_key_start"
                    maxlength="12"
                    :placeholder="$t('deviceList.keyStartPlaceholder')"
                  />
                </NFormItemGi>
                <NGridItem v-if="selectedDeviceTypeKey" span="24" class="mb-4px mt--12px">
                  <div class="min-w-0 flex items-center gap-8px">
                    <span class="shrink-0 text-13px text-primary font-500 leading-34px">
                      {{ $t('deviceList.identifierPreview') }}
                    </span>
                    <div
                      v-if="previewItems.length"
                      class="min-w-0 flex flex-nowrap items-center gap-6px overflow-hidden"
                    >
                      <span
                        v-for="item in previewItems"
                        :key="item"
                        class="min-w-0 max-w-150px basis-auto shrink grow-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-4px border border-primary/14 bg-[rgb(var(--base-color))] px-7px py-3px font-mono text-12px text-primary leading-18px"
                        :title="item"
                      >
                        {{ item }}
                      </span>
                      <span
                        v-if="hasMorePreview"
                        class="inline-flex flex-none items-center text-12px text-[var(--n-text-color-disabled)] leading-18px"
                        :title="omittedPreviewTitle"
                      >
                        ...
                      </span>
                      <span
                        v-if="lastPreviewItem"
                        class="min-w-0 max-w-150px basis-auto shrink grow-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-4px border border-primary/14 bg-[rgb(var(--base-color))] px-7px py-3px font-mono text-12px text-primary leading-18px"
                        :title="lastPreviewItem"
                      >
                        {{ lastPreviewItem }}
                      </span>
                    </div>
                    <NText v-else depth="3">{{ $t('deviceList.previewHint') }}</NText>
                  </div>
                </NGridItem>
              </NGrid>
            </template>

            <template v-else>
              <NGrid responsive="screen" item-responsive class="setting-grid">
                <NFormItemGi span="24 m:12" :label="$t('deviceList.name')" path="name" class="pr-16px">
                  <NInput
                    v-model:value="model.name"
                    maxlength="30"
                    show-count
                    :placeholder="$t('deviceList.namePlaceholder')"
                  />
                </NFormItemGi>
                <NFormItemGi span="24 m:12" :label="$t('deviceList.customIdentifier')" path="key">
                  <NInput
                    v-model:value="model.key"
                    maxlength="48"
                    show-count
                    :placeholder="$t('deviceList.customIdentifierPlaceholder')"
                  />
                </NFormItemGi>
              </NGrid>
            </template>
          </div>

          <NFormItem :label="$t('deviceList.group')" path="device_group_id">
            <NTreeSelect
              v-model:value="model.device_group_id"
              v-model:expanded-keys="expandedKeys"
              :loading="groupLoading"
              :options="groupData"
              clearable
              filterable
              label-field="group_name"
              key-field="group_id"
              :placeholder="$t('deviceList.groupPlaceholder')"
            />
          </NFormItem>

          <NFormItem :label="$t('deviceList.status')" path="status">
            <NSwitch v-model:value="model.status" :checked-value="1" :unchecked-value="2">
              <template #checked>{{ $t('deviceList.enabled') }}</template>
              <template #unchecked>{{ $t('deviceList.disabled') }}</template>
            </NSwitch>
          </NFormItem>

          <NFormItem :label="$t('deviceList.description')" path="desc">
            <NInput
              v-model:value="model.desc"
              type="textarea"
              maxlength="200"
              show-count
              :rows="5"
              :placeholder="$t('deviceList.descriptionPlaceholder')"
            />
          </NFormItem>
        </NForm>
      </NSpin>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
