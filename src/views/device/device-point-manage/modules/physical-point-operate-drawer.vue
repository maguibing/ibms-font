<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import {
  fetchCreatePhysicalPoint,
  fetchGetDeviceList,
  fetchGetLogicPointList,
  fetchGetPhysicalPoint,
  fetchUpdatePhysicalPoint
} from '@/service/api/device';
import { fetchGetGatewayList } from '@/service/api/gateway';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { ACCESS_LEVEL_OPTIONS, DATA_TYPE_OPTIONS } from '@/constants/business';
import PhysicalPointBacnetConfig from './physical-point-bacnet-config.vue';
import PhysicalPointModbusConfig from './physical-point-modbus-config.vue';
import PhysicalPointOpcUaConfig from './physical-point-opc-ua-config.vue';
import { byteOrderOptions, modbusDataTypeBaseOptions, resolveProtocolType } from './physical-point-shared';
import type { PhysicalPointProtocolModel } from './physical-point-operate-types';

defineOptions({
  name: 'PhysicalPointOperateDrawer'
});

interface Props {
  operateType?: NaiveUI.TableOperateType;
  prefillGateway?: Api.Gateway.Gateway | null;
  rowId?: CommonType.IdType | null;
}

interface PhysicalPointOperateModel {
  data_type: CommonType.DataType;
  device_id: CommonType.IdType | null;
  gateway_id: CommonType.IdType | null;
  is_storage: boolean;
  key: string;
  logic_point_id: CommonType.IdType | null;
  name: string;
  protocol: PhysicalPointProtocolModel;
}

type RemoteSelectRecord = Record<string, any>;

/** 协议和 Modbus 规则常量，与后端枚举保持一致。 */
const PROTOCOL_TYPE = {
  MODBUS: 4,
  BACNET: 5,
  OPC_UA: 6
} as const;
const MQTT_HTTP_PROTOCOL_TYPES = [1, 2, 3];
const MODBUS_BIT_REGISTER_TYPES = [1, 2];
const MODBUS_WORD_REGISTER_TYPES = [3, 4];
const MODBUS_32BIT_DATA_TYPES = [3, 4, 5];
const OPC_UA_LINEAR_DATA_TYPES = [2, 3, 4];
const MODBUS_BOOL_DATA_TYPE = 6;
const DEFAULT_MODBUS_REGISTER_TYPE = 1;
const DEFAULT_MODBUS_DATA_TYPE = MODBUS_BOOL_DATA_TYPE;
const DEFAULT_MODBUS_BYTE_ORDER = 1;
const DEFAULT_SCALE = 1;
const DEFAULT_OFFSET = 0;
const LINEAR_TRANSFORM_PRESET = {
  byteOrder: 2,
  dataType: 5,
  offset: -1,
  registerType: 3,
  scale: 0.01176
};

const props = withDefaults(defineProps<Props>(), {
  operateType: 'add',
  prefillGateway: null,
  rowId: null
});

const emit = defineEmits<{
  submitted: [];
}>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();

const selectedGatewayOption = shallowRef<RemoteSelectRecord | null>(null);
const previousModbusRegisterType = shallowRef(DEFAULT_MODBUS_REGISTER_TYPE);
const model = ref<PhysicalPointOperateModel>(createDefaultModel());

const gatewayRequestParams: CommonType.CommonListQueryParams = {
  options: [{ key: 1 }],
  list_option: {
    options: [{ type: 104, value: '101' }]
  }
};

