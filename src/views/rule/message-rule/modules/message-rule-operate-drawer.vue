<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchCreateMessageRule, fetchUpdateMessageRule, fetchValidateMessageRule } from '@/service/api/rule';
import { fetchGetGatewayList } from '@/service/api/gateway';
import { enableStatusOptions, messageRuleTypeOptions } from '@/constants/business';
import JsCodeEditor from '@/components/custom/js-code-editor.vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'MessageRuleOperateDrawer'
});

type MessageRuleOperateType = 'add' | 'edit' | 'view';
type Model = Api.Rule.MessageRuleOperateParams;
type GatewaySelectOption = Pick<Api.Gateway.Gateway, 'id' | 'name'>;

interface Props {
  operateType: MessageRuleOperateType;
  rowData?: Api.Rule.MessageRule | null;
}

interface Emits {
  (e: 'submitted'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const defaultScript = `module.exports = function (report) {
  /**
  * report: 上报的属性对象，同时作为函数返回值。函数中可更新属性对象。
  */
  return report;
}`;

const gatewayRequestParams: CommonType.CommonListQueryParams = {
  options: [{ key: 1 }],
  list_option: {
    options: [{ type: 104, value: '101' }]
  }
};

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();
const { loading: validateLoading, startLoading: startValidateLoading, endLoading: endValidateLoading } = useLoading();

const model = ref<Model>(createDefaultModel());
const testDataJson = shallowRef('{}');
const validateResult = shallowRef('');
const selectedGateway = shallowRef<GatewaySelectOption | null>(null);

const isView = computed(() => props.operateType === 'view');
const isEdit = computed(() => props.operateType === 'edit');
const title = computed(() => {
  const titles: Record<MessageRuleOperateType, string> = {
    add: $t('messageRule.add'),
    edit: $t('messageRule.edit'),
    view: $t('messageRule.view')
  };

  return titles[props.operateType];
});

const rules: Record<string, App.Global.FormRule> = {
  name: createRequiredRule($t('messageRule.namePlaceholder')),
  gateway_id: createRequiredRule($t('messageRule.gatewayPlaceholder')),
  rule_type: createRequiredRule($t('messageRule.typePlaceholder')),
  status: createRequiredRule($t('messageRule.statusPlaceholder')),
  'rule.content': createRequiredRule($t('messageRule.scriptPlaceholder'))
};

function createDefaultModel(): Model {
  return {
    id: null,
    gateway_id: null,
    name: '',
    rule: {
      script_type: 2,
      content: defaultScript
    },
    rule_type: 1,
    status: 1
  };
}

function syncModelFromRow(row: Api.Rule.MessageRule) {
  selectedGateway.value = {
    id: row.gateway_id,
    name: String(row.gateway_id)
  };

  model.value = {
    id: row.id,
    gateway_id: Number(row.gateway_id),
    name: row.name || '',
    rule: {
      script_type: 2,
      content: row.rule?.content || defaultScript
    },
    rule_type: row.rule_type,
    status: row.status
  };
}

function handleUpdateModel() {
  model.value = createDefaultModel();
  testDataJson.value = '{}';
  validateResult.value = '';
  selectedGateway.value = null;

  if (props.operateType !== 'add' && props.rowData) {
    syncModelFromRow(props.rowData);
  }
}

function closeDrawer() {
  visible.value = false;
}

function buildSubmitParams(): Model {
  return {
    gateway_id: model.value.gateway_id,
    name: model.value.name,
    rule: {
      script_type: 2,
      content: model.value.rule.content
    },
    rule_type: model.value.rule_type,
    status: model.value.status
  };
}

function formatValidateResult(value: Api.Rule.MessageRuleValidateResult) {
  if (typeof value === 'string') return value;

  try {
    return JSON.stringify(value, null, 2) || String(value);
  } catch {
    return String(value);
  }
}

function getTestDataJson() {
  const value = testDataJson.value.trim();

  if (!value) return '{}';

  JSON.parse(value);

  return value;
}

async function handleValidate() {
  if (validateLoading.value) return;

  if (!model.value.rule.content.trim()) {
    window.$message?.warning($t('messageRule.scriptPlaceholder'));
    return;
  }

  let testData = '{}';

  try {
    testData = getTestDataJson();
  } catch {
    window.$message?.warning($t('messageRule.invalidTestData'));
    return;
  }

  startValidateLoading();
  const { data, error } = await fetchValidateMessageRule({
    script: model.value.rule.content,
    script_type: 2,
    test_data_json: testData
  }).finally(endValidateLoading);

  if (error) return;

  validateResult.value = formatValidateResult(data);
}

async function handleSubmit() {
  if (isView.value || loading.value) return;

  startLoading();
  try {
    await validate();

    const params = buildSubmitParams();
    const { error } = await (isEdit.value
      ? fetchUpdateMessageRule({ ...params, id: model.value.id })
      : fetchCreateMessageRule(params));
    if (error) return;

    window.$message?.success(isEdit.value ? $t('common.updateSuccess') : $t('common.addSuccess'));
    closeDrawer();
    emit('submitted');
  } finally {
    endLoading();
  }
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModel();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="820" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top" :show-require-mark="false">
        <NGrid responsive="screen" item-responsive :x-gap="18">
          <NFormItemGi span="24 m:12" :label="$t('messageRule.name')" path="name" show-require-mark>
            <NInput
              v-model:value="model.name"
              :disabled="isView"
              maxlength="50"
              show-count
              :placeholder="$t('messageRule.namePlaceholder')"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('messageRule.gateway')" path="gateway_id" show-require-mark>
            <RemoteSearchSelect
              v-model:value="model.gateway_id"
              :request="fetchGetGatewayList"
              :request-params="gatewayRequestParams"
              :search-type="1"
              :selected-options="selectedGateway"
              :disabled="isView"
              label-field="name"
              value-field="id"
              clearable
              :placeholder="$t('messageRule.gatewayPlaceholder')"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('messageRule.type')" path="rule_type" show-require-mark>
            <NRadioGroup v-model:value="model.rule_type" :disabled="isView">
              <NSpace>
                <NRadio v-for="item in messageRuleTypeOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </NRadio>
              </NSpace>
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('messageRule.status')" path="status" show-require-mark>
            <NRadioGroup v-model:value="model.status" :disabled="isView">
              <NSpace>
                <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </NRadio>
              </NSpace>
            </NRadioGroup>
          </NFormItemGi>
        </NGrid>

        <NFormItem path="rule.content" show-require-mark>
          <JsCodeEditor
            v-model:value="model.rule.content"
            :label="$t('messageRule.scriptLabel')"
            :readonly="isView"
            :height="240"
          />
        </NFormItem>
      </NForm>

      <div v-if="!isView" class="flex-col gap-12px">
        <JsCodeEditor
          v-model:value="testDataJson"
          :label="$t('messageRule.testDataLabel')"
          format-parser="json"
          :height="160"
        >
          <template #toolbar-actions>
            <NButton type="primary" size="tiny" ghost :loading="validateLoading" @click="handleValidate">
              {{ $t('messageRule.validateScript') }}
            </NButton>
          </template>
        </JsCodeEditor>
        <JsCodeEditor
          v-if="validateResult"
          v-model:value="validateResult"
          :label="$t('messageRule.validateResultLabel')"
          readonly
          :show-format="false"
          :height="180"
        />
      </div>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ isView ? $t('common.close') : $t('common.cancel') }}</NButton>
          <NButton v-if="!isView" type="primary" :loading="loading" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
