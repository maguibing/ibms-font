<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { javascript } from '@codemirror/lang-javascript';
import { basicSetup, EditorView } from 'codemirror';
import { useThemeStore } from '@/store/modules/theme';

defineOptions({
  name: 'JsCodeEditor'
});

const props = withDefaults(
  defineProps<{
    readonly?: boolean;
    height?: number;
    label?: string;
    showFormat?: boolean;
    formatParser?: 'babel' | 'json';
  }>(),
  {
    readonly: false,
    height: 320,
    label: '',
    showFormat: true,
    formatParser: 'babel'
  }
);

const value = defineModel<string>('value', { required: true });

const slots = defineSlots<{
  'toolbar-actions'?: () => unknown;
}>();

const themeStore = useThemeStore();
const editorElementRef = ref<HTMLDivElement | null>(null);
const editorViewRef = shallowRef<EditorView | null>(null);
const formatLoading = shallowRef(false);

const editorStyle = computed(() => ({
  height: `${props.height}px`
}));

const showFormatButton = computed(() => props.showFormat && !props.readonly);

const showToolbar = computed(() => Boolean(props.label) || showFormatButton.value || Boolean(slots['toolbar-actions']));

const canFormat = computed(() => showFormatButton.value && Boolean(value.value.trim()));

const formatErrorMessage = computed(() => {
  return props.formatParser === 'json' ? '格式化失败，请检查 JSON 语法' : '脚本格式化失败，请检查 JS 语法';
});

function createEditor() {
  if (!editorElementRef.value) return;

  editorViewRef.value?.destroy();
  editorViewRef.value = new EditorView({
    doc: value.value,
    parent: editorElementRef.value,
    extensions: [
      basicSetup,
      javascript(),
      EditorView.lineWrapping,
      EditorView.editable.of(!props.readonly),
      EditorView.updateListener.of(update => {
        if (!update.docChanged) return;

        value.value = update.state.doc.toString();
      }),
      EditorView.theme(
        {
          '&': {
            height: '100%',
            fontSize: '13px',
            backgroundColor: 'var(--js-code-editor-bg)',
            color: 'var(--js-code-editor-text)'
          },
          '.cm-scroller': {
            height: '100%',
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
          },
          '.cm-line': {
            color: 'var(--js-code-editor-text)'
          },
          '.cm-gutters': {
            backgroundColor: 'var(--js-code-editor-gutter-bg)',
            color: 'var(--js-code-editor-muted)',
            borderRight: '1px solid var(--js-code-editor-border)'
          },
          '.cm-activeLineGutter': {
            color: 'var(--js-code-editor-line-number-active)'
          },
          '.cm-content': {
            color: 'var(--js-code-editor-text)',
            caretColor: 'var(--js-code-editor-cursor)'
          },
          '.cm-cursor': {
            borderLeftColor: 'var(--js-code-editor-cursor)'
          },
          '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
            backgroundColor: 'var(--js-code-editor-selection-bg)'
          },
          '&.cm-focused': {
            outline: 'none'
          },
          '.cm-activeLine, .cm-activeLineGutter': {
            backgroundColor: 'var(--js-code-editor-active-line-bg)'
          },
          '.cm-placeholder': {
            color: 'var(--js-code-editor-muted)'
          },
          '.cm-searchMatch': {
            backgroundColor: 'var(--js-code-editor-search-match-bg)',
            outline: '1px solid var(--js-code-editor-search-match-border)'
          },
          '.cm-searchMatch-selected': {
            backgroundColor: 'var(--js-code-editor-search-match-selected-bg)',
            outline: '1px solid var(--js-code-editor-border-active)'
          },
          '.cm-selectionMatch': {
            backgroundColor: 'var(--js-code-editor-selection-match-bg)'
          },
          '.cm-foldPlaceholder': {
            color: 'var(--js-code-editor-muted)',
            border: '1px solid var(--js-code-editor-border)',
            backgroundColor: 'var(--js-code-editor-control-bg)'
          },
          '.cm-matchingBracket': {
            backgroundColor: 'var(--js-code-editor-bracket-bg)',
            color: 'var(--js-code-editor-text)'
          },
          '.cm-tooltip, .cm-panels': {
            color: 'var(--js-code-editor-text)',
            border: '1px solid var(--js-code-editor-border)',
            backgroundColor: 'var(--js-code-editor-panel-bg)'
          },
          '.cm-button': {
            color: 'var(--js-code-editor-text)',
            border: '1px solid var(--js-code-editor-border)',
            backgroundColor: 'var(--js-code-editor-control-bg)',
            backgroundImage: 'none'
          },
          '.cm-button:hover': {
            backgroundColor: 'var(--js-code-editor-control-hover-bg)'
          },
          '.cm-textfield': {
            color: 'var(--js-code-editor-text)',
            border: '1px solid var(--js-code-editor-border)',
            backgroundColor: 'var(--js-code-editor-control-bg)'
          },
          '.cm-tooltip-autocomplete ul li[aria-selected]': {
            color: 'var(--js-code-editor-selected-text)',
            backgroundColor: 'var(--js-code-editor-selected-bg)'
          },
          '.cm-completionMatchedText': {
            color: 'var(--js-code-editor-border-active)',
            fontWeight: '600'
          },
          '.cm-completionDetail': {
            color: 'var(--js-code-editor-muted)'
          }
        },
        {
          dark: themeStore.darkMode
        }
      )
    ]
  });
}

