<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import MenuTree from '@/components/custom/menu-tree.vue';
import { fetchAssignPermAuth } from '@/service/api/system/role';
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
const menuOptions = ref<Api.System.MenuTreeOptionList>([]);
const menuLoading = ref(false);
const cascade = ref(true);

const title = computed(() => {
  const roleName = props.rowData?.name?.trim();

  if (roleName) {
    return `${roleName} 菜单权限`;
  }

  return '菜单权限';
});

function getDefaultCheckedKeys() {
  const menuAuth = props.rowData?.perm_auth?.menu_auth;

  if (!menuAuth || menuAuth.has_all) {
    return [];
  }

  return [...menuAuth.menu_id_list];
}

function handleUpdateModelWhenOpen() {
  checkedKeys.value = getDefaultCheckedKeys();
  menuOptions.value = [];
  menuLoading.value = false;
  cascade.value = true;
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
            v-model:options="menuOptions"
            v-model:cascade="cascade"
            v-model:loading="menuLoading"
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
