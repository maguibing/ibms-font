<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchGetDeviceList, fetchGetLogicPointList } from '@/service/api/device';
import {
  fetchCreateProjectSysScreenTagPoint,
  fetchGetProjectSysScreenTagPoint,
  fetchUpdateProjectSysScreenTagPoint
} from '@/service/api/visual/screen';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'ProjectSysScreenTagPointOperateDrawer'
});

type MapItem = Api.Visual.ProjectSysScreenTagPointMapItem;

interface Props {
  operateType: NaiveUI.TableOperateType;
  projectSysScreenId?: CommonType.IdType | null;
  projectSysScreenTagId?: CommonType.IdType | null;
  rowData?: Api.Visual.ProjectSysScreenTagPoint | null;
}

interface Emits {
  (e: 'submitted'): void;
}

type Model = {
  id: CommonType.IdType | null;
  device_id: CommonType.IdType | null;
  logic_point_id: CommonType.IdType | null;
  mapping_point_name: string;
  project_sys_screen_id: CommonType.IdType | null;
  project_sys_screen_tag_id: CommonType.IdType | null;
};

type RuleKey = Extract<keyof Model, 'device_id' | 'logic_point_id' | 'mapping_point_name'>;

const props = withDefaults(defineProps<Props>(), {
  projectSysScreenId: null,
  projectSysScreenTagId: null,
  rowData: null
});
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();

const model = ref<Model>(createDefaultModel());
const deviceMap = ref<Record<string, MapItem>>({});
const logicPointMap = ref<Record<string, MapItem>>({});

const isEdit = computed(() => props.operateType === 'edit');
const drawerTitle = computed(() => (isEdit.value ? '编辑映射点位' : '新增映射点位'));

const selectedDevice = computed(() => {
  if (!model.value.device_id) return null;

  return deviceMap.value[String(model.value.device_id)] ?? null;
});

const selectedLogicPoint = computed(() => {
  if (!model.value.logic_point_id) return null;

  return logicPointMap.value[String(model.value.logic_point_id)] ?? null;
});

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

const rules: Record<RuleKey, App.Global.FormRule> = {
  device_id: createRequiredRule('请选择设备名称'),
  logic_point_id: createRequiredRule('请选择点位名称'),
  mapping_point_name: createRequiredRule('请输入映射点位名称')
};

function createDefaultModel(): Model {
  return {
    id: null,
    device_id: null,
    logic_point_id: null,
    mapping_point_name: '',
    project_sys_screen_id: props.projectSysScreenId ?? null,
    project_sys_screen_tag_id: props.projectSysScreenTagId ?? null
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
  return fetchGetLogicPointList(withDefaultSearchOption(params, { type: 7, value: '' }));
}

function closeDrawer() {
  visible.value = false;
}

function buildModelFromPoint({
  id,
  device_id,
  logic_point_id,
  mapping_point_name,
  project_sys_screen_id,
  project_sys_screen_tag_id
}: Api.Visual.ProjectSysScreenTagPoint): Model {
  return {
    id,
    device_id,
    logic_point_id,
    mapping_point_name,
    project_sys_screen_id,
    project_sys_screen_tag_id
  };
}

async function handleUpdateModel() {
  model.value = createDefaultModel();
  deviceMap.value = {};
  logicPointMap.value = {};

  if (!isEdit.value || !props.rowData) return;

  startLoading();
  const { data, error } = await fetchGetProjectSysScreenTagPoint({
    id: props.rowData.id,
    options: [{ key: 1 }, { key: 2 }]
  }).finally(endLoading);

  if (error) return;

  const detail = data.project_sys_screen_tag_point;
  deviceMap.value = data.device_map ?? {};
  logicPointMap.value = data.logic_point_map ?? {};
  model.value = buildModelFromPoint(detail);
}

function handleDeviceSelectedChange() {
  model.value.logic_point_id = null;
}

function buildSubmitParams(): Api.Visual.ProjectSysScreenTagPointOperateParams {
  const params: Api.Visual.ProjectSysScreenTagPointOperateParams = {
    device_id: Number(model.value.device_id),
    logic_point_id: Number(model.value.logic_point_id),
    mapping_point_name: model.value.mapping_point_name,
    project_sys_screen_id: Number(model.value.project_sys_screen_id),
    project_sys_screen_tag_id: Number(model.value.project_sys_screen_tag_id)
  };

  if (isEdit.value) {
    params.id = model.value.id;
  }

  return params;
}

async function handleSubmit() {
  if (loading.value) return;

  if (!model.value.project_sys_screen_id || !model.value.project_sys_screen_tag_id) {
    window.$message?.warning('请选择左侧标签');
    return;
  }

  startLoading();
  try {
    await validate();

    const request = isEdit.value ? fetchUpdateProjectSysScreenTagPoint : fetchCreateProjectSysScreenTagPoint;
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
    handleUpdateModel();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="520" class="max-w-90%">
    <NDrawerContent :title="drawerTitle" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
        <NFormItem label="设备名称" path="device_id">
          <RemoteSearchSelect
            v-model:value="model.device_id"
            :request="fetchDeviceList"
            :search-type="2"
            :selected-options="selectedDevice"
            label-field="name"
            value-field="id"
            placeholder="请选择设备"
            clearable
            @selected-change="handleDeviceSelectedChange"
          />
        </NFormItem>
        <NFormItem label="点位名称" path="logic_point_id">
          <RemoteSearchSelect
            v-model:value="model.logic_point_id"
            :request="fetchLogicPointList"
            :request-params="logicPointRequestParams"
            :search-type="7"
            :selected-options="selectedLogicPoint"
            label-field="name"
            value-field="id"
            placeholder="请选择点位"
            clearable
          />
        </NFormItem>
        <NFormItem label="映射点位名称" path="mapping_point_name">
          <NInput v-model:value="model.mapping_point_name" maxlength="50" show-count placeholder="请输入映射点位名称" />
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

<style scoped></style>
