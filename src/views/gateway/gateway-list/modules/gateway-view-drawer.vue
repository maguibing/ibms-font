<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import StatusTag from '@/components/custom/status-tag.vue';
import { useLoading } from '@sa/hooks';
import { copyText, isClipboardSupported } from '@sa/utils';
import { fetchGetGateway } from '@/service/api/gateway';
import { $t } from '@/locales';
import { displayValue } from '@/utils/common-methods';
import CopyableValue from '@/components/custom/copyable-value.vue';
import JsCodeEditor from '@/components/custom/js-code-editor.vue';
import {
  GATEWAY_UNKNOWN_STATUS,
  getGatewayProtocolLabel,
  opcUaAuthTypeOptions,
  opcUaSecurityModeOptions
} from '../shared';
import { tokenPlacementOptions } from './gateway-http-client-config';
import SectionHeader from '@/components/custom/section-header.vue';

defineOptions({
  name: 'GatewayViewDrawer'
});

interface Props {
  rowId?: CommonType.IdType | null;
}

const props = withDefaults(defineProps<Props>(), {
  rowId: null
});

const visible = defineModel<boolean>('visible', {
  default: false
});

const { loading, startLoading, endLoading } = useLoading();
const detail = shallowRef<Api.Gateway.GatewayDetailResponse | null>(null);

const gateway = computed(() => detail.value?.gateway ?? null);
const protocol = computed(() => gateway.value?.protocol ?? null);
const protocolType = computed(() => gateway.value?.protocol_type);

const spaceName = computed(() => {
  const spaceId = gateway.value?.space_id;
  if (!spaceId) return '-';
  return detail.value?.space_map[String(spaceId)]?.name ?? '-';
});

const protocolTitle = computed(() => {
  return protocolType.value
    ? `${getGatewayProtocolLabel(protocolType.value)} ${$t('gatewayList.config')}`
    : $t('gatewayList.protocolConfig');
});

const isMqtt = computed(() => protocolType.value === 1);
const isHttpServer = computed(() => protocolType.value === 2);
const isHttpClient = computed(() => protocolType.value === 3);
const isModbus = computed(() => protocolType.value === 4);
const isBacnet = computed(() => protocolType.value === 5);
const isOpcUa = computed(() => protocolType.value === 6);
const httpClientBodyEntries = computed(() =>
  recordEntries(isHttpClient.value ? protocol.value?.http_client?.token?.body : null)
);
const mqttExampleTab = ref<'xunrao' | 'standard'>('standard');
const mqttReportAddress = computed(() => {
  const currentGateway = gateway.value;
  if (!currentGateway) return '';

  return `/iot/${currentGateway.p_key}/${currentGateway.key}/report`;
});
const mqttExamples = computed(() => {
  const timestamp = Math.floor(Date.now() / 1000);

  return {
    xunrao: {
      devs: [
        {
          d: [{ dq: 192, m: $t('gatewayList.examplePoint'), ts: timestamp, v: 0 }],
          dev: $t('gatewayList.exampleDevice')
        }
      ],
      pKey: gateway.value?.p_key || 'pkey_P0XiEV',
      sn: gateway.value?.key || 'sn_Gow6Ae',
      ts: timestamp,
      ver: '2.0.0'
    },
    standard: {
      device_points: [{ key: $t('gatewayList.examplePoint'), value: $t('gatewayList.exampleValue') }]
    }
  };
});
const mqttExampleCode = computed(() => JSON.stringify(mqttExamples.value[mqttExampleTab.value], null, 2));

function closeDrawer() {
  visible.value = false;
}

function formatBoolean(value?: boolean | null) {
  return value ? $t('gatewayList.yes') : $t('gatewayList.no');
}

function formatRecord(record?: Record<string, string> | null) {
  const entries = recordEntries(record);

  return entries.length ? entries.map(([key, value]) => `${key}: ${value}`).join('；') : '-';
}

function recordEntries(record?: Record<string, string> | null) {
  return Object.entries(record || {});
}

function getOptionLabel<T extends string | number>(options: CommonType.Option<T, string>[], value?: T | null) {
  if (value === null || value === undefined) return '-';
  return options.find(item => item.value === value)?.label ?? displayValue(value);
}

