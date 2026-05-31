<template>
  <v-sheet class="pa-6">
    <!-- 搜索框区域（仅当启用搜索时显示） -->
    <div v-if="enableSearch" class="d-flex justify-center mb-4">
      <v-text-field
        v-model="searchKeyword"
        :label="searchLabel"
        :placeholder="searchPlaceholder"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        clearable
        density="compact"
        :style="{
          maxWidth: display.mobile.value ? '80%' : '400px',
          width: display.mobile.value ? '80%' : '60%'
        }"
        @click:clear="handleClearSearch"
        @input="handleSearch"
      />
    </div>

    <!-- 列表展示区域 -->
    <v-data-table-virtual
      v-if="contentType === 'grid'"
      :headers="tableHeaders"
      :items="filteredItems"
      :loading="loading"
      :height="hasData ? (display.mobile.value ? 'calc(100vh - 380px)' : 'calc(100vh - 360px)') : 'auto'"
      hover
      hide-default-header
      hide-default-footer
    >
      <!-- 自定义标题列 -->
      <template v-slot:item.title="{ item }">
        <slot name="title" :item="item">
          <router-link
            :to="getDetailLink(item)"
            class="text-decoration-none text-primary"
          >
            {{ item.title || item.content }}
          </router-link>
        </slot>
      </template>

      <!-- 自定义内容列（评论专用） -->
      <template v-if="contentType === 'comment'" v-slot:item.content="{ item }">
        <div class="text-body-2 text-grey-darken-1">
          {{ truncateText(item.content, 100) }}
        </div>
      </template>

      <!-- 自定义时间列 -->
      <template v-slot:item.createTime="{ item }">
        <!-- {{ formatDate(item.createTime) }} -->
        {{ item.createTime }}
      </template>

      <!-- 操作列 -->
      <template v-slot:item.actions="{ item }">
        <v-btn
          icon
          variant="text"
          size="small"
          :color="deleteButtonColor"
          :loading="isDeleting(item)"
          @click="handleDelete(item)"
        >
          <v-icon>{{ deleteIcon }}</v-icon>
        </v-btn>
      </template>

      <!-- 空状态 -->
      <template v-slot:no-data>
        <slot name="empty" :searchKeyword="searchKeyword">
          <v-empty-state
            :headline="searchKeyword ? '未找到相关内容' : emptyHeadline"
            :text="searchKeyword ? `没有找到包含“${searchKeyword}”的内容` : emptyText"
            :icon="searchKeyword ? 'mdi-magnify-remove-outline' : emptyIcon"
            class="custom-empty-state"
          />
        </slot>
      </template>
    </v-data-table-virtual>

    <!-- 移动端卡片列表模式 -->
    <div v-else-if="contentType === 'card'" class="content-card-list">
      <v-list v-if="filteredItems.length > 0">
        <v-list-item
          v-for="item in filteredItems"
          :key="getItemId(item)"
          :title="getItemTitle(item)"
          :subtitle="getItemSubtitle(item)"
          lines="two"
          class="content-item"
        >
          <template v-slot:prepend>
            <v-avatar size="25" color="grey-lighten-2">
              <v-icon>{{ itemIcon }}</v-icon>
            </v-avatar>
          </template>
          <template v-slot:append>
            <v-btn
              icon
              variant="text"
              size="small"
              :color="deleteButtonColor"
              :loading="isDeleting(item)"
              @click="handleDelete(item)"
            >
              <v-icon size="18">{{ deleteIcon }}</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
      <v-empty-state
        v-else
        :headline="searchKeyword ? '未找到相关内容' : emptyHeadline"
        :text="searchKeyword ? `没有找到包含“${searchKeyword}”的内容` : emptyText"
        :icon="searchKeyword ? 'mdi-magnify-remove-outline' : emptyIcon"
        class="custom-empty-state"
      />
    </div>

    <!-- 分页组件 -->
    <div v-if="pagination && total > pageSize" class="d-flex justify-center mt-4">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="display.mobile.value ? 5 : 7"
        @update:model-value="loadData"
      />
    </div>
  </v-sheet>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'

