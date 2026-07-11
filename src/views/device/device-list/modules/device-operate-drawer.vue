<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchCreateDevice, fetchGetDeviceGroupTrees, fetchGetDeviceTypeList } from '@/service/api/device';
import { fetchGetSpaceTrees } from '@/service/api/space';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'DeviceOperateDrawer'
});

interface Emits {
  (e: 'submitted'): void;
}

type CreateMode = 'batch' | 'custom';
type Model = Omit<Api.Device.CreateDeviceParams, 'add_num' | 'device_group_id' | 'device_type_id' | 'space_id'> & {
  add_num: number | null;
  device_group_id: CommonType.IdType | null;
  device_type_id: CommonType.IdType | null;
  space_id: CommonType.IdType | null;
};

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

const rules = computed<Record<string, App.Global.FormRule | App.Global.FormRule[]>>(() => {
  const baseRules: Record<string, App.Global.FormRule | App.Global.FormRule[]> = {
    device_type_id: createRequiredRule('请选择设备类型'),
    status: createRequiredRule('请选择状态')
  };

  if (createMode.value === 'batch') {
    return {
      ...baseRules,
      add_num: [
        createRequiredRule('请输入新增数量'),
        {
          trigger: ['input', 'blur'],
          validator: (_rule: unknown, value: number | null) => {
            if (value === null || value === undefined) return true;

            if (!Number.isInteger(value) || Number(value) < 1) {
              return new Error('新增数量必须大于 0');
            }

            return true;
          }
        }
      ],
      add_key_start: [
        createRequiredRule('请输入编号起始值'),
        {
          trigger: ['input', 'blur'],
          validator: (_rule: unknown, value: string | null) => {
            const inputValue = String(value ?? '');

            if (!inputValue) return true;

            const start = inputValue.trim();

            if (!start || !/^\d+$/.test(start)) {
              return new Error('编号起始值只能输入数字');
            }

            return true;
          }
        }
      ]
    };
  }

  return {
    ...baseRules,
    name: createRequiredRule('请输入设备名称'),
    key: createRequiredRule('请输入自定义标识')
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
  model.value = createDefaultModel();
  createMode.value = 'batch';
  selectedDeviceType.value = null;
  expandedSpaceKeys.value = [];
  expandedKeys.value = [];
}

function closeDrawer() {
  visible.value = false;
}

function buildSubmitData(): Api.Device.CreateDeviceParams {
  const commonParams = {
    desc: model.value.desc ?? '',
    device_group_id: model.value.device_group_id ?? 0,
    device_type_id: model.value.device_type_id as CommonType.IdType,
    space_id: model.value.space_id ?? 0,
    status: Number(model.value.status ?? 1)
  };

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

  const { error } = await fetchCreateDevice(buildSubmitData()).finally(endLoading);
  if (error) return;

  window.$message?.success($t('common.addSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    resetModel();
    getSpaceData();
    getGroupData();
    restoreValidation();
  }
});

watch(createMode, () => {
  restoreValidation();
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="720" class="max-w-95%">
    <NDrawerContent title="创建设备" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top" class="flex flex-col gap-6px">
        <NFormItem label="所属空间" path="space_id">
          <NTreeSelect
            v-model:value="model.space_id"
            v-model:expanded-keys="expandedSpaceKeys"
            :loading="spaceLoading"
            :options="spaceData"
            clearable
            filterable
            label-field="space_name"
            key-field="space_id"
            placeholder="请选择所属空间"
          />
        </NFormItem>

        <NFormItem label="设备类型" path="device_type_id">
          <RemoteSearchSelect
            v-model:value="model.device_type_id"
            :request="fetchDeviceTypeList"
            :request-params="deviceTypeRequestParams"
            :search-type="1"
            label-field="name"
            value-field="id"
            clearable
            placeholder="请选择设备类型"
            @selected-change="handleDeviceTypeChange"
          />
        </NFormItem>

        <div
          class="mb-8px rounded-8px border border-primary/45 bg-primary/8 px-12px pb-0 pt-10px [&_.n-form-item]:mb-8px"
        >
          <div class="mb-8px flex items-center justify-between gap-8px lt-sm:flex-col lt-sm:items-start">
            <div class="inline-flex items-center gap-4px text-13px text-primary font-600 leading-18px">
              <icon-ic-round-settings class="text-14px" />
              <span>创建设置</span>
            </div>
            <NRadioGroup v-model:value="createMode" name="device-create-mode" size="small">
              <NRadioButton value="batch">批量新增</NRadioButton>
              <NRadioButton value="custom">自定义新增</NRadioButton>
            </NRadioGroup>
          </div>

          <template v-if="createMode === 'batch'">
            <NGrid responsive="screen" item-responsive class="setting-grid">
              <NFormItemGi
                span="24 m:12"
                label="新增数量"
                path="add_num"
                class="pr-16px"
                feedback-class="whitespace-nowrap"
              >
                <NInputNumber
                  v-model:value="model.add_num"
                  class="w-full"
                  :min="1"
                  :precision="0"
                  placeholder="请输入新增数量"
                />
              </NFormItemGi>
              <NFormItemGi span="24 m:12" label="编号起始值" path="add_key_start" feedback-class="whitespace-nowrap">
                <NInput v-model:value="model.add_key_start" maxlength="12" placeholder="请输入编号起始值" />
              </NFormItemGi>
              <NGridItem v-if="selectedDeviceTypeKey" span="24" class="mb-4px mt--12px">
                <div class="min-w-0 flex items-center gap-8px">
                  <span class="shrink-0 text-13px text-primary font-500 leading-34px">标识预览</span>
                  <div v-if="previewItems.length" class="min-w-0 flex flex-nowrap items-center gap-6px overflow-hidden">
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
                  <NText v-else depth="3">请完善编号起始值和新增数量</NText>
                </div>
              </NGridItem>
            </NGrid>
          </template>

          <template v-else>
            <NGrid responsive="screen" item-responsive class="setting-grid">
              <NFormItemGi span="24 m:12" label="设备名称" path="name" class="pr-16px">
                <NInput v-model:value="model.name" maxlength="30" show-count placeholder="请输入设备名称" />
              </NFormItemGi>
              <NFormItemGi span="24 m:12" label="自定义标识" path="key">
                <NInput v-model:value="model.key" maxlength="48" show-count placeholder="请输入自定义标识" />
              </NFormItemGi>
            </NGrid>
          </template>
        </div>

        <NFormItem label="所属设备组" path="device_group_id">
          <NTreeSelect
            v-model:value="model.device_group_id"
            v-model:expanded-keys="expandedKeys"
            :loading="groupLoading"
            :options="groupData"
            clearable
            filterable
            label-field="group_name"
            key-field="group_id"
            placeholder="请选择所属设备组"
          />
        </NFormItem>

        <NFormItem label="状态" path="status">
          <NSwitch v-model:value="model.status" :checked-value="1" :unchecked-value="2">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </NSwitch>
        </NFormItem>

        <NFormItem label="设备描述" path="desc">
          <NInput
            v-model:value="model.desc"
            type="textarea"
            maxlength="200"
            show-count
            :rows="5"
            placeholder="请输入描述"
          />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
