import { computed, ref } from 'vue';
import type { FormItemInst } from 'naive-ui';
import { fetchCheckPhone } from '@/service/api/corp';

type PhoneCheckStatus = 'unchecked' | 'exists' | 'not-exists';

interface UsePhoneExistCheckOptions {
  getPhone: () => string;
  setPhone: (phone: string) => void;
  pType?: number;
  existsFeedback?: string;
  onExists?: () => void;
  onReset?: () => void;
}

export function usePhoneExistCheck(options: UsePhoneExistCheckOptions) {
  const phoneFormItemRef = ref<FormItemInst | null>(null);
  const phoneCheckStatus = ref<PhoneCheckStatus>('unchecked');
  let phoneCheckPromise: Promise<boolean> | null = null;

  const showPasswordFields = computed(() => phoneCheckStatus.value !== 'exists');
  const phoneValidationStatus = computed<'warning' | undefined>(() => {
    if (phoneCheckStatus.value === 'exists') return 'warning';
    return undefined;
  });
  const phoneFeedback = computed(() => {
    if (phoneCheckStatus.value === 'exists') return options.existsFeedback || '联系电话已存在，将使用已存在账号';
    return undefined;
  });

  async function validatePhoneField() {
    if (!phoneFormItemRef.value) return false;

    options.setPhone(options.getPhone().trim());

    try {
      await phoneFormItemRef.value.validate();
      return true;
    } catch {
      return false;
    }
  }

  async function checkPhone() {
    if (phoneCheckPromise) return phoneCheckPromise;
    if (phoneCheckStatus.value !== 'unchecked') return true;

    const valid = await validatePhoneField();
    if (!valid) return false;

    const phone = options.getPhone();

    phoneCheckPromise = (async () => {
      try {
        const params = options.pType === undefined ? { phone } : { phone, p_type: options.pType };
        const { data, error } = await fetchCheckPhone(params);

        if (error || options.getPhone() !== phone) return false;

        const isExist = data?.is_exist === true;
        phoneCheckStatus.value = isExist ? 'exists' : 'not-exists';

        if (isExist) {
          options.onExists?.();
        }

        return true;
      } finally {
        phoneCheckPromise = null;
      }
    })();

    return phoneCheckPromise;
  }

  function resetPhoneCheck() {
    phoneCheckStatus.value = 'unchecked';
  }

  function resetPhoneCheckStatus() {
    resetPhoneCheck();
    options.onReset?.();
  }

  return {
    phoneFormItemRef,
    showPasswordFields,
    phoneValidationStatus,
    phoneFeedback,
    checkPhone,
    resetPhoneCheck,
    resetPhoneCheckStatus
  };
}
