<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { fetchGetGatewayList } from '@/service/api/gateway';
import StatusTag from '@/components/custom/status-tag.vue';
import {
  GATEWAY_LINK_STATUS_MAP,
  GATEWAY_PROTOCOL_OPTIONS,
  GATEWAY_UNKNOWN_STATUS
} from '@/views/gateway/gateway-list/shared';

defineOptions({
  name: 'DeviceGatewayTree'
});

type GatewayGroup = {
  key: string;
  label: string;
  icon: string;
  protocolType: Api.Gateway.ProtocolType;
  gateways: Api.Gateway.Gateway[];
  loaded: boolean;
  expanded: boolean;
};

type GatewayTreeState = {
  listMap: Partial<Record<Api.Gateway.ProtocolType, Api.Gateway.Gateway[]>>;
  loadingMap: Partial<Record<Api.Gateway.ProtocolType, boolean>>;
  loadedMap: Partial<Record<Api.Gateway.ProtocolType, boolean>>;
};

const PROTOCOL_TREE_KEY_PREFIX = 'protocol-';
const gatewayStatusTagProps = { size: 'small', bordered: false } as const;

const protocolIconMap: Record<Api.Gateway.ProtocolType, string> = {
  1: 'lucide:radio-tower',
  2: 'lucide:server',
  3: 'lucide:webhook',
  4: 'lucide:cable',
  5: 'lucide:network',
  6: 'lucide:waypoints'
};

const selectedGatewayId = defineModel<CommonType.IdType | null>('selectedGatewayId', { required: true });

const emit = defineEmits<{
  change: [gatewayId: CommonType.IdType | null];
  'update:gateways': [gateways: Api.Gateway.Gateway[]];
  'update:loading': [loading: boolean];
}>();

const expandedTreeKeys = ref<string[]>([]);
const gatewayState = reactive<GatewayTreeState>({
  listMap: {},
  loadingMap: {},
  loadedMap: {}
});

const gatewayLoading = computed(() => Object.values(gatewayState.loadingMap).some(Boolean));

const gatewayList = computed(() => Object.values(gatewayState.listMap).flatMap(item => item ?? []));

const gatewayGroups = computed<GatewayGroup[]>(() => {
  return GATEWAY_PROTOCOL_OPTIONS.map(item => {
    const protocolType = item.value;
    const key = getProtocolTreeKey(protocolType);

    return {
      key,
      label: item.label,
      icon: protocolIconMap[protocolType],
      protocolType,
      gateways: gatewayState.listMap[protocolType] ?? [],
      loaded: Boolean(gatewayState.loadedMap[protocolType]),
      expanded: expandedTreeKeys.value.includes(key)
    };
  });
});

function getProtocolTreeKey(protocolType: Api.Gateway.ProtocolType) {
  return `${PROTOCOL_TREE_KEY_PREFIX}${protocolType}`;
}

function getProtocolTypeByTreeKey(key: string) {
  return Number(key.replace(PROTOCOL_TREE_KEY_PREFIX, '')) as Api.Gateway.ProtocolType;
}

watch(gatewayList, list => emit('update:gateways', list), { immediate: true });

watch(gatewayLoading, loading => emit('update:loading', loading), { immediate: true });

async function getGatewayData(protocolType: Api.Gateway.ProtocolType, force = false) {
  if (gatewayState.loadingMap[protocolType] || (!force && gatewayState.loadedMap[protocolType])) return;

  gatewayState.loadingMap[protocolType] = true;

  try {
    const limit = 200;
    let offset = 0;
    let total: number | null = null;
    const list: Api.Gateway.Gateway[] = [];

    while (total === null || list.length < total) {
      const { data: responseData, error } = await fetchGetGatewayList({
        list_option: {
          options: [
            { type: 104, value: '101' },
            { type: 7, value: String(protocolType) }
          ],
          offset,
          limit
        },
        options: [{ key: 1 }]
      });

      if (error) {
        return;
      }

      const currentList = Array.isArray(responseData?.list) ? responseData.list : [];
      total = typeof responseData?.paginate?.total === 'number' ? responseData.paginate.total : currentList.length;
      list.push(...currentList);

      if (currentList.length < limit) break;
      offset += limit;
    }

    gatewayState.listMap[protocolType] = list;
    gatewayState.loadedMap[protocolType] = true;
  } finally {
    gatewayState.loadingMap[protocolType] = false;
  }
}

function refreshExpandedGatewayData() {
  for (const key of expandedTreeKeys.value) {
    getGatewayData(getProtocolTypeByTreeKey(key), true);
  }
}

async function handleToggleProtocol(protocolType: Api.Gateway.ProtocolType) {
  const key = getProtocolTreeKey(protocolType);

  if (expandedTreeKeys.value.includes(key)) {
    expandedTreeKeys.value = expandedTreeKeys.value.filter(item => item !== key);
    return;
  }

  expandedTreeKeys.value = [...expandedTreeKeys.value, key];
  await getGatewayData(protocolType);
}

