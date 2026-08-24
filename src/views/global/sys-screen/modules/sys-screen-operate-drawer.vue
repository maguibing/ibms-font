<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { jsonClone } from '@sa/utils';
import { fetchGetIndustryList } from '@/service/api/industry';
import {
  fetchCreateSysScreen,
  fetchGetProjectList,
  fetchGetSysScreen,
  fetchUpdateSysScreen
} from '@/service/api/sys-screen';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import FileUpload from '@/components/custom/file-upload.vue';
import { $t } from '@/locales';

defineOptions({
  name: 'SysScreenOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowId?: CommonType.IdType | null;
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
const { loading: detailLoading, startLoading: startDetailLoading, endLoading: endDetailLoading } = useLoading();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, App.I18n.I18nKey> = {
    add: 'page.global.sysScreen.addSysScreen',
    edit: 'page.global.sysScreen.editSysScreen'
  };
  return $t(titles[props.operateType]);
});

const industryMap = ref<CommonType.IdNameMap>({});
const model = ref<Model>(createDefaultModel());
const projectMap = ref<CommonType.IdNameMap>({});

const selectedIndustryOptions = computed(() => {
  return model.value.industry_id_list
    .map(id => industryMap.value[String(id)])
    .filter((item): item is CommonType.IdNameRecord => Boolean(item));
});

const selectedProjectOptions = computed(() => {
  return model.value.project_conf
    .map(item => {
      if (item.project_id === null) return null;
      return projectMap.value[String(item.project_id)];
    })
    .filter((item): item is CommonType.IdNameRecord => Boolean(item));
});

const rules: Record<string, App.Global.FormRule> = {
  name: createRequiredRule($t('page.global.sysScreen.form.name.required')),
  'detail.route_path': createRequiredRule($t('page.global.sysScreen.form.routePath.required')),
  'detail.component_path': createRequiredRule($t('page.global.sysScreen.form.componentPath.required')),
  url: createRequiredRule($t('page.global.sysScreen.form.thumbnail.required')),
  industry_id_list: createRequiredRule($t('page.global.sysScreen.form.industryType.required')),
  status: createRequiredRule($t('page.global.sysScreen.form.status.required'))
};

