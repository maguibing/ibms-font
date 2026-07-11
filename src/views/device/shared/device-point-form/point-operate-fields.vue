<script setup lang="ts">
import type { SelectOption } from 'naive-ui';
import { DATA_TYPE_OPTIONS, ENERGY_TYPE_OPTIONS, PRECISION_OPTIONS, UNIT_GROUPS } from '@/constants/device-point';
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
  <NFormItem label="名称" path="name">
    <NInput v-model:value="model.name" maxlength="30" show-count placeholder="请输入点位名称" />
  </NFormItem>
  <NFormItem label="标识符" path="key">
    <NInput v-model:value="model.key" maxlength="30" show-count placeholder="请输入标识符" />
  </NFormItem>
  <NFormItem label="数据类型" path="data_type">
    <NSelect v-model:value="model.data_type" :options="DATA_TYPE_OPTIONS" placeholder="请选择数据类型" />
  </NFormItem>

  <template v-if="props.isNumberType">
    <NFormItem label="单位" path="unit">
      <NSelect
        v-model:value="model.unit"
        clearable
        filterable
        tag
        :options="UNIT_GROUPS"
        placeholder="请选择或输入单位(如：kWh、J、dB)"
      />
    </NFormItem>
    <NFormItem label="默认值" path="default_number">
      <NInputNumber v-model:value="model.default_number" button-placement="right" />
    </NFormItem>
    <NFormItem label="精度" path="scale">
      <NSelect v-model:value="model.scale" :options="PRECISION_OPTIONS" placeholder="请选择精度" />
    </NFormItem>
    <NFormItem label="能源类型" path="energy_type">
      <NSelect v-model:value="model.energy_type" :options="ENERGY_TYPE_OPTIONS" placeholder="请选择能源类型" />
    </NFormItem>
  </template>

  <template v-if="props.isSwitchType">
    <NFormItem label="源数据类型" path="switch_preset">
      <NSelect
        v-model:value="model.switch_preset"
        :options="props.switchPresetOptions"
        placeholder="请选择源数据类型"
      />
    </NFormItem>
    <NFormItem :label="props.trueMappingLabel" path="true_alias">
      <NInput v-model:value="model.true_alias" maxlength="30" show-count placeholder="请输入映射名称" />
    </NFormItem>
    <NFormItem :label="props.falseMappingLabel" path="false_alias">
      <NInput v-model:value="model.false_alias" maxlength="30" show-count placeholder="请输入映射名称" />
    </NFormItem>
  </template>

  <template v-if="props.isTextType">
    <NFormItem label="默认值" path="default_text">
      <NInput v-model:value="model.default_text" maxlength="30" show-count placeholder="请输入默认值" />
    </NFormItem>
  </template>

  <template v-if="props.isEnumType">
    <NFormItem label="枚举源数据类型" path="enum_source_data_type">
      <NSelect
        v-model:value="model.enum_source_data_type"
        :options="props.enumSourceDataTypeOptions"
        placeholder="请选择枚举源数据类型"
      />
    </NFormItem>
    <NFormItem label="枚举映射">
      <NDynamicInput v-model:value="model.enum_list" :on-create="props.createEnumItem">
        <template #default="{ index }">
          <div class="w-full flex gap-12px">
            <NInput v-model:value="model.enum_list[index].value" maxlength="30" placeholder="值" />
            <NInput v-model:value="model.enum_list[index].alias" maxlength="30" placeholder="映射名称" />
          </div>
        </template>
      </NDynamicInput>
    </NFormItem>
  </template>

  <NFormItem label="点位描述" path="desc">
    <NInput
      v-model:value="model.desc"
      type="textarea"
      maxlength="200"
      show-count
      :rows="5"
      placeholder="请输入点位描述"
    />
  </NFormItem>
</template>

<style scoped></style>
