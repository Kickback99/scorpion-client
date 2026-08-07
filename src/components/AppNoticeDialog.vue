<template>
  <!-- ===== Dialog ===== -->
  <v-dialog v-model="visible" max-width="600" @update:model-value="handleClose">
    <v-card>
      <!-- 标题栏 -->
      <v-card-title class="d-flex align-center">
        {{ title }}
      </v-card-title>

      <!-- 内容：Markdown 渲染 -->
      <v-card-text>
        <v-divider color="primary" opacity=".7" gradient><span class="text-caption text-grey" style="flex-shrink: 0;">推送时间：{{ pushTime || '-' }}</span></v-divider>
        <component
          :is="MarkdownPreview"
          :text="content"
          :key="configStore.article_detail?.theme"
          :class="themeStore.isDark ? 'user-dark' : 'user-light'"
          @copy-code-success="handleCopySuccess"
        />
      </v-card-text>

      <!-- 按钮区域 -->
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="flat" @click="handleClose">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { createMarkdownPreview } from '@/utils/markdown-config'
import { useThemeStore } from '@/store/theme'
import { useConfigStore } from '@/store/config'

// ============================================================
// 数据
// ============================================================
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
// Markdown 预览组件（跟随主题）
// ============================================================
const MarkdownPreview = computed(() => {
  const currentThem = configStore.getArticleTheme()
  return createMarkdownPreview(currentThem)
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
// github 主题：内联代码样式
// ============================================================
:deep(.v-md-editor-preview .github-markdown-body) {
  code:not(pre code) {
    background-color: rgb(var(--v-theme-surface-variant), 0.7) !important;
    color: rgb(var(--v-theme-primary)) !important;
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
</style>
