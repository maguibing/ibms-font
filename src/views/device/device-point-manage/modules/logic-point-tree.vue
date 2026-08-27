<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue';
import type { TreeOption } from 'naive-ui';
import { fetchGetLogicPointTree } from '@/service/api/device';

defineOptions({
  name: 'LogicPointTree'
});

type LogicPointTreeSelection = {
  id: CommonType.IdType;
  type: 1 | 2;
};

type LogicPointTreeOption = TreeOption & {
  key: string;
  label: string;
  name: string;
  pointKey: string;
  pointId: CommonType.IdType;
  nodeType: number;
  children?: LogicPointTreeOption[];
};

const selectedNode = defineModel<LogicPointTreeSelection | null>('selectedNode', { required: true });

const treeKeyword = shallowRef('');
const treeLoading = shallowRef(false);
const expandedTreeKeys = shallowRef<Array<string | number>>([]);
const treeData = shallowRef<LogicPointTreeOption[]>([]);

const selectable = computed(() => !treeLoading.value);
const selectedTreeKeys = computed(() =>
  selectedNode.value ? [`${selectedNode.value.type}-${selectedNode.value.id}`] : []
);

function getTreeKey(node: Api.Device.LogicPointTreeNode) {
  return `${node.type}-${node.id}`;
}

function logicPointFilter(pattern: string, node: TreeOption) {
  const keyword = pattern.trim().toLowerCase();
  const name = String(node.name || '').toLowerCase();
  const key = String(node.pointKey || '').toLowerCase();

  return name.includes(keyword) || key.includes(keyword);
}

function transformTreeNode(node: Api.Device.LogicPointTreeNode): LogicPointTreeOption {
  const treeNode: LogicPointTreeOption = {
    key: getTreeKey(node),
    label: node.name,
    name: node.name,
    pointKey: node.key,
    pointId: node.id,
    nodeType: node.type
  };

  if (node.type === 1 && node.children) {
    const children = node.children.filter(child => child.type === 2).map(child => transformTreeNode(child));

    if (children.length) {
      treeNode.children = children;
    }
  }

  return treeNode;
}

async function getTreeData() {
  if (treeLoading.value) return;

  treeLoading.value = true;

  try {
    const { data: responseData, error } = await fetchGetLogicPointTree();
    const data = error ? [] : responseData.trees.map(item => transformTreeNode(item));

    treeData.value = data;
    expandedTreeKeys.value = [];
    selectedNode.value = null;
  } catch {
    treeData.value = [];
    expandedTreeKeys.value = [];
    selectedNode.value = null;
  } finally {
    treeLoading.value = false;
  }
}

function handleUpdateSelectedKeys(_: Array<string | number>, options: Array<TreeOption | null>) {
  const selectedOption = options[0] as LogicPointTreeOption | null;

  selectedNode.value =
    selectedOption?.nodeType === 1 || selectedOption?.nodeType === 2
      ? { id: selectedOption.pointId, type: selectedOption.nodeType }
      : null;
}

defineExpose({
  refresh: getTreeData
});

onMounted(() => {
  getTreeData();
});
</script>

<template>
  <div class="h-full min-h-0 flex-col-stretch gap-12px overflow-hidden">
    <NInput v-model:value="treeKeyword" clearable :placeholder="$t('common.keywordSearch')" />
    <NSpin class="logic-point-tree" :show="treeLoading">
      <NTree
        v-model:expanded-keys="expandedTreeKeys"
        :selected-keys="selectedTreeKeys"
        block-node
        show-line
        :data="treeData"
        :show-irrelevant-nodes="false"
        :pattern="treeKeyword"
        :filter="logicPointFilter"
        :selectable="selectable"
        class="infinite-scroll h-full min-h-200px overflow-auto"
        @update:selected-keys="handleUpdateSelectedKeys"
      >
        <template #empty>
          <NEmpty description="暂无逻辑点位树" class="h-full min-h-200px justify-center" />
        </template>
      </NTree>
    </NSpin>
  </div>
</template>

<style scoped lang="scss">
.logic-point-tree {
  :deep(.n-tree__empty) {
    height: 100%;
    justify-content: center;
  }

  :deep(.n-spin-content) {
    height: 100%;
  }

  :deep(.infinite-scroll) {
    height: calc(100vh - 240px - var(--calc-footer-height, 0px)) !important;
    max-height: calc(100vh - 240px - var(--calc-footer-height, 0px)) !important;
  }

  @media screen and (max-width: 1024px) {
    :deep(.infinite-scroll) {
      height: calc(100vh - 239px - var(--calc-footer-height, 0px)) !important;
      max-height: calc(100vh - 239px - var(--calc-footer-height, 0px)) !important;
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
