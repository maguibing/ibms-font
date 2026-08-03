<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import {
  fetchCreateGateway,
  fetchGetGateway,
  fetchListIothubNetworkInterface,
  fetchUpdateGateway
} from '@/service/api/gateway';
import { fetchGetSpaceTrees } from '@/service/api/space';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { GATEWAY_PROTOCOL_OPTIONS, dataFormatOptions, opcUaAuthTypeOptions, opcUaSecurityModeOptions } from '../shared';
import GatewayHttpClientConfig from './gateway-http-client-config.vue';
import {
  createGatewayHttpClientModel,
  createGatewayHttpClientRouteParams,
  gatewayHttpClientKeyValueRowsToMap
} from './gateway-http-client-config';

defineOptions({
  name: 'GatewayOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowId?: CommonType.IdType | null;
}

interface Emits {
  (e: 'submitted'): void;
}

const props = withDefaults(defineProps<Props>(), {
  rowId: null
});
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createNumberRequiredRule, createRequiredRule } = useFormRules();
const { loading: spaceLoading, startLoading: startSpaceLoading, endLoading: endSpaceLoading } = useLoading();
const {
  loading: networkInterfaceLoading,
  startLoading: startNetworkInterfaceLoading,
  endLoading: endNetworkInterfaceLoading
} = useLoading();
const { loading: detailLoading, startLoading: startDetailLoading, endLoading: endDetailLoading } = useLoading();
const { loading: submitLoading, startLoading: startSubmitLoading, endLoading: endSubmitLoading } = useLoading();

const spaceData = ref<Api.Space.Space[]>([]);
const networkInterfaceOptions = ref<CommonType.Option<string, string>[]>([]);
const expandedKeys = ref<CommonType.IdType[]>([]);
const model = ref<Api.Gateway.GatewayOperateDrawerModel>(createDefaultModel());
const detailProtocol = ref<Api.Gateway.GatewayCreateProtocol | null>(null);
const editingLoaded = ref(false);

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增边缘设备',
    edit: '编辑边缘设备'
  };

  return titles[props.operateType];
});
const isEdit = computed(() => props.operateType === 'edit');
const confirmDisabled = computed(() => isEdit.value && !editingLoaded.value);

const statusOptions: CommonType.Option<Api.Gateway.GatewayStatus, string>[] = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 2 }
];

const isHttpServer = computed(() => model.value.protocol_type === 2);
const isHttpClient = computed(() => model.value.protocol_type === 3);
const isModbus = computed(() => model.value.protocol_type === 4);
const isMqtt = computed(() => model.value.protocol_type === 1);
const isBacnet = computed(() => model.value.protocol_type === 5);
const isOpcUa = computed(() => model.value.protocol_type === 6);
const isOpcUaSecureMode = computed(() => [2, 3].includes(model.value.opcua.security_policy.mode));
const isOpcUaUsernameAuthMode = computed(() => model.value.opcua.authentication.auth_type === 2);
const showDataFormat = computed(
  () => isHttpServer.value || isHttpClient.value || isMqtt.value || isModbus.value || isBacnet.value || isOpcUa.value
);
const dataFormatDisabled = computed(() => isMqtt.value || isModbus.value || isBacnet.value || isOpcUa.value);

const rules: Record<string, App.Global.FormRule | App.Global.FormRule[]> = {
  'bacnet.ip.interface_name': createRequiredRule('请选择目标地址'),
  'bacnet.ip.local_port': createNumberRequiredRule('请输入目标端口'),
  name: createRequiredRule('请输入边缘设备名称'),
  protocol_type: createRequiredRule('请选择协议'),
  'modbus.tcp.host': [
    createRequiredRule('请输入IP地址'),
    {
      pattern: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      message: '请输入正确的IP地址',
      trigger: ['input', 'blur']
    }
  ],
  'modbus.tcp.port': createNumberRequiredRule('请输入端口'),
  'opcua.authentication.auth_type': createRequiredRule('请选择认证类型'),
  'opcua.authentication.user_auth.password': createRequiredRule('请输入密码'),
  'opcua.authentication.user_auth.username': createRequiredRule('请输入用户名'),
  'opcua.endpoint_url': createRequiredRule('请输入服务端地址'),
  'opcua.security_policy.policy_uri': createRequiredRule('请输入安全策略 URI')
};

