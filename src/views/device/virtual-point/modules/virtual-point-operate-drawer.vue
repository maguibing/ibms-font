<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';
import type { FormInst, FormRules } from 'naive-ui';
import {
  fetchCreateVirtualPoint,
  fetchGetDeviceList,
  fetchGetVirtualPoint,
  fetchUpdateVirtualPoint,
  fetchValidateVirtualPointFormula
} from '@/service/api/device';
import RemoteSearchSelect from '@/components/custom/remote-search-select.vue';
import HourRangeSelector from '@/views/alarm/rule/modules/hour-range-selector.vue';
import type { TaskRuleEditorOptionMaps } from '@/views/task/task-list/modules/task-point-rule-editor/use-task-point-rule-editor';
import {
  VirtualPointComputeMode,
  VirtualPointStatus,
  buildFormulaSetting,
  buildVirtualPointSubmitParams,
  createDefaultVirtualPointForm,
  createDefaultVirtualPointPointSetting,
  createDefaultVirtualPointSetting,
  normalizeValidTimeRanges,
  normalizeVirtualPointPointSetting,
  parseVirtualPointSetting,
  validateVirtualPointPointSetting,
  virtualPointComputeModeOptions
} from '../virtual-point';
import type { ValidTimeRange, VirtualPointFormModel } from '../virtual-point';
import { validateFormulaExpression } from '../formula-builder';
import FormulaComputePanel from './formula-compute-panel.vue';
import SegmentMappingPanel from './segment-mapping-panel.vue';
import StatisticalCountPanel from './statistical-count-panel.vue';
import ThresholdAssignPanel from './threshold-assign-panel.vue';
import VirtualPointSettingPanel from './virtual-point-setting-panel.vue';

defineOptions({ name: 'VirtualPointOperateDrawer' });

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowId?: CommonType.IdType | null;
}

const props = withDefaults(defineProps<Props>(), { rowId: null });
const emit = defineEmits<{ submitted: [] }>();
const visible = defineModel<boolean>('visible', { default: false });

// 父组件只调用各模式面板暴露的 validateAndBuild，具体配置构建留在子面板内部。
const formRef = useTemplateRef<FormInst>('formRef');
const thresholdAssignPanelRef = useTemplateRef<{ validateAndBuild: () => Api.Device.VirtualPointSetting | null }>(
  'thresholdAssignPanelRef'
);
const segmentMappingPanelRef = useTemplateRef<{ validateAndBuild: () => Api.Device.VirtualPointSetting | null }>(
  'segmentMappingPanelRef'
);
const statisticalCountPanelRef = useTemplateRef<{ validateAndBuild: () => Api.Device.VirtualPointSetting | null }>(
  'statisticalCountPanelRef'
);
const loading = ref(false);
const submitLoading = ref(false);
const validatingFormula = ref(false);
const model = ref<VirtualPointFormModel>(createDefaultVirtualPointForm());
const validTimeRanges = ref<ValidTimeRange[]>(normalizeValidTimeRanges());
const pointSetting = ref<Api.Device.DeviceTypePointSetting>(createDefaultVirtualPointPointSetting());
const formulaExpression = ref('');
const thresholdAssignSetting = ref<Api.Device.VirtualPointThresholdAssignSetting>();
const segmentMappingSetting = ref<Api.Device.VirtualPointSegmentMappingSetting>();
const statisticalSetting = ref<Api.Device.VirtualPointStatisticalSetting>();
const thresholdOptionMaps = ref<TaskRuleEditorOptionMaps>({});
const settingText = ref('');
const selectedDevice = ref<Pick<Api.Device.Device, 'id' | 'name' | 'key'> | null>(null);

// 抽屉标题和提交接口只依赖操作类型。
const isEdit = computed(() => props.operateType === 'edit');
const title = computed(() => (isEdit.value ? '编辑虚拟点' : '创建虚拟点'));
const rules: FormRules = {
  name: { required: true, message: '请输入虚拟点名称', trigger: ['input', 'blur'] },
  key: { required: true, message: '请输入虚拟点标识', trigger: ['input', 'blur'] },
  belong_device_id: { required: true, type: 'number', message: '请选择所属设备', trigger: ['change', 'blur'] }
};

