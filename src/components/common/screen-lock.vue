<script setup lang="ts">
import { onBeforeUnmount, reactive, shallowRef, useTemplateRef, watch } from 'vue';
import { useMessage } from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';
import { fetchActiveSysCert } from '@/service/api/system/activate';
import { hideScreenLock, useScreenLockState } from '@/utils/screen-lock';

defineOptions({
  name: 'ScreenLock'
});

interface LockForm {
  license_content: string;
}

const message = useMessage();
const { locked } = useScreenLockState();
const formRef = useTemplateRef<FormInst>('formRef');
const unlocking = shallowRef(false);
const form = reactive<LockForm>({
  license_content: ''
});

let reloadTimer: ReturnType<typeof setTimeout> | null = null;
let previousBodyOverflow: string | null = null;

const rules: FormRules = {
  license_content: [
    {
      trigger: ['input', 'blur'],
      validator: (_rule, value: string) => {
        if (!value?.trim()) {
          return new Error('请输入激活码');
        }

        return true;
      }
    }
  ]
};

function resetForm() {
  form.license_content = '';
  formRef.value?.restoreValidation();
}

function lockBodyScroll() {
  if (previousBodyOverflow !== null) return;

  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
  if (previousBodyOverflow === null) return;

  document.body.style.overflow = previousBodyOverflow;
  previousBodyOverflow = null;
}

async function handleUnlock() {
  if (unlocking.value) return;

  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  unlocking.value = true;

  try {
    const { error } = await fetchActiveSysCert({
      license_content: form.license_content.trim()
    });

    if (error) {
      return;
    }

    message.success('解锁成功，3 秒后自动刷新');
    hideScreenLock();
    reloadTimer = setTimeout(() => {
      window.location.reload();
    }, 3000);
  } finally {
    unlocking.value = false;
  }
}

watch(
  locked,
  value => {
    if (value) {
      resetForm();
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (reloadTimer) {
    clearTimeout(reloadTimer);
  }

  unlockBodyScroll();
});
</script>

<template>
  <Teleport v-if="locked" to="body">
    <div
      class="fixed inset-0 z-999 h-[100dvh] w-screen overflow-auto bg-layout px-16px py-24px text-base-text"
      @wheel.stop
      @touchmove.stop
    >
      <section
        class="mx-auto min-h-full w-[min(100%,760px)] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="screen-lock-title"
      >
        <div
          class="grid w-full overflow-hidden border border-primary/16 rounded-8px bg-[rgb(var(--container-bg-color))] shadow-[0_24px_80px_rgba(15,23,42,0.16)] dark:shadow-none md:grid-cols-[240px_minmax(0,1fr)]"
        >
          <div class="hidden flex-col justify-between border-r border-primary/14 bg-primary/6 p-24px md:flex">
            <div class="w-max rounded-6px bg-primary/10 px-10px py-6px text-12px text-primary font-700">
              ACCESS LOCKED
            </div>
            <SvgIcon icon="material-symbols:shield-lock-outline-rounded" class="mx-auto text-104px text-primary/80" />
            <p class="m-0 text-13px text-base-text/65 leading-22px">授权异常时暂时关闭系统访问。</p>
          </div>

          <div class="min-w-0 p-30px lt-sm:p-22px">
            <div class="flex items-center justify-between gap-12px">
              <span class="inline-flex items-center gap-7px text-13px text-primary font-700">
                <SvgIcon icon="material-symbols:shield-lock-outline-rounded" class="text-18px" />
                授权校验
              </span>
              <NTag type="warning" size="small" round>待激活</NTag>
            </div>

            <h2 id="screen-lock-title" class="m-0 mt-24px text-28px font-800 leading-36px lt-sm:text-24px">
              系统已锁定
            </h2>
            <p class="mb-24px mt-10px text-14px text-base-text/66 leading-22px">
              检测到当前授权状态异常，请提交有效激活码恢复访问。
            </p>

            <NForm
              ref="formRef"
              :model="form"
              :rules="rules"
              :show-require-mark="false"
              label-placement="top"
              @submit.prevent="handleUnlock"
            >
              <NFormItem label="激活码" path="license_content">
                <NInput
                  v-model:value="form.license_content"
                  type="textarea"
                  placeholder="粘贴完整激活码"
                  :autosize="{ minRows: 4, maxRows: 6 }"
                />
              </NFormItem>

              <NButton type="primary" attr-type="submit" block :loading="unlocking">提交激活码</NButton>
            </NForm>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>