const selectedGatewayOptions = computed(() => selectedGatewayOption.value);
const isEdit = computed(() => props.operateType === 'edit');
const drawerTitle = computed(() => (isEdit.value ? '编辑物理点位' : '新增物理点位'));
const logicPointRequestParams = computed<CommonType.CommonListQueryParams>(() => ({
  list_option: {
    options: model.value.device_id ? [{ type: 2, value: String(model.value.device_id) }] : []
  }
}));
const selectedProtocolType = computed(() => model.value.protocol.protocol_type);
const isMqttOrHttp = computed(() => MQTT_HTTP_PROTOCOL_TYPES.includes(Number(selectedProtocolType.value)));
const isModbus = computed(() => selectedProtocolType.value === PROTOCOL_TYPE.MODBUS);
const isBacnet = computed(() => selectedProtocolType.value === PROTOCOL_TYPE.BACNET);
const isOpcUa = computed(() => selectedProtocolType.value === PROTOCOL_TYPE.OPC_UA);
const modbusRegisterType = computed(() => Number(model.value.protocol.modbus.register_type));
const modbusDataType = computed(() => Number(model.value.protocol.modbus.data_type));
const isModbusBitRegister = computed(() => MODBUS_BIT_REGISTER_TYPES.includes(modbusRegisterType.value));
const isModbusWordRegister = computed(() => MODBUS_WORD_REGISTER_TYPES.includes(modbusRegisterType.value));
const isModbusBoolDataType = computed(() => modbusDataType.value === MODBUS_BOOL_DATA_TYPE);
const isModbus32BitDataType = computed(() => MODBUS_32BIT_DATA_TYPES.includes(modbusDataType.value));
const canEditModbusBitIndex = computed(() => isModbusWordRegister.value && isModbusBoolDataType.value);
const modbusBitIndexMax = computed(() => (canEditModbusBitIndex.value ? 15 : 0));
const showModbusByteOrder = computed(() => isModbusWordRegister.value && isModbus32BitDataType.value);
const modbusDataTypeOptions = computed(() => {
  if (isModbusBitRegister.value) {
    return modbusDataTypeBaseOptions.filter(item => item.value === MODBUS_BOOL_DATA_TYPE);
  }

  return modbusDataTypeBaseOptions;
});
const showLinearTransform = computed(() => {
  if (isModbus.value) return !isModbusBoolDataType.value;
  if (isOpcUa.value) return OPC_UA_LINEAR_DATA_TYPES.includes(Number(model.value.protocol.opcua.data_type));

  return false;
});

const rules: Record<string, App.Global.FormRule | App.Global.FormRule[]> = {
  data_type: createRequiredRule('请选择数据类型'),
  gateway_id: createRequiredRule('请选择边缘设备'),
  key: createRequiredRule('请输入点位标识'),
  name: createRequiredRule('请输入点位名称'),
  'protocol.access_level': createRequiredRule('请选择访问级别'),
  'protocol.bacnet.object_instance': createVisibleRequiredRule('请输入对象实例', () => isBacnet.value),
  'protocol.modbus.address': createVisibleRequiredRule('请输入寄存器地址', () => isModbus.value),
  'protocol.modbus.slave_id': createVisibleRequiredRule('请输入从站地址', () => isModbus.value),
  'protocol.opcua.node_id': createVisibleRequiredRule('请输入节点 ID', () => isOpcUa.value)
};

/**
 * 创建协议默认值。
 *
 * @returns 协议配置模型
 */
function createDefaultProtocolModel(): PhysicalPointProtocolModel {
  return {
    access_level: 1,
    bacnet: {
      device_instance: 1,
      object_instance: 1,
      object_type: 1,
      property_type_list: []
    },
    enable_linear_transform: false,
    modbus: {
      address: 0,
      bit_index: 0,
      byte_order: DEFAULT_MODBUS_BYTE_ORDER,
      data_type: DEFAULT_MODBUS_DATA_TYPE,
      register_type: DEFAULT_MODBUS_REGISTER_TYPE,
      slave_id: 1
    },
    offset: DEFAULT_OFFSET,
    opcua: {
      data_type: 1,
      node_id: null
    },
    protocol_type: null,
    scale: DEFAULT_SCALE
  };
}

/**
 * 创建表单默认值。
 *
 * @returns 物理点位表单模型
 */
function createDefaultModel(): PhysicalPointOperateModel {
  return {
    data_type: 1,
    device_id: null,
    gateway_id: null,
    is_storage: true,
    key: '',
    logic_point_id: null,
    name: '',
    protocol: createDefaultProtocolModel()
  };
}

/**
 * 创建仅在当前协议显示时生效的必填规则。
 *
 * @param message 校验提示
 * @param shouldValidate 是否需要校验
 * @returns 表单校验规则
 */
function createVisibleRequiredRule(message: string, shouldValidate: () => boolean): App.Global.FormRule {
  return {
    trigger: ['input', 'blur', 'change'],
    validator: (_rule, value) => {
      if (!shouldValidate()) return true;
      if (value === null || value === undefined || value === '') {
        return new Error(message);
      }

      return true;
    }
  };
}

/**
 * 转换数字字段。
 *
 * @param value 原始值
 * @param fallback 兜底值
 * @returns 有效数字
 */
function normalizeNumber(value: unknown, fallback: number) {
  const normalized = Number(value);

  return Number.isFinite(normalized) ? normalized : fallback;
}

/**
 * 合并详情协议配置。
 *
 * @param point 物理点位详情
 * @returns 协议表单模型
 */
