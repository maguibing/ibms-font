<script setup lang="ts">
import { computed, reactive, shallowRef, useTemplateRef } from 'vue';
import { $t } from '@/locales';
import type { FormInst, FormRules } from 'naive-ui';
import { fetchPing } from '@/service/api/system';
import PingResultPanel from './PingResultPanel.vue';
import TestResultPanel from './TestResultPanel.vue';
import ToolCardShell from './ToolCardShell.vue';
import { getErrorMessage, type TestStatus } from './shared';

const formRef = useTemplateRef<FormInst>('formRef');
const form = reactive<Api.System.PingParams>({
  host: '',
  count: 10,
  timeout_ms: 3000
});

const loading = shallowRef(false);
const status = shallowRef<TestStatus>('idle');
const result = shallowRef<Api.System.PingData>();
const errorText = shallowRef('');
const elapsed = shallowRef<number>();

const rules: FormRules = {
  host: [{ required: true, whitespace: true, message: $t('toolbox.validation.host'), trigger: ['input', 'blur'] }],
  count: [
    { required: true, type: 'number', min: 1, message: $t('toolbox.validation.count'), trigger: ['blur', 'change'] }
  ],
  timeout_ms: [
    { required: true, type: 'number', min: 1, message: $t('toolbox.validation.timeout'), trigger: ['blur', 'change'] }
  ]
};

const resultStats = computed(() => [
  { label: $t('toolbox.common.count'), value: String(form.count) },
  { label: $t('toolbox.common.timeout'), value: `${form.timeout_ms} ms` }
]);

const pingSteps = [
  { key: 'resolve', label: $t('toolbox.ping.steps.resolve') },
  { key: 'send', label: $t('toolbox.ping.steps.send') },
  { key: 'latency', label: $t('toolbox.ping.steps.latency') },
  { key: 'summary', label: $t('toolbox.ping.steps.summary') }
] as const;

const pingPanelTitle = computed(() => {
  if (status.value === 'running') return $t('toolbox.ping.sending');
  if (status.value === 'error') return $t('toolbox.ping.failed');
  if (form.host) return $t('toolbox.ping.ready');

  return $t('toolbox.ping.waiting');
});

async function handleTest() {
  try {
    await formRef.value!.validate();
  } catch {
    return;
  }

  loading.value = true;
  status.value = 'running';
  result.value = undefined;
  errorText.value = '';
  elapsed.value = undefined;
  const startTime = Date.now();

  try {
    const { data, error } = await fetchPing({ ...form, host: form.host.trim() });
    if (error) {
      status.value = 'error';
      errorText.value = getErrorMessage(error);
      return;
    }

    result.value = data;
    status.value = 'success';
  } catch (error) {
    status.value = 'error';
    errorText.value = getErrorMessage(error);
  } finally {
    elapsed.value = Date.now() - startTime;
    loading.value = false;
  }
}
</script>

<template>
  <ToolCardShell
    badge="ICMP"
    :description="$t('toolbox.ping.description')"
    icon="material-symbols:network-ping-rounded"
    :title="$t('toolbox.tabs.ping')"
    tone="primary"
  >
    <template #form>
      <NForm ref="formRef" :model="form" :rules="rules" label-placement="top" :show-require-mark="false">
        <NFormItem :label="$t('toolbox.common.host')" path="host">
          <NInput v-model:value="form.host" clearable :placeholder="$t('toolbox.common.hostPlaceholder')" />
        </NFormItem>

        <NGrid :x-gap="12" cols="2">
          <NFormItemGi :label="$t('toolbox.common.count')" path="count">
            <NInputNumber v-model:value="form.count" class="w-full" :min="1" />
          </NFormItemGi>
          <NFormItemGi :label="$t('toolbox.common.timeout') + '(ms)'" path="timeout_ms">
            <NInputNumber v-model:value="form.timeout_ms" class="w-full" :min="1" />
          </NFormItemGi>
        </NGrid>

        <div class="mb-16px mt-2px grid grid-cols-2 gap-8px lt-sm:grid-cols-1">
          <div
            class="min-w-0 rounded-6px border border-[var(--n-border-color)] border-solid bg-[var(--n-color-embedded)] p-10px"
          >
            <span class="mb-4px block text-12px text-[var(--n-text-color-3)]">{{ $t('toolbox.common.count') }}</span>
            <strong
              class="block overflow-hidden text-14px text-[var(--n-text-color-1)] text-ellipsis whitespace-nowrap"
            >
              {{ form.count }}
            </strong>
          </div>
          <div
            class="min-w-0 rounded-6px border border-[var(--n-border-color)] border-solid bg-[var(--n-color-embedded)] p-10px"
          >
            <span class="mb-4px block text-12px text-[var(--n-text-color-3)]">{{ $t('toolbox.common.timeout') }}</span>
            <strong
              class="block overflow-hidden text-14px text-[var(--n-text-color-1)] text-ellipsis whitespace-nowrap"
            >
              {{ form.timeout_ms }} ms
            </strong>
          </div>
        </div>

        <NButton block :loading="loading" type="primary" @click="handleTest">
          {{ $t('toolbox.common.startTest') }}
        </NButton>
      </NForm>
    </template>

    <template #result>
      <div class="min-h-0 flex flex-1 flex-col">
        <PingResultPanel v-if="status === 'success' && result" :data="result" :elapsed="elapsed" />
        <TestResultPanel
          v-else
          :elapsed="elapsed"
          icon="material-symbols:network-ping-rounded"
          :idle-text="$t('toolbox.ping.idle')"
          :items="resultStats"
          :result="status === 'error' ? errorText : undefined"
          :running-text="$t('toolbox.ping.running')"
          :status="status"
          :steps="pingSteps"
          :title="pingPanelTitle"
          tone="primary"
        />
      </div>
    </template>
  </ToolCardShell>
</template>
