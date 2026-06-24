<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchCreateVersion } from '@/service/api/corp';
import { fetchGetMenuNodeTrees } from '@/service/api/system/menu';
import { menuNodeType, menuPlatformType } from '@/constants/business';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'AddVersionDrawer'
});

interface Emits {
  (e: 'submitted'): void;
}

interface VersionMenuNode {
  id: CommonType.IdType;
  label: string;
  icon?: string;
  menuType?: Api.System.MenuNodeType | number;
  ancestorIds: CommonType.IdType[];
  children?: VersionMenuNode[];
}

interface FormModel {
  name: string;
  desc: string;
  start_at_ms: number | null;
  original_price: number | null;
  discount_price: number | null;
  price_day: number | null;
  price_unit: number;
  device_num: number | null;
  project_user_num: number | null;
  day_msg_num: number | null;
  data_store_day: number | null;
  data_store_unit: number;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading: submitLoading, startLoading: startSubmitLoading, endLoading: endSubmitLoading } = useLoading();
const { loading: menuLoading, startLoading: startMenuLoading, endLoading: endMenuLoading } = useLoading();

const visible = shallowRef(false);
const corpId = shallowRef<CommonType.IdType | null>(null);
const corpName = shallowRef('');
const menuGroups = ref<VersionMenuNode[]>([]);
const checkedMenuIds = ref<CommonType.IdType[]>([]);
const formModel = ref<FormModel>(createDefaultModel());

const durationUnitOptions = [
  { label: '日', value: 1 },
  { label: '月', value: 30 },
  { label: '年', value: 365 }
];

type RuleKey = Extract<
  keyof FormModel,
  | 'name'
  | 'start_at_ms'
  | 'original_price'
  | 'discount_price'
  | 'price_day'
  | 'device_num'
  | 'project_user_num'
  | 'day_msg_num'
  | 'data_store_day'
>;

const rules: Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]> = {
  name: [
    createRequiredRule('版本名称不能为空'),
    {
      max: 10,
      message: '版本名称不能超过10个字符',
      trigger: ['input', 'blur']
    }
  ],
  start_at_ms: createRequiredRule('请选择预计开始时间'),
  original_price: createRequiredRule('请输入原价'),
  discount_price: createRequiredRule('请输入折扣价'),
  price_day: createRequiredRule('请输入时长'),
  device_num: createRequiredRule('请输入设备数'),
  project_user_num: createRequiredRule('请输入用户数'),
  day_msg_num: createRequiredRule('请输入日消息数'),
  data_store_day: createRequiredRule('请输入数据存储时长')
};

const menuNodeMap = computed(() => {
  const map = new Map<string, VersionMenuNode>();

  function walk(nodes: VersionMenuNode[]) {
    nodes.forEach(node => {
      map.set(String(node.id), node);
      if (node.children?.length) {
        walk(node.children);
      }
    });
  }

  walk(menuGroups.value);

  return map;
});

const allMenuIds = computed(() => collectMenuIds(menuGroups.value));

const checkedMenuIdSet = computed(() => new Set(checkedMenuIds.value.map(String)));

const isAllChecked = computed(() => {
  return Boolean(allMenuIds.value.length) && allMenuIds.value.every(id => checkedMenuIdSet.value.has(String(id)));
});

function createDefaultModel(): FormModel {
  return {
    name: '',
    desc: '',
    start_at_ms: null,
    original_price: 0,
    discount_price: 0,
    price_day: 1,
    price_unit: 1,
    device_num: 1,
    project_user_num: 1,
    day_msg_num: 1,
    data_store_day: 1,
    data_store_unit: 1
  };
}

function normalizeMenuNode(menu: Api.System.MenuNode, ancestorIds: CommonType.IdType[] = []): VersionMenuNode {
  const id = menu.meta.id;
  const label = menu.meta.title || menu.name || '';
  const nextAncestorIds = [...ancestorIds, id];
  const children = (menu.children || []).map(item => normalizeMenuNode(item, nextAncestorIds));

  return {
    id,
    label,
    icon: menu.meta.icon,
    menuType: menu.meta.menu_type,
    ancestorIds,
    ...(children.length ? { children } : {})
  };
}

function collectMenuIds(nodes: VersionMenuNode[]): CommonType.IdType[] {
  const ids: CommonType.IdType[] = [];

  nodes.forEach(node => {
    ids.push(node.id);

    if (node.children?.length) {
      ids.push(...collectMenuIds(node.children));
    }
  });

  return uniqueIds(ids);
}

