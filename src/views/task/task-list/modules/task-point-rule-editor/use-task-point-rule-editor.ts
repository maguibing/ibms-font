import type { SelectOption } from 'naive-ui';
import { $t } from '@/locales';
import { createConditionTimeTypeOptions, createThresholdOptions, getThresholdOptions } from '../../../constants';

/** 点位规则编辑模式。 */
export type TaskPointRuleEditorMode = 'condition' | 'action';

/** 条件设备来源类型。 */
export type TaskRuleDeviceSourceType = 1 | 2;

/** 规则设备选项。 */
export type TaskRuleDeviceOption = CommonType.IdNameRecord & {
  device_type_id?: CommonType.IdType;
} & Record<string, unknown>;

/** 设备点位选项。 */
export type TaskRuleDeviceTypePointOption = Pick<Api.Device.DeviceTypePoint, 'id' | 'name'> & {
  device_type_id?: CommonType.IdType;
  data_type: CommonType.DataType;
  setting?: Api.Device.DeviceTypePointSetting | null;
};

/** 点位值选项。 */
export type TaskRuleValueOption = SelectOption & {
  alias: string;
};

/** 点位值。 */
export type TaskRulePointValue = Api.Task.TaskPointValueContent;

/** 点位范围值。 */
export type TaskRuleRangeValue = {
  min_val: TaskRulePointValue;
  max_val: TaskRulePointValue;
};

/** 条件点位编辑模型。 */
export type TaskConditionSubCondEditor = {
  _key: string;
  device_type_point_id: CommonType.IdType | null;
  logic_operator_type: Api.Task.TaskLogicalOperatorType;
  threshold_type: Api.Task.TaskThresholdType;
  data_type: CommonType.DataType | null;
  setting?: Api.Device.DeviceTypePointSetting | null;
  selected_device_type_point?: TaskRuleDeviceTypePointOption | null;
  single_val: TaskRulePointValue;
  range_val: TaskRuleRangeValue;
};

/** 条件项编辑模型。 */
export type TaskConditionEditor = {
  _key: string;
  logic_operator_type: Api.Task.TaskLogicalOperatorType;
  device_source_type: TaskRuleDeviceSourceType;
  device_source_id: CommonType.IdType | null;
  selected_device?: TaskRuleDeviceOption | null;
  sub_conds: TaskConditionSubCondEditor[];
};

/** 条件规则编辑模型。 */
export type TaskConditionEditorModel = {
  task_type: 1;
  conds: TaskConditionEditor[];
  freq: Required<Api.Task.TaskConditionFreq>;
};

/** 执行点位编辑模型。 */
export type TaskActionPointEditor = {
  _key: string;
  device_type_point_id: CommonType.IdType | null;
  data_type: CommonType.DataType | null;
  setting?: Api.Device.DeviceTypePointSetting | null;
  selected_device_type_point?: TaskRuleDeviceTypePointOption | null;
  point_val: TaskRulePointValue;
};

/** 执行项编辑模型。 */
export type TaskActionEditor = {
  _key: string;
  device_id: CommonType.IdType | null;
  selected_device?: TaskRuleDeviceOption | null;
  delay_seconds: number;
  continuous_times: number;
  point_vals: TaskActionPointEditor[];
};

/** 动作规则编辑模型。 */
export type TaskActionEditorModel = {
  actions: TaskActionEditor[];
};

/** 点位规则编辑模型。 */
export type TaskPointRuleEditorModel = TaskConditionEditorModel | TaskActionEditorModel;

/** 点位规则编辑器选项映射。 */
export type TaskRuleEditorOptionMaps = {
  deviceMap?: CommonType.IdNameMap;
  deviceTypeMap?: CommonType.IdNameMap;
  deviceTypePointMap?: Record<string, Api.Task.TaskDeviceTypePointMapItem>;
};

type UnknownRecord = Record<string, unknown>;

const DEFAULT_DEVICE_SOURCE_TYPE = 1;
const DEFAULT_LOGIC_OPERATOR_TYPE: Api.Task.TaskLogicalOperatorType = 1;
const DEFAULT_THRESHOLD_TYPE: Api.Task.TaskThresholdType = 7;
const DEFAULT_CONDITION_TIME_TYPE: Api.Task.TaskConditionTimeType = 2;
const DEFAULT_CONDITION_DURATIONS = 30;
const DEFAULT_CONDITION_REPEAT_TIMES = 10;

