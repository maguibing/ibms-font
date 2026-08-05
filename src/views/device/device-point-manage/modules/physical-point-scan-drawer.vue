<script setup lang="ts">
import { computed, nextTick, reactive, ref, shallowRef, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchExportTask } from '@/service/api/common';
import { fetchScanPhysicalDevice, fetchScanPhysicalDevicePoint } from '@/service/api/device';
import { fetchGetGateway, fetchGetGatewayList } from '@/service/api/gateway';
import { useExportProgress } from '@/hooks/business/export-progress';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { ExportBizType, ExportFileType, PhysicalPointType } from '@/enum/business';
import { ACCESS_LEVEL_OPTIONS } from '@/constants/device-point';
import { getGatewayProtocolLabel } from '@/views/gateway/gateway-list/shared';
import { getWebSocketConnectionId } from '@/utils/websocket';
import PhysicalPointScanDeviceDetail from './physical-point-scan-device-detail.vue';
import PhysicalPointScanDeviceList from './physical-point-scan-device-list.vue';
import type {
  GatewayWithProtocol,
  RemoteSelectRecord,
  ScannedDevice,
  ScannedPhysicalPoint,
  ScanFormModel
} from './physical-point-scan-types';
import {
  getProtocolTagType,
  modbusRegisterTypeOptions,
  objectTypeOptions,
  opcUaDataTypeOptions,
  resolveProtocolType
} from './physical-point-shared';

defineOptions({
  name: 'PhysicalPointScanDrawer'
});

interface Props {
  prefillGateway?: Api.Gateway.Gateway | null;
}

const props = withDefaults(defineProps<Props>(), {
  prefillGateway: null
});

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, restoreValidation, validate } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const {
  loading: scanDeviceLoading,
  startLoading: startScanDeviceLoading,
  endLoading: endScanDeviceLoading
} = useLoading();
const { startExport, stopExport } = useExportProgress();

const selectedGateway = shallowRef<GatewayWithProtocol | null>(null);
const scannedDevice = shallowRef(false);
const scanResultList = ref<ScannedDevice[]>([]);
const scanPointLoadingMap = ref<Record<string, boolean>>({});
const deviceKeyword = shallowRef('');
const activeDeviceKey = shallowRef('');

const scanForm = reactive<ScanFormModel>({
  gateway_id: null,
  modbus: {
    end_slave_id: 1,
    register_type: 1,
    start_slave_id: 1
  },
  modbus_point: {
    count: 10,
    start_register_address: 1
  },
  opcua: {
    max_depth: 10,
    max_devices: 100
  },
  opcua_point: {
    max_depth: 100,
    max_points_per_node: 1000
  },
  bacnet: {
    interface_name: '',
    timeout: 10
  }
});

const gatewayRequestParams: CommonType.CommonListQueryParams = {
  options: [{ key: 1 }, { key: 2 }],
  list_option: {
    options: [
      { type: 104, value: '101' },
      { type: 7, value: '4,5,6' }
    ]
  }
};

const selectedGatewayOptions = computed(() => selectedGateway.value);

const selectedProtocolType = computed(() => {
  const protocol = selectedGateway.value?.protocol_type ?? selectedGateway.value?.protocol?.protocol_type;

  return resolveProtocolType(protocol);
});

const isModbusProtocol = computed(() => selectedProtocolType.value === 4);
const isBacnetProtocol = computed(() => selectedProtocolType.value === 5);
const isOpcUaProtocol = computed(() => selectedProtocolType.value === 6);
const isSupportedScanProtocol = computed(() => [4, 5, 6].includes(Number(selectedProtocolType.value)));
const hasGatewaySelected = computed(() => {
  const gatewayId = Number(scanForm.gateway_id);

  return Number.isFinite(gatewayId) && gatewayId > 0;
});

const scanButtonDisabled = computed(
  () => !hasGatewaySelected.value || !isSupportedScanProtocol.value || scanDeviceLoading.value
);