async function copyMqttBasicInfo() {
  const currentGateway = gateway.value;
  const mqtt = protocol.value?.mqtt;
  const values = [
    [$t('gatewayList.host'), mqtt?.domain],
    [$t('gatewayList.port'), mqtt?.port],
    [$t('gatewayList.topic'), currentGateway?.p_key],
    [$t('gatewayList.identifierLabel'), currentGateway?.key],
    [$t('gatewayList.username'), currentGateway?.username],
    [$t('gatewayList.password'), currentGateway?.password]
  ] satisfies [string, string | number | null | undefined][];

  if (values.every(([, value]) => !String(value ?? '').trim())) {
    window.$message?.warning($t('gatewayList.noMqttInfo'));
    return;
  }

  if (!isClipboardSupported()) {
    window.$message?.error($t('gatewayList.clipboardUnsupported'));
    return;
  }

  const copied = await copyText(values.map(([label, value]) => `${label}: ${String(value ?? '').trim()}`).join('\n'));
  if (copied) {
    window.$message?.success($t('gatewayList.copySuccess'));
    return;
  }

  window.$message?.error($t('gatewayList.copyFailed'));
}

async function copyMqttValue(value: string, label: string) {
  if (!value) {
    window.$message?.warning($t('gatewayList.noCopyValue', { label }));
    return;
  }

  if (!isClipboardSupported()) {
    window.$message?.error($t('gatewayList.clipboardUnsupported'));
    return;
  }

  const copied = await copyText(value);
  window.$message?.[copied ? 'success' : 'error'](
    copied ? $t('gatewayList.copySuccess') : $t('gatewayList.copyFailed')
  );
}

async function getGatewayDetail(id: CommonType.IdType) {
  startLoading();
  const { data, error } = await fetchGetGateway({ id, options: [{ key: 1 }, { key: 2 }] }).finally(endLoading);

  if (error) {
    window.$message?.error($t('gatewayList.detailFetchFailed'));
    return;
  }

  detail.value = data;
}

watch(visible, () => {
  if (!visible.value) return;

  detail.value = null;
  getGatewayDetail(props.rowId!);
});
</script>

