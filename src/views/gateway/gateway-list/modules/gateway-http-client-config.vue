<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import {
  createGatewayHttpClientKeyValueRow,
  contentTypeOptions,
  getGatewayHttpClientRouteState,
  httpMethodSelectOptions,
  isIncompleteGatewayHttpClientKeyValueRow,
  isTokenKeyReadonly,
  syncGatewayHttpClientRouteTokenPlacement,
  tokenPlacementOptions
} from './gateway-http-client-config';

defineOptions({
  name: 'GatewayHttpClientConfig'
});

const model = defineModel<Api.Gateway.GatewayHttpClientModel>({
  required: true
});
const activeRouteTab = ref<'poll' | 'send'>('poll');
const activePollRequestTab = ref<'headers' | 'body'>('headers');

const { createRequiredRule } = useFormRules();

const serverRule = createRequiredRule($t('gatewayList.serverRequired'));
const tokenRequestRule: App.Global.FormRule = {
  trigger: ['input', 'blur', 'change'],
  validator: validateTokenRequest
};
const tokenHeadersRule: App.Global.FormRule = {
  trigger: ['input', 'blur', 'change'],
  validator: validateTokenHeaders
};
const tokenBodyRule: App.Global.FormRule = {
  trigger: ['input', 'blur', 'change'],
  validator: validateTokenBody
};
const routeGroupRule: App.Global.FormRule = {
  trigger: ['input', 'blur', 'change'],
  validator: validateRouteGroup
};
const pollTokenKeyRule: App.Global.FormRule = {
  trigger: ['input', 'blur', 'change'],
  validator: validateRouteTokenKey('poll_route')
};
const sendTokenKeyRule: App.Global.FormRule = {
  trigger: ['input', 'blur', 'change'],
  validator: validateRouteTokenKey('send_route')
};
const isPollTokenKeyDisabled = computed(
  () => !model.value.poll_route.with_auth || isTokenKeyReadonly(model.value.poll_route.token_placement)
);
const isSendTokenKeyDisabled = computed(
  () => !model.value.send_route.with_auth || isTokenKeyReadonly(model.value.send_route.token_placement)
);
const showPollBodyTab = computed(() => model.value.poll_route.method.trim().toUpperCase() !== 'GET');

/** Validate the base fields for the dynamic token request. */
function validateTokenRequest() {
  if (!model.value.token.is_enable) {
    return true;
  }

  const method = model.value.token.method.trim();
  const path = model.value.token.path.trim();

  if (method && path) {
    return true;
  }

  return new Error($t('gatewayList.tokenRequestIncomplete'));
}

/** Validate partially filled rows in the dynamic token request headers. */
function validateTokenHeaders() {
  if (!model.value.token.is_enable) {
    return true;
  }

  if (model.value.token.headers.some(isIncompleteGatewayHttpClientKeyValueRow)) {
    return new Error($t('gatewayList.requestHeadersIncomplete'));
  }

  return true;
}

/** Validate partially filled rows in the dynamic token request body. */
function validateTokenBody() {
  if (!model.value.token.is_enable) {
    return true;
  }

  if (model.value.token.body.some(isIncompleteGatewayHttpClientKeyValueRow)) {
    return new Error($t('gatewayList.requestBodyIncomplete'));
  }

  return true;
}

/** Validate the polling and command-dispatch route combination. */
function validateRouteGroup() {
  const pollRoute = getGatewayHttpClientRouteState(model.value.poll_route);
  if (!model.value.is_support_send) {
    if (!pollRoute.complete) {
      return new Error($t('gatewayList.pollingRouteIncomplete'));
    }

    return true;
  }

  const sendRoute = getGatewayHttpClientRouteState(model.value.send_route);

  if (pollRoute.incomplete || sendRoute.incomplete) {
    return new Error($t('gatewayList.routeGroupIncomplete'));
  }

  if (!pollRoute.complete && !sendRoute.complete) {
    return new Error($t('gatewayList.routeGroupRequired'));
  }

  return true;
}

