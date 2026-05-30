<template>
  <v-container>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ article.title }}</span>
    </v-card-title>

    <div class="markdown-content">
       <component 
        :is="MarkdownPreview" 
        :text="article.content"
        ref="preview"
        @copy-code-success="handleCopySuccess"
        :key="configStore.theme"
        :class="themeStore.isDark?'user-dark':'user-light'"
        /> 
    </div>
  </v-card>

  <v-card v-if=" configStore.getLoginEnabled() || isLoggedIn" class="mt-5" style="background-color: transparent !important;"> 
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
  </v-card>
  
  <!-- 新增：评论组件 -->
  <div class="mt-5" v-if="configStore.getArticleCommentEnabled()">
    <AppComment 
    :articleId="props.id" 
    :totalCount="article.commentCount"
    @comment-deleted="handleCommentCountChange"
    />
  </div>

  <v-sheet>
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
      <div class="toc-header-fixed">
      <v-card-title class="py-2 text-caption d-flex justify-space-between alien-item-center bg-surface">
        <span style="align-self: center;">文章目录</span>
        <v-btn icon variant="text" size="small" @click.stop="showToc = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider color="primary" opacity=".7" gradient></v-divider>
      </div>
      <v-list density="compact" v-model:selected="selectedTocItem">
        <template v-for="(anchor, index) in tocAnchors" :key="`anchor-${index}`">
          <v-list-item
              :value="anchor"
              @click="scrollTo(anchor)"
              :class="getIndentClass(anchor.level)"
            >
            <v-list-item-title>
              <v-tooltip 
              v-model="tooltipVisible[index]"
              :disabled="!isTitleOverflow(index)"
              location="right"
              :open-delay="300"
              :close-delay="100"
              open-on-hover
              attach="body"
              :text="anchor.title"
              >
                <template v-slot:activator="{ props: tooltipProps }">
                  <span 
                    v-bind="tooltipProps" 
                    :ref="el => setTitleRef(el, index)"
                    class="toc-title-text"
                    @mouseenter="handleMouseEnter(index)"
                    @mouseleave="handleMouseLeave(index)"
                  >
                    {{ anchor.title }}
                  </span>
                </template>
              </v-tooltip>
            </v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-sheet>
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
import { useConfigStore } from '@/store/config';
import AppComment from '@/components/AppComment.vue'
const userStore = useUserStore()

// 判断用户是否已登录
const isLoggedIn = computed(() => {
  return !!userStore.token && Object.keys(userStore.user).length > 0
})

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
// 配置需要显示的标题级别（例如：[2, 3] 表示显示 h2 和 h3）
const tocLevels = ref([1, 2, 3, 4, 5, 6]); // 当前显示 h1 ~ h6
// 缓存当前文章实际存在的标题级别
const existingLevels = ref([]);
// 系统配置
const configStore = useConfigStore()

// ========== 新增：滚动控制标志 ==========
let isScrollingToTarget = false;
let scrollTimeout = null;

// ========== tooltip 溢出检测 ==========
const titleElements = ref([]);

const setTitleRef = (el, index) => {
  if (el) {
    titleElements.value[index] = el;
  }
};

// 检测指定索引的标题是否溢出
const isTitleOverflow = (index) => {
  if (!hasToc.value) return false;
  const el = titleElements.value[index];
  if (!el) return false;
  return el.scrollWidth > el.clientWidth;
};

// 监听窗口大小变化
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    if (!hasToc.value) return;
    nextTick(() => {
      titleElements.value = [...titleElements.value];
    });
  });
}

const tooltipVisible = ref({});

const handleMouseEnter = (index) => {
  if (!hasToc.value) return;
  if (isTitleOverflow(index)) {
    tooltipVisible.value[index] = true;
  }
};

const handleMouseLeave = (index) => {
  if (!hasToc.value) return;
  tooltipVisible.value[index] = false;
};

