<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import RemoteSearchSelect from '@/components/custom/remote-search-select.vue';
import SectionHeader from '@/components/custom/section-header.vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import {
  fetchCreateAlarmRule,
  fetchGetAlarmRule,
  fetchGetNoticeGroupList,
  fetchUpdateAlarmRule
} from '@/service/api/alarm';
import TaskPointRuleEditor from '@/views/task/task-list/modules/task-point-rule-editor/task-point-rule-editor.vue';
import {
  createDefaultTaskConditionModel,
  getTaskConditionValidationMessage,
  isRangeThreshold,
  normalizeConditionFreq,
  normalizeTaskConditionModel,
  type TaskConditionEditorModel,
  type TaskConditionSubCondEditor,
  type TaskRuleEditorOptionMaps,
  type TaskRulePointValue
} from '@/views/task/task-list/modules/task-point-rule-editor/use-task-point-rule-editor';
import { $t } from '@/locales';
import { createAlarmBaseOptions, createAlarmLevelOptions } from '../../shared';
import AlarmRuleValidHourEditor from './alarm-rule-valid-hour-editor.vue';
import { buildRangesFromHours, parseHoursFromRanges } from './hour-range-selector';

defineOptions({
  name: 'AlarmRuleOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Alarm.AlarmRule | null;
  extraData?: Api.Alarm.AlarmRuleListExtra;
}

interface Emits {
  (e: 'submitted'): void;
}

type Model = Omit<Api.Alarm.AlarmRuleOperateParams, 'cond_setting'> & {
  notice_group_id_list: CommonType.IdType[];
  notice_limit: number;
  valid_time_ranges: Api.Alarm.AlarmRuleValidTimeRange[];
  is_autogen_workorder: boolean;
  is_system_auto_recover: boolean;
};

type RuleKey = Extract<keyof Model, 'name' | 'alarm_level' | 'status'>;

const props = withDefaults(defineProps<Props>(), {
  rowData: null,
  extraData: () => ({
    device_map: {},
    device_type_point_map: {},
    notice_group_map: {}
  })
});

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();

const model = ref<Model>(createDefaultModel());
const conditionModel = ref<TaskConditionEditorModel>(createDefaultTaskConditionModel());
const selectedNoticeGroups = shallowRef<CommonType.IdNameRecord[]>([]);

const isEdit = computed(() => props.operateType === 'edit');
const title = computed(() => (isEdit.value ? $t('alarmRule.edit') : $t('alarmRule.add')));

const alarmLevelOptions = computed(createAlarmLevelOptions);

const triggerTypeOptions = computed<CommonType.Option<Api.Alarm.AlarmRuleTriggerType>[]>(() => [
  { label: $t('alarmRule.triggerTypeDevicePointChange'), value: 1 }
]);

const deviceSourceTypeOptions = computed<CommonType.Option<Api.Alarm.AlarmRuleDeviceSourceType>[]>(() => [
  { label: $t('alarmRule.device'), value: 1 },
  { label: $t('alarmRule.deviceType'), value: 2 }
]);

const noticeGroupRequestParams: CommonType.CommonListQueryParams = {
  list_option: {
    options: createAlarmBaseOptions()
  }
};

const rules: Record<RuleKey, App.Global.FormRule> = {
  name: createRequiredRule($t('alarmRule.namePlaceholder')),
  alarm_level: createRequiredRule($t('alarmRule.alarmLevelPlaceholder')),
  status: createRequiredRule($t('alarmRule.statusPlaceholder'))
};

function createDefaultModel(): Model {
  return {
    id: null,
    name: '',
    desc: '',
    trigger_type: 1,
    alarm_level: 1,
    device_source_type: 1,
    status: 1,
    notice_group_id_list: [],
    notice_limit: 0,
    valid_time_ranges: createDefaultValidTimeRanges(),
    is_autogen_workorder: true,
    is_system_auto_recover: true
  };
}

function resetModel() {
  model.value = createDefaultModel();
  conditionModel.value = createDefaultTaskConditionModel();
  selectedNoticeGroups.value = [];
}

function getEditorOptionMaps(extraData?: Partial<Api.Alarm.AlarmRuleListExtra>): TaskRuleEditorOptionMaps {
  return {
    deviceMap: extraData?.device_map ?? {},
    deviceTypeMap: extraData?.device_type_map ?? {},
    deviceTypePointMap: extraData?.device_type_point_map ?? {}
  };
}

function getSelectedNoticeGroupOptions(
  noticeGroupIdList: CommonType.IdType[],
  extraData?: Api.Alarm.AlarmRuleListExtra
) {
  return noticeGroupIdList.map(id => ({
    id,
    name: extraData?.notice_group_map?.[String(id)]?.name ?? String(id)
  }));
}

function syncModelFromRow(row: Api.Alarm.AlarmRule, extraData?: Api.Alarm.AlarmRuleListExtra) {
  const condSetting = row.cond_setting ?? {};
  const noticeGroupIdList = normalizeIdList(condSetting.notice_group_id_list);
  const conditions = (condSetting.conds ?? []).map(condition => ({
    ...condition,
    device_source_type: row.device_source_type ?? 1
  }));

  model.value = {
    id: row.id,
    name: row.name ?? '',
    desc: row.desc ?? '',
    trigger_type: row.trigger_type ?? 1,
    alarm_level: row.alarm_level ?? 1,
    device_source_type: row.device_source_type ?? 1,
    status: row.status ?? 1,
    notice_group_id_list: noticeGroupIdList,
    notice_limit: condSetting.notice_limit ?? 0,
    valid_time_ranges: normalizeValidTimeRanges(condSetting.valid_time_ranges),
    is_autogen_workorder: condSetting.is_autogen_workorder ?? true,
    is_system_auto_recover: condSetting.is_system_auto_recover ?? true
  };
  conditionModel.value = normalizeTaskConditionModel(
    {
      conds: conditions as Api.Task.TaskCondition[],
      freq: condSetting.freq as Api.Task.TaskConditionFreq
    },
    getEditorOptionMaps(extraData)
  );
  selectedNoticeGroups.value = getSelectedNoticeGroupOptions(noticeGroupIdList, extraData);
}

async function handleUpdateModel() {
  resetModel();

  if (!isEdit.value || !props.rowData) return;

  startLoading();
  const { data, error } = await fetchGetAlarmRule({
    id: props.rowData.id,
    options: [{ key: 1 }, { key: 2 }, { key: 3 }]
  }).finally(endLoading);

  if (!visible.value || !isEdit.value) return;

  if (error) {
    syncModelFromRow(props.rowData, props.extraData);
    return;
  }

  syncModelFromRow(data?.alarm_rule ?? props.rowData, {
    device_map: data?.device_map ?? props.extraData.device_map,
    device_type_map: data?.device_type_map ?? props.extraData.device_type_map,
    device_type_point_map: data?.device_type_point_map ?? props.extraData.device_type_point_map,
    notice_group_map: data?.notice_group_map ?? props.extraData.notice_group_map
  });
}

function closeDrawer() {
  visible.value = false;
}

function fetchNoticeGroupList(params: Record<string, any>) {
  return fetchGetNoticeGroupList(params as CommonType.CommonListQueryParams);
}

function handleNoticeLimitChange(value: number | null) {
  model.value.notice_limit = value ?? 0;
}

function handleDeviceSourceTypeChange(value: Api.Alarm.AlarmRuleDeviceSourceType) {
  conditionModel.value = createDefaultTaskConditionModel(value);
}

function buildSubmitParams(): Api.Alarm.AlarmRuleCreateParams {
  return {
    name: model.value.name,
    desc: model.value.desc,
    trigger_type: model.value.trigger_type,
    alarm_level: model.value.alarm_level,
    device_source_type: model.value.device_source_type,
    status: model.value.status,
    cond_setting: {
      ...buildAlarmConditionSubmitModel(conditionModel.value, model.value.device_source_type),
      notice_group_id_list: model.value.notice_group_id_list,
      notice_limit: model.value.notice_limit,
      valid_time_ranges: model.value.valid_time_ranges,
      is_autogen_workorder: model.value.is_autogen_workorder,
      is_system_auto_recover: model.value.is_system_auto_recover
    }
  };
}

function buildUpdateParams(): Api.Alarm.AlarmRuleUpdateParams {
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

    const message = getTaskConditionValidationMessage(conditionModel.value);
    if (message) {
      window.$message?.warning(message);
      return;
    }

    if (model.value.valid_time_ranges.length === 0) {
      window.$message?.warning($t('alarmRule.selectValidHour'));
      return;
    }

    const { error } = isEdit.value
      ? await fetchUpdateAlarmRule(buildUpdateParams())
      : await fetchCreateAlarmRule(buildSubmitParams());
    if (error) return;

    window.$message?.success(isEdit.value ? $t('common.updateSuccess') : $t('common.addSuccess'));
    closeDrawer();
    emit('submitted');
  } finally {
    endLoading();
  }
}

