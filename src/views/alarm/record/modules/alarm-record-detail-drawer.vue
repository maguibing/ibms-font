<script setup lang="ts">
import { computed } from 'vue';
import type { TagProps } from 'naive-ui';
import { formatDateTime } from '@sa/utils';
import { $t } from '@/locales';

defineOptions({
  name: 'AlarmRecordDetailDrawer'
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
  2: { label: '已确认', type: 'warning' },
  3: { label: '已解除', type: 'success' }
};

const operateStatusMap: Record<
  Api.Alarm.AlarmRecordDealStatus,
  { label: string; type: NonNullable<TagProps['type']> }
> = {
  1: { label: '待处理', type: 'error' },
  2: { label: '确认', type: 'warning' },
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

const operateLogList = computed(() => props.rowData?.detail?.operate_log_list ?? []);

function formatTimestamp(timestamp?: number) {
  return timestamp ? formatDateTime(timestamp * 1000) : '-';
}

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
  <NDrawer v-model:show="visible" display-directive="show" :width="760" class="max-w-90%">
    <NDrawerContent title="报警详情" :native-scrollbar="false" closable>
      <div v-if="rowData" class="flex-col gap-18px">
        <div>
          <div class="mb-10px text-15px font-600">基本信息</div>
          <NDescriptions label-placement="left" bordered size="small" :column="2">
            <NDescriptionsItem label="报警等级">
              <NTag v-if="alarmLevel" :type="alarmLevel.type">{{ alarmLevel.label }}</NTag>
              <span v-else>-</span>
            </NDescriptionsItem>
            <NDescriptionsItem label="报警规则">{{ alarmRule?.name ?? '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="报警设备">{{ deviceName }}</NDescriptionsItem>
            <NDescriptionsItem label="报警时间">{{ formatTimestamp(rowData.alarm_at) }}</NDescriptionsItem>
            <NDescriptionsItem label="状态">
              <NTag v-if="dealStatus" :type="dealStatus.type">{{ dealStatus.label }}</NTag>
              <span v-else>-</span>
            </NDescriptionsItem>
          </NDescriptions>
        </div>

        <div>
          <div class="mb-10px text-15px font-600">报警内容</div>
          <NDescriptions v-if="alarmPointList.length" label-placement="left" bordered size="small" :column="1">
            <NDescriptionsItem
              v-for="(item, index) in alarmPointList"
              :key="`${item.logic_point_id}-${index}`"
              :label="getLogicPointName(item.logic_point_id)"
            >
              {{ item.content || '-' }}
            </NDescriptionsItem>
          </NDescriptions>
          <NEmpty v-else description="暂无报警内容" />
        </div>

        <div>
          <div class="mb-10px text-15px font-600">操作记录</div>
          <div v-if="operateLogList.length" class="flex-col gap-8px">
            <div
              v-for="(item, index) in operateLogList"
              :key="`${item.operator_id}-${item.operate_at}-${index}`"
              class="rounded-4px bg-[rgb(var(--base-color))] px-12px py-8px"
            >
              <NSpace align="center" :size="10">
                <span>{{ getUserName(item.operator_id) }}</span>
                <NTag v-if="operateStatusMap[item.status]" :type="operateStatusMap[item.status].type" size="small">
                  {{ operateStatusMap[item.status].label }}
                </NTag>
                <span class="text-13px text-gray-500">{{ formatTimestamp(item.operate_at) }}</span>
              </NSpace>
            </div>
          </div>
          <NEmpty v-else description="暂无操作记录" />
        </div>
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

<style scoped></style>
