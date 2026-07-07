<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { jsonClone } from '@sa/utils';
import { fetchGetDeviceList } from '@/service/api/device';
import { fetchCreateAssets, fetchGetAssets, fetchGetAssetsTypeList, fetchUpdateAssets } from '@/service/api/ledger';
import { useDateDisabled } from '@/hooks/common/date';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import DeptTreeSelect from '@/components/custom/dept-tree-select.vue';
import { toDateValue, toNumberValue } from '@/utils/common-methods';

defineOptions({
  name: 'AssetsOperateDrawer'
});

type Model = Api.Ledger.AssetsOperateParams;
type DateField = 'purchase_at' | 'expire_at';

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Ledger.Assets | null;
}

interface Emits {
  (e: 'submitted'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();
const { loading: detailLoading, startLoading: startDetailLoading, endLoading: endDetailLoading } = useLoading();
const { disableFutureDate: disablePurchaseDate, disablePastDate: disableExpireDate } = useDateDisabled();

const model = ref<Model>(createDefaultModel());
const purchaseAt = shallowRef<string | null>(null);
const expireAt = shallowRef<string | null>(null);
const assetsTypeMap = ref<Record<string, Api.Ledger.AssetsMapItem>>({});
const deviceMap = ref<Record<string, Api.Ledger.AssetsMapItem>>({});

const isEdit = computed(() => props.operateType === 'edit');
const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增台账',
    edit: '编辑台账'
  };

  return titles[props.operateType];
});

const statusOptions = [
  { label: '正常', value: 1 },
  { label: '维修', value: 2 },
  { label: '报废', value: 3 }
];

const selectedAssetsType = computed(() => {
  if (!model.value.assets_type_id) return null;

  return assetsTypeMap.value[String(model.value.assets_type_id)] ?? null;
});

const selectedDevices = computed(() => {
  return model.value.device_id_list
    .map(id => deviceMap.value[String(id)])
    .filter((item): item is Api.Ledger.AssetsMapItem => Boolean(item));
});

const rules: Record<string, App.Global.FormRule> = {
  sn: createRequiredRule('请输入资产编号'),
  name: createRequiredRule('请输入资产名称'),
  assets_type_id: createRequiredRule('请选择资产类型'),
  status: createRequiredRule('请选择状态'),
  'attribution.dept_id': createRequiredRule('请选择归属部门')
};