let editorKeySeed = 0;

/** 条件和动作编辑器的最大数量。 */
export const maxConditionCount = 10;
/** 单个条件的最大点位数量。 */
export const maxConditionPointCount = 20;
/** 动作的最大数量。 */
export const maxActionCount = 10;
/** 单个动作的最大点位数量。 */
export const maxActionPointCount = 20;

/** 判断是否为范围阈值。 */
export function isRangeThreshold(thresholdType?: Api.Task.TaskThresholdType | null) {
  return thresholdType === 5 || thresholdType === 6;
}

/** 创建默认点位值。 */
export function createDefaultPointValue(): TaskRulePointValue {
  return {
    value: null,
    alias: null,
    unit: null
  };
}

/** 创建默认范围值。 */
export function createDefaultRangeValue(): TaskRuleRangeValue {
  return {
    min_val: createDefaultPointValue(),
    max_val: createDefaultPointValue()
  };
}

/** 创建默认条件点位。 */
export function createDefaultConditionSubCond(): TaskConditionSubCondEditor {
  return {
    _key: createEditorKey('condition-point'),
    device_type_point_id: null,
    logic_operator_type: DEFAULT_LOGIC_OPERATOR_TYPE,
    threshold_type: DEFAULT_THRESHOLD_TYPE,
    data_type: null,
    setting: null,
    selected_device_type_point: null,
    single_val: createDefaultPointValue(),
    range_val: createDefaultRangeValue()
  };
}

/** 创建默认条件项。 */
export function createDefaultCondition(
  logicOperatorType: Api.Task.TaskLogicalOperatorType = DEFAULT_LOGIC_OPERATOR_TYPE,
  deviceSourceType: TaskRuleDeviceSourceType = DEFAULT_DEVICE_SOURCE_TYPE
): TaskConditionEditor {
  return {
    _key: createEditorKey('condition'),
    logic_operator_type: logicOperatorType,
    device_source_type: deviceSourceType,
    device_source_id: null,
    selected_device: null,
    sub_conds: [createDefaultConditionSubCond()]
  };
}

/** 创建默认触发频率。 */
export function createDefaultConditionFreq(): Required<Api.Task.TaskConditionFreq> {
  return {
    time_type: DEFAULT_CONDITION_TIME_TYPE,
    durations: DEFAULT_CONDITION_DURATIONS,
    repeat_times: DEFAULT_CONDITION_REPEAT_TIMES
  };
}

/** 创建默认条件模型。 */
export function createDefaultTaskConditionModel(
  deviceSourceType: TaskRuleDeviceSourceType = DEFAULT_DEVICE_SOURCE_TYPE
): TaskConditionEditorModel {
  return {
    task_type: 1,
    conds: [createDefaultCondition(DEFAULT_LOGIC_OPERATOR_TYPE, deviceSourceType)],
    freq: createDefaultConditionFreq()
  };
}

/** 创建默认执行点位。 */
export function createDefaultActionPoint(): TaskActionPointEditor {
  return {
    _key: createEditorKey('action-point'),
    device_type_point_id: null,
    data_type: null,
    setting: null,
    selected_device_type_point: null,
    point_val: createDefaultPointValue()
  };
}

/** 创建默认执行项。 */
export function createDefaultAction(): TaskActionEditor {
  return {
    _key: createEditorKey('action'),
    device_id: null,
    selected_device: null,
    delay_seconds: 1,
    continuous_times: 1,
    point_vals: [createDefaultActionPoint()]
  };
}

/** 创建默认动作模型。 */
export function createDefaultTaskActionModel(): TaskActionEditorModel {
  return {
    actions: [createDefaultAction()]
  };
}