const rules = computed<Record<string, App.Global.FormRule | App.Global.FormRule[]>>(() => {
  const formRules: Record<string, App.Global.FormRule | App.Global.FormRule[]> = {
    gateway_id: createRequiredRule('请选择边缘设备')
  };

  if (isModbusProtocol.value) {
    formRules['modbus.start_slave_id'] = createRequiredRule('请输入起始从站地址');
    formRules['modbus.end_slave_id'] = createRequiredRule('请输入结束从站地址');
    formRules['modbus.register_type'] = createRequiredRule('请选择寄存器类型');
  }

  if (isOpcUaProtocol.value) {
    formRules['opcua.max_depth'] = createRequiredRule('请输入最大深度');
    formRules['opcua.max_devices'] = createRequiredRule('请输入最大设备数');
  }

  return formRules;
});

const filteredDeviceList = computed(() => {
  const keyword = deviceKeyword.value.trim().toLowerCase();
  if (!keyword) return scanResultList.value;

  return scanResultList.value.filter(item => {
    const name = item.name.toLowerCase();
    const address = item.address.toLowerCase();
    const deviceInstance = String(item.deviceInstance).toLowerCase();

    return name.includes(keyword) || address.includes(keyword) || deviceInstance.includes(keyword);
  });
});

const activeDevice = computed(() => scanResultList.value.find(item => item.scanKey === activeDeviceKey.value) ?? null);
const activeDevicePointLoading = computed(() =>
  Boolean(activeDevice.value && scanPointLoadingMap.value[activeDevice.value.scanKey])
);

const totalDeviceCount = computed(() => scanResultList.value.length);
const activeDevicePointCountText = computed(() => {
  if (!activeDevice.value?.pointScanned) return '未扫描';

  return `${activeDevice.value.pointList.length} 个点位`;
});

const selectedProtocolLabel = computed(() => getGatewayProtocolLabel(selectedProtocolType.value));

const selectedProtocolTagType = computed(() => getProtocolTagType(selectedProtocolType.value));

const accessLevelLabelMap = computed(() => {
  const map = new Map<number, string>();

  ACCESS_LEVEL_OPTIONS.forEach(item => map.set(Number(item.value), String(item.label)));

  return map;
});

const objectTypeLabelMap = computed(() => {
  const map = new Map<number, string>();

  objectTypeOptions.forEach(item => map.set(Number(item.value), item.label));

  return map;
});

const opcUaDataTypeLabelMap = computed(() => {
  const map = new Map<number, string>();

  opcUaDataTypeOptions.forEach(item => map.set(Number(item.value), item.label));

  return map;
});

const pointTableScrollX = computed(() => {
  if (isOpcUaProtocol.value) return 1080;
  if (isModbusProtocol.value) return 980;

  return 960;
});

const pointColumns = computed<NaiveUI.TableColumn<ScannedPhysicalPoint>[]>(() => {
  const columns: NaiveUI.TableColumn<ScannedPhysicalPoint>[] = [
    {
      key: 'name',
      title: '点位名称',
      align: 'center',
      fixed: 'left',
      minWidth: 180,
      ellipsis: { tooltip: true },
      render: row => row.name || '-'
    },
    {
      key: 'key',
      title: '点位标识',
      align: 'center',
      minWidth: 180,
      ellipsis: { tooltip: true },
      render: row => row.key || '-'
    }
  ];

  if (isBacnetProtocol.value) {
    columns.push(
      {
        key: 'accessLevel',
        title: '访问级别',
        align: 'center',
        width: 110,
        render: row => getAccessLevelLabel(row.accessLevel)
      },
      {
        key: 'objectType',
        title: '对象类型',
        align: 'center',
        width: 110,
        render: row => getObjectTypeLabel(row.objectType)
      },
      {
        key: 'objectInstance',
        title: '对象实例',
        align: 'center',
        width: 110,
        render: row => row.objectInstance
      }
    );
  }

  if (isModbusProtocol.value) {
    columns.push(
      {
        key: 'modbusSlaveId',
        title: '从站地址',
        align: 'center',
        width: 110,
        render: row => row.modbusSlaveId
      },
      {
        key: 'modbusRegisterType',
        title: '寄存器类型',
        align: 'center',
        width: 130,
        render: row => getRegisterTypeLabel(row.modbusRegisterType)
      },
      {
        key: 'modbusRegisterAddress',
        title: '寄存器地址',
        align: 'center',
        width: 120,
        render: row => row.modbusRegisterAddress
      },
      {
        key: 'accessLevel',
        title: '访问级别',
        align: 'center',
        width: 110,
        render: row => getAccessLevelLabel(row.accessLevel)
      }
    );
  }

  if (isOpcUaProtocol.value) {
    columns.push(
      {
        key: 'accessLevel',
        title: '访问级别',
        align: 'center',
        width: 110,
        render: row => getAccessLevelLabel(row.accessLevel)
      },
      {
        key: 'opcUaNodeId',
        title: '节点 ID',
        align: 'center',
        minWidth: 320,
        ellipsis: { tooltip: true },
        render: row => row.opcUaNodeId
      },
      {
        key: 'opcUaDataType',
        title: '数据类型',
        align: 'center',
        width: 150,
        render: row => getOpcUaDataTypeLabel(row.opcUaDataType)
      }
    );
  }

  columns.push(
    {
      key: 'value',
      title: '当前值',
      align: 'center',
      width: 110,
      ellipsis: { tooltip: true },
      render: row => row.value
    },
    {
      key: 'desc',
      title: '描述',
      align: 'center',
      minWidth: 180,
      ellipsis: { tooltip: true },
      render: row => row.desc || '-'
    }
  );

  return columns;
});

