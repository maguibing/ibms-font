/** 虚拟点计算模式。 */
export enum VirtualPointComputeMode {
  /** 公式计算。 */
  Formula = 1,
  /** 阈值赋值。 */
  Threshold = 2,
  /** 分段映射。 */
  SegmentMapping = 3,
  /** 统计次数。 */
  StatisticalCount = 4
}

/** 虚拟点启停状态。 */
export enum VirtualPointStatus {
  Enabled = 1,
  Disabled = 2
}

/** 单个有效时段，单位为小时。 */
export interface ValidTimeRange {
  start_at: number;
  end_at: number;
}

/** 虚拟点基础表单数据。 */
export interface VirtualPointFormModel {
  name: string;
  key: string;
  belong_device_id: CommonType.IdType | null;
  compute_mode: VirtualPointComputeMode;
  status: VirtualPointStatus;
  is_storage: boolean;
}

export const virtualPointComputeModeOptions = [
  { label: '公式计算', value: VirtualPointComputeMode.Formula },
  { label: '阈值赋值', value: VirtualPointComputeMode.Threshold },
  { label: '分段映射', value: VirtualPointComputeMode.SegmentMapping },
  { label: '统计次数', value: VirtualPointComputeMode.StatisticalCount }
];

export const virtualPointComputeModeMap = Object.fromEntries(
  virtualPointComputeModeOptions.map(item => [item.value, item.label])
) as Record<number, string>;

/**
 * 向公式字符串末尾追加 Token。
 * @param expression 当前公式
 * @param token 待追加内容
 * @returns 追加后的公式
 */
export function appendFormulaToken(expression: string, token: string) {
  return `${expression}${token}`;
}

/**
 * 构建公式计算配置。
 * @param expression 公式表达式
 * @returns 公式配置
 */
export function buildFormulaSetting(expression: string) {
  return { expression };
}

/**
 * 创建虚拟点表单默认值。
 * @returns 默认表单数据
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
 * 规范化有效时段，空值默认为全天。
 * @param ranges 原始时段数据
 * @returns 有效时段列表
 */
export function normalizeValidTimeRanges(ranges?: Array<{ start_at?: unknown; end_at?: unknown }>): ValidTimeRange[] {
  const normalized = (ranges ?? []).map(item => ({
    start_at: Number(item.start_at ?? 0),
    end_at: Number(item.end_at ?? 23)
  }));

  return normalized.length ? normalized : [{ start_at: 0, end_at: 23 }];
}

/**
 * 按数据类型创建虚拟点输出配置。
 * @param dataType 点位数据类型
 * @returns 默认输出配置
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
 * 规范化虚拟点输出配置，公式和统计模式固定为数字类型。
 * @param setting 原始输出配置
 * @param computeMode 计算模式
 * @returns 规范化后的输出配置
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
 * 校验可选数据类型模式下的开关和枚举配置。
 * @param setting 虚拟点输出配置
 * @param computeMode 计算模式
 * @returns 错误提示，空字符串表示通过
 */
export function validateVirtualPointPointSetting(
  setting: Api.Device.DeviceTypePointSetting,
  computeMode: VirtualPointComputeMode
) {
  if (![VirtualPointComputeMode.Threshold, VirtualPointComputeMode.SegmentMapping].includes(computeMode)) return '';

  if (setting.data_type === 2) {
    if (!setting.switch_val?.true_val?.alias?.trim() || !setting.switch_val?.false_val?.alias?.trim()) {
      return '请完善开关映射名称';
    }
  }

  if (setting.data_type === 4) {
    const enumList = setting.enum_val?.enum_list ?? [];
    if (!enumList.length || enumList.some(item => !item.value.trim() || !item.alias.trim())) {
      return '请完善枚举值和映射名称';
    }
    const values = enumList.map(item => item.value.trim());
    if (new Set(values).size !== values.length) return '枚举值不能重复';
  }

  return '';
}

/** 创建虚拟点规则值默认值。 */
export function createDefaultVirtualPointRuleValue(): Api.Task.TaskPointValueContent {
  return {
    value: null,
    alias: null,
    unit: null
  };
}

/**
 * 按当前数据类型回填规则值。
 * @param value 后端单值结构
 * @param dataType 当前输出数据类型
 * @returns 可编辑的规则值
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
 * 按当前数据类型构建后端单值结构。
 * @param dataType 当前输出数据类型
 * @param value 可编辑的规则值
 * @returns 后端单值结构
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
 * 判断规则值是否已填写。
 * @param value 可编辑的规则值
 * @returns 是否已填写
 */
export function isVirtualPointRuleValueFilled(value: Api.Task.TaskPointValueContent) {
  return value.value !== null && value.value !== undefined && String(value.value).trim() !== '';
}

/**
 * 按计算模式创建默认计算配置。
 * @param computeMode 计算模式
 * @returns 默认计算配置
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
 * 构建虚拟点列表分页参数。
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 列表请求参数
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
 * 合并表单、计算配置和输出配置。
 * @param model 基础表单
 * @param validTimeRanges 有效时段
 * @param setting 计算配置
 * @param pointSetting 输出点配置
 * @param id 编辑时的虚拟点 ID
 * @returns 创建或更新请求参数
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
 * 解析非公式模式的 JSON 配置。
 * @param value JSON 字符串
 * @returns 计算配置，解析失败时返回 null
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
