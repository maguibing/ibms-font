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
type RemoteOptionsSnapshot = {
  options: RemoteSelectRecord[];
  offset: number;
  total: number | null;
  loadedAll: boolean;
};

interface Props {
  request: (params: RemoteSelectRecord) => Promise<any>;
  requestParams?: RemoteSelectRecord;
  searchType: number;
  limit?: number;
  labelField?: string;
  valueField?: string;
  disabledField?: string;
  debounce?: number;
  immediate?: boolean;
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
  immediate: true,
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
const requestParamsKey = computed(() => JSON.stringify(props.requestParams));

const keyword = shallowRef('');
const remoteOptions = shallowRef<RemoteSelectRecord[]>([]);
const selectedRecords = shallowRef<RemoteSelectRecord[]>([]);
const offset = shallowRef(0);
const total = shallowRef<number | null>(null);
const loadedAll = shallowRef(false);
const fetched = shallowRef(false);
const unfilteredOptionsSnapshot = shallowRef<RemoteOptionsSnapshot | null>(null);
let requestId = 0;

const recordMap = computed(() => {
  const map = new Map<CommonType.IdType, RemoteSelectRecord>();

  for (const item of [...selectedRecords.value, ...remoteOptions.value]) {
    const recordValue = item[props.valueField] as CommonType.IdType | undefined | null;
    if (recordValue !== undefined && recordValue !== null) {
      map.set(recordValue, item);
    }
  }

  return map;
});

const options = computed<RemoteSelectOption[]>(() => Array.from(recordMap.value.values(), transformOption));

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

function isRecord(input: unknown): input is RemoteSelectRecord {
  return typeof input === 'object' && input !== null;
}

function toArray<T>(input: T | T[] | null | undefined): T[] {
  if (input === null || input === undefined) return [];

  return Array.isArray(input) ? input : [input];
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
  const isUnfilteredRequest = !keyword.value.trim();
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

    if (isUnfilteredRequest) {
      unfilteredOptionsSnapshot.value = {
        options: remoteOptions.value,
        offset: offset.value,
        total: total.value,
        loadedAll: loadedAll.value
      };
    }
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
  unfilteredOptionsSnapshot.value = null;
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

function restoreUnfilteredOptions() {
  keyword.value = '';
  const snapshot = unfilteredOptionsSnapshot.value;
  if (!snapshot) return false;

  remoteOptions.value = snapshot.options;
  offset.value = snapshot.offset;
  total.value = snapshot.total;
  loadedAll.value = snapshot.loadedAll;
  fetched.value = true;

  return true;
}

function handleUpdateValue(nextValue: RemoteSelectValue) {
  const selectedValues = toArray(nextValue);
  const records = selectedValues.map(item => recordMap.value.get(item)).filter(isRecord);

  selectedRecords.value = records;
  emit('selectedChange', Array.isArray(nextValue) ? records : (records[0] ?? null));

  if (selectedValues.length > 0 && keyword.value.trim()) {
    restoreUnfilteredOptions();
  }
}

function handleClear() {
  selectedRecords.value = [];

  if (!restoreUnfilteredOptions()) {
    resetOptions(false);
    fetchOptions(0, true);
  }

  emit('selectedChange', Array.isArray(value.value) ? [] : null);
}

function handleFocus() {
  if (!fetched.value) {
    fetchOptions();
  }
}

watch(
  () => props.selectedOptions,
  selectedOptions => {
    selectedRecords.value = toArray(selectedOptions);
  },
  { immediate: true }
);

watch(
  () => [requestParamsKey.value, props.searchType, props.limit],
  () => {
    fetched.value = false;
    if (props.immediate) {
      resetAndFetch();
    } else {
      unfilteredOptionsSnapshot.value = null;
      resetOptions();
    }
  }
);

nextTick(() => {
  if (props.immediate) {
    fetchOptions();
  }
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
    :reset-menu-on-options-change="attrs.resetMenuOnOptionsChange ?? false"
    clear-filter-after-select
    v-bind="$attrs"
    @clear="handleClear"
    @focus="handleFocus"
    @scroll="handleScroll"
    @search="handleSearch"
    @update:value="handleUpdateValue"
  />
</template>
