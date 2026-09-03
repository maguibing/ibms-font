<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { jsonClone } from '@sa/utils';
import { fetchCreateNoticeGroup, fetchUpdateNoticeGroup } from '@/service/api/alarm';
import { fetchGetUserList } from '@/service/api/system/user';
import RemoteSearchSelect from '@/components/custom/remote-search-select.vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'NoticeGroupOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Alarm.NoticeGroup | null;
  baseUserMap?: Api.Alarm.NoticeGroupListExtra['base_user_map'];
}

interface Emits {
  (e: 'submitted'): void;
}

const props = withDefaults(defineProps<Props>(), {
  rowData: null,
  baseUserMap: () => ({})
});

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

type Model = Api.Alarm.NoticeGroupOperateParams;
type SelectedUser = Pick<Api.System.User, 'user_id' | 'username' | 'phone'>;

const noticeTypeOptions: CommonType.Option<Api.Alarm.NoticeGroupNoticeType>[] = [
  { label: $t('alarmNoticeGroup.member'), value: 1 }
];

const noticeWayOptions: CommonType.Option<Api.Alarm.NoticeWay>[] = [
  { label: $t('alarmNoticeGroup.inApp'), value: 2 }
  // { label: '短信', value: 1 },
  // { label: 'App 通知', value: 3 }
];

const userRequestParams: CommonType.CommonListQueryParams = {
  list_option: {
    options: [{ type: 104, value: '101' }],
    offset: 0,
    limit: 10
  }
};

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading, startLoading, endLoading } = useLoading();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('alarmNoticeGroup.add'),
    edit: $t('alarmNoticeGroup.edit')
  };

  return titles[props.operateType];
});

const model = ref<Model>(createDefaultModel());
const selectedUsers = shallowRef<SelectedUser[]>([]);

const rules: Record<string, App.Global.FormRule> = {
  name: createRequiredRule($t('alarmNoticeGroup.namePlaceholder')),
  'notice.notice_type': createRequiredRule($t('alarmNoticeGroup.typePlaceholder')),
  'notice.user.user_id_list': createRequiredRule($t('alarmNoticeGroup.receiverPlaceholder')),
  'notice.user.notice_way_list': createRequiredRule($t('alarmNoticeGroup.wayPlaceholder'))
};

function createDefaultNotice(): Api.Alarm.NoticeGroupNotice {
  return {
    notice_type: 1,
    user: {
      user_id_list: [],
      notice_way_list: [2]
    },
    group_bot: {}
  };
}

function createDefaultModel(): Model {
  return {
    id: null,
    desc: '',
    name: '',
    notice: createDefaultNotice()
  };
}

function getSelectedUserOptions(userIdList: CommonType.IdType[]) {
  return userIdList.map(userId => {
    const user = props.baseUserMap[String(userId)];

    return {
      user_id: Number(userId),
      username: user?.username || String(userId),
      phone: user?.phone || ''
    };
  });
}

function syncModelFromRow(row: Api.Alarm.NoticeGroup) {
  const notice = row.notice || createDefaultNotice();
  const userIdList = jsonClone(notice.user?.user_id_list ?? []);

  model.value = {
    id: row.id,
    desc: row.desc || '',
    name: row.name || '',
    notice: {
      notice_type: notice.notice_type || row.notice_type || 1,
      user: {
        user_id_list: userIdList,
        notice_way_list: jsonClone(notice.user?.notice_way_list ?? [2])
      },
      group_bot: jsonClone(notice.group_bot ?? {})
    }
  };
  selectedUsers.value = getSelectedUserOptions(userIdList);
}

function handleUpdateModel() {
  model.value = createDefaultModel();
  selectedUsers.value = [];

  if (props.operateType === 'edit' && props.rowData) {
    syncModelFromRow(props.rowData);
  }
}

function closeDrawer() {
  visible.value = false;
}

function syncNoticeType(value: Api.Alarm.NoticeGroupNoticeType) {
  model.value.notice.notice_type = value;
}

function fetchUserList(params: Record<string, any>) {
  return fetchGetUserList(params as CommonType.CommonListQueryParams);
}

function buildSubmitParams(): Api.Alarm.NoticeGroupCreateParams {
  const noticeType = model.value.notice.notice_type;

  return {
    desc: model.value.desc,
    name: model.value.name,
    notice: {
      notice_type: noticeType,
      user: {
        user_id_list: model.value.notice.user.user_id_list,
        notice_way_list: model.value.notice.user.notice_way_list
      },
      group_bot: model.value.notice.group_bot
    }
  };
}

async function handleSubmit() {
  if (loading.value) return;

  startLoading();
  try {
    await validate();

    const params = buildSubmitParams();
    const { error } =
      props.operateType === 'edit'
        ? await fetchUpdateNoticeGroup({ ...params, id: model.value.id as CommonType.IdType })
        : await fetchCreateNoticeGroup(params);
    if (error) return;

    window.$message?.success(props.operateType === 'edit' ? $t('common.updateSuccess') : $t('common.addSuccess'));
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
  <NDrawer v-model:show="visible" display-directive="show" :width="560" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
        <NFormItem :label="$t('alarmNoticeGroup.name')" path="name">
          <NInput
            v-model:value="model.name"
            maxlength="30"
            show-count
            :placeholder="$t('alarmNoticeGroup.namePlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('alarmNoticeGroup.type')" path="notice.notice_type">
          <NRadioGroup :value="model.notice.notice_type" @update:value="syncNoticeType">
            <NSpace>
              <NRadio v-for="item in noticeTypeOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </NRadio>
            </NSpace>
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('alarmNoticeGroup.receiver')" path="notice.user.user_id_list">
          <RemoteSearchSelect
            v-model:value="model.notice.user.user_id_list"
            :request="fetchUserList"
            :request-params="userRequestParams"
            :search-type="1"
            :selected-options="selectedUsers"
            label-field="username"
            value-field="user_id"
            multiple
            clearable
            :placeholder="$t('alarmNoticeGroup.receiverPlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('alarmNoticeGroup.way')" path="notice.user.notice_way_list">
          <NCheckboxGroup v-model:value="model.notice.user.notice_way_list">
            <NSpace>
              <NCheckbox v-for="item in noticeWayOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </NCheckbox>
            </NSpace>
          </NCheckboxGroup>
        </NFormItem>
        <NFormItem :label="$t('alarmNoticeGroup.description')" path="desc">
          <NInput
            v-model:value="model.desc"
            type="textarea"
            maxlength="200"
            show-count
            :rows="4"
            :placeholder="$t('alarmNoticeGroup.descriptionPlaceholder')"
          />
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
