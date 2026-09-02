<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useFormRules } from '@/hooks/common/form';
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

const serverRule = createRequiredRule('请输入服务地址');
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

/** 校验动态令牌请求的基础信息。 */
function validateTokenRequest() {
  if (!model.value.token.is_enable) {
    return true;
  }

  const method = model.value.token.method.trim();
  const path = model.value.token.path.trim();

  if (method && path) {
    return true;
  }

  return new Error('开启动态令牌鉴权后，请完整填写令牌请求方法与路径');
}

/** 校验动态令牌请求头中的半填写行。 */
function validateTokenHeaders() {
  if (!model.value.token.is_enable) {
    return true;
  }

  if (model.value.token.headers.some(isIncompleteGatewayHttpClientKeyValueRow)) {
    return new Error('请求头存在未完成项，请补全键和值或删除该行');
  }

  return true;
}

/** 校验动态令牌请求体中的半填写行。 */
function validateTokenBody() {
  if (!model.value.token.is_enable) {
    return true;
  }

  if (model.value.token.body.some(isIncompleteGatewayHttpClientKeyValueRow)) {
    return new Error('请求体存在未完成项，请补全键和值或删除该行');
  }

  return true;
}

/** 校验轮询和指令下发路由的填写组合。 */
function validateRouteGroup() {
  const pollRoute = getGatewayHttpClientRouteState(model.value.poll_route);
  if (!model.value.is_support_send) {
    if (!pollRoute.complete) {
      return new Error('轮询拉取需要完整填写请求方法和路径');
    }

    return true;
  }

  const sendRoute = getGatewayHttpClientRouteState(model.value.send_route);

  if (pollRoute.incomplete || sendRoute.incomplete) {
    return new Error('轮询拉取/指令下发存在未填完整字段，请补全或清空该组');
  }

  if (!pollRoute.complete && !sendRoute.complete) {
    return new Error('轮询拉取和指令下发至少需要完整填写一组');
  }

  return true;
}

/** 校验路由认证开关与令牌字段是否匹配。 */
function validateRouteTokenKey(routeKey: 'poll_route' | 'send_route') {
  return () => {
    if (routeKey === 'send_route' && !model.value.is_support_send) {
      return true;
    }

    const routeState = getGatewayHttpClientRouteState(model.value[routeKey]);

    if (routeState.withAuth && !routeState.tokenKey) {
      return new Error('开启携带认证后，令牌字段名不能为空');
    }

    if (!routeState.withAuth && routeState.tokenKey) {
      return new Error('关闭携带认证后，令牌字段名必须为空');
    }

    return true;
  };
}

// 认证位置变化时同步自动填充的令牌字段。
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

// 关闭指令下发后回到轮询拉取页签。
watch(
  () => model.value.is_support_send,
  supported => {
    if (!supported) {
      activeRouteTab.value = 'poll';
    }
  }
);

