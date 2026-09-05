<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchCreateTask, fetchGetTask, fetchUpdateTask } from '@/service/api/task';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { createTaskTypeOptions } from '../../constants';
import TaskPointRuleEditor from './task-point-rule-editor/task-point-rule-editor.vue';
import TaskScheduleEditor from './task-schedule-editor/task-schedule-editor.vue';
import TaskCalendarActionEditor, { type TaskCalendarActionEditorModel } from './task-calendar-action-editor.vue';
import {
  buildTaskActionSubmitModel,
  buildTaskConditionSubmitModel,
  createDefaultTaskActionModel,
  createDefaultAction,
  createDefaultActionPoint,
  createDefaultTaskConditionModel,
  getTaskActionValidationMessage,
  getTaskConditionValidationMessage,
  normalizeTaskActionModel,
  normalizeTaskConditionModel,
  type TaskActionEditorModel,
  type TaskConditionEditorModel
} from './task-point-rule-editor/use-task-point-rule-editor';
import {
  buildScheduledTaskConditionSetting,
  createDefaultTaskScheduleModel,
  getTaskScheduleValidationMessage,
  normalizeTaskScheduleModel,
  type TaskScheduleEditorModel
} from './task-schedule-editor/use-task-schedule-editor';

defineOptions({
  name: 'TaskOperateDrawer'
});

interface Emits {
  (e: 'submitted'): void;
}

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Task.Task | null;
}

type Model = Pick<Api.Task.TaskOperateParams, 'name' | 'desc' | 'task_type' | 'status'> & {
  id: CommonType.IdType | null;
};
type RuleKey = Extract<keyof Model, 'name' | 'task_type' | 'status'>;

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();

const model = ref<Model>(createDefaultModel());
const conditionModel = ref<TaskConditionEditorModel>(createDefaultTaskConditionModel());
const scheduleModel = ref<TaskScheduleEditorModel>(createDefaultTaskScheduleModel());
const actionModel = ref<TaskActionEditorModel>(createDefaultTaskActionModel());
const calendarActionModel = ref<TaskCalendarActionEditorModel>(createDefaultCalendarActionModel());
const calendarActionEditorRef = useTemplateRef<InstanceType<typeof TaskCalendarActionEditor>>('calendarActionEditor');

const isEdit = computed(() => props.operateType === 'edit');
const title = computed(() => (isEdit.value ? $t('taskList.edit') : $t('taskList.add')));
const taskTypeOptions = computed(createTaskTypeOptions);

const rules: Record<RuleKey, App.Global.FormRule> = {
  name: createRequiredRule($t('taskList.taskNamePlaceholder')),
  task_type: createRequiredRule($t('taskList.taskTypePlaceholder')),
  status: createRequiredRule($t('taskList.statusPlaceholder'))
};

function createDefaultModel(): Model {
  return {
    id: null,
    name: '',
    desc: '',
    task_type: 1,
    status: 1
  };
}

function buildModelFromTask(task: Api.Task.Task): Model {
  return {
    id: task.id,
    name: task.name,
    desc: task.desc ?? '',
    task_type: task.task_type,
    status: task.status
  };
}

function resetModel() {
  model.value = createDefaultModel();
  conditionModel.value = createDefaultTaskConditionModel();
  scheduleModel.value = createDefaultTaskScheduleModel();
  actionModel.value = createDefaultTaskActionModel();
  calendarActionModel.value = createDefaultCalendarActionModel();
}

async function handleUpdateModel() {
  resetModel();

  if (!isEdit.value) return;

  startLoading();
  const { data, error } = await fetchGetTask({
    id: props.rowData!.id,
    options: [{ key: 1 }, { key: 2 }]
  }).finally(endLoading);
  if (error) return;

  model.value = buildModelFromTask(data.task);
  const maps = {
    deviceMap: data.device_map,
    deviceTypePointMap: data.device_type_point_map
  };
  if (data.task.task_type === 1) {
    conditionModel.value = normalizeTaskConditionModel(data.task.cond_setting, maps);
  } else {
    scheduleModel.value = normalizeTaskScheduleModel(data.task.cond_setting.sched);
  }
  actionModel.value = normalizeTaskActionModel(data.task.action_setting, maps);
  calendarActionModel.value = normalizeCalendarActionModel(data.task.action_setting, maps);
}

function closeDrawer() {
  visible.value = false;
}

function buildSubmitParams(): Api.Task.TaskOperateParams {
  const condSetting =
    model.value.task_type === 1
      ? buildTaskConditionSubmitModel(conditionModel.value)
      : buildScheduledTaskConditionSetting(scheduleModel.value);

  const isCalendar = model.value.task_type === 2 && scheduleModel.value.type === 5;
  const actionSetting: Api.Task.TaskActionSetting = isCalendar
    ? {
        actions: buildTaskActionSubmitModel(calendarActionModel.value.actions).actions,
        out_actions: buildTaskActionSubmitModel(calendarActionModel.value.outActions).actions
      }
    : buildTaskActionSubmitModel(actionModel.value);
  if (isCalendar) {
    actionSetting.actions?.forEach(action => {
      action.delay_seconds = 0;
      action.continuous_times = 1;
    });
    actionSetting.out_actions?.forEach(action => {
      action.delay_seconds = 0;
      action.continuous_times = 1;
    });
  }
  return {
    name: model.value.name,
    desc: model.value.desc,
    task_type: model.value.task_type,
    status: model.value.status,
    cond_setting: condSetting,
    action_setting: actionSetting
  };
}

