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
  id: CommonType.IdType | null;
  corp_id: CommonType.IdType | null;
  name: string;
  desc: string;
  start_at: string | null;
  menu_conf: {
    menu_id_list: CommonType.IdType[];
  };
  price_conf: {
    day: number | null;
    discount_price: number | null;
    original_price: number | null;
    time_type: Api.System.VersionTimeType;
  };
  resource_conf: {
    data_store_day: number | null;
    day_msg_num: number | null;
    device_num: number | null;
    project_user_num: number | null;
    time_type: Api.System.VersionTimeType;
  };
}

type OperateType = 'add' | 'edit';
type CorpOptionRecord = Record<string, unknown>;

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading: submitLoading, startLoading: startSubmitLoading, endLoading: endSubmitLoading } = useLoading();

const visible = shallowRef(false);
const operateType = shallowRef<OperateType>('add');
const selectedCorpOption = shallowRef<CorpOptionRecord | null>(null);
const menuTreeRef = ref<InstanceType<typeof MenuTree> | null>(null);
const menuLoading = ref(false);
const cascade = ref(true);
const formModel = ref<FormModel>(createDefaultModel());

const durationTimeTypeOptions: CommonType.Option<Api.System.VersionTimeType>[] = [
  { label: '天', value: 4 },
  { label: '月', value: 5 },
  { label: '年', value: 6 }
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

type RuleKey =
  | 'name'
  | 'start_at'
  | 'price_conf.original_price'
  | 'price_conf.discount_price'
  | 'price_conf.day'
  | 'resource_conf.device_num'
  | 'resource_conf.project_user_num'
  | 'resource_conf.day_msg_num'
  | 'resource_conf.data_store_day';

const rules: Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]> = {
  name: [
    createRequiredRule('版本名称不能为空'),
    {
      max: 10,
      message: '版本名称不能超过10个字符',
      trigger: ['input', 'blur']
    }
  ],
  start_at: createRequiredRule('请选择预计开始时间'),
  'price_conf.original_price': createRequiredRule('请输入原价'),
  'price_conf.discount_price': createRequiredRule('请输入折扣价'),
  'price_conf.day': createRequiredRule('请输入时长'),
  'resource_conf.device_num': createRequiredRule('请输入设备数'),
  'resource_conf.project_user_num': createRequiredRule('请输入用户数'),
  'resource_conf.day_msg_num': createRequiredRule('请输入日消息数'),
  'resource_conf.data_store_day': createRequiredRule('请输入数据存储时长')
};

const isEdit = computed(() => operateType.value === 'edit');
const title = computed(() => (isEdit.value ? '编辑版本' : '新增版本'));

function createDefaultModel(): FormModel {
  return {
    id: null,
    corp_id: null,
    name: '',
    desc: '',
    start_at: null,
    menu_conf: {
      menu_id_list: []
    },
    price_conf: {
      day: 1,
      discount_price: 0,
      original_price: 0,
      time_type: 4
    },
    resource_conf: {
      data_store_day: 1,
      day_msg_num: 1,
      device_num: 1,
      project_user_num: 1,
      time_type: 4
    }
  };
}

function resetModel() {
  formModel.value = createDefaultModel();
  cascade.value = true;
  menuLoading.value = false;
}

function openAdd(id?: CommonType.IdType, name?: string) {
  operateType.value = 'add';
  resetModel();
  formModel.value.corp_id = id ?? null;
  selectedCorpOption.value = createCorpOption(id, name);
  restoreValidation();
  visible.value = true;
}

function openEdit(row: Api.System.CorpProjectVersion, name?: string) {
  operateType.value = 'edit';
  selectedCorpOption.value = createCorpOption(row.corp_id, name);
  formModel.value = {
    id: row.id,
    corp_id: row.corp_id ?? null,
    name: row.name || '',
    desc: row.desc || '',
    start_at: row.start_at ? String(row.start_at) : null,
    menu_conf: {
      menu_id_list: [...(row.menu_conf?.menu_id_list ?? [])]
    },
    price_conf: {
      day: row.price_conf?.day ?? 1,
      discount_price: row.price_conf?.discount_price ?? 0,
      original_price: row.price_conf?.original_price ?? 0,
      time_type: row.price_conf?.time_type ?? 4
    },
    resource_conf: {
      data_store_day: row.resource_conf?.data_store_day ?? 1,
      day_msg_num: row.resource_conf?.day_msg_num ?? 1,
      device_num: row.resource_conf?.device_num ?? 1,
      project_user_num: row.resource_conf?.project_user_num ?? 1,
      time_type: row.resource_conf?.time_type ?? 4
    }
  };
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
  const menuIds = menuTreeRef.value?.getCheckedMenuIds(true) ?? formModel.value.menu_conf.menu_id_list;

  menuIds.forEach(id => {
    map.set(String(id), id);
  });

  return Array.from(map.values());
}

function isStartDateDisabled(timestamp: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return timestamp < today.getTime();
}

