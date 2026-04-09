<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import { useLoading } from '@sa/hooks';
import { fetchCreateRole, fetchUpdateRole } from '@/service/api/system/role';
import { fetchGetMenuTrees } from '@/service/api/system';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import MenuTree from '@/components/custom/menu-tree.vue';

defineOptions({
  name: 'RoleOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.System.Role | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const menuTreeRef = ref<InstanceType<typeof MenuTree> | null>(null);

const visible = defineModel<boolean>('visible', {
  default: false
});

const menuOptions = ref<Api.System.MenuList>([]);

const { loading: menuLoading, startLoading: startMenuLoading, endLoading: stopMenuLoading } = useLoading();

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增角色',
    edit: '编辑角色'
  };
  return titles[props.operateType];
});

type Model = Api.System.RoleOperateParams;

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    name: '',
    desc: '',
    menu_id_list: []
  };
}

type RuleKey = Extract<keyof Model, 'name' | 'desc'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  name: createRequiredRule('角色名称不能为空'),
  desc: createRequiredRule('角色描述不能为空')
};

async function handleUpdateModelWhenEdit() {
  menuOptions.value = [];
  model.value = createDefaultModel();
  model.value.menu_id_list = [];

  const { data, error } = await fetchGetMenuTrees({ p_type: 1, menu_type_list: [1, 2, 3, 4] });
  if (error) return;
  // menuOptions.value = data;
  console.log(data);

  if (props.operateType === 'add') {
    menuTreeRef.value?.refresh();
  }

  // if (props.operateType === 'edit' && props.rowData) {
  //   startMenuLoading();
  //   Object.assign(model.value, jsonClone(props.rowData));
  //   const { data, error } = await fetchGetRoleMenuTreeSelect(model.value.id!);
  //   if (error) return;
  //   model.value.menu_id_list = data.checkedKeys;
  //   menuOptions.value = data.menus;
  //   stopMenuLoading();
  // }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  const { id, name, desc } = model.value;
  const menu_id_list = menuTreeRef.value?.getCheckedMenuIds();
  // request
  if (props.operateType === 'add') {
    const { error } = await fetchCreateRole({
      name,
      desc,
      menu_id_list
    });
    if (error) return;
    window.$message?.success($t('common.addSuccess'));
  }

  if (props.operateType === 'edit') {
    const { error } = await fetchUpdateRole({
      id,
      name,
      desc,
      menu_id_list
    });
    if (error) return;
    window.$message?.success($t('common.updateSuccess'));
  }

  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModelWhenEdit();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="800" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem label="名称" path="name">
          <NInput v-model:value="model.name" placeholder="请输入名称" />
        </NFormItem>
        <NFormItem label="菜单权限" path="menuIds" class="pr-24px">
          <MenuTree
            v-if="visible"
            ref="menuTreeRef"
            v-model:checked-keys="model.menuIds"
            v-model:options="menuOptions"
            v-model:cascade="model.menuCheckStrictly"
            v-model:loading="menuLoading"
            :immediate="operateType === 'add'"
          />
        </NFormItem>
        <NFormItem label="描述" path="desc">
          <NInput v-model:value="model.desc" :rows="3" type="textarea" placeholder="请输入描述" />
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