/** 规范化条件模型。 */
export function normalizeTaskConditionModel(
  model?: Partial<Api.Task.TaskConditionSetting>,
  maps: TaskRuleEditorOptionMaps = {}
): TaskConditionEditorModel {
  const rawConds = Array.isArray(model?.conds) ? model.conds : [];

  return {
    task_type: 1,
    conds: rawConds.length
      ? rawConds.map((condition, index) => normalizeCondition(condition, maps, index))
      : [createDefaultCondition()],
    freq: normalizeConditionFreq(model?.freq)
  };
}

/** 规范化动作模型。 */
export function normalizeTaskActionModel(
  model?: Partial<Api.Task.TaskActionSetting>,
  maps: TaskRuleEditorOptionMaps = {}
): TaskActionEditorModel {
  const rawActions = Array.isArray(model?.actions) ? model.actions : [];

  return {
    actions: rawActions.length ? rawActions.map(action => normalizeAction(action, maps)) : [createDefaultAction()]
  };
}

/** 构建点位请求参数。 */
export function buildDeviceTypePointRequestParams(
  device?: TaskRuleDeviceOption | null,
  deviceSourceType: TaskRuleDeviceSourceType = DEFAULT_DEVICE_SOURCE_TYPE
): CommonType.CommonListQueryParams {
  const deviceId = device?.id;

  if (deviceSourceType === 2) {
    const options: CommonType.CommonTypeOptions[] = [{ type: 1, value: '' }];

    if (deviceId !== null && deviceId !== undefined && deviceId !== '') {
      options.push({ type: 3, value: String(deviceId) });
    }

    return {
      list_option: {
        options
      }
    };
  }

  const options: CommonType.CommonTypeOptions[] = [{ type: 104, value: '101' }];

  if (deviceId !== null && deviceId !== undefined && deviceId !== '') {
    options.push({ type: 51, value: String(deviceId) });
  }

  return {
    list_option: {
      options
    }
  };
}