function syncEditorValue(nextValue: string) {
  const editorView = editorViewRef.value;
  if (!editorView) return;

  const currentValue = editorView.state.doc.toString();
  if (currentValue === nextValue) return;

  editorView.dispatch({
    changes: {
      from: 0,
      to: currentValue.length,
      insert: nextValue
    }
  });
}

async function handleFormat() {
  if (!canFormat.value || formatLoading.value) return;

  formatLoading.value = true;
  try {
    const [{ format }, { default: prettierPluginBabel }, { default: prettierPluginEstree }] = await Promise.all([
      import('prettier/standalone'),
      import('prettier/plugins/babel'),
      import('prettier/plugins/estree')
    ]);

    value.value = await format(value.value, {
      parser: props.formatParser,
      plugins: [prettierPluginBabel, prettierPluginEstree],
      singleQuote: true,
      trailingComma: 'none'
    });
    await nextTick();
    syncEditorValue(value.value);
  } catch {
    window.$message?.warning(formatErrorMessage.value);
  } finally {
    formatLoading.value = false;
  }
}

watch(value, syncEditorValue);

watch([() => props.readonly, () => themeStore.darkMode], () => {
  createEditor();
});

onMounted(createEditor);

onBeforeUnmount(() => {
  editorViewRef.value?.destroy();
});
</script>

<template>
  <div class="js-code-editor" :class="{ 'js-code-editor--readonly': readonly }">
    <div v-if="showToolbar" class="js-code-editor__toolbar">
      <div v-if="label" class="js-code-editor__label">{{ label }}</div>
      <div class="js-code-editor__actions">
        <NButton
          v-if="showFormatButton"
          size="tiny"
          secondary
          :loading="formatLoading"
          :disabled="!canFormat"
          @click="handleFormat"
        >
          格式化
        </NButton>
        <slot name="toolbar-actions" />
      </div>
    </div>
    <div ref="editorElementRef" class="js-code-editor__body" :style="editorStyle" />
  </div>
</template>

