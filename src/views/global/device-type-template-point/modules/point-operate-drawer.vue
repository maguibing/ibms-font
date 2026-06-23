<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { SelectOption } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import {
  fetchCreateDeviceTypeTemplatePoint,
  fetchGetDeviceTypeTemplatePoint,
  fetchUpdateDeviceTypeTemplatePoint
} from '@/service/api/device-type-template';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { DATA_TYPE_OPTIONS, ENERGY_TYPE_OPTIONS, PRECISION_OPTIONS, UNIT_GROUPS } from '@/constants/device-point';
import { $t } from '@/locales';

defineOptions({
  name: 'PointOperateDrawer'
});

interface Props {
  templateId?: CommonType.IdType | null;
  operateType?: NaiveUI.TableOperateType;
  rowId?: CommonType.IdType | null;
}

interface Emits {
  (e: 'submitted'): void;
}

type SwitchPresetValue = 1 | 2 | 3;
type EnumSourceDataType = 1 | 2;
type ScaleValue = 1 | 2 | 3 | 4;

type EnumItem = Api.System.DeviceTypeTemplatePointValueItem;
type DetailValueItem = Partial<Record<keyof EnumItem, unknown>>;
type DetailSetting = {
  data_type?: unknown;
  enum_val?: {
    cmd_val_data_type?: unknown;
    enum_list?: unknown;
  };
  num_val?: {
    default_value?: unknown;
    scale?: unknown;
    unit?: unknown;
  };
  str_val?: {
    default_value?: unknown;
  };
  switch_val?: {
    cmd_val_data_type?: unknown;
    false_val?: DetailValueItem;
    true_val?: DetailValueItem;
  };
};

type Model = {
  template_id: CommonType.IdType | null;
  name: string;
  key: string;
  data_type: CommonType.DataType;
  unit: string | null;
  default_number: number;
  scale: ScaleValue;
  energy_type: number;
  default_text: string;
  switch_preset: SwitchPresetValue;
  true_alias: string;
  false_alias: string;
  enum_source_data_type: EnumSourceDataType;
  enum_list: EnumItem[];
  desc: string;
};

type RuleKey = Extract<keyof Model, 'name' | 'key' | 'data_type' | 'true_alias' | 'false_alias'>;

const props = withDefaults(defineProps<Props>(), {
  templateId: null,
  operateType: 'add',
  rowId: null
});
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();

const switchPresetOptions: SelectOption[] = [
  { label: '1 / 0', value: 1 },
  { label: 'true / false', value: 2 },
  { label: 'ON / OFF', value: 3 }
];

const enumSourceDataTypeOptions: SelectOption[] = [
  { label: '数字', value: 1 },
  { label: '字符', value: 2 }
];

const switchPresetMap: Record<
  SwitchPresetValue,
  {
    trueValue: string;
    falseValue: string;
  }
> = {
  1: { trueValue: '1', falseValue: '0' },
  2: { trueValue: 'true', falseValue: 'false' },
  3: { trueValue: 'ON', falseValue: 'OFF' }
};

const model = ref<Model>(createDefaultModel());

const isNumberType = computed(() => model.value.data_type === 1);
const isSwitchType = computed(() => model.value.data_type === 2);
const isTextType = computed(() => model.value.data_type === 3);
const isEnumType = computed(() => model.value.data_type === 4);
const isEdit = computed(() => props.operateType === 'edit');
const drawerTitle = computed(() => (isEdit.value ? '编辑点位' : '新增点位'));

const activeSwitchPreset = computed(() => switchPresetMap[model.value.switch_preset]);
const trueMappingLabel = computed(() => `${activeSwitchPreset.value.trueValue} 映射`);
const falseMappingLabel = computed(() => `${activeSwitchPreset.value.falseValue} 映射`);

const rules: Record<RuleKey, App.Global.FormRule> = {
  name: createRequiredRule('请输入点位名称'),
  key: createRequiredRule('请输入标识符'),
  data_type: createRequiredRule('请选择数据类型'),
  true_alias: createRequiredRule('请输入映射值'),
  false_alias: createRequiredRule('请输入映射值')
};

function createDefaultModel(): Model {
  return {
    template_id: props.templateId ?? null,
    name: '',
    key: '',
    data_type: 1,
    unit: null,
    default_number: 0,
    scale: 3,
    energy_type: 0,
    default_text: '',
    switch_preset: 1,
    true_alias: '',
    false_alias: '',
    enum_source_data_type: 1,
    enum_list: [createEnumItem()],
    desc: ''
  };
}

function createEnumItem(): EnumItem {
  return {
    value: '',
    alias: ''
  };
}