// 根据 tocLevels 动态生成选择器字符串
const getSelectorString = () => {
  return tocLevels.value.map(level => `h${level}`).join(',');
};

const hasToc = computed(() => {
  // return tocAnchors.value.some(anchor => tocLevels.value.includes(anchor.level));
  // 至少要有 2 个目录项才显示目录按钮
  return configStore.isAnchorEnabled && tocAnchors.value.length >= 2;
});


// 更新现有标题级别缓存
const updateExistingLevels = () => {
  if (tocAnchors.value.length === 0) {
    existingLevels.value = [];
    return;
  }
  // 获取所有不重复的标题级别并排序
  existingLevels.value = [...new Set(tocAnchors.value.map(anchor => anchor.level))].sort((a, b) => a - b);
  console.log('现有标题级别:', existingLevels.value);
};

// 根据标题级别返回对应的 CSS 类（控制缩进）
const getIndentClass = (level) => {
  if (existingLevels.value.length === 0) {
    return 'toc-level-0';
  }

  // 找到当前级别在现有级别中的位置
  const index = existingLevels.value.indexOf(level);
  
  // 如果找不到，返回最小缩进
  if (index === -1) return 'toc-level-0';
  
  // 根据索引返回对应的缩进类
  // 索引0 -> 8px, 索引1 -> 16px, 索引2 -> 24px...
  return `toc-level-${index}`;
};

// 可手动调整的常量（单位：px）
const POSITION_CONFIG = {
  TOP: 150,           // 固定定位的顶部距离
  HORIZONTAL_OFFSET: -18, // 水平微调值（正值向右，负值向左）
  BUTTON_GAP: 18,      // 按钮与卡片的水平间距
  VERTICAL_GAP: 56,      //按钮与卡片之间的垂直间距（根据按钮高度40px+16px间距）
  CONTAINER_PS: 32, //container左右内边距

  // ========== 滚动相关配置 ==========
  SCROLL_TOP_OFFSET: 80,       // 点击目录时，标题距离视口顶部的间距（px）
  ACTIVATION_OFFSET: 100,      // 滚动高亮时，标题距离视口顶部多少像素时触发高亮切换（px）
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

// 添加处理刷新评论数方法
const handleCommentCountChange = async () => {
  const res = await articleDetailApi(props.id);
  article.value.commentCount = res.data.articleItem.commentCount
}

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
  // 使用动态生成的选择器
  const selector = getSelectorString();
  console.log('选择器:', selector); // 应该输出 "h1,h2,h3,h4,h5,h6"
  const anchors = preview.value.$el.querySelectorAll(selector);
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

  // 更新现有标题级别缓存
  updateExistingLevels();

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
  // 如果正在执行滚动跳转，暂时不更新高亮
  if (isScrollingToTarget) return;
  
  if (!preview.value || tocAnchors.value.length === 0) return;
  
  // 使用配置中的偏移量：标题距离视口顶部多少像素时触发高亮切换
  const ACTIVATION_OFFSET = POSITION_CONFIG.ACTIVATION_OFFSET;
  
  // 从后往前找，找到第一个已经滚过视口顶部的标题
  const activeAnchor = [...tocAnchors.value]
    .reverse()
    .find(anchor => {
      const rect = anchor.element?.getBoundingClientRect();
      return rect && rect.top <= ACTIVATION_OFFSET;
    }) || tocAnchors.value[0]; // 找不到则高亮第一个
  
  // 更新高亮
  if (activeAnchor && selectedTocItem.value[0] !== activeAnchor) {
    selectedTocItem.value = [activeAnchor];
  }
};

// 创建防抖版本的滚动处理函数
const scrollHandler = debounce(() => {
  if (!hasToc.value || isScrollingToTarget) return;
  updateActiveToc();
}, 100);

