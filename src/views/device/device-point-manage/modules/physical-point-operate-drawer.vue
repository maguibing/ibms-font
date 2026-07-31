<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchGetDeviceList, fetchGetLogicPointList, fetchCreatePhysicalPoint } from '@/service/api/device';
import { fetchGetGatewayList } from '@/service/api/gateway';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { ACCESS_LEVEL_OPTIONS, DATA_TYPE_OPTIONS } from '@/constants/device-point';

defineOptions({
  name: 'PhysicalPointOperateDrawer'
});

interface Props {
  prefillGateway?: Api.Gateway.Gateway | null;
}

interface PhysicalPointProtocolModel {
  access_level: number;
  bacnet: {
    device_instance: number;
    object_instance: number;
    object_type: number;
    property_type_list: number[];
  };
  enable_linear_transform: boolean;
  modbus: {
    address: number;
    bit_index: number;
    byte_order?: number;
    data_type: number;
    register_type: number;
    slave_id: number;
  };
  offset: number;
  opcua: {
    data_type: number;
    node_id: string | null;
  };
  protocol_type: Api.Gateway.ProtocolType | null;
  scale: number;
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
  protocol_type: Api.Gateway.ProtocolType | null;
}

type RemoteSelectRecord = Record<string, any>;

const props = withDefaults(defineProps<Props>(), {
  prefillGateway: null
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

const selectedGatewayOption = shallowRef<Api.Gateway.Gateway | null>(null);
const previousModbusRegisterType = shallowRef(1);
const model = ref<PhysicalPointOperateModel>(createDefaultModel());

const gatewayRequestParams: CommonType.CommonListQueryParams = {
  options: [{ key: 1 }],
  list_option: {
    options: [{ type: 104, value: '101' }]
  }
};

const modbusRegisterTypeOptions = [
  { label: '线圈', value: 1 },
  { label: '离散输入', value: 2 },
  { label: '保持寄存器', value: 3 },
  { label: '输入寄存器', value: 4 }
];

const modbusDataTypeBaseOptions = [
  { label: 'uint16', value: 1 },
  { label: 'int16', value: 2 },
  { label: 'uint32', value: 3 },
  { label: 'int32', value: 4 },
  { label: 'float32', value: 5 },
  { label: 'boolean', value: 6 }
];

const byteOrderOptions = [
  { label: '大端', value: 1 },
  { label: '小端', value: 2 },
  { label: '大端字节交换', value: 3 },
  { label: '小端字节交换', value: 4 }
];

const bacnetObjectTypeOptions = [
  { label: 'AI', value: 1 },
  { label: 'AO', value: 2 },
  { label: 'AV', value: 3 },
  { label: 'BI', value: 4 },
  { label: 'BO', value: 5 },
  { label: 'BV', value: 6 }
];

const opcUaDataTypeOptions = [
  { label: 'Boolean', value: 1 },
  { label: 'Signed Integer', value: 2 },
  { label: 'Unsigned Integer', value: 3 },
  { label: 'Float', value: 4 },
  { label: 'String', value: 5 }
];

const selectedGatewayOptions = computed(() => selectedGatewayOption.value);
const logicPointRequestParams = computed<CommonType.CommonListQueryParams>(() => ({
  list_option: {
    options: model.value.device_id ? [{ type: 2, value: String(model.value.device_id) }] : []
  }
}));
const isMqttOrHttp = computed(() => [1, 2, 3].includes(Number(model.value.protocol_type)));
const isModbus = computed(() => model.value.protocol_type === 4);
const isBacnet = computed(() => model.value.protocol_type === 5);
const isOpcUa = computed(() => model.value.protocol_type === 6);
const modbusRegisterType = computed(() => Number(model.value.protocol.modbus.register_type));
const modbusDataType = computed(() => Number(model.value.protocol.modbus.data_type));
const isModbusBitRegister = computed(() => [1, 2].includes(modbusRegisterType.value));
const isModbusWordRegister = computed(() => [3, 4].includes(modbusRegisterType.value));
const isModbusBoolDataType = computed(() => modbusDataType.value === 6);
const isModbus32BitDataType = computed(() => [3, 4, 5].includes(modbusDataType.value));
const canEditModbusBitIndex = computed(() => isModbusWordRegister.value && isModbusBoolDataType.value);
const modbusBitIndexMax = computed(() => (canEditModbusBitIndex.value ? 15 : 0));
const showModbusByteOrder = computed(() => isModbusWordRegister.value && isModbus32BitDataType.value);
const modbusDataTypeOptions = computed(() => {
  if (isModbusBitRegister.value) {
    return modbusDataTypeBaseOptions.filter(item => item.value === 6);
  }

  return modbusDataTypeBaseOptions;
});
const showLinearTransform = computed(
  () =>
    ([4, 5, 6].includes(Number(model.value.protocol_type)) && model.value.protocol.modbus.data_type !== 6) ||
    (isOpcUa.value && [2, 3, 4].includes(model.value.protocol.opcua.data_type))
);

const rules: Record<string, App.Global.FormRule | App.Global.FormRule[]> = {
  data_type: createRequiredRule('请选择数据类型'),
  gateway_id: createRequiredRule('请选择边缘设备'),
  key: createRequiredRule('请输入点位标识'),
  name: createRequiredRule('请输入点位名称'),
  'protocol.access_level': createRequiredRule('请选择访问级别'),
  protocol_type: createRequiredRule('请选择协议'),
  'protocol.bacnet.object_instance': createVisibleRequiredRule('请输入对象实例', () => isBacnet.value),
  'protocol.modbus.address': createVisibleRequiredRule('请输入寄存器地址', () => isModbus.value),
  'protocol.modbus.slave_id': createVisibleRequiredRule('请输入从站地址', () => isModbus.value),
  'protocol.opcua.node_id': createVisibleRequiredRule('请输入节点 ID', () => isOpcUa.value)
};

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
      byte_order: 1,
      data_type: 6,
      register_type: 1,
      slave_id: 1
    },
    offset: 0,
    opcua: {
      data_type: 1,
      node_id: null
    },
    protocol_type: null,
    scale: 1
  };
}

