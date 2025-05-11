<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ article.title }}</span>
      <v-btn icon variant="text" @click.stop="showToc = !showToc">
        <v-icon>mdi-text</v-icon>
      </v-btn>
    </v-card-title>

    <div class="content-wrapper">
      <div class="markdown-content">
        <v-md-preview :text="article.content" ref="preview"></v-md-preview>
      </div>

      <v-card v-show="showToc" class="toc-card" elevation="4" :width="cardWidth">
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
    </div>
  </v-card>
</template>

<script setup>
import { articleDetailApi } from '@/api/article';
import { onMounted, ref, watch, nextTick,computed } from 'vue';
import { useRoute } from 'vue-router';
import MarkdownIt from 'markdown-it';
// 全局总线
import emitter from '@/utils/event-bus.js'
// 1. 创建Markdown解析器
const md = new MarkdownIt();

const showToc = ref(false);
const preview = ref(null);

// 响应式卡片宽度
const cardWidth = computed(() => {
  return window.innerWidth < 600 ? '80%' : '280px';
});

const route = useRoute();
const props = defineProps(['id']);
const article = ref({ title: '', content: '' });
const cateArticles = ref([]);
const tags = ref([]);

// 2. 使用官方推荐的锚点数据结构
const tocAnchors = ref([]);

const renderArticleItem = async() => {
  const res = await articleDetailApi(props.id);
  article.value = res.data.articleItem;
  cateArticles.value = res.data.cateArticles;
  tags.value = res.data.tags;
  emitter.emit('detail-data', {
    cateArticles: cateArticles.value, 
    tags: tags.value
  });
  
  // 内容更新后重新生成目录
  nextTick(() => {
    generateTocAnchors();
  });
};

// 3. 生成目录锚点（官方方式）
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

// 4. 官方推荐的锚点跳转方法
const scrollTo = (anchor) => {
  if (!preview.value) return;
  
  const heading = preview.value.$el.querySelector(
    `[data-v-md-line="${anchor.lineIndex}"]`
  );

  if (heading) {
    preview.value.scrollToTarget({
      target: heading,
      scrollContainer: window,
      top: 80 // 根据您的导航栏高度调整
    });
  }
  
  showToc.value = false;
};

// 5. 初始化
onMounted(() => {
  renderArticleItem();
  document.addEventListener('click', (e) => {
    if (showToc.value && 
        !e.target.closest('.toc-card') && 
        !e.target.closest('.v-btn[icon]')) {
      showToc.value = false;
    }
  });
});

watch(() => route.params.id, (newId) => {
  if (newId) renderArticleItem();
});
</script>

<style scoped>
/* 保持原有样式不变 */
.content-wrapper {
  position: relative;
}

.markdown-content {
  width: 100%;
  padding-right: 20px;
}

.toc-card {
  position: absolute;
  top: 0;
  right: 5%;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 100;
}

@media (max-width: 960px) {
  .toc-card {
    right: 20%;
    transform: translateX(20%);
  }
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>