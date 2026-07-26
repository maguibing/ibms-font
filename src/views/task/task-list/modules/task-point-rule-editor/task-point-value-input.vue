<script setup lang="ts">
import { computed } from 'vue';
import type { SelectOption } from 'naive-ui';
import {
  createDefaultRangeValue,
  getEnumValueOptions,
  getSwitchValueOptions,
  syncPointValueAlias,
  type TaskRulePointValue,
  type TaskRuleRangeValue
} from './use-task-point-rule-editor';

defineOptions({
  name: 'TaskPointValueInput'
});

interface Props {
  dataType?: CommonType.DataType | null;
  setting?: Api.Device.DeviceTypePointSetting | null;
  range?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  dataType: null,
  setting: null,
  range: false,
  disabled: false
});

const value = defineModel<TaskRulePointValue>('value', { required: true });
const rangeValue = defineModel<TaskRuleRangeValue>('rangeValue', {
  default: createDefaultRangeValue
});

const switchOptions = computed(() => getSwitchValueOptions(props.setting));
const enumOptions = computed(() => getEnumValueOptions(props.setting));
const unit = computed(() => props.setting?.num_val?.unit || value.value.unit || '');
const precision = computed(() => props.setting?.num_val?.scale);

const selectValue = computed<CommonType.IdType | null>({
  get: () => {
    const rawValue = value.value.value;

    if (rawValue === null || rawValue === undefined) return null;
    if (typeof rawValue === 'boolean') return String(rawValue);

    return rawValue;
  },
  set: nextValue => {
    value.value.value = nextValue;
  }
});

const numberValue = computed<number | null>({
  get: () => normalizeInputNumber(value.value.value),
  set: nextValue => updateNumberValue(value.value, nextValue)
});

const minNumberValue = computed<number | null>({
  get: () => normalizeInputNumber(rangeValue.value.min_val.value),
  set: nextValue => updateNumberValue(rangeValue.value.min_val, nextValue)
});

const maxNumberValue = computed<number | null>({
  get: () => normalizeInputNumber(rangeValue.value.max_val.value),
  set: nextValue => updateNumberValue(rangeValue.value.max_val, nextValue)
});

const textValue = computed<string>({
  get: () => String(value.value.value ?? ''),
  set: nextValue => {
    value.value.value = nextValue;
    value.value.alias = null;
    value.value.unit = null;
  }
});

function normalizeInputNumber(input: unknown) {
  if (input === null || input === undefined || input === '') return null;

  const parsedValue = Number(input);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function updateNumberValue(pointValue: TaskRulePointValue, nextValue: number | null) {
  pointValue.value = nextValue;
  pointValue.alias = null;
  pointValue.unit = unit.value || null;
}

function handleSelectValueChange(_nextValue: unknown, option: SelectOption | null) {
  syncPointValueAlias(value.value, option);
  value.value.unit = null;
}
</script>

<template>
  <NInput v-if="props.disabled || !props.dataType" disabled placeholder="请先选择点位" />

  <div v-else-if="props.range && props.dataType === 1" class="grid grid-cols-[1fr_auto_1fr] items-center gap-8px">
    <NInputGroup>
      <NInputNumber
        v-model:value="minNumberValue"
        :precision="precision"
        button-placement="right"
        class="w-full"
        placeholder="最小值"
      />
      <NInputGroupLabel v-if="unit">{{ unit }}</NInputGroupLabel>
    </NInputGroup>
    <span class="text-#999">至</span>
    <NInputGroup>
      <NInputNumber
        v-model:value="maxNumberValue"
        :precision="precision"
        button-placement="right"
        class="w-full"
        placeholder="最大值"
      />
      <NInputGroupLabel v-if="unit">{{ unit }}</NInputGroupLabel>
    </NInputGroup>
  </div>

  <NInputGroup v-else-if="props.dataType === 1">
    <NInputNumber
      v-model:value="numberValue"
      :precision="precision"
      button-placement="right"
      class="w-full"
      placeholder="请输入数值"
    />
    <NInputGroupLabel v-if="unit">{{ unit }}</NInputGroupLabel>
  </NInputGroup>

  <NSelect
    v-else-if="props.dataType === 2"
    v-model:value="selectValue"
    :options="switchOptions"
    placeholder="请选择开关值"
    @update:value="handleSelectValueChange"
  />

  <NInput v-else-if="props.dataType === 3" v-model:value="textValue" maxlength="100" placeholder="请输入文本" />

  <NSelect
    v-else-if="props.dataType === 4"
    v-model:value="selectValue"
    :disabled="enumOptions.length === 0"
    :options="enumOptions"
    placeholder="请选择枚举值"
    @update:value="handleSelectValueChange"
  />
</template>