function normalizeDataType(value: unknown, fallback: CommonType.DataType = 1): CommonType.DataType {
  const dataTypeMap: Record<string, CommonType.DataType> = {
    DataTypeNumber: 1,
    DataTypeSwitch: 2,
    DataTypeString: 3,
    DataTypeEnum: 4
  };
  const numberValue = Number(value);

  if ([1, 2, 3, 4].includes(numberValue)) return numberValue as CommonType.DataType;

  return dataTypeMap[String(value)] || fallback;
}

function normalizeScale(value: unknown): ScaleValue {
  const scaleMap: Record<string, ScaleValue> = {
    Scale0Decimal: 1,
    Scale1Decimal: 2,
    Scale2Decimal: 3,
    Scale3Decimal: 4
  };
  const numberValue = Number(value);

  if ([1, 2, 3, 4].includes(numberValue)) return numberValue as ScaleValue;

  return scaleMap[String(value)] || 3;
}

function normalizeSwitchCmdDataType(value: unknown): SwitchPresetValue {
  const cmdDataTypeMap: Record<string, SwitchPresetValue> = {
    DevicePointCmdDataTypeNumber: 1,
    DevicePointCmdDataTypeString: 2,
    DevicePointCmdDataTypeBool: 3
  };
  const numberValue = Number(value);

  if ([1, 2, 3].includes(numberValue)) return numberValue as SwitchPresetValue;

  return cmdDataTypeMap[String(value)] || 1;
}

function normalizeEnumCmdDataType(value: unknown): EnumSourceDataType {
  const cmdDataTypeMap: Record<string, EnumSourceDataType> = {
    DevicePointCmdDataTypeNumber: 1,
    DevicePointCmdDataTypeString: 2
  };
  const numberValue = Number(value);

  if ([1, 2].includes(numberValue)) return numberValue as EnumSourceDataType;

  return cmdDataTypeMap[String(value)] || 1;
}

function normalizeEnumList(value: unknown): EnumItem[] {
  if (!Array.isArray(value)) return [createEnumItem()];

  const enumList = value
    .map(item => {
      const enumItem = item as DetailValueItem;

      return {
        value: String(enumItem.value || ''),
        alias: String(enumItem.alias || '')
      };
    })
    .filter(item => item.value || item.alias);

  return enumList.length > 0 ? enumList : [createEnumItem()];
}

function buildModelFromDetail(detail: Api.System.DeviceTypeTemplatePoint): Model {
  const setting = detail.setting as DetailSetting;
  const dataType = normalizeDataType(detail.data_type, normalizeDataType(setting?.data_type));

  return {
    template_id: detail.template_id ?? props.templateId ?? null,
    name: detail.name || '',
    key: detail.key || '',
    data_type: dataType,
    unit: setting?.num_val?.unit ? String(setting.num_val.unit) : null,
    default_number: Number(setting?.num_val?.default_value ?? 0),
    scale: normalizeScale(setting?.num_val?.scale),
    energy_type: Number(detail.energy_type ?? 0),
    default_text: String(setting?.str_val?.default_value || ''),
    switch_preset: normalizeSwitchCmdDataType(setting?.switch_val?.cmd_val_data_type),
    true_alias: String(setting?.switch_val?.true_val?.alias || ''),
    false_alias: String(setting?.switch_val?.false_val?.alias || ''),
    enum_source_data_type: normalizeEnumCmdDataType(setting?.enum_val?.cmd_val_data_type),
    enum_list: normalizeEnumList(setting?.enum_val?.enum_list),
    desc: detail.desc || ''
  };
}

function closeDrawer() {
  visible.value = false;
}

async function handleUpdateModel() {
  model.value = createDefaultModel();

  if (isEdit.value && props.rowId !== null && props.rowId !== undefined) {
    const { data, error } = await fetchGetDeviceTypeTemplatePoint({ id: props.rowId });
    if (error) return;

    model.value = buildModelFromDetail(data.device_type_template_point);
  }
}

function getValidEnumList() {
  return model.value.enum_list.filter(item => item.value.trim() && item.alias.trim());
}

function validateEnumList() {
  if (!isEnumType.value) return true;

  if (getValidEnumList().length > 0) return true;

  window.$message?.warning('请至少配置一组枚举映射');
  return false;
}

function buildSetting(): Api.System.DeviceTypeTemplatePointSetting {
  if (isNumberType.value) {
    return {
      data_type: 1,
      num_val: {
        unit: model.value.unit || '',
        default_value: model.value.default_number,
        scale: model.value.scale
      }
    };
  }

  if (isSwitchType.value) {
    const preset = activeSwitchPreset.value;

    return {
      data_type: 2,
      switch_val: {
        true_val: {
          value: preset.trueValue,
          alias: model.value.true_alias
        },
        false_val: {
          value: preset.falseValue,
          alias: model.value.false_alias
        },
        cmd_val_data_type: model.value.switch_preset
      }
    };
  }

  if (isTextType.value) {
    return {
      data_type: 3,
      str_val: {
        default_value: model.value.default_text
      }
    };
  }

  return {
    data_type: 4,
    enum_val: {
      enum_list: getValidEnumList(),
      cmd_val_data_type: model.value.enum_source_data_type
    }
  };
}