function createSubmitPayload(menuIds: CommonType.IdType[]): Api.System.CreateVersionParams {
  const { corp_id, price_conf, resource_conf, start_at } = formModel.value;

  return {
    ...(corp_id !== null ? { corp_id } : {}),
    desc: formModel.value.desc,
    menu_conf: {
      menu_id_list: menuIds
    },
    name: formModel.value.name,
    price_conf: {
      day: Number(price_conf.day || 0),
      discount_price: Number(price_conf.discount_price || 0),
      original_price: Number(price_conf.original_price || 0),
      time_type: price_conf.time_type
    },
    resource_conf: {
      data_store_day: Number(resource_conf.data_store_day || 0),
      day_msg_num: Number(resource_conf.day_msg_num || 0),
      device_num: Number(resource_conf.device_num || 0),
      project_user_num: Number(resource_conf.project_user_num || 0),
      time_type: resource_conf.time_type
    },
    start_at: Number(start_at || 0)
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
    operateType.value === 'edit' ? fetchUpdateVersion(createUpdatePayload(payload)) : fetchCreateVersion(payload);

  const { error } = await request.finally(endSubmitLoading);

  if (error) return;

  window.$message?.success(operateType.value === 'edit' ? $t('common.updateSuccess') : $t('common.addSuccess'));
  close();
  emit('submitted');
}

function createUpdatePayload(payload: Api.System.CreateVersionParams): Api.System.UpdateVersionParams {
  const { start_at: _startAt, ...updatePayload } = payload;

  return {
    ...updatePayload,
    id: formModel.value.id!
  };
}

defineExpose({
  openAdd,
  openEdit
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="600" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="formModel" :rules="rules">
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
          <NFormItemGi span="24" label="集成商">
            <RemoteSearchSelect
              v-model:value="formModel.corp_id"
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
          <NFormItemGi span="24" label="预计开始时间" path="start_at">
            <NDatePicker
              v-model:formatted-value="formModel.start_at"
              type="datetime"
              value-format="t"
              clearable
              class="w-full"
              placeholder="请选择预计开始时间"
              :disabled="isEdit"
              :is-date-disabled="isEdit ? undefined : isStartDateDisabled"
            />
          </NFormItemGi>
        </NGrid>

        <NTabs type="segment" animated class="mt-16px">
          <NTabPane name="price" tab="价格配置" display-directive="show">
            <NGrid responsive="screen" item-responsive :x-gap="16">
              <NFormItemGi span="24" label="原价" path="price_conf.original_price">
                <NInputNumber
                  v-model:value="formModel.price_conf.original_price"
                  :min="0"
                  :precision="2"
                  class="w-full"
                />
              </NFormItemGi>
              <NFormItemGi span="24" label="折扣价" path="price_conf.discount_price">
                <NInputNumber
                  v-model:value="formModel.price_conf.discount_price"
                  :min="0"
                  :precision="2"
                  class="w-full"
                />
              </NFormItemGi>
              <NFormItemGi span="24" label="时长" path="price_conf.day">
                <NInputGroup class="w-full">
                  <NInputNumber v-model:value="formModel.price_conf.day" :min="1" :precision="0" class="flex-1" />
                  <NSelect
                    v-model:value="formModel.price_conf.time_type"
                    :options="durationTimeTypeOptions"
                    :consistent-menu-width="false"
                    class="w-92px"
                  />
                </NInputGroup>
              </NFormItemGi>
            </NGrid>
          </NTabPane>

          <NTabPane name="resource" tab="资源配置" display-directive="show">
            <NGrid responsive="screen" item-responsive :x-gap="16">
              <NFormItemGi span="24" label="设备数" path="resource_conf.device_num">
                <NInputNumber
                  v-model:value="formModel.resource_conf.device_num"
                  :min="0"
                  :precision="0"
                  class="w-full"
                />
              </NFormItemGi>
              <NFormItemGi span="24" label="用户数" path="resource_conf.project_user_num">
                <NInputNumber
                  v-model:value="formModel.resource_conf.project_user_num"
                  :min="0"
                  :precision="0"
                  class="w-full"
                />
              </NFormItemGi>
              <NFormItemGi span="24" label="日消息数" path="resource_conf.day_msg_num">
                <NInputNumber
                  v-model:value="formModel.resource_conf.day_msg_num"
                  :min="0"
                  :precision="0"
                  class="w-full"
                />
              </NFormItemGi>
              <NFormItemGi span="24" label="数据存储时长" path="resource_conf.data_store_day">
                <NInputGroup class="w-full">
                  <NInputNumber
                    v-model:value="formModel.resource_conf.data_store_day"
                    :min="1"
                    :precision="0"
                    class="flex-1"
                  />
                  <NSelect
                    v-model:value="formModel.resource_conf.time_type"
                    :options="durationTimeTypeOptions"
                    :consistent-menu-width="false"
                    class="w-92px"
                  />
                </NInputGroup>
              </NFormItemGi>
            </NGrid>
          </NTabPane>

          <NTabPane name="menu" tab="菜单配置" display-directive="if">
            <NFormItem label="菜单权限" class="pr-24px">
              <MenuTree
                v-if="visible"
                ref="menuTreeRef"
                v-model:checked-keys="formModel.menu_conf.menu_id_list"
                v-model:cascade="cascade"
                v-model:loading="menuLoading"
                :default-expand-all="false"
                :request-params="menuTreeRequestParams"
                :show-button-menus="false"
                :immediate="true"
              />
            </NFormItem>
          </NTabPane>
        </NTabs>
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
