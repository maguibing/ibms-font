<script setup lang="ts">
/** 表格与卡片视图切换，并同步对应的分页数量。 */
defineOptions({
  name: 'TableCardViewSwitch'
});

interface Props {
  /** 表格模式默认分页数量 */
  tablePageSize?: number;
  /** 卡片模式默认分页数量 */
  cardPageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  tablePageSize: 10,
  cardPageSize: 15
});

const viewMode = defineModel<'table' | 'card'>({ required: true });
const page = defineModel<number | undefined>('page');
const pageSize = defineModel<number | undefined>('pageSize');

/**
 * 切换视图并重置分页。
 *
 * @param mode 目标视图
 */
function changeViewMode(mode: 'table' | 'card') {
  if (viewMode.value === mode) return;

  viewMode.value = mode;
  pageSize.value = mode === 'card' ? props.cardPageSize : props.tablePageSize;
  page.value = 1;
}
</script>

<template>
  <NButtonGroup>
    <NTooltip>
      <template #trigger>
        <NButton
          circle
          size="small"
          :type="viewMode === 'table' ? 'primary' : 'default'"
          @click="changeViewMode('table')"
        >
          <template #icon>
            <SvgIcon icon="lucide:table" />
          </template>
        </NButton>
      </template>
      表格视图
    </NTooltip>
    <NTooltip>
      <template #trigger>
        <NButton
          circle
          size="small"
          :type="viewMode === 'card' ? 'primary' : 'default'"
          @click="changeViewMode('card')"
        >
          <template #icon>
            <SvgIcon icon="material-symbols:grid-view-rounded" />
          </template>
        </NButton>
      </template>
      卡片视图
    </NTooltip>
  </NButtonGroup>
</template>

<style scoped></style>
