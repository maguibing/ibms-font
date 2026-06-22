<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { SelectOption, UploadFileInfo } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { jsonClone } from '@sa/utils';
import { fetchGetIndustryList } from '@/service/api/industry';
import { fetchCreateSysScreen } from '@/service/api/sys-screen';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import FileUpload from '@/components/custom/file-upload.vue';
import { $t } from '@/locales';

defineOptions({
  name: 'SysScreenOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.System.SysScreen | null;
}

interface Emits {
  (e: 'submitted'): void;
}

type ProjectConf = Api.System.SysScreenProjectConf;
type Model = Api.System.SysScreenOperateParams;

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();
const { loading: industryLoading, startLoading: startIndustryLoading, endLoading: endIndustryLoading } = useLoading();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增大屏',
    edit: '修改大屏'
  };
  return titles[props.operateType];
});

const industryOptions = ref<SelectOption[]>([]);
const coverFileList = ref<UploadFileInfo[]>([]);
const model = ref<Model>(createDefaultModel());

const rules: Record<string, App.Global.FormRule> = {
  name: createRequiredRule('请输入大屏名称'),
  'detail.route_path': createRequiredRule('请输入路由路径'),
  'detail.component_path': createRequiredRule('请输入组件路径'),
  url: createRequiredRule('请上传缩略图或填写图片地址'),
  industry_id_list: createRequiredRule('请选择行业类型'),
  status: createRequiredRule('请选择状态')
};

function createDefaultDetail(): Api.System.SysScreenDetail {
  return {
    component_path: '',
    route_name: '',
    route_path: ''
  };
}

function createDefaultProjectConf(): ProjectConf {
  return {
    is_mock: false,
    project_id: null,
    show_3d_visual: false,
    show_enter_system: true,
    show_logout_button: true,
    show_personal_info: false
  };
}

function createDefaultModel(): Model {
  return {
    detail: createDefaultDetail(),
    industry_id_list: [],
    name: '',
    project_conf: [createDefaultProjectConf()],
    status: 1,
    url: ''
  };
}

function toNumberStatus(status: Api.System.SysScreen['status'] | null | undefined): 1 | 2 {
  return Number(status) === 2 ? 2 : 1;
}

function buildModelFromRow(row: Api.System.SysScreen): Model {
  return {
    detail: row.detail ? jsonClone(row.detail) : createDefaultDetail(),
    industry_id_list: row.industry_id_list ? jsonClone(row.industry_id_list) : [],
    name: row.name || '',
    project_conf: row.project_conf?.length ? jsonClone(row.project_conf) : [createDefaultProjectConf()],
    status: toNumberStatus(row.status),
    url: row.url || ''
  };
}

function handleUpdateModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    model.value = buildModelFromRow(props.rowData);
  }
}

async function getIndustryOptions() {
  startIndustryLoading();
  const { data, error } = await fetchGetIndustryList({
    list_option: { offset: 0, limit: 100 }
  });
  endIndustryLoading();

  if (error) return;

  industryOptions.value = data.list.map(item => ({ label: item.name, value: item.id }));
}

function closeDrawer() {
  visible.value = false;
}

function addProjectConf() {
  model.value.project_conf.push(createDefaultProjectConf());
}

function removeProjectConf(index: number) {
  model.value.project_conf.splice(index, 1);
}

async function handleSubmit() {
  await validate();

  if (model.value.project_conf.length === 0) {
    window.$message?.warning('请至少添加一个项目配置');
    return;
  }

  if (model.value.project_conf.some(item => item.project_id === null)) {
    window.$message?.warning('请完善项目ID');
    return;
  }

  if (props.operateType === 'edit') {
    window.$message?.warning('修改接口未接入');
    return;
  }

  startLoading();
  const { error } = await fetchCreateSysScreen(model.value);
  endLoading();

  if (error) return;

  window.$message?.success($t('common.addSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModel();
    coverFileList.value = [];
    restoreValidation();
    if (industryOptions.value.length === 0) {
      getIndustryOptions();
    }
  }
});