function createDefaultDetail(): Api.System.SysScreenDetail {
  return {
    component_path: '',
    keep_alive: true,
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
    show_logout_button: false,
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

function toNumberStatus(status: Api.System.SysScreenDetailData['status'] | null | undefined): 1 | 2 {
  return Number(status) === 2 ? 2 : 1;
}

function normalizeProjectConf(conf: ProjectConf): ProjectConf {
  const {
    is_mock = false,
    project_id = null,
    show_3d_visual = false,
    show_enter_system = false,
    show_logout_button = false,
    show_personal_info = false
  } = conf;
  return {
    is_mock,
    project_id,
    show_3d_visual,
    show_enter_system,
    show_logout_button,
    show_personal_info
  };
}

function buildModelFromDetail(detail: Api.System.SysScreenDetailData): Model {
  const projectConf = detail.project_conf?.sub_conf_list?.length
    ? detail.project_conf.sub_conf_list.map(item => normalizeProjectConf(item))
    : [createDefaultProjectConf()];

  return {
    detail: detail.detail ? jsonClone(detail.detail) : createDefaultDetail(),
    industry_id_list: detail.industry_conf?.industry_id_list ? jsonClone(detail.industry_conf.industry_id_list) : [],
    name: detail.name || '',
    project_conf: projectConf,
    status: toNumberStatus(detail.status),
    url: detail.url || ''
  };
}

async function handleUpdateModel() {
  model.value = createDefaultModel();
  industryMap.value = {};
  projectMap.value = {};

  if (props.operateType === 'edit' && props.rowId !== null && props.rowId !== undefined) {
    await getSysScreenDetail(props.rowId);
  }
}

async function getSysScreenDetail(id: CommonType.IdType) {
  startDetailLoading();
  const { data, error } = await fetchGetSysScreen({ id, options: [{ key: 1 }, { key: 2 }, { key: 3 }] }).finally(
    endDetailLoading
  );

  if (error) return;

  industryMap.value = data.industry_map || {};
  projectMap.value = data.project_map || {};
  model.value = buildModelFromDetail(data.sys_screen);
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
    window.$message?.warning($t('page.global.sysScreen.message.projectConfigRequired'));
    return;
  }

  if (model.value.project_conf.some(item => item.project_id === null)) {
    window.$message?.warning($t('page.global.sysScreen.message.projectRequired'));
    return;
  }

  startLoading();

  if (props.operateType === 'edit') {
    const { error } = await fetchUpdateSysScreen({
      ...model.value,
      id: props.rowId!
    });
    endLoading();

    if (error) return;

    window.$message?.success($t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
    return;
  }

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
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="700" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top" :label-width="100">
        <NGrid responsive="screen" item-responsive :x-gap="18">
          <NFormItemGi span="24" :label="$t('page.global.sysScreen.name')" path="name">
            <NInput
              v-model:value="model.name"
              maxlength="20"
              show-count
              :placeholder="$t('page.global.sysScreen.form.name.required')"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.global.sysScreen.routePath')" path="detail.route_path">
            <NInput
              v-model:value="model.detail.route_path"
              :placeholder="$t('page.global.sysScreen.placeholder.routePathExample')"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.global.sysScreen.routeName')" path="detail.route_name">
            <NInput
              v-model:value="model.detail.route_name"
              :placeholder="$t('page.global.sysScreen.placeholder.routeNameExample')"
            />
          </NFormItemGi>
          <NFormItemGi span="24" :label="$t('page.global.sysScreen.componentPath')" path="detail.component_path">
            <NInputGroup>
              <NInputGroupLabel>src/views/</NInputGroupLabel>
              <NInput
                v-model:value="model.detail.component_path"
                :placeholder="$t('page.global.sysScreen.placeholder.componentPathExample')"
              />
              <NInputGroupLabel>.vue</NInputGroupLabel>
            </NInputGroup>
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.global.sysScreen.industryType')" path="industry_id_list">
            <RemoteSearchSelect
              v-model:value="model.industry_id_list"
              :request="fetchGetIndustryList"
              :search-type="1"
              :selected-options="selectedIndustryOptions"
              label-field="name"
              value-field="id"
              multiple
              clearable
              :placeholder="$t('page.global.sysScreen.form.industryType.required')"
            />
          </NFormItemGi>
          <NFormItemGi span="24" :label="$t('page.global.sysScreen.projectConfig')" path="project_conf">
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
                    {{ $t('page.global.sysScreen.project') }} {{ index + 1 }}
                  </div>
                  <RemoteSearchSelect
                    v-model:value="item.project_id"
                    class="max-w-280px flex-1"
                    :request="fetchGetProjectList"
                    :search-type="1"
                    :selected-options="selectedProjectOptions"
                    label-field="name"
                    value-field="id"
                    clearable
                    :placeholder="$t('page.global.sysScreen.form.project.required')"
                  />
                </div>
                <NGrid responsive="screen" item-responsive :x-gap="10" :y-gap="10">
                  <NGridItem span="24 s:12 m:8">
                    <div
                      class="h-38px flex items-center justify-between rounded-4px border border-#edf0f5 border-solid px-10px dark:border-#2b2f36"
                    >
                      <span>{{ $t('page.global.sysScreen.mockData') }}</span>
                      <NSwitch v-model:value="item.is_mock" />
                    </div>
                  </NGridItem>
                  <NGridItem span="24 s:12 m:8">
                    <div
                      class="h-38px flex items-center justify-between rounded-4px border border-#edf0f5 border-solid px-10px dark:border-#2b2f36"
                    >
                      <span>{{ $t('page.global.sysScreen.visual3d') }}</span>
                      <NSwitch v-model:value="item.show_3d_visual" />
                    </div>
                  </NGridItem>
                  <NGridItem span="24 s:12 m:8">
                    <div
                      class="h-38px flex items-center justify-between rounded-4px border border-#edf0f5 border-solid px-10px dark:border-#2b2f36"
                    >
                      <span>{{ $t('page.global.sysScreen.personalInfo') }}</span>
                      <NSwitch v-model:value="item.show_personal_info" />
                    </div>
                  </NGridItem>
                  <NGridItem span="24 s:12 m:8">
                    <div
                      class="h-38px flex items-center justify-between rounded-4px border border-#edf0f5 border-solid px-10px dark:border-#2b2f36"
                    >
                      <span>{{ $t('page.global.sysScreen.enterSystem') }}</span>
                      <NSwitch v-model:value="item.show_enter_system" />
                    </div>
                  </NGridItem>
                  <NGridItem span="24 s:12 m:8">
                    <div
                      class="h-38px flex items-center justify-between rounded-4px border border-#edf0f5 border-solid px-10px dark:border-#2b2f36"
                    >
                      <span>{{ $t('page.global.sysScreen.logout') }}</span>
                      <NSwitch v-model:value="item.show_logout_button" />
                    </div>
                  </NGridItem>
                </NGrid>
              </div>
              <NButton type="primary" dashed block @click="addProjectConf">
                <template #icon>
                  <icon-material-symbols-add class="text-icon" />
                </template>
                {{ $t('page.global.sysScreen.addProject') }}
              </NButton>
            </div>
          </NFormItemGi>
          <NFormItemGi span="24" :label="$t('page.global.sysScreen.status')" path="status">
            <NRadioGroup v-model:value="model.status">
              <NSpace>
                <NRadio :value="1">{{ $t('dict.sys_normal_disable.normal') }}</NRadio>
                <NRadio :value="2">{{ $t('dict.sys_normal_disable.disable') }}</NRadio>
              </NSpace>
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi span="24" :label="$t('page.global.sysScreen.thumbnail')" path="url">
            <div class="w-full flex-col gap-12px">
              <FileUpload
                v-model:value="model.url"
                module-name="sys-screen"
                upload-type="image"
                :max="1"
                :file-size="5"
              />
            </div>
          </NFormItemGi>
        </NGrid>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="loading || detailLoading" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
