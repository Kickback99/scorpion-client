<template>
<router-view></router-view>

<!-- 全局消息提示组件 -->
<AppSnackbar ref="snackbarRef"/>

<!-- 全局对话框组件 -->
<AppDialog ref="dialogRef"/>
</template>

<script setup>
import AppSnackbar from './components/AppSnackbar.vue';
import AppDialog from './components/AppDialog.vue';
import {useWebSocket} from '@/server/useWebSocket'
import { onMounted, ref } from 'vue'

const snackbarRef = ref(null)
const dialogRef = ref(null)

// 初始化 WebSocket
const { initWebSocketListener, closeWebSocket } = useWebSocket()

onMounted(() => {
   // 挂载 snackbar 到全局
  if (snackbarRef.value) {
    window.$snackbar = snackbarRef.value
  }

  // 挂载 dialog 到全局
  if (dialogRef.value) {
    window.$dialog = dialogRef.value
  }

  initWebSocketListener()
})
</script>

<style scoped lang="scss">

</style>