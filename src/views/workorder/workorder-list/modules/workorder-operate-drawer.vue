<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import type { UploadFileInfo } from 'naive-ui';
import { fetchGetDeviceList, fetchGetLogicPointList } from '@/service/api/device';
import { fetchGetSpaceTrees } from '@/service/api/space';
import { fetchGetUserList } from '@/service/api/system';
import { fetchCreateWorkorder, fetchGetWorkorder, fetchUpdateWorkorder } from '@/service/api/workorder';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import FileUpload from '@/components/custom/file-upload.vue';
import { getOssUrl, toNumberValue } from '@/utils/common-methods';

defineOptions({
  name: 'WorkorderOperateDrawer'
});

interface Props {
  defaultDevice?: Pick<Api.Device.Device, 'id' | 'name' | 'space_id'> | null;
  operateType?: Api.Workorder.WorkorderOperateType;
  rowData?: Api.Workorder.Workorder | null;
}

interface Emits {
  (e: 'submitted'): void;
}

type Model = {
  id: CommonType.IdType | null;
  break_desc: string;
  break_img_list: string[];
  deal_desc: string;
  deal_img_list: string[];
  dealer_uid: CommonType.IdType | null;
  deal_status: Api.Workorder.WorkorderDealStatus | null;
  device_id: CommonType.IdType | null;
  logic_point_id_list: CommonType.IdType[];
  space_id: CommonType.IdType | null;
};

type SubmitAction = 'create' | 'allocation' | 'cancelAllocation' | 'deal';
type DealerOption = Api.System.User & { label: string };

const props = withDefaults(defineProps<Props>(), {
  defaultDevice: null,
  operateType: 'add_workorder',
  rowData: null
});
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();
const { loading: spaceLoading, startLoading: startSpaceLoading, endLoading: endSpaceLoading } = useLoading();

const model = ref<Model>(createDefaultModel());
const breakImageFileList = ref<UploadFileInfo[]>([]);
const dealImageFileList = ref<UploadFileInfo[]>([]);
const spaceData = ref<Api.Space.Space[]>([]);
const expandedSpaceKeys = ref<CommonType.IdType[]>([]);
const selectedDevice = shallowRef<Api.Workorder.WorkorderDeviceMapItem | null>(null);
const selectedLogicPoints = shallowRef<Api.Workorder.WorkorderLogicPointMapItem[]>([]);
const selectedDealer = shallowRef<DealerOption | null>(null);

const isAddMode = computed(() => props.operateType === 'add_workorder');
const isAllocationMode = computed(() => props.operateType === 'allocation_workorder');
const isDealMode = computed(() => props.operateType === 'deal_workorder');
const isWatchMode = computed(() => props.operateType === 'watch_workorder');

const title = computed(() => {
  const titleMap: Record<Api.Workorder.WorkorderOperateType, string> = {
    add_workorder: '新增工单',
    allocation_workorder: '分配工单',
    deal_workorder: '处理工单',
    watch_workorder: '工单详情'
  };

  return titleMap[props.operateType];
});

const showDealerSection = computed(() => !isAddMode.value && model.value.deal_status !== 4);
const showDealSection = computed(() => isDealMode.value || isWatchMode.value);
const selectedDeviceName = computed(() => selectedDevice.value?.name ?? '-');
const selectedLogicPointNames = computed(() => {
  const names = selectedLogicPoints.value.map(item => item.name).filter(Boolean);

  return names.length ? names.join('、') : '-';
});

const deviceRequestParams = computed<CommonType.CommonListQueryParams>(() => ({
  list_option: {
    options: model.value.space_id ? [{ type: 7, value: String(model.value.space_id) }] : []
  }
}));

const logicPointRequestParams = computed<CommonType.CommonListQueryParams>(() => ({
  list_option: {
    options: model.value.device_id ? [{ type: 2, value: String(model.value.device_id) }] : []
  }
}));

const dealerRequestParams: CommonType.CommonListQueryParams = {
  list_option: {
    options: [
      { type: 51, value: 'true' },
      { type: 52, value: 'workorder:deal' },
      { type: 3, value: '1' }
    ]
  }
};

