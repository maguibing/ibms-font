<script setup lang="ts">
import { computed, toRaw } from 'vue';
import { NCollapse, NCollapseItem } from 'naive-ui';
import { jsonClone } from '@sa/utils';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'TaskListSearch'
});

interface Emits {
  (e: 'search'): void;
}

interface Props {
  bordered?: boolean;
  collapsible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  bordered: false,
  collapsible: true
});

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.Task.TaskSearchParams>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));
const searchWrapper = computed(() => (props.collapsible ? NCollapse : 'div'));
const searchContentWrapper = computed(() => (props.collapsible ? NCollapseItem : 'div'));
const searchContentProps = computed(() =>
  props.collapsible ? { title: $t('common.search'), name: 'task-list-search' } : {}
);

function resetModel() {
  Object.assign(model.value, defaultModel);
}

async function reset() {
  await restoreValidation();
  resetModel();
  emit('search');
}

async function search() {
  await validate();
  emit('search');
}
</script>

<template>
  <NCard :bordered="props.bordered" size="small" class="card-wrapper">
    <component :is="searchWrapper">
      <component :is="searchContentWrapper" v-bind="searchContentProps">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="90" :show-feedback="props.collapsible">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:8" label="任务名称" path="name" label-width="auto">
              <NInput v-model:value="model.name" clearable placeholder="请输入任务名称" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi :show-feedback="false" span="24 s:12 m:16">
              <NSpace class="w-full" justify="end">
                <NButton type="primary" ghost @click="search">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  {{ $t('common.search') }}
                </NButton>
                <NButton @click="reset">
                  <template #icon>
                    <icon-ic-round-refresh class="text-icon" />
                  </template>
                  {{ $t('common.reset') }}
                </NButton>
              </NSpace>
            </NFormItemGi>
          </NGrid>
        </NForm>
      </component>
    </component>
  </NCard>
</template>

<style scoped></style>
