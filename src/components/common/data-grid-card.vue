<script setup lang="ts">
import { useThemeStore } from '@/store/modules/theme';

/** 通用网格卡片外壳，统一图标位、选择态和操作区样式。 */
defineOptions({
  name: 'DataGridCard'
});

const themeStore = useThemeStore();

interface Props {
  /** 是否选中 */
  checked?: boolean;
  /** 是否显示选择框 */
  selectable?: boolean;
  /** 是否支持点击卡片 */
  clickable?: boolean;
}

withDefaults(defineProps<Props>(), {
  checked: false,
  selectable: false,
  clickable: false
});

defineSlots<{
  /** 左侧图标 */
  icon?(): any;
  /** 业务内容 */
  default(): any;
  /** 底部操作 */
  actions?(): any;
}>();

const emit = defineEmits<{
  'update:checked': [checked: boolean];
  /** 点击卡片主体 */
  click: [];
}>();
</script>

<template>
  <article
    class="h-full min-w-0 flex flex-col overflow-hidden border border-solid"
    :style="{ borderRadius: `${themeStore.themeRadius}px` }"
    :class="[
      checked
        ? 'border-[rgba(100,116,139,0.42)]'
        : 'border-[rgba(148,163,184,0.18)] hover:border-[rgba(148,163,184,0.28)]',
      { 'cursor-pointer': clickable }
    ]"
    @click="clickable && emit('click')"
  >
    <div class="relative flex min-h-136px items-center gap-16px px-18px py-16px">
      <div v-if="selectable" class="absolute right-12px top-10px" @click.stop>
        <NCheckbox :checked="checked" @update:checked="emit('update:checked', $event)" />
      </div>
      <div
        v-if="$slots.icon"
        class="h-60px w-60px flex shrink-0 items-center justify-center rounded-14px border border-solid border-[rgba(148,163,184,0.14)] text-[var(--n-text-color-2)]"
      >
        <slot name="icon" />
      </div>
      <div class="min-w-0 flex-1" :class="{ 'pr-20px': selectable }">
        <slot />
      </div>
    </div>

    <footer
      v-if="$slots.actions"
      class="flex justify-end gap-10px border-t border-solid border-[rgba(148,163,184,0.13)] px-12px py-9px"
      @click.stop
    >
      <slot name="actions" />
    </footer>
  </article>
</template>

<style scoped></style>
