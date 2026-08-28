<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { SelectOption } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import {
  fetchGetSwitchCorpList,
  fetchGetSwitchProjectList,
  fetchSelectCorp,
  fetchSelectProject
} from '@/service/api/auth';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';
import { useTabStore } from '@/store/modules/tab';
import { useRouterPush } from '@/hooks/common/router';
import { localStg } from '@/utils/storage';

defineOptions({
  name: 'BusinessSwitchSelect'
});

type BusinessSwitchOption = SelectOption & {
  /** SelectCorp/SelectProject 都需要提交对应用户 */
  userId: CommonType.IdType;
  value: CommonType.IdType;
};

const appStore = useAppStore();
const authStore = useAuthStore();
const { clearTabs } = useTabStore();
const { toHome } = useRouterPush();

const scene = import.meta.env.VITE_APP_SCENE;
const isCpScene = scene === 'cp';
const isPjScene = scene === 'pj';
const selectedId = ref<CommonType.IdType | null>(getStoredSelectedId());
const lastSelected = ref<CommonType.IdType | null>(selectedId.value);
const options = ref<BusinessSwitchOption[]>([]);
const { loading, startLoading, endLoading } = useLoading();

/** 仅 cp/pj 场景需要显示业务切换 */
const showSwitchSelect = computed(() => {
  return (isCpScene || isPjScene) && options.value.length > 0;
});

/** 当前场景的占位文案 */
const placeholder = computed(() => {
  return isCpScene ? '请选择集成商' : '请选择项目';
});

function getStoredSelectedId() {
  if (isCpScene) return localStg.get('corp')?.corp_id ?? null;
  if (isPjScene) return localStg.get('project')?.id ?? null;

  return null;
}

/** cp 场景禁用原因 */
function getDisabledReason(item: Api.Auth.CorpLoginItem) {
  const { corp, user } = item;

  if ((corp.audit_status === 2 && corp.status === 2) || corp.audit_status === 3) return '该集成商已停用';
  if (user.status === 2) return '用户已停用';
  if (!user.role_id) return '用户无权限';

  return '';
}

/** 切换后清理页面状态并刷新 */
async function closeAndRefresh(id: CommonType.IdType) {
  lastSelected.value = id;

  window.$message?.success(isCpScene ? '切换集成商成功' : '切换项目成功');
  await clearTabs([], true);
  await toHome();
  appStore.reloadPage(500);
}

/** 写入切换后返回的新 token */
function updateToken(data: Api.Auth.LoginToken) {
  const accessToken = data.access_token!;

  localStg.set('token', accessToken);
  localStg.set('refreshToken', data.refresh_token!);
  authStore.token = accessToken;
}

/** 按当前场景提交业务切换 */
async function handleChangeSelected(id: CommonType.IdType | null) {
  if (!id) return;
  if (lastSelected.value === id) return;

  const loginToken = localStg.get('loginToken');
  if (!loginToken) {
    selectedId.value = lastSelected.value;
    window.$message?.warning('登录令牌已失效，请重新登录');
    return;
  }

  const option = options.value.find(item => item.value === id);
  const { data, error } = isCpScene
    ? await fetchSelectCorp({
        corp_id: Number(id),
        login_token: loginToken,
        user_id: Number(option?.userId)
      })
    : await fetchSelectProject({
        login_token: loginToken,
        project_id: Number(id),
        user_id: Number(option?.userId)
      });
  if (error) {
    selectedId.value = lastSelected.value;
    return;
  }

  updateToken(data);
  await authStore.initUserInfo();
  await closeAndRefresh(id);
}

/** 按场景加载可切换列表 */
async function handleFetchList() {
  if (!isCpScene && !isPjScene) return;

  startLoading();

  try {
    if (isCpScene) {
      await handleFetchCorpList();
      return;
    }

    await handleFetchProjectList();
  } finally {
    endLoading();
  }
}

async function handleFetchCorpList() {
  const { data, error } = await fetchGetSwitchCorpList();
  if (error) return;

  options.value = data.corp_list.map(item => {
    const disabledReason = getDisabledReason(item);

    return {
      label: disabledReason ? `${item.corp.name}（${disabledReason}）` : item.corp.name,
      value: item.corp.corp_id,
      userId: item.user.user_id,
      disabled: Boolean(disabledReason)
    };
  });
}

async function handleFetchProjectList() {
  const { data, error } = await fetchGetSwitchProjectList();
  if (error) return;

  options.value = data.project_list.map(project => ({
    label: project.name,
    value: project.id,
    userId: project.user_id,
    disabled: !project.can_use
  }));
}

onMounted(handleFetchList);
</script>

<template>
  <NSelect
    v-if="showSwitchSelect"
    v-model:value="selectedId"
    class="mr-8px w-210px"
    :placeholder="placeholder"
    :options="options"
    :loading="loading"
    @update:value="handleChangeSelected"
  />
</template>
