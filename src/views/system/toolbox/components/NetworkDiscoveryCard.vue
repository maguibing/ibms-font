<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef, useTemplateRef } from 'vue';
import type { FormInst, FormRules } from 'naive-ui';
import { fetchDiscoverNetwork, fetchListNetworkInterface } from '@/service/api/system';
import NetworkDiscoveryResultPanel from './NetworkDiscoveryResultPanel.vue';
import TestResultPanel from './TestResultPanel.vue';
import ToolCardShell from './ToolCardShell.vue';
import { getErrorMessage, type TestStatus } from './shared';

const formRef = useTemplateRef<FormInst>('formRef');
const form = reactive<Api.System.DiscoverNetworkParams>({
  interface_name: null
});

const networkInterfaces = shallowRef<Api.System.NetworkInterfaceInfo[]>([]);
const operatingSystem = shallowRef('');
const optionsLoading = shallowRef(false);
const discoverLoading = shallowRef(false);
const status = shallowRef<TestStatus>('idle');
const result = shallowRef<Api.System.DiscoverNetworkData>();
const errorText = shallowRef('');
const elapsed = shallowRef<number>();

const rules: FormRules = {
  interface_name: [{ required: true, message: '请选择网卡接口', trigger: ['blur', 'change'] }]
};

const interfaceOptions = computed(() =>
  networkInterfaces.value.map(item => ({
    label: item.local_addr ? `${item.name} - ${item.local_addr}` : item.name,
    value: item.name
  }))
);

const selectedInterface = computed(() => networkInterfaces.value.find(item => item.name === form.interface_name));

const scanSteps = [
  { key: 'interface', label: '确认接口' },
  { key: 'segment', label: '解析网段' },
  { key: 'probe', label: '探测主机' },
  { key: 'collect', label: '汇总结果' }
] as const;

const scanPanelTitle = computed(() => {
  if (status.value === 'running') return '正在扫描局域网';
  if (status.value === 'error') return '扫描失败';
  if (selectedInterface.value) return '接口已就绪';

  return '等待选择网卡';
});

const scanIdleText = computed(() => (selectedInterface.value ? '等待开始扫描' : '选择网卡后展示扫描目标'));

const scanStats = computed(() => [
  { label: '本机地址', value: selectedInterface.value?.local_addr || '--' },
  { label: '扫描网段', value: selectedInterface.value?.cidr || '--' },
  { label: '广播地址', value: selectedInterface.value?.broadcast_addr || '--' }
]);

async function loadNetworkInterfaces() {
  optionsLoading.value = true;
  try {
    const { data, error } = await fetchListNetworkInterface();
    if (error) {
      networkInterfaces.value = [];
      operatingSystem.value = '';
      return;
    }

    networkInterfaces.value = data?.interfaces ?? [];
    operatingSystem.value = data?.os ?? '';
  } catch {
    networkInterfaces.value = [];
    operatingSystem.value = '';
  } finally {
    optionsLoading.value = false;
  }
}

async function handleDiscover() {
  try {
    await formRef.value!.validate();
  } catch {
    return;
  }

  discoverLoading.value = true;
  status.value = 'running';
  result.value = undefined;
  errorText.value = '';
  elapsed.value = undefined;
  const startTime = Date.now();

  try {
    const { data, error } = await fetchDiscoverNetwork({ ...form });
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
    discoverLoading.value = false;
  }
}

onMounted(loadNetworkInterfaces);
</script>

