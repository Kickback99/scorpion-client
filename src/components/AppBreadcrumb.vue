<template>
  <div class="breadcrumb-wrapper py-2" v-if="items.length > 1">
    <v-breadcrumbs
      :items="items"
      density="compact"
      class="pa-0"
    >
      <template v-slot:divider>
        <v-icon size="16" class="text-medium-emphasis">mdi-chevron-right</v-icon>
      </template>

      <template v-slot:item="{ item }">
        <v-breadcrumbs-item
          :disabled="item.disabled"
          :to="item.to"
          :class="smAndUp ? 'text-body-2' : 'text-caption'"
        >
          {{ item.title }}
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>
  </div>
</template>

<script setup>
// 依赖导入
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { tagListApi } from '@/api/article'

// ============================================================
// 数据
// ============================================================

/**
 * 首页默认面包屑文字 — 修改此常量即可变更首页显示文案
 */
const HOME_DEFAULT_LABEL = '最新文章'

const route = useRoute()
const { smAndUp } = useDisplay()

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  }
})

const tags = ref([])
const tagMap = computed(() => {
  const map = {}
  tags.value.forEach(t => { map[t.id] = t.name })
  return map
})

// ============================================================
// 渲染
// ============================================================

/**
 * 在分类树中根据 ID 查找节点路径（含祖先节点）
 */
const findCategoryPath = (nodes, targetId) => {
  const path = []
  const search = (list, ancestors) => {
    for (const node of list) {
      const currentPath = [...ancestors, node]
      if (node.id === targetId) {
        path.push(...currentPath)
        return true
      }
      if (node.children && node.children.length > 0) {
        if (search(node.children, currentPath)) return true
      }
    }
    return false
  }
  search(nodes, [])
  return path
}

/**
 * 页面标签映射
 */
const PAGE_LABELS = {
  '/about': '关于',
  '/friendLink': '友链',
  '/blog': '博客',
  '/profile': '个人中心'
}

/**
 * 根据当前路由构建面包屑数据
 */
const items = computed(() => {
  const result = [{ title: '首页', to: '/' }]
  const path = route.path
  const query = route.query

  // 文章详情 /detail/:id
  if (path.startsWith('/detail/')) {
    result.push({ title: '文章详情', disabled: true })
    return result
  }

  // 静态页面
  if (PAGE_LABELS[path]) {
    result.push({ title: PAGE_LABELS[path], disabled: true })
    return result
  }

  // 首页 — 按查询参数区分
  if (path === '/') {
    if (query.type && query.param) {
      const param = query.param

      switch (query.type) {
        case 'cate': {
          const catePath = findCategoryPath(props.categories, Number(param))
          catePath.forEach((cate, index) => {
            const isLast = index === catePath.length - 1
            result.push({
              title: cate.name,
              to: isLast ? undefined : { path: '/', query: { type: 'cate', param: cate.id } },
              disabled: isLast
            })
          })
          break
        }
        case 'tag': {
          const tagName = tagMap.value[Number(param)] || param
          result.push({ title: `标签：${tagName}`, disabled: true })
          break
        }
        case 'keyword':
          result.push({ title: `搜索：${param}`, disabled: true })
          break
      }
    } else {
      // 纯首页 — 无筛选条件时默认显示
      result.push({ title: HOME_DEFAULT_LABEL, disabled: true })
    }
  }

  return result
})

// ============================================================
// 初始加载
// ============================================================

onMounted(async () => {
  try {
    const res = await tagListApi()
    if (res.code === 200 && res.data) {
      tags.value = res.data
    }
  } catch {
    // 标签加载失败不影响面包屑主体功能
  }
})
</script>

<style scoped lang="scss">
// ============================================================
// 面包屑容器
// ============================================================

.breadcrumb-wrapper {
  // Vuetify 工具类已处理深浅模式适配，不需要额外样式
  // text-medium-emphasis / text-high-emphasis 自动适配主题
}
</style>
