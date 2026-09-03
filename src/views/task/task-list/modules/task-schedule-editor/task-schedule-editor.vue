<script setup lang="ts">
import ButtonIcon from '@/components/custom/button-icon.vue';
import { intervalTimeTypeMap, repeatTypeMap, scheduleTypeMap, weekdayMap } from '../../../constants';
import TaskYearDatePicker from './task-year-date-picker.vue';
import TaskTimeRangePicker from './task-time-range-picker.vue';
import {
  createTaskScheduleTimeNode,
  createTaskScheduleCalendarDateGroup,
  type TaskScheduleEditorModel,
  type TaskScheduleTimeNode
} from './use-task-schedule-editor';

defineOptions({
  name: 'TaskScheduleEditor'
});

const model = defineModel<TaskScheduleEditorModel>('model', { required: true });

const scheduleTypeOptions = Object.entries(scheduleTypeMap).map(([value, label]) => ({
  label,
  value: Number(value) as Api.Task.TaskScheduleType
}));
const repeatTypeOptions = Object.entries(repeatTypeMap).map(([value, label]) => ({
  label,
  value: Number(value) as Api.Task.TaskScheduleRepeatType
}));
const weekdayOptions = ([1, 2, 3, 4, 5, 6, 0] as Api.Task.TaskScheduleWeekday[]).map(value => ({
  label: weekdayMap[value],
  value
}));
const intervalTimeTypeOptions = Object.entries(intervalTimeTypeMap).map(([value, label]) => ({
  label,
  value: Number(value) as Api.Task.TaskConditionTimeType
}));

function addTime(nodes: TaskScheduleTimeNode[]) {
  nodes.push(createTaskScheduleTimeNode());
}

function removeTime(nodes: TaskScheduleTimeNode[], index: number) {
  nodes.splice(index, 1);

  if (nodes.length === 0) {
    nodes.push(createTaskScheduleTimeNode());
  }
}

function addCalendarGroup() {
  model.value.calendar.date_groups.push(createTaskScheduleCalendarDateGroup());
}
function removeCalendarGroup(index: number) {
  model.value.calendar.date_groups.splice(index, 1);
  if (!model.value.calendar.date_groups.length) addCalendarGroup();
}
</script>

