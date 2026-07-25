<script setup lang="ts">
import { computed } from 'vue';
import type { TagProps } from 'naive-ui';
import { $t } from '@/locales';
import { formatUnixDateTime } from '@/utils/common-methods';

defineOptions({
  name: 'AlarmRecordViewDrawer'
});

interface Props {
  rowData?: Api.Alarm.AlarmRecord | null;
  extraData: Api.Alarm.AlarmRecordListExtra;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const dealStatusMap: Record<Api.Alarm.AlarmRecordDealStatus, { label: string; type: NonNullable<TagProps['type']> }> = {
  1: { label: '待处理', type: 'error' },
  2: { label: '已确认', type: 'primary' },
  3: { label: '已解除', type: 'success' }
};

const operateStatusMap: Record<
  Api.Alarm.AlarmRecordDealStatus,
  { label: string; type: NonNullable<TagProps['type']> }
> = {
  1: { label: '待处理', type: 'error' },
  2: { label: '确认', type: 'primary' },
  3: { label: '解除', type: 'success' }
};

const alarmLevelMap: Record<Api.Alarm.AlarmLevel, { label: string; type: NonNullable<TagProps['type']> }> = {
  1: { label: '普通', type: 'info' },
  2: { label: '重要', type: 'warning' },
  3: { label: '紧急', type: 'error' }
};

const alarmRule = computed(() => {
  const alarmRuleId = props.rowData?.alarm_rule_id;
  if (!alarmRuleId) return null;

  return props.extraData.alarm_rule_map[String(alarmRuleId)] ?? null;
});

const alarmLevel = computed(() => (alarmRule.value ? alarmLevelMap[alarmRule.value.alarm_level] : null));

const dealStatus = computed(() => {
  const status = props.rowData?.status;
  if (!status) return null;

  return dealStatusMap[status] ?? null;
});

const deviceName = computed(() => {
  const deviceId = props.rowData?.device_id;
  if (!deviceId) return '-';

  return props.extraData.device_map[String(deviceId)]?.name ?? '-';
});

const alarmPointList = computed(() => props.rowData?.detail?.alarm_point_list ?? []);

const operateLogList = computed(() =>
  [...(props.rowData?.detail?.operate_log_list ?? [])].sort((a, b) => a.operate_at - b.operate_at)
);

function getLogicPointName(logicPointId: CommonType.IdType) {
  return props.extraData.logic_point_map[String(logicPointId)]?.name ?? '-';
}

function getUserName(userId?: CommonType.IdType) {
  if (!userId) return '系统';

  return props.extraData.base_user_map[String(userId)]?.username ?? '未知操作人';
}

function closeDrawer() {
  visible.value = false;
}
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="820" class="max-w-90%">
    <NDrawerContent title="报警记录详情" :native-scrollbar="false" closable>
      <div v-if="rowData" class="flex flex-col gap-16px">
        <section class="flex flex-col gap-10px">
          <div class="border-l-3 border-l-primary pl-8px text-15px text-[var(--n-text-color-1)] font-600 leading-18px">
            基本信息
          </div>
          <NDescriptions label-placement="left" bordered size="small" :column="2" label-class="w-90px">
            <NDescriptionsItem label="报警规则">{{ alarmRule?.name ?? '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="报警设备">{{ deviceName }}</NDescriptionsItem>
            <NDescriptionsItem label="报警等级">
              <NTag v-if="alarmLevel" :type="alarmLevel.type">{{ alarmLevel.label }}</NTag>
              <span v-else>-</span>
            </NDescriptionsItem>
            <NDescriptionsItem label="状态">
              <NTag v-if="dealStatus" :type="dealStatus.type">{{ dealStatus.label }}</NTag>
              <span v-else>-</span>
            </NDescriptionsItem>
            <NDescriptionsItem label="报警时间" :span="2">{{ formatUnixDateTime(rowData.alarm_at) }}</NDescriptionsItem>
          </NDescriptions>
        </section>

        <section class="flex flex-col gap-10px">
          <div class="border-l-3 border-l-primary pl-8px text-15px text-[var(--n-text-color-1)] font-600 leading-18px">
            报警内容
          </div>
          <div v-if="alarmPointList.length" class="step-list">
            <div v-for="(item, index) in alarmPointList" :key="`${item.logic_point_id}-${index}`" class="step-item">
              <div class="step-axis">
                <div class="step-index">{{ index + 1 }}</div>
              </div>
              <div class="step-panel alarm-step-panel">
                <div class="step-panel__header">
                  <div class="step-title">{{ getLogicPointName(item.logic_point_id) }}</div>
                  <NTag size="small" type="warning">报警内容</NTag>
                </div>
                <div class="step-content">{{ item.content || '-' }}</div>
              </div>
            </div>
          </div>
          <NEmpty v-else description="暂无报警内容" />
        </section>

        <section class="flex flex-col gap-10px">
          <div class="border-l-3 border-l-primary pl-8px text-15px text-[var(--n-text-color-1)] font-600 leading-18px">
            操作记录
          </div>
          <div v-if="operateLogList.length" class="step-list">
            <div
              v-for="(item, index) in operateLogList"
              :key="`${item.operator_id}-${item.operate_at}-${index}`"
              class="step-item"
            >
              <div class="step-axis">
                <div class="step-index">{{ index + 1 }}</div>
              </div>

              <div class="step-panel">
                <div class="step-panel__header">
                  <NSpace align="center" :size="8">
                    <span class="step-title">第 {{ index + 1 }} 步</span>
                    <NTag v-if="operateStatusMap[item.status]" :type="operateStatusMap[item.status].type" size="small">
                      {{ operateStatusMap[item.status].label }}
                    </NTag>
                  </NSpace>
                  <span class="step-time">{{ formatUnixDateTime(item.operate_at) }}</span>
                </div>
                <div class="operator-line">
                  <SvgIcon icon="material-symbols:person-outline-rounded" class="text-16px" />
                  <span>操作人：{{ getUserName(item.operator_id) }}</span>
                </div>
              </div>
            </div>
          </div>
          <NEmpty v-else description="暂无操作记录" />
        </section>
      </div>
      <NEmpty v-else description="暂无报警详情" />

      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.close') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.step-list {
  display: flex;
  flex-direction: column;
}

.step-item {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  column-gap: 12px;
  padding-bottom: 12px;
}

.step-item:last-child {
  padding-bottom: 0;
}

.step-axis {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-axis::before,
.step-axis::after {
  position: absolute;
  left: 50%;
  width: 1px;
  background: linear-gradient(180deg, rgba(var(--primary-color), 0.22), rgba(var(--primary-color), 0.06));
  content: '';
  transform: translateX(-50%);
}

.step-item:not(:first-child) .step-axis::before {
  top: -12px;
  bottom: 50%;
}

.step-item:not(:last-child) .step-axis::after {
  top: 50%;
  bottom: -12px;
}

.step-index {
  position: relative;
  z-index: 1;
  width: 32px;
  height: 32px;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(var(--primary-color), 0.1);
  box-shadow: 0 0 0 5px var(--n-color);
  color: rgb(var(--primary-color));
  font-size: 13px;
  font-weight: 700;
}

.step-panel {
  position: relative;
  min-width: 0;
  padding: 12px 14px;
  overflow: hidden;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(var(--primary-color), 0.055), transparent 46%), var(--n-color);
  box-shadow:
    inset 0 0 0 1px rgba(148, 163, 184, 0.14),
    0 8px 20px rgba(15, 23, 42, 0.045);
}

.step-panel::before {
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 0;
  width: 3px;
  border-radius: 0 999px 999px 0;
  background: rgba(var(--primary-color), 0.62);
  content: '';
}

.alarm-step-panel {
  background: linear-gradient(90deg, rgba(var(--primary-color), 0.08), transparent 48%), var(--n-color);
}

.step-panel__header {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.step-title {
  min-width: 0;
  overflow: hidden;
  color: var(--n-text-color-1);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.step-time {
  flex: none;
  color: var(--n-text-color-3);
  font-size: 13px;
  line-height: 20px;
}

.step-content,
.operator-line {
  margin-top: 8px;
  color: var(--n-text-color-2);
  font-size: 13px;
  line-height: 22px;
}

.step-content {
  word-break: break-word;
}

.operator-line {
  display: flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 640px) {
  .step-item {
    grid-template-columns: 34px minmax(0, 1fr);
    column-gap: 8px;
  }

  .step-index {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .step-panel__header {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .step-time {
    flex: initial;
  }
}
</style>
