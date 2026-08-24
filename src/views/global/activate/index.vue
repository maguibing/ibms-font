<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { copyText, isClipboardSupported } from '@sa/utils';
import { fetchGenerateSysCert } from '@/service/api/system/activate';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

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

const strategyCards = computed<StrategyCard[]>(() => [
  {
    value: 1,
    label: $t('page.global.activate.strategySpecified'),
    desc: $t('page.global.activate.strategySpecifiedDesc')
  },
  {
    value: 2,
    label: $t('page.global.activate.strategyPermanent'),
    desc: $t('page.global.activate.strategyPermanentDesc')
  }
]);

const isPermanent = computed(() => formModel.value.license_type === 2);
const hasResult = computed(() => Boolean(generatedLicense.value));

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => ({
  license_type: [createRequiredRule($t('page.global.activate.form.licenseType.required'))],
  license_expire_at: [
    {
      trigger: ['change', 'blur'],
      validator: (_rule, value: FormModel['license_expire_at']) => {
        if (formModel.value.license_type === 2) {
          return true;
        }

        if (!value) {
          return new Error($t('page.global.activate.form.expireTime.required'));
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
    window.$message?.error($t('page.global.activate.message.clipboardUnsupported'));
    return;
  }

  const copied = await copyText(generatedLicense.value);
  if (!copied) {
    window.$message?.error($t('page.global.activate.message.copyFailed'));
    return;
  }

  window.$message?.success($t('page.global.activate.message.copySuccess'));
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
    window.$message?.success($t('page.global.activate.message.generateSuccess'));

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
        <p class="m-0 text-12px text-primary font-700 tracking-[0.08em]">
          {{ $t('page.global.activate.eyebrow') }}
        </p>
        <h2 class="mt-1 text-24px text-base-text font-800 leading-tight sm:text-28px">
          {{ $t('page.global.activate.title') }}
        </h2>
        <p class="mt-2 text-13px text-base-text/70">
          {{ $t('page.global.activate.description') }}
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
            <h3 class="m-0 text-16px text-base-text font-700">{{ $t('page.global.activate.stepSelectType') }}</h3>
            <span class="rounded-full bg-primary/10 px-2.5 py-1 text-11px text-primary font-700">
              {{ $t('page.global.activate.required') }}
            </span>
          </div>

          <NFormItem :label="$t('page.global.activate.licenseType')" path="license_type" class="m-0">
            <div class="grid w-full gap-3 md:grid-cols-2">
              <button
                v-for="item in strategyCards"
                :key="item.value"
                type="button"
                class="strategy-card group relative w-full overflow-hidden rounded-3 border px-4 py-4 text-left transition-all duration-300"
                :class="
                  formModel.license_type === item.value
                    ? 'is-active border-primary/28 bg-primary/6 dark:border-primary/52 dark:bg-primary/14'
                    : 'border-primary/10 bg-[rgb(var(--table-color))] hover:(border-primary/20 bg-primary/5) dark:border-primary/22 dark:bg-#20242b dark:hover:(border-primary/42 bg-primary/10)'
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
          <h3 class="m-0 text-16px text-base-text font-700">{{ $t('page.global.activate.stepSetExpireTime') }}</h3>

          <NFormItem :label="$t('page.global.activate.expireTime')" path="license_expire_at" class="m-0">
            <NDatePicker
              v-model:formatted-value="formModel.license_expire_at"
              type="datetime"
              value-format="t"
              clearable
              class="w-full"
              :disabled="isPermanent"
              :is-date-disabled="isDateDisabled"
              :placeholder="
                isPermanent
                  ? $t('page.global.activate.permanentDatePlaceholder')
                  : $t('page.global.activate.datePlaceholder')
              "
            />
          </NFormItem>
        </section>

        <section class="space-y-3">
          <h3 class="m-0 text-16px text-base-text font-700">{{ $t('page.global.activate.stepGenerate') }}</h3>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <NButton quaternary class="sm:min-w-108px" @click="handleReset">
              {{ $t('page.global.activate.resetForm') }}
            </NButton>
            <NButton
              type="primary"
              :loading="loading"
              class="sm:min-w-130px transition-transform duration-300 hover:scale-[1.02]"
              @click="handleSubmit"
            >
              {{ $t('page.global.activate.generate') }}
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
            <h3 class="m-0 text-16px text-base-text font-700">{{ $t('page.global.activate.stepResult') }}</h3>
            <NButton type="success" secondary @click="handleCopyResult">
              {{ $t('page.global.activate.copyLicense') }}
            </NButton>
          </div>
          <div
            class="m-0 max-h-280px overflow-auto rounded-2 border border-success/30 bg-[rgb(var(--container-bg-color))] p-3 text-12px text-base-text leading-5"
          >
            <NCode :code="generatedLicense" language="text" :word-wrap="true" />
          </div>
        </section>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.strategy-card {
  box-shadow: inset 0 0 0 1px rgba(var(--primary-color), 0.04);
}

.strategy-card.is-active {
  box-shadow:
    inset 0 0 0 1px rgba(var(--primary-color), 0.16),
    0 8px 18px -16px rgba(var(--primary-color), 0.3);
}

:global(.dark) .strategy-card {
  box-shadow: inset 0 0 0 1px rgba(var(--primary-color), 0.12);
}

:global(.dark) .strategy-card.is-active {
  box-shadow:
    inset 0 0 0 1px rgba(var(--primary-color), 0.34),
    0 10px 24px -16px rgba(var(--primary-color), 0.55);
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