function normalizeProtocolModel(point: Api.Device.PhysicalPoint): PhysicalPointProtocolModel {
  const defaultProtocol = createDefaultProtocolModel();
  const source = point.protocol ?? {};
  const protocolType = resolveProtocolType(point.protocol_type ?? source.protocol_type);

  return {
    ...defaultProtocol,
    ...source,
    access_level: normalizeNumber(source.access_level, defaultProtocol.access_level),
    bacnet: {
      ...defaultProtocol.bacnet,
      ...source.bacnet,
      property_type_list: Array.isArray(source.bacnet?.property_type_list)
        ? source.bacnet.property_type_list
        : defaultProtocol.bacnet.property_type_list
    },
    enable_linear_transform: Boolean(source.enable_linear_transform),
    modbus: {
      ...defaultProtocol.modbus,
      ...source.modbus
    },
    offset: normalizeNumber(source.offset, defaultProtocol.offset),
    opcua: {
      ...defaultProtocol.opcua,
      ...source.opcua
    },
    protocol_type: protocolType,
    scale: normalizeNumber(source.scale, defaultProtocol.scale)
  };
}

/**
 * 获取详情页边缘设备下拉回显项。
 *
 * @param data 详情响应
 * @param point 物理点位详情
 * @param protocolType 协议类型
 * @returns 边缘设备回显项
 */
function getDetailGatewayOption(
  data: Api.Device.PhysicalPointDetailResponse,
  point: Api.Device.PhysicalPoint,
  protocolType: Api.Gateway.ProtocolType | null
) {
  const gateway = data.gateway_map?.[String(point.gateway_id)];

  if (gateway) {
    return {
      ...gateway,
      protocol_type: protocolType ?? gateway.protocol_type
    };
  }

  if (props.prefillGateway && String(props.prefillGateway.id) === String(point.gateway_id)) {
    return props.prefillGateway;
  }

  return null;
}

/**
 * 重置协议配置，避免切换网关后残留上一个协议的参数。
 *
 * @param protocolType 协议类型
 */
function resetProtocol(protocolType: Api.Gateway.ProtocolType | null) {
  const nextProtocol = createDefaultProtocolModel();
  nextProtocol.protocol_type = protocolType;
  model.value.protocol = nextProtocol;
  previousModbusRegisterType.value = Number(nextProtocol.modbus.register_type);
}

/** 重置表单和下拉回显。 */
function resetModel() {
  model.value = createDefaultModel();
  selectedGatewayOption.value = null;
  previousModbusRegisterType.value = DEFAULT_MODBUS_REGISTER_TYPE;
}

/**
 * 根据预选网关填充边缘设备和协议类型。
 *
 * @param gateway 网关记录
 */
function applyGatewayPreset(gateway: Api.Gateway.Gateway) {
  const protocolType = gateway.protocol_type;

  selectedGatewayOption.value = gateway;
  model.value.gateway_id = gateway.id;
  resetProtocol(protocolType);
}

/**
 * 根据详情回填编辑表单。
 *
 * @param data 详情响应
 */
function applyPhysicalPointDetail(data: Api.Device.PhysicalPointDetailResponse) {
  const point = data.physical_point;
  const protocol = normalizeProtocolModel(point);

  model.value = {
    ...createDefaultModel(),
    data_type: point.data_type ?? 1,
    device_id: point.device_id ?? null,
    gateway_id: point.gateway_id ?? null,
    is_storage: point.is_storage ?? true,
    key: point.key ?? '',
    logic_point_id: point.logic_point_id ?? null,
    name: point.name ?? '',
    protocol
  };
  selectedGatewayOption.value = getDetailGatewayOption(data, point, protocol.protocol_type);
  previousModbusRegisterType.value = Number(protocol.modbus.register_type);
  normalizeModbusByRules();
}

/**
 * 处理边缘设备选择。
 *
 * @param record 选中的边缘设备
 */
function handleGatewaySelected(record: RemoteSelectRecord | RemoteSelectRecord[] | null) {
  const gateway = Array.isArray(record) ? record[0] : record;

  if (!gateway) {
    selectedGatewayOption.value = null;
    model.value.gateway_id = null;
    resetProtocol(null);
    return;
  }

  applyGatewayPreset(gateway as Api.Gateway.Gateway);
}

/** 切换设备时清空已选逻辑点位。 */
function handleDeviceChange() {
  model.value.logic_point_id = null;
}

