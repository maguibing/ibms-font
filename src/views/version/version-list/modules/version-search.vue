<script setup lang="ts">
import { toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'VersionSearch'
});

type SearchParams = CommonType.RecordNullable<
  Pick<Api.System.CorpProjectVersion, 'name'> & Api.Common.CommonSearchParams
>;

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<SearchParams>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));

function resetModel() {
  const pageSize = model.value.pageSize;

  Object.assign(model.value, {
    ...defaultModel,
    pageSize
  });
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
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="version-list-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="120">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:8" :label="$t('page.corp.version.versionName')" path="name" class="pr-24px">
              <NInput
                v-model:value="model.name"
                clearable
                :placeholder="$t('page.corp.version.form.versionName.required')"
                @keyup.enter="search"
              />
            </NFormItemGi>
            <NFormItemGi :show-feedback="false" span="24 s:12 m:16" class="pr-24px">
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
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>

<style scoped></style>
