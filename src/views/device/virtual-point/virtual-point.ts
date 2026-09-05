import { computed } from 'vue';
import { $t } from '@/locales';

/** Virtual point compute modes. */
export enum VirtualPointComputeMode {
  /** Formula calculation. */
  Formula = 1,
  /** Threshold assignment. */
  Threshold = 2,
  /** Segment mapping. */
  SegmentMapping = 3,
  /** Statistic count. */
  StatisticalCount = 4
}

/** Virtual point status. */
export enum VirtualPointStatus {
  Enabled = 1,
  Disabled = 2
}

/** A single valid time range in hours. */
export interface ValidTimeRange {
  start_at: number;
  end_at: number;
}

/** Base virtual point form model. */
export interface VirtualPointFormModel {
  name: string;
  key: string;
  belong_device_id: CommonType.IdType | null;
  compute_mode: VirtualPointComputeMode;
  status: VirtualPointStatus;
  is_storage: boolean;
}

export const virtualPointComputeModeOptions = computed<CommonType.Option<VirtualPointComputeMode>[]>(() => [
  { label: $t('virtualPoint.computeMode.formula'), value: VirtualPointComputeMode.Formula },
  { label: $t('virtualPoint.computeMode.threshold'), value: VirtualPointComputeMode.Threshold },
  { label: $t('virtualPoint.computeMode.segmentMapping'), value: VirtualPointComputeMode.SegmentMapping },
  { label: $t('virtualPoint.computeMode.statisticalCount'), value: VirtualPointComputeMode.StatisticalCount }
]);

export const virtualPointComputeModeMap = computed<Record<number, string>>(
  () =>
    Object.fromEntries(virtualPointComputeModeOptions.value.map(item => [item.value, item.label])) as Record<
      number,
      string
    >
);

/**
 * Append a token to the end of a formula string.
 * @param expression Current formula
 * @param token Token to append
 * @returns Updated formula
 */
export function appendFormulaToken(expression: string, token: string) {
  return `${expression}${token}`;
}

/**
 * Build a formula calculation setting.
 * @param expression Formula expression
 * @returns Formula setting
 */
export function buildFormulaSetting(expression: string) {
  return { expression };
}

/**
 * Create default virtual point form values.
 * @returns Default form model
 */
export function createDefaultVirtualPointForm(): VirtualPointFormModel {
  return {
    name: '',
    key: '',
    belong_device_id: null,
    compute_mode: VirtualPointComputeMode.Formula,
    status: VirtualPointStatus.Enabled,
    is_storage: false
  };
}

/**
 * Normalize valid time ranges. Empty values default to all day.
 * @param ranges Raw time range data
 * @returns Valid time ranges
 */
export function normalizeValidTimeRanges(ranges?: Array<{ start_at?: unknown; end_at?: unknown }>): ValidTimeRange[] {
  const normalized = (ranges ?? []).map(item => ({
    start_at: Number(item.start_at ?? 0),
    end_at: Number(item.end_at ?? 23)
  }));

  return normalized.length ? normalized : [{ start_at: 0, end_at: 23 }];
}

/**
 * Create a virtual point output setting by data type.
 * @param dataType Point data type
 * @returns Default output setting
 */
export function createDefaultVirtualPointPointSetting(
  dataType: CommonType.DataType = 1
): Api.Device.DeviceTypePointSetting {
  if (dataType === 2) {
    return {
      data_type: 2,
      switch_val: {
        true_val: { value: 'true', alias: '' },
        false_val: { value: 'false', alias: '' }
      }
    };
  }

  if (dataType === 3) {
    return {
      data_type: 3,
      str_val: { default_value: '' }
    };
  }

  if (dataType === 4) {
    return {
      data_type: 4,
      enum_val: { enum_list: [{ value: '', alias: '' }] }
    };
  }

  return {
    data_type: 1,
    num_val: {
      default_value: 0,
      unit: '',
      scale: 3
    }
  };
}

/**
 * Normalize the virtual point output setting. Formula and statistic modes always use numeric data.
 * @param setting Raw output setting
 * @param computeMode Compute mode
 * @returns Normalized output setting
 */
export function normalizeVirtualPointPointSetting(
  setting?: Api.Device.DeviceTypePointSetting,
  computeMode: number = VirtualPointComputeMode.Formula
): Api.Device.DeviceTypePointSetting {
  const canSelectDataType = [VirtualPointComputeMode.Threshold, VirtualPointComputeMode.SegmentMapping].includes(
    computeMode
  );
  const dataType = canSelectDataType ? (setting?.data_type ?? 1) : 1;
  if (dataType === 2) {
    return {
      data_type: 2,
      switch_val: {
        true_val: { value: 'true', alias: setting?.switch_val?.true_val?.alias ?? '' },
        false_val: { value: 'false', alias: setting?.switch_val?.false_val?.alias ?? '' }
      }
    };
  }
  if (dataType === 3) return setting ?? createDefaultVirtualPointPointSetting(dataType);
  if (dataType === 4) {
    return {
      data_type: 4,
      enum_val: {
        enum_list: setting?.enum_val?.enum_list?.length ? setting.enum_val.enum_list : [{ value: '', alias: '' }]
      }
    };
  }

  return {
    data_type: 1,
    num_val: {
      default_value: Number(setting?.num_val?.default_value ?? 0),
      unit: setting?.num_val?.unit ?? '',
      scale: setting?.num_val?.scale ?? 3
    }
  };
}

/**
 * Validate switch and enum settings for selectable data types.
 * @param setting Virtual point output setting
 * @param computeMode Compute mode
 * @returns Error message, or an empty string when valid
 */
