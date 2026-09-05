<script setup lang="ts">
import { onMounted, ref, shallowRef, toRaw } from 'vue';
import type { SelectOption } from 'naive-ui';
import { jsonClone } from '@sa/utils';
import { fetchGetAlarmRuleList } from '@/service/api/alarm';
import { $t } from '@/locales';
import { createAlarmBaseOptions, createAlarmLevelOptions } from '../../shared';

defineOptions({
  name: 'AlarmRecordSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.Alarm.AlarmRecordSearchParams>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));
const dateRange = ref<[string, string] | null>(null);
const alarmRuleLoading = shallowRef(false);
const alarmRuleOptions = shallowRef<SelectOption[]>([]);
const alarmLevelOptions = createAlarmLevelOptions();

function handleDateRangeUpdate(value: [string, string] | null) {
  dateRange.value = value;
  model.value.dateRange = value ? [Number(value[0]), Number(value[1])] : null;
}

function search() {
  emit('search');
}

function reset() {
  dateRange.value = null;
  Object.assign(model.value, defaultModel);
  emit('search');
}

async function fetchAlarmRuleOptions() {
  alarmRuleLoading.value = true;
  const { data: response, error } = await fetchGetAlarmRuleList({
    list_option: {
      options: createAlarmBaseOptions(),
      offset: 0,
      limit: 100
    },
    options: [{ key: 1 }]
  }).finally(() => {
    alarmRuleLoading.value = false;
  });

  if (error) return;

  alarmRuleOptions.value = (response?.list ?? []).map(item => ({
    label: item.name,
    value: item.id
  }));
}

onMounted(fetchAlarmRuleOptions);
</script>

<template>
  <NCard :bordered="false" size="small" class="table-search card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="alarm-record-search">
        <NForm :model="model" label-placement="left">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:8" :label="$t('alarmRecord.alarmRule')" path="alarm_rule_id" class="pr-24px">
              <NSelect
                v-model:value="model.alarm_rule_id"
                :options="alarmRuleOptions"
                :loading="alarmRuleLoading"
                filterable
                clearable
                :placeholder="$t('alarmRecord.selectAlarmRule')"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" :label="$t('alarmRecord.alarmLevel')" path="alarm_level" class="pr-24px">
              <NSelect
                v-model:value="model.alarm_level"
                :options="alarmLevelOptions"
                clearable
                :placeholder="$t('alarmRecord.selectAlarmLevel')"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" :label="$t('alarmRecord.alarmTime')" path="dateRange" class="pr-24px">
              <NDatePicker
                v-model:formatted-value="dateRange"
                type="datetimerange"
                value-format="t"
                clearable
                :default-time="['00:00:00', '23:59:59']"
                @update:formatted-value="handleDateRangeUpdate"
              />
            </NFormItemGi>
            <NFormItemGi :show-feedback="false" span="24">
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
