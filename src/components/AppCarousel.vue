<template>
    <v-container v-if="carouselItems.length > 0">
        <v-card>
            <v-carousel
                height="250px" hide-delimiters show-arrows theme="scorpion-dark" style="cursor: pointer;">
                <v-carousel-item
                    v-for="(item, index) in carouselItems"
                    :key="index"
                    @click="goToLink(item.link)"
                >
                    <v-img :src="item.img" cover />
                    <!-- 轮播标题 -->
                    <v-overlay
                        absolute
                        class="d-flex align-center justify-center"
                        style="background: linear-gradient(transparent, rgba(0,0,0,0.6));"
                    >
                    </v-overlay>
                        <v-card-title
                            class="text-white text-h6 font-weight-bold"
                            style="position: absolute; bottom: 16px; left: 16px;"
                        >
                            {{ item.title }}
                        </v-card-title>
                </v-carousel-item>
            </v-carousel>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCarouselListApi } from '@/api/carousel'
import { useRouter } from 'vue-router'
const router = useRouter()

const carouselItems = ref([])

// 加载轮播图
const loadCarousel = async () => {
    try {
        const res = await getCarouselListApi()
        carouselItems.value = res.data || []
    } catch (error) {
        console.error('加载轮播图失败:', error)
    }
}

// 跳转链接：外部链接新窗口打开，内部链接路由跳转
const goToLink = (link) => {
    if (!link) return
    
    // 判断是否为 http 或 https 开头的外部链接
    if (link.startsWith('http://') || link.startsWith('https://')) {
        window.open(link, '_blank')
    } else {
        router.push(link)
    }
}

onMounted(() => {
    loadCarousel()
})
</script>

<style scoped>
/* 轮播图标题样式 */
.v-overlay {
    pointer-events: none;
}

/* 轮播图左右箭头始终使用深色主题色，任意背景都清晰 */
:deep(.v-window__left),
:deep(.v-window__right) {
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}
</style>