/** Validate whether the route auth toggle matches the token key. */
function validateRouteTokenKey(routeKey: 'poll_route' | 'send_route') {
  return () => {
    if (routeKey === 'send_route' && !model.value.is_support_send) {
      return true;
    }

    const routeState = getGatewayHttpClientRouteState(model.value[routeKey]);

    if (routeState.withAuth && !routeState.tokenKey) {
      return new Error($t('gatewayList.tokenFieldRequiredWhenAuthEnabled'));
    }

    if (!routeState.withAuth && routeState.tokenKey) {
      return new Error($t('gatewayList.tokenFieldRequiredWhenAuthDisabled'));
    }

    return true;
  };
}

// Sync auto-filled token keys when the auth placement changes.
watch(
  () => [
    model.value.poll_route.token_placement,
    model.value.poll_route.with_auth,
    model.value.send_route.token_placement,
    model.value.send_route.with_auth
  ],
  () => {
    syncGatewayHttpClientRouteTokenPlacement(model.value.poll_route);
    syncGatewayHttpClientRouteTokenPlacement(model.value.send_route);
  },
  { immediate: true }
);

// Switch back to the polling tab when command dispatch is disabled.
watch(
  () => model.value.is_support_send,
  supported => {
    if (!supported) {
      activeRouteTab.value = 'poll';
    }
  }
);

// GET requests do not support a request body, so switch back to headers.
watch(
  () => model.value.poll_route.method,
  method => {
    if (method.trim().toUpperCase() === 'GET') {
      activePollRequestTab.value = 'headers';
    }
  }
);
</script>