function buildUpdateParams(): Api.Task.TaskUpdateParams {
  return {
    ...buildSubmitParams(),
    id: model.value.id as CommonType.IdType
  };
}

async function handleSubmit() {
  if (loading.value) return;

  startLoading();
  try {
    await validate();

    if (!validateTaskRuleModels()) return;

    const { error } = isEdit.value
      ? await fetchUpdateTask(buildUpdateParams())
      : await fetchCreateTask(buildSubmitParams());
    if (error) return;

    window.$message?.success(isEdit.value ? $t('common.updateSuccess') : $t('common.addSuccess'));
    closeDrawer();
    emit('submitted');
  } finally {
    endLoading();
  }
}

function validateTaskRuleModels() {
  const isCalendar = model.value.task_type === 2 && scheduleModel.value.type === 5;
  const message =
    (model.value.task_type === 1
      ? getTaskConditionValidationMessage(conditionModel.value)
      : getTaskScheduleValidationMessage(scheduleModel.value)) ||
    (isCalendar
      ? calendarActionEditorRef.value?.getValidationMessage()
      : getTaskActionValidationMessage(actionModel.value));

  if (message) {
    window.$message?.warning(message);
    return false;
  }

  return true;
}

function createDefaultCalendarActionModel(): TaskCalendarActionEditorModel {
  return {
    actions: createDefaultTaskActionModel(),
    outActions: createDefaultTaskActionModel()
  };
}

function normalizeCalendarActionModel(
  actionSetting: Api.Task.TaskActionSetting,
  maps: { deviceMap: CommonType.IdNameMap; deviceTypePointMap: Record<string, Api.Task.TaskDeviceTypePointMapItem> }
): TaskCalendarActionEditorModel {
  const actions = normalizeTaskActionModel(actionSetting, maps);
  const outActions = normalizeTaskActionModel({ actions: actionSetting.out_actions }, maps);

  outActions.actions = actions.actions.map((action, actionIndex) => {
    const outAction = outActions.actions[actionIndex] ?? createDefaultAction();
    outAction.device_id = action.device_id;
    outAction.selected_device = action.selected_device;
    outAction.delay_seconds = 0;
    outAction.continuous_times = 1;
    outAction.point_vals = action.point_vals.map(point => {
      const existingPoint = outAction.point_vals.find(item => item.device_type_point_id === point.device_type_point_id);
      const nextPoint = existingPoint ?? createDefaultActionPoint();
      nextPoint.device_type_point_id = point.device_type_point_id;
      nextPoint.data_type = point.data_type;
      nextPoint.setting = point.setting;
      nextPoint.selected_device_type_point = point.selected_device_type_point;
      return nextPoint;
    });
    return outAction;
  });

  return { actions, outActions };
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModel().then(restoreValidation);
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="750" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NSpin :show="loading">
        <div class="task-operate-content">
          <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
            <NGrid responsive="screen" item-responsive :x-gap="16">
              <NFormItemGi span="24" :label="$t('taskList.taskName')" path="name">
                <NInput
                  v-model:value="model.name"
                  maxlength="30"
                  show-count
                  :placeholder="$t('taskList.taskNamePlaceholder')"
                />
              </NFormItemGi>
              <NFormItemGi span="24 m:12" :label="$t('taskList.taskType')" path="task_type">
                <NRadioGroup v-model:value="model.task_type" :disabled="isEdit">
                  <NSpace>
                    <NRadio v-for="item in taskTypeOptions" :key="item.value" :value="item.value">
                      {{ item.label }}
                    </NRadio>
                  </NSpace>
                </NRadioGroup>
              </NFormItemGi>
              <NFormItemGi span="24 m:12" :label="$t('taskList.status')" path="status">
                <NSwitch v-model:value="model.status" :checked-value="1" :unchecked-value="2">
                  <template #checked>{{ $t('taskList.enabled') }}</template>
                  <template #unchecked>{{ $t('taskList.disabled') }}</template>
                </NSwitch>
              </NFormItemGi>
              <NFormItemGi span="24" :label="$t('taskList.remark')" path="desc">
                <NInput
                  v-model:value="model.desc"
                  type="textarea"
                  maxlength="200"
                  show-count
                  :rows="3"
                  :placeholder="$t('taskList.descriptionPlaceholder')"
                />
              </NFormItemGi>
            </NGrid>
          </NForm>

          <NDivider class="!my-0" />

          <TaskPointRuleEditor v-if="model.task_type === 1" v-model:model="conditionModel" mode="condition" />
          <TaskScheduleEditor v-else v-model:model="scheduleModel" />

          <NDivider class="!my-0" />

          <TaskCalendarActionEditor
            v-if="model.task_type === 2 && scheduleModel.type === 5"
            ref="calendarActionEditor"
            v-model:model="calendarActionModel"
          />
          <TaskPointRuleEditor v-else v-model:model="actionModel" mode="action" />
        </div>
      </NSpin>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.task-operate-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
