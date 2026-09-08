<template>
  <!-- ===== Dialog ===== -->
  <v-dialog v-model="visible" :max-width="dialogMaxWidth" @update:model-value="handleClose">
    <v-card :style="{ '--dialog-scale': scale }">
      <!-- 标题栏 -->
      <v-card-title class="d-flex align-center justify-space-between">
        {{ title }}
        <v-btn icon="mdi-close" variant="text" density="compact" size="small" @click="handleClose" />
      </v-card-title>
      <v-card-subtitle>
        <v-divider color="primary" opacity=".7" gradient><span class="text-caption text-grey" style="flex-shrink: 0;">推送时间：{{ pushTime || '-' }}</span></v-divider>
      </v-card-subtitle>

      <!-- 内容：Markdown 渲染 -->
      <v-card-text>        
        <div class="detail-panel">
          <component
            :is="MarkdownPreview"
            :text="content"
            :key="configStore.article_detail?.theme"
            :class="themeStore.isDark ? 'user-dark' : 'user-light'"
            @copy-code-success="handleCopySuccess"
          />
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed, defineAsyncComponent } from 'vue'
import { useDisplay } from 'vuetify'
import { useDialogFontScale } from '@/composables/useDialogFontScale'
import { createMarkdownPreview } from '@/utils/markdown-config'
import { useThemeStore } from '@/store/theme'
import { useConfigStore } from '@/store/config'

// ============================================================
// 数据
// ============================================================
const display = useDisplay()
const scale = useDialogFontScale()
const visible = ref(false)
const configStore = useConfigStore()
const themeStore = useThemeStore()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '公告消息' },
  content: { type: String, default: '' },
  pushTime: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

// ============================================================
// 响应式 max-width
// ============================================================
const dialogMaxWidth = computed(() => display.mobile.value ? '85%' : 600)

// ============================================================
// Markdown 预览组件（跟随主题）
// ============================================================
const MarkdownPreview = computed(() => {
  const currentThem = configStore.getArticleTheme()
  return defineAsyncComponent(() => createMarkdownPreview(currentThem))
})

// ============================================================
// v-model 双向同步
// ============================================================
watch(() => props.modelValue, (val) => { visible.value = val })
watch(visible, (val) => { emit('update:modelValue', val) })

// ============================================================
// 事件处理
// ============================================================
const handleClose = () => { visible.value = false }

const handleCopySuccess = () => {
  const copyButtons = document.querySelectorAll('.v-md-copy-code-btn')
  copyButtons.forEach(btn => {
    btn.classList.add('copied')
    setTimeout(() => {
      btn.classList.remove('copied')
    }, 1500)
  })
}
</script>

<style scoped lang="scss">
// ============================================================
// vuepress 主题：深色背景
// ============================================================
:deep(.v-md-editor-preview.user-dark .vuepress-markdown-body) {
  background: var(--v-theme-surface);
  color: #fff;
  code:not(pre code) {
    background-color: rgb(var(--v-theme-surface-variant), 0.7) !important;
    color: rgb(var(--v-theme-on-primary)) !important;
  }
}

// ============================================================
// vuepress 主题：浅色背景
// ============================================================
:deep(.v-md-editor-preview.user-light .vuepress-markdown-body) {
  background: var(--v-theme-surface);
  color: #000;
  code:not(pre code) {
    background-color: rgb(var(--v-theme-surface-variant), 0.7) !important;
    color: rgb(var(--v-theme-on-primary)) !important;
  }
}

// ============================================================
// github 主题：浅色背景
// ============================================================
:deep(.v-md-editor-preview.user-light .github-markdown-body) {
  code:not(pre code) {
    background-color: rgb(var(--v-theme-surface-variant), 0.7) !important;
    color: rgb(var(--v-theme-primary)) !important;
  }
}