function createDefaultModel(): Api.Gateway.GatewayOperateDrawerModel {
  return {
    bacnet: {
      ip: {
        interface_name: '',
        local_port: 47808
      },
      poll_interval: 5,
      timeout: 5
    },
    data_format: 2,
    desc: '',
    http_client: createGatewayHttpClientModel(),
    key: '',
    modbus: {
      poll_interval: 5,
      tcp: {
        host: '',
        port: 502
      },
      timeout: 10
    },
    name: '',
    opcua: {
      authentication: {
        auth_type: 1,
        user_auth: {
          password: '',
          username: ''
        }
      },
      endpoint_url: '',
      is_auto_discovery: true,
      is_subscription: true,
      poll_interval: 5,
      request_timeout: 10,
      security_policy: {
        mode: 1,
        policy_uri: ''
      },
      session_timeout: 10,
      timeout: 10
    },
    p_key: '',
    password: '',
    protocol_type: 1,
    space_id: null,
    status: 1,
    username: ''
  };
}

function createNzHttpClientModel(
  currentHttpClient: Api.Gateway.GatewayHttpClientModel
): Api.Gateway.GatewayHttpClientModel {
  return {
    ...createGatewayHttpClientModel(),
    poll_interval: 10,
    poll_route: {
      method: 'GET',
      path: '/api/Point/GetAll?pageNumber=1&pageSize=2000',
      token_key: 'Athorization',
      token_placement: 2,
      with_auth: true
    },
    send_route: {
      method: 'POST',
      path: '/api/Point/SendMqMessage',
      token_key: 'Athorization',
      token_placement: 2,
      with_auth: true
    },
    server: currentHttpClient.server,
    timeout: currentHttpClient.timeout,
    token: {
      body: [
        {
          key: 'userName',
          value: ''
        },
        {
          key: 'userPassword',
          value: ''
        }
      ],
      expire_field: '',
      expire_seconds: 1800,
      headers: [],
      is_enable: true,
      method: 'POST',
      path: '/api/Account/Login',
      token_field: 'data.0.token'
    }
  };
}

async function getSpaceData() {
  startSpaceLoading();
  const { data, error } = await fetchGetSpaceTrees().finally(endSpaceLoading);

  if (error) {
    spaceData.value = [];
    return;
  }

  spaceData.value = Array.isArray(data?.trees) ? data.trees : [];
}

async function getNetworkInterfaceOptions() {
  startNetworkInterfaceLoading();
  const { data, error } = await fetchListIothubNetworkInterface().finally(endNetworkInterfaceLoading);

  if (error) {
    networkInterfaceOptions.value = [];
    return;
  }

  networkInterfaceOptions.value = Array.isArray(data?.interfaces)
    ? data.interfaces.map(item => ({
        label: item.local_addr || item.name,
        value: item.name
      }))
    : [];
}

function resetModel() {
  model.value = createDefaultModel();
  detailProtocol.value = null;
  editingLoaded.value = false;
}

function closeDrawer() {
  visible.value = false;
}

function recordToKeyValueRows(
  record: Api.Gateway.GatewayHttpClientToken['body']
): Api.Gateway.GatewayHttpClientKeyValueRow[] {
  return Object.entries(record || {}).map(([key, value]) => ({
    key,
    value
  }));
}

function createHttpClientRouteModel(
  route: Api.Gateway.GatewayHttpClientRoute
): Api.Gateway.GatewayHttpClientRouteModel {
  return {
    method: route.method,
    path: route.path,
    token_key: route.token_key,
    token_placement: route.token_placement,
    with_auth: route.with_auth
  };
}