function createDefaultValidTimeRanges(): Api.Alarm.AlarmRuleValidTimeRange[] {
  return [{ start_at: 0, end_at: 23 }];
}

function normalizeValidTimeRanges(
  ranges?: Api.Alarm.AlarmRuleValidTimeRange[] | null
): Api.Alarm.AlarmRuleValidTimeRange[] {
  if (!ranges?.length) return createDefaultValidTimeRanges();

  return buildRangesFromHours(parseHoursFromRanges(ranges));
}

function buildAlarmConditionSubmitModel(
  modelValue: TaskConditionEditorModel,
  deviceSourceType: Api.Alarm.AlarmRuleDeviceSourceType
): Pick<Api.Alarm.AlarmRuleConditionSetting, 'conds' | 'freq'> {
  return {
    conds: modelValue.conds.map(condition => ({
      logic_operator_type: condition.logic_operator_type,
      device_source_type: deviceSourceType,
      device_source_id: condition.device_source_id ?? undefined,
      sub_conds: condition.sub_conds.map(point => buildAlarmSubCondition(point))
    })),
    freq: normalizeConditionFreq(modelValue.freq) as Api.Alarm.AlarmRuleConditionFreq
  };
}

function buildAlarmSubCondition(point: TaskConditionSubCondEditor): Api.Alarm.AlarmRuleSubCondition {
  const subCondition: Api.Alarm.AlarmRuleSubCondition = {
    device_type_point_id: point.device_type_point_id,
    logic_operator_type: point.logic_operator_type,
    threshold_type: point.threshold_type
  };

  if (isRangeThreshold(point.threshold_type)) {
    subCondition.range_val = {
      min_val: normalizeNumber(point.range_val.min_val.value),
      max_val: normalizeNumber(point.range_val.max_val.value)
    };
  } else {
    subCondition.single_val = buildAlarmSingleValue(point);
  }

  return subCondition;
}

