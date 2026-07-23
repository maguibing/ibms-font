<script setup lang="ts">
import { computed, reactive, shallowRef, useTemplateRef } from 'vue';
import type { FormInst, FormRules } from 'naive-ui';
import { fetchTelnet } from '@/service/api/system';
import TelnetResultPanel from './TelnetResultPanel.vue';
import TestResultPanel from './TestResultPanel.vue';
import ToolCardShell from './ToolCardShell.vue';
import { getErrorMessage, type TestStatus } from './shared';

const formRef = useTemplateRef<FormInst>('formRef');
const form = reactive<Api.System.TelnetParams>({
  host: '',
  port: 80,
  timeout_ms: 3000
});

const loading = shallowRef(false);
const status = shallowRef<TestStatus>('idle');
const result = shallowRef<Api.System.TelnetData>();
const errorText = shallowRef('');
const elapsed = shallowRef<number>();

const rules: FormRules = {
  host: [{ required: true, whitespace: true, message: '请输入目标主机', trigger: ['input', 'blur'] }],
  port: [
    {
      required: true,
      type: 'number',
      min: 1,
      max: 65535,
      message: '端口范围为 1-65535',
      trigger: ['blur', 'change']
    }
  ],
  timeout_ms: [{ required: true, type: 'number', min: 1, message: '超时时间不能小于 1ms', trigger: ['blur', 'change'] }]
};

const resultStats = computed(() => [
  { label: '端口', value: String(form.port) },
  { label: '超时时间', value: `${form.timeout_ms} ms` }
]);

const telnetSteps = [
  { key: 'resolve', label: '解析目标' },
  { key: 'connect', label: '建立连接' },
  { key: 'wait', label: '等待响应' },
  { key: 'status', label: '生成状态' }
] as const;

const telnetPanelTitle = computed(() => {
  if (status.value === 'running') return '正在连接 TCP 端口';
  if (status.value === 'error') return 'Telnet 测试失败';
  if (form.host) return '连接参数已就绪';

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
    const { data, error } = await fetchTelnet({ ...form, host: form.host.trim() });
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
    badge="TCP"
    description="检测端口是否可达"
    icon="material-symbols:settings-ethernet-rounded"
    title="Telnet 测试"
    tone="success"
  >
    <template #form>
      <NForm ref="formRef" :model="form" :rules="rules" label-placement="top" :show-require-mark="false">
        <NFormItem label="目标主机" path="host">
          <NInput v-model:value="form.host" clearable placeholder="请输入域名或 IP 地址" />
        </NFormItem>

        <NGrid :x-gap="12" cols="2">
          <NFormItemGi label="端口" path="port">
            <NInputNumber v-model:value="form.port" class="w-full" :max="65535" :min="1" />
          </NFormItemGi>
          <NFormItemGi label="超时时间(ms)" path="timeout_ms">
            <NInputNumber v-model:value="form.timeout_ms" class="w-full" :min="1" />
          </NFormItemGi>
        </NGrid>

        <div class="mb-16px mt-2px grid grid-cols-2 gap-8px lt-sm:grid-cols-1">
          <div
            class="min-w-0 rounded-6px border border-[var(--n-border-color)] border-solid bg-[var(--n-color-embedded)] p-10px"
          >
            <span class="mb-4px block text-12px text-[var(--n-text-color-3)]">端口</span>
            <strong
              class="block overflow-hidden text-14px text-[var(--n-text-color-1)] text-ellipsis whitespace-nowrap"
            >
              {{ form.port }}
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

        <NButton block :loading="loading" type="success" @click="handleTest">开始连接</NButton>
      </NForm>
    </template>

    <template #result>
      <div class="min-h-0 flex flex-1 flex-col">
        <TelnetResultPanel v-if="status === 'success' && result" :data="result" :elapsed="elapsed" />
        <TestResultPanel
          v-else
          :elapsed="elapsed"
          icon="material-symbols:settings-ethernet-rounded"
          idle-text="请输入连接参数后开始测试"
          :items="resultStats"
          :result="status === 'error' ? errorText : undefined"
          running-text="正在建立 TCP 连接，请稍候"
          :status="status"
          :steps="telnetSteps"
          :title="telnetPanelTitle"
          tone="success"
        />
      </div>
    </template>
  </ToolCardShell>
</template>
