<template>
    <!-- ===== 404 展示区 ===== -->
    <v-container class="not-found">
        <div class="text-center">
            <h1 class="text-h3 font-weight-black text-primary">404</h1>
            <p class="text-body-1 text-medium-emphasis mt-3">页面不存在</p>
            <v-btn color="primary" size="medium" class="mt-5" @click="handleBackHome">
                <v-icon start>mdi-home</v-icon>
                返回首页
            </v-btn>
        </div>
    </v-container>
</template>

<script setup>
// 依赖导入
import { useRouter } from 'vue-router'

// ============================================================
// 事件
// ============================================================
const router = useRouter()

const handleBackHome = () => {
    router.push('/')
}
</script>

<style scoped lang="scss">
.not-found {
    min-height: calc(100vh - 220px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}
</style>
