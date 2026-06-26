<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchCreateVersion, fetchGetCorpList, fetchUpdateVersion } from '@/service/api/corp';
import { menuNodeType, menuPlatformType } from '@/constants/business';
import MenuTree from '@/components/custom/menu-tree.vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'VersionOperateDrawer'
});

interface Emits {
  (e: 'submitted'): void;
}

interface FormModel {
  name: string;
  desc: string;
  start_at_ms: number | null;
  original_price: number | null;
  discount_price: number | null;
  price_day: number | null;
  price_unit: number;
  device_num: number | null;
  project_user_num: number | null;
  day_msg_num: number | null;
  data_store_day: number | null;
  data_store_unit: number;
}

type OperateType = 'add' | 'edit';
type CorpOptionRecord = Record<string, unknown>;

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading: submitLoading, startLoading: startSubmitLoading, endLoading: endSubmitLoading } = useLoading();

const visible = shallowRef(false);
const operateType = shallowRef<OperateType>('add');
const editingId = shallowRef<CommonType.IdType | null>(null);
const corpId = shallowRef<CommonType.IdType | null>(null);
const selectedCorpOption = shallowRef<CorpOptionRecord | null>(null);
const menuTreeRef = ref<InstanceType<typeof MenuTree> | null>(null);
const checkedMenuIds = ref<CommonType.IdType[]>([]);
const menuLoading = ref(false);
const cascade = ref(true);
const formModel = ref<FormModel>(createDefaultModel());

const durationUnitOptions = [
  { label: '日', value: 1 },
  { label: '月', value: 30 },
  { label: '年', value: 365 }
];

const menuTreeRequestParams = {
  p_type: menuPlatformType.project,
  menu_type_list: [menuNodeType.catalog, menuNodeType.menu, menuNodeType.button, menuNodeType.extLink]
};

const corpSelectRequestParams: CommonType.CommonListQueryParams = {
  list_option: {
    options: [{ type: 104, value: '101' }]
  },
  options: [{ key: 1 }, { key: 2 }, { key: 3 }]
};

type RuleKey = Extract<
  keyof FormModel,
  | 'name'
  | 'start_at_ms'
  | 'original_price'
  | 'discount_price'
  | 'price_day'
  | 'device_num'
  | 'project_user_num'
  | 'day_msg_num'
  | 'data_store_day'
>;

const rules: Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]> = {
  name: [
    createRequiredRule('版本名称不能为空'),
    {
      max: 10,
      message: '版本名称不能超过10个字符',
      trigger: ['input', 'blur']
    }
  ],
  start_at_ms: createRequiredRule('请选择预计开始时间'),
  original_price: createRequiredRule('请输入原价'),
  discount_price: createRequiredRule('请输入折扣价'),
  price_day: createRequiredRule('请输入时长'),
  device_num: createRequiredRule('请输入设备数'),
  project_user_num: createRequiredRule('请输入用户数'),
  day_msg_num: createRequiredRule('请输入日消息数'),
  data_store_day: createRequiredRule('请输入数据存储时长')
};

const isEdit = computed(() => operateType.value === 'edit');
const title = computed(() => (isEdit.value ? '编辑版本' : '新增版本'));

function createDefaultModel(): FormModel {
  return {
    name: '',
    desc: '',
    start_at_ms: null,
    original_price: 0,
    discount_price: 0,
    price_day: 1,
    price_unit: 1,
    device_num: 1,
    project_user_num: 1,
    day_msg_num: 1,
    data_store_day: 1,
    data_store_unit: 1
  };
}

function resetModel() {
  formModel.value = createDefaultModel();
  checkedMenuIds.value = [];
  cascade.value = true;
  menuLoading.value = false;
}

function openAdd(id?: CommonType.IdType, name?: string) {
  operateType.value = 'add';
  editingId.value = null;
  corpId.value = id ?? null;
  selectedCorpOption.value = createCorpOption(id, name);
  resetModel();
  restoreValidation();
  visible.value = true;
}

function openEdit(row: Api.System.CorpProjectVersion, name?: string) {
  operateType.value = 'edit';
  editingId.value = row.id;
  corpId.value = row.corp_id ?? null;
  selectedCorpOption.value = createCorpOption(row.corp_id, name);
  formModel.value = {
    name: row.name || '',
    desc: row.desc || '',
    start_at_ms: row.start_at ? row.start_at * 1000 : null,
    original_price: row.price_conf?.original_price ?? 0,
    discount_price: row.price_conf?.discount_price ?? 0,
    price_day: row.price_conf?.day ?? 1,
    price_unit: 1,
    device_num: row.resource_conf?.device_num ?? 1,
    project_user_num: row.resource_conf?.project_user_num ?? 1,
    day_msg_num: row.resource_conf?.day_msg_num ?? 1,
    data_store_day: row.resource_conf?.data_store_day ?? 1,
    data_store_unit: 1
  };
  checkedMenuIds.value = [...(row.menu_conf?.menu_id_list ?? [])];
  cascade.value = true;
  menuLoading.value = false;
  restoreValidation();
  visible.value = true;
}

function createCorpOption(id?: CommonType.IdType | null, name?: string) {
  if (id === undefined || id === null) return null;

  return {
    id,
    name: name || String(id)
  };
}

function handleCorpSelectedChange(record: CorpOptionRecord | CorpOptionRecord[] | null) {
  const nextRecord = Array.isArray(record) ? null : record;

  selectedCorpOption.value = nextRecord;
}

function close() {
  visible.value = false;
}

function getSubmitMenuIds() {
  const map = new Map<string, CommonType.IdType>();
  const menuIds = menuTreeRef.value?.getCheckedMenuIds(true) ?? checkedMenuIds.value;

  menuIds.forEach(id => {
    map.set(String(id), id);
  });

  return Array.from(map.values());
}

