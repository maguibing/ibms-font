<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import MenuTree from '@/components/custom/menu-tree.vue';
import { menuNodeType, menuPlatformType } from '@/constants/business';
import { fetchAssignPermAuth, fetchGetRole } from '@/service/api/system/role';
import { $t } from '@/locales';

defineOptions({
  name: 'RolePermissionsDrawer'
});

interface Props {
  /** the edit row data */
  rowData?: Api.System.Role | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const menuTreeRef = ref<InstanceType<typeof MenuTree> | null>(null);
const checkedKeys = ref<CommonType.IdType[]>([]);
const menuLoading = ref(false);
const cascade = ref(false);
const menuTreeRequestParams = {
  menu_type_list: [menuNodeType.catalog, menuNodeType.menu, menuNodeType.button, menuNodeType.extLink],
  p_type: menuPlatformType.operation
};

const title = computed(() => {
  const roleName = props.rowData?.name?.trim();

  if (roleName) {
    return `${roleName} 菜单权限`;
  }

  return '菜单权限';
});

function getDefaultCheckedKeys(role?: Api.System.Role | null) {
  const menuAuth = role?.perm_auth?.menu_auth;

  if (!menuAuth || menuAuth.has_all) {
    return [];
  }

  return [...menuAuth.menu_id_list];
}

async function handleUpdateModelWhenOpen() {
  checkedKeys.value = [];
  const roleId = props.rowData?.id;

  cascade.value = false;

  if (roleId === undefined || roleId === null) {
    menuLoading.value = false;
    return;
  }

  menuLoading.value = true;
  const { error, data } = await fetchGetRole({ id: roleId });
  if (error) {
    menuLoading.value = false;
    return;
  }

  if (visible.value && props.rowData?.id === roleId) {
    checkedKeys.value = getDefaultCheckedKeys(data.role);
  }

  menuLoading.value = false;
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  const menuIds = menuTreeRef.value?.getCheckedMenuIds() ?? checkedKeys.value;

  const { error } = await fetchAssignPermAuth({ role_id: props.rowData?.id ?? 0, menu_id_list: menuIds });
  if (error) return;

  emit('submitted');
  closeDrawer();
}

watch(visible, newValue => {
  if (newValue) {
    handleUpdateModelWhenOpen();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="800" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm>
        <NFormItem label="菜单权限" class="pr-24px">
          <MenuTree
            v-if="visible"
            ref="menuTreeRef"
            v-model:checked-keys="checkedKeys"
            v-model:cascade="cascade"
            v-model:loading="menuLoading"
            :request-params="menuTreeRequestParams"
            :show-button-menus="true"
            :immediate="true"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