function getDisplayMenuItems(nodes: VersionMenuNode[]) {
  const items: VersionMenuNode[] = [];

  nodes.forEach(node => {
    if (node.children?.length) {
      if (node.menuType !== menuNodeType.catalog) {
        items.push(node);
      }

      items.push(...getDisplayMenuItems(node.children));
      return;
    }

    items.push(node);
  });

  return uniqueMenuNodes(items);
}

function uniqueIds(ids: CommonType.IdType[]) {
  const map = new Map<string, CommonType.IdType>();

  ids.forEach(id => {
    map.set(String(id), id);
  });

  return Array.from(map.values());
}

function uniqueMenuNodes(nodes: VersionMenuNode[]) {
  const map = new Map<string, VersionMenuNode>();

  nodes.forEach(node => {
    map.set(String(node.id), node);
  });

  return Array.from(map.values());
}

function resetModel() {
  formModel.value = createDefaultModel();
  menuGroups.value = [];
  checkedMenuIds.value = [];
}

async function getMenuTree() {
  startMenuLoading();
  const { data, error } = await fetchGetMenuNodeTrees({
    p_type: menuPlatformType.integrator,
    menu_type_list: [
      menuNodeType.catalog,
      menuNodeType.menu,
      menuNodeType.button,
      menuNodeType.extLink
    ]
  }).finally(endMenuLoading);

  if (error) return;

  menuGroups.value = (data?.trees || []).map(item => normalizeMenuNode(item));
}

function open(id: CommonType.IdType, name?: string) {
  corpId.value = id;
  corpName.value = name || '';
  resetModel();
  restoreValidation();
  visible.value = true;
  getMenuTree();
}

function close() {
  visible.value = false;
}

function setAllMenus(checked: boolean) {
  checkedMenuIds.value = checked ? [...allMenuIds.value] : [];
}

function isMenuChecked(id: CommonType.IdType) {
  return checkedMenuIdSet.value.has(String(id));
}

function handleMenuChecked(node: VersionMenuNode, checked: boolean) {
  const next = new Map(checkedMenuIds.value.map(id => [String(id), id]));
  const targetIds = collectMenuIds([node]);

  targetIds.forEach(id => {
    if (checked) {
      next.set(String(id), id);
      return;
    }

    next.delete(String(id));
  });

  checkedMenuIds.value = Array.from(next.values());
}

function getSubmitMenuIds() {
  const map = new Map<string, CommonType.IdType>();

  checkedMenuIds.value.forEach(id => {
    const node = menuNodeMap.value.get(String(id));
    const ids = node ? [...node.ancestorIds, node.id] : [id];

    ids.forEach(item => {
      map.set(String(item), item);
    });
  });

  return Array.from(map.values());
}

function getDurationDays(value: number | null, unit: number) {
  return Number(value || 0) * unit;
}

function createSubmitPayload(): Api.System.CreateVersionParams {
  return {
    corp_id: corpId.value as CommonType.IdType,
    desc: formModel.value.desc,
    menu_conf: {
      menu_id_list: getSubmitMenuIds()
    },
    name: formModel.value.name,
    price_conf: {
      day: getDurationDays(formModel.value.price_day, formModel.value.price_unit),
      discount_price: Number(formModel.value.discount_price || 0),
      original_price: Number(formModel.value.original_price || 0)
    },
    resource_conf: {
      data_store_day: getDurationDays(formModel.value.data_store_day, formModel.value.data_store_unit),
      day_msg_num: Number(formModel.value.day_msg_num || 0),
      device_num: Number(formModel.value.device_num || 0),
      project_user_num: Number(formModel.value.project_user_num || 0)
    },
    start_at: Math.floor(Number(formModel.value.start_at_ms || 0) / 1000)
  };
}

async function handleSubmit() {
  if (!corpId.value) return;

  await validate();

  startSubmitLoading();
  const { error } = await fetchCreateVersion(createSubmitPayload()).finally(endSubmitLoading);

  if (error) return;

  window.$message?.success($t('common.addSuccess'));
  close();
  emit('submitted');
}

defineExpose({
  open
});
</script>