function fillModelByGateway(gateway: Api.Gateway.GatewayDetail) {
  const nextModel = createDefaultModel();
  const { protocol } = gateway;

  nextModel.desc = gateway.desc;
  nextModel.key = gateway.key;
  nextModel.name = gateway.name;
  nextModel.p_key = gateway.p_key;
  nextModel.password = gateway.password;
  nextModel.protocol_type = gateway.protocol_type;
  nextModel.space_id = gateway.space_id;
  nextModel.status = gateway.status;
  nextModel.username = gateway.username;
  if (protocol.data_format) {
    nextModel.data_format = protocol.data_format;
  }

  const httpClient = protocol.http_client;
  if (httpClient) {
    nextModel.http_client = {
      poll_interval: httpClient.poll_interval,
      poll_route: createHttpClientRouteModel(httpClient.poll_route),
      send_route: createHttpClientRouteModel(httpClient.send_route),
      server: httpClient.server,
      timeout: httpClient.timeout,
      token: {
        body: recordToKeyValueRows(httpClient.token.body),
        expire_field: httpClient.token.expire_field,
        expire_seconds: httpClient.token.expire_seconds,
        headers: recordToKeyValueRows(httpClient.token.headers),
        is_enable: httpClient.token.is_enable,
        method: httpClient.token.method,
        path: httpClient.token.path,
        token_field: httpClient.token.token_field
      }
    };
  }

  const modbus = protocol.modbus;
  if (modbus) {
    nextModel.modbus = {
      poll_interval: modbus.poll_interval,
      tcp: {
        host: modbus.tcp.host,
        port: modbus.tcp.port
      },
      timeout: modbus.timeout
    };
  }

  const bacnet = protocol.bacnet;
  if (bacnet) {
    nextModel.bacnet = {
      ip: {
        interface_name: bacnet.ip.interface_name,
        local_port: bacnet.ip.local_port
      },
      poll_interval: bacnet.poll_interval,
      timeout: bacnet.timeout
    };
  }

  const opcua = protocol.opcua;
  if (opcua) {
    nextModel.opcua = {
      authentication: {
        auth_type: opcua.authentication.auth_type,
        user_auth: {
          password: opcua.authentication.user_auth.password,
          username: opcua.authentication.user_auth.username
        }
      },
      endpoint_url: opcua.endpoint_url,
      is_auto_discovery: opcua.is_auto_discovery,
      is_subscription: opcua.is_subscription,
      poll_interval: opcua.poll_interval,
      request_timeout: opcua.request_timeout,
      security_policy: {
        mode: opcua.security_policy.mode,
        policy_uri: opcua.security_policy.policy_uri
      },
      session_timeout: opcua.session_timeout,
      timeout: opcua.timeout
    };
  }

  model.value = nextModel;
}

async function getGatewayDetail(id: CommonType.IdType) {
  startDetailLoading();
  const { data, error } = await fetchGetGateway({ id, options: [{ key: 1 }, { key: 2 }] }).finally(endDetailLoading);

  if (error) {
    window.$message?.error('边缘设备详情获取失败');
    return;
  }

  detailProtocol.value = data.gateway.protocol;
  fillModelByGateway(data.gateway);
  editingLoaded.value = true;
}

async function handleUpdateModel() {
  resetModel();

  if (isEdit.value) {
    await getGatewayDetail(props.rowId!);
  }
}

function handleDataFormatChange(value: Api.Gateway.DataFormat | null) {
  model.value.data_format = (Number(value) || 2) as Api.Gateway.DataFormat;

  if (isHttpClient.value && model.value.data_format === 4) {
    model.value.http_client = createNzHttpClientModel(model.value.http_client);
  }
}

