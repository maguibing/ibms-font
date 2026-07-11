<script setup lang="ts">
import { computed, h, onMounted, ref, shallowRef, watch } from 'vue';
import type { DataTableColumns, UploadFileInfo } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { StatusTag, type StatusTagMap } from '@sa/materials';
import { fetchCreateDeviceType } from '@/service/api/device';
import {
  fetchGetDeviceTypeTemplateCategoryList,
  fetchGetDeviceTypeTemplateList,
  fetchGetDeviceTypeTemplatePointList
} from '@/service/api/device-type-template';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import DataTypeTag from '@/components/custom/data-type-tag.vue';
import FileUpload from '@/components/custom/file-upload.vue';
import { $t } from '@/locales';

defineOptions({
  name: 'DeviceTypeTemplateImportPanel'
});

interface Props {
  visible: boolean;
}

interface Emits {
  (e: 'selectedCountChange', value: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

type ImportModel = Pick<Api.Device.DeviceTypeOperateParams, 'desc' | 'icon' | 'key' | 'name' | 'status'>;

const DEVICE_TYPE_STATUS_MAP: StatusTagMap = {
  '1': { label: '启用', type: 'success' },
  '2': { label: '禁用', type: 'default' }
};

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading: categoryLoading, startLoading: startCategoryLoading, endLoading: endCategoryLoading } = useLoading();
const { loading: templateLoading, startLoading: startTemplateLoading, endLoading: endTemplateLoading } = useLoading();
const { loading: pointLoading, startLoading: startPointLoading, endLoading: endPointLoading } = useLoading();
const { loading: submitLoading, startLoading: startSubmitLoading, endLoading: endSubmitLoading } = useLoading();

const categories = ref<Api.System.DeviceTypeTemplateCategory[]>([]);
const templates = ref<Api.System.DeviceTypeTemplate[]>([]);
const points = ref<Api.System.DeviceTypeTemplatePoint[]>([]);
const selectedCategoryId = shallowRef<CommonType.IdType | null>(null);
const selectedTemplate = shallowRef<Api.System.DeviceTypeTemplate | null>(null);
const templateSearchName = shallowRef('');
const templatePage = shallowRef(1);
const templatePageSize = shallowRef(10);
const templateTotal = shallowRef(0);
const checkedPointIds = ref<CommonType.IdType[]>([]);
const iconFileList = ref<UploadFileInfo[]>([]);
const model = ref<ImportModel>(createDefaultModel());

const rules: Record<keyof Pick<ImportModel, 'key' | 'name' | 'status'>, App.Global.FormRule> = {
  name: createRequiredRule('请输入设备类型名称'),
  key: createRequiredRule('请输入设备类型标识'),
  status: createRequiredRule('请选择状态')
};

const selectedPointCount = computed(() => checkedPointIds.value.length);
const selectedCategory = computed(
  () => categories.value.find(category => category.id === selectedCategoryId.value) ?? null
);
const categoryOptions = computed(() =>
  categories.value.map(category => ({
    label: category.name || '-',
    value: category.id
  }))
);
const templateEmptyDescription = computed(() => (selectedCategory.value ? '暂无设备类型模板' : '请选择模板分类'));
const templateSummaryText = computed(() =>
  selectedCategory.value ? `共 ${templateTotal.value} 个模板` : '未选择分类'
);

const pointColumns = computed<DataTableColumns<Api.System.DeviceTypeTemplatePoint>>(() => [
  {
    type: 'selection',
    align: 'center',
    width: 44
  },
  {
    key: 'name',
    title: '点位名称',
    minWidth: 120,
    ellipsis: {
      tooltip: true
    },
    render: row => row.name || '-'
  },
  {
    key: 'key',
    title: '点位标识',
    minWidth: 120,
    ellipsis: {
      tooltip: true
    },
    render: row => row.key || '-'
  },
  {
    key: 'data_type',
    title: '数据类型',
    align: 'center',
    width: 110,
    render: row => h(DataTypeTag, { value: row.data_type })
  }
]);

function createDefaultModel(): ImportModel {
  return {
    desc: '',
    icon: '',
    key: '',
    name: '',
    status: 1
  };
}

function buildIconFileList(url?: string | null): UploadFileInfo[] {
  if (!url) return [];

  return [
    {
      id: url,
      name: url.split('/').pop() || '图标',
      status: 'finished',
      url
    }
  ];
}

function resetState() {
  categories.value = [];
  selectedCategoryId.value = null;
  templateSearchName.value = '';
  templatePage.value = 1;
  clearTemplateData();
  emit('selectedCountChange', 0);
}

function clearSelectedTemplate() {
  selectedTemplate.value = null;
  points.value = [];
  checkedPointIds.value = [];
  iconFileList.value = [];
  model.value = createDefaultModel();
}

function clearTemplateData() {
  templates.value = [];
  templateTotal.value = 0;
  clearSelectedTemplate();
}

function buildCategoryRequest(): CommonType.CommonListQueryParams {
  return {
    list_option: {
      limit: 100,
      offset: 0,
      options: [{ type: 104, value: '101' }]
    }
  };
}

function buildTemplateRequest(): CommonType.CommonListQueryParams {
  const options: CommonType.CommonTypeOptions[] = [{ type: 104, value: '101' }];

  if (selectedCategory.value) {
    options.push({ type: 1, value: String(selectedCategory.value.id) });
  }

  if (templateSearchName.value) {
    options.push({ type: 2, value: templateSearchName.value });
  }

  return {
    list_option: {
      limit: templatePageSize.value,
      offset: (templatePage.value - 1) * templatePageSize.value,
      options
    }
  };
}

function buildPointRequest(): CommonType.CommonListQueryParams {
  return {
    list_option: {
      limit: 1000,
      offset: 0,
      options: [
        { type: 104, value: '101' },
        { type: 1, value: String(selectedTemplate.value?.id) }
      ]
    }
  };
}

function fillModelFromTemplate(template: Api.System.DeviceTypeTemplate) {
  model.value = {
    desc: template.desc ?? '',
    icon: template.icon ?? '',
    key: template.key ?? '',
    name: template.name ?? '',
    status: Number(template.status) === 1 ? 1 : 2
  };
  iconFileList.value = buildIconFileList(template.icon);
}

function getTemplateItemClass(template: Api.System.DeviceTypeTemplate) {
  const selected = selectedTemplate.value?.id === template.id;

  return [
    'relative min-h-74px w-full flex flex-col items-stretch gap-8px overflow-hidden rounded-12px border py-12px pl-15px pr-12px text-left text-[var(--n-text-color)] transition-all duration-200',
    selected
      ? 'border-[rgba(var(--primary-color),0.42)] bg-[linear-gradient(90deg,rgba(var(--primary-color),0.1),rgba(var(--primary-color),0.035)_72%,transparent),var(--n-color)] shadow-[inset_0_0_0_1px_rgba(var(--primary-color),0.06),0_8px_20px_rgba(var(--primary-color),0.08)]'
      : 'border-[rgba(148,163,184,0.12)] bg-[rgba(148,163,184,0.055)] hover:(border-[rgba(var(--primary-color),0.28)] bg-[rgba(var(--primary-color),0.045)] shadow-[0_8px_18px_rgba(15,23,42,0.045)])'
  ];
}

function getTemplateMetaClass(template: Api.System.DeviceTypeTemplate) {
  return [
    'min-w-0 flex-1 truncate text-12px transition-colors',
    selectedTemplate.value?.id === template.id ? 'text-primary/80' : 'text-[var(--n-text-color-3)]'
  ];
}

async function getCategoryData() {
  startCategoryLoading();
  const { data, error } =
    await fetchGetDeviceTypeTemplateCategoryList(buildCategoryRequest()).finally(endCategoryLoading);
  if (error) return;

  categories.value = Array.isArray(data?.list) ? data.list : [];
  clearTemplateData();
}

async function getTemplateData() {
  clearTemplateData();

  if (!selectedCategory.value) return;

  startTemplateLoading();
  const { data, error } = await fetchGetDeviceTypeTemplateList(buildTemplateRequest()).finally(endTemplateLoading);
  if (error) return;

  templates.value = Array.isArray(data?.list) ? data.list : [];
  templateTotal.value = data?.paginate?.total ?? 0;
}

async function getPointData() {
  if (!selectedTemplate.value) return;

  startPointLoading();
  const { data, error } = await fetchGetDeviceTypeTemplatePointList(buildPointRequest()).finally(endPointLoading);
  if (error) return;

  points.value = Array.isArray(data?.list) ? data.list : [];
  checkedPointIds.value = points.value.map(item => item.id);
}

async function handleSelectCategory(value: CommonType.IdType | null) {
  selectedCategoryId.value = value;
  templatePage.value = 1;

  if (!selectedCategory.value) {
    clearTemplateData();
    return;
  }

  await getTemplateData();
}

async function handleSelectTemplate(template: Api.System.DeviceTypeTemplate) {
  selectedTemplate.value = template;
  fillModelFromTemplate(template);
  restoreValidation();
  await getPointData();
}

async function handleSearchTemplate() {
  templatePage.value = 1;
  await getTemplateData();
}

async function handleResetTemplateSearch() {
  templateSearchName.value = '';
  templatePage.value = 1;
  await getTemplateData();
}

async function handleTemplatePageChange(page: number) {
  templatePage.value = page;
  await getTemplateData();
}

function buildSubmitParams(): Api.Device.DeviceTypeOperateParams {
  return {
    name: model.value.name,
    key: model.value.key,
    desc: model.value.desc,
    icon: model.value.icon,
    status: model.value.status,
    device_type_template_point_id_list: checkedPointIds.value
  };
}

async function submit() {
  if (submitLoading.value) return false;

  if (!selectedTemplate.value) {
    window.$message?.warning('请选择设备类型模板');
    return false;
  }

  if (checkedPointIds.value.length === 0) {
    window.$message?.warning('请选择点位');
    return false;
  }

  await validate();

  startSubmitLoading();
  const { error } = await fetchCreateDeviceType(buildSubmitParams()).finally(endSubmitLoading);
  if (error) return false;

  window.$message?.success($t('common.addSuccess'));
  return true;
}

onMounted(getCategoryData);

watch(
  () => props.visible,
  value => {
    if (!value) {
      resetState();
      restoreValidation();
    }
  }
);

watch(
  iconFileList,
  value => {
    const url = value.find(item => item.status === 'finished')?.url || '';
    if (url !== model.value.icon) {
      model.value.icon = url;
    }
  },
  { deep: true }
);

watch(selectedPointCount, value => {
  emit('selectedCountChange', value);
});

defineExpose({
  submit
});
</script>

<template>
  <div class="h-full min-h-0 grid grid-cols-[340px_minmax(0,1fr)] gap-16px lt-lg:grid-cols-1">
    <section
      class="min-h-0 min-w-0 flex flex-col overflow-hidden rounded-14px border border-[rgba(148,163,184,0.18)] bg-[linear-gradient(180deg,rgba(var(--primary-color),0.035),transparent_42%),var(--n-color)] shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
    >
      <div
        class="min-h-66px flex items-center justify-between gap-12px border-b border-[rgba(148,163,184,0.16)] px-16px py-14px"
      >
        <div class="text-15px text-[var(--n-text-color)] font-600 leading-22px">设备类型模板</div>
        <NTag size="small" :bordered="false" type="info">{{ templateSummaryText }}</NTag>
      </div>

