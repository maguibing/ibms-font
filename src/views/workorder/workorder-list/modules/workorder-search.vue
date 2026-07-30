<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, toRaw } from 'vue';
import { NCollapse, NCollapseItem, type SelectOption } from 'naive-ui';
import { jsonClone } from '@sa/utils';
import { fetchGetUserList } from '@/service/api/system';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'WorkorderSearch'
});

interface Props {
  bordered?: boolean;
  collapsible?: boolean;
  mode: 'repair' | 'deal';
}

const props = withDefaults(defineProps<Props>(), {
  bordered: false,
  collapsible: true
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
const searchWrapper = computed(() => (props.collapsible ? NCollapse : 'div'));
const searchContentWrapper = computed(() => (props.collapsible ? NCollapseItem : 'div'));
const searchContentProps = computed(() =>
  props.collapsible ? { title: $t('common.search'), name: 'workorder-search' } : {}
);
const searchItemSpan = '24 s:12 m:6';

const statusOptions = [
  { label: '待处理', value: 1 },
  { label: '处理中', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 }
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
    { label: '系统自动生成', value: 0 },
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
    <component :is="searchWrapper">
      <component :is="searchContentWrapper" v-bind="searchContentProps">
        <NForm ref="formRef" :model="model" label-placement="left" :show-feedback="props.collapsible">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              v-if="mode === 'repair'"
              :span="searchItemSpan"
              label="报修人"
              path="repairman_uid"
              class="pr-24px"
            >
              <NSelect
                v-model:value="model.repairman_uid"
                :options="userOptions"
                :loading="userLoading"
                filterable
                clearable
                placeholder="请选择报修人"
              />
            </NFormItemGi>
            <NFormItemGi v-else :span="searchItemSpan" label="处理人" path="dealer_uid" class="pr-24px">
              <NSelect
                v-model:value="model.dealer_uid"
                :options="userOptions"
                :loading="userLoading"
                filterable
                clearable
                placeholder="请选择处理人"
              />
            </NFormItemGi>
            <NFormItemGi :span="searchItemSpan" label="工单状态" path="deal_status" class="pr-24px">
              <NSelect
                v-model:value="model.deal_status"
                :options="statusOptions"
                clearable
                placeholder="请选择工单状态"
              />
            </NFormItemGi>
            <NFormItemGi :span="searchItemSpan" label="创建时间" path="dateRange" class="pr-24px">
              <NDatePicker
                v-model:formatted-value="dateRange"
                type="datetimerange"
                value-format="t"
                clearable
                :default-time="['00:00:00', '23:59:59']"
                @update:formatted-value="handleDateRangeUpdate"
              />
            </NFormItemGi>
            <NFormItemGi :show-feedback="false" :span="searchItemSpan" class="pr-24px">
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
      </component>
    </component>
  </NCard>
</template>

<style scoped></style>
