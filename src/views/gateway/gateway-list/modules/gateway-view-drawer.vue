<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import StatusTag from '@/components/custom/status-tag.vue';
import { useLoading } from '@sa/hooks';
import { copyText, isClipboardSupported } from '@sa/utils';
import { fetchGetGateway } from '@/service/api/gateway';
import { $t } from '@/locales';
import { displayValue } from '@/utils/common-methods';
import CopyableValue from '@/components/custom/copyable-value.vue';
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
  return protocolType.value ? `${getGatewayProtocolLabel(protocolType.value)} 配置` : '协议配置';
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

function closeDrawer() {
  visible.value = false;
}

function formatBoolean(value?: boolean | null) {
  return value ? '是' : '否';
}

function formatRecord(record?: Record<string, string> | null) {
  const entries = recordEntries(record);

  return entries.length ? entries.map(([key, value]) => `${key}: ${value}`).join('；') : '-';
}

function recordEntries(record?: Record<string, string> | null) {
  return Object.entries(record || {});
}

function getOptionLabel<T extends string | number>(options: CommonType.Option<T, string>[], value?: T | null) {
  if (value === null || value === undefined) return '标准格式';
  return options.find(item => item.value === value)?.label ?? displayValue(value);
}

async function copyMqttBasicInfo() {
  const currentGateway = gateway.value;
  const mqtt = protocol.value?.mqtt;
  const values = [
    ['主机域名', mqtt?.domain],
    ['端口', mqtt?.port],
    ['主题', currentGateway?.p_key],
    ['标识', currentGateway?.key],
    ['用户名', currentGateway?.username],
    ['密码', currentGateway?.password]
  ] satisfies [string, string | number | null | undefined][];

  if (values.every(([, value]) => !String(value ?? '').trim())) {
    window.$message?.warning('暂无可复制的 MQTT 信息');
    return;
  }

  if (!isClipboardSupported()) {
    window.$message?.error('当前浏览器不支持复制');
    return;
  }

  const copied = await copyText(values.map(([label, value]) => `${label}: ${String(value ?? '').trim()}`).join('\n'));
  if (copied) {
    window.$message?.success('复制成功');
    return;
  }

  window.$message?.error('复制失败，请手动复制');
}

