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

const durationTimeTypeOptions = computed<CommonType.Option<Api.System.VersionTimeType>[]>(() => [
  { label: $t('page.corp.version.day'), value: 4 },
  { label: $t('page.corp.version.month'), value: 5 },
  { label: $t('page.corp.version.year'), value: 6 }
]);

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

const rules = computed<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>>(() => ({
  name: [
    createRequiredRule($t('page.corp.version.form.versionName.invalid')),
    {
      max: 10,
      message: $t('page.corp.version.message.versionNameMax'),
      trigger: ['input', 'blur']
    }
  ],
  start_at: createRequiredRule($t('page.corp.version.form.expectedStartTime.required')),
  'price_conf.original_price': createRequiredRule($t('page.corp.version.form.originalPrice.required')),
  'price_conf.discount_price': createRequiredRule($t('page.corp.version.form.discountPrice.required')),
  'price_conf.day': createRequiredRule($t('page.corp.version.form.duration.required')),
  'resource_conf.device_num': createRequiredRule($t('page.corp.version.form.deviceCount.required')),
  'resource_conf.project_user_num': createRequiredRule($t('page.corp.version.form.userCount.required')),
  'resource_conf.day_msg_num': createRequiredRule($t('page.corp.version.form.dailyMessageCount.required')),
  'resource_conf.data_store_day': createRequiredRule($t('page.corp.version.form.dataStoreDuration.required'))
}));

const isEdit = computed(() => operateType.value === 'edit');
const title = computed(() => (isEdit.value ? $t('page.corp.version.editVersion') : $t('page.corp.version.addVersion')));

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
    window.$message?.warning($t('page.corp.version.message.selectMenuRequired'));
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
          <NFormItemGi span="24" :label="$t('page.corp.version.versionName')" path="name">
            <NInput
              v-model:value="formModel.name"
              :placeholder="$t('page.corp.version.form.versionName.required')"
              :maxlength="10"
              show-count
            />
          </NFormItemGi>
          <NFormItemGi span="24" :label="$t('page.corp.version.versionDesc')">
            <NInput
              v-model:value="formModel.desc"
              type="textarea"
              :placeholder="$t('page.corp.version.form.versionDesc.required')"
              :maxlength="100"
              show-count
              :autosize="{ minRows: 3, maxRows: 5 }"
            />
          </NFormItemGi>
          <NFormItemGi span="24" :label="$t('page.corp.version.corp')">
            <RemoteSearchSelect
              v-model:value="formModel.corp_id"
              :request="fetchGetCorpList"
              :request-params="corpSelectRequestParams"
              :search-type="1"
              :selected-options="selectedCorpOption"
              label-field="name"
              value-field="id"
              :placeholder="$t('page.corp.version.form.corp.required')"
              clearable
              @selected-change="handleCorpSelectedChange"
            />
          </NFormItemGi>
          <NFormItemGi span="24" :label="$t('page.corp.version.expectedStartTime')" path="start_at">
            <NDatePicker
              v-model:formatted-value="formModel.start_at"
              type="datetime"
              value-format="t"
              clearable
              class="w-full"
              :placeholder="$t('page.corp.version.form.expectedStartTime.required')"
              :disabled="isEdit"
              :is-date-disabled="isEdit ? undefined : isStartDateDisabled"
            />
          </NFormItemGi>
        </NGrid>

        <NTabs type="segment" animated class="mt-16px">
          <NTabPane name="price" :tab="$t('page.corp.version.priceConfig')" display-directive="show">
            <NGrid responsive="screen" item-responsive :x-gap="16">
              <NFormItemGi span="24" :label="$t('page.corp.version.originalPrice')" path="price_conf.original_price">
                <NInputNumber
                  v-model:value="formModel.price_conf.original_price"
                  :min="0"
                  :precision="2"
                  class="w-full"
                />
              </NFormItemGi>
              <NFormItemGi span="24" :label="$t('page.corp.version.discountPrice')" path="price_conf.discount_price">
                <NInputNumber
                  v-model:value="formModel.price_conf.discount_price"
                  :min="0"
                  :precision="2"
                  class="w-full"
                />
              </NFormItemGi>
              <NFormItemGi span="24" :label="$t('page.corp.version.duration')" path="price_conf.day">
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

          <NTabPane name="resource" :tab="$t('page.corp.version.resourceConfig')" display-directive="show">
            <NGrid responsive="screen" item-responsive :x-gap="16">
              <NFormItemGi span="24" :label="$t('page.corp.version.deviceCount')" path="resource_conf.device_num">
                <NInputNumber
                  v-model:value="formModel.resource_conf.device_num"
                  :min="0"
                  :precision="0"
                  class="w-full"
                />
              </NFormItemGi>
              <NFormItemGi span="24" :label="$t('page.corp.version.userCount')" path="resource_conf.project_user_num">
                <NInputNumber
                  v-model:value="formModel.resource_conf.project_user_num"
                  :min="0"
                  :precision="0"
                  class="w-full"
                />
              </NFormItemGi>
              <NFormItemGi
                span="24"
                :label="$t('page.corp.version.dailyMessageCount')"
                path="resource_conf.day_msg_num"
              >
                <NInputNumber
                  v-model:value="formModel.resource_conf.day_msg_num"
                  :min="0"
                  :precision="0"
                  class="w-full"
                />
              </NFormItemGi>
              <NFormItemGi
                span="24"
                :label="$t('page.corp.version.dataStoreDuration')"
                path="resource_conf.data_store_day"
              >
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

          <NTabPane name="menu" :tab="$t('page.corp.version.menuConfig')" display-directive="if">
            <NFormItem :label="$t('page.corp.version.menuPermission')" class="pr-24px">
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
          <NButton @click="close">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