function getAccessLevelLabel(value: number) {
  return accessLevelLabelMap.value.get(Number(value)) || '-';
}

function getObjectTypeLabel(value: number) {
  return objectTypeLabelMap.value.get(Number(value)) || '-';
}

function getRegisterTypeLabel(value: number | null) {
  return modbusRegisterTypeOptions.find(item => Number(item.value) === Number(value))?.label || '-';
}

function getOpcUaDataTypeLabel(value: number) {
  return opcUaDataTypeLabelMap.value.get(Number(value)) || '-';
}

function resetModbusForm() {
  scanForm.modbus.end_slave_id = 1;
  scanForm.modbus.register_type = 1;
  scanForm.modbus.start_slave_id = 1;
  scanForm.modbus_point.count = 10;
  scanForm.modbus_point.start_register_address = 1;
}

function resetBacnetForm() {
  scanForm.bacnet.interface_name = '';
  scanForm.bacnet.timeout = 10;
}

function resetOpcUaForm() {
  scanForm.opcua.max_depth = 10;
  scanForm.opcua.max_devices = 100;
  scanForm.opcua_point.max_depth = 100;
  scanForm.opcua_point.max_points_per_node = 1000;
}

function resetProtocolForms() {
  resetModbusForm();
  resetBacnetForm();
  resetOpcUaForm();
}

function resetScanResult() {
  scannedDevice.value = false;
  scanResultList.value = [];
  scanPointLoadingMap.value = {};
  deviceKeyword.value = '';
  activeDeviceKey.value = '';
}

function resetDrawerState() {
  selectedGateway.value = null;
  scanForm.gateway_id = null;
  resetProtocolForms();
  resetScanResult();
}

function getGatewayId(gatewayId: unknown) {
  const id = Number(gatewayId);

  return Number.isFinite(id) && id > 0 ? id : null;
}

function applyGatewayRecord(gateway: GatewayWithProtocol) {
  const gatewayId = getGatewayId(gateway.id);
  if (!gatewayId) return false;

  selectedGateway.value = {
    ...gateway,
    id: gatewayId
  };
  scanForm.gateway_id = gatewayId;
  resetProtocolForms();
  resetScanResult();

  return true;
}

function fillModbusFromGatewayDetail(gateway: GatewayWithProtocol) {
  const modbus = gateway.protocol?.modbus || {};
  const endSlaveId = Number(modbus.end_slave_id);

  if (Number.isFinite(endSlaveId)) {
    scanForm.modbus.end_slave_id = endSlaveId;
  }

  const startSlaveId = Number(modbus.start_slave_id);
  if (Number.isFinite(startSlaveId)) {
    scanForm.modbus.start_slave_id = startSlaveId;
  }

  const registerType = Number(modbus.register_type);
  if (modbusRegisterTypeOptions.some(item => Number(item.value) === registerType)) {
    scanForm.modbus.register_type = registerType;
    handleRegisterTypeChange(registerType);
  }
}

