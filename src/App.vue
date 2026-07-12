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
import { useConfigStore } from './store/config.js';
import { loadClientConfig } from './router'
const configStore = useConfigStore()

const snackbarRef = ref(null)
const dialogRef = ref(null)

// 初始化 WebSocket
const { initWebSocketListener, closeWebSocket } = useWebSocket()
import websocketManager from '@/server/websocketManager'

onMounted(async() => {
   // 挂载 snackbar 到全局
  if (snackbarRef.value) {
    window.$snackbar = snackbarRef.value
  }

  // 挂载 dialog 到全局
  if (dialogRef.value) {
    window.$dialog = dialogRef.value
  }

  // 等待配置加载完成，再判断 websocket 开关（避免使用默认值 true）
  await loadClientConfig()

  if(configStore.getWebsocketEnabled()){
    // 检查并处理强退用户点击刷新标记
    await websocketManager.checkAndHandleForceLogout()

    initWebSocketListener()
  }
})
</script>

<style scoped lang="scss">

</style>