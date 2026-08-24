<script setup lang="ts">
import { computed, h, shallowRef, useTemplateRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import { NTime } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { fetchGetCorp, fetchGetVersionList } from '@/service/api/corp';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import PhoneReveal from '@/components/business/phone-reveal.vue';
import AddVersionDrawer from './modules/add-version-drawer.vue';
import BindVersionDrawer from './modules/bind-version-drawer.vue';
import RenewalVersionModal from './modules/renewal-version-modal.vue';

defineOptions({
  name: 'CorpDetail'
});

type TagType = 'default' | 'success' | 'warning' | 'error' | 'info';

interface StatusInfo {
  label: string;
  type: TagType;
}

const route = useRoute();
const { routerBack } = useRouterPush();
const { loading, startLoading, endLoading } = useLoading();
const { loading: versionLoading, startLoading: startVersionLoading, endLoading: endVersionLoading } = useLoading();

const detail = shallowRef<Api.System.CorpDetail | null>(null);
const versionList = shallowRef<Api.System.CorpProjectVersion[]>([]);
const addVersionDrawerRef = useTemplateRef<InstanceType<typeof AddVersionDrawer>>('addVersionDrawerRef');
const bindVersionDrawerRef = useTemplateRef<InstanceType<typeof BindVersionDrawer>>('bindVersionDrawerRef');
const renewalModalRef = useTemplateRef<InstanceType<typeof RenewalVersionModal>>('renewalModalRef');

const corpId = computed(() => {
  const rawId = route.query.id ?? 0;
  return rawId;
});

const corp = computed(() => detail.value?.corp ?? null);

const contactUser = computed(() => {
  if (!detail.value || !corp.value) return null;

  return detail.value.base_user_map[String(corp.value.contact_id)] ?? null;
});

const auditStatusMap = computed<Record<number, StatusInfo>>(() => ({
  1: { label: $t('page.corp.common.auditing'), type: 'warning' },
  2: { label: $t('page.corp.common.approved'), type: 'success' },
  3: { label: $t('page.corp.common.rejected'), type: 'error' }
}));

const corpStatusMap = computed<Record<number, StatusInfo>>(() => ({
  1: { label: $t('page.corp.common.enable'), type: 'success' },
  2: { label: $t('page.corp.common.disable'), type: 'default' }
}));

const auditStatus = computed(() => getStatusInfo(auditStatusMap.value, corp.value?.audit_status));
const corpStatus = computed(() => getStatusInfo(corpStatusMap.value, corp.value?.status));

function getStatusInfo(map: Record<number, StatusInfo>, value?: number | null): StatusInfo {
  return (
    map[Number(value)] ?? {
      label: $t('common.unknown'),
      type: 'default'
    }
  );
}

function displayValue(value?: CommonType.IdType | string | number | null) {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

function handleAddVersion() {
  if (!corpId.value) return;

  addVersionDrawerRef.value?.open(Number(corpId.value), corp.value?.name);
}

function handleAddExistingVersion() {
  if (!corpId.value) return;

  bindVersionDrawerRef.value?.open(
    Number(corpId.value),
    versionList.value.map(item => item.id)
  );
}

function handleRenewVersion(id: CommonType.IdType) {
  renewalModalRef.value?.open(id);
}

function handleVersionChanged() {
  if (!corpId.value) return;

  getVersionList(Number(corpId.value));
}

const versionColumns = computed<NaiveUI.TableColumn<Api.System.CorpProjectVersion>[]>(() => [
  {
    key: 'index',
    title: $t('common.index'),
    align: 'center',
    width: 64,
    render: (_, index) => index + 1
  },
  {
    key: 'name',
    title: $t('page.corp.version.name'),
    align: 'center',
    minWidth: 160,
    ellipsis: {
      tooltip: true
    }
  },
  {
    key: 'start_at',
    title: $t('page.corp.version.startTime'),
    align: 'center',
    minWidth: 180,
    render: row => h(NTime, { time: row.start_at, unix: true })
  },
  {
    key: 'end_at',
    title: $t('page.corp.version.endTime'),
    align: 'center',
    minWidth: 180,
    render: row => h(NTime, { time: row.end_at, unix: true })
  },
  {
    key: 'operate',
    title: $t('common.operate'),
    align: 'center',
    width: 100,
    render: row =>
      h(ButtonIcon, {
        text: true,
        type: 'primary',
        icon: 'material-symbols:autorenew-rounded',
        tooltipContent: $t('page.corp.version.renewal'),
        onClick: () => handleRenewVersion(row.id)
      })
  }
]);

async function getCorpDetail(id: CommonType.IdType) {
  startLoading();
  const { data, error } = await fetchGetCorp({ id: Number(id), options: [{ key: 1 }] }).finally(endLoading);

  if (error) return;

  detail.value = data;
}

async function getVersionList(id: CommonType.IdType) {
  startVersionLoading();
  const { data, error } = await fetchGetVersionList({
    corp_id: Number(id),
    list_option: {
      options: [],
      offset: 0,
      limit: 30
    }
  }).finally(endVersionLoading);

  if (error) return;

  versionList.value = data.list ?? [];
}

watch(
  corpId,
  id => {
    detail.value = null;
    versionList.value = [];

    if (!id) return;

    getCorpDetail(Number(id));
    getVersionList(Number(id));
  },
  {
    immediate: true
  }
);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :title="$t('page.corp.detail.title')" :bordered="false" size="small" class="card-wrapper">
      <template #header-extra>
        <ButtonIcon text :tooltip-content="$t('page.corp.common.back')" @click="routerBack">
          <SvgIcon icon="material-symbols:arrow-back-rounded" />
          <span>{{ $t('page.corp.common.back') }}</span>
        </ButtonIcon>
      </template>

      <NSpin :show="loading">
        <NEmpty v-if="!corpId" :description="$t('page.corp.common.message.missingCorpId')" class="py-48px" />
        <NEmpty
          v-else-if="!corp && !loading"
          :description="$t('page.corp.common.message.emptyCorpDetail')"
          class="py-48px"
        />
        <NDescriptions v-else label-placement="left" :column="2" bordered size="small" label-class="min-w-110px">
          <NDescriptionsItem :label="$t('page.corp.common.name')">{{ displayValue(corp?.name) }}</NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.corp.common.useStatus')">
            <NTag :type="corpStatus.type">{{ corpStatus.label }}</NTag>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.corp.common.location')">
            {{ displayValue(corp?.address) }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.corp.common.detailAddress')">
            {{ displayValue(corp?.ad_address) }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.corp.common.contact')">
            {{ displayValue(contactUser?.username) }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.corp.common.contactPhone')">
            <PhoneReveal
              v-if="corp && contactUser"
              :user-id="corp.contact_id"
              :masked-phone="contactUser.phone"
              content-class="justify-start gap-6px"
              button-class="h-24px px-4px text-14px"
            />
            <template v-else>-</template>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.corp.common.email')">
            {{ displayValue(contactUser?.email) }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.corp.common.auditStatus')">
            <NTag :type="auditStatus.type">{{ auditStatus.label }}</NTag>
          </NDescriptionsItem>
        </NDescriptions>
      </NSpin>
    </NCard>

    <NCard :title="$t('page.corp.detail.versionData')" :bordered="false" size="small" class="card-wrapper">
      <template #header-extra>
        <NSpace :size="8">
          <NButton size="small" ghost type="primary" @click="handleAddVersion">
            <template #icon>
              <SvgIcon icon="material-symbols:add-rounded" class="text-icon" />
            </template>
            {{ $t('page.corp.version.addVersion') }}
          </NButton>
          <NButton size="small" ghost type="primary" @click="handleAddExistingVersion">
            <template #icon>
              <SvgIcon icon="material-symbols:playlist-add-rounded" class="text-icon" />
            </template>
            {{ $t('page.corp.version.addExistingVersion') }}
          </NButton>
        </NSpace>
      </template>

      <NSpin :show="versionLoading">
        <DataTable
          :columns="versionColumns"
          :data="versionList"
          :row-key="row => row.id"
          :pagination="false"
          :scroll-x="684"
        />
      </NSpin>
    </NCard>

    <RenewalVersionModal ref="renewalModalRef" @submitted="handleVersionChanged" />
    <AddVersionDrawer ref="addVersionDrawerRef" @submitted="handleVersionChanged" />
    <BindVersionDrawer ref="bindVersionDrawerRef" @submitted="handleVersionChanged" />
  </div>
</template>