const rules = computed<Record<string, App.Global.FormRule | App.Global.FormRule[]>>(() => {
  const nextRules: Record<string, App.Global.FormRule | App.Global.FormRule[]> = {};

  if (isAddMode.value) {
    nextRules.device_id = createRequiredRule('请选择故障设备');
    nextRules.break_img_list = {
      required: true,
      trigger: ['change', 'blur'],
      validator: () => validateImageFileList(breakImageFileList.value, '请上传故障图片')
    };
    return nextRules;
  }

  if (isAllocationMode.value) {
    nextRules.dealer_uid = createRequiredRule('请选择处理人');
    return nextRules;
  }

  if (isDealMode.value) {
    nextRules.logic_point_id_list = createRequiredRule('请选择故障点位');
    nextRules.deal_img_list = {
      required: true,
      trigger: ['change', 'blur'],
      validator: () => validateImageFileList(dealImageFileList.value, '请上传处理图片')
    };
    return nextRules;
  }

  return nextRules;
});

function createDefaultModel(): Model {
  return {
    id: null,
    break_desc: '',
    break_img_list: [],
    deal_desc: '',
    deal_img_list: [],
    dealer_uid: null,
    deal_status: null,
    device_id: null,
    logic_point_id_list: [],
    space_id: null
  };
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
  if (!model.value.device_id) return Promise.resolve([]);

  return fetchGetLogicPointList(withDefaultSearchOption(params, { type: 7, value: '' }));
}

function createDealerOption(user: Api.System.User): DealerOption {
  return {
    ...user,
    label: `${user.username}（${user.phone}）`
  };
}