<template>
  <div class="flex flex-col gap-16px p-2px">
    <div class="min-h-40px flex items-center gap-10px">
      <span class="h-28px w-4px flex-none rounded-4px bg-#2563eb shadow-[0_6px_14px_rgba(37,99,235,0.16)]"></span>
      <div class="text-15px text-[var(--n-text-color-1)] font-600 leading-20px">调度设置</div>
    </div>

    <NRadioGroup v-model:value="model.type" name="schedule-type" class="schedule-type-group">
      <NRadioButton v-for="option in scheduleTypeOptions" :key="option.value" :value="option.value">
        {{ option.label }}
      </NRadioButton>
    </NRadioGroup>

    <section
      class="rounded-8px border border-#e2e8f0/72 border-solid bg-white p-16px shadow-[0_8px_22px_rgba(15,23,42,0.05)] dark:border-#2f3338 dark:bg-#1f2228 dark:shadow-none [&_.n-form-item-label]:font-500"
    >
      <NForm label-placement="top" :show-feedback="false">
        <NFormItem v-if="model.type === 1" label="执行时间">
          <NDatePicker
            v-model:value="model.once.execution_at"
            type="datetime"
            clearable
            class="w-full"
            placeholder="请选择执行时间"
          />
        </NFormItem>

        <template v-else-if="model.type === 2">
          <NFormItem label="重复方式">
            <NRadioGroup v-model:value="model.daily.repeat_type" name="daily-repeat-type">
              <NRadioButton v-for="option in repeatTypeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </NRadioButton>
            </NRadioGroup>
          </NFormItem>
          <NFormItem v-if="model.daily.repeat_type === 2" label="执行星期" class="mt-12px">
            <NCheckboxGroup v-model:value="model.daily.weekdays">
              <NSpace>
                <NCheckbox v-for="option in weekdayOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </NCheckbox>
              </NSpace>
            </NCheckboxGroup>
          </NFormItem>
          <NFormItem label="执行时间节点" class="mt-12px">
            <div class="w-full flex flex-col gap-10px">
              <div v-for="(time, index) in model.daily.execution_at_list" :key="time._key" class="flex gap-8px">
                <NTimePicker v-model:value="time.value" class="flex-1" clearable format="HH:mm:ss" />
                <ButtonIcon
                  size="small"
                  type="error"
                  icon="material-symbols:delete-outline"
                  tooltip-content="删除时间节点"
                  @click="removeTime(model.daily.execution_at_list, index)"
                />
                <ButtonIcon
                  v-if="index === model.daily.execution_at_list.length - 1"
                  size="small"
                  type="primary"
                  icon="material-symbols:add-rounded"
                  tooltip-content="新增时间节点"
                  @click="addTime(model.daily.execution_at_list)"
                />
              </div>
            </div>
          </NFormItem>
        </template>

        <NGrid v-else-if="model.type === 3" responsive="screen" item-responsive :x-gap="16">
          <NFormItemGi span="24 m:16" label="间隔时间">
            <NInputNumber
              v-model:value="model.interval.intervals"
              class="w-full"
              :min="1"
              :precision="0"
              placeholder="请输入间隔时间"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:8" label="时间单位">
            <NSelect v-model:value="model.interval.time_type" :options="intervalTimeTypeOptions" />
          </NFormItemGi>
        </NGrid>

        <template v-else-if="model.type === 4">
          <NFormItem label="执行日期">
            <TaskYearDatePicker v-model="model.custom.execution_date_list" />
          </NFormItem>
          <NFormItem label="执行时间节点" class="mt-12px">
            <div class="w-full flex flex-col gap-10px">
              <div v-for="(time, index) in model.custom.execution_at_list" :key="time._key" class="flex gap-8px">
                <NTimePicker v-model:value="time.value" class="flex-1" clearable format="HH:mm:ss" />
                <ButtonIcon
                  size="small"
                  type="error"
                  icon="material-symbols:delete-outline"
                  tooltip-content="删除时间节点"
                  @click="removeTime(model.custom.execution_at_list, index)"
                />
                <ButtonIcon
                  v-if="index === model.custom.execution_at_list.length - 1"
                  size="small"
                  type="primary"
                  icon="material-symbols:add-rounded"
                  tooltip-content="新增时间节点"
                  @click="addTime(model.custom.execution_at_list)"
                />
              </div>
            </div>
          </NFormItem>
        </template>

        <template v-else>
          <div class="mb-12px flex items-center justify-between">
            <span>日期组</span>
            <NButton size="small" text type="primary" @click="addCalendarGroup">新增日期组</NButton>
          </div>
          <div class="flex flex-col gap-12px">
            <div
              v-for="(group, groupIndex) in model.calendar.date_groups"
              :key="group._key"
              class="rounded-6px border border-#e5e7eb border-solid p-12px dark:border-#2f3338"
            >
              <div class="mb-8px flex items-center justify-between font-500">
                <span>日期组 {{ groupIndex + 1 }}</span>
                <ButtonIcon
                  size="small"
                  type="error"
                  icon="material-symbols:delete-outline"
                  tooltip-content="删除日期组"
                  @click="removeCalendarGroup(groupIndex)"
                />
              </div>
              <TaskYearDatePicker v-model="group.execution_date_list" />
              <TaskTimeRangePicker v-model="group.time_ranges" class="mt-12px" />
            </div>
          </div>
          <NGrid class="mt-12px" responsive="screen" item-responsive :x-gap="16">
            <NFormItemGi span="24 m:12" label="轮询间隔">
              <NInputNumber
                v-model:value="model.calendar.poll_interval_seconds"
                :min="30"
                :max="3600"
                :precision="0"
                button-placement="right"
                class="w-full"
                placeholder="请输入轮询间隔"
              >
                <template #suffix>秒</template>
              </NInputNumber>
            </NFormItemGi>
            <NFormItemGi span="24 m:12" label="连续失败上限">
              <NInputNumber
                v-model:value="model.calendar.max_continuous_fail"
                :min="1"
                :max="10"
                :precision="0"
                button-placement="right"
                class="w-full"
                placeholder="请输入连续失败上限"
              >
                <template #suffix>次</template>
              </NInputNumber>
            </NFormItemGi>
          </NGrid>
        </template>
      </NForm>
    </section>
  </div>
</template>

<style scoped>
.schedule-type-group {
  display: flex;
  flex-wrap: wrap;
}
</style>