// Props 定义
const props = defineProps({
  // 内容类型：'grid'（网格/表格）或 'card'（卡片/列表）
  contentType: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'card'].includes(value)
  },
  // 数据加载函数（必须返回 Promise）
  loadDataApi: {
    type: Function,
    required: true
  },
  // 删除函数（可选，不传则触发 console.log）
  deleteApi: {
    type: Function,
    default: null
  },
  // 表格列配置
  tableHeaders: {
    type: Array,
    default: () => [
      { title: '标题', key: 'title', align: 'start' },
      { title: '操作', key: 'actions', sortable: false, align: 'end' }
    ]
  },
  // 是否启用搜索
  enableSearch: {
    type: Boolean,
    default: false
  },
  // 搜索标签
  searchLabel: {
    type: String,
    default: '搜索'
  },
  // 搜索占位符
  searchPlaceholder: {
    type: String,
    default: '输入关键词搜索'
  },
  // 搜索字段（前端过滤用）
  searchFields: {
    type: Array,
    default: () => ['title']
  },
  // 空状态图标
  emptyIcon: {
    type: String,
    default: 'mdi-inbox-outline'
  },
  // 空状态标题
  emptyHeadline: {
    type: String,
    default: '暂无内容'
  },
  // 空状态描述
  emptyText: {
    type: String,
    default: '还没有任何内容'
  },
  // 条目图标
  itemIcon: {
    type: String,
    default: 'mdi-file-document'
  },
  // 删除按钮图标
  deleteIcon: {
    type: String,
    default: 'mdi-delete'
  },
  // 删除按钮颜色
  deleteButtonColor: {
    type: String,
    default: 'red'
  },
  // 是否分页
  pagination: {
    type: Boolean,
    default: false
  },
  // 每页大小
  pageSize: {
    type: Number,
    default: 10
  },
  // 获取条目ID的函数
  getItemId: {
    type: Function,
    default: (item) => item.id || item.commentId || item.articleId
  },
  // 获取条目标题的函数
  getItemTitle: {
    type: Function,
    default: (item) => item.title || item.content
  },
  // 获取条目副标题的函数
  getItemSubtitle: {
    type: Function,
    default: (item) => `发布于 ${item.createTime}`
  },
  // 获取详情链接的函数
  getDetailLink: {
    type: Function,
    default: (item) => ({ name: 'detail', params: { id: item.articleId } })
  },
  // 是否自动加载
  autoLoad: {
    type: Boolean,
    default: true
  }
})

// 响应式数据
const display = useDisplay()
const items = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const total = ref(0)
const deletingIds = ref([]) // 正在删除的ID列表

// 计算属性
const filteredItems = computed(() => {
  if (!props.enableSearch || !searchKeyword.value.trim()) {
    return items.value
  }
  const keyword = searchKeyword.value.trim().toLowerCase()
  return items.value.filter(item => {
    return props.searchFields.some(field => {
      const value = item[field]
      return value && String(value).toLowerCase().includes(keyword)
    })
  })
})

const hasData = computed(() => {
  return filteredItems.value.length > (display.mobile.value ? 5 : 6)
})

const totalPages = computed(() => {
  return Math.ceil(total.value / props.pageSize)
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const params = props.pagination ? { pageNum: currentPage.value, pageSize: props.pageSize } : {}
    const result = await props.loadDataApi(params)
    
    if (result && result.data) {
      items.value = result.data.items || result.data.records || result.data
      total.value = result.data.total || items.value.length
    } else if (Array.isArray(result)) {
      items.value = result
      total.value = result.length
    } else {
      items.value = result || []
      total.value = items.value.length
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleDelete = async (item) => {
  const itemId = props.getItemId(item)
  
  // 占位符：如果删除API未提供，则触发 console.log
  if (!props.deleteApi) {
    console.log('[待实现] 删除功能占位符 - 即将删除:', {
      id: itemId,
      type: props.contentType === 'comment' ? '评论' : '收藏',
      data: item
    })
    return
  }

  // 防止重复删除
  if (deletingIds.value.includes(itemId)) return
  
  deletingIds.value.push(itemId)
  try {
    await props.deleteApi(itemId)
    // 从列表中移除
    items.value = items.value.filter(i => props.getItemId(i) !== itemId)
    total.value = Math.max(0, total.value - 1)
    window.$snackbar?.success('删除成功')
  } catch (error) {
    console.error('删除失败:', error)
    window.$snackbar?.error('删除失败，请重试')
  } finally {
    deletingIds.value = deletingIds.value.filter(id => id !== itemId)
  }
}

const isDeleting = (item) => {
  return deletingIds.value.includes(props.getItemId(item))
}

const handleSearch = () => {
  // 搜索逻辑由 computed 自动处理
  console.log('搜索关键词:', searchKeyword.value)
}

const handleClearSearch = () => {
  searchKeyword.value = ''
  console.log('已清空搜索')
}

/* const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
} */

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

// 监听
watch(() => props.enableSearch, () => {
  // 搜索功能开关变化时重置搜索关键词
  searchKeyword.value = ''
})

// 生命周期
if (props.autoLoad) {
  onMounted(() => {
    loadData()
  })
}

// 暴露方法供父组件调用
defineExpose({
  loadData,
  refresh: loadData
})
</script>

<style scoped>
.content-item {
  border-bottom: 1px solid #e0e0e0;
}

.content-item:last-child {
  border-bottom: none;
}

.content-card-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

:deep(.custom-empty-state .v-empty-state__headline) {
  font-size: 1.25rem !important;
  font-weight: 500;
}

:deep(.custom-empty-state .v-empty-state__text) {
  font-size: 0.875rem !important;
}

:deep(.custom-empty-state .v-icon) {
  font-size: 60px !important;
}

@media (max-width: 600px) {
  :deep(.custom-empty-state .v-empty-state__headline) {
    font-size: 1rem !important;
  }
  
  :deep(.custom-empty-state .v-empty-state__text) {
    font-size: 0.75rem !important;
  }
  
  :deep(.custom-empty-state .v-icon) {
    font-size: 48px !important;
  }
}
</style>