<template>
  <NDrawer
    v-model:show="visible"
    title="新增版本"
    display-directive="show"
    :width="980"
    class="max-w-90%"
  >
    <NDrawerContent title="新增版本" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="formModel" :rules="rules">
        <NDivider>基本信息</NDivider>
        <NGrid responsive="screen" item-responsive :x-gap="16">
          <NFormItemGi span="24" label="版本名称" path="name">
            <NInput v-model:value="formModel.name" placeholder="请输入版本名称" :maxlength="10" show-count />
          </NFormItemGi>
          <NFormItemGi span="24" label="版本简介">
            <NInput
              v-model:value="formModel.desc"
              type="textarea"
              placeholder="请输入版本简介"
              :maxlength="100"
              show-count
              :autosize="{ minRows: 3, maxRows: 5 }"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="集成商">
            <NInput :value="corpName" disabled placeholder="当前集成商" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="预计开始时间" path="start_at_ms">
            <NDatePicker
              v-model:value="formModel.start_at_ms"
              type="datetime"
              clearable
              class="w-full"
              placeholder="请选择预计开始时间"
            />
          </NFormItemGi>
        </NGrid>

        <NDivider>价格配置</NDivider>
        <NGrid responsive="screen" item-responsive :x-gap="16">
          <NFormItemGi span="24 m:8" label="原价" path="original_price">
            <NInputNumber
              v-model:value="formModel.original_price"
              :min="0"
              :precision="2"
              button-placement="both"
              class="w-full"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:8" label="折扣价" path="discount_price">
            <NInputNumber
              v-model:value="formModel.discount_price"
              :min="0"
              :precision="2"
              button-placement="both"
              class="w-full"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:8" label="时长" path="price_day">
            <NInputGroup class="w-full">
              <NInputNumber
                v-model:value="formModel.price_day"
                :min="1"
                :precision="0"
                button-placement="both"
                class="flex-1"
              />
              <NSelect
                v-model:value="formModel.price_unit"
                :options="durationUnitOptions"
                :consistent-menu-width="false"
                class="w-92px"
              />
            </NInputGroup>
          </NFormItemGi>
        </NGrid>

        <NDivider>资源配置</NDivider>
        <NGrid responsive="screen" item-responsive :x-gap="16">
          <NFormItemGi span="24 m:12" label="设备数" path="device_num">
            <NInputNumber v-model:value="formModel.device_num" :min="0" :precision="0" class="w-full" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="用户数" path="project_user_num">
            <NInputNumber v-model:value="formModel.project_user_num" :min="0" :precision="0" class="w-full" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="日消息数" path="day_msg_num">
            <NInputNumber v-model:value="formModel.day_msg_num" :min="0" :precision="0" class="w-full" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="数据存储时长" path="data_store_day">
            <NInputGroup class="w-full">
              <NInputNumber
                v-model:value="formModel.data_store_day"
                :min="1"
                :precision="0"
                button-placement="both"
                class="flex-1"
              />
              <NSelect
                v-model:value="formModel.data_store_unit"
                :options="durationUnitOptions"
                :consistent-menu-width="false"
                class="w-92px"
              />
            </NInputGroup>
          </NFormItemGi>
        </NGrid>

        <NDivider>菜单配置</NDivider>
        <NSpin :show="menuLoading">
          <div class="min-h-260px">
            <NSpace :size="16">
              <NButton :type="isAllChecked ? 'primary' : 'default'" ghost @click="setAllMenus(true)">全选</NButton>
              <NButton :type="!checkedMenuIds.length ? 'primary' : 'default'" ghost @click="setAllMenus(false)">
                全不选
              </NButton>
            </NSpace>

            <NEmpty v-if="!menuGroups.length && !menuLoading" description="暂无菜单数据" class="py-48px" />

            <div v-else class="mt-24px flex-col gap-28px">
              <section v-for="group in menuGroups" :key="group.id" class="flex-col gap-12px">
                <h3 class="m-0 text-18px text-base-text font-700">{{ group.label }}</h3>
                <div class="grid grid-cols-1 gap-12px sm:grid-cols-2 lg:grid-cols-3">
                  <button
                    v-for="item in getDisplayMenuItems(group.children?.length ? group.children : [group])"
                    :key="item.id"
                    type="button"
                    class="h-40px flex items-center gap-8px border border-[rgb(var(--border-color))] rounded-4px bg-[rgb(var(--card-color))] px-12px text-left text-base-text transition-colors hover:border-primary"
                    :class="isMenuChecked(item.id) ? 'border-primary text-primary' : ''"
                    @click="handleMenuChecked(item, !isMenuChecked(item.id))"
                  >
                    <NCheckbox
                      :checked="isMenuChecked(item.id)"
                      @click.stop
                      @update:checked="handleMenuChecked(item, $event)"
                    />
                    <span class="truncate font-600">{{ item.label }}</span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </NSpin>
      </NForm>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="close">取消</NButton>
          <NButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
