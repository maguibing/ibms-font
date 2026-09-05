<script setup lang="ts">
import { computed } from 'vue';
import { $t } from '@/locales';
import { DATA_TYPE_OPTIONS, PRECISION_OPTIONS, UNIT_GROUPS } from '@/constants/business';
import { VirtualPointComputeMode, createDefaultVirtualPointPointSetting } from '../virtual-point';

defineOptions({ name: 'VirtualPointSettingPanel' });

const model = defineModel<Api.Device.DeviceTypePointSetting>({ required: true });
const props = defineProps<{ computeMode: VirtualPointComputeMode }>();

// Formula calculation and statistic count always use numeric data. Threshold assignment and segment mapping can select an output type.
const showDataType = computed(() =>
  [VirtualPointComputeMode.Threshold, VirtualPointComputeMode.SegmentMapping].includes(props.computeMode)
);

/** Rebuild the corresponding setting structure when the data type changes to avoid stale fields. */
function handleDataTypeChange(value: CommonType.DataType) {
  model.value = createDefaultVirtualPointPointSetting(value);
}

/** Default row for a new enum mapping item. */
function createEnumItem(): Api.System.DeviceTypeTemplatePointValueItem {
  return { value: '', alias: '' };
}
</script>

<template>
  <div class="rounded-8px border border-#e2e8f0 border-solid p-16px dark:border-#2f3338">
    <div class="mb-14px text-14px font-600">{{ $t('virtualPoint.setting.title') }}</div>
    <NFormItem v-if="showDataType" :label="$t('virtualPoint.setting.dataType')">
      <NSelect
        :value="model.data_type"
        :options="DATA_TYPE_OPTIONS"
        :placeholder="$t('virtualPoint.setting.dataTypePlaceholder')"
        @update:value="handleDataTypeChange"
      />
    </NFormItem>

    <div v-if="model.data_type === 1" class="grid grid-cols-2 gap-x-16px lt-sm:grid-cols-1">
      <NFormItem :label="$t('virtualPoint.setting.precision')" :show-feedback="false">
        <NSelect
          v-model:value="model.num_val!.scale"
          :options="PRECISION_OPTIONS"
          :placeholder="$t('virtualPoint.setting.precisionPlaceholder')"
        />
      </NFormItem>
      <NFormItem :label="$t('virtualPoint.setting.unit')" :show-feedback="false">
        <NSelect
          v-model:value="model.num_val!.unit"
          clearable
          filterable
          tag
          :options="UNIT_GROUPS"
          :placeholder="$t('virtualPoint.setting.unitPlaceholder')"
        />
      </NFormItem>
    </div>

    <div v-else-if="model.data_type === 2" class="grid grid-cols-2 gap-x-16px lt-sm:grid-cols-1">
      <NFormItem :label="$t('virtualPoint.setting.trueAlias')" :show-feedback="false">
        <NInputGroup>
          <NInputGroupLabel>true</NInputGroupLabel>
          <NInput
            v-model:value="model.switch_val!.true_val!.alias"
            maxlength="30"
            :placeholder="$t('virtualPoint.setting.trueAliasPlaceholder')"
          />
        </NInputGroup>
      </NFormItem>
      <NFormItem :label="$t('virtualPoint.setting.falseAlias')" :show-feedback="false">
        <NInputGroup>
          <NInputGroupLabel>false</NInputGroupLabel>
          <NInput
            v-model:value="model.switch_val!.false_val!.alias"
            maxlength="30"
            :placeholder="$t('virtualPoint.setting.falseAliasPlaceholder')"
          />
        </NInputGroup>
      </NFormItem>
    </div>

    <NFormItem
      v-else-if="model.data_type === 4"
      :label="$t('virtualPoint.setting.enumMapping')"
      :show-feedback="false"
      class="!mb-0"
    >
      <NDynamicInput v-model:value="model.enum_val!.enum_list" :on-create="createEnumItem">
        <template #default="{ index }">
          <div class="w-full grid grid-cols-2 gap-12px">
            <NInput
              v-model:value="model.enum_val!.enum_list![index].value"
              maxlength="30"
              :placeholder="$t('virtualPoint.setting.enumValuePlaceholder')"
            />
            <NInput
              v-model:value="model.enum_val!.enum_list![index].alias"
              maxlength="30"
              :placeholder="$t('virtualPoint.setting.mappingNamePlaceholder')"
            />
          </div>
        </template>
      </NDynamicInput>
    </NFormItem>
  </div>
</template>

<style scoped></style>