      <div class="flex flex-col gap-10px border-b border-[rgba(148,163,184,0.14)] p-14px">
        <NSelect
          :value="selectedCategoryId"
          :loading="categoryLoading"
          :options="categoryOptions"
          clearable
          filterable
          placeholder="请选择模板分类"
          @update:value="handleSelectCategory"
        />
        <div class="grid grid-cols-[minmax(0,1fr)_34px_34px] gap-8px">
          <NInput
            v-model:value="templateSearchName"
            clearable
            :disabled="!selectedCategory"
            placeholder="请输入设备类型名称"
            @keyup.enter="handleSearchTemplate"
          />
          <NButton type="primary" secondary circle :disabled="!selectedCategory" @click="handleSearchTemplate">
            <template #icon>
              <icon-ic-round-search class="text-icon" />
            </template>
          </NButton>
          <NButton circle :disabled="!selectedCategory" @click="handleResetTemplateSearch">
            <template #icon>
              <icon-ic-round-refresh class="text-icon" />
            </template>
          </NButton>
        </div>
      </div>

      <NSpin :show="templateLoading" class="min-h-0 flex-1" content-class="h-full">
        <div class="h-full flex flex-col gap-8px overflow-auto p-12px">
          <button
            v-for="template in templates"
            :key="template.id"
            type="button"
            :class="getTemplateItemClass(template)"
            :aria-pressed="selectedTemplate?.id === template.id"
            @click="handleSelectTemplate(template)"
          >
            <span
              aria-hidden="true"
              class="absolute bottom-12px left-0 top-12px w-3px rounded-r-full transition-colors"
              :class="selectedTemplate?.id === template.id ? 'bg-[rgb(var(--primary-color))]' : 'bg-transparent'"
            />
            <span class="min-w-0 flex items-center justify-between gap-8px">
              <span
                class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-600"
                :class="selectedTemplate?.id === template.id ? 'text-[rgb(var(--primary-color))]' : ''"
              >
                {{ template.name }}
              </span>
              <span
                v-if="selectedTemplate?.id === template.id"
                class="h-20px w-20px flex shrink-0 items-center justify-center rounded-full bg-[rgba(var(--primary-color),0.11)] text-[rgb(var(--primary-color))]"
              >
                <icon-ic-round-check class="text-13px" />
              </span>
            </span>
            <span class="min-w-0 flex items-center justify-between gap-8px">
              <span :class="getTemplateMetaClass(template)">{{ template.key || '-' }}</span>
              <StatusTag
                :value="template.status"
                preset="none"
                :status-map="DEVICE_TYPE_STATUS_MAP"
                :tag-props="{ size: 'small', bordered: false }"
              />
            </span>
          </button>
          <NEmpty
            v-if="templates.length === 0 && !templateLoading"
            :description="templateEmptyDescription"
            class="justify-center py-56px"
          />
        </div>
      </NSpin>