function createProtocolParams(): Api.Gateway.GatewayCreateProtocol {
  const currentDetailProtocol =
    detailProtocol.value?.protocol_type === model.value.protocol_type ? detailProtocol.value : null;
  const protocol: Api.Gateway.GatewayCreateProtocol = {
    protocol_type: model.value.protocol_type
  };

  if (model.value.protocol_type === 1) {
    protocol.data_format = model.value.data_format;
    protocol.mqtt = currentDetailProtocol?.mqtt || {
      domain: '',
      port: 0
    };
  }

  if (model.value.protocol_type === 2) {
    protocol.data_format = model.value.data_format;
    protocol.http_server = currentDetailProtocol?.http_server || {
      addr: '',
      path: ''
    };
  }

  if (model.value.protocol_type === 3) {
    protocol.data_format = model.value.data_format;
    protocol.http_client = {
      poll_interval: model.value.http_client.poll_interval ?? 5,
      poll_route: createGatewayHttpClientRouteParams(model.value.http_client.poll_route),
      send_route: createGatewayHttpClientRouteParams(model.value.http_client.send_route),
      server: model.value.http_client.server,
      timeout: model.value.http_client.timeout ?? 10,
      token: {
        body: gatewayHttpClientKeyValueRowsToMap(model.value.http_client.token.body),
        expire_field: model.value.http_client.token.expire_field,
        expire_seconds: model.value.http_client.token.expire_seconds ?? 0,
        headers: gatewayHttpClientKeyValueRowsToMap(model.value.http_client.token.headers),
        is_enable: model.value.http_client.token.is_enable,
        method: model.value.http_client.token.method,
        path: model.value.http_client.token.path,
        token_field: model.value.http_client.token.token_field
      }
    };
  }

  if (model.value.protocol_type === 4) {
    protocol.modbus = {
      mode: 1,
      poll_interval: model.value.modbus.poll_interval ?? 5,
      tcp: {
        host: model.value.modbus.tcp.host,
        port: model.value.modbus.tcp.port as number
      },
      timeout: model.value.modbus.timeout ?? 10
    };
  }

  if (model.value.protocol_type === 5) {
    protocol.bacnet = {
      ip: {
        interface_name: model.value.bacnet.ip.interface_name,
        local_port: model.value.bacnet.ip.local_port as number
      },
      is_support_cov: true,
      network_type: 1,
      poll_interval: model.value.bacnet.poll_interval ?? 5,
      timeout: model.value.bacnet.timeout ?? 5
    };
  }

  if (model.value.protocol_type === 6) {
    protocol.opcua = {
      authentication: {
        auth_type: model.value.opcua.authentication.auth_type,
        user_auth: {
          password: isOpcUaUsernameAuthMode.value ? model.value.opcua.authentication.user_auth.password : '',
          username: isOpcUaUsernameAuthMode.value ? model.value.opcua.authentication.user_auth.username : ''
        }
      },
      endpoint_url: model.value.opcua.endpoint_url,
      is_auto_discovery: model.value.opcua.is_auto_discovery,
      is_subscription: model.value.opcua.is_subscription,
      poll_interval: model.value.opcua.poll_interval ?? 5,
      request_timeout: model.value.opcua.request_timeout ?? 10,
      security_policy: {
        mode: model.value.opcua.security_policy.mode,
        policy_uri: isOpcUaSecureMode.value ? model.value.opcua.security_policy.policy_uri : ''
      },
      session_timeout: model.value.opcua.session_timeout ?? 10,
      timeout: model.value.opcua.timeout ?? 10
    };
  }

  return protocol;
}

function createSubmitPayload(): Api.Gateway.GatewayCreateParams {
  return {
    desc: model.value.desc,
    key: model.value.key,
    name: model.value.name,
    p_key: model.value.p_key,
    password: model.value.password,
    protocol: createProtocolParams(),
    protocol_type: model.value.protocol_type,
    space_id: model.value.space_id ?? 0,
    status: model.value.status,
    username: model.value.username
  };
}

async function handleSubmit() {
  await validate();

  const submitPayload = createSubmitPayload();

  startSubmitLoading();
  try {
    const { error } = isEdit.value
      ? await fetchUpdateGateway({
          ...submitPayload,
          id: props.rowId!
        })
      : await fetchCreateGateway(submitPayload);
    if (error) return;

    window.$message?.success(isEdit.value ? $t('common.updateSuccess') : $t('common.addSuccess'));
    closeDrawer();
    emit('submitted');
  } finally {
    endSubmitLoading();
  }
}

watch(visible, () => {
  if (visible.value) {
    getSpaceData();
    getNetworkInterfaceOptions();
    handleUpdateModel().then(() => restoreValidation());
  }
});

