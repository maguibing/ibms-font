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
import { enableStatusOptions } from '@/constants/business';
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
    add: $t('gatewayList.add'),
    edit: $t('gatewayList.edit')
  };

  return titles[props.operateType];
});
const isEdit = computed(() => props.operateType === 'edit');
const confirmDisabled = computed(() => isEdit.value && !editingLoaded.value);

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
  'bacnet.ip.interface_name': createRequiredRule($t('gatewayList.targetAddressPlaceholder')),
  'bacnet.ip.local_port': createNumberRequiredRule($t('gatewayList.targetPortPlaceholder')),
  name: createRequiredRule($t('gatewayList.namePlaceholder')),
  protocol_type: createRequiredRule($t('gatewayList.protocolPlaceholder')),
  'modbus.tcp.host': [
    createRequiredRule($t('gatewayList.ipAddressPlaceholder')),
    {
      pattern: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      message: $t('gatewayList.invalidIpAddress'),
      trigger: ['input', 'blur']
    }
  ],
  'modbus.tcp.port': createNumberRequiredRule($t('gatewayList.portPlaceholder')),
  'opcua.authentication.auth_type': createRequiredRule($t('gatewayList.authTypePlaceholder')),
  'opcua.authentication.user_auth.password': createRequiredRule($t('gatewayList.passwordPlaceholder')),
  'opcua.authentication.user_auth.username': createRequiredRule($t('gatewayList.usernamePlaceholder')),
  'opcua.endpoint_url': createRequiredRule($t('gatewayList.serverAddressPlaceholder')),
  'opcua.security_policy.policy_uri': createRequiredRule($t('gatewayList.securityPolicyUriPlaceholder'))
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
    is_support_send: currentHttpClient.is_support_send,
    poll_interval: 10,
    poll_route: {
      body: [],
      content_type: 'application/json',
      headers: [],
      method: 'GET',
      path: '/api/Point/GetAll?pageNumber=1&pageSize=2000',
      token_key: 'Authorization',
      token_placement: 2,
      with_auth: true
    },
    send_route: {
      body: [],
      content_type: 'application/json',
      headers: [],
      method: 'POST',
      path: '/api/Point/SendMqMessage',
      token_key: 'Authorization',
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
      content_type: 'application/json',
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
    body: recordToKeyValueRows(route.body),
    content_type: route.content_type || 'application/json',
    headers: recordToKeyValueRows(route.headers),
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
      send_route: httpClient.send_route
        ? createHttpClientRouteModel(httpClient.send_route)
        : createGatewayHttpClientModel().send_route,
      is_support_send: Boolean(httpClient.send_route),
      server: httpClient.server,
      timeout: httpClient.timeout,
      token: {
        body: recordToKeyValueRows(httpClient.token.body),
        content_type: httpClient.token.content_type || 'application/json',
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
    window.$message?.error($t('gatewayList.detailFetchFailed'));
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
      poll_route: createGatewayHttpClientRouteParams(model.value.http_client.poll_route, {
        includeBody: model.value.http_client.poll_route.method.trim().toUpperCase() !== 'GET'
      }),
      ...(model.value.http_client.is_support_send
        ? {
            send_route: createGatewayHttpClientRouteParams(model.value.http_client.send_route, {
              includeBody: false
            })
          }
        : {}),
      server: model.value.http_client.server,
      timeout: model.value.http_client.timeout ?? 10,
      token: {
        body: gatewayHttpClientKeyValueRowsToMap(model.value.http_client.token.body),
        content_type: model.value.http_client.token.content_type,
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
        <NFormItem :label="$t('gatewayList.name')" path="name">
          <NInput
            v-model:value="model.name"
            maxlength="30"
            show-count
            :placeholder="$t('gatewayList.namePlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('gatewayList.topic')" path="p_key">
          <NInput
            v-model:value="model.p_key"
            maxlength="30"
            show-count
            :disabled="isEdit"
            :placeholder="$t('gatewayList.topicPlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('gatewayList.identifierLabel')" path="key">
          <NInput
            v-model:value="model.key"
            maxlength="48"
            show-count
            :disabled="isEdit"
            :placeholder="$t('gatewayList.identifierPlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('gatewayList.protocol')" path="protocol_type">
          <NSelect
            v-model:value="model.protocol_type"
            :options="GATEWAY_PROTOCOL_OPTIONS"
            :disabled="isEdit"
            :placeholder="$t('gatewayList.protocolPlaceholder')"
          />
        </NFormItem>
        <NFormItem v-if="showDataFormat" :label="$t('gatewayList.dataFormat')" path="data_format">
          <NSelect
            v-model:value="model.data_format"
            :options="dataFormatOptions"
            :disabled="dataFormatDisabled"
            :placeholder="$t('gatewayList.dataFormatPlaceholder')"
            @update:value="handleDataFormatChange"
          />
        </NFormItem>
        <GatewayHttpClientConfig v-if="isHttpClient" v-model="model.http_client" />
        <template v-if="isModbus">
          <div class="protocol-config-panel">
            <div class="protocol-config-title">{{ $t('gatewayList.modbusTcpParameters') }}</div>
            <NGrid responsive="screen" item-responsive :x-gap="16">
              <NFormItemGi span="12" :label="$t('gatewayList.ipAddress')" path="modbus.tcp.host">
                <NInput
                  v-model:value="model.modbus.tcp.host"
                  maxlength="100"
                  show-count
                  :placeholder="$t('gatewayList.ipAddressPlaceholder')"
                />
              </NFormItemGi>
              <NFormItemGi span="12" :label="$t('gatewayList.port')" path="modbus.tcp.port">
                <NInputNumber
                  v-model:value="model.modbus.tcp.port"
                  class="w-full"
                  :min="1"
                  :max="65535"
                  :precision="0"
                  :placeholder="$t('gatewayList.portPlaceholder')"
                />
              </NFormItemGi>
              <NFormItemGi span="12" :label="$t('gatewayList.pollIntervalSeconds')" path="modbus.poll_interval">
                <NInputNumber
                  v-model:value="model.modbus.poll_interval"
                  class="w-full"
                  :min="5"
                  :precision="0"
                  :placeholder="$t('gatewayList.pollIntervalSecondsPlaceholder')"
                />
              </NFormItemGi>
              <NFormItemGi span="12" :label="$t('gatewayList.timeoutSeconds')" path="modbus.timeout">
                <NInputNumber
                  v-model:value="model.modbus.timeout"
                  class="w-full"
                  :min="10"
                  :precision="0"
                  :placeholder="$t('gatewayList.timeoutSecondsPlaceholder')"
                />
              </NFormItemGi>
            </NGrid>
          </div>
        </template>
        <template v-if="isBacnet">
          <div class="protocol-config-panel">
            <div class="protocol-config-title">{{ $t('gatewayList.bacnetIpParameters') }}</div>
            <NGrid responsive="screen" item-responsive :x-gap="16">
              <NFormItemGi span="12" :label="$t('gatewayList.targetAddress')" path="bacnet.ip.interface_name">
                <NSelect
                  v-model:value="model.bacnet.ip.interface_name"
                  filterable
                  clearable
                  :loading="networkInterfaceLoading"
                  :options="networkInterfaceOptions"
                  :placeholder="$t('gatewayList.targetAddressPlaceholder')"
                />
              </NFormItemGi>
              <NFormItemGi span="12" :label="$t('gatewayList.targetPort')" path="bacnet.ip.local_port">
                <NInputNumber
                  v-model:value="model.bacnet.ip.local_port"
                  class="w-full"
                  :min="1"
                  :max="65535"
                  :precision="0"
                  :placeholder="$t('gatewayList.targetPortPlaceholder')"
                />
              </NFormItemGi>
              <NFormItemGi span="12" :label="$t('gatewayList.pollIntervalSeconds')" path="bacnet.poll_interval">
                <NInputNumber
                  v-model:value="model.bacnet.poll_interval"
                  class="w-full"
                  :min="5"
                  :precision="0"
                  :placeholder="$t('gatewayList.pollIntervalSecondsPlaceholder')"
                />
              </NFormItemGi>
              <NFormItemGi span="12" :label="$t('gatewayList.timeoutSeconds')" path="bacnet.timeout">
                <NInputNumber
                  v-model:value="model.bacnet.timeout"
                  class="w-full"
                  :min="5"
                  :precision="0"
                  :placeholder="$t('gatewayList.timeoutSecondsPlaceholder')"
                />
              </NFormItemGi>
            </NGrid>
          </div>
        </template>
        <template v-if="isOpcUa">
          <div class="protocol-config-panel">
            <div class="protocol-config-title">{{ $t('gatewayList.opcUaConnectionParameters') }}</div>
            <NGrid responsive="screen" item-responsive :x-gap="16">
              <NFormItemGi span="12" :label="$t('gatewayList.serverAddress')" path="opcua.endpoint_url">
                <NInput
                  v-model:value="model.opcua.endpoint_url"
                  :placeholder="$t('gatewayList.opcUaEndpointPlaceholder')"
                />
              </NFormItemGi>
              <NFormItemGi span="12" :label="$t('gatewayList.securityMode')" path="opcua.security_policy.mode">
                <NSelect
                  v-model:value="model.opcua.security_policy.mode"
                  :options="opcUaSecurityModeOptions"
                  :placeholder="$t('gatewayList.securityModePlaceholder')"
                />
              </NFormItemGi>
              <NFormItemGi
                v-if="isOpcUaSecureMode"
                span="12"
                :label="$t('gatewayList.securityPolicyUri')"
                path="opcua.security_policy.policy_uri"
              >
                <NInput
                  v-model:value="model.opcua.security_policy.policy_uri"
                  :placeholder="$t('gatewayList.securityPolicyUriPlaceholder')"
                />
              </NFormItemGi>
              <NFormItemGi span="12" :label="$t('gatewayList.authType')" path="opcua.authentication.auth_type">
                <NSelect
                  v-model:value="model.opcua.authentication.auth_type"
                  :options="opcUaAuthTypeOptions"
                  :placeholder="$t('gatewayList.authTypePlaceholder')"
                />
              </NFormItemGi>
              <template v-if="isOpcUaUsernameAuthMode">
                <NFormItemGi
                  span="12"
                  :label="$t('gatewayList.username')"
                  path="opcua.authentication.user_auth.username"
                >
                  <NInput
                    v-model:value="model.opcua.authentication.user_auth.username"
                    :placeholder="$t('gatewayList.usernamePlaceholder')"
                  />
                </NFormItemGi>
                <NFormItemGi
                  span="12"
                  :label="$t('gatewayList.password')"
                  path="opcua.authentication.user_auth.password"
                >
                  <NInput
                    v-model:value="model.opcua.authentication.user_auth.password"
                    type="password"
                    show-password-on="click"
                    :input-props="{ autocomplete: 'new-password' }"
                    :placeholder="$t('gatewayList.passwordPlaceholder')"
                  />
                </NFormItemGi>
              </template>
              <NFormItemGi span="12" :label="$t('gatewayList.pollIntervalSeconds')" path="opcua.poll_interval">
                <NInputNumber
                  v-model:value="model.opcua.poll_interval"
                  class="w-full"
                  :min="5"
                  :precision="0"
                  :placeholder="$t('gatewayList.pollIntervalSecondsPlaceholder')"
                />
              </NFormItemGi>
              <NFormItemGi span="12" :label="$t('gatewayList.requestTimeout')" path="opcua.request_timeout">
                <NInputNumber
                  v-model:value="model.opcua.request_timeout"
                  class="w-full"
                  :min="10"
                  :max="60"
                  :precision="0"
                  :placeholder="$t('gatewayList.requestTimeoutSecondsPlaceholder')"
                />
              </NFormItemGi>
              <NFormItemGi span="12" :label="$t('gatewayList.sessionTimeoutSeconds')" path="opcua.session_timeout">
                <NInputNumber
                  v-model:value="model.opcua.session_timeout"
                  class="w-full"
                  :min="10"
                  :max="60"
                  :precision="0"
                  :placeholder="$t('gatewayList.sessionTimeoutSecondsPlaceholder')"
                />
              </NFormItemGi>
              <NFormItemGi span="12" :label="$t('gatewayList.connectionTimeoutSeconds')" path="opcua.timeout">
                <NInputNumber
                  v-model:value="model.opcua.timeout"
                  class="w-full"
                  :min="10"
                  :max="60"
                  :precision="0"
                  :placeholder="$t('gatewayList.connectionTimeoutSecondsPlaceholder')"
                />
              </NFormItemGi>
            </NGrid>
          </div>
        </template>
        <NFormItem :label="$t('gatewayList.space')" path="space_id">
          <NTreeSelect
            v-model:value="model.space_id"
            v-model:expanded-keys="expandedKeys"
            filterable
            clearable
            :loading="spaceLoading"
            :options="spaceData"
            label-field="space_name"
            key-field="space_id"
            :placeholder="$t('gatewayList.spacePlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('gatewayList.status')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </NRadio>
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('gatewayList.username')" path="username">
          <NInput
            v-model:value="model.username"
            maxlength="30"
            show-count
            :disabled="isEdit"
            :placeholder="$t('gatewayList.usernamePlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('gatewayList.password')" path="password">
          <NInput
            v-model:value="model.password"
            type="password"
            show-password-on="click"
            :disabled="isEdit"
            :input-props="{ autocomplete: 'new-password' }"
            :placeholder="$t('gatewayList.passwordPlaceholder')"
          />
        </NFormItem>

        <NFormItem :label="$t('gatewayList.description')" path="desc">
          <NInput
            v-model:value="model.desc"
            type="textarea"
            maxlength="200"
            show-count
            :rows="4"
            :placeholder="$t('gatewayList.descriptionPlaceholder')"
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
