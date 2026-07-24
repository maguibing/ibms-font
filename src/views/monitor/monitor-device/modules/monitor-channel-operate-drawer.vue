<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { jsonClone } from '@sa/utils';
import { fetchCreateMonitorChannel, fetchUpdateMonitorChannel } from '@/service/api/monitor';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { enableStatusOptions } from '@/constants/business';
import { $t } from '@/locales';

defineOptions({
  name: 'MonitorChannelOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  monitorId: CommonType.IdType;
  rowData?: Api.Monitor.MonitorChannel | null;
}

interface Emits {
  (e: 'submitted'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const CHANNEL_CONFIG_OPTIONS = [{ label: '拉流配置', value: 'local_pull' }];

const PLAY_PROTOCOL_OPTIONS: CommonType.Option<Api.Monitor.MonitorChannelPlayProtocol, string>[] = [
  { label: 'HLS', value: 3 },
  { label: 'HTTP-FLV', value: 4 }
];

const SOURCE_URL_TIP = `海康：rtsp://账号:密码@主机地址:554/Streaming/Channels/101
账号、密码为摄像头登录信息；主机地址填写设备 IP 或域名；554 为默认 RTSP 端口；通道号通常从 1 开始；码流号常用 01 表示主码流、02 表示子码流，例如 101 表示 1 通道主码流。

大华：rtsp://账号:密码@主机地址:554/cam/realmonitor?channel=1&subtype=0
账号、密码为摄像头登录信息；主机地址填写设备 IP 或域名；554 为默认 RTSP 端口；channel 填实际通道号；subtype=0 表示主码流，subtype=1 表示子码流。`;

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();

const model = ref<Api.Monitor.MonitorChannelOperateParams>(createDefaultModel());

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增通道',
    edit: '编辑通道'
  };

  return titles[props.operateType];
});

const rules: Record<string, App.Global.FormRule> = {
  name: createRequiredRule('请输入通道名称'),
  'setting.play_protocol': createRequiredRule('请选择播放协议'),
  'setting.local_pull.source_url': createRequiredRule('请输入设备原始流'),
  status: createRequiredRule('请选择状态')
};

function createDefaultModel(): Api.Monitor.MonitorChannelOperateParams {
  return {
    id: null,
    monitor_id: props.monitorId,
    name: '',
    setting: {
      play_protocol: 3,
      local_pull: {
        source_url: ''
      }
    },
    status: 1
  };
}

function handleUpdateModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    const rowData = jsonClone(props.rowData);

    model.value = {
      id: rowData.id,
      monitor_id: rowData.monitor_id,
      name: rowData.name,
      setting: {
        play_protocol: rowData.setting?.play_protocol ?? 3,
        local_pull: {
          source_url: rowData.setting?.local_pull?.source_url || ''
        }
      },
      status: rowData.status
    };
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  if (loading.value) return;

  await validate();

  const payload = jsonClone(model.value);
  payload.monitor_id = props.monitorId;

  startLoading();
  const { error } = await (
    props.operateType === 'edit'
      ? fetchUpdateMonitorChannel(payload)
      : fetchCreateMonitorChannel({
          monitor_id: payload.monitor_id,
          name: payload.name,
          setting: payload.setting,
          status: payload.status
        })
  ).finally(endLoading);
  if (error) return;

  window.$message?.success(props.operateType === 'edit' ? $t('common.updateSuccess') : $t('common.addSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, nextVisible => {
  if (!nextVisible) return;

  handleUpdateModel();
  restoreValidation();
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="600" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
        <NFormItem label="通道名称" path="name">
          <NInput v-model:value="model.name" maxlength="30" show-count placeholder="请输入通道名称" />
        </NFormItem>
        <NFormItem label="通道配置">
          <NSelect :value="CHANNEL_CONFIG_OPTIONS[0].value" :options="CHANNEL_CONFIG_OPTIONS" disabled />
        </NFormItem>
        <NFormItem label="播放协议" path="setting.play_protocol">
          <NSelect
            v-model:value="model.setting.play_protocol"
            :options="PLAY_PROTOCOL_OPTIONS"
            placeholder="请选择播放协议"
          />
        </NFormItem>
        <NFormItem path="setting.local_pull.source_url">
          <template #label>
            <div class="flex items-center gap-4px">
              <span>设备原始流</span>
              <IconTooltip placement="top-start">
                <span class="block max-w-560px whitespace-pre-wrap text-12px leading-20px">{{ SOURCE_URL_TIP }}</span>
              </IconTooltip>
            </div>
          </template>
          <NInput v-model:value="model.setting.local_pull.source_url" type="textarea" placeholder="请输入设备原始流" />
        </NFormItem>
        <NFormItem label="状态" path="status">
          <NRadioGroup v-model:value="model.status">
            <NSpace>
              <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </NRadio>
            </NSpace>
          </NRadioGroup>
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