<template>
  <NDrawer
    v-model:show="visible"
    :title="$t('gatewayList.viewGateway')"
    display-directive="show"
    :width="760"
    class="max-w-90%"
  >
    <NDrawerContent :title="$t('gatewayList.viewGateway')" :native-scrollbar="false" closable>
      <NSpin :show="loading">
        <div v-if="gateway" class="flex-col gap-18px">
          <div>
            <SectionHeader :title="protocolTitle" extra-class="mb-10px">
              <template #actions>
                <NButton v-if="isMqtt" type="primary" secondary size="small" @click="copyMqttBasicInfo">
                  <template #icon>
                    <SvgIcon icon="ep:copy-document" />
                  </template>
                  {{ $t('gatewayList.copyAll') }}
                </NButton>
              </template>
            </SectionHeader>
            <NDescriptions label-placement="left" bordered size="small" :column="2" label-class="w-100px">
              <NDescriptionsItem :label="$t('gatewayList.name')">{{ displayValue(gateway.name) }}</NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.protocol')">
                {{ getGatewayProtocolLabel(gateway.protocol_type) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.topic')">
                <CopyableValue :value="gateway.p_key" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.identifierLabel')">
                <CopyableValue :value="gateway.key" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.username')">
                <CopyableValue :value="gateway.username" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.password')">
                <CopyableValue :value="gateway.password" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.status')">
                <StatusTag :value="gateway.status" :unknown="GATEWAY_UNKNOWN_STATUS" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.space')">{{ spaceName }}</NDescriptionsItem>

              <NDescriptionsItem :label="$t('gatewayList.description')" :span="2">
                <span class="whitespace-pre-line">{{ displayValue(gateway.desc) }}</span>
              </NDescriptionsItem>
            </NDescriptions>
          </div>

          <div v-if="protocol">
            <SectionHeader :title="protocolTitle" extra-class="mb-10px" />

            <template v-if="isMqtt">
              <NCard :title="$t('gatewayList.mqttConfig')" size="small" segmented>
                <NDescriptions label-placement="left" bordered size="small" :column="2" label-class="w-120px">
                  <NDescriptionsItem :label="$t('gatewayList.host')">
                    <CopyableValue :value="protocol.mqtt?.domain" />
                  </NDescriptionsItem>
                  <NDescriptionsItem :label="$t('gatewayList.port')">
                    <CopyableValue :value="protocol.mqtt?.port" />
                  </NDescriptionsItem>
                  <NDescriptionsItem :label="$t('gatewayList.reportAddress')" :span="2">
                    <CopyableValue :value="mqttReportAddress" />
                  </NDescriptionsItem>
                </NDescriptions>

                <NTabs v-model:value="mqttExampleTab" animated class="mt-12px">
                  <NTabPane name="standard" :tab="$t('gatewayList.standard')">
                    <JsCodeEditor
                      :value="mqttExampleCode"
                      :label="$t('gatewayList.dataExampleJson')"
                      readonly
                      :show-format="false"
                      format-parser="json"
                      :height="220"
                    >
                      <template #toolbar-actions>
                        <NButton
                          size="tiny"
                          secondary
                          @click="copyMqttValue(mqttExampleCode, $t('gatewayList.exampleData'))"
                        >
                          <template #icon>
                            <SvgIcon icon="ep:copy-document" />
                          </template>
                          {{ $t('gatewayList.copyExample') }}
                        </NButton>
                      </template>
                    </JsCodeEditor>
                  </NTabPane>
                  <NTabPane name="xunrao" :tab="$t('gatewayList.xunrao')">
                    <JsCodeEditor
                      :value="mqttExampleCode"
                      :label="$t('gatewayList.dataExampleJson')"
                      readonly
                      :show-format="false"
                      format-parser="json"
                      :height="300"
                    >
                      <template #toolbar-actions>
                        <NButton
                          size="tiny"
                          secondary
                          @click="copyMqttValue(mqttExampleCode, $t('gatewayList.exampleData'))"
                        >
                          <template #icon>
                            <SvgIcon icon="ep:copy-document" />
                          </template>
                          {{ $t('gatewayList.copyExample') }}
                        </NButton>
                      </template>
                    </JsCodeEditor>
                  </NTabPane>
                </NTabs>
              </NCard>
            </template>

            <NDescriptions
              v-else-if="isHttpServer"
              label-placement="left"
              bordered
              size="small"
              :column="2"
              label-class="w-120px"
            >
              <NDescriptionsItem :label="$t('gatewayList.address')">
                <CopyableValue :value="protocol.http_server?.addr" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.path')">
                <CopyableValue :value="protocol.http_server?.path" />
              </NDescriptionsItem>
            </NDescriptions>

            <NDescriptions
              v-else-if="isHttpClient"
              label-placement="left"
              bordered
              size="small"
              :column="2"
              label-class="w-120px"
            >
              <NDescriptionsItem :label="$t('gatewayList.serverAddress')">
                <CopyableValue :value="protocol.http_client?.server" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.requestTimeout')">
                {{ displayValue(protocol.http_client?.timeout) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.pollIntervalSeconds')">
                {{ displayValue(protocol.http_client?.poll_interval) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.tokenAuth')">
                {{ formatBoolean(protocol.http_client?.token?.is_enable) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.tokenRequestMethod')">
                {{ displayValue(protocol.http_client?.token?.method) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.tokenRequestPath')" :span="2">
                <CopyableValue :value="protocol.http_client?.token?.path" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.tokenFieldName')">
                {{ displayValue(protocol.http_client?.token?.token_field) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.expireFieldName')">
                {{ displayValue(protocol.http_client?.token?.expire_field) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.expireSeconds')">
                {{ displayValue(protocol.http_client?.token?.expire_seconds) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.requestHeaders')" :span="2">
                {{ formatRecord(protocol.http_client?.token?.headers) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.requestBody')" :span="2">
                <div v-if="httpClientBodyEntries.length" class="flex-col gap-6px">
                  <div
                    v-for="[key, value] in httpClientBodyEntries"
                    :key="key"
                    class="grid grid-cols-[140px_minmax(0,1fr)] gap-10px"
                  >
                    <span class="text-#666 dark:text-#aaa">{{ key }}</span>
                    <span>{{ displayValue(value) }}</span>
                  </div>
                </div>
                <span v-else>-</span>
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.pollRequestMethod')">
                {{ displayValue(protocol.http_client?.poll_route?.method) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.pollRequestPath')" :span="2">
                <CopyableValue :value="protocol.http_client?.poll_route?.path" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.pollAuth')">
                {{ formatBoolean(protocol.http_client?.poll_route?.with_auth) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.pollTokenPlacement')">
                {{ getOptionLabel(tokenPlacementOptions, protocol.http_client?.poll_route?.token_placement) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.pollTokenField')">
                {{ displayValue(protocol.http_client?.poll_route?.token_key) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.sendRequestMethod')">
                {{ displayValue(protocol.http_client?.send_route?.method) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.sendRequestPath')" :span="2">
                <CopyableValue :value="protocol.http_client?.send_route?.path" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.sendAuth')">
                {{ formatBoolean(protocol.http_client?.send_route?.with_auth) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.sendTokenPlacement')">
                {{ getOptionLabel(tokenPlacementOptions, protocol.http_client?.send_route?.token_placement) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.sendTokenField')">
                {{ displayValue(protocol.http_client?.send_route?.token_key) }}
              </NDescriptionsItem>
            </NDescriptions>

            <NDescriptions
              v-else-if="isModbus"
              label-placement="left"
              bordered
              size="small"
              :column="2"
              label-class="w-120px"
            >
              <NDescriptionsItem :label="$t('gatewayList.host')">
                {{ displayValue(protocol.modbus?.tcp?.host) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.port')">
                {{ displayValue(protocol.modbus?.tcp?.port) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.pollIntervalSeconds')">
                {{ displayValue(protocol.modbus?.poll_interval) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.timeoutSeconds')">
                {{ displayValue(protocol.modbus?.timeout) }}
              </NDescriptionsItem>
            </NDescriptions>

            <NDescriptions
              v-else-if="isBacnet"
              label-placement="left"
              bordered
              size="small"
              :column="2"
              label-class="w-120px"
            >
              <NDescriptionsItem :label="$t('gatewayList.targetAddress')">
                {{ displayValue(protocol.bacnet?.ip?.interface_name) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.localAddress')">
                {{ displayValue(protocol.bacnet?.ip?.local_addr) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.targetPort')">
                {{ displayValue(protocol.bacnet?.ip?.local_port) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.pollIntervalSeconds')">
                {{ displayValue(protocol.bacnet?.poll_interval) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.timeoutSeconds')">
                {{ displayValue(protocol.bacnet?.timeout) }}
              </NDescriptionsItem>
            </NDescriptions>

            <NDescriptions
              v-else-if="isOpcUa"
              label-placement="left"
              bordered
              size="small"
              :column="2"
              label-class="w-120px"
            >
              <NDescriptionsItem :label="$t('gatewayList.serverAddress')">
                {{ displayValue(protocol.opcua?.endpoint_url) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.authType')">
                {{ getOptionLabel(opcUaAuthTypeOptions, protocol.opcua?.authentication?.auth_type) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.username')">
                <CopyableValue :value="protocol.opcua?.authentication?.user_auth?.username" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.password')">
                <CopyableValue :value="protocol.opcua?.authentication?.user_auth?.password" />
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.securityMode')">
                {{ getOptionLabel(opcUaSecurityModeOptions, protocol.opcua?.security_policy?.mode) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.securityPolicyUri')" :span="2">
                {{ displayValue(protocol.opcua?.security_policy?.policy_uri) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.autoDiscovery')">
                {{ formatBoolean(protocol.opcua?.is_auto_discovery) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.subscription')">
                {{ formatBoolean(protocol.opcua?.is_subscription) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.pollIntervalSeconds')">
                {{ displayValue(protocol.opcua?.poll_interval) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.requestTimeout')">
                {{ displayValue(protocol.opcua?.request_timeout) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.sessionTimeoutSeconds')">
                {{ displayValue(protocol.opcua?.session_timeout) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="$t('gatewayList.connectionTimeoutSeconds')">
                {{ displayValue(protocol.opcua?.timeout) }}
              </NDescriptionsItem>
            </NDescriptions>

            <NEmpty v-else :description="$t('gatewayList.protocolConfigEmpty')" />
          </div>
        </div>

        <NEmpty v-else-if="!loading" :description="$t('gatewayList.gatewayDetailEmpty')" />
      </NSpin>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.close') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
