<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchRenewalVersion } from '@/service/api/corp';

defineOptions({
  name: 'RenewalVersionModal'
});

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const { loading, startLoading, endLoading } = useLoading();

const visible = shallowRef(false);
const versionId = shallowRef<CommonType.IdType | null>(null);
const duration = shallowRef<number | null>(1);
const unitDays = shallowRef(1);

const unitOptions = [
  { label: '日', value: 1 },
  { label: '月', value: 30 },
  { label: '年', value: 365 }
];

const renewalDays = computed(() => Number(duration.value || 0) * unitDays.value);

function open(id: CommonType.IdType) {
  versionId.value = id;
  duration.value = 1;
  unitDays.value = 1;
  visible.value = true;
}

function close() {
  visible.value = false;
}

async function handleSubmit() {
  if (!versionId.value) return;

  if (renewalDays.value <= 0) {
    window.$message?.warning('请输入续费时长');
    return;
  }

  startLoading();
  const { error } = await fetchRenewalVersion({
    id: versionId.value,
    days: renewalDays.value
  }).finally(endLoading);

  if (error) return;

  window.$message?.success('续费成功');
  close();
  emit('submitted');
}

defineExpose({
  open
});
</script>

<template>
  <NModal
    v-model:show="visible"
    title="续费"
    preset="card"
    :bordered="false"
    display-directive="show"
    class="max-w-90% w-420px"
    @close="close"
  >
    <NForm label-placement="top">
      <NFormItem label="请输入续费时长:">
        <NInputGroup>
          <NInputNumber
            v-model:value="duration"
            :min="1"
            :precision="0"
            :show-button="false"
            placeholder="请输入续费时长"
            class="flex-1"
          />
          <NSelect
            v-model:value="unitDays"
            :options="unitOptions"
            :consistent-menu-width="false"
            class="w-110px"
          />
        </NInputGroup>
      </NFormItem>
    </NForm>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="close">取消</NButton>
        <NButton type="primary" :loading="loading" @click="handleSubmit">确认</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
