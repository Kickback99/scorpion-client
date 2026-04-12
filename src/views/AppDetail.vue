<template>
  <v-container>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ article.title }}</span>
      <!-- 固定在右上角的目录按钮 -->
      <v-btn 
        v-if="hasToc" 
        icon
        size="small" 
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

        <component 
        :is="MarkdownPreview" 
        :text="article.content"
        ref="preview"
        @copy-code-success="handleCopySuccess"
        :key="themeStore.isDark"
        /> 
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
      <v-card-title class="py-2 text-caption d-flex justify-space-between alien-item-center bg-surface">
        <span style="align-self: center;">文章目录</span>
        <v-btn icon variant="text" size="small" @click.stop="showToc = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider color="primary" opacity=".7" gradient></v-divider>
      <v-list density="compact" v-model:selected="selectedTocItem">
        <template v-for="(anchor, index) in tocAnchors" :key="`anchor-${index}`">
          <!-- 二级标题 -->
          <v-list-item
            v-if="anchor.level === 2"
            :value="anchor"
            @click="scrollTo(anchor)"
          >
            <v-list-item-title>{{ anchor.title }}</v-list-item-title>
          </v-list-item>

          <!-- 三级标题（嵌套在最近的二级标题下） -->
          <v-list-item
            v-if="anchor.level === 4"
            :value="anchor"
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
import { useThemeStore } from '@/store/theme';
import { createMarkdownPreview } from '@/utils/markdown-config';
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
const selectedTocItem = ref([])

const hasToc = computed(() => {
  return tocAnchors.value.some(anchor => [2, 3].includes(anchor.level));
});

// 可手动调整的常量（单位：px）
const POSITION_CONFIG = {
  TOP: 150,           // 固定定位的顶部距离
  HORIZONTAL_OFFSET: -18, // 水平微调值（正值向右，负值向左）
  BUTTON_GAP: 18,      // 按钮与卡片的水平间距
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
  
  const anchors = preview.value.$el.querySelectorAll('h2,h4');
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
    level: parseInt(el.tagName.slice(1)),
    element: el
  }));

  if (tocAnchors.value.length > 0) {
     selectedTocItem.value = [tocAnchors.value[0]];
  }
};

// 防抖函数
const debounce = (fn, delay = 100) => {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// 滚动时高亮对应的目录项
const updateActiveToc = () => {
  if (!preview.value || tocAnchors.value.length === 0) return;
  
  // 获取当前滚动位置（加上偏移量，让高亮更灵敏）
  const scrollTop = window.scrollY + 50; // +100 让标题到达视口顶部前就高亮
  
  // 找到最后一个 offsetTop 小于等于当前滚动位置的标题
  let activeAnchor = [...tocAnchors.value]
    .reverse()
    .find(anchor => {
      const element = anchor.element;
      return element && element.offsetTop <= scrollTop;
    });

  // 兜底：如果找不到，高亮第一个
  if (!activeAnchor && tocAnchors.value.length > 0) {
    activeAnchor = tocAnchors.value[0];
  }
  
  // 更新高亮
  if (activeAnchor && selectedTocItem.value[0] !== activeAnchor) {
    selectedTocItem.value = [activeAnchor];
  }
};

// 创建防抖版本的滚动处理函数
const scrollHandler = debounce(updateActiveToc, 100);

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

// ========== 代码块复制业务 ==========
const handleCopySuccess = () => {
  const copyButtons = document.querySelectorAll('.v-md-copy-code-btn')
  
  copyButtons.forEach(btn => {
    // 添加copied类
    btn.classList.add('copied')
    
    // 1.5秒后移除
    setTimeout(() => {
      btn.classList.remove('copied')
    }, 1500)
  })
}

// ========== 主题切换业务 ==========

const themeStore = useThemeStore()

// 使用 computed 每次重新创建组件
const MarkdownPreview = computed(() => {
  console.log('创建主题:', themeStore.isDark?"vuepress":"github")
  return createMarkdownPreview(themeStore.isDark?"vuepress":"github")
})


onMounted(() => {
  renderArticleItem();
  window.addEventListener('resize', calculatePosition);
   window.addEventListener('scroll', scrollHandler); // 添加滚动监听
  // 添加微任务等待布局完成
  setTimeout(calculatePosition, 100);
  document.addEventListener('click', (e) => {
    if (showToc.value && 
        !e.target.closest('.toc-card') && 
        !e.target.closest('.toc-toggle-btn')) {
      showToc.value = false;
    }
  });
  const preview = document.querySelector('.v-md-editor-preview')
  if (preview) {
    new MutationObserver(() => {
      // 重新绑定事件监听器
    }).observe(preview, { childList: true, subtree: true })
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', calculatePosition);
  window.removeEventListener('scroll', scrollHandler); // 清理滚动监听
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
  max-width: 280px;
  /* background-color: rgba(255, 255, 255, 0.8); */
  transition: transform 0.3s ease;
}

/* 固定在右侧的目录卡 */
.toc-card {
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  width: 280px;
  /* background-color: rgba(255, 255, 255, 0.95); */
}

/* 列表项悬停效果 */
.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  cursor: pointer;
}

/* 文章详情页深色背景下的颜色 */
:deep(.v-md-editor-preview .vuepress-markdown-body){
  background: var(--v-theme-surface);
  color: #fff;
  code:not(pre code) {
    background-color: rgb(var(--v-theme-surface-variant),0.7) !important;
    color: rgb(var(--v-theme-on-primary)) !important;
  }
}

/* 文章详情页浅色背景下的颜色 */
:deep(.v-md-editor-preview .github-markdown-body){
  code:not(pre code) {
    background-color: rgb(var(--v-theme-surface-variant),0.7) !important;
    color: rgb(var(--v-theme-primary)) !important;
  }
}

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

:deep(.v-md-copy-code-btn){
  background-color: rgb(var(--v-theme-primary),.7) !important;
}

:deep(.v-md-copy-code-btn.copied svg) {
  display: none;
}

:deep(.v-md-copy-code-btn.copied::after) {
  content: "✓";
  color: rgb(var(--v-theme-on-primary)) !important;
  font-size: 16px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>

<style>


</style>