/** 展示兜底 JSON 时只保留当前计算模式配置。 */
function formatSetting(setting: Api.Device.VirtualPointSetting) {
  const { point: _point, valid_time_ranges: _validTimeRanges, ...modeSetting } = setting;
  return JSON.stringify(modeSetting, null, 2);
}

/** 每次打开抽屉先恢复创建态，编辑态再由详情覆盖。 */
function reset() {
  model.value = createDefaultVirtualPointForm();
  validTimeRanges.value = normalizeValidTimeRanges();
  pointSetting.value = createDefaultVirtualPointPointSetting();
  formulaExpression.value = '';
  thresholdAssignSetting.value = createDefaultVirtualPointSetting(VirtualPointComputeMode.Threshold).threshold_assign;
  segmentMappingSetting.value = createDefaultVirtualPointSetting(
    VirtualPointComputeMode.SegmentMapping
  ).segment_mapping;
  statisticalSetting.value = createDefaultVirtualPointSetting(VirtualPointComputeMode.StatisticalCount).statistical;
  thresholdOptionMaps.value = {};
  settingText.value = formatSetting(createDefaultVirtualPointSetting(model.value.compute_mode));
  selectedDevice.value = null;
  formRef.value?.restoreValidation();
}

/** 详情里的名称优先取逻辑点，缺失时回退物理点。 */
function getDetailName(data: Api.Device.VirtualPointDetailResponse) {
  const virtualPoint = data.virtual_point;
  const logicPoint = data.logic_point_map?.[String(virtualPoint.logic_point_id ?? '')];
  const physicalPoint = data.physical_point_map?.[String(virtualPoint.physical_point_id ?? '')];
  return logicPoint?.name ?? physicalPoint?.name ?? '';
}

/** 虚拟点标识来自逻辑点映射。 */
function getDetailKey(data: Api.Device.VirtualPointDetailResponse) {
  const virtualPoint = data.virtual_point;
  return data.logic_point_map?.[String(virtualPoint.logic_point_id ?? '')]?.key ?? '';
}

/** 加载编辑详情并按各模式拆分回填到对应子面板。 */
async function loadDetail() {
  if (!props.rowId) return;

  loading.value = true;
  try {
    const { data, error } = await fetchGetVirtualPoint({
      id: props.rowId,
      options: [{ key: 1 }, { key: 2 }, { key: 3 }, { key: 4 }, { key: 5 }]
    });
    if (error || !data?.virtual_point) return;

    const virtualPoint = data.virtual_point;
    const deviceId = virtualPoint.device_id ?? null;
    const device = data.device_map?.[String(deviceId ?? '')] ?? null;

    model.value = {
      name: getDetailName(data),
      key: getDetailKey(data),
      belong_device_id: deviceId,
      compute_mode: (virtualPoint.compute_mode ?? VirtualPointComputeMode.Formula) as VirtualPointComputeMode,
      status: (virtualPoint.status ?? VirtualPointStatus.Enabled) as VirtualPointStatus,
      is_storage: Boolean(data.physical_point_map?.[String(virtualPoint.physical_point_id ?? '')]?.is_storage)
    };
    validTimeRanges.value = normalizeValidTimeRanges(virtualPoint.setting?.valid_time_ranges);
    pointSetting.value = normalizeVirtualPointPointSetting(virtualPoint.setting?.point, model.value.compute_mode);
    formulaExpression.value = virtualPoint.setting?.formula?.expression ?? '';
    thresholdAssignSetting.value = virtualPoint.setting?.threshold_assign;
    segmentMappingSetting.value = virtualPoint.setting?.segment_mapping;
    statisticalSetting.value = virtualPoint.setting?.statistical;
    thresholdOptionMaps.value = {
      deviceMap: data.device_map,
      deviceTypeMap: data.device_type_map,
      deviceTypePointMap: data.device_type_point_map
    };
    settingText.value = formatSetting(
      virtualPoint.setting ?? createDefaultVirtualPointSetting(model.value.compute_mode)
    );
    selectedDevice.value = device ? { ...device } : null;
    await nextTick();
    formRef.value?.restoreValidation();
  } finally {
    loading.value = false;
  }
}

