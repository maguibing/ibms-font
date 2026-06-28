<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';

defineOptions({
  name: 'CorpLoginList'
});

interface Props {
  corpList: Api.Auth.CorpLoginItem[];
  loading?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  back: [];
  select: [item: Api.Auth.CorpLoginItem];
}>();

const keyword = shallowRef('');
const selectedItemKey = shallowRef<string | null>(null);

const filteredCorpList = computed(() => {
  const pattern = keyword.value.trim().toLowerCase();

  if (!pattern) return props.corpList;

  return props.corpList.filter(item => {
    const corpName = item.corp.name.toLowerCase();
    const username = item.user.username.toLowerCase();

    return corpName.includes(pattern) || username.includes(pattern);
  });
});

function handleSelect(item: Api.Auth.CorpLoginItem) {
  if (props.loading) return;

  selectedItemKey.value = getItemKey(item);
  emit('select', item);
}

function getItemKey(item: Api.Auth.CorpLoginItem) {
  return `${item.corp.corp_id}:${item.user.user_id}`;
}

function isCurrentItem(item: Api.Auth.CorpLoginItem) {
  return selectedItemKey.value === getItemKey(item);
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
    <div class="mb-4px text-26px text-black font-600 dark:text-white">选择集成商</div>
    <div class="pb-12px text-14px text-#858585">请选择本次登录的集成商</div>

    <NInput v-model:value="keyword" clearable size="medium" placeholder="搜索集成商或用户名" class="mb-10px">
      <template #prefix>
        <SvgIcon icon="material-symbols:search-rounded" class="text-18px text-#858585" />
      </template>
    </NInput>

    <div
      v-if="filteredCorpList.length"
      class="max-h-300px overflow-y-auto rounded-8px border border-#e5e7eb dark:border-#333"
    >
      <button
        v-for="item in filteredCorpList"
        :key="getItemKey(item)"
        type="button"
        class="group box-border min-h-58px w-full flex items-center gap-10px border-b border-#eef0f4 bg-white px-12px py-9px text-left transition-colors last:border-b-0 hover:bg-primary-50 disabled:cursor-not-allowed dark:border-#333 dark:bg-#18181c dark:hover:bg-primary-900/30"
        :class="{
          'bg-primary-50 dark:bg-primary-900/30': isCurrentItem(item),
          'opacity-60': loading && !isCurrentItem(item)
        }"
        :disabled="loading"
        :aria-label="`进入${item.corp.name}`"
        @click="handleSelect(item)"
      >
        <div class="min-w-0 flex-1">
          <div class="truncate text-15px text-black font-500 leading-20px dark:text-white">{{ item.corp.name }}</div>
          <div class="mt-2px truncate text-13px text-#858585 leading-18px">{{ item.user.username }}</div>
        </div>
        <div
          class="size-28px flex-center shrink-0 rounded-full bg-primary-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white dark:bg-primary-900/40"
        >
          <NSpin v-if="loading && isCurrentItem(item)" :size="16" />
          <SvgIcon v-else icon="material-symbols:arrow-forward-rounded" class="text-19px" />
        </div>
      </button>
    </div>
    <NEmpty v-else description="暂无匹配集成商" class="py-28px" />

    <NButton size="medium" block class="mt-12px" @click="emit('back')">返回登录</NButton>
  </div>
</template>

<style scoped></style>
