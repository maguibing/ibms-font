<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import type { SelectOption } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { fetchDevicePointCmd, fetchGetLogicPoint, fetchGetPhysicalPoint } from '@/service/api/device';
import EnumTag from '@/components/custom/enum-tag.vue';
import { displayValue } from '@/utils/common-methods';
import { $t } from '@/locales';

defineOptions({
  name: 'DevicePointCommandModal'
});

type PointItem = Pick<Api.Device.PhysicalPoint, 'id' | 'name' | 'key'>;
type LogicPointItem = PointItem & Pick<Api.Device.LogicPoint, 'data_type'>;
type PhysicalPointItem = PointItem & Pick<Api.Device.PhysicalPoint, 'data_type'>;

type CommandContext = {
  currentValue?: Api.Device.PhysicalPointCurrentValue | null;
} & (
  | { source: 'logic'; logicPoint: LogicPointItem; physicalPoint: PointItem }
  | { source: 'physical'; logicPoint?: PointItem; physicalPoint: PhysicalPointItem }
);

type CommandOption = SelectOption & {
  alias: string;
};

type CommandDetail = {
  point: PointItem;
  logicPointKey: string;
  physicalPointKey: string;
  dataType: CommonType.DataType;
  scale?: number;
  unit?: string;
  options: CommandOption[];
  currentValue?: Api.Device.PhysicalPointCurrentValue | null;
};

const visible = shallowRef(false);
const detailLoading = shallowRef(false);
const source = shallowRef<CommandContext['source']>('logic');
const detail = shallowRef<CommandDetail | null>(null);
const commandValue = shallowRef<string | number | null>(null);
const { loading: submitLoading, startLoading, endLoading } = useLoading();

const isLogicPoint = computed(() => source.value === 'logic');
const pointLabel = computed(() =>
  isLogicPoint.value ? $t('devicePointManage.logicPoints') : $t('devicePointManage.physicalPoints')
);
const dataType = computed(() => detail.value?.dataType);
const commandUnsupported = computed(() => !isLogicPoint.value && (dataType.value === 2 || dataType.value === 4));
const scale = computed(() => detail.value?.scale);
const precision = computed(() => (scale.value ? scale.value - 1 : undefined));
const unit = computed(() => detail.value?.unit ?? detail.value?.currentValue?.num_val?.unit ?? '');
const numberCommandValue = computed<number | null>({
  get: () => (typeof commandValue.value === 'number' ? commandValue.value : null),
  set: value => {
    commandValue.value = value;
  }
});
const textCommandValue = computed<string>({
  get: () => (typeof commandValue.value === 'string' ? commandValue.value : ''),
  set: value => {
    commandValue.value = value;
  }
});
const commandOptions = computed(() => detail.value?.options ?? []);

function getCommandOptions(pointDataType: CommonType.DataType, setting?: Api.Device.DeviceTypePointSetting) {
  if (pointDataType === 2) {
    const trueValue = setting?.switch_val?.true_val;
    const falseValue = setting?.switch_val?.false_val;

    return [
      {
        label: trueValue?.alias || $t('devicePointManage.on'),
        value: trueValue?.value ?? '1',
        alias: trueValue?.alias || $t('devicePointManage.on')
      },
      {
        label: falseValue?.alias || $t('devicePointManage.off'),
        value: falseValue?.value ?? '0',
        alias: falseValue?.alias || $t('devicePointManage.off')
      }
    ];
  }

  if (pointDataType === 4) {
    return (setting?.enum_val?.enum_list ?? []).map(item => ({
      label: item.alias || item.value,
      value: item.value,
      alias: item.alias
    }));
  }

  return [];
}

function closeModal() {
  visible.value = false;
}

function getLatestCommandValue(currentValue?: Api.Device.PhysicalPointCurrentValue | null) {
  if (!currentValue?.ts) return null;

  if (dataType.value === 1) return currentValue.num_val?.value ?? null;
  if (!isLogicPoint.value) return dataType.value === 3 ? (currentValue.str_val?.value ?? null) : null;

  if (dataType.value === 2) return String(currentValue.switch_val?.value ?? '') || null;
  if (dataType.value === 3) return currentValue.str_val?.value ?? null;
  if (dataType.value === 4) return String(currentValue.enum_val?.value ?? '') || null;

  return null;
}

