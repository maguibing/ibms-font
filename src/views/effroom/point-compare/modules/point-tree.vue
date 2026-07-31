<script setup lang="ts">
import { computed, h, onMounted, shallowRef } from 'vue';
import { NEllipsis, NTag } from 'naive-ui';
import type { TreeOption } from 'naive-ui';
import { fetchGetLogicPointTree } from '@/service/api/device';
import { transformPointTree } from './point-compare-utils';
import type { PointTreeOption } from './point-compare-utils';

defineOptions({
  name: 'PointCompareTree'
});

export type SelectedPoint = {
  key: string;
  name: string;
};

const selectedPoints = defineModel<SelectedPoint[]>('selectedPoints', { required: true });

const MAX_POINTS = 10;
const keyword = shallowRef('');
const loading = shallowRef(false);
const checkedKeys = shallowRef<Array<string | number>>([]);
const treeData = shallowRef<PointTreeOption[]>([]);
const pointMap = computed(() => {
  const map = new Map<string | number, PointTreeOption>();

  function collect(nodes: PointTreeOption[]) {
    nodes.forEach(node => {
      map.set(node.key, node);
      if (node.children) collect(node.children);
    });
  }

  collect(treeData.value);
  return map;
});

function filterPoint(pattern: string, node: TreeOption) {
  const normalizedPattern = pattern.trim().toLowerCase();
  const option = node as PointTreeOption;

  return (
    option.name.toLowerCase().includes(normalizedPattern) || option.pointKey.toLowerCase().includes(normalizedPattern)
  );
}

function renderLabel({ option }: { option: TreeOption }) {
  const point = option as PointTreeOption;

  return h('div', { class: 'min-w-0 flex flex-1 items-center gap-8px' }, [
    h(NEllipsis, { class: 'min-w-0 flex-1' }, { default: () => point.name }),
    point.nodeType === 3 ? h(NTag, { size: 'small', type: 'info', bordered: false }, { default: () => '数值' }) : null
  ]);
}

function handleCheckedKeys(keys: Array<string | number>) {
  const selectableKeys = keys.filter(key => pointMap.value.get(key)?.nodeType === 3);
  const nextKeys = selectableKeys.slice(0, MAX_POINTS);

  if (selectableKeys.length > MAX_POINTS) {
    window.$message?.warning(`最多选择 ${MAX_POINTS} 个点位`);
  }

  checkedKeys.value = nextKeys;
  selectedPoints.value = nextKeys.map(key => {
    const point = pointMap.value.get(key)!;
    return { key: point.pointKey, name: point.name };
  });
}

async function getTreeData() {
  loading.value = true;

  try {
    const { data, error } = await fetchGetLogicPointTree({
      filter_not_storage: true,
      data_type_list: [1]
    });
    treeData.value = error ? [] : transformPointTree(data.trees ?? []);
    checkedKeys.value = [];
    selectedPoints.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(getTreeData);
</script>

<template>
  <div class="h-full min-h-0 flex-col-stretch gap-12px overflow-hidden">
    <NInput v-model:value="keyword" clearable placeholder="搜索点位名称或标识">
      <template #prefix>
        <SvgIcon icon="material-symbols:search-rounded" />
      </template>
    </NInput>

    <NSpin class="point-tree min-h-0 flex-1" :show="loading">
      <NTree
        :checked-keys="checkedKeys"
        :data="treeData"
        :pattern="keyword"
        :filter="filterPoint"
        :render-label="renderLabel"
        :show-irrelevant-nodes="false"
        block-line
        cascade
        checkable
        show-line
        virtual-scroll
        class="point-tree-scroll min-h-200px overflow-auto py-4px"
        @update:checked-keys="handleCheckedKeys"
      >
        <template #empty>
          <NEmpty description="暂无可选点位" class="h-full justify-center" />
        </template>
      </NTree>
    </NSpin>

    <div class="shrink-0 text-12px text-[var(--n-text-color-3)]">
      已选 {{ selectedPoints.length }} / {{ MAX_POINTS }}
    </div>
  </div>
</template>

<style scoped>
.point-tree :deep(.n-spin-content),
.point-tree :deep(.n-spin-container) {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.point-tree :deep(.point-tree-scroll) {
  height: calc(100vh - 240px - var(--calc-footer-height, 0px));
  max-height: calc(100vh - 240px - var(--calc-footer-height, 0px));
}

@media screen and (max-width: 1024px) {
  .point-tree :deep(.point-tree-scroll) {
    height: min(480px, calc(100vh - 240px - var(--calc-footer-height, 0px)));
    max-height: min(480px, calc(100vh - 240px - var(--calc-footer-height, 0px)));
  }
}
</style>
