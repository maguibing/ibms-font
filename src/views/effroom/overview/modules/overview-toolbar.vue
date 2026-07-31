<script setup lang="ts">
import type { DatePickerProps, SelectOption } from 'naive-ui';

defineOptions({
  name: 'OverviewToolbar'
});

defineProps<{
  statType: number;
  dateRange: [number, number];
  aggType: number;
  statTypeOptions: SelectOption[];
  aggTypeOptions: SelectOption[];
  datePickerType: DatePickerProps['type'];
  dateFormat: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  updateStatType: [value: number];
  updateDateRange: [value: [number, number]];
  updateAggType: [value: number];
  execute: [];
}>();
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <div class="flex flex-wrap items-center gap-16px p-4px">
      <div class="flex items-center gap-10px">
        <span class="shrink-0 text-14px text-[var(--n-text-color-2)]">统计粒度</span>
        <NRadioGroup :value="statType" size="small" @update:value="value => emit('updateStatType', Number(value))">
          <NRadioButton v-for="option in statTypeOptions" :key="String(option.value)" :value="option.value">
            {{ option.label }}
          </NRadioButton>
        </NRadioGroup>
      </div>

      <NDatePicker
        :key="datePickerType"
        :value="dateRange"
        :type="datePickerType"
        :format="dateFormat"
        :clearable="false"
        :default-time="['00:00:00', '23:59:59']"
        class="w-350px lt-sm:w-full"
        @update:value="value => value && emit('updateDateRange', value as [number, number])"
      />

      <div class="flex items-center gap-10px">
        <span class="shrink-0 text-14px text-[var(--n-text-color-2)]">统计方式</span>
        <NSelect
          :value="aggType"
          :options="aggTypeOptions"
          class="w-120px"
          @update:value="value => emit('updateAggType', Number(value))"
        />
      </div>

      <NButton type="primary" :loading="loading" class="ml-auto lt-xl:ml-0" @click="emit('execute')">
        <template #icon>
          <SvgIcon icon="material-symbols:search-rounded" />
        </template>
        查询
      </NButton>
    </div>
  </NCard>
</template>