<style scoped>
.js-code-editor {
  --js-code-editor-bg: #fbfcff;
  --js-code-editor-toolbar-bg: #f6f8fb;
  --js-code-editor-gutter-bg: #f1f4f8;
  --js-code-editor-panel-bg: #f6f8fb;
  --js-code-editor-control-bg: #ffffff;
  --js-code-editor-control-hover-bg: #eef3fb;
  --js-code-editor-border: #cfd7e6;
  --js-code-editor-border-active: #18a058;
  --js-code-editor-text: #1f2937;
  --js-code-editor-muted: #7b8494;
  --js-code-editor-cursor: #18a058;
  --js-code-editor-line-number-active: #18a058;
  --js-code-editor-selection-bg: rgba(24, 160, 88, 0.18);
  --js-code-editor-selection-match-bg: rgba(24, 160, 88, 0.14);
  --js-code-editor-search-match-bg: rgba(210, 95, 0, 0.18);
  --js-code-editor-search-match-border: rgba(210, 95, 0, 0.3);
  --js-code-editor-search-match-selected-bg: rgba(24, 160, 88, 0.2);
  --js-code-editor-selected-bg: rgba(24, 160, 88, 0.16);
  --js-code-editor-selected-text: #0f172a;
  --js-code-editor-active-line-bg: rgba(24, 160, 88, 0.08);
  --js-code-editor-bracket-bg: rgba(24, 160, 88, 0.16);
  --js-code-editor-focus-shadow: rgba(24, 160, 88, 0.14);

  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid var(--js-code-editor-border);
  border-radius: 8px;
  background-color: var(--js-code-editor-bg);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.js-code-editor:focus-within {
  border-color: var(--js-code-editor-border-active);
  box-shadow: 0 0 0 2px var(--js-code-editor-focus-shadow);
}

.js-code-editor--readonly {
  --js-code-editor-bg: #f7f8fa;
  --js-code-editor-toolbar-bg: #f7f8fa;
  --js-code-editor-gutter-bg: #eef1f5;
  --js-code-editor-panel-bg: #f7f8fa;
  --js-code-editor-control-bg: #f1f3f6;
  --js-code-editor-control-hover-bg: #e8ebf0;
  --js-code-editor-text: #5f6673;
}

.js-code-editor__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--js-code-editor-border);
  background-color: var(--js-code-editor-toolbar-bg);
}

.js-code-editor__label {
  min-width: 0;
  color: var(--js-code-editor-text);
  font-size: 13px;
  font-weight: 600;
}

.js-code-editor__actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
}

.js-code-editor__body {
  overflow: hidden;
  background-color: var(--js-code-editor-bg);
}

html[class='dark'] .js-code-editor {
  --js-code-editor-bg: #18181c;
  --js-code-editor-toolbar-bg: #202126;
  --js-code-editor-gutter-bg: #1b1d22;
  --js-code-editor-panel-bg: #202126;
  --js-code-editor-control-bg: #181a1f;
  --js-code-editor-control-hover-bg: #242833;
  --js-code-editor-border: #343942;
  --js-code-editor-border-active: #36ad6a;
  --js-code-editor-text: #e5e7eb;
  --js-code-editor-muted: #8b93a3;
  --js-code-editor-cursor: #36ad6a;
  --js-code-editor-line-number-active: #7bd88f;
  --js-code-editor-selection-bg: rgba(54, 173, 106, 0.32);
  --js-code-editor-selection-match-bg: rgba(54, 173, 106, 0.18);
  --js-code-editor-search-match-bg: rgba(250, 173, 20, 0.22);
  --js-code-editor-search-match-border: rgba(250, 173, 20, 0.34);
  --js-code-editor-search-match-selected-bg: rgba(54, 173, 106, 0.28);
  --js-code-editor-selected-bg: rgba(54, 173, 106, 0.3);
  --js-code-editor-selected-text: #f5f7fa;
  --js-code-editor-active-line-bg: rgba(54, 173, 106, 0.12);
  --js-code-editor-bracket-bg: rgba(54, 173, 106, 0.2);
  --js-code-editor-focus-shadow: rgba(54, 173, 106, 0.22);
}

html[class='dark'] .js-code-editor--readonly {
  --js-code-editor-bg: #1b1d22;
  --js-code-editor-toolbar-bg: #1b1d22;
  --js-code-editor-gutter-bg: #22252c;
  --js-code-editor-panel-bg: #1b1d22;
  --js-code-editor-control-bg: #20232a;
  --js-code-editor-control-hover-bg: #262a32;
  --js-code-editor-border: #30343d;
  --js-code-editor-text: #aeb6c4;
  --js-code-editor-muted: #7f8898;
}
</style>