function fillBacnetFromGatewayDetail(gateway: GatewayWithProtocol) {
  const bacnet = gateway.protocol?.bacnet || {};
  const ip = bacnet.ip || {};
  const interfaceName = String(ip.interface_name || '');
  const localAddr = String(ip.local_addr || '');

  scanForm.bacnet.interface_name = localAddr ? `${interfaceName}(${localAddr})` : interfaceName;

  const timeout = Number(bacnet.timeout ?? bacnet.timeout_seconds ?? 3);
  scanForm.bacnet.timeout = Number.isFinite(timeout) && timeout > 0 ? timeout : 3;
}

function fillProtocolFormByDetail(gateway: GatewayWithProtocol) {
  if (isModbusProtocol.value) {
    fillModbusFromGatewayDetail(gateway);
    return;
  }

  if (isBacnetProtocol.value) {
    fillBacnetFromGatewayDetail(gateway);
  }
}

async function loadGatewayDetail(gatewayId: number) {
  const { data, error } = await fetchGetGateway({
    id: gatewayId,
    options: [{ key: 1 }, { key: 2 }]
  });

  if (error) {
    window.$message?.error('边缘设备详情获取失败');
    return;
  }

  const detailGateway = data.gateway as GatewayWithProtocol;
  const detailGatewayId = getGatewayId(detailGateway.id) ?? gatewayId;

  selectedGateway.value = selectedGateway.value
    ? ({
        ...selectedGateway.value,
        ...detailGateway,
        id: detailGatewayId
      } as GatewayWithProtocol)
    : ({
        ...detailGateway,
        id: detailGatewayId
      } as GatewayWithProtocol);

  fillProtocolFormByDetail(selectedGateway.value);
}

async function handleGatewaySelected(record: RemoteSelectRecord | RemoteSelectRecord[] | null) {
  const gateway = Array.isArray(record) ? record[0] : record;

  if (!gateway) {
    selectedGateway.value = null;
    scanForm.gateway_id = null;
    resetProtocolForms();
    resetScanResult();
    return;
  }

  if (!applyGatewayRecord(gateway as GatewayWithProtocol)) return;

  await loadGatewayDetail(Number(scanForm.gateway_id));
  await nextTick();
  restoreValidation();
}

function buildScanPayload(): Api.Device.ScanPhysicalDeviceParams {
  const payload: Api.Device.ScanPhysicalDeviceParams = {
    gateway_id: Number(scanForm.gateway_id)
  };

  if (isModbusProtocol.value) {
    payload.modbus = {
      end_slave_id: Number(scanForm.modbus.end_slave_id),
      register_type: Number(scanForm.modbus.register_type),
      start_slave_id: Number(scanForm.modbus.start_slave_id)
    };
  }

  if (isBacnetProtocol.value) {
    payload.bacnet = {
      interface_name: scanForm.bacnet.interface_name,
      timeout: Number(scanForm.bacnet.timeout)
    };
  }

  if (isOpcUaProtocol.value) {
    payload.opcua = {
      max_depth: Number(scanForm.opcua.max_depth),
      max_devices: Number(scanForm.opcua.max_devices)
    };
  }

  return payload;
}

function normalizeScanResultList(response?: Api.Device.ScanPhysicalDeviceResponse | null) {
  const rawList = response?.devices ?? response?.list;
  if (!Array.isArray(rawList)) return [];

  return rawList.map((item, index) => {
    const displayName = String(item.display_name || item.name || `设备 ${index + 1}`);
    const address = String(item.address || '-');
    const protocol = item.protocol_type ?? item.protocol ?? selectedProtocolType.value ?? '';
    const deviceInstance = item.bacnet?.device_instance;

    return {
      ...item,
      address,
      deviceInstance: deviceInstance ?? '-',
      devicePointList: [],
      name: displayName,
      pointList: [],
      pointScanned: false,
      protocol,
      scanKey: `${protocol}-${address}-${displayName}-${index}`
    };
  });
}

function normalizeNumberField(value: unknown, fallback = 0) {
  const normalized = Number(value);

  return Number.isFinite(normalized) ? normalized : fallback;
}

function normalizeStringField(value: unknown, fallback = '-') {
  if (value === undefined || value === null || value === '') return fallback;

  return String(value);
}