function createDefaultModel(): PhysicalPointOperateModel {
  return {
    data_type: 1,
    device_id: null,
    gateway_id: null,
    is_storage: true,
    key: '',
    logic_point_id: null,
    name: '',
    protocol: createDefaultProtocolModel(),
    protocol_type: null
  };
}

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

function normalizeProtocolType(value: unknown): Api.Gateway.ProtocolType | null {
  const protocolType = Number(value);

  if ([1, 2, 3, 4, 5, 6].includes(protocolType)) {
    return protocolType as Api.Gateway.ProtocolType;
  }

  return null;
}

function updateProtocolType(protocolType: Api.Gateway.ProtocolType | null) {
  model.value.protocol_type = protocolType;
  model.value.protocol.protocol_type = protocolType;
}

function resetProtocolDetailByType(protocolType: Api.Gateway.ProtocolType | null) {
  const nextProtocol = createDefaultProtocolModel();
  nextProtocol.protocol_type = protocolType;
  model.value.protocol = nextProtocol;
  previousModbusRegisterType.value = Number(nextProtocol.modbus.register_type);
}

function resetModel() {
  model.value = createDefaultModel();
  selectedGatewayOption.value = null;
  previousModbusRegisterType.value = 1;
}

function applyGatewayPreset(gateway: Api.Gateway.Gateway) {
  const protocolType = normalizeProtocolType(gateway.protocol_type);

  selectedGatewayOption.value = gateway;
  model.value.gateway_id = gateway.id;
  updateProtocolType(protocolType);
  resetProtocolDetailByType(protocolType);
}

