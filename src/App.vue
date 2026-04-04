<template>
<router-view></router-view>

<!-- 全局消息提示组件 -->
<AppSnackbar ref="snackbarRef"/>
</template>

<script setup>
import AppSnackbar from './components/AppSnackbar.vue';
import { onMounted, ref } from 'vue'

const snackbarRef = ref(null)

// 可选：如果你想通过 Composition API 使用
onMounted(() => {
  // 组件挂载后，也可以把方法挂载到 window 上
  if (snackbarRef.value) {
    window.$snackbar = snackbarRef.value
  }
})
</script>

<style scoped lang="scss">

</style>