watch(
  coverFileList,
  value => {
    const url = value.find(item => item.status === 'finished')?.url || '';
    if (url !== model.value.url) {
      model.value.url = url;
    }
  },
  { deep: true }
);
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="700" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top" :label-width="100">
        <NGrid responsive="screen" item-responsive :x-gap="18">
          <NFormItemGi span="24" label="大屏名称" path="name">
            <NInput v-model:value="model.name" maxlength="20" show-count placeholder="请输入大屏名称" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="路由路径" path="detail.route_path">
            <NInput v-model:value="model.detail.route_path" placeholder="例如 /smart-waterControl" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="路由名称" path="detail.route_name">
            <NInput v-model:value="model.detail.route_name" placeholder="例如 SmartWaterControl" />
          </NFormItemGi>
          <NFormItemGi span="24" label="组件路径" path="detail.component_path">
            <NInputGroup>
              <NInputGroupLabel>src/views/</NInputGroupLabel>
              <NInput v-model:value="model.detail.component_path" placeholder="例如 SmartWaterControl/index" />
              <NInputGroupLabel>.vue</NInputGroupLabel>
            </NInputGroup>
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="行业类型" path="industry_id_list">
            <NSelect
              v-model:value="model.industry_id_list"
              multiple
              filterable
              :loading="industryLoading"
              :options="industryOptions"
              placeholder="请选择行业类型"
            />
          </NFormItemGi>
          <NFormItemGi span="24" label="项目配置" path="project_conf">
            <div class="w-full flex-col gap-10px">
              <div
                v-for="(item, index) in model.project_conf"
                :key="index"
                class="relative rounded-6px border border-#e5e7eb border-solid p-12px pr-48px dark:border-#2f3338"
              >
                <NButton
                  v-if="model.project_conf.length > 1"
                  quaternary
                  circle
                  type="error"
                  class="absolute right-10px top-10px"
                  @click="removeProjectConf(index)"
                >
                  <template #icon>
                    <SvgIcon icon="material-symbols:delete-outline" class="text-icon" />
                  </template>
                </NButton>
                <div class="mb-10px flex items-center gap-12px">
                  <div
                    class="h-34px min-w-64px flex-center rounded-4px bg-#f5f7fb text-13px text-#646a73 font-500 dark:bg-#202126 dark:text-#c9cdd4"
                  >
                    项目 {{ index + 1 }}
                  </div>
                  <NInputNumber
                    v-model:value="item.project_id"
                    class="max-w-240px flex-1"
                    :show-button="false"
                    placeholder="项目ID"
                  />
                </div>
                <NGrid responsive="screen" item-responsive :x-gap="10" :y-gap="10">
                  <NGridItem span="24 s:12 m:8">
                    <div
                      class="h-38px flex items-center justify-between rounded-4px border border-#edf0f5 border-solid px-10px dark:border-#2b2f36"
                    >
                      <span>Mock数据</span>
                      <NSwitch v-model:value="item.is_mock" />
                    </div>
                  </NGridItem>
                  <NGridItem span="24 s:12 m:8">
                    <div
                      class="h-38px flex items-center justify-between rounded-4px border border-#edf0f5 border-solid px-10px dark:border-#2b2f36"
                    >
                      <span>3D可视化</span>
                      <NSwitch v-model:value="item.show_3d_visual" />
                    </div>
                  </NGridItem>
                  <NGridItem span="24 s:12 m:8">
                    <div
                      class="h-38px flex items-center justify-between rounded-4px border border-#edf0f5 border-solid px-10px dark:border-#2b2f36"
                    >
                      <span>个人信息</span>
                      <NSwitch v-model:value="item.show_personal_info" />
                    </div>
                  </NGridItem>
                  <NGridItem span="24 s:12 m:8">
                    <div
                      class="h-38px flex items-center justify-between rounded-4px border border-#edf0f5 border-solid px-10px dark:border-#2b2f36"
                    >
                      <span>进入系统</span>
                      <NSwitch v-model:value="item.show_enter_system" />
                    </div>
                  </NGridItem>
                  <NGridItem span="24 s:12 m:8">
                    <div
                      class="h-38px flex items-center justify-between rounded-4px border border-#edf0f5 border-solid px-10px dark:border-#2b2f36"
                    >
                      <span>退出登录</span>
                      <NSwitch v-model:value="item.show_logout_button" />
                    </div>
                  </NGridItem>
                </NGrid>
              </div>
              <NButton type="primary" dashed block @click="addProjectConf">
                <template #icon>
                  <icon-material-symbols-add class="text-icon" />
                </template>
                添加项目
              </NButton>
            </div>
          </NFormItemGi>
          <NFormItemGi span="24" label="状态" path="status">
            <NRadioGroup v-model:value="model.status">
              <NSpace>
                <NRadio :value="1">启用</NRadio>
                <NRadio :value="2">停用</NRadio>
              </NSpace>
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi span="24" label="缩略图" path="url">
            <div class="w-full flex-col gap-12px">
              <FileUpload v-model:file-list="coverFileList" upload-type="image" :max="1" :file-size="5" />
            </div>
          </NFormItemGi>
        </NGrid>
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