async function getGatewayDetail(id: CommonType.IdType) {
  startLoading();
  const { data, error } = await fetchGetGateway({ id, options: [{ key: 1 }, { key: 2 }] }).finally(endLoading);

  if (error) {
    window.$message?.error('边缘设备详情获取失败');
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
  <NDrawer v-model:show="visible" title="查看边缘设备" display-directive="show" :width="760" class="max-w-90%">
    <NDrawerContent title="查看边缘设备" :native-scrollbar="false" closable>
      <NSpin :show="loading">
        <div v-if="gateway" class="flex-col gap-18px">
          <div>
            <SectionHeader :title="protocolTitle" extra-class="mb-10px">
              <template #actions>
                <NButton v-if="isMqtt" type="primary" secondary size="small" @click="copyMqttBasicInfo">
                  <template #icon>
                    <SvgIcon icon="ep:copy-document" />
                  </template>
                  一键复制
                </NButton>
              </template>
            </SectionHeader>
            <NDescriptions label-placement="left" bordered size="small" :column="2" label-class="w-100px">
              <NDescriptionsItem label="名称">{{ displayValue(gateway.name) }}</NDescriptionsItem>
              <NDescriptionsItem label="协议">{{ getGatewayProtocolLabel(gateway.protocol_type) }}</NDescriptionsItem>
              <NDescriptionsItem label="设备Key">
                <CopyableValue :value="gateway.key" />
              </NDescriptionsItem>
              <NDescriptionsItem label="主题">
                <CopyableValue :value="gateway.p_key" />
              </NDescriptionsItem>
              <NDescriptionsItem label="用户名">
                <CopyableValue :value="gateway.username" />
              </NDescriptionsItem>
              <NDescriptionsItem label="密码">
                <CopyableValue :value="gateway.password" />
              </NDescriptionsItem>
              <NDescriptionsItem label="状态">
                <StatusTag :value="gateway.status" :unknown="GATEWAY_UNKNOWN_STATUS" />
              </NDescriptionsItem>
              <NDescriptionsItem label="所属空间">{{ spaceName }}</NDescriptionsItem>

              <NDescriptionsItem label="描述" :span="2">
                <span class="whitespace-pre-line">{{ displayValue(gateway.desc) }}</span>
              </NDescriptionsItem>
            </NDescriptions>
          </div>

          <div v-if="protocol">
            <SectionHeader :title="protocolTitle" extra-class="mb-10px" />

            <NDescriptions v-if="isMqtt" label-placement="left" bordered size="small" :column="2" label-class="w-120px">
              <NDescriptionsItem label="主机域名">
                <CopyableValue :value="protocol.mqtt?.domain" />
              </NDescriptionsItem>
              <NDescriptionsItem label="端口">
                <CopyableValue :value="protocol.mqtt?.port" />
              </NDescriptionsItem>
            </NDescriptions>

            <NDescriptions
              v-else-if="isHttpServer"
              label-placement="left"
              bordered
              size="small"
              :column="2"
              label-class="w-120px"
            >
              <NDescriptionsItem label="地址">
                <CopyableValue :value="protocol.http_server?.addr" />
              </NDescriptionsItem>
              <NDescriptionsItem label="路径">
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
              <NDescriptionsItem label="服务地址">
                <CopyableValue :value="protocol.http_client?.server" />
              </NDescriptionsItem>
              <NDescriptionsItem label="请求超时">
                {{ displayValue(protocol.http_client?.timeout) }} 秒
              </NDescriptionsItem>
              <NDescriptionsItem label="轮询间隔">
                {{ displayValue(protocol.http_client?.poll_interval) }} 秒
              </NDescriptionsItem>
              <NDescriptionsItem label="令牌鉴权">
                {{ formatBoolean(protocol.http_client?.token?.is_enable) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="令牌请求方法">
                {{ displayValue(protocol.http_client?.token?.method) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="令牌请求路径" :span="2">
                <CopyableValue :value="protocol.http_client?.token?.path" />
              </NDescriptionsItem>
              <NDescriptionsItem label="令牌字段">
                {{ displayValue(protocol.http_client?.token?.token_field) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="过期字段">
                {{ displayValue(protocol.http_client?.token?.expire_field) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="过期秒数">
                {{ displayValue(protocol.http_client?.token?.expire_seconds) }} 秒
              </NDescriptionsItem>
              <NDescriptionsItem label="轮询请求方法">
                {{ displayValue(protocol.http_client?.poll_route?.method) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="轮询请求路径" :span="2">
                <CopyableValue :value="protocol.http_client?.poll_route?.path" />
              </NDescriptionsItem>
              <NDescriptionsItem label="轮询认证">
                {{ formatBoolean(protocol.http_client?.poll_route?.with_auth) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="轮询令牌位置">
                {{ getOptionLabel(tokenPlacementOptions, protocol.http_client?.poll_route?.token_placement) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="轮询令牌字段">
                {{ displayValue(protocol.http_client?.poll_route?.token_key) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="下发请求方法">
                {{ displayValue(protocol.http_client?.send_route?.method) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="下发请求路径" :span="2">
                <CopyableValue :value="protocol.http_client?.send_route?.path" />
              </NDescriptionsItem>
              <NDescriptionsItem label="下发认证">
                {{ formatBoolean(protocol.http_client?.send_route?.with_auth) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="下发令牌位置">
                {{ getOptionLabel(tokenPlacementOptions, protocol.http_client?.send_route?.token_placement) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="下发令牌字段">
                {{ displayValue(protocol.http_client?.send_route?.token_key) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="请求头" :span="2">
                {{ formatRecord(protocol.http_client?.token?.headers) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="请求体" :span="2">
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
            </NDescriptions>

            <NDescriptions
              v-else-if="isModbus"
              label-placement="left"
              bordered
              size="small"
              :column="2"
              label-class="w-120px"
            >
              <NDescriptionsItem label="主机">{{ displayValue(protocol.modbus?.tcp?.host) }}</NDescriptionsItem>
              <NDescriptionsItem label="端口">{{ displayValue(protocol.modbus?.tcp?.port) }}</NDescriptionsItem>
              <NDescriptionsItem label="轮询间隔">
                {{ displayValue(protocol.modbus?.poll_interval) }} 秒
              </NDescriptionsItem>
              <NDescriptionsItem label="超时时间">{{ displayValue(protocol.modbus?.timeout) }} 秒</NDescriptionsItem>
            </NDescriptions>

            <NDescriptions
              v-else-if="isBacnet"
              label-placement="left"
              bordered
              size="small"
              :column="2"
              label-class="w-120px"
            >
              <NDescriptionsItem label="目标地址">
                {{ displayValue(protocol.bacnet?.ip?.interface_name) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="本机地址">
                {{ displayValue(protocol.bacnet?.ip?.local_addr) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="目标端口">
                {{ displayValue(protocol.bacnet?.ip?.local_port) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="轮询间隔">
                {{ displayValue(protocol.bacnet?.poll_interval) }} 秒
              </NDescriptionsItem>
              <NDescriptionsItem label="超时时间">{{ displayValue(protocol.bacnet?.timeout) }} 秒</NDescriptionsItem>
            </NDescriptions>

            <NDescriptions
              v-else-if="isOpcUa"
              label-placement="left"
              bordered
              size="small"
              :column="2"
              label-class="w-120px"
            >
              <NDescriptionsItem label="服务端地址">{{ displayValue(protocol.opcua?.endpoint_url) }}</NDescriptionsItem>
              <NDescriptionsItem label="认证类型">
                {{ getOptionLabel(opcUaAuthTypeOptions, protocol.opcua?.authentication?.auth_type) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="用户名">
                <CopyableValue :value="protocol.opcua?.authentication?.user_auth?.username" />
              </NDescriptionsItem>
              <NDescriptionsItem label="密码">
                <CopyableValue :value="protocol.opcua?.authentication?.user_auth?.password" />
              </NDescriptionsItem>
              <NDescriptionsItem label="安全模式">
                {{ getOptionLabel(opcUaSecurityModeOptions, protocol.opcua?.security_policy?.mode) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="安全策略URI" :span="2">
                {{ displayValue(protocol.opcua?.security_policy?.policy_uri) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="自动发现">
                {{ formatBoolean(protocol.opcua?.is_auto_discovery) }}
              </NDescriptionsItem>
              <NDescriptionsItem label="订阅">{{ formatBoolean(protocol.opcua?.is_subscription) }}</NDescriptionsItem>
              <NDescriptionsItem label="轮询间隔">
                {{ displayValue(protocol.opcua?.poll_interval) }} 秒
              </NDescriptionsItem>
              <NDescriptionsItem label="请求超时">
                {{ displayValue(protocol.opcua?.request_timeout) }} 秒
              </NDescriptionsItem>
              <NDescriptionsItem label="会话超时">
                {{ displayValue(protocol.opcua?.session_timeout) }} 秒
              </NDescriptionsItem>
              <NDescriptionsItem label="连接超时">{{ displayValue(protocol.opcua?.timeout) }} 秒</NDescriptionsItem>
            </NDescriptions>

            <NEmpty v-else description="暂无协议配置" />
          </div>
        </div>

        <NEmpty v-else-if="!loading" description="暂无边缘设备详情" />
      </NSpin>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.close') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