/** 抽屉打开时初始化新增或编辑表单。 */
async function handleUpdateModel() {
  resetModel();

  if (isEdit.value && props.rowId !== null && props.rowId !== undefined) {
    startLoading();
    const { data, error } = await fetchGetPhysicalPoint({
      id: props.rowId,
      options: [{ key: 1 }]
    }).finally(endLoading);

    if (!error && data?.physical_point) {
      applyPhysicalPointDetail(data);
    }
  } else if (props.prefillGateway) {
    applyGatewayPreset(props.prefillGateway);
  }

  await nextTick();
  restoreValidation();
}

/**
 * 限制 Modbus 位索引范围。
 *
 * @param value 位索引
 * @returns 0 到 15 的整数
 */
function clampModbusBitIndex(value: number) {
  if (!Number.isFinite(value)) return 0;

  return Math.min(15, Math.max(0, Math.trunc(value)));
}

function setTransform(scale: number, offset: number) {
  model.value.protocol.scale = scale;
  model.value.protocol.offset = offset;
}

/** 按寄存器类型和数据类型整理 Modbus 参数。 */
function normalizeModbusByRules() {
  if (!isModbus.value) return;

  const { modbus } = model.value.protocol;
  const registerType = Number(modbus.register_type);
  const dataType = Number(modbus.data_type);
  const availableDataTypeValues = modbusDataTypeOptions.value.map(item => item.value);

  if (!availableDataTypeValues.includes(dataType)) {
    modbus.data_type = availableDataTypeValues[0] ?? MODBUS_BOOL_DATA_TYPE;
  }

  if (MODBUS_BIT_REGISTER_TYPES.includes(registerType)) {
    modbus.data_type = MODBUS_BOOL_DATA_TYPE;
    modbus.bit_index = 0;
    modbus.byte_order = undefined;
    return;
  }

  if (!MODBUS_WORD_REGISTER_TYPES.includes(registerType)) return;

  if (Number(modbus.data_type) === MODBUS_BOOL_DATA_TYPE) {
    modbus.bit_index = clampModbusBitIndex(modbus.bit_index);
    modbus.byte_order = undefined;
    return;
  }

  modbus.bit_index = 0;
  if ([1, 2].includes(Number(modbus.data_type))) {
    modbus.byte_order = undefined;
    return;
  }

  if (
    MODBUS_32BIT_DATA_TYPES.includes(Number(modbus.data_type)) &&
    !byteOrderOptions.some(item => item.value === modbus.byte_order)
  ) {
    modbus.byte_order = byteOrderOptions[0].value;
  }
}

/**
 * 处理 Modbus 寄存器类型切换。
 *
 * @param registerType 寄存器类型
 */
function handleModbusRegisterTypeChange(registerType: number) {
  const prevRegisterType = Number(previousModbusRegisterType.value);
  const nextRegisterType = Number(registerType);
  const { modbus } = model.value.protocol;

  model.value.protocol.enable_linear_transform = false;
  setTransform(DEFAULT_SCALE, DEFAULT_OFFSET);

  if (
    MODBUS_WORD_REGISTER_TYPES.includes(nextRegisterType) &&
    MODBUS_BIT_REGISTER_TYPES.includes(prevRegisterType) &&
    Number(modbus.data_type) === MODBUS_BOOL_DATA_TYPE
  ) {
    modbus.data_type = 1;
  }

  previousModbusRegisterType.value = nextRegisterType;
  normalizeModbusByRules();
}

/**
 * 处理 Modbus 数据类型切换。
 *
 * @param value 数据类型
 */
function handleModbusDataTypeChange(value: number) {
  if (value === MODBUS_BOOL_DATA_TYPE) {
    model.value.protocol.enable_linear_transform = false;
    setTransform(0, 0);
  }

  normalizeModbusByRules();
}

/**
 * 处理 OPC UA 数据类型切换。
 *
 * @param value 数据类型
 */
function handleOpcUaDataTypeChange(value: number) {
  if ([1, 5].includes(value)) {
    model.value.protocol.enable_linear_transform = false;
    setTransform(0, 0);
  }
}

/**
 * 处理线性转换开关。
 *
 * @param value 是否启用
 */
