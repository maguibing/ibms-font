<script setup lang="ts">
import { computed, reactive, shallowRef, useTemplateRef } from 'vue';
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
  host: [{ required: true, whitespace: true, message: '请输入目标主机', trigger: ['input', 'blur'] }],
  count: [{ required: true, type: 'number', min: 1, message: '请求次数不能小于 1', trigger: ['blur', 'change'] }],
  timeout_ms: [{ required: true, type: 'number', min: 1, message: '超时时间不能小于 1ms', trigger: ['blur', 'change'] }]
};

const resultStats = computed(() => [
  { label: '请求次数', value: String(form.count) },
  { label: '超时时间', value: `${form.timeout_ms} ms` }
]);

const pingSteps = [
  { key: 'resolve', label: '解析目标' },
  { key: 'send', label: '发送请求' },
  { key: 'latency', label: '统计延迟' },
  { key: 'summary', label: '汇总结果' }
] as const;

const pingPanelTitle = computed(() => {
  if (status.value === 'running') return '正在发送 Ping 请求';
  if (status.value === 'error') return 'Ping 测试失败';
  if (form.host) return '参数已就绪';

  return '等待输入参数';
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
    description="检测主机连通性和响应延迟"
    icon="material-symbols:network-ping-rounded"
    title="Ping 测试"
    tone="primary"
  >
    <template #form>
      <NForm ref="formRef" :model="form" :rules="rules" label-placement="top" :show-require-mark="false">
        <NFormItem label="目标主机" path="host">
          <NInput v-model:value="form.host" clearable placeholder="请输入域名或 IP 地址" />
        </NFormItem>

        <NGrid :x-gap="12" cols="2">
          <NFormItemGi label="请求次数" path="count">
            <NInputNumber v-model:value="form.count" class="w-full" :min="1" />
          </NFormItemGi>
          <NFormItemGi label="超时时间(ms)" path="timeout_ms">
            <NInputNumber v-model:value="form.timeout_ms" class="w-full" :min="1" />
          </NFormItemGi>
        </NGrid>

        <div class="mb-16px mt-2px grid grid-cols-2 gap-8px lt-sm:grid-cols-1">
          <div
            class="min-w-0 rounded-6px border border-[var(--n-border-color)] border-solid bg-[var(--n-color-embedded)] p-10px"
          >
            <span class="mb-4px block text-12px text-[var(--n-text-color-3)]">请求次数</span>
            <strong
              class="block overflow-hidden text-14px text-[var(--n-text-color-1)] text-ellipsis whitespace-nowrap"
            >
              {{ form.count }}
            </strong>
          </div>
          <div
            class="min-w-0 rounded-6px border border-[var(--n-border-color)] border-solid bg-[var(--n-color-embedded)] p-10px"
          >
            <span class="mb-4px block text-12px text-[var(--n-text-color-3)]">超时时间</span>
            <strong
              class="block overflow-hidden text-14px text-[var(--n-text-color-1)] text-ellipsis whitespace-nowrap"
            >
              {{ form.timeout_ms }} ms
            </strong>
          </div>
        </div>

        <NButton block :loading="loading" type="primary" @click="handleTest">开始测试</NButton>
      </NForm>
    </template>

    <template #result>
      <div class="min-h-0 flex flex-1 flex-col">
        <PingResultPanel v-if="status === 'success' && result" :data="result" :elapsed="elapsed" />
        <TestResultPanel
          v-else
          :elapsed="elapsed"
          icon="material-symbols:network-ping-rounded"
          idle-text="请输入参数后开始测试"
          :items="resultStats"
          :result="status === 'error' ? errorText : undefined"
          running-text="正在发送 ICMP 请求，请稍候"
          :status="status"
          :steps="pingSteps"
          :title="pingPanelTitle"
          tone="primary"
        />
      </div>
    </template>
  </ToolCardShell>
</template>