const scrollTo = (anchor) => {
  if (!preview.value || isScrollingToTarget) return;
  
  const heading = preview.value.$el.querySelector(
    `[data-v-md-line="${anchor.lineIndex}"]`
  );

  if (heading) {
    // 先设置标志，阻止任何高亮更新
    isScrollingToTarget = true;

    // 临时移除滚动监听，避免滚动时更新高亮干扰
    window.removeEventListener('scroll', scrollHandler);
    
    // 立即高亮当前点击的标题
    if (selectedTocItem.value[0] !== anchor) {
      selectedTocItem.value = [anchor];
    }
    
    // 使用 getBoundingClientRect 获取元素当前位置
    const rect = heading.getBoundingClientRect();
    const currentScrollY = window.scrollY;
    
    // 使用配置中的偏移量：标题距离视口顶部的间距（px）
    const TOP_OFFSET = POSITION_CONFIG.SCROLL_TOP_OFFSET;
    
    // 计算目标位置：当前滚动位置 + 元素相对于视口的位置 - 偏移量
    const targetPosition = currentScrollY + rect.top - TOP_OFFSET;
    
    // 平滑滚动到目标位置
    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: 'smooth'
    });
    
    // 延迟恢复高亮更新
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // 滚动完成后，先更新一次高亮
      updateActiveToc();
      // 再释放标志
      isScrollingToTarget = false;
      window.addEventListener('scroll', scrollHandler);
      scrollTimeout = null;
    }, 500); // 给足够时间让滚动完成
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
  const currentThem = configStore.getCurrentTheme()
  return createMarkdownPreview(currentThem)
})


onMounted(() => {
  renderArticleItem();
  window.addEventListener('resize', calculatePosition);
   window.addEventListener('scroll', scrollHandler); // 添加滚动监听
  // 添加微任务等待布局完成
  setTimeout(calculatePosition, 100);
  /* document.addEventListener('click', (e) => {
    if (!hasToc.value) return;
    if (showToc.value && 
        !e.target.closest('.toc-card') && 
        !e.target.closest('.toc-toggle-btn')) {
      showToc.value = false;
    }
  }); */
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
  if (scrollTimeout) clearTimeout(scrollTimeout);
});


// 统一滚动到当前高亮项的目录卡位置
const scrollToActiveTocItem = (behavior = 'smooth') => {
  if (!hasToc.value || !showToc.value) return;
  
  const activeElement = document.querySelector('.v-list-item--active');
  if (!activeElement) return;
  
  activeElement.scrollIntoView({
    behavior: behavior,
    block: 'center',
    inline: 'nearest'
  });
};

// 目录卡滚动到当前高亮项
const scrollTocToActive = () => {
  if (!showToc.value) return;
  
  setTimeout(() => {
    scrollToActiveTocItem('smooth');
  }, 50);
};

// 使用防抖
const debouncedScrollToc = debounce(scrollTocToActive, 50);

// 重新初始化目录（主题切换时调用）
const reinitializeToc = async () => {
  // 保存当前滚动位置
  const currentScrollY = window.scrollY;
  const currentActiveAnchor = selectedTocItem.value[0];
  const wasVisible = showToc.value;
  
  await nextTick();
  await nextTick();
  
  setTimeout(() => {
    if (preview.value) {
      generateTocAnchors();
      calculatePosition();
      updateExistingLevels();
      
      // 恢复之前的高亮项
      if (currentActiveAnchor) {
        const restoredAnchor = tocAnchors.value.find(
          anchor => anchor.title === currentActiveAnchor.title
        );
        if (restoredAnchor) {
          selectedTocItem.value = [restoredAnchor];
          
          // 【关键修改】删除所有滚动代码，只恢复滚动位置
          // 直接恢复滚动位置，避免跳动
          window.scrollTo({
            top: currentScrollY,
            behavior: 'smooth'
          });
        } else {
          updateActiveToc();
        }
      } else {
        updateActiveToc();
      }
      
      if (wasVisible) {
        showToc.value = true;
      }
    }
  }, 100);
};