/** 切换计算模式时重置对应模式配置，避免提交旧模式残留字段。 */
function handleComputeModeChange(value: number) {
  model.value.compute_mode = value as VirtualPointComputeMode;
  pointSetting.value = normalizeVirtualPointPointSetting(pointSetting.value, value);
  if (value === VirtualPointComputeMode.Formula) formulaExpression.value = '';
  if (value === VirtualPointComputeMode.Threshold) {
    thresholdAssignSetting.value = createDefaultVirtualPointSetting(value).threshold_assign;
    thresholdOptionMaps.value = {};
  }
  if (value === VirtualPointComputeMode.SegmentMapping) {
    segmentMappingSetting.value = createDefaultVirtualPointSetting(value).segment_mapping;
  }
  if (value === VirtualPointComputeMode.StatisticalCount) {
    statisticalSetting.value = createDefaultVirtualPointSetting(value).statistical;
    thresholdOptionMaps.value = {};
  }
  settingText.value = formatSetting(createDefaultVirtualPointSetting(value));
}

/** 校验有效时段，后端只接收 0-23 点范围。 */
function validateValidTimeRanges() {
  if (!validTimeRanges.value.length) {
    window.$message?.warning('请至少添加一个有效时段');
    return false;
  }

  const invalid = validTimeRanges.value.some(
    item => item.start_at < 0 || item.end_at > 23 || item.start_at > item.end_at
  );
  if (invalid) window.$message?.warning('有效时段必须在 0-23 点之间，且开始时间不能晚于结束时间');
  return !invalid;
}

/** 按当前计算模式获取可提交的 setting 片段。 */
function getParsedSetting() {
  if (model.value.compute_mode === VirtualPointComputeMode.Formula) {
    if (!formulaExpression.value.trim()) {
      window.$message?.warning('请先编辑公式表达式');
      return null;
    }

    const validationError = validateFormulaExpression(formulaExpression.value);
    if (validationError) {
      window.$message?.warning(validationError);
      return null;
    }

    return { formula: buildFormulaSetting(formulaExpression.value) };
  }

  if (model.value.compute_mode === VirtualPointComputeMode.Threshold) {
    return thresholdAssignPanelRef.value?.validateAndBuild() ?? null;
  }

  if (model.value.compute_mode === VirtualPointComputeMode.SegmentMapping) {
    return segmentMappingPanelRef.value?.validateAndBuild() ?? null;
  }

  if (model.value.compute_mode === VirtualPointComputeMode.StatisticalCount) {
    return statisticalCountPanelRef.value?.validateAndBuild() ?? null;
  }

  const setting = parseVirtualPointSetting(settingText.value);
  if (!setting) window.$message?.warning('计算配置必须是有效的 JSON 对象');
  return setting;
}

/** 调用后端公式校验，保存时静默失败，手动校验时展示成功结果。 */
async function validateFormulaRemotely(showSuccess: boolean) {
  const expression = formulaExpression.value.trim();

  validatingFormula.value = true;
  try {
    const { data, error } = await fetchValidateVirtualPointFormula({ expression });
    if (error) return false;
    if (data?.is_valid === false) {
      window.$message?.error(data.err_msg || data.msg || data.detail || '公式校验失败');
      return false;
    }
    if (showSuccess) window.$message?.success(`公式校验通过，结果：${data?.result ?? '-'}`);
    return true;
  } finally {
    validatingFormula.value = false;
  }
}

/** 手动校验前先复用本地公式结构校验。 */
async function handleValidateFormula() {
  if (!getParsedSetting()) return;
  await validateFormulaRemotely(true);
}

/** 表单校验、模式配置构建和创建/更新提交入口。 */
async function handleSubmit() {
  const valid = await formRef.value
    ?.validate()
    .then(() => true)
    .catch(() => false);
  if (!valid) return;
  if (!validateValidTimeRanges()) return;
  const pointSettingError = validateVirtualPointPointSetting(pointSetting.value, model.value.compute_mode);
  if (pointSettingError) {
    window.$message?.warning(pointSettingError);
    return;
  }
  const setting = getParsedSetting();
  if (!setting) return;

  submitLoading.value = true;
  try {
    if (model.value.compute_mode === VirtualPointComputeMode.Formula) {
      const formulaValid = await validateFormulaRemotely(false);
      if (!formulaValid) return;
    }

    const params = buildVirtualPointSubmitParams(
      model.value,
      validTimeRanges.value,
      setting,
      pointSetting.value,
      isEdit.value ? (props.rowId ?? undefined) : undefined
    );
    const { error } = isEdit.value ? await fetchUpdateVirtualPoint(params) : await fetchCreateVirtualPoint(params);
    if (error) return;

    window.$message?.success(isEdit.value ? '修改成功' : '创建成功');
    visible.value = false;
    emit('submitted');
  } finally {
    submitLoading.value = false;
  }
}

