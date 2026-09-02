<script setup lang="ts">
import StatusTag from '@/components/custom/status-tag.vue';
import CopyableValue from '@/components/custom/copyable-value.vue';
import ButtonIcon from '@/components/custom/button-icon.vue';
import DataGridCard from '@/components/common/data-grid-card.vue';
import { $t } from '@/locales';
import { GATEWAY_UNKNOWN_STATUS, getGatewayProtocolLabel } from '../shared';

defineOptions({
  name: 'GatewayCard'
});

interface Props {
  gateway: Api.Gateway.Gateway;
  checked: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}

withDefaults(defineProps<Props>(), {
  showEdit: false,
  showDelete: false
});

const emit = defineEmits<{
  'update:checked': [checked: boolean];
  view: [];
  edit: [];
  delete: [];
}>();
</script>

<template>
  <DataGridCard
    :checked="checked"
    clickable
    selectable
    @update:checked="emit('update:checked', $event)"
    @click="emit('view')"
  >
    <template #icon>
      <SvgIcon icon="lucide:router" class="text-34px" />
    </template>

    <NEllipsis class="block text-16px text-[var(--n-text-color)] font-600">{{ gateway.name || '-' }}</NEllipsis>
    <div class="mt-9px min-w-0 flex items-center gap-8px text-13px text-[var(--n-text-color-2)]">
      <span class="shrink-0">标识</span>
      <CopyableValue class="min-w-0 flex-1" :value="gateway.key" @click.stop />
    </div>
    <div class="mt-7px flex items-center gap-8px text-13px text-[var(--n-text-color-2)]">
      <span class="shrink-0">协议</span>
      <NEllipsis>{{ getGatewayProtocolLabel(gateway.protocol_type) }}</NEllipsis>
    </div>
    <div class="mt-7px flex flex-wrap items-center gap-8px text-13px text-[var(--n-text-color-2)]">
      <span class="shrink-0">状态</span>
      <StatusTag
        :value="gateway.status"
        :unknown="GATEWAY_UNKNOWN_STATUS"
        :tag-props="{ size: 'small', bordered: false }"
      />
    </div>

    <template #actions>
      <ButtonIcon
        text
        type="primary"
        icon="material-symbols:visibility-outline"
        tooltip-content="查看"
        @click="emit('view')"
      />
      <ButtonIcon
        v-if="showEdit"
        text
        type="primary"
        icon="material-symbols:drive-file-rename-outline-outline"
        :tooltip-content="$t('common.edit')"
        @click="emit('edit')"
      />
      <ButtonIcon
        v-if="showDelete"
        text
        type="error"
        icon="material-symbols:delete-outline"
        :tooltip-content="$t('common.delete')"
        :popconfirm-content="$t('common.confirmDelete')"
        @positive-click="emit('delete')"
      />
    </template>
  </DataGridCard>
</template>

<style scoped></style>
