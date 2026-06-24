<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchGetCorp, fetchUpdateCorpAuditStatus } from '@/service/api/corp';

defineOptions({
  name: 'CorpAuditDrawer'
});

interface Props {
  rowId?: CommonType.IdType | null;
}

interface Emits {
  (e: 'submitted'): void;
}

const props = withDefaults(defineProps<Props>(), {
  rowId: null
});
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const AUDIT_PASS_STATUS = 2;
const AUDIT_REJECT_STATUS = 3;

const { loading: detailLoading, startLoading: startDetailLoading, endLoading: endDetailLoading } = useLoading();
const { loading: submitLoading, startLoading: startSubmitLoading, endLoading: endSubmitLoading } = useLoading();

const detail = ref<Api.System.CorpDetail | null>(null);

const corp = computed(() => detail.value?.corp ?? null);

const contactUser = computed(() => {
  if (!detail.value || !corp.value) return null;

  return detail.value.base_user_map[String(corp.value.contact_id)] ?? null;
});

const displayModel = computed(() => ({
  name: corp.value?.name || '',
  address: corp.value?.address || '',
  contact_name: contactUser.value?.username || '',
  contact_phone: contactUser.value?.phone || '',
  contact_email: contactUser.value?.email || ''
}));

async function getCorpDetail(id: CommonType.IdType) {
  startDetailLoading();
  const { data, error } = await fetchGetCorp({ id, options: [{ key: 1 }] }).finally(endDetailLoading);

  if (error) return;

  detail.value = data;
}

function closeDrawer() {
  visible.value = false;
}

async function handleAuditStatus(auditStatus: number) {
  if (props.rowId === null || props.rowId === undefined) return;

  startSubmitLoading();
  const { error } = await fetchUpdateCorpAuditStatus({
    id: props.rowId,
    audit_status: auditStatus
  }).finally(endSubmitLoading);

  if (error) return;

  window.$message?.success(auditStatus === AUDIT_PASS_STATUS ? '审核已通过' : '审核已拒绝');
  closeDrawer();
  emit('submitted');
}

watch(
  () => [visible.value, props.rowId] as const,
  ([isVisible, rowId]) => {
    if (!isVisible) {
      detail.value = null;
      return;
    }

    if (rowId !== null && rowId !== undefined) {
      getCorpDetail(rowId);
    }
  }
);
</script>

<template>
  <NDrawer v-model:show="visible" title="审核" display-directive="show" :width="600" class="max-w-90%">
    <NDrawerContent title="审核" :native-scrollbar="false" closable>
      <NSpin :show="detailLoading">
        <NForm label-placement="top" :disabled="true" :label-width="112" :model="displayModel" class="py-16px">
          <NFormItem label="集成商名称" path="name">
            <NInput :value="displayModel.name" readonly />
          </NFormItem>
          <NFormItem label="集成商地址" path="address">
            <NInput :value="displayModel.address" readonly />
          </NFormItem>
          <NFormItem label="联系人" path="contact_name">
            <NInput :value="displayModel.contact_name" readonly />
          </NFormItem>
          <NFormItem label="联系电话" path="contact_phone">
            <NInput :value="displayModel.contact_phone" readonly />
          </NFormItem>
          <NFormItem label="邮箱" path="contact_email">
            <NInput :value="displayModel.contact_email" readonly />
          </NFormItem>
        </NForm>
      </NSpin>
      <template #footer>
        <NSpace :size="16">
          <NButton
            :disabled="detailLoading || !corp"
            :loading="submitLoading"
            type="error"
            ghost
            @click="handleAuditStatus(AUDIT_REJECT_STATUS)"
          >
            拒绝
          </NButton>
          <NButton
            :disabled="detailLoading || !corp"
            :loading="submitLoading"
            type="primary"
            @click="handleAuditStatus(AUDIT_PASS_STATUS)"
          >
            通过
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