function createDefaultModel(): Model {
  return {
    id: null,
    assets_type_id: null,
    attribution: {
      dept_id: null,
      location: '',
      owner: ''
    },
    desc: '',
    device_id_list: [],
    name: '',
    procurement: {
      expire_at: null,
      expire_notice_days: 1,
      purchase_at: null,
      purchase_price: 0.01,
      supplier: ''
    },
    sn: '',
    status: 1
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

function fetchAssetsTypeList(params: Record<string, any>) {
  return fetchGetAssetsTypeList(withDefaultSearchOption(params, { type: 1, value: '' }));
}

function fetchDeviceList(params: Record<string, any>) {
  return fetchGetDeviceList(withDefaultSearchOption(params, { type: 1, value: '' }));
}

function syncDateValues() {
  purchaseAt.value = toDateValue(model.value.procurement.purchase_at);
  expireAt.value = toDateValue(model.value.procurement.expire_at);
}

function updateDateField(field: DateField, value: string | null) {
  model.value.procurement[field] = value ? Number(value) : null;
}

function buildModelFromAssets(assets: Api.Ledger.Assets): Model {
  const attribution = assets.detail?.attribution ?? {};
  const procurement = assets.detail?.procurement ?? {};
  const deviceIdList = assets.detail?.device_id_list ?? assets.device_id_list ?? [];

  return {
    id: assets.id,
    assets_type_id: assets.assets_type_id ?? null,
    attribution: {
      dept_id: attribution.dept_id ?? null,
      location: attribution.location || '',
      owner: attribution.owner || ''
    },
    desc: assets.desc || '',
    device_id_list: jsonClone(deviceIdList),
    name: assets.name || '',
    procurement: {
      expire_at: procurement.expire_at ?? null,
      expire_notice_days: procurement.expire_notice_days ?? 1,
      purchase_at: procurement.purchase_at ?? null,
      purchase_price: procurement.purchase_price ?? 0.01,
      supplier: procurement.supplier || ''
    },
    sn: assets.sn || '',
    status: Number(assets.status) as Api.Ledger.AssetsStatus
  };
}

async function getAssetsDetail(id: CommonType.IdType) {
  startDetailLoading();
  const { data, error } = await fetchGetAssets({
    id,
    options: [{ key: 1 }, { key: 2 }, { key: 3 }]
  }).finally(endDetailLoading);

  if (error) return;

  model.value = buildModelFromAssets(data.assets);
  assetsTypeMap.value = data.assets_type_map ?? {};
  deviceMap.value = data.device_map ?? {};
  syncDateValues();
}

async function handleUpdateModel() {
  model.value = createDefaultModel();
  assetsTypeMap.value = {};
  deviceMap.value = {};
  syncDateValues();

  if (props.operateType === 'add' || !props.rowData?.id) return;

  await getAssetsDetail(props.rowData.id);
}

function closeDrawer() {
  visible.value = false;
}

function buildSubmitParams(): Api.Ledger.AssetsOperateParams {
  const params: Api.Ledger.AssetsOperateParams = {
    assets_type_id: toNumberValue(model.value.assets_type_id),
    attribution: {
      dept_id: toNumberValue(model.value.attribution.dept_id),
      location: model.value.attribution.location || '',
      owner: model.value.attribution.owner || ''
    },
    desc: model.value.desc || '',
    device_id_list: model.value.device_id_list.map(id => toNumberValue(id)).filter(id => id > 0),
    name: model.value.name,
    procurement: {
      expire_at: toNumberValue(model.value.procurement.expire_at),
      expire_notice_days: toNumberValue(model.value.procurement.expire_notice_days),
      purchase_at: toNumberValue(model.value.procurement.purchase_at),
      purchase_price: Number(model.value.procurement.purchase_price ?? 0),
      supplier: model.value.procurement.supplier || ''
    },
    sn: model.value.sn,
    status: toNumberValue(model.value.status) as Api.Ledger.AssetsStatus
  };

  if (isEdit.value) {
    params.id = model.value.id;
  }

  return params;
}

async function handleSubmit() {
  if (loading.value) return;

  startLoading();
  try {
    await validate();

    const request = isEdit.value ? fetchUpdateAssets : fetchCreateAssets;
    const { error } = await request(buildSubmitParams());
    if (error) return;

    window.$message?.success(isEdit.value ? $t('common.updateSuccess') : $t('common.addSuccess'));
    closeDrawer();
    emit('submitted');
  } finally {
    endLoading();
  }
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModel().then(() => restoreValidation());
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="760" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NSpin :show="detailLoading">
        <NForm ref="formRef" :model="model" :rules="rules" label-placement="top" :show-require-mark="false">
          <NDivider title-placement="left">基本信息</NDivider>
          <NGrid responsive="screen" item-responsive :x-gap="18">
            <NFormItemGi span="24 m:12" label="资产编号" path="sn" show-require-mark>
              <NInput v-model:value="model.sn" maxlength="48" show-count placeholder="请输入资产编号" />
            </NFormItemGi>
            <NFormItemGi span="24 m:12" label="资产名称" path="name" show-require-mark>
              <NInput v-model:value="model.name" maxlength="30" show-count placeholder="请输入资产名称" />
            </NFormItemGi>
            <NFormItemGi span="24 m:12" label="资产类型" path="assets_type_id" show-require-mark>
              <RemoteSearchSelect
                v-model:value="model.assets_type_id"
                :request="fetchAssetsTypeList"
                :search-type="1"
                :selected-options="selectedAssetsType"
                label-field="name"
                value-field="id"
                clearable
                placeholder="请选择资产类型"
              />
            </NFormItemGi>
            <NFormItemGi span="24 m:12" label="状态" path="status" show-require-mark>
              <NRadioGroup v-model:value="model.status">
                <NSpace>
                  <NRadio v-for="item in statusOptions" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </NRadio>
                </NSpace>
              </NRadioGroup>
            </NFormItemGi>
          </NGrid>

          <NDivider title-placement="left">归属设备</NDivider>
          <NFormItem label="归属设备">
            <RemoteSearchSelect
              v-model:value="model.device_id_list"
              :request="fetchDeviceList"
              :search-type="1"
              :selected-options="selectedDevices"
              label-field="name"
              value-field="id"
              multiple
              clearable
              placeholder="请选择归属设备"
            />
          </NFormItem>

          <NDivider title-placement="left">归属信息</NDivider>
          <NGrid responsive="screen" item-responsive :x-gap="18">
            <NFormItemGi span="24 m:12" label="归属部门" path="attribution.dept_id" show-require-mark>
              <DeptTreeSelect v-model:value="model.attribution.dept_id" clearable placeholder="请选择归属部门" />
            </NFormItemGi>
            <NFormItemGi span="24 m:12" label="存放位置">
              <NInput
                v-model:value="model.attribution.location"
                maxlength="30"
                show-count
                placeholder="请输入存放位置"
              />
            </NFormItemGi>
            <NFormItemGi span="24 m:12" label="责任人">
              <NInput v-model:value="model.attribution.owner" maxlength="30" show-count placeholder="请输入责任人" />
            </NFormItemGi>
          </NGrid>

          <NDivider title-placement="left">采购信息</NDivider>
          <NGrid responsive="screen" item-responsive :x-gap="18">
            <NFormItemGi span="24 m:12" label="采购日期">
              <NDatePicker
                v-model:formatted-value="purchaseAt"
                type="date"
                value-format="t"
                clearable
                class="w-full"
                :is-date-disabled="disablePurchaseDate"
                @update:formatted-value="value => updateDateField('purchase_at', value)"
              />
            </NFormItemGi>
            <NFormItemGi span="24 m:12" label="采购金额">
              <NInputNumber
                v-model:value="model.procurement.purchase_price"
                class="w-full"
                :min="0"
                :precision="2"
                placeholder="请输入采购金额"
              />
            </NFormItemGi>
            <NFormItemGi span="24 m:12" label="供应商">
              <NInput v-model:value="model.procurement.supplier" maxlength="30" show-count placeholder="请输入供应商" />
            </NFormItemGi>
            <NFormItemGi span="24 m:12" label="到期时间">
              <NDatePicker
                v-model:formatted-value="expireAt"
                type="date"
                value-format="t"
                clearable
                class="w-full"
                :is-date-disabled="disableExpireDate"
                @update:formatted-value="value => updateDateField('expire_at', value)"
              />
            </NFormItemGi>
            <NFormItemGi span="24 m:12" label="到期提前通知">
              <NInputNumber
                v-model:value="model.procurement.expire_notice_days"
                class="w-full"
                :min="1"
                :max="30"
                :precision="0"
                placeholder="请输入通知天数"
              />
            </NFormItemGi>
          </NGrid>

          <NDivider title-placement="left">备注</NDivider>
          <NFormItem label="备注">
            <NInput
              v-model:value="model.desc"
              type="textarea"
              maxlength="200"
              show-count
              :rows="4"
              placeholder="请输入备注"
            />
          </NFormItem>
        </NForm>
      </NSpin>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
