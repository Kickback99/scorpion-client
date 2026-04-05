<template>
  <v-container>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ article.title }}</span>
      <!-- 固定在右上角的目录按钮 -->
      <v-btn 
        v-if="hasToc" 
        icon 
        variant="text" 
        @click.stop="showToc = !showToc"
        class="toc-toggle-btn"
        :style="{
          transform: `translateX(${translateXValue})`,
          top: `${POSITION_CONFIG.TOP}px`
        }"
      >
        <v-icon>mdi-text</v-icon>
      </v-btn>
    </v-card-title>

    <div class="markdown-content">
      <v-md-preview :text="article.content" ref="preview"></v-md-preview>
    </div>

    <!-- 底部操作栏 -->
    <v-card-actions class="d-flex justify-center py-4">
      <v-btn
        :color="isFavorite ? 'red' : 'grey'"
        @click="handleFavoriteToggle"
        :loading="favoriteLoading"
        stacked
      >
        <v-icon size="15" class="mb-1">
          {{ isFavorite ? 'mdi-heart-broken' : 'mdi-heart-outline' }}
        </v-icon>
        <div class="d-flex align-center">
          <span>收藏</span>
          <span v-if="article.favoriteCount > 0">
            {{ article.favoriteCount }}
          </span>
        </div>
      </v-btn>
    </v-card-actions>

    <!-- 固定在右侧的目录卡 -->
    <v-card 
      v-show="showToc" 
      class="toc-card" 
      elevation="4" 
      :style="{
        transform: `translateX(calc(${translateXValue} + ${POSITION_CONFIG.BUTTON_GAP}px))`,
        top: `${POSITION_CONFIG.TOP + POSITION_CONFIG.VERTICAL_GAP}px` // 关键修改
      }"
    >
      <v-card-title class="py-2 text-caption d-flex justify-space-between">
        <span>文章目录</span>
        <v-btn icon variant="text" size="small" @click.stop="showToc = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-list density="compact">
        <template v-for="(anchor, index) in tocAnchors" :key="`anchor-${index}`">
          <!-- 二级标题 -->
          <v-list-item
            v-if="anchor.level === 2"
            @click="scrollTo(anchor)"
          >
            <v-list-item-title>{{ anchor.title }}</v-list-item-title>
          </v-list-item>

          <!-- 三级标题（嵌套在最近的二级标题下） -->
          <v-list-item
            v-if="anchor.level === 4"
            @click="scrollTo(anchor)"
            class="pl-8"
          >
            <v-list-item-title>{{ anchor.title }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-card>
  </v-container>
</template>

<script setup>
import { articleDetailApi, toggleFavoriteApi } from '@/api/article';
import { onMounted, ref, watch, nextTick, computed, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import MarkdownIt from 'markdown-it';
import emitter from '@/utils/event-bus.js'
import { useUserStore } from '@/store/user';
const userStore = useUserStore()

const showToc = ref(false);
const preview = ref(null);
const route = useRoute();
const props = defineProps(['id']);
const article = ref({ title: '', content: '' });
const cateArticles = ref([]);
const tags = ref([]);
const tocAnchors = ref([]);
const isFavorite = ref(false);
const favoriteLoading = ref(false);

const hasToc = computed(() => {
  return tocAnchors.value.some(anchor => [2, 3].includes(anchor.level));
});

// 可手动调整的常量（单位：px）
const POSITION_CONFIG = {
  TOP: 150,           // 固定定位的顶部距离
  HORIZONTAL_OFFSET: -18, // 水平微调值（正值向右，负值向左）
  BUTTON_GAP: 15,      // 按钮与卡片的水平间距
  VERTICAL_GAP: 56,      //按钮与卡片之间的垂直间距（根据按钮高度40px+16px间距）
  CONTAINER_PS: 32, //container左右内边距
}

const translateXValue = ref('0px')

const calculatePosition = () => {
  const leftContent = document.querySelector('.v-col-md-9')
  if (!leftContent) return
  
  // 核心计算：左侧内容区宽度 + 其offsetLeft
  const contentWidth = leftContent.offsetWidth
  
  // 计算需要平移的距离 = 内容区右边缘到视口左侧的距离 + 手动微调
  translateXValue.value = `calc(${contentWidth}px - 100% + ${POSITION_CONFIG.HORIZONTAL_OFFSET}px - ${POSITION_CONFIG.CONTAINER_PS}px)`
}

const renderArticleItem = async() => {
  const res = await articleDetailApi(props.id);
  article.value = res.data.articleItem;
  isFavorite.value = res.data.isFavorite || false;
  cateArticles.value = res.data.cateArticles;
  tags.value = res.data.tags;
  emitter.emit('detail-data', {
    cateArticles: cateArticles.value, 
    tags: tags.value
  });
  
  nextTick(() => {
    generateTocAnchors();
    calculatePosition(); // 初始化时计算一次
  });
};

// 处理收藏切换
const handleFavoriteToggle = async () => {
  // 检查是否登录
  if (!userStore.token) {
    // 未登录，触发登录弹窗
    // 提示信息
    // t_question：不显示提示消息
    window.$snackbar?.error('请登录','')
    emitter.emit('loginDialogVisible', true);
    return;
  }
  
  favoriteLoading.value = true;
  try {
    const res = await toggleFavoriteApi(props.id);
    isFavorite.value = res.data.isFavorite;
      // 更新文章收藏数显示
      if (res.data.isFavorite) {
        article.value.favoriteCount = (article.value.favoriteCount || 0) + 1;
      } else {
        article.value.favoriteCount = Math.max(0, (article.value.favoriteCount || 0) - 1);
      }
  } catch (error) {
    console.error('收藏操作失败', error);
    if (error.response?.status === 401) {
      emitter.emit('loginDialogVisible', true);
    }
  } finally {
    favoriteLoading.value = false;
  }
};

const generateTocAnchors = () => {
  if (!preview.value) return;
  
  const anchors = preview.value.$el.querySelectorAll('h1,h2,h3,h4,h5,h6');
  const titles = Array.from(anchors).filter(title => !!title.innerText.trim());
  
  if (!titles.length) {
    tocAnchors.value = [];
    return;
  }

  const hTags = Array.from(new Set(titles.map(title => title.tagName))).sort();

  tocAnchors.value = titles.map(el => ({
    title: el.innerText,
    lineIndex: el.getAttribute('data-v-md-line'),
    indent: hTags.indexOf(el.tagName),
    level: parseInt(el.tagName.slice(1))
  }));
};

const scrollTo = (anchor) => {
  if (!preview.value) return;
  
  const heading = preview.value.$el.querySelector(
    `[data-v-md-line="${anchor.lineIndex}"]`
  );

  if (heading) {
    preview.value.scrollToTarget({
      target: heading,
      scrollContainer: window,
      top: 80
    });
  }
  
  showToc.value = true;
};

onMounted(() => {
  renderArticleItem();
  window.addEventListener('resize', calculatePosition);
  // 添加微任务等待布局完成
  setTimeout(calculatePosition, 100);
  document.addEventListener('click', (e) => {
    if (showToc.value && 
        !e.target.closest('.toc-card') && 
        !e.target.closest('.toc-toggle-btn')) {
      showToc.value = true;
    }
  });
});

onUnmounted(() => {
  // window.removeEventListener('resize', handleResize);
});

watch(() => route.params.id, (newId) => {
  if (newId) renderArticleItem();
});
</script>

<style scoped>
/* 主内容区域 */
.markdown-content {
  width: 100%;
  padding-right: 20px;
}

/* 固定在右上角的目录按钮 */
.toc-toggle-btn,
.toc-card {
  position: fixed;
  z-index: 999;
  background-color: rgba(255, 255, 255, 0.8);
  transition: transform 0.3s ease;
}

/* 固定在右侧的目录卡 */
.toc-card {
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  width: 280px;
  background-color: rgba(255, 255, 255, 0.95);
}

/* 列表项悬停效果 */
.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  cursor: pointer;
}

/* t_todo 文章详情页深色背景下的颜色 */
/* :deep(.vuepress-markdown-body){
  background: black;
  color: #fff;
} */

/* 移动端适配 */
@media (max-width: 960px) {
  .toc-toggle-btn,
  .toc-card {
    transform: none !important;
    right: 20px !important;
  }
  .toc-card {
    width: 50%;
  }
}
</style>