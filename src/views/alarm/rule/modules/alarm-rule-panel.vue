<script setup lang="tsx">
import { computed, ref } from 'vue';
import { NDivider, NTag } from 'naive-ui';
import { StatusTag } from '@sa/materials';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { useAppStore } from '@/store/modules/app';
import { fetchDeleteAlarmRule, fetchGetAlarmRuleList } from '@/service/api/alarm';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import { alarmLevelMap, formatAlarmRuleFreq } from '../../shared';
import AlarmRuleOperateDrawer from './alarm-rule-operate-drawer.vue';
import { buildAlarmRuleListRequest } from './alarm-rule-request';

defineOptions({
  name: 'AlarmRulePanel'
});

interface Props {
  fixedDeviceId?: CommonType.IdType | null;
  fixedDeviceTypeId?: CommonType.IdType | null;
  searchParams?: Api.Alarm.AlarmRuleSearchParams | null;
}

interface Emits {
  (e: 'update:searchParams', value: Api.Alarm.AlarmRuleSearchParams): void;
}

const props = withDefaults(defineProps<Props>(), {
  fixedDeviceId: null,
  fixedDeviceTypeId: null,
  searchParams: null
});
const emit = defineEmits<Emits>();

const triggerTypeMap: Record<Api.Alarm.AlarmRuleTriggerType, string> = {
  1: '设备点位变化'
};

const deviceSourceTypeMap: Record<Api.Alarm.AlarmRuleDeviceSourceType, string> = {
  1: '设备',
  2: '设备类型'
};

const appStore = useAppStore();

const requestParams = ref<Api.Alarm.AlarmRuleSearchParams>(createDefaultSearchParams());

function createDefaultSearchParams(): Api.Alarm.AlarmRuleSearchParams {
  return {
    pageNum: 1,
    pageSize: 10,
    name: null,
    alarm_level: null
  };
}

const { columns, columnChecks, data, extraData, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () =>
      fetchGetAlarmRuleList(buildAlarmRuleListRequest(requestParams.value, props.fixedDeviceTypeId, props.fixedDeviceId)),
    transform: response => defaultTransform<Api.Alarm.AlarmRule>(response),
    onPaginationParamsChange: params => {
      requestParams.value.pageNum = params.page;
      requestParams.value.pageSize = params.pageSize;
      emit('update:searchParams', { ...requestParams.value });
    },
    columns: (): NaiveUI.TableColumn<Api.Alarm.AlarmRule>[] => [
      {
        type: 'selection',
        align: 'center',
        width: 48
      },
      {
        key: 'index',
        title: $t('common.index'),
        align: 'center',
        width: 64,
        render: (_, index) => index + 1
      },
      {
        key: 'name',
        title: '报警规则名称',
        align: 'center',
        minWidth: 180,
        ellipsis: { tooltip: true }
      },
      {
        key: 'alarm_level',
        title: '报警等级',
        align: 'center',
        minWidth: 110,
        render: row => renderAlarmLevel(row.alarm_level)
      },
      {
        key: 'trigger_type',
        title: '触发类型',
        align: 'center',
        minWidth: 140,
        render: row => triggerTypeMap[row.trigger_type] ?? '-'
      },
      {
        key: 'device_source_type',
        title: '设备源类型',
        align: 'center',
        minWidth: 120,
        render: row => renderDeviceSourceType(row.device_source_type)
      },
      {
        key: 'device_source',
        title: '设备源',
        align: 'center',
        minWidth: 180,
        ellipsis: { tooltip: true },
        render: row => getDeviceSourceNames(row)
      },
      {
        key: 'trigger_condition',
        title: '触发条件',
        align: 'center',
        minWidth: 160,
        ellipsis: { tooltip: true },
        render: row => formatAlarmRuleFreq(row.cond_setting?.freq)
      },
      {
        key: 'notice_group',
        title: '通知组',
        align: 'center',
        minWidth: 160,
        ellipsis: { tooltip: true },
        render: row => formatNoticeGroups(row)
      },
      {
        key: 'status',
        title: '状态',
        align: 'center',
        minWidth: 100,
        render: row => <StatusTag value={row.status} />
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 130,
        fixed: 'right',
        render: row => {
          const buttons = [
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => edit(row.id)}
            />,
            <ButtonIcon
              text
              type="error"
              icon="material-symbols:delete-outline"
              tooltipContent={$t('common.delete')}
              popconfirmContent={$t('common.confirmDelete')}
              onPositiveClick={() => handleDelete(row.id)}
            />
          ];

          return (
            <div class="flex-center gap-8px">
              {buttons.map((btn, index) => (
                <>
                  {index !== 0 && <NDivider vertical />}
                  {btn}
                </>
              ))}
            </div>
          );
        }
      }
    ]
  });

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'id', getData);

