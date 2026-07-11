<script setup lang="ts">
import { computed, defineAsyncComponent, shallowRef, useTemplateRef, watch } from 'vue';
import { $t } from '@/locales';

defineOptions({
  name: 'DeviceTypeOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowId?: CommonType.IdType | null;
}

interface Emits {
  (e: 'submitted'): void;
}

const props = withDefaults(defineProps<Props>(), {
  rowId: null
});
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

type CreateMode = 'custom' | 'template';
type CreatePanelExpose = {
  submit: () => Promise<boolean>;
};

const activeCreateMode = shallowRef<CreateMode>('custom');
const submitLoading = shallowRef(false);
const DeviceTypeOperatePanel = defineAsyncComponent(() => import('./device-type-operate-panel.vue'));
const DeviceTypeTemplateImportPanel = defineAsyncComponent(() => import('./device-type-template-import-panel.vue'));
const currentPanelRef = useTemplateRef<CreatePanelExpose>('currentPanelRef');
const createModeComponentMap = {
  custom: DeviceTypeOperatePanel,
  template: DeviceTypeTemplateImportPanel
};

const isEdit = computed(() => props.operateType === 'edit');

const title = computed(() => (isEdit.value ? '编辑设备类型' : '创建设备类型'));

const showCreateTabs = computed(() => !isEdit.value);

const drawerWidth = computed(() => (!isEdit.value && activeCreateMode.value === 'template' ? 1120 : 520));

const currentCreateModeComponent = computed(() => {
  if (isEdit.value) {
    return DeviceTypeOperatePanel;
  }

  return createModeComponentMap[activeCreateMode.value];
});

const currentPanelKey = computed(() => {
  return isEdit.value ? `edit-${props.rowId ?? ''}` : `add-${activeCreateMode.value}`;
});

const currentPanelProps = computed(() => {
  if (isEdit.value || activeCreateMode.value === 'custom') {
    return {
      operateType: props.operateType,
      rowId: props.rowId,
      visible: visible.value
    };
  }

  return {
    visible: visible.value
  };
});

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  if (submitLoading.value) return;

  submitLoading.value = true;
  let success = false;

  try {
    success = Boolean(await currentPanelRef.value?.submit());
  } finally {
    submitLoading.value = false;
  }

  if (!success) return;
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    activeCreateMode.value = 'custom';
    submitLoading.value = false;
  }
});
</script>

<template>
  <NDrawer
    v-model:show="visible"
    display-directive="show"
    :width="drawerWidth"
    class="max-w-95%"
    content-class="h-full"
    wrapper-class="h-full"
  >
    <NDrawerContent
      :title="title"
      :native-scrollbar="false"
      closable
      body-class="h-full"
      body-content-class="h-full flex flex-col"
    >
      <NTabs v-if="showCreateTabs" v-model:value="activeCreateMode" animated class="mb-16px shrink-0">
        <NTab name="custom" tab="自定义创建" />
        <NTab name="template" tab="从类型库导入" />
      </NTabs>
      <div class="relative min-h-0 flex-1 overflow-hidden">
        <Transition name="device-type-panel" mode="out-in">
          <component
            :is="currentCreateModeComponent"
            v-if="visible"
            :key="currentPanelKey"
            ref="currentPanelRef"
            v-bind="currentPanelProps"
          />
        </Transition>
      </div>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton
            v-if="isEdit || activeCreateMode === 'custom'"
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
          >
            {{ $t('common.confirm') }}
          </NButton>
          <NButton v-else type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ $t('common.import') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.device-type-panel-enter-active,
.device-type-panel-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.device-type-panel-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.device-type-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