/** 补充任务查询参数。 */
export function withDefaultTaskSearchOption(
  params: Record<string, unknown>,
  defaultOption: CommonType.CommonTypeOptions
): CommonType.CommonListQueryParams {
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

/** 提取点位选项。 */
export function extractTaskDeviceTypePointOptions(response: unknown): TaskRuleDeviceTypePointOption[] {
  const payload = unwrapPayload(response);
  const list = getPayloadList(payload);

  return list
    .map(normalizeDeviceTypePointOption)
    .filter((item): item is TaskRuleDeviceTypePointOption => item !== null);
}

/** 同步条件设备。 */
export function syncConditionDevice(condition: TaskConditionEditor, selected: unknown) {
  condition.selected_device = normalizeDeviceOption(selected);
  condition.device_source_id = condition.selected_device?.id ?? null;
  condition.sub_conds = [createDefaultConditionSubCond()];
}

/** 同步执行设备。 */
export function syncActionDevice(action: TaskActionEditor, selected: unknown) {
  action.selected_device = normalizeDeviceOption(selected);
  action.device_id = action.selected_device?.id ?? null;
  action.point_vals = [createDefaultActionPoint()];
}

/** 同步条件点位。 */
export function syncConditionPoint(point: TaskConditionSubCondEditor, selected: unknown) {
  const deviceTypePoint = normalizeDeviceTypePointSelection(selected);

  if (!deviceTypePoint) {
    resetConditionPoint(point);
    return;
  }

  point.device_type_point_id = deviceTypePoint.id;
  point.data_type = deviceTypePoint.data_type;
  point.setting = deviceTypePoint.setting ?? null;
  point.selected_device_type_point = deviceTypePoint;
  point.threshold_type = getThresholdOptions(deviceTypePoint.data_type).some(
    item => item.value === point.threshold_type
  )
    ? point.threshold_type
    : DEFAULT_THRESHOLD_TYPE;
  resetConditionPointValue(point);
}

/** 同步执行点位。 */
export function syncActionPoint(point: TaskActionPointEditor, selected: unknown) {
  const deviceTypePoint = normalizeDeviceTypePointSelection(selected);

  if (!deviceTypePoint) {
    resetActionPoint(point);
    return;
  }

  point.device_type_point_id = deviceTypePoint.id;
  point.data_type = deviceTypePoint.data_type;
  point.setting = deviceTypePoint.setting ?? null;
  point.selected_device_type_point = deviceTypePoint;
  resetActionPointValue(point);
}

/** 同步点位值别名。 */
export function syncPointValueAlias(value: TaskRulePointValue, selected: unknown) {
  const option = isRecord(selected) ? selected : null;

  value.alias = option?.alias === undefined ? null : String(option.alias);
}

/** 规范化触发频率。 */
export function normalizeConditionFreq(
  freq: Api.Task.TaskConditionFreq | undefined
): Required<Api.Task.TaskConditionFreq> {
  if (!freq) return createDefaultConditionFreq();

  const durations = clampInteger(freq?.durations, 0, Number.MAX_SAFE_INTEGER);

  return {
    time_type: normalizeTimeType(freq?.time_type),
    durations,
    repeat_times: durations === 0 ? 0 : clampInteger(freq?.repeat_times, 0, 100)
  };
}

/** 规范化延迟秒数。 */
export function normalizeActionDelaySeconds(value: unknown) {
  return clampInteger(value, 1, 300);
}

/** 规范化连续次数。 */
export function normalizeActionContinuousTimes(value: unknown) {
  return clampInteger(value, 1, 5);
}

/** 校验范围值。 */
export function isValidRangeValue(range: TaskRuleRangeValue) {
  const min = normalizeRequiredNumber(range.min_val.value);
  const max = normalizeRequiredNumber(range.max_val.value);

  return min !== null && max !== null && min < max;
}

/** 获取条件校验提示。 */
export function getTaskConditionValidationMessage(model: TaskConditionEditorModel) {
  if (model.conds.length > maxConditionCount) return $t('taskList.maxConditions', { value: maxConditionCount });

  for (const [conditionIndex, condition] of model.conds.entries()) {
    if (conditionIndex > 0 && condition.logic_operator_type !== 2) {
      return $t('taskList.conditionOnlyOr', { value: conditionIndex + 1 });
    }

    if (!condition.device_source_id) return $t('taskList.selectDevice', { condition: conditionIndex + 1 });

    if (condition.sub_conds.length > maxConditionPointCount) {
      return $t('taskList.maxConditionPoints', { value: maxConditionPointCount });
    }

    for (const [pointIndex, point] of condition.sub_conds.entries()) {
      if (!point.device_type_point_id) {
        return $t('taskList.selectConditionPoint', { condition: conditionIndex + 1, point: pointIndex + 1 });
      }

      if (!point.data_type) {
        return $t('taskList.missingDataType', {
          prefix: $t('taskList.conditionLabel'),
          item: conditionIndex + 1,
          point: pointIndex + 1
        });
      }

      if (!getThresholdOptions(point.data_type).some(item => item.value === point.threshold_type)) {
        return $t('taskList.unsupportedThreshold', {
          prefix: $t('taskList.conditionLabel'),
          item: conditionIndex + 1,
          point: pointIndex + 1
        });
      }

      if (isRangeThreshold(point.threshold_type)) {
        if (!isValidRangeValue(point.range_val)) {
          return $t('taskList.invalidRange', {
            prefix: $t('taskList.conditionLabel'),
            item: conditionIndex + 1,
            point: pointIndex + 1
          });
        }

        continue;
      }

      if (!isTaskPointValueFilled(point.single_val)) {
        return $t('taskList.inputValue', {
          prefix: $t('taskList.conditionLabel'),
          item: conditionIndex + 1,
          point: pointIndex + 1
        });
      }
    }
  }

  return '';
}

/** 获取动作校验提示。 */
export function getTaskActionValidationMessage(model: TaskActionEditorModel) {
  if (model.actions.length > maxActionCount) return $t('taskList.maxActions', { value: maxActionCount });

  for (const [actionIndex, action] of model.actions.entries()) {
    if (!action.device_id) return $t('taskList.selectActionDevice', { value: actionIndex + 1 });

    if (!isIntegerInRange(action.delay_seconds, 1, 300)) {
      return $t('taskList.invalidDelay', { value: actionIndex + 1 });
    }

    if (!isIntegerInRange(action.continuous_times, 1, 5)) {
      return $t('taskList.invalidContinuousTimes', { value: actionIndex + 1 });
    }

    if (action.point_vals.length > maxActionPointCount) {
      return $t('taskList.maxActionPoints', { value: maxActionPointCount });
    }

    for (const [pointIndex, point] of action.point_vals.entries()) {
      if (!point.device_type_point_id) {
        return $t('taskList.selectActionPoint', { action: actionIndex + 1, point: pointIndex + 1 });
      }

      if (!point.data_type) {
        return $t('taskList.missingDataType', {
          prefix: $t('taskList.actionLabel'),
          item: actionIndex + 1,
          point: pointIndex + 1
        });
      }

      if (!isTaskPointValueFilled(point.point_val)) {
        return $t('taskList.inputValue', {
          prefix: $t('taskList.actionLabel'),
          item: actionIndex + 1,
          point: pointIndex + 1
        });
      }
    }
  }

  return '';
}

/** 构建条件提交参数。 */
export function buildTaskConditionSubmitModel(model: TaskConditionEditorModel): Api.Task.TaskConditionSetting {
  return {
    task_type: 1,
    conds: model.conds.map(condition => ({
      logic_operator_type: condition.logic_operator_type,
      device_source_type: condition.device_source_type,
      device_source_id: condition.device_source_id ?? undefined,
      sub_conds: condition.sub_conds.map(point => {
        const subCond: Api.Task.TaskConditionSubCond = {
          device_type_point_id: point.device_type_point_id,
          logic_operator_type: point.logic_operator_type,
          threshold_type: point.threshold_type
        };

        if (isRangeThreshold(point.threshold_type)) {
          subCond.range_val = {
            min_val: normalizeRequiredNumber(point.range_val.min_val.value),
            max_val: normalizeRequiredNumber(point.range_val.max_val.value)
          };
        } else {
          subCond.single_val = buildTaskConditionSingleValue(point.data_type, point.single_val);
        }

        return subCond;
      })
    })),
    freq: normalizeConditionFreq(model.freq)
  };
}

/** 构建动作提交参数。 */
export function buildTaskActionSubmitModel(model: TaskActionEditorModel): Api.Task.TaskActionSetting {
  return {
    actions: model.actions.map(action => ({
      delay_seconds: normalizeActionDelaySeconds(action.delay_seconds),
      continuous_times: normalizeActionContinuousTimes(action.continuous_times),
      point_vals: action.point_vals.map(point => buildTaskActionPointSubmit(action, point))
    }))
  };
}

/** 获取开关值选项。 */
export function getSwitchValueOptions(setting?: Api.Device.DeviceTypePointSetting | null): TaskRuleValueOption[] {
  const trueVal = setting?.switch_val?.true_val;
  const falseVal = setting?.switch_val?.false_val;

  return [
    {
      label: trueVal?.alias || '开启',
      value: trueVal?.value ?? '1',
      alias: trueVal?.alias || '开启'
    },
    {
      label: falseVal?.alias || '关闭',
      value: falseVal?.value ?? '0',
      alias: falseVal?.alias || '关闭'
    }
  ];
}

/** 获取枚举值选项。 */
export function getEnumValueOptions(setting?: Api.Device.DeviceTypePointSetting | null): TaskRuleValueOption[] {
  const enumList = setting?.enum_val?.enum_list;

  if (!Array.isArray(enumList)) return [];

  return enumList.map(item => ({
    label: item.alias || item.value,
    value: item.value,
    alias: item.alias
  }));
}

function createEditorKey(prefix: string) {
  editorKeySeed += 1;

  return `${prefix}-${Date.now()}-${editorKeySeed}`;
}

function normalizeCondition(
  condition: Api.Task.TaskCondition,
  maps: TaskRuleEditorOptionMaps,
  index: number
): TaskConditionEditor {
  const deviceId = condition.device_source_id ?? null;
  const deviceSourceType = condition.device_source_type === 2 ? 2 : DEFAULT_DEVICE_SOURCE_TYPE;
  const subConds = Array.isArray(condition.sub_conds) ? condition.sub_conds : [];

  return {
    _key: createEditorKey('condition'),
    logic_operator_type: index > 0 ? 2 : normalizeLogicOperatorType(condition.logic_operator_type),
    device_source_type: deviceSourceType,
    device_source_id: deviceId,
    selected_device: createSelectedDevice(deviceId, deviceSourceType === 2 ? maps.deviceTypeMap : maps.deviceMap),
    sub_conds: subConds.length
      ? subConds.map(subCond => normalizeConditionSubCond(subCond, maps.deviceTypePointMap))
      : [createDefaultConditionSubCond()]
  };
}

function normalizeConditionSubCond(
  subCond: Api.Task.TaskConditionSubCond,
  deviceTypePointMap?: Record<string, Api.Task.TaskDeviceTypePointMapItem>
): TaskConditionSubCondEditor {
  const deviceTypePoint = createSelectedDeviceTypePoint(subCond.device_type_point_id, deviceTypePointMap);
  const dataType = deviceTypePoint?.data_type ?? normalizeOptionalDataType(subCond.single_val?.data_type);
  const thresholdType = normalizeThresholdType(subCond.threshold_type);

  return {
    _key: createEditorKey('condition-point'),
    device_type_point_id: subCond.device_type_point_id ?? null,
    logic_operator_type: normalizeLogicOperatorType(subCond.logic_operator_type),
    threshold_type:
      dataType && getThresholdOptions(dataType).some(item => item.value === thresholdType)
        ? thresholdType
        : DEFAULT_THRESHOLD_TYPE,
    data_type: dataType,
    setting: deviceTypePoint?.setting ?? null,
    selected_device_type_point: deviceTypePoint,
    single_val: normalizeConditionSinglePointValue(subCond.single_val, dataType),
    range_val: normalizeConditionRangeValue(subCond.range_val)
  };
}

function normalizeAction(action: Api.Task.TaskAction, maps: TaskRuleEditorOptionMaps): TaskActionEditor {
  const deviceId = action.point_vals?.find(item => item.device?.id)?.device?.id ?? null;

  return {
    _key: createEditorKey('action'),
    device_id: deviceId,
    selected_device: createSelectedDevice(deviceId, maps.deviceMap),
    delay_seconds: normalizeActionDelaySeconds(action.delay_seconds),
    continuous_times: normalizeActionContinuousTimes(action.continuous_times),
    point_vals: action.point_vals?.length
      ? action.point_vals.map(point => normalizeActionPoint(point, maps.deviceTypePointMap))
      : [createDefaultActionPoint()]
  };
}

function normalizeActionPoint(
  point: Api.Task.TaskPointValue,
  deviceTypePointMap?: Record<string, Api.Task.TaskDeviceTypePointMapItem>
): TaskActionPointEditor {
  const deviceTypePointId = point.device_type_point?.id ?? null;
  const deviceTypePoint = createSelectedDeviceTypePoint(deviceTypePointId, deviceTypePointMap);
  const dataType = deviceTypePoint?.data_type ?? normalizeDataType(point.data_type);

  return {
    _key: createEditorKey('action-point'),
    device_type_point_id: deviceTypePointId,
    data_type: dataType,
    setting: deviceTypePoint?.setting ?? null,
    selected_device_type_point: deviceTypePoint,
    point_val: normalizePointValue(getTaskPointValue(point), dataType === 1 ? 0 : null)
  };
}

function buildTaskConditionSingleValue(
  dataType: CommonType.DataType | null,
  value: TaskRulePointValue
): Api.Task.TaskConditionSingleValue {
  const normalizedDataType = normalizeDataType(dataType);
  const submitValue: Api.Task.TaskConditionSingleValue = {
    data_type: normalizedDataType
  };

  if (normalizedDataType === 1) {
    submitValue.num_val = normalizePointValue(value);
  } else if (normalizedDataType === 2) {
    submitValue.switch_val = normalizePointValue(value);
  } else if (normalizedDataType === 3) {
    submitValue.str_val = normalizePointValue(value);
  } else {
    submitValue.enum_val = normalizePointValue(value);
  }

  return submitValue;
}

function buildTaskActionPointSubmit(action: TaskActionEditor, point: TaskActionPointEditor): Api.Task.TaskPointValue {
  const dataType = normalizeDataType(point.data_type);
  const submitPoint: Api.Task.TaskPointValue = {
    device: {
      id: action.device_id as CommonType.IdType
    },
    device_type_point: {
      id: point.device_type_point_id as CommonType.IdType
    },
    data_type: dataType
  };

  if (dataType === 1) {
    submitPoint.num_val = normalizePointValue(point.point_val);
  } else if (dataType === 2) {
    submitPoint.switch_val = normalizePointValue(point.point_val);
  } else if (dataType === 3) {
    submitPoint.str_val = normalizePointValue(point.point_val);
  } else {
    submitPoint.enum_val = normalizePointValue(point.point_val);
  }

  return submitPoint;
}

function resetConditionPoint(point: TaskConditionSubCondEditor) {
  point.device_type_point_id = null;
  point.data_type = null;
  point.setting = null;
  point.selected_device_type_point = null;
  point.threshold_type = DEFAULT_THRESHOLD_TYPE;
  resetConditionPointValue(point);
}

function resetConditionPointValue(point: TaskConditionSubCondEditor) {
  point.single_val = createDefaultPointValue();
  point.range_val = createDefaultRangeValue();
}

function resetActionPoint(point: TaskActionPointEditor) {
  point.device_type_point_id = null;
  point.data_type = null;
  point.setting = null;
  point.selected_device_type_point = null;
  resetActionPointValue(point);
}

function resetActionPointValue(point: TaskActionPointEditor) {
  point.point_val = createDefaultPointValue();
}

function normalizePointValue(
  value?: Api.Task.TaskPointValueContent | null,
  omittedValue: Api.Task.TaskPointValueContent['value'] = null
): TaskRulePointValue {
  return {
    value: value && value.value === undefined ? omittedValue : (value?.value ?? null),
    alias: value?.alias ?? null,
    unit: value?.unit ?? null
  };
}

function normalizePointValueFromRaw(value: unknown): TaskRulePointValue {
  if (isRecord(value)) return normalizePointValue(value);

  return {
    value: value === undefined ? null : (value as CommonType.IdType | boolean | null),
    alias: null,
    unit: null
  };
}

function isTaskPointValueFilled(value?: TaskRulePointValue | null) {
  const rawValue = value?.value;

  if (rawValue === null || rawValue === undefined) return false;
  if (typeof rawValue === 'string') return rawValue.trim() !== '';

  return true;
}

function normalizeRequiredNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null;

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function isIntegerInRange(value: unknown, min: number, max: number) {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue >= min && numberValue <= max;
}

function getTaskPointValue(point: Api.Task.TaskPointValue) {
  if (point.data_type === 1) return point.num_val;
  if (point.data_type === 2) return point.switch_val;
  if (point.data_type === 3) return point.str_val ?? point.text_val;

  return point.enum_val;
}

function getTaskConditionSinglePointValue(
  singleVal: Api.Task.TaskConditionSingleValue | null | undefined,
  dataType: CommonType.DataType | null
) {
  if (!singleVal) return null;
  if (isRecord(singleVal) && 'value' in singleVal) return singleVal as Api.Task.TaskPointValueContent;
  if (dataType === 1) return singleVal.num_val;
  if (dataType === 2) return singleVal.switch_val;
  if (dataType === 3) return singleVal.str_val;
  if (dataType === 4) return singleVal.enum_val;

  return null;
}

function normalizeConditionSinglePointValue(
  singleVal: Api.Task.TaskConditionSingleValue | null | undefined,
  dataType: CommonType.DataType | null
) {
  return normalizePointValue(getTaskConditionSinglePointValue(singleVal, dataType), dataType === 1 ? 0 : null);
}

function normalizeConditionRangeValue(range?: Api.Task.TaskConditionRangeValue | null): TaskRuleRangeValue {
  return {
    min_val: normalizePointValueFromRaw(range?.min_val),
    max_val: normalizePointValueFromRaw(range?.max_val)
  };
}

function normalizeDeviceOption(input: unknown): TaskRuleDeviceOption | null {
  if (!isRecord(input)) return null;
  const id = input.id;

  if (id === null || id === undefined || id === '') return null;

  return {
    ...input,
    id: id as CommonType.IdType,
    name: String(input.name ?? id)
  };
}

function normalizeDeviceTypePointSelection(input: unknown): TaskRuleDeviceTypePointOption | null {
  if (!isRecord(input)) return null;

  return normalizeDeviceTypePointOption(input);
}

function normalizeDeviceTypePointOption(input: UnknownRecord): TaskRuleDeviceTypePointOption | null {
  const id = input.id;

  if (id === null || id === undefined || id === '') return null;

  const rawSetting = isRecord(input.setting) ? input.setting : null;
  const dataType = normalizeDataType(input.data_type ?? rawSetting?.data_type);

  return {
    ...input,
    id: id as CommonType.IdType,
    name: String(input.name ?? id),
    device_type_id: input.device_type_id as CommonType.IdType,
    data_type: dataType,
    setting: normalizePointSetting(rawSetting, dataType)
  };
}

function normalizePointSetting(value: unknown, dataType: CommonType.DataType) {
  if (!isRecord(value)) return null;

  return {
    ...value,
    data_type: normalizeDataType(value.data_type, dataType)
  } as Api.Device.DeviceTypePointSetting;
}

function getPayloadList(payload: unknown): UnknownRecord[] {
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (!isRecord(payload)) return [];

  if (Array.isArray(payload.list)) return payload.list.filter(isRecord);
  if (Array.isArray(payload.data)) return payload.data.filter(isRecord);
  if (Array.isArray(payload.rows)) return payload.rows.filter(isRecord);

  return [];
}

function unwrapPayload(response: unknown) {
  if (!isRecord(response)) return response;

  if ('data' in response && 'error' in response) {
    return response.error ? null : response.data;
  }

  return response;
}

function createSelectedDevice(
  deviceId: CommonType.IdType | null,
  deviceMap?: CommonType.IdNameMap
): TaskRuleDeviceOption | null {
  if (deviceId === null || deviceId === undefined || deviceId === '') return null;

  return normalizeDeviceOption(
    deviceMap?.[String(deviceId)] ?? {
      id: deviceId,
      name: String(deviceId)
    }
  );
}

function createSelectedDeviceTypePoint(
  deviceTypePointId: CommonType.IdType | null | undefined,
  deviceTypePointMap?: Record<string, Api.Task.TaskDeviceTypePointMapItem>
): TaskRuleDeviceTypePointOption | null {
  if (deviceTypePointId === null || deviceTypePointId === undefined) return null;

  const deviceTypePoint = deviceTypePointMap?.[String(deviceTypePointId)];
  if (!deviceTypePoint) return null;

  return normalizeDeviceTypePointOption(deviceTypePoint);
}

function normalizeLogicOperatorType(value?: Api.Task.TaskLogicalOperatorType | null): Api.Task.TaskLogicalOperatorType {
  return value === 2 ? 2 : 1;
}

function normalizeThresholdType(value?: Api.Task.TaskThresholdType | null): Api.Task.TaskThresholdType {
  const numberValue = Number(value);

  return createThresholdOptions().some(item => item.value === numberValue)
    ? (numberValue as Api.Task.TaskThresholdType)
    : DEFAULT_THRESHOLD_TYPE;
}

function normalizeTimeType(value?: Api.Task.TaskConditionTimeType | null): Api.Task.TaskConditionTimeType {
  const numberValue = Number(value);

  return createConditionTimeTypeOptions().some(item => item.value === numberValue)
    ? (numberValue as Api.Task.TaskConditionTimeType)
    : 1;
}

function normalizeOptionalDataType(value: unknown): CommonType.DataType | null {
  const numberValue = Number(value);

  return [1, 2, 3, 4].includes(numberValue) ? (numberValue as CommonType.DataType) : null;
}

function normalizeDataType(value: unknown, fallback: CommonType.DataType = 1): CommonType.DataType {
  const numberValue = Number(value);

  return [1, 2, 3, 4].includes(numberValue) ? (numberValue as CommonType.DataType) : fallback;
}

function clampInteger(value: unknown, min: number, max: number) {
  const numberValue = Math.trunc(Number(value));

  if (!Number.isFinite(numberValue)) return min;

  return Math.min(Math.max(numberValue, min), max);
}

function isRecord(input: unknown): input is UnknownRecord {
  return typeof input === 'object' && input !== null;
}