function buildAlarmSingleValue(point: TaskConditionSubCondEditor): Api.Alarm.AlarmRuleConditionSingleValue {
  const dataType = point.data_type as CommonType.DataType;
  const singleValue: Api.Alarm.AlarmRuleConditionSingleValue = {
    data_type: dataType
  };

  if (dataType === 1) {
    singleValue.num_val = normalizePointValue(point.single_val, point.setting);
  } else if (dataType === 2) {
    singleValue.switch_val = normalizePointValue(point.single_val);
  } else if (dataType === 3) {
    singleValue.str_val = normalizePointValue(point.single_val);
  } else {
    singleValue.enum_val = normalizePointValue(point.single_val);
  }

  return singleValue;
}

function normalizePointValue(
  value: TaskRulePointValue,
  setting?: Api.Device.DeviceTypePointSetting | null
): Api.Alarm.AlarmRulePointValueContent {
  const pointValue: Api.Alarm.AlarmRulePointValueContent = {
    value: value.value,
    alias: value.alias,
    unit: value.unit
  };

  if (setting?.num_val?.scale !== undefined) {
    pointValue.scale = setting.num_val.scale;
  }

  return pointValue;
}

function normalizeNumber(value: unknown) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeIdList(value?: Array<CommonType.IdType | null | undefined> | null): CommonType.IdType[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is CommonType.IdType => item !== null && item !== undefined && item !== '');
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
        <div class="alarm-rule-operate-content">
          <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
            <NGrid responsive="screen" item-responsive :x-gap="16">
              <NFormItemGi span="24" :label="$t('alarmRule.name')" path="name">
                <NInput
                  v-model:value="model.name"
                  maxlength="30"
                  show-count
                  :placeholder="$t('alarmRule.namePlaceholder')"
                />
              </NFormItemGi>
              <NFormItemGi span="24 m:12" :label="$t('alarmRule.alarmLevel')" path="alarm_level">
                <NRadioGroup v-model:value="model.alarm_level">
                  <NSpace>
                    <NRadio v-for="item in alarmLevelOptions" :key="item.value" :value="item.value">
                      {{ item.label }}
                    </NRadio>
                  </NSpace>
                </NRadioGroup>
              </NFormItemGi>
              <NFormItemGi span="24 m:12" :label="$t('alarmRule.status')" path="status">
                <NSwitch v-model:value="model.status" :checked-value="1" :unchecked-value="2">
                  <template #checked>{{ $t('alarmRule.enabled') }}</template>
                  <template #unchecked>{{ $t('alarmRule.disabled') }}</template>
                </NSwitch>
              </NFormItemGi>
              <NFormItemGi span="24 m:12" :label="$t('alarmRule.triggerType')" path="trigger_type">
                <NSelect v-model:value="model.trigger_type" :options="triggerTypeOptions" disabled />
              </NFormItemGi>
              <NFormItemGi span="24 m:12" :label="$t('alarmRule.deviceSourceType')" path="device_source_type">
                <NSelect
                  v-model:value="model.device_source_type"
                  :options="deviceSourceTypeOptions"
                  @update:value="handleDeviceSourceTypeChange"
                />
              </NFormItemGi>
              <NFormItemGi span="24" :label="$t('alarmRule.description')" path="desc">
                <NInput
                  v-model:value="model.desc"
                  type="textarea"
                  maxlength="200"
                  show-count
                  :rows="3"
                  :placeholder="$t('alarmRule.descriptionPlaceholder')"
                />
              </NFormItemGi>
            </NGrid>
          </NForm>

          <NDivider class="!my-0" />

          <TaskPointRuleEditor
            v-model:model="conditionModel"
            mode="condition"
            :device-source-type="model.device_source_type"
          />

          <NDivider class="!my-0" />

          <section class="setting-section">
            <SectionHeader :title="$t('alarmRule.noticeSettings')" type="success" />

            <NForm :model="model" label-placement="top" :show-feedback="false">
              <NGrid responsive="screen" item-responsive :x-gap="16" :y-gap="4">
                <NFormItemGi span="24 m:12" :label="$t('alarmRule.noticeGroup')">
                  <RemoteSearchSelect
                    v-model:value="model.notice_group_id_list"
                    :request="fetchNoticeGroupList"
                    :request-params="noticeGroupRequestParams"
                    :search-type="2"
                    :limit="10"
                    :selected-options="selectedNoticeGroups"
                    label-field="name"
                    value-field="id"
                    multiple
                    clearable
                    :placeholder="$t('alarmRule.noticeGroupPlaceholder')"
                  />
                </NFormItemGi>
                <NFormItemGi span="24 m:12" :label="$t('alarmRule.noticeLimit')">
                  <NInputNumber
                    v-model:value="model.notice_limit"
                    :min="0"
                    :precision="0"
                    button-placement="right"
                    class="w-full"
                    :placeholder="$t('alarmRule.noticeLimitPlaceholder')"
                    @update:value="handleNoticeLimitChange"
                  />
                </NFormItemGi>
                <NFormItemGi span="24 m:12" :label="$t('alarmRule.autoGenerateWorkorder')" class="mt-10px">
                  <NSwitch v-model:value="model.is_autogen_workorder">
                    <template #checked>{{ $t('alarmRule.yes') }}</template>
                    <template #unchecked>{{ $t('alarmRule.no') }}</template>
                  </NSwitch>
                </NFormItemGi>
                <NFormItemGi span="24 m:12" :label="$t('alarmRule.systemAutoRecover')" class="mt-10px">
                  <NSwitch v-model:value="model.is_system_auto_recover">
                    <template #checked>{{ $t('alarmRule.yes') }}</template>
                    <template #unchecked>{{ $t('alarmRule.no') }}</template>
                  </NSwitch>
                </NFormItemGi>
              </NGrid>
            </NForm>
          </section>

          <section class="setting-section">
            <AlarmRuleValidHourEditor v-model:model="model.valid_time_ranges" />
          </section>
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
.alarm-rule-operate-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 2px;
}
</style>