// GET 请求不支持请求体，切换方法时回到请求头页签。
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
      HTTP Client 配置参数
    </div>
    <NGrid responsive="screen" item-responsive :x-gap="16">
      <NFormItemGi span="24 m:16" label="服务地址" path="http_client.server" :rule="serverRule">
        <NInput v-model:value="model.server" placeholder="例如：https://api.example.com" />
      </NFormItemGi>
      <NFormItemGi span="24 m:8" label="请求超时（秒）" path="http_client.timeout">
        <NInputNumber
          v-model:value="model.timeout"
          class="w-full"
          :min="10"
          :max="60"
          :precision="0"
          placeholder="请输入请求超时（秒）"
        />
      </NFormItemGi>
    </NGrid>

    <div class="mb-18px rounded-8px border border-#e5e7eb border-solid bg-white px-14px pt-12px shadow-sm">
      <div
        class="mb-12px flex flex-wrap items-center justify-between gap-12px border-b border-#f0f0f0 border-b-solid pb-10px"
      >
        <div class="flex items-center gap-8px">
          <div class="text-14px text-#1f2937 font-600">动态令牌鉴权</div>
          <div
            class="rounded-4px px-8px py-2px text-12px font-500"
            :class="model.token.is_enable ? 'bg-#eef6f1 text-#18a058' : 'bg-#f3f4f6 text-#6b7280'"
          >
            {{ model.token.is_enable ? '已启用' : '未启用' }}
          </div>
        </div>
        <NSwitch v-model:value="model.token.is_enable">
          <template #checked>启用</template>
          <template #unchecked>关闭</template>
        </NSwitch>
      </div>
      <template v-if="model.token.is_enable">
        <NGrid responsive="screen" item-responsive :x-gap="16">
          <NFormItemGi span="24 m:16" label="令牌请求" path="http_client.token.path" :rule="tokenRequestRule">
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
          <NFormItemGi span="24 m:8" label="内容类型" path="http_client.token.content_type">
            <NSelect v-model:value="model.token.content_type" :options="contentTypeOptions" />
          </NFormItemGi>
        </NGrid>
        <NTabs type="line" animated>
          <NTabPane name="headers" tab="请求头">
            <NFormItem path="http_client.token.headers" :rule="tokenHeadersRule" :show-label="false">
              <NDynamicInput v-model:value="model.token.headers" :on-create="createGatewayHttpClientKeyValueRow">
                <template #default="{ index }">
                  <div class="w-full flex gap-12px">
                    <NInput v-model:value="model.token.headers[index].key" placeholder="字段名，如 Authorization" />
                    <NInput v-model:value="model.token.headers[index].value" placeholder="字段值" />
                  </div>
                </template>
              </NDynamicInput>
            </NFormItem>
          </NTabPane>
          <NTabPane name="body" tab="请求体">
            <NFormItem path="http_client.token.body" :rule="tokenBodyRule" :show-label="false">
              <NDynamicInput v-model:value="model.token.body" :on-create="createGatewayHttpClientKeyValueRow">
                <template #default="{ index }">
                  <div class="w-full flex gap-12px">
                    <NInput v-model:value="model.token.body[index].key" placeholder="字段名，如 username" />
                    <NInput v-model:value="model.token.body[index].value" placeholder="字段值" />
                  </div>
                </template>
              </NDynamicInput>
            </NFormItem>
          </NTabPane>
        </NTabs>
        <NGrid responsive="screen" item-responsive :x-gap="16">
          <NFormItemGi span="24 m:8" label="令牌字段名" path="http_client.token.token_field">
            <NInput v-model:value="model.token.token_field" placeholder="例如：data.access_token" />
          </NFormItemGi>
          <NFormItemGi span="24 m:8" label="过期字段名" path="http_client.token.expire_field">
            <NInput v-model:value="model.token.expire_field" placeholder="例如：data.expires_in" />
          </NFormItemGi>
          <NFormItemGi span="24 m:8" label="过期秒数（秒）" path="http_client.token.expire_seconds">
            <NInputNumber
              v-model:value="model.token.expire_seconds"
              class="w-full"
              :min="1"
              :precision="0"
              placeholder="请输入过期秒数"
            />
          </NFormItemGi>
        </NGrid>
      </template>
    </div>

    <div class="mb-18px rounded-8px border border-#e5e7eb border-solid bg-white px-14px pt-12px shadow-sm">
      <div class="mb-12px flex items-center justify-between border-b border-#f0f0f0 border-b-solid pb-10px">
        <div class="text-14px text-#1f2937 font-600">设备行为路由</div>
        <div class="flex items-center gap-8px">
          <span class="text-14px text-#1f2937">支持指令下发</span>
          <NSwitch v-model:value="model.is_support_send">
            <template #checked>是</template>
            <template #unchecked>否</template>
          </NSwitch>
        </div>
      </div>
      <NTabs v-model:value="activeRouteTab" type="segment" animated>
        <NTabPane name="poll" tab="轮询拉取">
          <div class="pt-12px">
            <NGrid responsive="screen" item-responsive :x-gap="16">
              <NFormItemGi span="24" label="请求方法与路径" path="http_client.poll_route.path" :rule="routeGroupRule">
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
              <NFormItemGi span="24 m:12" label="内容类型" path="http_client.poll_route.content_type">
                <NSelect v-model:value="model.poll_route.content_type" :options="contentTypeOptions" />
              </NFormItemGi>
              <NFormItemGi span="24 m:12" label="轮询间隔（秒）" path="http_client.poll_interval">
                <NInputNumber
                  v-model:value="model.poll_interval"
                  class="w-full"
                  :min="5"
                  :precision="0"
                  placeholder="请输入轮询间隔（秒）"
                />
              </NFormItemGi>
              <NFormItemGi span="24 m:4" label="携带认证" path="http_client.poll_route.with_auth">
                <NSwitch v-model:value="model.poll_route.with_auth">
                  <template #checked>是</template>
                  <template #unchecked>否</template>
                </NSwitch>
              </NFormItemGi>
              <NFormItemGi span="24 m:10" label="令牌位置" path="http_client.poll_route.token_placement">
                <NSelect
                  v-model:value="model.poll_route.token_placement"
                  :options="tokenPlacementOptions"
                  :disabled="!model.poll_route.with_auth"
                  placeholder="请选择令牌位置"
                />
              </NFormItemGi>
              <NFormItemGi
                span="24 m:10"
                label="令牌字段名"
                path="http_client.poll_route.token_key"
                :rule="pollTokenKeyRule"
              >
                <NInput
                  v-model:value="model.poll_route.token_key"
                  :disabled="isPollTokenKeyDisabled"
                  placeholder="选择标准认证头时自动填充"
                />
              </NFormItemGi>
            </NGrid>
            <NTabs v-model:value="activePollRequestTab" type="line" animated>
              <NTabPane name="headers" tab="请求头">
                <NFormItem path="http_client.poll_route.headers" :show-label="false">
                  <NDynamicInput
                    v-model:value="model.poll_route.headers"
                    :on-create="createGatewayHttpClientKeyValueRow"
                  >
                    <template #default="{ index }">
                      <div class="w-full flex gap-12px">
                        <NInput v-model:value="model.poll_route.headers[index].key" placeholder="字段名" />
                        <NInput v-model:value="model.poll_route.headers[index].value" placeholder="字段值" />
                      </div>
                    </template>
                  </NDynamicInput>
                </NFormItem>
              </NTabPane>
              <NTabPane v-if="showPollBodyTab" name="body" tab="请求体">
                <NFormItem path="http_client.poll_route.body" :show-label="false">
                  <NDynamicInput v-model:value="model.poll_route.body" :on-create="createGatewayHttpClientKeyValueRow">
                    <template #default="{ index }">
                      <div class="w-full flex gap-12px">
                        <NInput v-model:value="model.poll_route.body[index].key" placeholder="字段名" />
                        <NInput v-model:value="model.poll_route.body[index].value" placeholder="字段值" />
                      </div>
                    </template>
                  </NDynamicInput>
                </NFormItem>
              </NTabPane>
            </NTabs>
          </div>
        </NTabPane>
        <NTabPane name="send" tab="指令下发" :disabled="!model.is_support_send">
          <div class="pt-12px">
            <NGrid responsive="screen" item-responsive :x-gap="16">
              <NFormItemGi span="24" label="请求方法与路径" path="http_client.send_route.path">
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
              <NFormItemGi span="24" label="内容类型" path="http_client.send_route.content_type">
                <NSelect v-model:value="model.send_route.content_type" :options="contentTypeOptions" />
              </NFormItemGi>
              <NFormItemGi span="24 m:4" label="携带认证" path="http_client.send_route.with_auth">
                <NSwitch v-model:value="model.send_route.with_auth">
                  <template #checked>是</template>
                  <template #unchecked>否</template>
                </NSwitch>
              </NFormItemGi>
              <NFormItemGi span="24 m:10" label="令牌位置" path="http_client.send_route.token_placement">
                <NSelect
                  v-model:value="model.send_route.token_placement"
                  :options="tokenPlacementOptions"
                  :disabled="!model.send_route.with_auth"
                  placeholder="请选择令牌位置"
                />
              </NFormItemGi>
              <NFormItemGi
                span="24 m:10"
                label="令牌字段名"
                path="http_client.send_route.token_key"
                :rule="sendTokenKeyRule"
              >
                <NInput
                  v-model:value="model.send_route.token_key"
                  :disabled="isSendTokenKeyDisabled"
                  placeholder="选择标准认证头时自动填充"
                />
              </NFormItemGi>
            </NGrid>

            <NTabs type="line" animated>
              <NTabPane name="headers" tab="请求头">
                <NFormItem path="http_client.send_route.headers" :show-label="false">
                  <NDynamicInput
                    v-model:value="model.send_route.headers"
                    :on-create="createGatewayHttpClientKeyValueRow"
                  >
                    <template #default="{ index }">
                      <div class="w-full flex gap-12px">
                        <NInput v-model:value="model.send_route.headers[index].key" placeholder="字段名" />
                        <NInput v-model:value="model.send_route.headers[index].value" placeholder="字段值" />
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
