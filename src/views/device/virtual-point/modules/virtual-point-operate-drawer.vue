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
import { $t } from '@/locales';
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

// The parent only calls validateAndBuild on each mode panel. The concrete setting assembly stays inside the child panel.
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

// The drawer title and submit API only depend on the operate type.
const isEdit = computed(() => props.operateType === 'edit');
const title = computed(() => (isEdit.value ? $t('virtualPoint.drawer.edit') : $t('virtualPoint.drawer.create')));
const rules: FormRules = {
  name: { required: true, message: $t('virtualPoint.validation.name'), trigger: ['input', 'blur'] },
  key: { required: true, message: $t('virtualPoint.validation.key'), trigger: ['input', 'blur'] },
  belong_device_id: {
    required: true,
    type: 'number',
    message: $t('virtualPoint.validation.belongDevice'),
    trigger: ['change', 'blur']
  }
};

/** Keep only the current compute-mode setting when showing fallback JSON. */
function formatSetting(setting: Api.Device.VirtualPointSetting) {
  const { point: _point, valid_time_ranges: _validTimeRanges, ...modeSetting } = setting;
  return JSON.stringify(modeSetting, null, 2);
}

/** Reset to create mode on every open, then let edit mode overwrite it with details. */
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

/** Prefer the logic point name in details; fall back to the physical point if needed. */
function getDetailName(data: Api.Device.VirtualPointDetailResponse) {
  const virtualPoint = data.virtual_point;
  const logicPoint = data.logic_point_map?.[String(virtualPoint.logic_point_id ?? '')];
  const physicalPoint = data.physical_point_map?.[String(virtualPoint.physical_point_id ?? '')];
  return logicPoint?.name ?? physicalPoint?.name ?? '';
}

/** The virtual point identifier comes from the logic point map. */
function getDetailKey(data: Api.Device.VirtualPointDetailResponse) {
  const virtualPoint = data.virtual_point;
  return data.logic_point_map?.[String(virtualPoint.logic_point_id ?? '')]?.key ?? '';
}

/** Load edit details and split them into the matching child panel by mode. */
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

/** Reset the matching setting when switching compute modes so stale fields are not submitted. */
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

/** Validate valid time ranges. The backend only accepts hours from 0 to 23. */
function validateValidTimeRanges() {
  if (!validTimeRanges.value.length) {
    window.$message?.warning($t('virtualPoint.validation.validTimeRangeRequired'));
    return false;
  }

  const invalid = validTimeRanges.value.some(
    item => item.start_at < 0 || item.end_at > 23 || item.start_at > item.end_at
  );
  if (invalid) window.$message?.warning($t('virtualPoint.validation.validTimeRangeInvalid'));
  return !invalid;
}

/** Get the submit-ready setting fragment for the current compute mode. */
function getParsedSetting() {
  if (model.value.compute_mode === VirtualPointComputeMode.Formula) {
    if (!formulaExpression.value.trim()) {
      window.$message?.warning($t('virtualPoint.validation.formulaRequired'));
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
  if (!setting) window.$message?.warning($t('virtualPoint.validation.settingJsonInvalid'));
  return setting;
}

/** Call the backend formula validator. Save flow fails silently; manual validation shows success. */
async function validateFormulaRemotely(showSuccess: boolean) {
  const expression = formulaExpression.value.trim();

  validatingFormula.value = true;
  try {
    const { data, error } = await fetchValidateVirtualPointFormula({ expression });
    if (error) return false;
    if (data?.is_valid === false) {
      window.$message?.error(data.err_msg || data.msg || data.detail || $t('virtualPoint.validation.formulaFailed'));
      return false;
    }
    if (showSuccess) {
      window.$message?.success($t('virtualPoint.formula.validateSuccessWithResult', { result: data?.result ?? '-' }));
    }
    return true;
  } finally {
    validatingFormula.value = false;
  }
}

/** Reuse local formula structure validation before manual remote validation. */
async function handleValidateFormula() {
  if (!getParsedSetting()) return;
  await validateFormulaRemotely(true);
}

/** Validate the form, build the mode setting, and submit create/update requests. */
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

    window.$message?.success(isEdit.value ? $t('common.updateSuccess') : $t('common.saveSuccess'));
    visible.value = false;
    emit('submitted');
  } finally {
    submitLoading.value = false;
  }
}

// Initialize when the drawer opens; edit mode then loads details on top of the defaults.
watch(visible, show => {
  if (!show) return;
  reset();
  if (isEdit.value) loadDetail();
});
</script>

<template>
  <NDrawer v-model:show="visible" :width="750" class="max-w-95%">
    <NDrawerContent :title="title" closable :native-scrollbar="false">
      <NSpin :show="loading">
        <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
          <div class="grid grid-cols-2 gap-x-16px lt-sm:grid-cols-1">
            <NFormItem :label="$t('virtualPoint.drawer.name')" path="name">
              <NInput v-model:value="model.name" maxlength="64" show-count clearable />
            </NFormItem>
            <NFormItem :label="$t('virtualPoint.drawer.key')" path="key">
              <NInput v-model:value="model.key" maxlength="64" show-count clearable />
            </NFormItem>
          </div>

          <NFormItem :label="$t('virtualPoint.drawer.belongDevice')" path="belong_device_id">
            <RemoteSearchSelect
              v-model:value="model.belong_device_id"
              :request="fetchGetDeviceList"
              :selected-options="selectedDevice"
              :search-type="1"
              label-field="name"
              value-field="id"
              filterable
              clearable
              :placeholder="$t('virtualPoint.drawer.belongDevicePlaceholder')"
            />
          </NFormItem>

          <div class="grid grid-cols-2 gap-x-16px">
            <NFormItem :label="$t('virtualPoint.drawer.status')">
              <NSwitch
                v-model:value="model.status"
                :checked-value="VirtualPointStatus.Enabled"
                :unchecked-value="VirtualPointStatus.Disabled"
              />
            </NFormItem>
            <NFormItem :label="$t('virtualPoint.drawer.storageHistory')">
              <NSwitch v-model:value="model.is_storage" />
            </NFormItem>
          </div>

          <NFormItem :label="$t('virtualPoint.drawer.validTimeRange')">
            <HourRangeSelector v-model="validTimeRanges" class="w-full" />
          </NFormItem>

          <NFormItem :label="$t('virtualPoint.drawer.computeMode')">
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

          <NFormItem :label="$t('virtualPoint.drawer.configuration')">
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
                :placeholder="$t('virtualPoint.drawer.settingJsonPlaceholder')"
              />
            </div>
          </NFormItem>
        </NForm>
      </NSpin>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="visible = false">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.save') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