function handleGatewaySelected(record: RemoteSelectRecord | RemoteSelectRecord[] | null) {
  const gateway = Array.isArray(record) ? record[0] : record;

  if (!gateway) {
    selectedGatewayOption.value = null;
    model.value.gateway_id = null;
    updateProtocolType(null);
    resetProtocolDetailByType(null);
    return;
  }

  applyGatewayPreset(gateway as Api.Gateway.Gateway);
}

function handleDeviceChange() {
  model.value.logic_point_id = null;
}

function clampModbusBitIndex(value: number) {
  if (!Number.isFinite(value)) return 0;

  return Math.min(15, Math.max(0, Math.trunc(value)));
}

function normalizeModbusByRules() {
  if (!isModbus.value) return;

  const { modbus } = model.value.protocol;
  const registerType = Number(modbus.register_type);
  const dataType = Number(modbus.data_type);
  const availableDataTypeValues = modbusDataTypeOptions.value.map(item => item.value);

  if (!availableDataTypeValues.includes(dataType)) {
    modbus.data_type = availableDataTypeValues[0] ?? 6;
  }

  if ([1, 2].includes(registerType)) {
    modbus.data_type = 6;
    modbus.bit_index = 0;
    modbus.byte_order = undefined;
    return;
  }

  if (![3, 4].includes(registerType)) return;

  if (Number(modbus.data_type) === 6) {
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
    [3, 4, 5].includes(Number(modbus.data_type)) &&
    !byteOrderOptions.some(item => item.value === modbus.byte_order)
  ) {
    modbus.byte_order = byteOrderOptions[0].value;
  }
}

function handleModbusRegisterTypeChange(registerType: number) {
  const prevRegisterType = Number(previousModbusRegisterType.value);
  const nextRegisterType = Number(registerType);
  const { modbus } = model.value.protocol;

  model.value.protocol.enable_linear_transform = false;

  if ([3, 4].includes(nextRegisterType) && [1, 2].includes(prevRegisterType) && Number(modbus.data_type) === 6) {
    modbus.data_type = 1;
  }

  previousModbusRegisterType.value = nextRegisterType;
  normalizeModbusByRules();
}

function handleModbusDataTypeChange(value: number) {
  if (value === 6) {
    model.value.protocol.scale = 0;
    model.value.protocol.offset = 0;
  }

  normalizeModbusByRules();
}

function handleOpcUaDataTypeChange(value: number) {
  if ([1, 5].includes(value)) {
    model.value.protocol.scale = 0;
    model.value.protocol.offset = 0;
  }
}

function handleEnableLinearTransformChange(value: boolean) {
  const defaultProtocol = createDefaultProtocolModel();

  if (value) {
    model.value.protocol.scale = 0.01176;
    model.value.protocol.offset = -1;
    if (isModbus.value) {
      model.value.protocol.modbus.register_type = 3;
      model.value.protocol.modbus.data_type = 5;
      model.value.protocol.modbus.byte_order = 2;
      previousModbusRegisterType.value = 3;
    }
    return;
  }

  model.value.protocol.scale = defaultProtocol.scale;
  model.value.protocol.offset = defaultProtocol.offset;

  if (!isModbus.value) return;

  model.value.protocol.modbus.register_type = defaultProtocol.modbus.register_type;
  model.value.protocol.modbus.data_type = defaultProtocol.modbus.data_type;
  model.value.protocol.modbus.byte_order = defaultProtocol.modbus.byte_order;
  previousModbusRegisterType.value = defaultProtocol.modbus.register_type;
}

