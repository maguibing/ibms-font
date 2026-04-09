<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { copyText, isClipboardSupported } from '@sa/utils';
import { fetchGenerateSysCert } from '@/service/api/system/activate';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';

defineOptions({
  name: 'GlobalActivate'
});

interface StrategyCard {
  value: Api.System.LicenseType;
  label: string;
  desc: string;
}

interface FormModel {
  license_type: Api.System.LicenseType;
  license_expire_at: string | null;
}

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();

const formModel = ref<FormModel>(createDefaultFormModel());
const generatedLicense = ref('');
const resultPanelRef = ref<HTMLElement | null>(null);

const strategyCards: StrategyCard[] = [
  {
    value: 1,
    label: '指定时间',
    desc: '必须选择到期时间，提交真实 Unix 时间戳。'
  },
  {
    value: 2,
    label: '永久激活',
    desc: '自动忽略时间选择，提交 license_expire_at = 0。'
  }
];

const isPermanent = computed(() => formModel.value.license_type === 2);
const hasResult = computed(() => Boolean(generatedLicense.value));

const submitPreview = computed(() => {
  if (isPermanent.value) {
    return '将提交：license_type = 2，license_expire_at = 0（永久激活）';
  }

  if (!formModel.value.license_expire_at) {
    return '将提交：请选择到期时间后生成';
  }

  return `将提交：license_type = 1，license_expire_at = ${Number(formModel.value.license_expire_at)}`;
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => ({
  license_type: [createRequiredRule('请选择激活类型')],
  license_expire_at: [
    {
      trigger: ['change', 'blur'],
      validator: (_rule, value: FormModel['license_expire_at']) => {
        if (formModel.value.license_type === 2) {
          return true;
        }

        if (!value) {
          return new Error('请选择到期时间');
        }

        return true;
      }
    }
  ]
}));

function createDefaultFormModel(): FormModel {
  return {
    license_type: 1,
    license_expire_at: null
  };
}

function createSubmitPayload(): Api.System.GenerateSysCertParams {
  return {
    license_type: formModel.value.license_type,
    license_expire_at: formModel.value.license_type === 2 ? 0 : Number(formModel.value.license_expire_at)
  };
}

function selectLicenseType(value: Api.System.LicenseType) {
  formModel.value.license_type = value;
}

async function handleReset() {
  formModel.value = createDefaultFormModel();
  generatedLicense.value = '';
  await restoreValidation();
}

function isDateDisabled(timestamp: number) {
  return timestamp < Date.now();
}

async function scrollToResultPanel() {
  await nextTick();

  resultPanelRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

async function handleCopyResult() {
  if (!isClipboardSupported()) {
    window.$message?.error('您的浏览器不支持 Clipboard API');
    return;
  }

  const copied = await copyText(generatedLicense.value);
  if (!copied) {
    window.$message?.error('复制失败，请手动复制');
    return;
  }

  window.$message?.success('复制成功');
}

async function handleSubmit() {
  await validate();

  const payload = createSubmitPayload();

  startLoading();

  try {
    const { data, error } = await fetchGenerateSysCert(payload);

    if (error) {
      return;
    }

    generatedLicense.value = data?.license_content || '';
    window.$message?.success('激活码生成成功');

    if (generatedLicense.value) {
      await scrollToResultPanel();
    }
  } finally {
    endLoading();
  }
}

watch(
  () => formModel.value.license_type,
  async value => {
    if (value === 2) {
      formModel.value.license_expire_at = null;
    }

    await restoreValidation();
  }
);
</script>

<template>
  <div
    class="relative isolate min-h-[calc(100vh-176px)] overflow-hidden bg-[rgb(var(--body-color))] px-3 py-3 sm:px-4 lg:px-6"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-85 bg-[linear-gradient(165deg,rgba(var(--primary-color),0.12)_0%,rgba(var(--info-color),0.06)_42%,transparent_76%)]"
      aria-hidden="true"
    ></div>
    <div class="bg-grid pointer-events-none absolute inset-0 opacity-35" aria-hidden="true"></div>
    <div class="bg-orb bg-orb-primary pointer-events-none absolute -left-16 top-8" aria-hidden="true"></div>
    <div class="bg-orb bg-orb-info pointer-events-none absolute -right-24 bottom-6" aria-hidden="true"></div>

    <div class="relative z-1 mx-auto min-h-[calc(100vh-176px)] max-w-4xl flex flex-col justify-center space-y-4 py-4">
      <header class="rounded-3 border border-primary/16 bg-[rgb(var(--container-bg-color))] px-5 py-4 sm:px-6">
        <p class="m-0 text-12px text-primary font-700 tracking-[0.08em]">SYSTEM LICENSE</p>
        <h2 class="mt-1 text-24px text-base-text font-800 leading-tight sm:text-28px">激活码生成</h2>
        <p class="mt-2 text-13px text-base-text/70">
          按顺序选择激活策略并提交，生成结果会在当前页面展示，便于立即复制使用。
        </p>
      </header>

      <NForm
        ref="formRef"
        :model="formModel"
        :rules="rules"
        label-placement="top"
        class="space-y-4 rounded-3 border border-primary/16 bg-[rgb(var(--container-bg-color))] p-4 sm:p-5"
      >
        <section class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <h3 class="m-0 text-16px text-base-text font-700">1. 选择激活类型</h3>
            <span class="rounded-full bg-primary/10 px-2.5 py-1 text-11px text-primary font-700">必选</span>
          </div>

          <NFormItem label="激活类型" path="license_type" class="m-0">
            <div class="grid w-full gap-3 md:grid-cols-2">
              <button
                v-for="item in strategyCards"
                :key="item.value"
                type="button"
                class="strategy-card group relative w-full overflow-hidden rounded-3 border px-4 py-4 text-left transition-all duration-300"
                :class="
                  formModel.license_type === item.value
                    ? 'is-active border-primary/45 bg-primary/10'
                    : 'border-[rgb(var(--border-color))] bg-[rgb(var(--table-color))] hover:border-primary/35'
                "
                @click="selectLicenseType(item.value)"
              >
                <span class="block text-15px text-base-text font-700">{{ item.label }}</span>
                <span class="mt-1 block text-12px text-base-text/66 leading-5">{{ item.desc }}</span>
              </button>
            </div>
          </NFormItem>
        </section>

        <section class="space-y-3">
          <h3 class="m-0 text-16px text-base-text font-700">2. 设置到期时间</h3>

          <NFormItem label="到期时间" path="license_expire_at" class="m-0">
            <NDatePicker
              v-model:formatted-value="formModel.license_expire_at"
              type="datetime"
              value-format="t"
              clearable
              class="w-full"
              :disabled="isPermanent"
              :is-date-disabled="isDateDisabled"
              :placeholder="isPermanent ? '永久激活无需选择时间' : '请选择到期时间（不可早于当前时间）'"
            />
          </NFormItem>
          <p class="m-0 text-12px text-base-text/65">
            {{ submitPreview }}
          </p>
        </section>

        <section class="space-y-3">
          <h3 class="m-0 text-16px text-base-text font-700">3. 生成激活码</h3>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <NButton quaternary class="sm:min-w-108px" @click="handleReset">重置表单</NButton>
            <NButton
              type="primary"
              :loading="loading"
              class="sm:min-w-130px transition-transform duration-300 hover:scale-[1.02]"
              @click="handleSubmit"
            >
              生成激活码
            </NButton>
          </div>
        </section>
      </NForm>

      <Transition name="fade-slide">
        <section
          v-if="hasResult"
          ref="resultPanelRef"
          class="space-y-3 rounded-3 border border-success/35 bg-success/6 p-4 sm:p-5"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h3 class="m-0 text-16px text-base-text font-700">4. 生成结果</h3>
            <NButton type="success" secondary @click="handleCopyResult">复制激活码</NButton>
          </div>
          <pre
            class="m-0 max-h-280px overflow-auto rounded-2 border border-success/30 bg-[rgb(var(--container-bg-color))] p-3 text-12px text-base-text leading-5"
            >{{ generatedLicense }}</pre
          >
        </section>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.strategy-card {
  box-shadow: inset 0 0 0 1px transparent;
}

.strategy-card.is-active {
  box-shadow:
    inset 0 0 0 1px rgba(var(--primary-color), 0.3),
    0 8px 18px -14px rgba(var(--primary-color), 0.45);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.28s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.bg-grid {
  background-image:
    linear-gradient(to right, rgba(var(--primary-color), 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(var(--primary-color), 0.08) 1px, transparent 1px);
  background-size: 28px 28px;
}

.bg-orb {
  border-radius: 9999px;
  filter: blur(62px);
  animation: float-orb 8s ease-in-out infinite;
}

.bg-orb-primary {
  width: 280px;
  height: 280px;
  background: rgba(var(--primary-color), 0.2);
}

.bg-orb-info {
  width: 320px;
  height: 320px;
  background: rgba(var(--info-color), 0.18);
  animation-delay: 1.2s;
}

@keyframes float-orb {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(0, -10px, 0) scale(1.05);
  }
}
</style>
