<script setup lang="ts">
import { onMounted, ref, useAttrs } from 'vue';
import type { SelectProps } from 'naive-ui';
import { useLoading } from '@sa/hooks';

defineOptions({
  name: 'ApiSelect'
});

type ApiSelectValue = string | number | Array<string | number> | null;
type ApiSelectOption = CommonType.Option<CommonType.IdType, string> & { disabled?: boolean };

interface ApiSelectOptionItem {
  [key: string]: unknown;
}

interface Props {
  request: (params?: Record<string, any>) => Promise<any>;
  requestParams?: Record<string, any>;
  labelField?: string;
  valueField?: string;
  disabledField?: string;
  optionsExtractor?: (response: any) => ApiSelectOptionItem[];
  [key: string]: any;
}

const props = withDefaults(defineProps<Props>(), {
  requestParams: () => ({}),
  labelField: 'label',
  valueField: 'value',
  disabledField: '',
  optionsExtractor: undefined
});

const value = defineModel<ApiSelectValue>('value', { required: false });
const attrs: SelectProps = useAttrs();
const { loading, startLoading, endLoading } = useLoading();

const options = ref<ApiSelectOption[]>([]);

function getOptionListFromResponse(response: any): ApiSelectOptionItem[] {
  if (props.optionsExtractor) {
    return props.optionsExtractor(response) || [];
  }

  if (response?.error) {
    return [];
  }

  const payload = Object.hasOwn(response || {}, 'data') ? response.data : response;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.rows)) return payload.rows;

  return [];
}

function transformOptions(list: ApiSelectOptionItem[]) {
  return list.map(item => {
    const option: ApiSelectOption = {
      label: String(item[props.labelField] ?? ''),
      value: item[props.valueField] as CommonType.IdType
    };

    if (props.disabledField) {
      option.disabled = Boolean(item[props.disabledField]);
    }

    return option;
  });
}

async function fetchOptions() {
  startLoading();
  try {
    const response = await props.request(props.requestParams);
    const list = getOptionListFromResponse(response);
    options.value = transformOptions(list);
  } catch {
    options.value = [];
  } finally {
    endLoading();
  }
}

onMounted(() => {
  fetchOptions();
});

defineExpose({
  reload: fetchOptions
});
</script>

<template>
  <NSelect v-model:value="value" :loading="loading" :options="options" v-bind="attrs" />
</template>

<style scoped></style>
