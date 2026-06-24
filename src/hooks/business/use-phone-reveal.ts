import { ref } from 'vue';
import { fetchGetPhone } from '@/service/api/system';

const phoneVisibleMap = ref<Record<string, boolean>>({});
const phoneLoadingMap = ref<Record<string, boolean>>({});
const phoneValueMap = ref<Record<string, string>>({});

export function usePhoneReveal() {
  function getPhoneMapKey(userId: CommonType.IdType) {
    return String(userId);
  }

  function isPhoneVisible(userId: CommonType.IdType) {
    return Boolean(phoneVisibleMap.value[getPhoneMapKey(userId)]);
  }

  function isPhoneLoading(userId: CommonType.IdType) {
    return Boolean(phoneLoadingMap.value[getPhoneMapKey(userId)]);
  }

  function getDisplayPhone(userId: CommonType.IdType, maskedPhone?: string | null) {
    const key = getPhoneMapKey(userId);
    const realPhone = phoneValueMap.value[key];

    if (isPhoneVisible(userId) && realPhone) {
      return realPhone;
    }

    return maskedPhone || '-';
  }

  async function togglePhone(userId: CommonType.IdType) {
    const key = getPhoneMapKey(userId);

    if (isPhoneLoading(userId)) {
      return;
    }

    if (isPhoneVisible(userId)) {
      phoneVisibleMap.value[key] = false;
      return;
    }

    if (!phoneValueMap.value[key]) {
      phoneLoadingMap.value[key] = true;
      const { data: phoneData, error } = await fetchGetPhone({ user_id: userId });
      phoneLoadingMap.value[key] = false;

      if (error || !phoneData?.phone) {
        return;
      }

      phoneValueMap.value[key] = phoneData.phone;
    }

    phoneVisibleMap.value[key] = true;
  }

  return {
    isPhoneVisible,
    isPhoneLoading,
    getDisplayPhone,
    togglePhone
  };
}
