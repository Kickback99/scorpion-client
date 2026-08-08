<template>
  <!-- ===== Dialog ===== -->
  <v-dialog v-model="visible" :max-width="dialogMaxWidth" @update:model-value="handleClose">
    <v-card>
      <!-- 标题栏 -->
      <v-card-title class="d-flex align-center justify-space-between">
        {{ title }}
        <v-btn icon="mdi-close" variant="text" density="compact" size="small" @click="handleClose" />
      </v-card-title>

      <!-- 内容：Markdown 渲染 -->
      <v-card-text class="terms-content">
        <div class="detail-panel">
          <component
            :is="MarkdownPreview"
            :text="content"
            :key="configStore.article_detail?.theme"
            :class="themeStore.isDark ? 'user-dark' : 'user-light'"
          />
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useThemeStore } from '@/store/theme'
import { useConfigStore } from '@/store/config'
import { useDisplay } from 'vuetify'
import { createMarkdownPreview } from '@/utils/markdown-config'

// ============================================================
// 数据
// ============================================================
const display = useDisplay()
const visible = ref(false)
const configStore = useConfigStore()
const themeStore = useThemeStore()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

// ============================================================
// 渲染
// ============================================================
// 响应式 max-width
const dialogMaxWidth = computed(() => display.mobile.value ? '92%' : 600)

// Markdown 预览组件（跟随主题）
const MarkdownPreview = computed(() => {
  const currentThem = configStore.getArticleTheme()
  return createMarkdownPreview(currentThem)
})

// v-model 双向同步
watch(() => props.modelValue, (val) => { visible.value = val })
watch(visible, (val) => { emit('update:modelValue', val) })

// ============================================================
// 事件处理
// ============================================================
const handleClose = () => { visible.value = false }
</script>

<style scoped lang="scss">
// ============================================================
// 内容区限高滚动
// ============================================================
.terms-content {
  max-height: 60vh;
  overflow-y: auto;
}

// ============================================================
// vuepress 主题：深色背景
// ============================================================
:deep(.v-md-editor-preview.user-dark .vuepress-markdown-body) {
  background: var(--v-theme-surface);
  color: #fff;
}

// ============================================================
// vuepress 主题：浅色背景
// ============================================================
:deep(.v-md-editor-preview.user-light .vuepress-markdown-body) {
  background: var(--v-theme-surface);
  color: #000;
}

.detail-panel {
  :deep(.github-markdown-body),
  :deep(.vuepress-markdown-body) {
    padding: 0 !important;
  }
}
</style>
