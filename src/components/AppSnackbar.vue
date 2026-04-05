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
    <div class="d-flex align-center" style="gap: 12px;">
      <!-- 图标 -->
      <v-icon v-if="config.icon" :icon="config.icon" :color="config.iconColor" size="24"></v-icon>
      
      <!-- 内容区域 -->
      <div class="flex-grow-1">
        <div v-if="config.showTitle && config.title" class="text-subtitle-1 font-weight-bold mb-1">
          {{ config.title }}
        </div>
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
    </div>
  </v-snackbar>
</template>

<script setup>
import { ref, reactive } from 'vue'

const visible = ref(false)

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
  showCloseBtn: true,
  btnText: '关闭',
  btnColor: 'white',
  persistent: false
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
      showCloseBtn: options.showCloseBtn !== false,
      btnText: options.btnText || '关闭',
      btnColor: options.btnColor || 'white',
      persistent: options.persistent || false
    })
  }
  
  visible.value = true
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