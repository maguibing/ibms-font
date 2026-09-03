<script setup lang="ts">
import { onMounted, ref, shallowRef, toRaw } from 'vue';
import type { SelectOption } from 'naive-ui';
import { jsonClone } from '@sa/utils';
import { fetchGetUserList } from '@/service/api/system';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'WorkorderSearch'
});

interface Props {
  bordered?: boolean;
  mode: 'repair' | 'deal';
}

const props = withDefaults(defineProps<Props>(), {
  bordered: false
});

const emit = defineEmits<{
  search: [];
}>();

const model = defineModel<Api.Workorder.WorkorderSearchParams>('model', { required: true });
const { formRef, validate, restoreValidation } = useNaiveForm();
const defaultModel = jsonClone(toRaw(model.value));
const dateRange = ref<[string, string] | null>(null);
const userLoading = shallowRef(false);
const userOptions = shallowRef<SelectOption[]>([]);
const searchItemSpan = '24 s:12 m:6';

const statusOptions = [
  { label: $t('workorder.pending'), value: 1 },
  { label: $t('workorder.processing'), value: 2 },
  { label: $t('workorder.completed'), value: 3 },
  { label: $t('workorder.cancelled'), value: 4 }
];
async function fetchUserOptions() {
  userLoading.value = true;
  const { data, error } = await fetchGetUserList({
    list_option: {
      options: [{ type: 51, value: 'true' }],
      offset: 0,
      limit: 500
    }
  });

  userLoading.value = false;
  if (error) return;

  userOptions.value = [
    { label: $t('workorder.system'), value: 0 },
    ...(data?.list ?? []).map(user => ({ label: user.username, value: user.user_id }))
  ];
}

function handleDateRangeUpdate(value: [string, string] | null) {
  dateRange.value = value;
  model.value.dateRange = value ? [Number(value[0]), Number(value[1])] : null;
}

async function reset() {
  await restoreValidation();
  dateRange.value = null;
  Object.assign(model.value, defaultModel);
  emit('search');
}

async function search() {
  await validate();
  emit('search');
}

onMounted(fetchUserOptions);
</script>

<template>
  <NCard :bordered="props.bordered" size="small" class="table-search card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="workorder-search">
        <NForm ref="formRef" :model="model" label-placement="left">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              v-if="mode === 'repair'"
              :span="searchItemSpan"
              :label="$t('workorder.repairman')"
              path="repairman_uid"
              class="pr-24px"
            >
              <NSelect
                v-model:value="model.repairman_uid"
                :options="userOptions"
                :loading="userLoading"
                filterable
                clearable
                :placeholder="$t('workorder.selectRepairman')"
              />
            </NFormItemGi>
            <NFormItemGi
              v-else
              :span="searchItemSpan"
              :label="$t('workorder.dealer')"
              path="dealer_uid"
              class="pr-24px"
            >
              <NSelect
                v-model:value="model.dealer_uid"
                :options="userOptions"
                :loading="userLoading"
                filterable
                clearable
                :placeholder="$t('workorder.selectDealer')"
              />
            </NFormItemGi>
            <NFormItemGi :span="searchItemSpan" :label="$t('workorder.status')" path="deal_status" class="pr-24px">
              <NSelect
                v-model:value="model.deal_status"
                :options="statusOptions"
                clearable
                :placeholder="$t('workorder.selectStatus')"
              />
            </NFormItemGi>
            <NFormItemGi :span="searchItemSpan" :label="$t('workorder.createdAt')" path="dateRange" class="pr-24px">
              <NDatePicker
                v-model:formatted-value="dateRange"
                type="datetimerange"
                value-format="t"
                clearable
                :default-time="['00:00:00', '23:59:59']"
                @update:formatted-value="handleDateRangeUpdate"
              />
            </NFormItemGi>
            <NFormItemGi :span="searchItemSpan">
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
