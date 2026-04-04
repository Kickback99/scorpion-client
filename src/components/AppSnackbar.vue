<template>
  <v-snackbar
    v-model="visible"
    z-index="9999"
    :color="config.color"
    :location="config.location"
    :prepend-icon="config.icon"
    :timeout="config.timeout"
    :title="config.title"
    :text="config.text"
    :variant="config.variant"
    :rounded="config.rounded"
    multi-line
    contained
  >
    <template v-slot:actions>
      <v-btn
        v-if="config.showCloseBtn"
        :color="config.btnColor"
        variant="text"
        @click="visible = false"
      >
        {{ config.btnText }}
      </v-btn>
    </template>
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
  title: '',
  timeout: 3000,
  variant: 'elevated',
  rounded: 'md',
  showCloseBtn: true,
  btnText: '关闭',
  btnColor: 'white'
})

// 显示消息的方法
const show = (options) => {
  // 如果是字符串，直接作为文本显示
  if (typeof options === 'string') {
    config.text = options
    config.color = 'success'
    config.title = ''
    config.icon = ''
  } else {
    Object.assign(config, {
      text: options.text || '',
      color: options.color || 'success',
      location: options.location || 'top center',
      icon: options.icon || '',
      title: options.title || '',
      timeout: options.timeout !== undefined ? options.timeout : 3000,
      variant: options.variant || 'elevated',
      rounded: options.rounded || 'md',
      showCloseBtn: options.showCloseBtn !== false,
      btnText: options.btnText || '关闭',
      btnColor: options.btnColor || 'white'
    })
  }
  
  visible.value = true
}

// 快捷方法
const error = (text, title = '错误') => {
  show({
    text,
    title,
    color: 'error',
    icon: 'mdi-cancel'
  })
}

const success = (text, title = '成功') => {
  show({
    text,
    title,
    color: 'success',
    icon: 'mdi-check-circle'
  })
}

const warning = (text, title = '警告') => {
  show({
    text,
    title,
    color: 'warning',
    icon: 'mdi-alert'
  })
}

const info = (text, title = '提示') => {
  show({
    text,
    title,
    color: 'info',
    icon: 'mdi-information'
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