function handleSelectAllGateway() {
  handleSelectGateway(null);
}

function handleSelectGatewayItem(gateway: Api.Gateway.Gateway) {
  const gatewayId = gateway.id;

  handleSelectGateway(selectedGatewayId.value === gatewayId ? null : gatewayId);
}

function isGatewaySelected(gateway: Api.Gateway.Gateway) {
  return selectedGatewayId.value === gateway.id;
}

function handleSelectGateway(gatewayId: CommonType.IdType | null) {
  if (selectedGatewayId.value === gatewayId) return;

  selectedGatewayId.value = gatewayId;
  emit('change', gatewayId);
}

defineExpose({
  refreshExpandedGatewayData
});
</script>

<template>
  <div class="h-full min-h-0 flex-col-stretch gap-12px overflow-hidden">
    <NSpin class="gateway-tree h-full" :show="gatewayLoading">
      <div class="infinite-scroll h-full min-h-200px overflow-y-auto pr-4px">
        <button
          type="button"
          class="gateway-option"
          :class="{ 'is-active': selectedGatewayId === null }"
          :disabled="gatewayLoading"
          @click="handleSelectAllGateway"
        >
          <span class="min-w-0 flex-y-center gap-8px">
            <SvgIcon icon="lucide:layers" class="flex-none text-16px" />
            <span class="truncate">全部设备</span>
          </span>
        </button>

        <div v-for="group in gatewayGroups" :key="group.key" class="gateway-group">
          <button
            type="button"
            class="gateway-group__header"
            :disabled="gatewayLoading"
            @click="handleToggleProtocol(group.protocolType)"
          >
            <span class="min-w-0 flex-y-center gap-6px">
              <SvgIcon
                :icon="group.expanded ? 'lucide:chevron-down' : 'lucide:chevron-right'"
                class="flex-none text-15px"
              />
              <span class="truncate">{{ group.label }}</span>
            </span>
            <SvgIcon :icon="group.icon" class="flex-none text-16px" />
          </button>

          <div v-if="group.expanded" class="gateway-group__body">
            <template v-if="group.gateways.length">
              <button
                v-for="gateway in group.gateways"
                :key="gateway.id"
                type="button"
                class="gateway-item"
                :class="{ 'is-active': isGatewaySelected(gateway) }"
                :disabled="gatewayLoading"
                @click="handleSelectGatewayItem(gateway)"
              >
                <span class="min-w-0 flex-y-center gap-8px">
                  <SvgIcon
                    :icon="gateway.link_status === 2 ? 'ic:round-cloud-done' : 'ic:round-cloud-off'"
                    class="flex-none text-16px"
                    :class="gateway.link_status === 2 ? 'text-success' : 'text-error-200'"
                  />
                  <span class="gateway-item__name">{{ gateway.name || '-' }}</span>
                </span>
                <StatusTag
                  :value="gateway.link_status"
                  :status-map="GATEWAY_LINK_STATUS_MAP"
                  :unknown="GATEWAY_UNKNOWN_STATUS"
                  :tag-props="gatewayStatusTagProps"
                />
              </button>
            </template>
            <NEmpty v-else-if="group.loaded" description="暂无边缘设备" size="small" class="gateway-empty" />
          </div>
        </div>
      </div>
    </NSpin>
  </div>
</template>

<style scoped lang="scss">
.gateway-tree {
  :deep(.n-spin-content) {
    height: 100%;
  }

  .infinite-scroll {
    height: calc(100vh - 228px - var(--calc-footer-height, 0px)) !important;
    max-height: calc(100vh - 228px - var(--calc-footer-height, 0px)) !important;
  }

  @media screen and (max-width: 1024px) {
    .infinite-scroll {
      height: calc(100vh - 227px - var(--calc-footer-height, 0px)) !important;
      max-height: calc(100vh - 227px - var(--calc-footer-height, 0px)) !important;
    }
  }
}

.gateway-option,
.gateway-group__header,
.gateway-item {
  width: 100%;
  min-width: 0;
  border: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  color: var(--n-text-color-2);
  cursor: pointer;
  text-align: left;
  transition:
    background-color 0.2s,
    color 0.2s;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.72;
  }

  &:hover:not(:disabled) {
    background-color: rgba(100, 116, 139, 0.1);
    color: var(--n-text-color-1);
  }

  &.is-active {
    background-color: rgb(var(--primary-color, 24 160 88) / 12%);
    color: rgb(var(--primary-color, 24 160 88));
  }
}

.gateway-option {
  height: 34px;
  padding: 0 10px;
  border-radius: 6px;
}

.gateway-group {
  margin-top: 6px;
}

.gateway-group__header {
  height: 32px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.gateway-group__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0 4px 22px;
}

.gateway-item {
  min-height: 34px;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 6px;
}

.gateway-item__name {
  min-width: 0;
  overflow: hidden;
  color: inherit;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gateway-empty {
  min-height: 82px;
  justify-content: center;
}
</style>