function buildProtocolPayload(): Api.Device.PhysicalPointOperateProtocol {
  const protocolType = model.value.protocol_type as Api.Gateway.ProtocolType;
  const payload: Api.Device.PhysicalPointOperateProtocol = {
    access_level: model.value.protocol.access_level,
    offset: model.value.protocol.offset,
    protocol_type: protocolType,
    scale: model.value.protocol.scale
  };

  if (protocolType === 4) {
    const modbus = { ...model.value.protocol.modbus };
    const registerType = Number(modbus.register_type);
    const dataType = Number(modbus.data_type);

    if ([1, 2].includes(registerType)) {
      modbus.data_type = 6;
      modbus.bit_index = 0;
      delete modbus.byte_order;
    } else if ([3, 4].includes(registerType)) {
      if (dataType === 6) {
        modbus.bit_index = clampModbusBitIndex(modbus.bit_index);
        delete modbus.byte_order;
      } else if ([1, 2].includes(dataType)) {
        modbus.bit_index = 0;
        delete modbus.byte_order;
      } else if ([3, 4, 5].includes(dataType)) {
        modbus.bit_index = 0;
      }
    }

    payload.modbus = modbus;
  }

  if (protocolType === 5) {
    payload.bacnet = { ...model.value.protocol.bacnet };
  }

  if (protocolType === 6) {
    payload.opcua = { ...model.value.protocol.opcua };
  }

  return payload;
}

