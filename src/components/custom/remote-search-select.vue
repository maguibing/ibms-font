<script setup lang="ts">
import { computed, nextTick, shallowRef, useAttrs, watch } from 'vue';
import type { SelectProps } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { useDebounceFn } from '@vueuse/core';

defineOptions({
  name: 'RemoteSearchSelect',
  inheritAttrs: false
});

type RemoteSelectValue = CommonType.IdType | CommonType.IdType[] | null;
type RemoteSelectOption = CommonType.Option<CommonType.IdType, string> & { disabled?: boolean };
type RemoteSelectRecord = Record<string, any>;

interface Props {
  request: (params: RemoteSelectRecord) => Promise<any>;
  requestParams?: RemoteSelectRecord;
  searchType: number;
  limit?: number;
  labelField?: string;
  valueField?: string;
  disabledField?: string;
  debounce?: number;
  selectedOptions?: RemoteSelectRecord | RemoteSelectRecord[] | null;
  optionsExtractor?: (response: any) => RemoteSelectRecord[];
  totalExtractor?: (response: any) => number | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  requestParams: () => ({}),
  limit: 20,
  labelField: 'label',
  valueField: 'value',
  disabledField: '',
  debounce: 300,
  selectedOptions: null,
  optionsExtractor: undefined,
  totalExtractor: undefined
});

const emit = defineEmits<{
  selectedChange: [RemoteSelectRecord | RemoteSelectRecord[] | null];
}>();

const value = defineModel<RemoteSelectValue>('value', { required: false });
const attrs = useAttrs() as SelectProps;
const { loading, startLoading, endLoading } = useLoading();

const keyword = shallowRef('');
const remoteOptions = shallowRef<RemoteSelectRecord[]>([]);
const selectedRecords = shallowRef<RemoteSelectRecord[]>([]);
const offset = shallowRef(0);
const total = shallowRef<number | null>(null);
const loadedAll = shallowRef(false);
const fetched = shallowRef(false);
let requestId = 0;

const recordMap = computed(() => {
  const map = new Map<CommonType.IdType, RemoteSelectRecord>();

  for (const item of [...selectedRecords.value, ...remoteOptions.value]) {
    const key = getRecordValue(item);
    if (key !== undefined && key !== null) {
      map.set(key, item);
    }
  }

  return map;
});

const options = computed<RemoteSelectOption[]>(() => {
  const optionMap = new Map<CommonType.IdType, RemoteSelectOption>();

  for (const item of [...selectedRecords.value, ...remoteOptions.value]) {
    const option = transformOption(item);
    if (option.value !== undefined && option.value !== null) {
      optionMap.set(option.value, option);
    }
  }

  return Array.from(optionMap.values());
});

function getRecordValue(item: RemoteSelectRecord) {
  return item[props.valueField] as CommonType.IdType | undefined | null;
}

function transformOption(item: RemoteSelectRecord): RemoteSelectOption {
  const option: RemoteSelectOption = {
    label: String(item[props.labelField] ?? ''),
    value: item[props.valueField] as CommonType.IdType
  };

  if (props.disabledField) {
    option.disabled = Boolean(item[props.disabledField]);
  }

  return option;
}

function normalizeSelectedOptions() {
  if (!props.selectedOptions) return [];

  return Array.isArray(props.selectedOptions) ? props.selectedOptions : [props.selectedOptions];
}

function isRecord(input: unknown): input is RemoteSelectRecord {
  return typeof input === 'object' && input !== null;
}

function unwrapPayload(response: any) {
  if (!isRecord(response)) return response;

  if ('data' in response && 'error' in response) {
    return response.error ? null : response.data;
  }

  return response;
}

function getOptionListFromResponse(response: any): RemoteSelectRecord[] {
  if (props.optionsExtractor) {
    return props.optionsExtractor(response) || [];
  }

  const payload = unwrapPayload(response);

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;

  return [];
}

function getTotalFromResponse(response: any) {
  if (props.totalExtractor) {
    const customTotal = props.totalExtractor(response);
    if (typeof customTotal === 'number') return customTotal;
  }

  const payload = unwrapPayload(response);
  const totalValue = payload?.paginate?.total ?? payload?.total;

  return typeof totalValue === 'number' ? totalValue : null;
}

