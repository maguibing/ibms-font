<script setup lang="tsx">
import { computed, reactive, ref, watch } from 'vue';
import type { TreeOption } from 'naive-ui';
import { fetchGetGatewayList } from '@/service/api/gateway';
import { GATEWAY_PROTOCOL_OPTIONS } from '@/views/gateway/gateway-list/shared';

defineOptions({
  name: 'DeviceGatewayTree'
});

type GatewayTreeOption = TreeOption & {
  key: string;
  label: string;
  protocolType: Api.Gateway.ProtocolType;
  gateway?: Api.Gateway.Gateway;
  children?: GatewayTreeOption[];
};

type GatewayTreeState = {
  listMap: Partial<Record<Api.Gateway.ProtocolType, Api.Gateway.Gateway[]>>;
  loadingMap: Partial<Record<Api.Gateway.ProtocolType, boolean>>;
  loadedMap: Partial<Record<Api.Gateway.ProtocolType, boolean>>;
};

const PROTOCOL_TREE_KEY_PREFIX = 'protocol-';
const GATEWAY_TREE_KEY_PREFIX = 'gateway-';
const EMPTY_TREE_KEY_PREFIX = 'empty-';

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

const selectedTreeKeys = computed(() =>
  selectedGatewayId.value ? [getGatewayTreeKey(selectedGatewayId.value)] : []
);

const gatewayTreeData = computed<GatewayTreeOption[]>(() => {
  return GATEWAY_PROTOCOL_OPTIONS.map(item => {
    const protocolType = item.value;
    const loaded = gatewayState.loadedMap[protocolType];
    const gatewayChildren = gatewayState.listMap[protocolType] ?? [];
    const children = gatewayChildren.length
      ? gatewayChildren.map(gateway => ({
          key: getGatewayTreeKey(gateway.id),
          label: gateway.name || '-',
          protocolType,
          gateway,
          isLeaf: true
        }))
      : [
          {
            key: getEmptyTreeKey(protocolType),
            label: '暂无边缘设备',
            protocolType,
            disabled: true,
            isLeaf: true
          }
        ];

    return {
      key: getProtocolTreeKey(protocolType),
      label: item.label,
      protocolType,
      isLeaf: false,
      children: loaded ? children : undefined
    };
  });
});

function getProtocolTreeKey(protocolType: Api.Gateway.ProtocolType) {
  return `${PROTOCOL_TREE_KEY_PREFIX}${protocolType}`;
}

function getGatewayTreeKey(gatewayId: CommonType.IdType) {
  return `${GATEWAY_TREE_KEY_PREFIX}${gatewayId}`;
}

function getEmptyTreeKey(protocolType: Api.Gateway.ProtocolType) {
  return `${EMPTY_TREE_KEY_PREFIX}${protocolType}`;
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

async function handleLoadGatewayTreeNode(option: TreeOption) {
  const protocolType = option.protocolType as Api.Gateway.ProtocolType | undefined;
  if (option.gateway || !protocolType) return;

  await getGatewayData(protocolType);
}

function refreshExpandedGatewayData() {
  for (const key of expandedTreeKeys.value) {
    getGatewayData(getProtocolTypeByTreeKey(key), true);
  }
}

function handleUpdateSelectedTreeKeys(_: Array<string | number>, options: Array<TreeOption | null>) {
  const gateway = options.find(option => option?.gateway)?.gateway as Api.Gateway.Gateway | undefined;
  handleSelectGateway(gateway?.id ?? null);
}

function handleTreeNodeClickBehavior({ option }: { option: TreeOption }) {
  return option.gateway ? 'toggleSelect' : 'toggleExpand';
}

function renderGatewayTreeSuffix({ option }: { option: TreeOption }) {
  const gateway = option.gateway as Api.Gateway.Gateway | undefined;
  if (!gateway) return null;

  if (gateway.link_status === 2) {
    return <SvgIcon icon="ic:round-cloud-done" class="text-16px text-success" />;
  }

  return <SvgIcon icon="ic:round-cloud-off" class="text-16px text-error-200" />;
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
    <NSpin class="gateway-tree" :show="gatewayLoading">
      <NTree
        v-model:expanded-keys="expandedTreeKeys"
        :data="gatewayTreeData"
        :selected-keys="selectedTreeKeys"
        :on-load="handleLoadGatewayTreeNode"
        :render-suffix="renderGatewayTreeSuffix"
        :override-default-node-click-behavior="handleTreeNodeClickBehavior"
        :selectable="!gatewayLoading"
        block-node
        show-line
        virtual-scroll
        class="infinite-scroll h-full min-h-200px"
        @update:selected-keys="handleUpdateSelectedTreeKeys"
      >
        <template #empty>
          <NEmpty description="暂无边缘设备" class="h-full min-h-200px justify-center" />
        </template>
      </NTree>
    </NSpin>
  </div>
</template>

<style scoped lang="scss">
.gateway-tree {
  .n-button {
    --n-padding: 8px !important;
  }

  :deep(.n-tree__empty) {
    height: 100%;
    justify-content: center;
  }

  :deep(.n-spin-content) {
    height: 100%;
  }

  :deep(.infinite-scroll) {
    height: calc(100vh - 228px - var(--calc-footer-height, 0px)) !important;
    max-height: calc(100vh - 228px - var(--calc-footer-height, 0px)) !important;
  }

  @media screen and (max-width: 1024px) {
    :deep(.infinite-scroll) {
      height: calc(100vh - 227px - var(--calc-footer-height, 0px)) !important;
      max-height: calc(100vh - 227px - var(--calc-footer-height, 0px)) !important;
    }
  }

  :deep(.n-tree-node) {
    height: 30px;
  }

  :deep(.n-tree-node-switcher) {
    height: 30px;
  }

  :deep(.n-tree-node-switcher__icon) {
    font-size: 16px !important;
    height: 16px !important;
    width: 16px !important;
  }
}
</style>