// 抽屉显示时统一初始化；编辑场景再加载详情覆盖默认值。
watch(visible, show => {
  if (!show) return;
  reset();
  if (isEdit.value) loadDetail();
});
</script>

<template>
  <NDrawer v-model:show="visible" :width="800" class="max-w-95%">
    <NDrawerContent :title="title" closable :native-scrollbar="false">
      <NSpin :show="loading">
        <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
          <div class="grid grid-cols-2 gap-x-16px lt-sm:grid-cols-1">
            <NFormItem label="虚拟点名称" path="name">
              <NInput v-model:value="model.name" maxlength="64" show-count clearable />
            </NFormItem>
            <NFormItem label="虚拟点标识" path="key">
              <NInput v-model:value="model.key" maxlength="64" show-count clearable />
            </NFormItem>
          </div>

          <NFormItem label="所属设备" path="belong_device_id">
            <RemoteSearchSelect
              v-model:value="model.belong_device_id"
              :request="fetchGetDeviceList"
              :selected-options="selectedDevice"
              :search-type="1"
              label-field="name"
              value-field="id"
              filterable
              clearable
              placeholder="请选择所属设备"
            />
          </NFormItem>

          <div class="grid grid-cols-2 gap-x-16px">
            <NFormItem label="启用状态">
              <NSwitch
                v-model:value="model.status"
                :checked-value="VirtualPointStatus.Enabled"
                :unchecked-value="VirtualPointStatus.Disabled"
              />
            </NFormItem>
            <NFormItem label="存储历史数据">
              <NSwitch v-model:value="model.is_storage" />
            </NFormItem>
          </div>

          <NFormItem label="有效时段">
            <HourRangeSelector v-model="validTimeRanges" class="w-full" />
          </NFormItem>

          <NFormItem label="计算模式">
            <NRadioGroup :value="model.compute_mode" @update:value="handleComputeModeChange">
              <NRadioButton
                v-for="item in virtualPointComputeModeOptions"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </NRadioGroup>
          </NFormItem>

          <VirtualPointSettingPanel v-model="pointSetting" :compute-mode="model.compute_mode" class="mb-18px" />

          <NFormItem label="计算配置">
            <div class="w-full">
              <FormulaComputePanel
                v-if="model.compute_mode === VirtualPointComputeMode.Formula"
                v-model="formulaExpression"
                :validating="validatingFormula"
                @validate="handleValidateFormula"
              />
              <ThresholdAssignPanel
                v-else-if="model.compute_mode === VirtualPointComputeMode.Threshold"
                ref="thresholdAssignPanelRef"
                :point-setting="pointSetting"
                :setting="thresholdAssignSetting"
                :option-maps="thresholdOptionMaps"
              />
              <SegmentMappingPanel
                v-else-if="model.compute_mode === VirtualPointComputeMode.SegmentMapping"
                ref="segmentMappingPanelRef"
                :point-setting="pointSetting"
                :setting="segmentMappingSetting"
              />
              <StatisticalCountPanel
                v-else-if="model.compute_mode === VirtualPointComputeMode.StatisticalCount"
                ref="statisticalCountPanelRef"
                :setting="statisticalSetting"
                :option-maps="thresholdOptionMaps"
              />
              <NInput
                v-else
                v-model:value="settingText"
                type="textarea"
                :autosize="{ minRows: 16, maxRows: 28 }"
                class="font-mono"
                placeholder="请输入虚拟点 setting JSON"
              />
            </div>
          </NFormItem>
        </NForm>
      </NSpin>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="visible = false">取消</NButton>
          <NButton type="primary" :loading="submitLoading" @click="handleSubmit">保存</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