<template>
  <div class="mb-18px border border-#e5e7eb border-solid rounded-8px bg-#fafafa px-14px pt-14px">
    <div class="mb-12px border-l-3px border-l-#18a058 border-l-solid pl-8px text-14px text-#18a058 font-600">
      {{ $t('gatewayList.httpClientConfig') }}
    </div>
    <NGrid responsive="screen" item-responsive :x-gap="16">
      <NFormItemGi span="24 m:16" :label="$t('gatewayList.serverAddress')" path="http_client.server" :rule="serverRule">
        <NInput v-model:value="model.server" :placeholder="$t('gatewayList.serverAddressPlaceholder')" />
      </NFormItemGi>
      <NFormItemGi span="24 m:8" :label="$t('gatewayList.requestTimeout')" path="http_client.timeout">
        <NInputNumber
          v-model:value="model.timeout"
          class="w-full"
          :min="10"
          :max="60"
          :precision="0"
          :placeholder="$t('gatewayList.requestTimeoutSecondsPlaceholder')"
        />
      </NFormItemGi>
    </NGrid>

    <div class="mb-18px rounded-8px border border-#e5e7eb border-solid bg-white px-14px pt-12px shadow-sm">
      <div
        class="mb-12px flex flex-wrap items-center justify-between gap-12px border-b border-#f0f0f0 border-b-solid pb-10px"
      >
        <div class="flex items-center gap-8px">
          <div class="text-14px text-#1f2937 font-600">{{ $t('gatewayList.dynamicTokenAuth') }}</div>
          <div
            class="rounded-4px px-8px py-2px text-12px font-500"
            :class="model.token.is_enable ? 'bg-#eef6f1 text-#18a058' : 'bg-#f3f4f6 text-#6b7280'"
          >
            {{ model.token.is_enable ? $t('gatewayList.enabled') : $t('gatewayList.disabled') }}
          </div>
        </div>
        <NSwitch v-model:value="model.token.is_enable">
          <template #checked>{{ $t('gatewayList.enabled') }}</template>
          <template #unchecked>{{ $t('gatewayList.disabled') }}</template>
        </NSwitch>
      </div>
      <template v-if="model.token.is_enable">
        <NGrid responsive="screen" item-responsive :x-gap="16">
          <NFormItemGi
            span="24 m:16"
            :label="$t('gatewayList.tokenRequest')"
            path="http_client.token.path"
            :rule="tokenRequestRule"
          >
            <NInputGroup class="w-full">
              <NSelect
                v-model:value="model.token.method"
                :options="httpMethodSelectOptions"
                :consistent-menu-width="false"
                class="w-110px"
              />
              <NInput v-model:value="model.token.path" placeholder="/api/token" />
            </NInputGroup>
          </NFormItemGi>
          <NFormItemGi span="24 m:8" :label="$t('gatewayList.contentType')" path="http_client.token.content_type">
            <NSelect v-model:value="model.token.content_type" :options="contentTypeOptions" />
          </NFormItemGi>
        </NGrid>
        <NTabs type="line" animated>
          <NTabPane name="headers" :tab="$t('gatewayList.requestHeaders')">
            <NFormItem path="http_client.token.headers" :rule="tokenHeadersRule" :show-label="false">
              <NDynamicInput v-model:value="model.token.headers" :on-create="createGatewayHttpClientKeyValueRow">
                <template #default="{ index }">
                  <div class="w-full flex gap-12px">
                    <NInput v-model:value="model.token.headers[index].key" :placeholder="$t('gatewayList.fieldName')" />
                    <NInput
                      v-model:value="model.token.headers[index].value"
                      :placeholder="$t('gatewayList.fieldValue')"
                    />
                  </div>
                </template>
              </NDynamicInput>
            </NFormItem>
          </NTabPane>
          <NTabPane name="body" :tab="$t('gatewayList.requestBody')">
            <NFormItem path="http_client.token.body" :rule="tokenBodyRule" :show-label="false">
              <NDynamicInput v-model:value="model.token.body" :on-create="createGatewayHttpClientKeyValueRow">
                <template #default="{ index }">
                  <div class="w-full flex gap-12px">
                    <NInput v-model:value="model.token.body[index].key" :placeholder="$t('gatewayList.fieldName')" />
                    <NInput v-model:value="model.token.body[index].value" :placeholder="$t('gatewayList.fieldValue')" />
                  </div>
                </template>
              </NDynamicInput>
            </NFormItem>
          </NTabPane>
        </NTabs>
        <NGrid responsive="screen" item-responsive :x-gap="16">
          <NFormItemGi span="24 m:8" :label="$t('gatewayList.tokenFieldName')" path="http_client.token.token_field">
            <NInput v-model:value="model.token.token_field" placeholder="data.access_token" />
          </NFormItemGi>
          <NFormItemGi span="24 m:8" :label="$t('gatewayList.expireFieldName')" path="http_client.token.expire_field">
            <NInput v-model:value="model.token.expire_field" placeholder="data.expires_in" />
          </NFormItemGi>
          <NFormItemGi span="24 m:8" :label="$t('gatewayList.expireSeconds')" path="http_client.token.expire_seconds">
            <NInputNumber
              v-model:value="model.token.expire_seconds"
              class="w-full"
              :min="1"
              :precision="0"
              :placeholder="$t('gatewayList.expireSecondsPlaceholder')"
            />
          </NFormItemGi>
        </NGrid>
      </template>
    </div>

    <div class="mb-18px rounded-8px border border-#e5e7eb border-solid bg-white px-14px pt-12px shadow-sm">
      <div class="mb-12px flex items-center justify-between border-b border-#f0f0f0 border-b-solid pb-10px">
        <div class="text-14px text-#1f2937 font-600">{{ $t('gatewayList.deviceBehaviorRoute') }}</div>
        <div class="flex items-center gap-8px">
          <span class="text-14px text-#1f2937">{{ $t('gatewayList.supportCommandSend') }}</span>
          <NSwitch v-model:value="model.is_support_send">
            <template #checked>{{ $t('gatewayList.yes') }}</template>
            <template #unchecked>{{ $t('gatewayList.no') }}</template>
          </NSwitch>
        </div>
      </div>
      <NTabs v-model:value="activeRouteTab" type="segment" animated>
        <NTabPane name="poll" :tab="$t('gatewayList.pollingPull')">
          <div class="pt-12px">
            <NGrid responsive="screen" item-responsive :x-gap="16">
              <NFormItemGi
                span="24"
                :label="$t('gatewayList.requestMethodAndPath')"
                path="http_client.poll_route.path"
                :rule="routeGroupRule"
              >
                <NInputGroup class="w-full">
                  <NSelect
                    v-model:value="model.poll_route.method"
                    :options="httpMethodSelectOptions"
                    :consistent-menu-width="false"
                    class="w-110px"
                  />
                  <NInput v-model:value="model.poll_route.path" placeholder="/api/device/status" />
                </NInputGroup>
              </NFormItemGi>
              <NFormItemGi
                span="24 m:12"
                :label="$t('gatewayList.contentType')"
                path="http_client.poll_route.content_type"
              >
                <NSelect v-model:value="model.poll_route.content_type" :options="contentTypeOptions" />
              </NFormItemGi>
              <NFormItemGi
                span="24 m:12"
                :label="$t('gatewayList.pollIntervalSeconds')"
                path="http_client.poll_interval"
              >
                <NInputNumber
                  v-model:value="model.poll_interval"
                  class="w-full"
                  :min="5"
                  :precision="0"
                  :placeholder="$t('gatewayList.pollIntervalSecondsPlaceholder')"
                />
              </NFormItemGi>
              <NFormItemGi span="24 m:4" :label="$t('gatewayList.withAuth')" path="http_client.poll_route.with_auth">
                <NSwitch v-model:value="model.poll_route.with_auth">
                  <template #checked>{{ $t('gatewayList.yes') }}</template>
                  <template #unchecked>{{ $t('gatewayList.no') }}</template>
                </NSwitch>
              </NFormItemGi>
              <NFormItemGi
                span="24 m:10"
                :label="$t('gatewayList.tokenPlacement')"
                path="http_client.poll_route.token_placement"
              >
                <NSelect
                  v-model:value="model.poll_route.token_placement"
                  :options="tokenPlacementOptions"
                  :disabled="!model.poll_route.with_auth"
                  :placeholder="$t('gatewayList.selectTokenPlacement')"
                />
              </NFormItemGi>
              <NFormItemGi
                span="24 m:10"
                :label="$t('gatewayList.tokenFieldName')"
                path="http_client.poll_route.token_key"
                :rule="pollTokenKeyRule"
              >
                <NInput
                  v-model:value="model.poll_route.token_key"
                  :disabled="isPollTokenKeyDisabled"
                  :placeholder="$t('gatewayList.autoFillTokenKeyPlaceholder')"
                />
              </NFormItemGi>
            </NGrid>
            <NTabs v-model:value="activePollRequestTab" type="line" animated>
              <NTabPane name="headers" :tab="$t('gatewayList.requestHeaders')">
                <NFormItem path="http_client.poll_route.headers" :show-label="false">
                  <NDynamicInput
                    v-model:value="model.poll_route.headers"
                    :on-create="createGatewayHttpClientKeyValueRow"
                  >
                    <template #default="{ index }">
                      <div class="w-full flex gap-12px">
                        <NInput
                          v-model:value="model.poll_route.headers[index].key"
                          :placeholder="$t('gatewayList.fieldName')"
                        />
                        <NInput
                          v-model:value="model.poll_route.headers[index].value"
                          :placeholder="$t('gatewayList.fieldValue')"
                        />
                      </div>
                    </template>
                  </NDynamicInput>
                </NFormItem>
              </NTabPane>
              <NTabPane v-if="showPollBodyTab" name="body" :tab="$t('gatewayList.requestBody')">
                <NFormItem path="http_client.poll_route.body" :show-label="false">
                  <NDynamicInput v-model:value="model.poll_route.body" :on-create="createGatewayHttpClientKeyValueRow">
                    <template #default="{ index }">
                      <div class="w-full flex gap-12px">
                        <NInput
                          v-model:value="model.poll_route.body[index].key"
                          :placeholder="$t('gatewayList.fieldName')"
                        />
                        <NInput
                          v-model:value="model.poll_route.body[index].value"
                          :placeholder="$t('gatewayList.fieldValue')"
                        />
                      </div>
                    </template>
                  </NDynamicInput>
                </NFormItem>
              </NTabPane>
            </NTabs>
          </div>
        </NTabPane>
        <NTabPane name="send" :tab="$t('gatewayList.commandDispatch')" :disabled="!model.is_support_send">
          <div class="pt-12px">
            <NGrid responsive="screen" item-responsive :x-gap="16">
              <NFormItemGi span="24" :label="$t('gatewayList.requestMethodAndPath')" path="http_client.send_route.path">
                <NInputGroup class="w-full">
                  <NSelect
                    v-model:value="model.send_route.method"
                    :options="httpMethodSelectOptions"
                    :consistent-menu-width="false"
                    class="w-110px"
                  />
                  <NInput v-model:value="model.send_route.path" placeholder="/api/device/control" />
                </NInputGroup>
              </NFormItemGi>
              <NFormItemGi span="24" :label="$t('gatewayList.contentType')" path="http_client.send_route.content_type">
                <NSelect v-model:value="model.send_route.content_type" :options="contentTypeOptions" />
              </NFormItemGi>
              <NFormItemGi span="24 m:4" :label="$t('gatewayList.withAuth')" path="http_client.send_route.with_auth">
                <NSwitch v-model:value="model.send_route.with_auth">
                  <template #checked>{{ $t('gatewayList.yes') }}</template>
                  <template #unchecked>{{ $t('gatewayList.no') }}</template>
                </NSwitch>
              </NFormItemGi>
              <NFormItemGi
                span="24 m:10"
                :label="$t('gatewayList.tokenPlacement')"
                path="http_client.send_route.token_placement"
              >
                <NSelect
                  v-model:value="model.send_route.token_placement"
                  :options="tokenPlacementOptions"
                  :disabled="!model.send_route.with_auth"
                  :placeholder="$t('gatewayList.selectTokenPlacement')"
                />
              </NFormItemGi>
              <NFormItemGi
                span="24 m:10"
                :label="$t('gatewayList.tokenFieldName')"
                path="http_client.send_route.token_key"
                :rule="sendTokenKeyRule"
              >
                <NInput
                  v-model:value="model.send_route.token_key"
                  :disabled="isSendTokenKeyDisabled"
                  :placeholder="$t('gatewayList.autoFillTokenKeyPlaceholder')"
                />
              </NFormItemGi>
            </NGrid>

            <NTabs type="line" animated>
              <NTabPane name="headers" :tab="$t('gatewayList.requestHeaders')">
                <NFormItem path="http_client.send_route.headers" :show-label="false">
                  <NDynamicInput
                    v-model:value="model.send_route.headers"
                    :on-create="createGatewayHttpClientKeyValueRow"
                  >
                    <template #default="{ index }">
                      <div class="w-full flex gap-12px">
                        <NInput
                          v-model:value="model.send_route.headers[index].key"
                          :placeholder="$t('gatewayList.fieldName')"
                        />
                        <NInput
                          v-model:value="model.send_route.headers[index].value"
                          :placeholder="$t('gatewayList.fieldValue')"
                        />
                      </div>
                    </template>
                  </NDynamicInput>
                </NFormItem>
              </NTabPane>
            </NTabs>
          </div>
        </NTabPane>
      </NTabs>
    </div>
  </div>
</template>
