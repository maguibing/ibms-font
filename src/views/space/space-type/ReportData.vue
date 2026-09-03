<script lang="ts" setup>
import type { FUniver, Univer } from '@univerjs/presets';
import type { IDisposable } from '@univerjs/core';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN';
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
import '@univerjs/preset-sheets-core/lib/index.css';

const themeStore = useThemeStore();
const container = ref<HTMLElement | null>(null);
const selectedCell = ref('A1');
const selectedRange = ref('A1');
const selectedSheet = ref('Sheet1');
const selectedValue = ref('');
const saveStatus = ref($t('spaceType.unsaved'));

let univerInstance: Univer | null = null;
let univerAPIInstance: FUniver | null = null;
let selectionDisposable: IDisposable | null = null;

function syncSelection() {
  const workbook = univerAPIInstance?.getActiveWorkbook();
  const sheet = workbook?.getActiveSheet();
  const activeCell = sheet?.getActiveCell();
  const activeRange = sheet?.getActiveRange();

  if (!sheet || !activeCell || !activeRange) return;

  selectedSheet.value = sheet.getSheetName();
  selectedCell.value = activeCell.getA1Notation();
  selectedRange.value = activeRange.getA1Notation();
  selectedValue.value = String(activeCell.getValue() ?? '');
}

function updateSelectedCell() {
  const workbook = univerAPIInstance?.getActiveWorkbook();
  const sheet = workbook?.getActiveSheet();
  if (!sheet) return;

  sheet.getRange(selectedCell.value).setValue(selectedValue.value);
  saveStatus.value = $t('spaceType.unsavedChanges');
}

function saveWorkbook() {
  const snapshot = univerAPIInstance?.getActiveWorkbook()?.save();
  if (!snapshot) return;
  console.log(snapshot);
  // localStorage.setItem('space-type-workbook', JSON.stringify(snapshot));
  // saveStatus.value = `已保存 ${new Date().toLocaleTimeString()}`;
}

function exportWorkbook() {
  const snapshot = univerAPIInstance?.getActiveWorkbook()?.save();
  if (!snapshot) return;

  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `space-workbook-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

onMounted(() => {
  const { univer, univerAPI } = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: mergeLocales(UniverPresetSheetsCoreZhCN)
    },
    darkMode: themeStore.darkMode,
    presets: [
      UniverSheetsCorePreset({
        container: container.value as HTMLElement
      })
    ]
  });

  univerAPI.createWorkbook({});

  univerInstance = univer;
  univerAPIInstance = univerAPI;
  const workbook = univerAPI.getActiveWorkbook();
  selectionDisposable = workbook?.onSelectionChange(syncSelection) ?? null;
  syncSelection();
});

watch(
  () => themeStore.darkMode,
  darkMode => univerAPIInstance?.toggleDarkMode(darkMode)
);

onBeforeUnmount(() => {
  univerInstance?.dispose();
  univerAPIInstance?.dispose();
  selectionDisposable?.dispose();
  univerInstance = null;
  univerAPIInstance = null;
  selectionDisposable = null;
});
</script>

<template>
  <div
    class="space-type-page flex h-[calc(100vh-112px)] min-h-0 w-full flex-col overflow-hidden bg-[#f5f7fa] dark:bg-[#17191c]"
  >
    <header
      class="flex h-56px shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-white px-20px dark:border-[#30343b] dark:bg-[#202328]"
    >
      <div class="flex items-center gap-12px">
        <div class="h-28px w-4px rounded-2px bg-[#18a058]" />
        <div>
          <div class="text-16px font-semibold text-[#1f2937] dark:text-[#f3f4f6]">{{ $t('spaceType.config') }}</div>
          <div class="text-12px text-[#8b95a5]">{{ $t('spaceType.configDescription') }}</div>
        </div>
      </div>
      <div class="flex items-center gap-10px">
        <span class="mr-4px text-12px text-[#8b95a5]">{{ saveStatus }}</span>
        <NButton secondary size="small" @click="saveWorkbook">
          <template #icon><icon-ic-round-save class="text-16px" /></template>
          {{ $t('spaceType.save') }}
        </NButton>
        <NButton type="primary" size="small" @click="exportWorkbook">
          <template #icon><icon-ic-round-download class="text-16px" /></template>
          {{ $t('spaceType.export') }}
        </NButton>
      </div>
    </header>

    <div class="flex min-h-0 flex-1 gap-12px p-12px">
      <main
        class="min-w-0 flex-1 overflow-hidden rounded-6px border border-[#e5e7eb] bg-white dark:border-[#30343b] dark:bg-[#202328]"
      >
        <div ref="container" class="univer-container h-full min-h-0 w-full" />
      </main>
      <aside
        class="w-280px shrink-0 overflow-y-auto rounded-6px border border-[#e5e7eb] bg-white p-16px dark:border-[#30343b] dark:bg-[#202328]"
      >
        <div class="mb-18px flex items-center justify-between">
          <div class="text-15px font-semibold text-[#1f2937] dark:text-[#f3f4f6]">{{ $t('spaceType.dataConfig') }}</div>
          <span class="rounded-4px bg-[#e8f7ee] px-8px py-3px text-12px text-[#18a058] dark:bg-[#173b29]">
            {{ $t('spaceType.selected') }}
          </span>
        </div>

        <div class="mb-14px grid grid-cols-2 gap-8px">
          <div class="rounded-4px bg-[#f7f8fa] p-10px dark:bg-[#292d33]">
            <div class="mb-4px text-11px text-[#8b95a5]">{{ $t('spaceType.sheet') }}</div>
            <div class="truncate text-13px font-medium text-[#374151] dark:text-[#e5e7eb]">{{ selectedSheet }}</div>
          </div>
          <div class="rounded-4px bg-[#f7f8fa] p-10px dark:bg-[#292d33]">
            <div class="mb-4px text-11px text-[#8b95a5]">{{ $t('spaceType.cell') }}</div>
            <div class="text-13px font-semibold text-[#18a058]">{{ selectedCell }}</div>
          </div>
        </div>

        <div class="mb-16px">
          <div class="mb-7px text-12px font-medium text-[#4b5563] dark:text-[#d1d5db]">
            {{ $t('spaceType.selection') }}
          </div>
          <div
            class="rounded-4px border border-[#e5e7eb] bg-[#fafafa] px-10px py-8px text-13px text-[#374151] dark:border-[#3a4048] dark:bg-[#292d33] dark:text-[#e5e7eb]"
          >
            {{ selectedRange }}
          </div>
        </div>

        <div class="mb-16px">
          <div class="mb-7px text-12px font-medium text-[#4b5563] dark:text-[#d1d5db]">
            {{ $t('spaceType.content') }}
          </div>
          <NInput
            v-model:value="selectedValue"
            type="textarea"
            :rows="4"
            :placeholder="$t('spaceType.contentPlaceholder')"
          />
        </div>
        <NButton type="primary" block @click="updateSelectedCell">
          <template #icon><icon-ic-round-check class="text-16px" /></template>
          {{ $t('spaceType.applyTo', { value: selectedCell }) }}
        </NButton>

        <div
          class="mt-22px border-t border-[#eef0f3] pt-16px text-12px leading-20px text-[#8b95a5] dark:border-[#30343b]"
        >
          {{ $t('spaceType.hint') }}
        </div>
      </aside>
    </div>
  </div>
</template>
