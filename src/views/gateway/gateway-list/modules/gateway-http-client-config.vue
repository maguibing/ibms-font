<script setup lang="ts">
import { computed, watch } from 'vue';
import { useFormRules } from '@/hooks/common/form';
import {
  createGatewayHttpClientKeyValueRow,
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

function validateTokenHeaders() {
  if (!model.value.token.is_enable) {
    return true;
  }

  if (model.value.token.headers.some(isIncompleteGatewayHttpClientKeyValueRow)) {
    return new Error('请求头存在未完成项，请补全键和值或删除该行');
  }

  return true;
}

function validateTokenBody() {
  if (!model.value.token.is_enable) {
    return true;
  }

  if (model.value.token.body.some(isIncompleteGatewayHttpClientKeyValueRow)) {
    return new Error('请求体存在未完成项，请补全键和值或删除该行');
  }

  return true;
}

function validateRouteGroup() {
  const pollRoute = getGatewayHttpClientRouteState(model.value.poll_route);
  const sendRoute = getGatewayHttpClientRouteState(model.value.send_route);

  if (pollRoute.incomplete || sendRoute.incomplete) {
    return new Error('轮询拉取/指令下发存在未填完整字段，请补全或清空该组');
  }

  if (!pollRoute.complete && !sendRoute.complete) {
    return new Error('轮询拉取和指令下发至少需要完整填写一组');
  }

  return true;
}

function validateRouteTokenKey(routeKey: 'poll_route' | 'send_route') {
  return () => {
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
        <NFormItem label="令牌请求" path="http_client.token.path" :rule="tokenRequestRule">
          <NInputGroup class="w-full">
            <NSelect
              v-model:value="model.token.method"
              :options="httpMethodSelectOptions"
              :consistent-menu-width="false"
              class="w-110px"
            />
            <NInput v-model:value="model.token.path" placeholder="/api/token" />
          </NInputGroup>
        </NFormItem>
        <NFormItem label="请求头" path="http_client.token.headers" :rule="tokenHeadersRule">
          <NDynamicInput v-model:value="model.token.headers" :on-create="createGatewayHttpClientKeyValueRow">
            <template #default="{ index }">
              <div class="w-full flex gap-12px">
                <NInput v-model:value="model.token.headers[index].key" placeholder="字段名，如 Authorization" />
                <NInput v-model:value="model.token.headers[index].value" placeholder="字段值" />
              </div>
            </template>
          </NDynamicInput>
        </NFormItem>
        <NFormItem label="请求体" path="http_client.token.body" :rule="tokenBodyRule">
          <NDynamicInput v-model:value="model.token.body" :on-create="createGatewayHttpClientKeyValueRow">
            <template #default="{ index }">
              <div class="w-full flex gap-12px">
                <NInput v-model:value="model.token.body[index].key" placeholder="字段名，如 username" />
                <NInput v-model:value="model.token.body[index].value" placeholder="字段值" />
              </div>
            </template>
          </NDynamicInput>
        </NFormItem>
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

    <!-- <NDivider>设备行为路由</NDivider> -->
    <div class="mb-18px flex flex-col gap-12px">
      <div class="rounded-8px border border-#e5e7eb border-solid bg-white px-14px pt-12px shadow-sm">
        <div class="mb-12px flex items-center justify-between gap-12px border-b border-#f0f0f0 border-b-solid pb-10px">
          <div class="text-14px text-#1f2937 font-600">轮询拉取</div>
        </div>
        <NGrid responsive="screen" item-responsive :x-gap="16">
          <NFormItemGi span="24 m:16" label="请求方法与路径" path="http_client.poll_route.path" :rule="routeGroupRule">
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
          <NFormItemGi span="24 m:8" label="轮询间隔（秒）" path="http_client.poll_interval">
            <NInputNumber
              v-model:value="model.poll_interval"
              class="w-full"
              :min="5"
              :precision="0"
              placeholder="请输入轮询间隔（秒）"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:6" label="携带认证" path="http_client.poll_route.with_auth">
            <NSwitch v-model:value="model.poll_route.with_auth">
              <template #checked>是</template>
              <template #unchecked>否</template>
            </NSwitch>
          </NFormItemGi>
          <NFormItemGi span="24 m:9" label="令牌位置" path="http_client.poll_route.token_placement">
            <NSelect
              v-model:value="model.poll_route.token_placement"
              :options="tokenPlacementOptions"
              :disabled="!model.poll_route.with_auth"
              placeholder="请选择令牌位置"
            />
          </NFormItemGi>
          <NFormItemGi
            span="24 m:9"
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
      </div>

      <div class="rounded-8px border border-#e5e7eb border-solid bg-white px-14px pt-12px shadow-sm">
        <div class="mb-12px flex items-center justify-between gap-12px border-b border-#f0f0f0 border-b-solid pb-10px">
          <div class="text-14px text-#1f2937 font-600">指令下发</div>
        </div>
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
          <NFormItemGi span="24 m:6" label="携带认证" path="http_client.send_route.with_auth">
            <NSwitch v-model:value="model.send_route.with_auth">
              <template #checked>是</template>
              <template #unchecked>否</template>
            </NSwitch>
          </NFormItemGi>
          <NFormItemGi span="24 m:9" label="令牌位置" path="http_client.send_route.token_placement">
            <NSelect
              v-model:value="model.send_route.token_placement"
              :options="tokenPlacementOptions"
              :disabled="!model.send_route.with_auth"
              placeholder="请选择令牌位置"
            />
          </NFormItemGi>
          <NFormItemGi
            span="24 m:9"
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
      </div>
    </div>
  </div>
</template>