<template>
  <ToolCardShell
    badge="LAN"
    description="选择网卡后扫描局域网在线主机"
    icon="material-symbols:travel-explore-rounded"
    title="网络发现"
    tone="warning"
  >
    <template #form>
      <NForm ref="formRef" :model="form" :rules="rules" label-placement="top" :show-require-mark="false">
        <NFormItem label="网卡接口" path="interface_name">
          <NSelect
            v-model:value="form.interface_name"
            clearable
            filterable
            :loading="optionsLoading"
            :options="interfaceOptions"
            placeholder="请选择网卡接口"
          />
        </NFormItem>

        <div
          class="interface-panel mb-16px min-h-150px flex flex-col justify-center gap-12px overflow-hidden rounded-6px border border-[var(--n-border-color)] border-solid p-14px"
          :class="{ 'interface-panel--ready': selectedInterface }"
        >
          <template v-if="selectedInterface">
            <div class="flex min-w-0 items-center justify-between gap-10px">
              <div class="text-13px text-[var(--n-title-text-color)] font-600">扫描目标</div>
              <NTag round size="small" type="warning">{{ selectedInterface.name }}</NTag>
            </div>

            <div class="grid grid-cols-2 gap-8px lt-sm:grid-cols-1">
              <div
                class="min-w-0 flex items-center gap-6px rounded-6px border border-[var(--n-border-color)] border-solid bg-[var(--n-color)] px-10px py-8px"
              >
                <span class="shrink-0 text-12px text-[var(--n-text-color-3)]">地址</span>
                <span
                  class="min-w-0 overflow-hidden text-12px text-[var(--n-text-color-2)] text-ellipsis whitespace-nowrap"
                >
                  {{ selectedInterface.local_addr || '-' }}
                </span>
              </div>
              <div
                class="min-w-0 flex items-center gap-6px rounded-6px border border-[var(--n-border-color)] border-solid bg-[var(--n-color)] px-10px py-8px"
              >
                <span class="shrink-0 text-12px text-[var(--n-text-color-3)]">网段</span>
                <span
                  class="min-w-0 overflow-hidden text-12px text-[var(--n-text-color-2)] text-ellipsis whitespace-nowrap"
                >
                  {{ selectedInterface.cidr || '-' }}
                </span>
              </div>
              <div
                class="min-w-0 flex items-center gap-6px rounded-6px border border-[var(--n-border-color)] border-solid bg-[var(--n-color)] px-10px py-8px"
              >
                <span class="shrink-0 text-12px text-[var(--n-text-color-3)]">广播</span>
                <span
                  class="min-w-0 overflow-hidden text-12px text-[var(--n-text-color-2)] text-ellipsis whitespace-nowrap"
                >
                  {{ selectedInterface.broadcast_addr || '-' }}
                </span>
              </div>
              <div
                class="min-w-0 flex items-center gap-6px rounded-6px border border-[var(--n-border-color)] border-solid bg-[var(--n-color)] px-10px py-8px"
              >
                <span class="shrink-0 text-12px text-[var(--n-text-color-3)]">MAC</span>
                <span
                  class="min-w-0 overflow-hidden text-12px text-[var(--n-text-color-2)] text-ellipsis whitespace-nowrap"
                >
                  {{ selectedInterface.mac || '-' }}
                </span>
              </div>
              <div
                class="col-span-full min-w-0 flex items-center gap-6px rounded-6px border border-[var(--n-border-color)] border-solid bg-[var(--n-color)] px-10px py-8px"
              >
                <span class="shrink-0 text-12px text-[var(--n-text-color-3)]">系统</span>
                <span
                  class="min-w-0 overflow-hidden text-12px text-[var(--n-text-color-2)] text-ellipsis whitespace-nowrap"
                >
                  {{ operatingSystem || '-' }}
                </span>
              </div>
            </div>
          </template>
          <NEmpty v-else class="min-h-120px" size="small" description="选择网卡后展示接口信息" />
        </div>

        <NButton block :disabled="optionsLoading" :loading="discoverLoading" type="warning" @click="handleDiscover">
          <template #icon>
            <SvgIcon icon="material-symbols:travel-explore" />
          </template>
          {{ discoverLoading ? '扫描中' : '开始扫描' }}
        </NButton>
      </NForm>
    </template>

    <template #result>
      <div class="min-h-0 flex flex-1 flex-col">
        <NetworkDiscoveryResultPanel v-if="status === 'success' && result" :data="result" :elapsed="elapsed" />

        <TestResultPanel
          v-else
          :elapsed="elapsed"
          icon="material-symbols:travel-explore-rounded"
          :idle-text="scanIdleText"
          :items="scanStats"
          :result="status === 'error' ? errorText : undefined"
          running-text="正在探测可达主机，请稍候"
          :status="status"
          :steps="scanSteps"
          :title="scanPanelTitle"
          tone="warning"
        />
      </div>
    </template>
  </ToolCardShell>
</template>

<style scoped>
.interface-panel {
  background:
    linear-gradient(135deg, color-mix(in srgb, #f0a020 9%, transparent), transparent 58%), var(--n-color-embedded);
}

.interface-panel--ready {
  border-color: color-mix(in srgb, #f0a020 34%, var(--n-border-color));
}
</style>