function buildSubmitParams(): Api.System.DeviceTypeTemplatePointOperateParams {
  const params: Api.System.DeviceTypeTemplatePointOperateParams = {
    template_id: Number(props.templateId ?? model.value.template_id),
    name: model.value.name,
    key: model.value.key,
    data_type: model.value.data_type,
    setting: buildSetting(),
    energy_type: model.value.energy_type,
    desc: model.value.desc
  };

  if (isEdit.value) {
    params.id = props.rowId;
  }

  return params;
}

async function handleSubmit() {
  if (!props.templateId && !model.value.template_id) {
    window.$message?.warning('缺少模板ID');
    return;
  }

  if (isEdit.value && (props.rowId === null || props.rowId === undefined)) {
    window.$message?.warning('缺少点位ID');
    return;
  }

  await validate();

  if (!validateEnumList()) return;

  startLoading();
  const request = isEdit.value ? fetchUpdateDeviceTypeTemplatePoint : fetchCreateDeviceTypeTemplatePoint;
  const { error } = await request(buildSubmitParams()).finally(endLoading);
  if (error) return;

  window.$message?.success(isEdit.value ? $t('common.updateSuccess') : $t('common.addSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, async () => {
  if (visible.value) {
    await handleUpdateModel();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="520" class="max-w-90%">
    <NDrawerContent :title="drawerTitle" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
        <NFormItem label="名称" path="name">
          <NInput v-model:value="model.name" maxlength="30" show-count placeholder="请输入点位名称" />
        </NFormItem>
        <NFormItem label="标识符" path="key">
          <NInput v-model:value="model.key" maxlength="30" show-count placeholder="请输入标识符" />
        </NFormItem>
        <NFormItem label="数据类型" path="data_type">
          <NSelect v-model:value="model.data_type" :options="DATA_TYPE_OPTIONS" placeholder="请选择数据类型" />
        </NFormItem>

        <template v-if="isNumberType">
          <NFormItem label="单位" path="unit">
            <NSelect
              v-model:value="model.unit"
              clearable
              filterable
              tag
              :options="UNIT_GROUPS"
              placeholder="请选择或输入单位(如：kWh、J、dB)"
            />
          </NFormItem>
          <NFormItem label="默认值" path="default_number">
            <NInputNumber v-model:value="model.default_number" button-placement="right" />
          </NFormItem>
          <NFormItem label="精度" path="scale">
            <NSelect v-model:value="model.scale" :options="PRECISION_OPTIONS" placeholder="请选择精度" />
          </NFormItem>
          <NFormItem label="能源类型" path="energy_type">
            <NSelect v-model:value="model.energy_type" :options="ENERGY_TYPE_OPTIONS" placeholder="请选择能源类型" />
          </NFormItem>
        </template>

        <template v-if="isSwitchType">
          <NFormItem label="源数据类型" path="switch_preset">
            <NSelect
              v-model:value="model.switch_preset"
              :options="switchPresetOptions"
              placeholder="请选择源数据类型"
            />
          </NFormItem>
          <NFormItem :label="trueMappingLabel" path="true_alias">
            <NInput v-model:value="model.true_alias" maxlength="30" show-count placeholder="请输入映射名称" />
          </NFormItem>
          <NFormItem :label="falseMappingLabel" path="false_alias">
            <NInput v-model:value="model.false_alias" maxlength="30" show-count placeholder="请输入映射名称" />
          </NFormItem>
        </template>

        <template v-if="isTextType">
          <NFormItem label="默认值" path="default_text">
            <NInput v-model:value="model.default_text" maxlength="30" show-count placeholder="请输入默认值" />
          </NFormItem>
        </template>

        <template v-if="isEnumType">
          <NFormItem label="枚举源数据类型" path="enum_source_data_type">
            <NSelect
              v-model:value="model.enum_source_data_type"
              :options="enumSourceDataTypeOptions"
              placeholder="请选择枚举源数据类型"
            />
          </NFormItem>
          <NFormItem label="枚举映射">
            <NDynamicInput v-model:value="model.enum_list" :on-create="createEnumItem">
              <template #default="{ index }">
                <div class="w-full flex gap-12px">
                  <NInput v-model:value="model.enum_list[index].value" maxlength="30" placeholder="值" />
                  <NInput v-model:value="model.enum_list[index].alias" maxlength="30" placeholder="映射名称" />
                </div>
              </template>
            </NDynamicInput>
          </NFormItem>
        </template>

        <NFormItem label="点位描述" path="desc">
          <NInput
            v-model:value="model.desc"
            type="textarea"
            maxlength="200"
            show-count
            :rows="5"
            placeholder="请输入点位描述"
          />
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
