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
        <component
          :is="MarkdownPreview"
          :text="content"
          :key="configStore.article_detail?.theme"
          :class="themeStore.isDark ? 'user-dark' : 'user-light'"
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
</script>