// ============================================================
// github 主题：深色背景适配（代码块/行号/表格/行内代码/语法高亮）
// ============================================================
:deep(.v-md-editor-preview.user-dark .github-markdown-body) {
  // 行内代码 `xxx`
  code:not(pre code) {
    background-color: rgb(var(--v-theme-surface-variant)) !important;
    color: rgb(var(--v-theme-on-surface-variant)) !important;
  }

  // 表格：背景、文字、边框
  table {
    tr {
      background-color: rgb(var(--v-theme-surface)) !important;
      color: rgb(var(--v-theme-on-surface));
      border-top-color: rgb(var(--v-theme-on-surface), 0.15);
    }
    tr:nth-child(2n) {
      background-color: rgb(var(--v-theme-surface-variant)) !important;
    }
    th, td {
      border-color: rgb(var(--v-theme-on-surface), 0.15);
    }
  }

  // 代码块：容器背景
  div[class*=v-md-pre-wrapper-] {
    background-color: rgb(var(--v-theme-surface-variant)) !important;
  }
  // 代码块：普通文字
  pre code {
    color: rgb(var(--v-theme-on-surface)) !important;
  }

  // 行号：背景 + 文字
  div[class*=v-md-pre-wrapper-].line-numbers-mode:after {
    background-color: rgb(var(--v-theme-surface)) !important;
    border-right-color: rgb(var(--v-theme-on-surface), 0.15);
  }
  div[class*=v-md-pre-wrapper-].line-numbers-mode .line-numbers-wrapper {
    color: rgb(var(--v-theme-on-surface-variant)) !important;
  }

  // 语法高亮：深色下改用 github-dark 亮色配色，关键词保持正文色不额外高亮
  .hljs {
    color: rgb(var(--v-theme-on-surface));
  }
  .hljs-keyword, .hljs-selector-tag, .hljs-subst {
    color: rgb(var(--v-theme-on-surface));
    font-weight: 700;
  }
  .hljs-comment, .hljs-quote, .hljs-meta {
    color: #8b949e;
  }
  .hljs-doctag, .hljs-string {
    color: #a5d6ff;
  }
  .hljs-title, .hljs-section, .hljs-selector-id, .hljs-class .hljs-title, .hljs-type {
    color: #d2a8ff;
    font-weight: 700;
  }
  .hljs-literal, .hljs-number, .hljs-variable, .hljs-template-variable {
    color: #79c0ff;
  }
  .hljs-attribute, .hljs-name, .hljs-tag {
    color: #7ee787;
  }
  .hljs-link, .hljs-regexp {
    color: #a5d6ff;
  }
  .hljs-bullet, .hljs-symbol {
    color: #f2cc60;
  }
  .hljs-built_in, .hljs-builtin-name {
    color: #ffa657;
  }
  .hljs-deletion {
    background: rgba(255, 123, 114, 0.2);
  }
  .hljs-addition {
    background: rgba(126, 231, 135, 0.2);
  }
}

// ============================================================
// 代码块复制按钮
// ============================================================
:deep(.v-md-copy-code-btn) {
  background-color: rgb(var(--v-theme-primary), 0.7) !important;
}

:deep(.v-md-copy-code-btn.copied svg) {
  display: none;
}

:deep(.v-md-copy-code-btn.copied::after) {
  content: "";
  position: absolute;
  left: 50%;
  top: 45%;
  width: 8px;
  height: 14px;
  border-right: 2.5px solid rgb(var(--v-theme-on-primary));
  border-bottom: 2.5px solid rgb(var(--v-theme-on-primary));
  transform: translate(-50%, -50%) rotate(45deg);
  border-radius: 1px;
}

// ============================================================
// 公告图片样式
// ============================================================
:deep(.v-md-editor-preview img){
    display: block !important;
    width: 350px;
    margin: auto !important;
}

.detail-panel {
  :deep(.github-markdown-body),
  :deep(.vuepress-markdown-body) {
    padding: 0 !important;
  }
}

// ============================================================
// 移动端字号缩放
// ============================================================
.v-card {
  --dialog-scale: 1;

  :deep(.v-card-title) {
    font-size: calc(1rem * var(--dialog-scale)) !important;
  }

  .text-caption {
    font-size: calc(0.75rem * var(--dialog-scale)) !important;
  }

  :deep(.detail-panel) {
    font-size: calc(1rem * var(--dialog-scale));
  }
}
</style>

<style lang="scss">
// ============================================================
// 背景暗化
// ============================================================
.v-overlay__scrim {
  opacity: 0.6 !important;
}
</style>