export function validateVirtualPointPointSetting(
  setting: Api.Device.DeviceTypePointSetting,
  computeMode: VirtualPointComputeMode
) {
  if (![VirtualPointComputeMode.Threshold, VirtualPointComputeMode.SegmentMapping].includes(computeMode)) return '';

  if (setting.data_type === 2) {
    if (!setting.switch_val?.true_val?.alias?.trim() || !setting.switch_val?.false_val?.alias?.trim()) {
      return $t('virtualPoint.validation.switchMappingIncomplete');
    }
  }

  if (setting.data_type === 4) {
    const enumList = setting.enum_val?.enum_list ?? [];
    if (!enumList.length || enumList.some(item => !item.value.trim() || !item.alias.trim())) {
      return $t('virtualPoint.validation.enumMappingIncomplete');
    }
    const values = enumList.map(item => item.value.trim());
    if (new Set(values).size !== values.length) return $t('virtualPoint.validation.enumValueDuplicate');
  }

  return '';
}

/** Create a default rule value for virtual points. */
export function createDefaultVirtualPointRuleValue(): Api.Task.TaskPointValueContent {
  return {
    value: null,
    alias: null,
    unit: null
  };
}

/**
 * Hydrate a rule value from the backend single-value structure.
 * @param value Backend single-value structure
 * @param dataType Current output data type
 * @returns Editable rule value
 */
export function normalizeVirtualPointRuleValue(
  value: Api.Task.TaskConditionSingleValue | undefined,
  dataType: CommonType.DataType
): Api.Task.TaskPointValueContent {
  const valueMap = {
    1: value?.num_val,
    2: value?.switch_val,
    3: value?.str_val,
    4: value?.enum_val
  };
  const ruleValue = valueMap[dataType];

  return ruleValue
    ? { value: ruleValue.value, alias: ruleValue.alias ?? null, unit: ruleValue.unit ?? null }
    : createDefaultVirtualPointRuleValue();
}

/**
 * Build the backend single-value structure for the current data type.
 * @param dataType Current output data type
 * @param value Editable rule value
 * @returns Backend single-value structure
 */
export function buildVirtualPointRuleValue(
  dataType: CommonType.DataType,
  value: Api.Task.TaskPointValueContent = createDefaultVirtualPointRuleValue()
): Api.Task.TaskConditionSingleValue {
  const result: Api.Task.TaskConditionSingleValue = { data_type: dataType };
  const content = { value: value.value, alias: value.alias, unit: value.unit };

  if (dataType === 1) result.num_val = content;
  else if (dataType === 2) result.switch_val = content;
  else if (dataType === 3) result.str_val = content;
  else result.enum_val = content;

  return result;
}

/**
 * Check whether a rule value has been filled in.
 * @param value Editable rule value
 * @returns Whether the value is filled in
 */
export function isVirtualPointRuleValueFilled(value: Api.Task.TaskPointValueContent) {
  return value.value !== null && value.value !== undefined && String(value.value).trim() !== '';
}

/**
 * Create a default compute setting for the selected mode.
 * @param computeMode Compute mode
 * @returns Default compute setting
 */
export function createDefaultVirtualPointSetting(computeMode: number): Api.Device.VirtualPointSetting {
  if (computeMode === VirtualPointComputeMode.Threshold) {
    return {
      threshold_assign: {
        accumulate_type: 1,
        immediate_assign: { assign_value: { data_type: 1, num_val: { value: 0 } } },
        conds: []
      }
    };
  }

  if (computeMode === VirtualPointComputeMode.SegmentMapping) {
    return {
      segment_mapping: {
        match_source_type: 1,
        match_expression: '',
        rules: [],
        has_default_value: false,
        default_bound_type: 1
      }
    };
  }

  if (computeMode === VirtualPointComputeMode.StatisticalCount) {
    return {
      statistical: {
        conds: [],
        accumulate_value: 1
      }
    };
  }

  return {
    formula: { expression: '' }
  };
}

/**
 * Build paginated query params for the virtual point list.
 * @param page Page number
 * @param pageSize Page size
 * @returns List request params
 */
export function buildVirtualPointListParams(page: number, pageSize: number): CommonType.CommonListQueryParams {
  return {
    list_option: {
      offset: (page - 1) * pageSize,
      limit: pageSize,
      options: [{ type: 104, value: '101' }]
    },
    options: [{ key: 1 }, { key: 2 }]
  };
}

/**
 * Merge the form, compute setting, and output setting.
 * @param model Base form
 * @param validTimeRanges Valid time ranges
 * @param setting Compute setting
 * @param pointSetting Output point setting
 * @param id Virtual point ID when editing
 * @returns Create or update request params
 */
export function buildVirtualPointSubmitParams(
  model: VirtualPointFormModel,
  validTimeRanges: ValidTimeRange[],
  setting: Api.Device.VirtualPointSetting,
  pointSetting: Api.Device.DeviceTypePointSetting,
  id?: CommonType.IdType
): Api.Device.VirtualPointOperateParams {
  return {
    ...(id === undefined ? {} : { id }),
    ...model,
    belong_device_id: model.belong_device_id!,
    setting: {
      ...setting,
      point: pointSetting,
      valid_time_ranges: validTimeRanges
    }
  };
}

/**
 * Parse JSON settings for non-formula modes.
 * @param value JSON string
 * @returns Compute setting, or null if parsing fails
 */
export function parseVirtualPointSetting(value: string): Api.Device.VirtualPointSetting | null {
  try {
    const parsed = JSON.parse(value) as unknown;
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Api.Device.VirtualPointSetting)
      : null;
  } catch {
    return null;
  }
}
