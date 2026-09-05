<script setup lang="ts">
import type { SelectOption } from 'naive-ui';
import { DATA_TYPE_OPTIONS, ENERGY_TYPE_OPTIONS, PRECISION_OPTIONS, UNIT_GROUPS } from '@/constants/business';
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
      :options="DATA_TYPE_OPTIONS"
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
        :options="PRECISION_OPTIONS"
        :placeholder="$t('page.common.pointForm.form.scale.required')"
      />
    </NFormItem>
    <NFormItem :label="$t('page.common.pointForm.energyType')" path="energy_type">
      <NSelect
        v-model:value="model.energy_type"
        :options="ENERGY_TYPE_OPTIONS"
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
