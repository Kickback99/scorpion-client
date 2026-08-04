<template>
  <v-snackbar
    v-model="visible"
    z-index="9999"
    :color="config.color"
    :location="config.location"
    :timeout="config.timeout"
    :variant="config.variant"
    :rounded="config.rounded"
    multi-line
    position="fixed"
  >
    <!-- 带标题的列布局（长文本公告等场景） -->
    <div v-if="config.showTitle && config.title" style="width: 300PX;">
      <!-- 标题栏：标题 + 关闭图标 -->
      <div class="d-flex align-center justify-space-between mb-1">
        <span class="text-subtitle-1 font-weight-bold text-truncate">{{ config.title }}</span>
        <v-btn
          v-if="config.showCloseBtn"
          icon="mdi-close"
          variant="text"
          density="compact"
          size="small"
          :color="config.btnColor"
          @click="visible = false"
        />
      </div>
      <!-- 内容（单行截断） -->
      <div class="text-body-2 text-truncate mb-2">{{ config.text }}</div>
      <!-- 底部操作按钮 -->
      <div class="d-flex justify-end align-center" style="gap: 8px;">
        <v-btn
          v-if="config.showDontShowAgain"
          variant="text"
          size="small"
          class="text-caption"
          @click="handleDontShowAgain"
        >
          不再提示
        </v-btn>
        <v-btn
          v-if="config.showActionBtn"
          :color="config.actionBtnColor || 'primary'"
          variant="flat"
          size="small"
          @click="handleAction"
        >
          {{ config.actionBtnText }}
        </v-btn>
      </div>
    </div>

    <!-- 默认行内布局（无标题时） -->
    <div v-else class="d-flex align-center" style="gap: 12px;">
      <!-- 图标 -->
      <v-icon v-if="config.icon" :icon="config.icon" :color="config.iconColor" size="24"></v-icon>

      <!-- 内容区域 -->
      <div class="flex-grow-1">
        <div class="text-body-2">
          {{ config.text }}
        </div>
      </div>

      <!-- 关闭按钮 -->
      <v-btn
        v-if="config.showCloseBtn"
        :color="config.btnColor"
        variant="text"
        size="small"
        @click="visible = false"
      >
        {{ config.btnText }}
      </v-btn>
      <!-- 自定义按钮（如"查看详情"） -->
      <v-btn
        v-if="config.showActionBtn"
        :color="config.actionBtnColor || 'primary'"
        variant="flat"
        size="small"
        @click="handleAction"
      >
        {{ config.actionBtnText }}
      </v-btn>
    </div>
  </v-snackbar>
</template>

<script setup>
import { ref, reactive } from 'vue'

const visible = ref(false)
let actionCallback = null
let dontShowAgainCallback = null

const config = reactive({
  text: '',
  color: 'success',
  location: 'top center',
  icon: '',
  iconColor: '',
  title: '',
  showTitle: false,
  timeout: 3000,
  variant: 'elevated',
  rounded: 'md',
  maxWidth: undefined,
  showCloseBtn: true,
  btnText: '关闭',
  btnColor: 'white',
  persistent: false,
  showDontShowAgain: false,
})

// 显示消息的方法
const show = (options) => {
  if (typeof options === 'string') {
    config.text = options
    config.color = 'success'
    config.title = ''
    config.showTitle = false
    config.icon = ''
    config.iconColor = ''
    config.persistent = false
    config.timeout = 3000
  } else {
    Object.assign(config, {
      text: options.text || '',
      color: options.color || 'success',
      location: options.location || 'top center',
      icon: options.icon || '',
      iconColor: options.iconColor || '',
      title: options.title || '',
      showTitle: !!options.title,
      timeout: options.persistent ? -1 : (options.timeout !== undefined ? options.timeout : 3000),
      variant: options.variant || 'elevated',
      rounded: options.rounded || 'md',
      maxWidth: options.maxWidth || undefined,
      showCloseBtn: options.showCloseBtn !== false,
      btnText: options.btnText || '关闭',
      btnColor: options.btnColor || 'white',
      persistent: options.persistent || false,
      showActionBtn: options.showActionBtn || false,
      actionBtnText: options.actionBtnText || '查看详情',
      actionBtnColor: options.actionBtnColor || 'primary',
      showDontShowAgain: options.showDontShowAgain || false
    })
    // 保存回调函数
    actionCallback = options.onAction || null
    dontShowAgainCallback = options.onDontShowAgain || null
    console.log('📢 Snackbar 保存回调:', actionCallback)  // 调试日志
  }
  
  visible.value = true
}

// 操作按钮处理
const handleAction = () => {
  if (actionCallback) {
    actionCallback()
  }
}

// "不再提示"按钮处理
const handleDontShowAgain = () => {
  if (dontShowAgainCallback) {
    dontShowAgainCallback()
  }
  visible.value = false
}

// 统一参数处理函数
const normalizeParams = (text, title, options) => {
  let finalTitle = ''
  let finalOptions = {}
  
  if (typeof title === 'string') {
    finalTitle = title
    finalOptions = options || {}
  } else if (typeof title === 'object' && title !== null) {
    finalTitle = ''
    finalOptions = title
  } else {
    finalTitle = ''
    finalOptions = options || {}
  }
  
  return { title: finalTitle, options: finalOptions }
}

// error 方法
const error = (text, title, options = {}) => {
  const { title: finalTitle, options: finalOptions } = normalizeParams(text, title, options)
  
  show({
    text,
    title: finalTitle,
    color: 'error',
    icon: finalOptions.icon || 'mdi-alert-circle-outline',
    iconColor: finalOptions.iconColor || '',
    persistent: finalOptions.persistent || false,
    timeout: finalOptions.persistent ? -1 : (finalOptions.timeout || 3000),
    ...finalOptions
  })
}

// success 方法
const success = (text, title, options = {}) => {
  const { title: finalTitle, options: finalOptions } = normalizeParams(text, title, options)
  
  show({
    text,
    title: finalTitle,
    color: 'success',
    icon: finalOptions.icon || 'mdi-check-circle',
    iconColor: finalOptions.iconColor || '',
    persistent: finalOptions.persistent || false,
    timeout: finalOptions.persistent ? -1 : (finalOptions.timeout || 3000),
    ...finalOptions
  })
}

// warning 方法
const warning = (text, title, options = {}) => {
  const { title: finalTitle, options: finalOptions } = normalizeParams(text, title, options)
  
  show({
    text,
    title: finalTitle,
    color: 'warning',
    icon: finalOptions.icon || 'mdi-alert',
    iconColor: finalOptions.iconColor || '',
    persistent: finalOptions.persistent || false,
    timeout: finalOptions.persistent ? -1 : (finalOptions.timeout || 3000),
    ...finalOptions
  })
}

// info 方法
const info = (text, title, options = {}) => {
  const { title: finalTitle, options: finalOptions } = normalizeParams(text, title, options)
  
  show({
    text,
    title: finalTitle,
    color: 'info',
    icon: finalOptions.icon || 'mdi-information',
    iconColor: finalOptions.iconColor || '',
    persistent: finalOptions.persistent || false,
    timeout: finalOptions.persistent ? -1 : (finalOptions.timeout || 3000),
    ...finalOptions
  })
}

// 暴露方法给全局使用
if (typeof window !== 'undefined') {
  window.$snackbar = {
    show,
    error,
    success,
    warning,
    info
  }
}

// 暴露给组件使用
defineExpose({
  show,
  error,
  success,
  warning,
  info
})
</script>