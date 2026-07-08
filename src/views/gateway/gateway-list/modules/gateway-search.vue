<script setup lang="ts">
import { toRaw } from 'vue';
import type { SelectOption } from 'naive-ui';
import { jsonClone } from '@sa/utils';
import { useNaiveForm } from '@/hooks/common/form';
import { GATEWAY_PROTOCOL_OPTIONS } from '../shared';
import { $t } from '@/locales';

defineOptions({
  name: 'GatewaySearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.Gateway.GatewaySearchParams>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));

const protocolOptions: SelectOption[] = GATEWAY_PROTOCOL_OPTIONS;

function resetModel() {
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
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="gateway-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="90">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:8" label="边缘设备名称" path="name" class="pr-24px" label-width="auto">
              <NInput v-model:value="model.name" clearable placeholder="请输入边缘设备名称" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" label="协议类型" path="protocol_type" class="pr-24px">
              <NSelect
                v-model:value="model.protocol_type"
                clearable
                :options="protocolOptions"
                placeholder="请选择协议类型"
              />
            </NFormItemGi>
            <NFormItemGi :show-feedback="false" span="24 s:12 m:8" class="pr-24px">
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