      <NPagination
        v-if="templateTotal > templatePageSize"
        :page="templatePage"
        :page-size="templatePageSize"
        :item-count="templateTotal"
        size="small"
        class="justify-end px-14px pb-14px pt-4px"
        @update:page="handleTemplatePageChange"
      />
    </section>

    <section
      class="min-h-0 min-w-0 flex flex-col overflow-hidden rounded-14px border border-[rgba(148,163,184,0.18)] bg-[linear-gradient(180deg,rgba(var(--primary-color),0.035),transparent_42%),var(--n-color)] shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
    >
      <div
        class="min-h-60px flex items-center justify-between gap-12px border-b border-[rgba(148,163,184,0.16)] px-16px py-14px"
      >
        <div class="text-15px text-[var(--n-text-color)] font-600 leading-22px">导入内容</div>
      </div>
      <template v-if="selectedTemplate">
        <div class="min-h-0 p-14px pb-16px pl-16px pr-16px">
          <NForm ref="formRef" :model="model" :rules="rules" label-placement="top" class="pb-4px">
            <NGrid responsive="screen" item-responsive :x-gap="12">
              <NFormItemGi span="24 m:12" label="设备类型名称" path="name">
                <NInput v-model:value="model.name" maxlength="30" show-count placeholder="请输入设备类型名称" />
              </NFormItemGi>
              <NFormItemGi span="24 m:12" label="设备类型标识" path="key">
                <NInput v-model:value="model.key" maxlength="48" show-count placeholder="请输入设备类型标识" />
              </NFormItemGi>
              <NFormItemGi span="24 m:12" label="状态" path="status">
                <NSwitch v-model:value="model.status" :checked-value="1" :unchecked-value="2">
                  <template #checked>启用</template>
                  <template #unchecked>禁用</template>
                </NSwitch>
              </NFormItemGi>
              <NFormItemGi span="24 m:12" label="图标" path="icon">
                <FileUpload
                  v-model:file-list="iconFileList"
                  upload-type="image"
                  :max="1"
                  :file-size="5"
                  :show-tip="false"
                />
              </NFormItemGi>
              <NFormItemGi span="24" label="描述" path="desc">
                <NInput
                  v-model:value="model.desc"
                  type="textarea"
                  maxlength="200"
                  show-count
                  :rows="2"
                  placeholder="请输入描述"
                />
              </NFormItemGi>
            </NGrid>
          </NForm>

          <div class="mb-10px mt-4px flex items-center justify-between gap-12px font-600">
            <span>模板点位</span>
            <span class="text-12px text-[var(--n-text-color-3)] font-400">共 {{ points.length }} 个</span>
          </div>
          <NDataTable
            v-model:checked-row-keys="checkedPointIds"
            :columns="pointColumns"
            :data="points"
            :loading="pointLoading"
            :row-key="row => row.id"
            size="small"
            class="[&_.n-data-table-th]:bg-[rgba(var(--primary-color),0.04)]"
          />
        </div>
      </template>
      <NEmpty v-else description="请选择设备类型模板" class="justify-center py-120px" />
    </section>
  </div>
</template>