// 监听目录变化，重新检测（触发 Vue 重新渲染）用于 tooltip
watch(() => tocAnchors.value.length, () => {
  if (!hasToc.value) return;
  nextTick(() => {
    // 强制触发重新渲染
    titleElements.value = [...titleElements.value];
  });
});

// 监听目录卡显示状态
watch(() => showToc.value, (newVal) => {
  if (!hasToc.value) return;
  if (newVal && selectedTocItem.value[0]  && !isScrollingToTarget) {
    // 目录卡刚打开时，等待 DOM 渲染完成后再滚动
    nextTick(() => {
      setTimeout(() => {
        scrollToActiveTocItem('smooth');
      }, 150);
    });
  }
});

// 监听高亮项变化
watch(() => selectedTocItem.value[0], () => {
  if (!hasToc.value) return;
  nextTick(() => {
    if (showToc.value && !isScrollingToTarget) {
      debouncedScrollToc();
    }
  });
});

watch(() => route.params.id, (newId) => {
  if (newId) renderArticleItem();
});

// 监听 tocLevels 变化，重新生成目录
watch(() => tocLevels.value, () => {
  if (!hasToc.value) return; 
  nextTick(() => {
    generateTocAnchors();
  });
}, { deep: true });

// 监听主题切换
watch(() => themeStore.isDark, () => {
  if (!hasToc.value || !showToc.value) return;
  reinitializeToc();
});

// 监听配置切换
/* watch(() => configStore.theme,() => {
  if (!hasToc.value || !showToc.value) return;
  reinitializeToc();
}) */
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
  max-height: calc(100vh - 250px);
  overflow-y: auto;
  width: 280px;
  /* background-color: rgba(255, 255, 255, 0.95); */
}

/* 动态缩进样式 */
/* 一级缩进（最外层） */
.toc-level-0 {
  padding-left: 8px !important;
}

/* 二级缩进 */
.toc-level-1 {
  padding-left: 16px !important;
}

/* 三级缩进 */
.toc-level-2 {
  padding-left: 24px !important;
}

/* 四级缩进（可根据需要继续添加） */
.toc-level-3 {
  padding-left: 32px !important;
}

/* 五级缩进（可根据需要继续添加） */
.toc-level-4 {
  padding-left: 40px !important;
}

/* 六级缩进（可根据需要继续添加） */
.toc-level-5 {
  padding-left: 48px !important;
}

/* 列表项悬停效果 */
.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  cursor: pointer;
}

/* vuepress主题：文章详情页深色背景下的颜色 */
:deep(.v-md-editor-preview.user-dark .vuepress-markdown-body){
  background: var(--v-theme-surface);
  color: #fff;
  code:not(pre code) {
    background-color: rgb(var(--v-theme-surface-variant),0.7) !important;
    color: rgb(var(--v-theme-on-primary)) !important;
  }
}

/* vuepress主题：文章详情页浅色背景下的颜色 */
:deep(.v-md-editor-preview.user-light .vuepress-markdown-body){
  background: var(--v-theme-surface);
  color: #000;
  code:not(pre code) {
    background-color: rgb(var(--v-theme-surface-variant),0.7) !important;
    color: rgb(var(--v-theme-on-primary)) !important;
  }
}

/* github主题：文章详情页浅色背景下的颜色 */
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

.toc-header-fixed {
  flex-shrink: 0; /* 防止被压缩 */
  position: sticky;
  top: 0;
  background-color: inherit;
  z-index: 10;
  border-radius: 8px 8px 0 0;
}

/* 可滚动内容区域 */
.toc-content-scroll {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 260px); /* 根据头部高度调整 */
  min-height: 100px;
}

/* 添加文本溢出省略样式 */
.toc-title-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  max-width: 100%;
}

/* 确保 tooltip 正常显示 */
:deep(.v-tooltip) {
  z-index: 10000 !important;
}
</style>

<style>


</style>