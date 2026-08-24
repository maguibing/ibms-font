<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { $t } from '@/locales';
import type { LoginSelectItem } from './login-select-list.types';

defineOptions({
  name: 'LoginSelectList'
});

interface Props {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  emptyDescription: string;
  items: LoginSelectItem[];
  loading?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  back: [];
  select: [item: LoginSelectItem];
}>();

const keyword = shallowRef('');
const selectedItemKey = shallowRef<string | null>(null);

const filteredItems = computed(() => {
  const pattern = keyword.value.trim().toLowerCase();

  if (!pattern) return props.items;

  return props.items.filter(item => {
    const title = item.title.toLowerCase();
    const subtitle = item.subtitle?.toLowerCase() || '';

    return title.includes(pattern) || subtitle.includes(pattern);
  });
});

function handleSelect(item: LoginSelectItem) {
  if (props.loading || item.disabled) return;

  selectedItemKey.value = item.key;
  emit('select', item);
}

function isCurrentItem(item: LoginSelectItem) {
  return selectedItemKey.value === item.key;
}

watch(
  () => props.loading,
  loading => {
    if (!loading) {
      selectedItemKey.value = null;
    }
  }
);
</script>

<template>
  <div>
    <div class="mb-4px text-26px text-black font-600 dark:text-white">{{ title }}</div>
    <div class="pb-12px text-14px text-#858585">{{ subtitle }}</div>

    <NInput v-model:value="keyword" clearable size="medium" :placeholder="searchPlaceholder" class="mb-10px">
      <template #prefix>
        <SvgIcon icon="material-symbols:search-rounded" class="text-18px text-#858585" />
      </template>
    </NInput>

    <div
      v-if="filteredItems.length"
      class="max-h-300px overflow-y-auto rounded-8px border border-#e5e7eb dark:border-#333"
    >
      <button
        v-for="item in filteredItems"
        :key="item.key"
        type="button"
        class="group box-border min-h-58px w-full flex items-center gap-10px border-b border-#eef0f4 bg-white px-12px py-9px text-left transition-colors last:border-b-0 hover:bg-primary-50 disabled:cursor-not-allowed dark:border-#333 dark:bg-#18181c dark:hover:bg-primary-900/30"
        :class="{
          'bg-primary-50 dark:bg-primary-900/30': isCurrentItem(item),
          'opacity-60': loading && !isCurrentItem(item),
          'opacity-45': item.disabled
        }"
        :disabled="loading || item.disabled"
        :aria-label="$t('page.login.selectList.ariaEnter', { name: item.title })"
        @click="handleSelect(item)"
      >
        <div class="min-w-0 flex-1">
          <div class="truncate text-15px text-black font-500 leading-20px dark:text-white">{{ item.title }}</div>
          <div v-if="item.subtitle" class="mt-2px truncate text-13px text-#858585 leading-18px">
            {{ item.subtitle }}
          </div>
        </div>
        <div
          class="size-28px flex-center shrink-0 rounded-full bg-primary-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white dark:bg-primary-900/40"
        >
          <NSpin v-if="loading && isCurrentItem(item)" :size="16" />
          <SvgIcon v-else icon="material-symbols:arrow-forward-rounded" class="text-19px" />
        </div>
      </button>
    </div>
    <NEmpty v-else :description="emptyDescription" class="py-28px" />

    <NButton size="medium" block class="mt-12px" @click="emit('back')">
      {{ $t('page.login.selectList.backLogin') }}
    </NButton>
  </div>
</template>

<style scoped></style>