async function getCommandDetail(context: CommandContext): Promise<CommandDetail | null> {
  if (context.source === 'logic') {
    const { data, error } = await fetchGetLogicPoint({
      id: context.logicPoint.id,
      options: [{ key: 4 }]
    });
    if (error || !data) return null;

    const deviceTypePoint = data.device_type_point_map?.[String(data.logic_point.device_type_point_id)];
    const resolvedDataType = deviceTypePoint?.data_type ?? data.logic_point.data_type;
    if (!resolvedDataType) return null;

    return {
      point: data.logic_point,
      logicPointKey: data.logic_point.key,
      physicalPointKey: context.physicalPoint.key,
      dataType: resolvedDataType,
      scale: deviceTypePoint?.setting.num_val?.scale,
      unit: deviceTypePoint?.setting.num_val?.unit,
      options: getCommandOptions(resolvedDataType, deviceTypePoint?.setting),
      currentValue: context.currentValue
    };
  }

  const { data, error } = await fetchGetPhysicalPoint({ id: context.physicalPoint.id });
  if (error || !data) return null;

  return {
    point: data.physical_point,
    logicPointKey: context.logicPoint?.key ?? '',
    physicalPointKey: data.physical_point.key,
    dataType: data.physical_point.data_type,
    scale: data.physical_point.protocol?.scale,
    options: [],
    currentValue: context.currentValue
  };
}

async function open(context: CommandContext) {
  source.value = context.source;
  commandValue.value = null;
  detail.value = null;
  visible.value = true;
  detailLoading.value = true;

  detail.value = await getCommandDetail(context).finally(() => {
    detailLoading.value = false;
  });
  commandValue.value = getLatestCommandValue(detail.value?.currentValue);
}

function validateCommandValue() {
  if (commandValue.value === null || commandValue.value === undefined || commandValue.value === '') {
    window.$message?.warning(
      dataType.value === 1 || dataType.value === 3
        ? $t('devicePointManage.commandValueInput')
        : $t('devicePointManage.commandValueSelect')
    );
    return false;
  }

  return true;
}

async function handleSubmit() {
  if (submitLoading.value || !detail.value || !dataType.value || commandUnsupported.value) return;
  if (!validateCommandValue()) return;

  const selectedOption = commandOptions.value.find(item => item.value === commandValue.value);
  const pointValue: Api.Device.DevicePointCommandValue = {
    data_type: dataType.value
  };

  if (dataType.value === 1) {
    pointValue.num_val = {
      value: Number(commandValue.value),
      scale: scale.value,
      unit: unit.value || undefined
    };
  } else if (dataType.value === 2) {
    pointValue.switch_val = {
      value: String(commandValue.value),
      alias: selectedOption?.alias ?? ''
    };
  } else if (dataType.value === 3) {
    pointValue.str_val = {
      value: String(commandValue.value)
    };
  } else {
    pointValue.enum_val = {
      value: String(commandValue.value),
      alias: selectedOption?.alias ?? ''
    };
  }

  startLoading();
  const { error } = await fetchDevicePointCmd({
    cmd_list: [
      {
        logic_point_key: detail.value.logicPointKey,
        physical_point_key: detail.value.physicalPointKey,
        point_val: pointValue
      }
    ]
  }).finally(endLoading);

  if (error) return;

  window.$message?.success($t('devicePointManage.commandSuccess'));
  closeModal();
}

defineExpose({
  open
});
</script>

<template>
  <NModal v-model:show="visible" preset="card" :title="$t('devicePointManage.commandTitle')" class="w-520px max-w-90%">
    <NSpin :show="detailLoading">
      <NForm label-placement="top" label-width="110">
        <NFormItem :label="pointLabel">
          <NInput :value="displayValue(detail?.point.name)" disabled />
        </NFormItem>
        <NFormItem :label="`${pointLabel}${$t('devicePointManage.identifierSuffix')}`">
          <NInput :value="displayValue(detail?.point.key)" disabled />
        </NFormItem>
        <NFormItem :label="$t('devicePointManage.dataType')">
          <EnumTag :value="dataType" />
        </NFormItem>
        <NFormItem :label="$t('devicePointManage.commandValue')" required>
          <NInputGroup v-if="dataType === 1">
            <NInputNumber
              v-model:value="numberCommandValue"
              :precision="precision"
              button-placement="right"
              class="w-full"
              :placeholder="$t('devicePointManage.commandValueInput')"
            />
            <NInputGroupLabel v-if="unit">{{ unit }}</NInputGroupLabel>
          </NInputGroup>
          <NSelect
            v-else-if="dataType === 2 || dataType === 4"
            v-model:value="commandValue"
            :options="commandOptions"
            :disabled="commandUnsupported || commandOptions.length === 0"
            :placeholder="
              commandUnsupported
                ? $t('devicePointManage.commandUnsupported')
                : $t('devicePointManage.commandValueSelect')
            "
          />
          <NInput
            v-else-if="dataType === 3"
            v-model:value="textCommandValue"
            maxlength="100"
            :placeholder="$t('devicePointManage.commandValueInput')"
          />
          <NInput v-else disabled :placeholder="$t('devicePointManage.commandUnsupportedType')" />
        </NFormItem>
      </NForm>
    </NSpin>

    <template #footer>
      <NSpace :size="16" justify="end">
        <NButton @click="closeModal">{{ $t('common.cancel') }}</NButton>
        <NButton
          type="primary"
          :loading="submitLoading"
          :disabled="detailLoading || !detail || !dataType || commandUnsupported"
          @click="handleSubmit"
        >
          {{ $t('devicePointManage.confirmCommand') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
