<script setup lang="ts" generic="T">
import { computed } from 'vue';
import type { PaginationProps } from 'naive-ui';
import { $t } from '@/locales';

type DataGridRowKey = string | number;

/** 通用分页网格，负责数据遍历、选择、加载态和滚动区域。 */
defineOptions({
  name: 'DataGrid'
});

interface Props {
  /** 当前页数据 */
  data: T[];
  /** 获取数据唯一标识 */
  rowKey: (row: T) => DataGridRowKey;
  /** 是否加载中 */
  loading?: boolean;
  /** 分页配置，false 时隐藏分页 */
  pagination?: PaginationProps | false;
  /** 是否支持多选 */
  selectable?: boolean;
  /** 空数据提示 */
  emptyDescription?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pagination: false,
  selectable: false,
  emptyDescription: undefined
});

defineSlots<{
  /** 单项内容，提供选择状态和切换方法 */
  default(props: { item: T; index: number; checked: boolean; toggleChecked: (checked: boolean) => void }): any;
}>();

/** 已选数据标识，与表格共用同一选择状态。 */
const checkedRowKeys = defineModel<DataGridRowKey[]>('checkedRowKeys', {
  default: () => []
});

const pageRowKeys = computed(() => props.data.map(item => props.rowKey(item)));
const pageSelection = computed(() => {
  const selectedCount = pageRowKeys.value.filter(key => checkedRowKeys.value.includes(key)).length;

  return {
    checked: pageRowKeys.value.length > 0 && selectedCount === pageRowKeys.value.length,
    indeterminate: selectedCount > 0 && selectedCount < pageRowKeys.value.length
  };
});

function isRowChecked(item: T) {
  return checkedRowKeys.value.includes(props.rowKey(item));
}

/**
 * 切换单项选择状态。
 *
 * @param item 当前项
 * @param checked 是否选中
 */
function handleRowCheck(item: T, checked: boolean) {
  const rowKey = props.rowKey(item);

  if (checked) {
    if (!checkedRowKeys.value.includes(rowKey)) {
      checkedRowKeys.value = [...checkedRowKeys.value, rowKey];
    }

    return;
  }

  checkedRowKeys.value = checkedRowKeys.value.filter(key => key !== rowKey);
}

/**
 * 切换当前页全选状态，保留其他页已选项。
 *
 * @param checked 是否全选
 */
function handlePageCheck(checked: boolean) {
  const pageRowKeySet = new Set(pageRowKeys.value);

  if (!checked) {
    checkedRowKeys.value = checkedRowKeys.value.filter(key => !pageRowKeySet.has(key));
    return;
  }

  checkedRowKeys.value = [
    ...checkedRowKeys.value,
    ...pageRowKeys.value.filter(key => !checkedRowKeys.value.includes(key))
  ];
}
</script>

<template>
  <div class="data-grid min-h-0 flex flex-col">
    <div v-if="selectable && data.length" class="flex shrink-0 items-center px-2px pb-10px">
      <NCheckbox
        :checked="pageSelection.checked"
        :indeterminate="pageSelection.indeterminate"
        :disabled="loading"
        @update:checked="handlePageCheck"
      >
        {{ $t('common.selectAll') }}
      </NCheckbox>
    </div>

    <NSpin :show="loading" class="data-grid-spin min-h-0 flex-1">
      <div v-if="data.length" class="data-grid-scroll min-h-0 flex-1 overflow-auto p-4px pr-6px">
        <div class="data-grid-list">
          <template v-for="(item, index) in data" :key="rowKey(item)">
            <slot
              :item="item"
              :index="index"
              :checked="isRowChecked(item)"
              :toggle-checked="checked => handleRowCheck(item, checked)"
            />
          </template>
        </div>
      </div>
      <NEmpty v-else-if="!loading" :description="emptyDescription" class="h-full flex-center" />
    </NSpin>

    <NPagination v-if="pagination && data.length" v-bind="pagination" class="shrink-0 justify-end pt-12px" />
  </div>
</template>

<style scoped>
/* 补齐 Card、Spin 和滚动容器的可收缩高度链。 */
.data-grid {
  height: 100%;
}

.data-grid-spin {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.data-grid-spin :deep(.n-spin-content) {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.data-grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

@media (max-width: 640px) {
  .data-grid-list {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
