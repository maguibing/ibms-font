<script setup lang="ts">
import { ref, toRaw } from 'vue';
import { NDatePicker } from 'naive-ui';
import { jsonClone } from '@sa/utils';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'UserSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const dateRangeCreateTime = ref<[string, string] | null>(null);

const model = defineModel<Api.System.UserSearchParams>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));

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
  emit('reset');
}

async function search() {
  await validate();
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="table-search card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="user-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.system.user.userName')" path="username" class="pr-24px">
              <NInput v-model:value="model.username" :placeholder="$t('page.system.user.form.userName.required')" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.system.user.phonenumber')" path="phone" class="pr-24px">
              <NInput v-model:value="model.phone" :placeholder="$t('page.system.user.form.phonenumber.required')" />
            </NFormItemGi>

            <NFormItemGi
              span="24 s:12 m:12"
              :label="$t('page.system.user.createTime')"
              path="createTime"
              class="pr-24px"
            >
              <NDatePicker
                v-model:formatted-value="dateRangeCreateTime"
                type="datetimerange"
                value-format="t"
                clearable
                @update:formatted-value="onDateRangeCreateTimeUpdate"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:12" class="pr-24px">
              <NSpace class="w-full" justify="end">
                <NButton @click="reset">
                  <template #icon>
                    <icon-ic-round-refresh class="text-icon" />
                  </template>
                  {{ $t('common.reset') }}
                </NButton>
                <NButton type="primary" ghost @click="search">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  {{ $t('common.search') }}
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
