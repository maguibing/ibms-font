<script setup lang="ts">
import { computed } from 'vue';
import type { SelectOption } from 'naive-ui';
import { DATA_TYPE_OPTIONS, ENERGY_TYPE_OPTIONS, PRECISION_OPTIONS, UNIT_GROUPS } from '@/constants/device-point';
import { $t } from '@/locales';
import type { PointOperateEnumItem, PointOperateModel } from './use-point-operate-form';

defineOptions({
  name: 'PointOperateFields'
});

interface Props {
  isNumberType: boolean;
  isSwitchType: boolean;
  isTextType: boolean;
  isEnumType: boolean;
  switchPresetOptions: SelectOption[];
  enumSourceDataTypeOptions: SelectOption[];
  trueMappingLabel: string;
  falseMappingLabel: string;
  createEnumItem: () => PointOperateEnumItem;
}

const props = defineProps<Props>();

const model = defineModel<PointOperateModel>('model', {
  required: true
});

const dataTypeLabelKeys: Record<number, App.I18n.I18nKey> = {
  1: 'dict.data_type.number',
  2: 'dict.data_type.switch',
  3: 'dict.data_type.text',
  4: 'dict.data_type.enum'
};

const precisionLabelKeys: Record<number, App.I18n.I18nKey> = {
  1: 'page.common.pointForm.options.precisionNone',
  2: 'page.common.pointForm.options.precision1',
  3: 'page.common.pointForm.options.precision2',
  4: 'page.common.pointForm.options.precision3'
};

const energyTypeLabelKeys: Record<number, App.I18n.I18nKey> = {
  0: 'page.common.pointForm.options.energyNone',
  1: 'page.common.pointForm.options.energyElectricity',
  2: 'page.common.pointForm.options.energyWater',
  3: 'page.common.pointForm.options.energyGas',
  4: 'page.common.pointForm.options.energyCooling',
  5: 'page.common.pointForm.options.energyHeating',
  6: 'page.common.pointForm.options.energyRuntime'
};

function translateOptions(options: SelectOption[], labelKeys: Record<number, App.I18n.I18nKey>) {
  return options.map(option => ({
    ...option,
    label: $t(labelKeys[Number(option.value)])
  }));
}

const dataTypeOptions = computed(() => translateOptions(DATA_TYPE_OPTIONS, dataTypeLabelKeys));
const precisionOptions = computed(() => translateOptions(PRECISION_OPTIONS, precisionLabelKeys));
const energyTypeOptions = computed(() => translateOptions(ENERGY_TYPE_OPTIONS, energyTypeLabelKeys));
</script>

<template>
  <NFormItem :label="$t('page.common.pointForm.name')" path="name">
    <NInput
      v-model:value="model.name"
      maxlength="30"
      show-count
      :placeholder="$t('page.common.pointForm.form.name.required')"
    />
  </NFormItem>
  <NFormItem :label="$t('page.common.pointForm.key')" path="key">
    <NInput
      v-model:value="model.key"
      maxlength="30"
      show-count
      :placeholder="$t('page.common.pointForm.form.key.required')"
    />
  </NFormItem>
  <NFormItem :label="$t('page.common.pointForm.dataType')" path="data_type">
    <NSelect
      v-model:value="model.data_type"
      :options="dataTypeOptions"
      :placeholder="$t('page.common.pointForm.form.dataType.required')"
    />
  </NFormItem>

  <template v-if="props.isNumberType">
    <NFormItem :label="$t('page.common.pointForm.unit')" path="unit">
      <NSelect
        v-model:value="model.unit"
        clearable
        filterable
        tag
        :options="UNIT_GROUPS"
        :placeholder="$t('page.common.pointForm.form.unit.required')"
      />
    </NFormItem>
    <NFormItem :label="$t('page.common.pointForm.defaultValue')" path="default_number">
      <NInputNumber v-model:value="model.default_number" button-placement="right" />
    </NFormItem>
    <NFormItem :label="$t('page.common.pointForm.scale')" path="scale">
      <NSelect
        v-model:value="model.scale"
        :options="precisionOptions"
        :placeholder="$t('page.common.pointForm.form.scale.required')"
      />
    </NFormItem>
    <NFormItem :label="$t('page.common.pointForm.energyType')" path="energy_type">
      <NSelect
        v-model:value="model.energy_type"
        :options="energyTypeOptions"
        :placeholder="$t('page.common.pointForm.form.energyType.required')"
      />
    </NFormItem>
  </template>

  <template v-if="props.isSwitchType">
    <NFormItem :label="$t('page.common.pointForm.sourceDataType')" path="switch_preset">
      <NSelect
        v-model:value="model.switch_preset"
        :options="props.switchPresetOptions"
        :placeholder="$t('page.common.pointForm.form.sourceDataType.required')"
      />
    </NFormItem>
    <NFormItem :label="props.trueMappingLabel" path="true_alias">
      <NInput
        v-model:value="model.true_alias"
        maxlength="30"
        show-count
        :placeholder="$t('page.common.pointForm.form.mappingName.required')"
      />
    </NFormItem>
    <NFormItem :label="props.falseMappingLabel" path="false_alias">
      <NInput
        v-model:value="model.false_alias"
        maxlength="30"
        show-count
        :placeholder="$t('page.common.pointForm.form.mappingName.required')"
      />
    </NFormItem>
  </template>

  <template v-if="props.isTextType">
    <NFormItem :label="$t('page.common.pointForm.defaultValue')" path="default_text">
      <NInput
        v-model:value="model.default_text"
        maxlength="30"
        show-count
        :placeholder="$t('page.common.pointForm.form.defaultValue.required')"
      />
    </NFormItem>
  </template>

  <template v-if="props.isEnumType">
    <NFormItem :label="$t('page.common.pointForm.enumSourceDataType')" path="enum_source_data_type">
      <NSelect
        v-model:value="model.enum_source_data_type"
        :options="props.enumSourceDataTypeOptions"
        :placeholder="$t('page.common.pointForm.form.enumSourceDataType.required')"
      />
    </NFormItem>
    <NFormItem :label="$t('page.common.pointForm.enumMapping')">
      <NDynamicInput v-model:value="model.enum_list" :on-create="props.createEnumItem">
        <template #default="{ index }">
          <div class="w-full flex gap-12px">
            <NInput
              v-model:value="model.enum_list[index].value"
              maxlength="30"
              :placeholder="$t('page.common.pointForm.enumValue')"
            />
            <NInput
              v-model:value="model.enum_list[index].alias"
              maxlength="30"
              :placeholder="$t('page.common.pointForm.mappingName')"
            />
          </div>
        </template>
      </NDynamicInput>
    </NFormItem>
  </template>

  <NFormItem :label="$t('page.common.pointForm.pointDesc')" path="desc">
    <NInput
      v-model:value="model.desc"
      type="textarea"
      maxlength="200"
      show-count
      :rows="5"
      :placeholder="$t('page.common.pointForm.form.pointDesc.required')"
    />
  </NFormItem>
</template>

<style scoped></style>
