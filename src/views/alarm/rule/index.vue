<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import AlarmRulePanel from './modules/alarm-rule-panel.vue';
import AlarmRuleSearch from './modules/alarm-rule-search.vue';

defineOptions({
  name: 'AlarmRule'
});

const searchParams = ref<Api.Alarm.AlarmRuleSearchParams>({
  pageNum: 1,
  pageSize: 15,
  name: null,
  alarm_level: null
});
const panelRef = useTemplateRef<{ search: () => void }>('panelRef');

function handleSearch() {
  panelRef.value?.search();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <AlarmRuleSearch v-model:model="searchParams" @search="handleSearch" />
    <AlarmRulePanel ref="panelRef" v-model:search-params="searchParams" class="sm:flex-1-hidden" />
  </div>
</template>