function getDurationDays(value: number | null, unit: number) {
  return Number(value || 0) * unit;
}

function isStartDateDisabled(timestamp: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return timestamp < today.getTime();
}

function createSubmitPayload(menuIds: CommonType.IdType[]): Api.System.CreateVersionParams {
  return {
    ...(corpId.value !== null ? { corp_id: corpId.value } : {}),
    desc: formModel.value.desc,
    menu_conf: {
      menu_id_list: menuIds
    },
    name: formModel.value.name,
    price_conf: {
      day: getDurationDays(formModel.value.price_day, formModel.value.price_unit),
      discount_price: Number(formModel.value.discount_price || 0),
      original_price: Number(formModel.value.original_price || 0)
    },
    resource_conf: {
      data_store_day: getDurationDays(formModel.value.data_store_day, formModel.value.data_store_unit),
      day_msg_num: Number(formModel.value.day_msg_num || 0),
      device_num: Number(formModel.value.device_num || 0),
      project_user_num: Number(formModel.value.project_user_num || 0)
    },
    start_at: Math.floor(Number(formModel.value.start_at_ms || 0) / 1000)
  };
}

async function handleSubmit() {
  await validate();

  const menuIds = getSubmitMenuIds();
  if (!menuIds.length) {
    window.$message?.warning('请至少选择一个菜单');
    return;
  }

  const payload = createSubmitPayload(menuIds);
  startSubmitLoading();

  const request =
    operateType.value === 'edit' && editingId.value
      ? fetchUpdateVersion({ ...payload, id: editingId.value })
      : fetchCreateVersion(payload);

  const { error } = await request.finally(endSubmitLoading);

  if (error) return;

  window.$message?.success(operateType.value === 'edit' ? $t('common.updateSuccess') : $t('common.addSuccess'));
  close();
  emit('submitted');
}

defineExpose({
  openAdd,
  openEdit
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="980" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="formModel" :rules="rules">
        <NDivider>基本信息</NDivider>
        <NGrid responsive="screen" item-responsive :x-gap="16">
          <NFormItemGi span="24" label="版本名称" path="name">
            <NInput v-model:value="formModel.name" placeholder="请输入版本名称" :maxlength="10" show-count />
          </NFormItemGi>
          <NFormItemGi span="24" label="版本简介">
            <NInput
              v-model:value="formModel.desc"
              type="textarea"
              placeholder="请输入版本简介"
              :maxlength="100"
              show-count
              :autosize="{ minRows: 3, maxRows: 5 }"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="集成商">
            <RemoteSearchSelect
              v-model:value="corpId"
              :request="fetchGetCorpList"
              :request-params="corpSelectRequestParams"
              :search-type="1"
              :selected-options="selectedCorpOption"
              label-field="name"
              value-field="id"
              placeholder="请选择集成商"
              clearable
              @selected-change="handleCorpSelectedChange"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="预计开始时间" path="start_at_ms">
            <NDatePicker
              v-model:value="formModel.start_at_ms"
              type="datetime"
              clearable
              class="w-full"
              placeholder="请选择预计开始时间"
              :disabled="isEdit"
              :is-date-disabled="isEdit ? undefined : isStartDateDisabled"
            />
          </NFormItemGi>
        </NGrid>

        <NDivider>价格配置</NDivider>
        <NGrid responsive="screen" item-responsive :x-gap="16">
          <NFormItemGi span="24 m:8" label="原价" path="original_price">
            <NInputNumber
              v-model:value="formModel.original_price"
              :min="0"
              :precision="2"
              button-placement="both"
              class="w-full"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:8" label="折扣价" path="discount_price">
            <NInputNumber
              v-model:value="formModel.discount_price"
              :min="0"
              :precision="2"
              button-placement="both"
              class="w-full"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:8" label="时长" path="price_day">
            <NInputGroup class="w-full">
              <NInputNumber
                v-model:value="formModel.price_day"
                :min="1"
                :precision="0"
                button-placement="both"
                class="flex-1"
              />
              <NSelect
                v-model:value="formModel.price_unit"
                :options="durationUnitOptions"
                :consistent-menu-width="false"
                class="w-92px"
              />
            </NInputGroup>
          </NFormItemGi>
        </NGrid>

        <NDivider>资源配置</NDivider>
        <NGrid responsive="screen" item-responsive :x-gap="16">
          <NFormItemGi span="24 m:12" label="设备数" path="device_num">
            <NInputNumber v-model:value="formModel.device_num" :min="0" :precision="0" class="w-full" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="用户数" path="project_user_num">
            <NInputNumber v-model:value="formModel.project_user_num" :min="0" :precision="0" class="w-full" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="日消息数" path="day_msg_num">
            <NInputNumber v-model:value="formModel.day_msg_num" :min="0" :precision="0" class="w-full" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="数据存储时长" path="data_store_day">
            <NInputGroup class="w-full">
              <NInputNumber
                v-model:value="formModel.data_store_day"
                :min="1"
                :precision="0"
                button-placement="both"
                class="flex-1"
              />
              <NSelect
                v-model:value="formModel.data_store_unit"
                :options="durationUnitOptions"
                :consistent-menu-width="false"
                class="w-92px"
              />
            </NInputGroup>
          </NFormItemGi>
        </NGrid>

        <NDivider>菜单配置</NDivider>
        <NFormItem label="菜单权限" class="pr-24px">
          <MenuTree
            v-if="visible"
            ref="menuTreeRef"
            v-model:checked-keys="checkedMenuIds"
            v-model:cascade="cascade"
            v-model:loading="menuLoading"
            :request-params="menuTreeRequestParams"
            :show-button-menus="false"
            :immediate="true"
          />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="close">取消</NButton>
          <NButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
