<script setup lang="ts">
import { ref, toRaw } from 'vue';
import { NDatePicker } from 'naive-ui';
import type { SelectOption } from 'naive-ui';
import { jsonClone } from '@sa/utils';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'AssetsSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const dateRangeCreateTime = ref<[string, string] | null>(null);

const model = defineModel<Api.Ledger.AssetsSearchParams>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));

const statusOptions: SelectOption[] = [
  { label: '正常', value: 1 },
  { label: '维修', value: 2 },
  { label: '报废', value: 3 }
];

const defaultTime: [string, string] = ['00:00:00', '23:59:59'];

function onDateRangeCreateTimeUpdate(value: [string, string] | null) {
  if (!value) {
    model.value.dateRange = null;
    return;
  }

  const start = Number(value[0]);
  const end = Number(value[1]);

  if (Number.isFinite(start) && Number.isFinite(end)) {
    model.value.dateRange = [start, end];
    return;
  }

  model.value.dateRange = null;
}

function resetModel() {
  dateRangeCreateTime.value = null;
  Object.assign(model.value, defaultModel);
}

async function reset() {
  await restoreValidation();
  resetModel();
  emit('search');
}

async function search() {
  await validate();
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="table-search card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="assets-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="90">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:8" label="资产编号" path="sn" class="pr-24px" label-width="auto">
              <NInput v-model:value="model.sn" clearable placeholder="请输入资产编号" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" label="资产名称" path="name" class="pr-24px" label-width="auto">
              <NInput v-model:value="model.name" clearable placeholder="请输入资产名称" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" label="资产状态" path="status" class="pr-24px" label-width="auto">
              <NSelect v-model:value="model.status" clearable :options="statusOptions" placeholder="请选择资产状态" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" label="创建时间" path="dateRange" class="pr-24px" label-width="auto">
              <NDatePicker
                v-model:formatted-value="dateRangeCreateTime"
                type="datetimerange"
                value-format="t"
                clearable
                :default-time="defaultTime"
                @update:formatted-value="onDateRangeCreateTimeUpdate"
              />
            </NFormItemGi>
            <NFormItemGi :show-feedback="false" span="24 s:24 m:16" class="pr-24px">
              <NSpace class="w-full" justify="end">
                <NButton type="primary" ghost @click="search">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  {{ $t('common.search') }}
                </NButton>
                <NButton @click="reset">
                  <template #icon>
                    <icon-ic-round-refresh class="text-icon" />
                  </template>
                  {{ $t('common.reset') }}
                </NButton>
              </NSpace>
            </NFormItemGi>
          </NGrid>
        </NForm>
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>

<style scoped></style>
