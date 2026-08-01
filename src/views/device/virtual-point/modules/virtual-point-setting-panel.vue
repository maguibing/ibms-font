<script setup lang="ts">
import { computed } from 'vue';
import { DATA_TYPE_OPTIONS, PRECISION_OPTIONS, UNIT_GROUPS } from '@/constants/device-point';
import { VirtualPointComputeMode, createDefaultVirtualPointPointSetting } from '../virtual-point';

defineOptions({ name: 'VirtualPointSettingPanel' });

const model = defineModel<Api.Device.DeviceTypePointSetting>({ required: true });
const props = defineProps<{ computeMode: VirtualPointComputeMode }>();

// 公式计算和统计次数固定数字类型，阈值赋值和分段映射允许选择输出类型。
const showDataType = computed(() =>
  [VirtualPointComputeMode.Threshold, VirtualPointComputeMode.SegmentMapping].includes(props.computeMode)
);

/** 切换数据类型时重建对应 setting 结构，避免保留其他类型字段。 */
function handleDataTypeChange(value: CommonType.DataType) {
  model.value = createDefaultVirtualPointPointSetting(value);
}

/** 枚举映射的新增行默认值。 */
function createEnumItem(): Api.System.DeviceTypeTemplatePointValueItem {
  return { value: '', alias: '' };
}
</script>

<template>
  <div class="rounded-8px border border-#e2e8f0 border-solid p-16px dark:border-#2f3338">
    <div class="mb-14px text-14px font-600">虚点设置</div>
    <NFormItem v-if="showDataType" label="数据类型">
      <NSelect
        :value="model.data_type"
        :options="DATA_TYPE_OPTIONS"
        placeholder="请选择数据类型"
        @update:value="handleDataTypeChange"
      />
    </NFormItem>

    <div v-if="model.data_type === 1" class="grid grid-cols-2 gap-x-16px lt-sm:grid-cols-1">
      <NFormItem label="精度" :show-feedback="false">
        <NSelect v-model:value="model.num_val!.scale" :options="PRECISION_OPTIONS" placeholder="请选择精度" />
      </NFormItem>
      <NFormItem label="单位" :show-feedback="false">
        <NSelect
          v-model:value="model.num_val!.unit"
          clearable
          filterable
          tag
          :options="UNIT_GROUPS"
          placeholder="请选择或输入单位"
        />
      </NFormItem>
    </div>

    <div v-else-if="model.data_type === 2" class="grid grid-cols-2 gap-x-16px lt-sm:grid-cols-1">
      <NFormItem label="开启映射名称" :show-feedback="false">
        <NInputGroup>
          <NInputGroupLabel>true</NInputGroupLabel>
          <NInput v-model:value="model.switch_val!.true_val!.alias" maxlength="30" placeholder="请输入开启映射名称" />
        </NInputGroup>
      </NFormItem>
      <NFormItem label="关闭映射名称" :show-feedback="false">
        <NInputGroup>
          <NInputGroupLabel>false</NInputGroupLabel>
          <NInput v-model:value="model.switch_val!.false_val!.alias" maxlength="30" placeholder="请输入关闭映射名称" />
        </NInputGroup>
      </NFormItem>
    </div>

    <NFormItem v-else-if="model.data_type === 4" label="枚举映射" :show-feedback="false" class="!mb-0">
      <NDynamicInput v-model:value="model.enum_val!.enum_list" :on-create="createEnumItem">
        <template #default="{ index }">
          <div class="w-full grid grid-cols-2 gap-12px">
            <NInput v-model:value="model.enum_val!.enum_list![index].value" maxlength="30" placeholder="枚举值" />
            <NInput v-model:value="model.enum_val!.enum_list![index].alias" maxlength="30" placeholder="映射名称" />
          </div>
        </template>
      </NDynamicInput>
    </NFormItem>
  </div>
</template>

<style scoped></style>