function buildRequestParams(nextOffset: number) {
  const baseListOption = props.requestParams.list_option || {};
  const baseOptions = Array.isArray(baseListOption.options) ? baseListOption.options : [];
  const searchValue = keyword.value.trim();
  const searchOptions = searchValue ? [{ type: props.searchType, value: searchValue }] : [];

  return {
    ...props.requestParams,
    list_option: {
      ...baseListOption,
      offset: nextOffset,
      limit: props.limit,
      options: [...baseOptions, ...searchOptions]
    }
  };
}

async function fetchOptions(nextOffset = 0, force = false) {
  if ((!force && loading.value) || (nextOffset > 0 && loadedAll.value)) return;

  const currentRequestId = ++requestId;
  startLoading();

  try {
    const response = await props.request(buildRequestParams(nextOffset));

    if (currentRequestId !== requestId) return;

    const list = getOptionListFromResponse(response);
    const nextTotal = getTotalFromResponse(response);

    if (nextOffset === 0 || nextTotal !== null) {
      total.value = nextTotal;
    }

    offset.value = nextOffset + props.limit;
    remoteOptions.value = nextOffset === 0 ? list : [...remoteOptions.value, ...list];
    loadedAll.value = list.length < props.limit || (total.value !== null && remoteOptions.value.length >= total.value);
    fetched.value = true;
  } catch {
    if (nextOffset === 0) {
      remoteOptions.value = [];
      total.value = null;
    }

    loadedAll.value = true;
  } finally {
    if (currentRequestId === requestId) {
      endLoading();
    }
  }
}

function resetAndFetch() {
  resetOptions();

  fetchOptions(0, true);
}

function resetOptions(clearOptions = true) {
  requestId += 1;
  offset.value = 0;
  total.value = null;
  loadedAll.value = false;

  if (clearOptions) {
    remoteOptions.value = [];
  }
}

const debouncedFetchFirstPage = useDebounceFn(
  () => fetchOptions(0, true),
  () => props.debounce
);

function handleSearch(pattern: string) {
  keyword.value = pattern;
  resetOptions();
  debouncedFetchFirstPage();
}

function handleScroll(event: Event) {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  const reachBottom = target.scrollTop + target.offsetHeight >= target.scrollHeight - 24;
  if (reachBottom) {
    fetchOptions(offset.value);
  }
}

function handleUpdateValue(nextValue: RemoteSelectValue) {
  if (Array.isArray(nextValue)) {
    const nextSelectedRecords = nextValue
      .map(item => recordMap.value.get(item))
      .filter(Boolean) as RemoteSelectRecord[];
    selectedRecords.value = nextSelectedRecords;
    emit('selectedChange', nextSelectedRecords);
    return;
  }

  const nextSelectedRecord = nextValue === null ? null : (recordMap.value.get(nextValue) ?? null);
  selectedRecords.value = nextSelectedRecord ? [nextSelectedRecord] : [];
  emit('selectedChange', nextSelectedRecord);
}

function handleClear() {
  keyword.value = '';
  selectedRecords.value = [];
  resetOptions(false);
  fetchOptions(0, true);
  emit('selectedChange', Array.isArray(value.value) ? [] : null);
}

function handleFocus() {
  if (!fetched.value) {
    fetchOptions();
  }
}

watch(
  () => props.selectedOptions,
  () => {
    selectedRecords.value = normalizeSelectedOptions();
  },
  { immediate: true }
);

watch(
  () => [props.requestParams, props.searchType, props.limit],
  () => {
    fetched.value = false;
    resetAndFetch();
  },
  { deep: true }
);

nextTick(() => {
  fetchOptions();
});

defineExpose({
  reload: resetAndFetch
});
</script>

<template>
  <NSelect
    v-model:value="value"
    :filterable="attrs.filterable ?? true"
    :loading="loading"
    :options="options"
    :remote="attrs.remote ?? true"
    clear-filter-after-select
    v-bind="$attrs"
    @clear="handleClear"
    @focus="handleFocus"
    @scroll="handleScroll"
    @search="handleSearch"
    @update:value="handleUpdateValue"
  />
</template>

<style scoped></style>