function buildSubmitParams(): Api.Device.CreatePhysicalPointParams {
  return {
    gateway_id: model.value.gateway_id as CommonType.IdType,
    physical_point_list: [
      {
        data_type: model.value.data_type,
        is_storage: model.value.is_storage,
        key: model.value.key,
        logic_point_id: model.value.logic_point_id,
        name: model.value.name,
        protocol: buildProtocolPayload()
      }
    ]
  };
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  startLoading();
  const { error } = await fetchCreatePhysicalPoint(buildSubmitParams()).finally(endLoading);
  if (error) return;

  window.$message?.success($t('common.addSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(
  () => model.value.protocol_type,
  () => {
    normalizeModbusByRules();
  }
);

watch(
  () => model.value.protocol.modbus.data_type,
  () => {
    normalizeModbusByRules();
  }
);

watch(visible, () => {
  if (!visible.value) return;

  resetModel();
  if (props.prefillGateway) {
    applyGatewayPreset(props.prefillGateway);
  }
  restoreValidation();
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="640" class="max-w-90%">
    <NDrawerContent title="新增物理点位" :native-scrollbar="false" closable>
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
          <NFormItemGi span="24" label="是否存储" path="is_storage">
            <NSwitch v-model:value="model.is_storage" />
          </NFormItemGi>
          <NFormItemGi v-if="showLinearTransform" span="24" label="线性转换" path="protocol.enable_linear_transform">
            <NSwitch
              v-model:value="model.protocol.enable_linear_transform"
              @update:value="handleEnableLinearTransformChange"
            />
          </NFormItemGi>
          <NFormItemGi span="24" label="设备" path="device_id">
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

        <div v-if="isModbus" class="protocol-config-panel protocol-config-panel--modbus">
          <div class="protocol-config-title">Modbus 参数</div>
          <NGrid responsive="screen" item-responsive :x-gap="16">
            <NFormItemGi span="24" label="从站地址" path="protocol.modbus.slave_id">
              <NInputNumber
                v-model:value="model.protocol.modbus.slave_id"
                class="w-full"
                :min="1"
                :max="247"
                :precision="0"
                placeholder="请输入从站地址"
              />
            </NFormItemGi>
            <NFormItemGi span="24" label="寄存器地址" path="protocol.modbus.address">
              <NInputNumber
                v-model:value="model.protocol.modbus.address"
                class="w-full"
                :min="0"
                :precision="0"
                placeholder="请输入寄存器地址"
              />
            </NFormItemGi>
            <NFormItemGi span="24" label="寄存器类型" path="protocol.modbus.register_type">
              <NSelect
                v-model:value="model.protocol.modbus.register_type"
                :options="modbusRegisterTypeOptions"
                placeholder="请选择寄存器类型"
                @update:value="handleModbusRegisterTypeChange"
              />
            </NFormItemGi>
            <NFormItemGi span="24" label="数据类型" path="protocol.modbus.data_type">
              <NSelect
                v-model:value="model.protocol.modbus.data_type"
                :options="modbusDataTypeOptions"
                :disabled="isModbusBitRegister"
                placeholder="请选择数据类型"
                @update:value="handleModbusDataTypeChange"
              />
            </NFormItemGi>
            <NFormItemGi span="24" label="位索引" path="protocol.modbus.bit_index">
              <NInputNumber
                v-model:value="model.protocol.modbus.bit_index"
                class="w-full"
                :min="0"
                :max="modbusBitIndexMax"
                :precision="0"
                :disabled="!canEditModbusBitIndex"
              />
            </NFormItemGi>
            <NFormItemGi v-if="showModbusByteOrder" span="24" label="字节序" path="protocol.modbus.byte_order">
              <NSelect
                v-model:value="model.protocol.modbus.byte_order"
                :options="byteOrderOptions"
                placeholder="请选择字节序"
              />
            </NFormItemGi>
          </NGrid>
        </div>

        <div v-if="isBacnet" class="protocol-config-panel protocol-config-panel--bacnet">
          <div class="protocol-config-title">BACnet 参数</div>
          <NGrid responsive="screen" item-responsive :x-gap="16">
            <NFormItemGi span="24" label="对象类型" path="protocol.bacnet.object_type">
              <NSelect
                v-model:value="model.protocol.bacnet.object_type"
                :options="bacnetObjectTypeOptions"
                placeholder="请选择对象类型"
              />
            </NFormItemGi>
            <NFormItemGi span="24" label="设备实例" path="protocol.bacnet.device_instance">
              <NInputNumber
                v-model:value="model.protocol.bacnet.device_instance"
                class="w-full"
                :min="1"
                :precision="0"
              />
            </NFormItemGi>
            <NFormItemGi span="24" label="对象实例" path="protocol.bacnet.object_instance">
              <NInputNumber
                v-model:value="model.protocol.bacnet.object_instance"
                class="w-full"
                :min="1"
                :precision="0"
              />
            </NFormItemGi>
          </NGrid>
        </div>

        <div v-if="isOpcUa" class="protocol-config-panel protocol-config-panel--opcua">
          <div class="protocol-config-title">OPC UA 参数</div>
          <NFormItem label="节点 ID" path="protocol.opcua.node_id">
            <NInput
              v-model:value="model.protocol.opcua.node_id"
              maxlength="50"
              show-count
              placeholder="请输入节点 ID"
            />
          </NFormItem>
          <NFormItem label="数据类型" path="protocol.opcua.data_type">
            <NSelect
              v-model:value="model.protocol.opcua.data_type"
              :options="opcUaDataTypeOptions"
              placeholder="请选择数据类型"
              @update:value="handleOpcUaDataTypeChange"
            />
          </NFormItem>
        </div>

        <template v-if="showLinearTransform">
          <NGrid responsive="screen" item-responsive :x-gap="16">
            <NFormItemGi span="24" label="缩放系数" path="protocol.scale">
              <NInputNumber v-model:value="model.protocol.scale" class="w-full" :min="0" />
            </NFormItemGi>
            <NFormItemGi span="24" label="偏移量" path="protocol.offset">
              <NInputNumber v-model:value="model.protocol.offset" class="w-full" />
            </NFormItemGi>
          </NGrid>
        </template>
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

<style scoped>
.protocol-config-panel {
  position: relative;
  overflow: hidden;
  margin-bottom: 18px;
  padding: 16px 16px 6px 18px;
  border-radius: 8px;
  border: 1px solid var(--n-border-color);
  background: var(--protocol-bg);
}

.protocol-config-panel::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;
  background: var(--protocol-color);
  content: '';
}

.protocol-config-panel--modbus {
  --protocol-color: #2080f0;
  --protocol-bg: rgba(32, 128, 240, 0.08);
}

.protocol-config-panel--bacnet {
  --protocol-color: #18a058;
  --protocol-bg: rgba(24, 160, 88, 0.08);
}

.protocol-config-panel--opcua {
  --protocol-color: #d03050;
  --protocol-bg: rgba(208, 48, 80, 0.08);
}

.protocol-config-title {
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--n-border-color);
  font-size: 13px;
  font-weight: 600;
}
</style>