function handleEnableLinearTransformChange(value: boolean) {
  if (value) {
    setTransform(LINEAR_TRANSFORM_PRESET.scale, LINEAR_TRANSFORM_PRESET.offset);
    if (isModbus.value) {
      model.value.protocol.modbus.register_type = LINEAR_TRANSFORM_PRESET.registerType;
      model.value.protocol.modbus.data_type = LINEAR_TRANSFORM_PRESET.dataType;
      model.value.protocol.modbus.byte_order = LINEAR_TRANSFORM_PRESET.byteOrder;
      previousModbusRegisterType.value = LINEAR_TRANSFORM_PRESET.registerType;
      normalizeModbusByRules();
    }
    return;
  }

  setTransform(DEFAULT_SCALE, DEFAULT_OFFSET);

  if (!isModbus.value) return;

  model.value.protocol.modbus.register_type = DEFAULT_MODBUS_REGISTER_TYPE;
  model.value.protocol.modbus.data_type = DEFAULT_MODBUS_DATA_TYPE;
  model.value.protocol.modbus.byte_order = DEFAULT_MODBUS_BYTE_ORDER;
  previousModbusRegisterType.value = DEFAULT_MODBUS_REGISTER_TYPE;
  normalizeModbusByRules();
}

/**
 * 生成符合后端要求的 Modbus 协议参数。
 *
 * @returns Modbus 提交参数
 */
function buildModbusPayload(): Api.Device.PhysicalPointModbusParams {
  const modbus = { ...model.value.protocol.modbus };
  const registerType = Number(modbus.register_type);
  const dataType = Number(modbus.data_type);

  if (MODBUS_BIT_REGISTER_TYPES.includes(registerType)) {
    modbus.data_type = MODBUS_BOOL_DATA_TYPE;
    modbus.bit_index = 0;
    delete modbus.byte_order;
    return modbus;
  }

  if (!MODBUS_WORD_REGISTER_TYPES.includes(registerType)) return modbus;

  if (dataType === MODBUS_BOOL_DATA_TYPE) {
    modbus.bit_index = clampModbusBitIndex(modbus.bit_index);
    delete modbus.byte_order;
    return modbus;
  }

  modbus.bit_index = 0;
  if ([1, 2].includes(dataType)) {
    delete modbus.byte_order;
  }

  return modbus;
}

/**
 * 按当前协议生成协议提交参数。
 *
 * @returns 协议提交参数
 */
function buildProtocolPayload(): Api.Device.PhysicalPointOperateProtocol {
  const currentProtocolType = selectedProtocolType.value as Api.Gateway.ProtocolType;
  const payload: Api.Device.PhysicalPointOperateProtocol = {
    access_level: model.value.protocol.access_level,
    offset: model.value.protocol.offset,
    protocol_type: currentProtocolType,
    scale: model.value.protocol.scale
  };

  if (currentProtocolType === PROTOCOL_TYPE.MODBUS) {
    payload.modbus = buildModbusPayload();
  } else if (currentProtocolType === PROTOCOL_TYPE.BACNET) {
    payload.bacnet = { ...model.value.protocol.bacnet };
  } else if (currentProtocolType === PROTOCOL_TYPE.OPC_UA) {
    payload.opcua = { ...model.value.protocol.opcua };
  }

  return payload;
}

/**
 * 生成单个物理点位参数。
 *
 * @returns 物理点位参数
 */
function buildPhysicalPointPayload(): Api.Device.PhysicalPointOperateItem {
  return {
    data_type: model.value.data_type,
    is_storage: model.value.is_storage,
    key: model.value.key,
    logic_point_id: model.value.logic_point_id,
    name: model.value.name,
    protocol: buildProtocolPayload()
  };
}

/**
 * 生成新增或编辑物理点位的提交参数。
 *
 * @returns 物理点位提交参数
 */
