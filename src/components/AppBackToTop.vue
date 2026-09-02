<template>
  <!-- ===== 回到顶部按钮 ===== -->
  <v-btn
    v-show="showBackToTop"
    icon
    size="small"
    variant="text"
    aria-label="回到顶部"
    class="back-to-top-btn app-icon-btn"
    :style="{ right: rightOffset, top: topOffset }"
    @click="handleBackToTop"
  >
    <v-icon>mdi-chevron-up</v-icon>
  </v-btn>
</template>

<script setup>
// 依赖导入
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ============================================================
// 数据
// ============================================================
const props = defineProps({
  /** 是否显示 TOC 切换按钮，决定回到顶部按钮的占位位置 */
  hasToc: { type: Boolean, default: false }
})

const showBackToTop = ref(false)
const rightOffset = ref('0px')

// 定位配置：TOP 与 TOC 按钮一致，VERTICAL_GAP 为有 TOC 时相对 TOC 按钮的垂直偏移
const POSITION_CONFIG = {
  TOP: 165,
  EDGE_GAP: 0,
  // 有 TOC 时相对 TOC 按钮的垂直偏移：按钮高 40 + 间距 6
  VERTICAL_GAP: 46,
  SHOW_THRESHOLD: 300
}

// ============================================================
// 计算属性
// ============================================================
// 有 TOC 时回到顶部按钮位于 TOC 按钮下方；无 TOC 时代替 TOC 按钮位置
const topOffset = computed(() => {
  const top = POSITION_CONFIG.TOP + (props.hasToc ? POSITION_CONFIG.VERTICAL_GAP : 0)
  return `${top}px`
})

// ============================================================
// 定位
// ============================================================
/** 计算回到顶部按钮的水平定位，与 TOC 按钮一致：右边缘对齐文章内容区右边缘 */
const calculatePosition = () => {
  const articleContent = document.querySelector('.markdown-content')
  if (!articleContent) return

  const contentRight = articleContent.getBoundingClientRect().right
  const viewportWidth = document.documentElement.clientWidth
  rightOffset.value = `${viewportWidth - contentRight + POSITION_CONFIG.EDGE_GAP}px`
}

// ============================================================
// 交互处理
// ============================================================
const handleBackToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ============================================================
// 滚动监听
// ============================================================
const handleScroll = () => {
  showBackToTop.value = window.scrollY > POSITION_CONFIG.SHOW_THRESHOLD
}

const handleResize = () => calculatePosition()

// ============================================================
// 生命周期
// ============================================================
onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize)
  setTimeout(calculatePosition, 100)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})

// ============================================================
// 公开方法
// ============================================================
defineExpose({
  /** 外部触发位置重算（文章内容加载后调用） */
  recalculatePosition() {
    calculatePosition()
  }
})
</script>

<style scoped lang="scss">
// ============================================================
// 定位
// ============================================================
.back-to-top-btn {
  position: fixed;
  z-index: 999;
  transition: right 0.3s ease;
}

// ============================================================
// 移动端适配
// ============================================================
@media (max-width: 960px) {
  .back-to-top-btn {
    right: 20px !important;
  }
}
</style>