async function fetchDealerUserList(params: Record<string, any>) {
  const response = await fetchGetUserList(params as CommonType.CommonListQueryParams);

  if (response.data) {
    response.data.list = response.data.list.map(createDealerOption);
  }

  return response;
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

function validateImageFileList(fileList: UploadFileInfo[], message: string) {
  if (fileList.some(file => file.status === 'uploading')) {
    return new Error('请等待图片上传完成');
  }

  if (!fileList.some(file => file.status === 'finished' && file.id)) {
    return new Error(message);
  }

  return true;
}

function resetModel() {
  model.value = createDefaultModel();
  breakImageFileList.value = [];
  dealImageFileList.value = [];
  expandedSpaceKeys.value = [];
  selectedDevice.value = null;
  selectedLogicPoints.value = [];
  selectedDealer.value = null;
}

function syncDefaultDevice() {
  if (!isAddMode.value || !props.defaultDevice) return;

  model.value.space_id = props.defaultDevice.space_id ?? null;
  model.value.device_id = props.defaultDevice.id;
  selectedDevice.value = {
    id: props.defaultDevice.id,
    name: props.defaultDevice.name
  };
}

function closeDrawer() {
  visible.value = false;
}

function handleSpaceChange() {
  if (!isAddMode.value) return;

  model.value.device_id = null;
  model.value.logic_point_id_list = [];
  selectedDevice.value = null;
  selectedLogicPoints.value = [];
}

function handleDeviceSelectedChange(option: Record<string, any> | Record<string, any>[] | null) {
  if (!isAddMode.value) return;

  selectedDevice.value = Array.isArray(option) ? null : (option as Api.Workorder.WorkorderDeviceMapItem | null);
  model.value.logic_point_id_list = [];
  selectedLogicPoints.value = [];
}

function handleLogicPointSelectedChange(option: Record<string, any> | Record<string, any>[] | null) {
  selectedLogicPoints.value = Array.isArray(option) ? (option as Api.Workorder.WorkorderLogicPointMapItem[]) : [];
}

function handleDealerSelectedChange(option: Record<string, any> | Record<string, any>[] | null) {
  const dealer = Array.isArray(option) ? null : (option as Api.System.User | null);

  selectedDealer.value = dealer ? createDealerOption(dealer) : null;
}

function fillModel(response: Api.Workorder.WorkorderDetailResponse) {
  const workorder = response.workorder;
  const repairDetail = workorder.repair_detail ?? {};
  const dealDetail = workorder.deal_detail ?? {};

  model.value = {
    ...createDefaultModel(),
    id: workorder.id,
    break_desc: repairDetail.desc ?? '',
    break_img_list: repairDetail.img_list ?? [],
    deal_desc: dealDetail.desc ?? '',
    deal_img_list: dealDetail.img_list ?? [],
    dealer_uid: workorder.dealer_uid ?? null,
    deal_status: workorder.deal_status,
    device_id: workorder.device_id ?? null,
    logic_point_id_list: workorder.point_detail?.logic_point_id_list ?? [],
    space_id: workorder.space_id ?? null
  };

  selectedDevice.value = response.device_map[String(workorder.device_id)];
  selectedLogicPoints.value = Object.values(response.logic_point_map);
  selectedDealer.value = workorder.dealer_uid
    ? createDealerOption(response.base_user_map[String(workorder.dealer_uid)])
    : null;
}

async function handleUpdateModel() {
  if (isAddMode.value) return;

  const rowId = props.rowData?.id;
  if (rowId === null || rowId === undefined) return;

  startLoading();
  const { data, error } = await fetchGetWorkorder({
    id: rowId,
    options: [{ key: 1 }, { key: 2 }, { key: 3 }, { key: 4 }]
  }).finally(endLoading);

  if (error || !data || !visible.value || isAddMode.value) return;

  fillModel(data);
}

function buildCreateSubmitData(): Api.Workorder.CreateWorkorderParams {
  return {
    break_desc: model.value.break_desc.trim(),
    break_img_list: model.value.break_img_list,
    device_id: toNumberValue(model.value.device_id),
    logic_point_id_list: model.value.logic_point_id_list.map(id => toNumberValue(id)).filter(id => id > 0),
    space_id: toNumberValue(model.value.space_id)
  };
}

function buildAllocationSubmitData(): Api.Workorder.UpdateWorkorderParams {
  return {
    id: toNumberValue(model.value.id),
    dealer_uid: toNumberValue(model.value.dealer_uid),
    deal_status: 2
  };
}

function buildCancelAllocationSubmitData(): Api.Workorder.UpdateWorkorderParams {
  return {
    id: toNumberValue(model.value.id),
    deal_status: 4
  };
}

function buildDealSubmitData(): Api.Workorder.UpdateWorkorderParams {
  return {
    id: toNumberValue(model.value.id),
    dealer_uid: toNumberValue(model.value.dealer_uid),
    deal_desc: model.value.deal_desc.trim(),
    deal_img_list: model.value.deal_img_list,
    logic_point_id_list: model.value.logic_point_id_list.map(id => toNumberValue(id)).filter(id => id > 0),
    deal_status: 3
  };
}

async function handleSubmit(action: SubmitAction) {
  if (loading.value) return;

  if (action !== 'cancelAllocation') {
    await validate();
  }

  startLoading();
  let error: unknown = null;
  let message = '';

  try {
    if (action === 'create') {
      const result = await fetchCreateWorkorder(buildCreateSubmitData());
      error = result.error;
      message = $t('common.addSuccess');
    }

    if (action === 'allocation') {
      const result = await fetchUpdateWorkorder(buildAllocationSubmitData());
      error = result.error;
      message = '分配成功';
    }

    if (action === 'cancelAllocation') {
      const result = await fetchUpdateWorkorder(buildCancelAllocationSubmitData());
      error = result.error;
      message = '取消分配成功';
    }

    if (action === 'deal') {
      const result = await fetchUpdateWorkorder(buildDealSubmitData());
      error = result.error;
      message = '处理成功';
    }
  } finally {
    endLoading();
  }

  if (error) return;

  window.$message?.success(message);
  closeDrawer();
  emit('submitted');
}

watch(visible, async () => {
  if (!visible.value) return;

  resetModel();
  syncDefaultDevice();
  getSpaceData();
  await handleUpdateModel();
  restoreValidation();
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="750" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NSpin :show="loading">
        <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
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
              :disabled="!isAddMode"
              @update:value="handleSpaceChange"
            />
          </NFormItem>
          <NFormItem label="故障设备" path="device_id" :show-require-mark="isAddMode">
            <NInput v-if="!isAddMode" :value="selectedDeviceName" readonly />
            <RemoteSearchSelect
              v-else
              v-model:value="model.device_id"
              :request="fetchDeviceList"
              :request-params="deviceRequestParams"
              :search-type="2"
              :selected-options="selectedDevice"
              label-field="name"
              value-field="id"
              placeholder="可搜索"
              clearable
              @selected-change="handleDeviceSelectedChange"
            />
          </NFormItem>
          <NFormItem label="故障点位" path="logic_point_id_list" :show-require-mark="isDealMode">
            <NInput v-if="isAllocationMode || isWatchMode" :value="selectedLogicPointNames" readonly />
            <RemoteSearchSelect
              v-else
              v-model:value="model.logic_point_id_list"
              :request="fetchLogicPointList"
              :request-params="logicPointRequestParams"
              :search-type="7"
              :selected-options="selectedLogicPoints"
              label-field="name"
              value-field="id"
              placeholder="请选择故障点位"
              multiple
              clearable
              :disabled="!model.device_id"
              @selected-change="handleLogicPointSelectedChange"
            />
          </NFormItem>
          <NFormItem label="故障描述" path="break_desc">
            <NInput
              v-model:value="model.break_desc"
              type="textarea"
              maxlength="200"
              show-count
              :rows="3"
              :disabled="!isAddMode"
              placeholder="请输入故障描述"
            />
          </NFormItem>
          <NFormItem label="故障图片" path="break_img_list" :show-require-mark="isAddMode">
            <FileUpload
              v-if="isAddMode"
              v-model:value="model.break_img_list"
              v-model:file-list="breakImageFileList"
              module-name="workorder"
              upload-type="image"
              :max="5"
              :file-size="5"
              :show-tip="false"
            />
            <NImageGroup v-else-if="model.break_img_list.length">
              <div class="flex flex-wrap gap-8px">
                <NImage
                  v-for="(path, index) in model.break_img_list"
                  :key="`${path}-${index}`"
                  :src="getOssUrl(path)"
                  width="92"
                  height="92"
                  object-fit="cover"
                />
              </div>
            </NImageGroup>
            <NEmpty v-else description="暂无图片" :show-icon="false" />
          </NFormItem>

          <template v-if="showDealerSection">
            <NFormItem label="处理人" path="dealer_uid">
              <RemoteSearchSelect
                v-model:value="model.dealer_uid"
                :request="fetchDealerUserList"
                :request-params="dealerRequestParams"
                :search-type="4"
                :selected-options="selectedDealer"
                label-field="label"
                value-field="user_id"
                placeholder="请选择处理人"
                clearable
                :disabled="!isAllocationMode"
                @selected-change="handleDealerSelectedChange"
              />
            </NFormItem>
          </template>

          <template v-if="showDealSection">
            <NFormItem label="处理图片" path="deal_img_list" :show-require-mark="isDealMode">
              <FileUpload
                v-if="isDealMode"
                v-model:value="model.deal_img_list"
                v-model:file-list="dealImageFileList"
                module-name="workorder"
                upload-type="image"
                :max="5"
                :file-size="5"
                :show-tip="false"
              />
              <NImageGroup v-else-if="model.deal_img_list.length">
                <div class="flex flex-wrap gap-8px">
                  <NImage
                    v-for="(path, index) in model.deal_img_list"
                    :key="`${path}-${index}`"
                    :src="getOssUrl(path)"
                    width="92"
                    height="92"
                    object-fit="cover"
                  />
                </div>
              </NImageGroup>
              <NEmpty v-else description="暂无图片" :show-icon="false" />
            </NFormItem>
            <NFormItem label="处理说明" path="deal_desc">
              <NInput
                v-model:value="model.deal_desc"
                type="textarea"
                maxlength="200"
                show-count
                :rows="3"
                :disabled="!isDealMode"
                placeholder="请输入处理说明"
              />
            </NFormItem>
          </template>
        </NForm>
      </NSpin>
      <template #footer>
        <NSpace :size="16">
          <template v-if="isAddMode">
            <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
            <NButton type="primary" :loading="loading" @click="handleSubmit('create')">
              {{ $t('common.confirm') }}
            </NButton>
          </template>
          <template v-else-if="isAllocationMode">
            <NButton type="primary" :loading="loading" @click="handleSubmit('allocation')">分配</NButton>
            <NButton :loading="loading" @click="handleSubmit('cancelAllocation')">取消分配</NButton>
          </template>
          <template v-else-if="isDealMode">
            <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
            <NButton type="primary" :loading="loading" @click="handleSubmit('deal')">处理</NButton>
          </template>
          <NButton v-else @click="closeDrawer">关闭</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