function buildSubmitParams(): Api.Device.CreatePhysicalPointParams | Api.Device.UpdatePhysicalPointParams {
  const gateway_id = model.value.gateway_id as CommonType.IdType;
  const pointPayload = buildPhysicalPointPayload();

  if (isEdit.value) {
    return {
      gateway_id,
      id: props.rowId as CommonType.IdType,
      ...pointPayload
    };
  }

  return {
    gateway_id,
    physical_point_list: [pointPayload]
  };
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  startLoading();
  const params = buildSubmitParams();
  const { error } = await (
    isEdit.value
      ? fetchUpdatePhysicalPoint(params as Api.Device.UpdatePhysicalPointParams)
      : fetchCreatePhysicalPoint(params as Api.Device.CreatePhysicalPointParams)
  ).finally(endLoading);
  if (error) return;

  window.$message?.success(isEdit.value ? $t('common.updateSuccess') : $t('common.addSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, async () => {
  if (!visible.value) return;

  await handleUpdateModel();
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="640" class="max-w-90%">
    <NDrawerContent :title="drawerTitle" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
        <NGrid responsive="screen" item-responsive :x-gap="16">
          <NFormItemGi span="24" label="边缘设备" path="gateway_id">
            <RemoteSearchSelect
              v-model:value="model.gateway_id"
              :request="fetchGetGatewayList"
              :request-params="gatewayRequestParams"
              :selected-options="selectedGatewayOptions"
              :search-type="1"
              label-field="name"
              value-field="id"
              :disabled="isEdit"
              placeholder="请选择边缘设备"
              @selected-change="handleGatewaySelected"
            />
          </NFormItemGi>
          <NFormItemGi span="24" label="点位名称" path="name">
            <NInput v-model:value="model.name" maxlength="50" show-count placeholder="请输入点位名称" />
          </NFormItemGi>
          <NFormItemGi span="24" label="点位标识" path="key">
            <NInput v-model:value="model.key" maxlength="48" show-count placeholder="请输入点位标识" />
          </NFormItemGi>
          <NFormItemGi span="24" label="访问级别" path="protocol.access_level">
            <NSelect
              v-model:value="model.protocol.access_level"
              :options="ACCESS_LEVEL_OPTIONS"
              placeholder="请选择访问级别"
            />
          </NFormItemGi>
          <NFormItemGi v-if="isMqttOrHttp" span="24" label="数据类型" path="data_type">
            <NSelect v-model:value="model.data_type" :options="DATA_TYPE_OPTIONS" placeholder="请选择数据类型" />
          </NFormItemGi>
          <NFormItemGi :span="showLinearTransform ? '24 s:12' : '24'" label="是否存储" path="is_storage">
            <NSwitch v-model:value="model.is_storage" />
          </NFormItemGi>
          <NFormItemGi v-if="showLinearTransform" span="24 s:12" path="protocol.enable_linear_transform">
            <template #label>
              <div class="flex-center">
                <FormTip content="输入范围 85到170转换成 0到1" />
                <span>线性转换</span>
              </div>
            </template>
            <NSwitch
              v-model:value="model.protocol.enable_linear_transform"
              @update:value="handleEnableLinearTransformChange"
            />
          </NFormItemGi>
          <NFormItemGi span="24" label="设备(可选)" path="device_id">
            <RemoteSearchSelect
              v-model:value="model.device_id"
              :request="fetchGetDeviceList"
              :request-params="{ list_option: { options: [] } }"
              :search-type="1"
              label-field="name"
              value-field="id"
              clearable
              placeholder="请选择设备"
              @update:value="handleDeviceChange"
            />
          </NFormItemGi>
          <NFormItemGi span="24" label="逻辑点位" path="logic_point_id">
            <RemoteSearchSelect
              v-model:value="model.logic_point_id"
              :request="fetchGetLogicPointList"
              :request-params="logicPointRequestParams"
              :search-type="6"
              label-field="name"
              value-field="id"
              :disabled="!model.device_id"
              clearable
              placeholder="请选择逻辑点位"
            />
          </NFormItemGi>
        </NGrid>

        <NGrid v-if="showLinearTransform" responsive="screen" item-responsive :x-gap="16">
          <NFormItemGi span="24 s:12" label="缩放系数" path="protocol.scale">
            <NInputNumber v-model:value="model.protocol.scale" class="w-full" :min="0" />
          </NFormItemGi>
          <NFormItemGi span="24 s:12" label="偏移量" path="protocol.offset">
            <NInputNumber v-model:value="model.protocol.offset" class="w-full" />
          </NFormItemGi>
        </NGrid>

        <PhysicalPointModbusConfig
          v-if="isModbus"
          v-model:protocol="model.protocol"
          :can-edit-bit-index="canEditModbusBitIndex"
          :is-data-type-disabled="isModbusBitRegister"
          :modbus-bit-index-max="modbusBitIndexMax"
          :modbus-data-type-options="modbusDataTypeOptions"
          :show-byte-order="showModbusByteOrder"
          @data-type-change="handleModbusDataTypeChange"
          @register-type-change="handleModbusRegisterTypeChange"
        />

        <PhysicalPointBacnetConfig v-if="isBacnet" v-model:protocol="model.protocol" />

        <PhysicalPointOpcUaConfig
          v-if="isOpcUa"
          v-model:protocol="model.protocol"
          @data-type-change="handleOpcUaDataTypeChange"
        />
      </NForm>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