function normalizePoint(point: Api.Device.ScanPhysicalPointItem, index: number): ScannedPhysicalPoint {
  const bacnet = point.bacnet || {};
  const modbus = point.modbus || {};
  const opcua = point.opcua || {};
  const pointKey = normalizeStringField(point.key, 'point');

  return {
    accessLevel: normalizeNumberField(point.access_level, 1),
    desc: normalizeStringField(point.desc, ''),
    key: normalizeStringField(point.key, ''),
    modbusRegisterAddress: normalizeStringField(modbus.register_address),
    modbusRegisterType: normalizeNumberField(modbus.register_type),
    modbusSlaveId: normalizeStringField(modbus.slave_id),
    name: normalizeStringField(point.name, ''),
    objectInstance: normalizeStringField(bacnet.object_instance),
    objectType: normalizeNumberField(bacnet.object_type),
    opcUaDataType: normalizeNumberField(opcua.data_type),
    opcUaNodeId: normalizeStringField(opcua.node_id),
    pointKey: `${pointKey}-${index}`,
    value: normalizeStringField(point.value)
  };
}

function getBacnetLocalInterface() {
  const raw = scanForm.bacnet.interface_name.trim();
  if (!raw) return '';

  const match = raw.match(/^(.+?)\s*\(/);

  return match?.[1] || raw;
}

function validateModbusPointScanForm() {
  if (!isModbusProtocol.value) return true;

  const startRegisterAddress = Number(scanForm.modbus_point.start_register_address);
  if (!Number.isFinite(startRegisterAddress) || startRegisterAddress < 0) {
    window.$message?.warning('请输入正确的起始寄存器地址');
    return false;
  }

  const count = Number(scanForm.modbus_point.count);
  if (!Number.isFinite(count) || count <= 0) {
    window.$message?.warning('请输入正确的点位数量');
    return false;
  }

  return true;
}

function validateOpcUaPointScanForm() {
  if (!isOpcUaProtocol.value) return true;

  const maxPointsPerNode = Number(scanForm.opcua_point.max_points_per_node);
  if (!Number.isFinite(maxPointsPerNode) || maxPointsPerNode <= 0) {
    window.$message?.warning('请输入正确的每节点最大点位数');
    return false;
  }

  return true;
}

function normalizeOpcUaNodeIdList(opcUaNodeId: unknown) {
  if (Array.isArray(opcUaNodeId)) {
    return opcUaNodeId.map(item => String(item ?? '').trim()).filter(Boolean);
  }

  const normalizedNodeId = String(opcUaNodeId ?? '').trim();

  return normalizedNodeId ? [normalizedNodeId] : [];
}

function buildScanPointPayload(
  deviceInstance: number,
  modbusSlaveId: number,
  opcUaNodeId: unknown
): Api.Device.ScanPhysicalDevicePointParams | null {
  const payload: Api.Device.ScanPhysicalDevicePointParams = {
    gateway_id: Number(scanForm.gateway_id)
  };

  if (isBacnetProtocol.value) {
    payload.bacnet = {
      device_instance_list: [Number.isFinite(deviceInstance) ? deviceInstance : 0],
      local_interface: getBacnetLocalInterface()
    };
  }

  if (isModbusProtocol.value) {
    if (!Number.isFinite(modbusSlaveId)) {
      window.$message?.warning('缺少从站地址');
      return null;
    }

    payload.modbus = {
      count: Number(scanForm.modbus_point.count),
      register_type: Number(scanForm.modbus.register_type),
      slave_id: modbusSlaveId,
      start_register_address: Number(scanForm.modbus_point.start_register_address)
    };
  }

  if (isOpcUaProtocol.value) {
    const nodeIdList = normalizeOpcUaNodeIdList(opcUaNodeId);
    if (nodeIdList.length === 0) {
      window.$message?.warning('缺少节点 ID');
      return null;
    }

    payload.opcua = {
      max_depth: Number(scanForm.opcua_point.max_depth ?? 0),
      max_points_per_node: Number(scanForm.opcua_point.max_points_per_node),
      node_id_list: nodeIdList
    };
  }

  return payload;
}

function getMatchedPointGroup(
  groups: Api.Device.ScanPhysicalDevicePointGroup[],
  matchParams: {
    deviceInstance: number;
    modbusSlaveId: number;
    opcUaNodeId: unknown;
  }
) {
  const { deviceInstance, modbusSlaveId, opcUaNodeId } = matchParams;

  if (isBacnetProtocol.value) {
    return groups.find(item => Number(item.device?.bacnet?.device_instance) === deviceInstance) || groups[0];
  }

  if (isModbusProtocol.value) {
    return groups.find(item => Number(item.device?.modbus?.slave_id) === modbusSlaveId) || groups[0];
  }

  if (isOpcUaProtocol.value) {
    const nodeIdList = normalizeOpcUaNodeIdList(opcUaNodeId);

    return (
      groups.find(item => {
        const groupNodeId = String(item.device?.opcua?.node_id ?? '').trim();

        return nodeIdList.includes(groupNodeId);
      }) || groups[0]
    );
  }

  return groups[0];
}

async function handleScanPoint(device: ScannedDevice) {
  if (scanPointLoadingMap.value[device.scanKey]) return;
  if (!validateModbusPointScanForm()) return;
  if (!validateOpcUaPointScanForm()) return;

  const deviceInstance = Number(device.bacnet?.device_instance ?? device.deviceInstance ?? 0);
  const modbusSlaveId = Number(device.modbus?.slave_id);
  const opcUaNodeId = device.opcua?.node_id;
  const payload = buildScanPointPayload(deviceInstance, modbusSlaveId, opcUaNodeId);
  if (!payload) return;

  device.pointList = [];
  device.devicePointList = [];
  device.pointScanned = false;
  scanPointLoadingMap.value = {
    ...scanPointLoadingMap.value,
    [device.scanKey]: true
  };

  const { data, error } = await fetchScanPhysicalDevicePoint(payload).finally(() => {
    scanPointLoadingMap.value = {
      ...scanPointLoadingMap.value,
      [device.scanKey]: false
    };
  });

  if (error) {
    device.devicePointList = [];
    device.pointList = [];
    device.pointScanned = false;
    window.$message?.error('扫描点位失败');
    return;
  }

  const groups = Array.isArray(data?.device_points) ? data.device_points : [];
  const matchedGroup = getMatchedPointGroup(groups, {
    deviceInstance,
    modbusSlaveId,
    opcUaNodeId
  });
  const points = Array.isArray(matchedGroup?.points) ? matchedGroup.points : [];
  const groupDevice = matchedGroup?.device ?? {};

  device.devicePointList = groups;
  device.pointList = points.map((point, index) => normalizePoint(point, index));
  device.pointScanned = true;
  device.name = String(groupDevice.display_name || groupDevice.name || device.name);
  device.address = String(groupDevice.address || device.address);
  device.protocol = groupDevice.protocol_type ?? device.protocol;
  device.deviceInstance = groupDevice.bacnet?.device_instance ?? device.deviceInstance;

  if (isModbusProtocol.value) {
    device.modbus = {
      ...device.modbus,
      ...groupDevice.modbus
    };
  }

  window.$message?.success('扫描点位成功');
}

function handleDeviceSelect(device: ScannedDevice) {
  if (activeDeviceKey.value === device.scanKey) return;

  activeDeviceKey.value = device.scanKey;
}

async function handleScanDevice() {
  try {
    await validate();
  } catch {
    return;
  }

  if (!isSupportedScanProtocol.value) {
    window.$message?.warning('当前协议不支持扫描');
    return;
  }

  const payload = buildScanPayload();
  if (!payload.gateway_id || Number.isNaN(payload.gateway_id)) {
    window.$message?.warning('请选择有效的边缘设备');
    return;
  }

  startScanDeviceLoading();
  scannedDevice.value = true;
  scanResultList.value = [];
  activeDeviceKey.value = '';

  const { data, error } = await fetchScanPhysicalDevice(payload).finally(endScanDeviceLoading);

  if (error) {
    scanResultList.value = [];
    activeDeviceKey.value = '';
    return;
  }

  scanResultList.value = normalizeScanResultList(data);
  activeDeviceKey.value = scanResultList.value[0]?.scanKey ?? '';
  window.$message?.success('扫描设备成功');
}

async function handleExportPoint() {
  const connectionId = getWebSocketConnectionId();
  if (!connectionId) {
    window.$message?.warning('WebSocket 尚未连接，请稍后重试');
    return;
  }

  const gatewayId = Number(scanForm.gateway_id);
  if (!Number.isFinite(gatewayId) || gatewayId <= 0) {
    window.$message?.warning('请选择有效的边缘设备');
    return;
  }

  const devicePoints = activeDevice.value?.devicePointList ?? [];
  if (!activeDevice.value?.pointScanned || devicePoints.length === 0) {
    window.$message?.warning('请先扫描点位');
    return;
  }

  startExport('扫描点位');

  const { error } = await fetchExportTask({
    connection_id: connectionId,
    export_biz_type: ExportBizType.PhysicalPoint,
    file_type: ExportFileType.Excel,
    list_option: {},
    physical_point: {
      scan: {
        device_points: devicePoints,
        gateway_id: gatewayId
      },
      source: PhysicalPointType.ScanResult
    }
  });

  if (error) {
    stopExport();
    return;
  }

  window.$message?.success('导出任务已提交');
}

function handleRegisterTypeChange(value: number | null) {
  if (value === 1) {
    scanForm.modbus_point.start_register_address = 1;
  } else if (value === 2) {
    scanForm.modbus_point.start_register_address = 10001;
  } else if (value === 3) {
    scanForm.modbus_point.start_register_address = 40001;
  } else if (value === 4) {
    scanForm.modbus_point.start_register_address = 30001;
  }
}

function closeDrawer() {
  visible.value = false;
}

watch(visible, async value => {
  if (!value) return;

  resetDrawerState();

  if (props.prefillGateway && applyGatewayRecord(props.prefillGateway as GatewayWithProtocol)) {
    await loadGatewayDetail(Number(scanForm.gateway_id));
  }

  await nextTick();
  restoreValidation();
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="1200" class="max-w-95%">
    <NDrawerContent title="扫描点位" :native-scrollbar="false" closable body-content-class="h-full">
      <div class="scan-drawer h-full min-h-0 flex-col-stretch gap-12px">
        <NSpin :show="scanDeviceLoading">
          <NForm ref="formRef" :model="scanForm" :rules="rules" label-placement="top" :show-feedback="false">
            <NFormItem label="边缘设备" path="gateway_id" show-feedback>
              <div class="w-full flex items-center gap-12px">
                <RemoteSearchSelect
                  v-model:value="scanForm.gateway_id"
                  :request="fetchGetGatewayList"
                  :request-params="gatewayRequestParams"
                  :selected-options="selectedGatewayOptions"
                  :search-type="1"
                  label-field="name"
                  value-field="id"
                  class="min-w-0 flex-1"
                  placeholder="请选择边缘设备"
                  @selected-change="handleGatewaySelected"
                />
                <NButton
                  type="primary"
                  :disabled="scanButtonDisabled"
                  :loading="scanDeviceLoading"
                  class="shrink-0"
                  @click="handleScanDevice"
                >
                  <template #icon>
                    <SvgIcon icon="material-symbols:radar" class="text-icon" />
                  </template>
                  扫描设备
                </NButton>
              </div>
            </NFormItem>

            <div
              v-if="hasGatewaySelected"
              class="mb-12px rounded-8px border border-[var(--scan-params-border-color)] border-solid bg-[var(--scan-params-bg-color)] p-12px"
            >
              <div class="mb-12px flex items-center justify-between gap-12px">
                <span class="text-14px font-600">扫描参数</span>
                <NTag size="small" :type="selectedProtocolTagType" :bordered="false">
                  {{ selectedProtocolLabel }}
                </NTag>
              </div>

              <NGrid v-if="isModbusProtocol" responsive="screen" item-responsive :x-gap="16">
                <NFormItemGi span="24 s:8" label="起始从站地址" path="modbus.start_slave_id">
                  <NInputNumber
                    v-model:value="scanForm.modbus.start_slave_id"
                    class="w-full"
                    :min="1"
                    :max="247"
                    :precision="0"
                  />
                </NFormItemGi>
                <NFormItemGi span="24 s:8" label="结束从站地址" path="modbus.end_slave_id">
                  <NInputNumber
                    v-model:value="scanForm.modbus.end_slave_id"
                    class="w-full"
                    :min="1"
                    :max="247"
                    :precision="0"
                  />
                </NFormItemGi>
                <NFormItemGi span="24 s:8" label="寄存器类型" path="modbus.register_type">
                  <NSelect
                    v-model:value="scanForm.modbus.register_type"
                    :options="modbusRegisterTypeOptions"
                    @update:value="handleRegisterTypeChange"
                  />
                </NFormItemGi>
              </NGrid>

              <NGrid v-else-if="isBacnetProtocol" responsive="screen" item-responsive :x-gap="16">
                <NFormItemGi span="24 s:12" label="本地网卡" path="bacnet.interface_name">
                  <NInput :value="scanForm.bacnet.interface_name" disabled />
                </NFormItemGi>
                <NFormItemGi span="24 s:12" label="超时时间（秒）" path="bacnet.timeout">
                  <NInputNumber v-model:value="scanForm.bacnet.timeout" class="w-full" disabled />
                </NFormItemGi>
              </NGrid>

              <NGrid v-else-if="isOpcUaProtocol" responsive="screen" item-responsive :x-gap="16">
                <NFormItemGi span="24 s:12" label="最大深度" path="opcua.max_depth">
                  <NInputNumber
                    v-model:value="scanForm.opcua.max_depth"
                    class="w-full"
                    :min="1"
                    :max="1000"
                    :precision="0"
                  />
                </NFormItemGi>
                <NFormItemGi span="24 s:12" label="最大设备数" path="opcua.max_devices">
                  <NInputNumber
                    v-model:value="scanForm.opcua.max_devices"
                    class="w-full"
                    :min="1"
                    :max="1000"
                    :precision="0"
                  />
                </NFormItemGi>
              </NGrid>

              <NText v-else depth="3">当前协议暂无扫描参数</NText>
            </div>
          </NForm>
        </NSpin>

        <div class="text-14px font-600">扫描结果</div>

        <div
          class="scan-result-wrapper box-border h-[clamp(460px,calc(100vh-360px),620px)] max-h-[calc(100vh-260px)] min-h-460px overflow-hidden rounded-8px"
        >
          <NEmpty v-if="!scannedDevice" description="请选择边缘设备后开始扫描" class="h-full justify-center" />
          <NEmpty v-else-if="scanResultList.length === 0" description="暂无扫描设备" class="h-full justify-center" />

          <div
            v-else
            class="scan-result-layout h-full min-h-0 grid grid-cols-[minmax(240px,3fr)_minmax(0,7fr)] gap-12px"
          >
            <PhysicalPointScanDeviceList
              v-model:keyword="deviceKeyword"
              :active-device-key="activeDeviceKey"
              :filtered-device-list="filteredDeviceList"
              :is-bacnet-protocol="isBacnetProtocol"
              :is-modbus-protocol="isModbusProtocol"
              :is-opc-ua-protocol="isOpcUaProtocol"
              :total-device-count="totalDeviceCount"
              @select="handleDeviceSelect"
            />

            <PhysicalPointScanDeviceDetail
              v-model:modbus-start-register-address="scanForm.modbus_point.start_register_address"
              v-model:modbus-point-count="scanForm.modbus_point.count"
              v-model:opc-ua-max-points-per-node="scanForm.opcua_point.max_points_per_node"
              v-model:opc-ua-max-depth="scanForm.opcua_point.max_depth"
              :active-device="activeDevice"
              :active-device-point-count-text="activeDevicePointCountText"
              :active-device-point-loading="activeDevicePointLoading"
              :is-bacnet-protocol="isBacnetProtocol"
              :is-modbus-protocol="isModbusProtocol"
              :is-opc-ua-protocol="isOpcUaProtocol"
              :point-columns="pointColumns"
              :point-table-scroll-x="pointTableScrollX"
              :register-type-label="getRegisterTypeLabel(scanForm.modbus.register_type)"
              @scan-point="handleScanPoint"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <NSpace justify="end">
          <NButton type="primary" @click="handleExportPoint">
            <template #icon>
              <icon-material-symbols-download-rounded class="text-icon" />
            </template>
            导出点位
          </NButton>
          <NButton @click="closeDrawer">关闭</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.scan-drawer {
  --scan-params-border-color: rgb(148 163 184 / 22%);
  --scan-params-bg-color: rgb(var(--primary-color, 32 128 240) / 5%);
}

@media (max-width: 900px) {
  .scan-result-wrapper {
    height: auto;
    max-height: none;
    overflow: visible;
  }

  .scan-result-layout {
    grid-template-columns: 1fr;
  }
}

:global(.dark) .scan-drawer {
  --scan-params-border-color: rgb(var(--primary-color, 32 128 240) / 34%);
  --scan-params-bg-color: rgb(var(--primary-color, 32 128 240) / 12%);
}
</style>
