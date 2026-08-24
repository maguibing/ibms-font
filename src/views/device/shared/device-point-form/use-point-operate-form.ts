import { computed, ref } from 'vue';
import type { SelectOption } from 'naive-ui';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

export type PointOperateSwitchPresetValue = 1 | 2 | 3;
export type PointOperateEnumSourceDataType = 1 | 2;
export type PointOperateScaleValue = 1 | 2 | 3 | 4;

export type PointOperateEnumItem = {
  value: string;
  alias: string;
};

export type PointOperateSetting = Api.System.DeviceTypeTemplatePointSetting;

export type PointOperateModel = {
  name: string;
  key: string;
  data_type: CommonType.DataType;
  unit: string | null;
  default_number: number;
  scale: PointOperateScaleValue;
  energy_type: number;
  default_text: string;
  switch_preset: PointOperateSwitchPresetValue;
  true_alias: string;
  false_alias: string;
  enum_source_data_type: PointOperateEnumSourceDataType;
  enum_list: PointOperateEnumItem[];
  desc: string;
};

type DetailValueItem = Partial<Record<keyof PointOperateEnumItem, unknown>>;

type PointOperateDetailSetting = {
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

export type PointOperateDetail = {
  name?: string;
  key?: string;
  data_type?: unknown;
  energy_type?: unknown;
  setting?: PointOperateDetailSetting | null;
  desc?: string | null;
};

export type PointOperateSubmitParams = {
  name: string;
  key: string;
  data_type: CommonType.DataType;
  setting: PointOperateSetting;
  energy_type: number;
  desc: string;
};

type RuleKey = Extract<keyof PointOperateModel, 'name' | 'key' | 'data_type' | 'true_alias' | 'false_alias'>;

const switchPresetMap: Record<
  PointOperateSwitchPresetValue,
  {
    trueValue: string;
    falseValue: string;
  }
> = {
  1: { trueValue: '1', falseValue: '0' },
  2: { trueValue: 'true', falseValue: 'false' },
  3: { trueValue: 'ON', falseValue: 'OFF' }
};

export function createEnumItem(): PointOperateEnumItem {
  return {
    value: '',
    alias: ''
  };
}

function createDefaultModel(): PointOperateModel {
  return {
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

function normalizeScale(value: unknown): PointOperateScaleValue {
  const scaleMap: Record<string, PointOperateScaleValue> = {
    Scale0Decimal: 1,
    Scale1Decimal: 2,
    Scale2Decimal: 3,
    Scale3Decimal: 4
  };
  const numberValue = Number(value);

  if ([1, 2, 3, 4].includes(numberValue)) return numberValue as PointOperateScaleValue;

  return scaleMap[String(value)] || 3;
}

function normalizeSwitchCmdDataType(value: unknown): PointOperateSwitchPresetValue {
  const cmdDataTypeMap: Record<string, PointOperateSwitchPresetValue> = {
    DevicePointCmdDataTypeNumber: 1,
    DevicePointCmdDataTypeString: 2,
    DevicePointCmdDataTypeBool: 3
  };
  const numberValue = Number(value);

  if ([1, 2, 3].includes(numberValue)) return numberValue as PointOperateSwitchPresetValue;

  return cmdDataTypeMap[String(value)] || 1;
}

function normalizeEnumCmdDataType(value: unknown): PointOperateEnumSourceDataType {
  const cmdDataTypeMap: Record<string, PointOperateEnumSourceDataType> = {
    DevicePointCmdDataTypeNumber: 1,
    DevicePointCmdDataTypeString: 2
  };
  const numberValue = Number(value);

  if ([1, 2].includes(numberValue)) return numberValue as PointOperateEnumSourceDataType;

  return cmdDataTypeMap[String(value)] || 1;
}

function normalizeEnumList(value: unknown): PointOperateEnumItem[] {
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

function buildModelFromDetail(detail: PointOperateDetail): PointOperateModel {
  const setting = detail.setting;
  const dataType = normalizeDataType(detail.data_type, normalizeDataType(setting?.data_type));

  return {
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

export function usePointOperateForm() {
  const { formRef, validate, restoreValidation } = useNaiveForm();
  const { createRequiredRule } = useFormRules();

  const switchPresetOptions: SelectOption[] = [
    { label: '1 / 0', value: 1 },
    { label: 'true / false', value: 2 },
    { label: 'ON / OFF', value: 3 }
  ];

  const enumSourceDataTypeOptions = computed<SelectOption[]>(() => [
    { label: $t('page.common.pointForm.options.enumSourceNumber'), value: 1 },
    { label: $t('page.common.pointForm.options.enumSourceString'), value: 2 }
  ]);

  const model = ref<PointOperateModel>(createDefaultModel());

  const isNumberType = computed(() => model.value.data_type === 1);
  const isSwitchType = computed(() => model.value.data_type === 2);
  const isTextType = computed(() => model.value.data_type === 3);
  const isEnumType = computed(() => model.value.data_type === 4);

  const activeSwitchPreset = computed(() => switchPresetMap[model.value.switch_preset]);
  const trueMappingLabel = computed(() =>
    $t('page.common.pointForm.mappingLabel', { value: activeSwitchPreset.value.trueValue })
  );
  const falseMappingLabel = computed(() =>
    $t('page.common.pointForm.mappingLabel', { value: activeSwitchPreset.value.falseValue })
  );

  const rules: Record<RuleKey, App.Global.FormRule> = {
    name: createRequiredRule($t('page.common.pointForm.form.name.required')),
    key: createRequiredRule($t('page.common.pointForm.form.key.required')),
    data_type: createRequiredRule($t('page.common.pointForm.form.dataType.required')),
    true_alias: createRequiredRule($t('page.common.pointForm.form.mappingValue.required')),
    false_alias: createRequiredRule($t('page.common.pointForm.form.mappingValue.required'))
  };

  function resetModel(detail?: PointOperateDetail) {
    model.value = detail ? buildModelFromDetail(detail) : createDefaultModel();
  }

  function getValidEnumList() {
    return model.value.enum_list.filter(item => item.value.trim() && item.alias.trim());
  }

  function validateEnumList() {
    if (!isEnumType.value) return true;

    if (getValidEnumList().length > 0) return true;

    window.$message?.warning($t('page.common.pointForm.message.enumMappingRequired'));
    return false;
  }

  function buildSetting(): PointOperateSetting {
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

  function buildPointSubmitParams(): PointOperateSubmitParams {
    return {
      name: model.value.name,
      key: model.value.key,
      data_type: model.value.data_type,
      setting: buildSetting(),
      energy_type: model.value.energy_type,
      desc: model.value.desc
    };
  }

  return {
    formRef,
    validate,
    restoreValidation,
    model,
    rules,
    switchPresetOptions,
    enumSourceDataTypeOptions,
    isNumberType,
    isSwitchType,
    isTextType,
    isEnumType,
    trueMappingLabel,
    falseMappingLabel,
    createEnumItem,
    resetModel,
    validateEnumList,
    buildPointSubmitParams
  };
}