watch(
  () => model.value.protocol_type,
  protocolType => {
    if (![2, 3].includes(protocolType)) {
      model.value.data_format = 2;
    }
  }
);
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="680" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
        <NFormItem label="名称" path="name">
          <NInput v-model:value="model.name" maxlength="30" show-count placeholder="请输入名称" />
        </NFormItem>
        <NFormItem label="主题" path="p_key">
          <NInput v-model:value="model.p_key" maxlength="30" show-count :disabled="isEdit" placeholder="请输入主题" />
        </NFormItem>
        <NFormItem label="标识" path="key">
          <NInput v-model:value="model.key" maxlength="48" show-count :disabled="isEdit" placeholder="请输入标识" />
        </NFormItem>
        <NFormItem label="协议" path="protocol_type">
          <NSelect
            v-model:value="model.protocol_type"
            :options="GATEWAY_PROTOCOL_OPTIONS"
            :disabled="isEdit"
            placeholder="请选择协议"
          />
        </NFormItem>
        <NFormItem v-if="showDataFormat" label="数据格式" path="data_format">
          <NSelect
            v-model:value="model.data_format"
            :options="dataFormatOptions"
            :disabled="dataFormatDisabled"
            placeholder="请选择数据格式"
            @update:value="handleDataFormatChange"
          />
        </NFormItem>
        <GatewayHttpClientConfig v-if="isHttpClient" v-model="model.http_client" />
        <template v-if="isModbus">
          <div class="protocol-config-panel">
            <div class="protocol-config-title">Modbus TCP参数</div>
            <NGrid responsive="screen" item-responsive :x-gap="16">
              <NFormItemGi span="12" label="IP地址" path="modbus.tcp.host">
                <NInput v-model:value="model.modbus.tcp.host" maxlength="100" show-count placeholder="请输入IP地址" />
              </NFormItemGi>
              <NFormItemGi span="12" label="端口" path="modbus.tcp.port">
                <NInputNumber
                  v-model:value="model.modbus.tcp.port"
                  class="w-full"
                  :min="1"
                  :max="65535"
                  :precision="0"
                  placeholder="请输入端口"
                />
              </NFormItemGi>
              <NFormItemGi span="12" label="轮询间隔（秒）" path="modbus.poll_interval">
                <NInputNumber
                  v-model:value="model.modbus.poll_interval"
                  class="w-full"
                  :min="5"
                  :precision="0"
                  placeholder="请输入轮询间隔（秒）"
                />
              </NFormItemGi>
              <NFormItemGi span="12" label="超时时间（秒）" path="modbus.timeout">
                <NInputNumber
                  v-model:value="model.modbus.timeout"
                  class="w-full"
                  :min="10"
                  :precision="0"
                  placeholder="请输入超时时间（秒）"
                />
              </NFormItemGi>
            </NGrid>
          </div>
        </template>
        <template v-if="isBacnet">
          <div class="protocol-config-panel">
            <div class="protocol-config-title">BACnet IP参数</div>
            <NGrid responsive="screen" item-responsive :x-gap="16">
              <NFormItemGi span="12" label="目标地址" path="bacnet.ip.interface_name">
                <NSelect
                  v-model:value="model.bacnet.ip.interface_name"
                  filterable
                  clearable
                  :loading="networkInterfaceLoading"
                  :options="networkInterfaceOptions"
                  placeholder="请选择目标地址"
                />
              </NFormItemGi>
              <NFormItemGi span="12" label="目标端口" path="bacnet.ip.local_port">
                <NInputNumber
                  v-model:value="model.bacnet.ip.local_port"
                  class="w-full"
                  :min="1"
                  :max="65535"
                  :precision="0"
                  placeholder="请输入目标端口"
                />
              </NFormItemGi>
              <NFormItemGi span="12" label="轮询间隔（秒）" path="bacnet.poll_interval">
                <NInputNumber
                  v-model:value="model.bacnet.poll_interval"
                  class="w-full"
                  :min="5"
                  :precision="0"
                  placeholder="请输入轮询间隔（秒）"
                />
              </NFormItemGi>
              <NFormItemGi span="12" label="超时时间（秒）" path="bacnet.timeout">
                <NInputNumber
                  v-model:value="model.bacnet.timeout"
                  class="w-full"
                  :min="5"
                  :precision="0"
                  placeholder="请输入超时时间（秒）"
                />
              </NFormItemGi>
            </NGrid>
          </div>
        </template>
        <template v-if="isOpcUa">
          <div class="protocol-config-panel">
            <div class="protocol-config-title">OPC UA 连接参数</div>
            <NGrid responsive="screen" item-responsive :x-gap="16">
              <NFormItemGi span="12" label="服务端地址" path="opcua.endpoint_url">
                <NInput v-model:value="model.opcua.endpoint_url" placeholder="opc.tcp://192.168.1.100:4840" />
              </NFormItemGi>
              <NFormItemGi span="12" label="安全模式" path="opcua.security_policy.mode">
                <NSelect
                  v-model:value="model.opcua.security_policy.mode"
                  :options="opcUaSecurityModeOptions"
                  placeholder="请选择安全模式"
                />
              </NFormItemGi>
              <NFormItemGi
                v-if="isOpcUaSecureMode"
                span="12"
                label="安全策略 URI"
                path="opcua.security_policy.policy_uri"
              >
                <NInput v-model:value="model.opcua.security_policy.policy_uri" placeholder="请输入安全策略 URI" />
              </NFormItemGi>
              <NFormItemGi span="12" label="认证类型" path="opcua.authentication.auth_type">
                <NSelect
                  v-model:value="model.opcua.authentication.auth_type"
                  :options="opcUaAuthTypeOptions"
                  placeholder="请选择认证类型"
                />
              </NFormItemGi>
              <template v-if="isOpcUaUsernameAuthMode">
                <NFormItemGi span="12" label="用户名" path="opcua.authentication.user_auth.username">
                  <NInput v-model:value="model.opcua.authentication.user_auth.username" placeholder="请输入用户名" />
                </NFormItemGi>
                <NFormItemGi span="12" label="密码" path="opcua.authentication.user_auth.password">
                  <NInput
                    v-model:value="model.opcua.authentication.user_auth.password"
                    type="password"
                    show-password-on="click"
                    :input-props="{ autocomplete: 'new-password' }"
                    placeholder="请输入密码"
                  />
                </NFormItemGi>
              </template>
              <NFormItemGi span="12" label="轮询间隔（秒）" path="opcua.poll_interval">
                <NInputNumber
                  v-model:value="model.opcua.poll_interval"
                  class="w-full"
                  :min="5"
                  :precision="0"
                  placeholder="请输入轮询间隔（秒）"
                />
              </NFormItemGi>
              <NFormItemGi span="12" label="请求超时（秒）" path="opcua.request_timeout">
                <NInputNumber
                  v-model:value="model.opcua.request_timeout"
                  class="w-full"
                  :min="10"
                  :max="60"
                  :precision="0"
                  placeholder="请输入请求超时（秒）"
                />
              </NFormItemGi>
              <NFormItemGi span="12" label="会话超时（秒）" path="opcua.session_timeout">
                <NInputNumber
                  v-model:value="model.opcua.session_timeout"
                  class="w-full"
                  :min="10"
                  :max="60"
                  :precision="0"
                  placeholder="请输入会话超时（秒）"
                />
              </NFormItemGi>
              <NFormItemGi span="12" label="连接超时（秒）" path="opcua.timeout">
                <NInputNumber
                  v-model:value="model.opcua.timeout"
                  class="w-full"
                  :min="10"
                  :max="60"
                  :precision="0"
                  placeholder="请输入连接超时（秒）"
                />
              </NFormItemGi>
            </NGrid>
          </div>
        </template>
        <NFormItem label="所属空间" path="space_id">
          <NTreeSelect
            v-model:value="model.space_id"
            v-model:expanded-keys="expandedKeys"
            filterable
            clearable
            :loading="spaceLoading"
            :options="spaceData"
            label-field="space_name"
            key-field="space_id"
            placeholder="请选择所属空间"
          />
        </NFormItem>
        <NFormItem label="状态" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio v-for="item in statusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </NRadio>
          </NRadioGroup>
        </NFormItem>
        <NFormItem label="用户名" path="username">
          <NInput
            v-model:value="model.username"
            maxlength="30"
            show-count
            :disabled="isEdit"
            placeholder="请输入用户名"
          />
        </NFormItem>
        <NFormItem label="密码" path="password">
          <NInput
            v-model:value="model.password"
            type="password"
            show-password-on="click"
            :disabled="isEdit"
            :input-props="{ autocomplete: 'new-password' }"
            placeholder="请输入密码"
          />
        </NFormItem>

        <NFormItem label="描述" path="desc">
          <NInput
            v-model:value="model.desc"
            type="textarea"
            maxlength="200"
            show-count
            :rows="4"
            placeholder="请输入描述"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton
            type="primary"
            :disabled="confirmDisabled"
            :loading="submitLoading || detailLoading"
            @click="handleSubmit"
          >
            {{ $t('common.confirm') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.protocol-config-panel {
  margin-bottom: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
  padding: 14px 14px 0;
}

.protocol-config-title {
  margin-bottom: 12px;
  border-left: 3px solid #18a058;
  padding-left: 8px;
  color: #18a058;
  font-size: 14px;
  font-weight: 600;
}
</style>