const alarmRuleExtra = computed<Api.Alarm.AlarmRuleListExtra>(() => {
  const raw = extraData.value as Partial<Api.Alarm.AlarmRuleListExtra> | null;

  return {
    device_map: raw?.device_map ?? {},
    device_type_map: raw?.device_type_map ?? {},
    device_type_point_map: raw?.device_type_point_map ?? {},
    notice_group_map: raw?.notice_group_map ?? {}
  };
});

function renderAlarmLevel(level: Api.Alarm.AlarmLevel) {
  const config = alarmLevelMap[level];

  return config ? <NTag type={config.type}>{config.label}</NTag> : '-';
}

function renderDeviceSourceType(type: Api.Alarm.AlarmRuleDeviceSourceType) {
  const label = deviceSourceTypeMap[type];

  return label ? <NTag type="info">{label}</NTag> : '-';
}

function getConditionList(row: Api.Alarm.AlarmRule) {
  return row.cond_setting?.conds ?? [];
}

function getDeviceSourceNames(row: Api.Alarm.AlarmRule) {
  const names = getConditionList(row)
    .map(condition => getDeviceSourceName(condition.device_source_type ?? row.device_source_type, condition.device_source_id))
    .filter(item => item !== '-');
  const uniqueNames = Array.from(new Set(names));

  return uniqueNames.length ? uniqueNames.join('、') : '-';
}

function getDeviceSourceName(
  sourceType: Api.Alarm.AlarmRuleDeviceSourceType | null | undefined,
  sourceId: CommonType.IdType | null | undefined
) {
  if (sourceId === null || sourceId === undefined) return '-';

  if (sourceType === 1) {
    return alarmRuleExtra.value.device_map[String(sourceId)]?.name ?? String(sourceId);
  }

  if (sourceType === 2) {
    return alarmRuleExtra.value.device_type_map?.[String(sourceId)]?.name ?? String(sourceId);
  }

  return String(sourceId);
}

function formatNoticeGroups(row: Api.Alarm.AlarmRule) {
  const names = (row.cond_setting?.notice_group_id_list ?? [])
    .map(id => alarmRuleExtra.value.notice_group_map?.[String(id)]?.name ?? String(id))
    .filter(Boolean);
  const uniqueNames = Array.from(new Set(names));

  return uniqueNames.length ? uniqueNames.join('、') : '-';
}

function handleSearch() {
  checkedRowKeys.value = [];
  requestParams.value = {
    ...createDefaultSearchParams(),
    ...props.searchParams
  };
  getDataByPage(1);
}

defineExpose({ search: handleSearch });

async function handleDelete(id: CommonType.IdType) {
  const { error } = await fetchDeleteAlarmRule({ id_list: [id] });
  if (error) return;

  checkedRowKeys.value = checkedRowKeys.value.filter(item => item !== id);
  await onDeleted();
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return;

  const { error } = await fetchDeleteAlarmRule({ id_list: checkedRowKeys.value });
  if (error) return;

  await onBatchDeleted();
}

function edit(id: CommonType.IdType) {
  handleEdit(id);
}
</script>

<template>
  <div class="h-full min-h-0 flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto">
    <NCard title="报警规则" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
          :show-add="true"
          :disabled-delete="checkedRowKeys.length === 0"
          :show-delete="true"
          :show-export="false"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </template>
      <DataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        :flex-height="!appStore.isMobile"
        :scroll-x="scrollX"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <AlarmRuleOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        :extra-data="alarmRuleExtra"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
