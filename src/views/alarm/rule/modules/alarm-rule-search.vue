<script setup lang="ts">
import { toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { $t } from '@/locales';
import { alarmLevelOptions } from '../../shared';

defineOptions({
  name: 'AlarmRuleSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.Alarm.AlarmRuleSearchParams>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));

function search() {
  emit('search');
}

function reset() {
  Object.assign(model.value, defaultModel);
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="table-search card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="alarm-rule-search">
        <NForm :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:8" label="规则名称" path="name" class="pr-24px">
              <NInput v-model:value="model.name" clearable placeholder="请输入报警规则名称" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:8" label="报警等级" path="alarm_level" class="pr-24px">
              <NSelect
                v-model:value="model.alarm_level"
                :options="alarmLevelOptions"
                clearable
                placeholder="请选择报警等级"
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
