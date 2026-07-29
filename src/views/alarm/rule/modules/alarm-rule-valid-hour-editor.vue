<script setup lang="ts">
import SectionHeader from '@/components/custom/section-header.vue';
import HourRangeSelector from './hour-range-selector.vue';
import type { TimeRangeInput } from './hour-range-selector';

defineOptions({
  name: 'AlarmRuleValidHourEditor'
});

const model = defineModel<TimeRangeInput[]>('model', { required: true });
</script>

<template>
  <div class="flex flex-col gap-14px p-2px">
    <SectionHeader title="生效小时" type="success" />

    <HourRangeSelector v-model="model" />
  </div>
</template>
