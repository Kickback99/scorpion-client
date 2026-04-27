<!-- components/AppComment.vue -->
<template>
  <v-card class="comment-container" variant="flat">
    <v-card-title class="text-h6">
      <v-icon start>mdi-chat-outline</v-icon>
      评论区
      <span class="text-caption text-grey ml-2">({{ total }}条评论)</span>
    </v-card-title>

    <v-divider></v-divider>

    <!-- 评论输入框 -->
    <v-card-text v-if="isLoggedIn">
      <v-textarea
        v-model="commentContent"
        label="写下你的评论..."
        rows="3"
        variant="outlined"
        hide-details
        counter
        maxlength="500"
      ></v-textarea>
      <div class="d-flex justify-end mt-2">
        <v-btn
          color="primary"
          :loading="submitLoading"
          :disabled="!commentContent.trim()"
          @click="submitComment"
          size="small"
        >
          发表评论
        </v-btn>
      </div>
    </v-card-text>

    <v-card-text v-else class="text-center py-4">
      <v-btn
        color="primary"
        variant="text"
        @click="showLoginDialog"
      >
        <v-icon left>mdi-login</v-icon>
        登录后参与评论
      </v-btn>
    </v-card-text>

    <v-divider></v-divider>

    <!-- 评论列表 -->
    <v-card-text v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-card-text>

    <v-card-text v-else-if="commentList.length === 0" class="text-center py-8 text-grey">
      <v-icon size="48" icon="mdi-chat-outline"></v-icon>
      <div class="mt-2">暂无评论，快来抢沙发吧~</div>
    </v-card-text>

    <v-card-text v-else class="pa-0">
      <v-list lines="two" class="bg-transparent">
        <template v-for="comment in commentList" :key="comment.id">
          <v-list-item class="comment-item">
            <template v-slot:prepend>
              <v-avatar size="48">
                <v-icon size="28" :color="getAvatarColor(comment.createBy)">
                  {{ getAvatarIcon(comment.createBy) }}
                </v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="d-flex align-center">
              <strong class="comment-username">{{ comment.username || '匿名用户' }}</strong>
              <span class="text-caption text-grey ml-3">
                {{ formatTime(comment.createTime) }}
              </span>
            </v-list-item-title>

            <v-list-item-subtitle class="comment-content mt-1">
              {{ comment.content }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="startReply(comment)"
                :title="`回复${comment.username || '匿名用户'}`"
              >
                <v-icon size="18">mdi-reply</v-icon>
              </v-btn>
            </template>
          </v-list-item>

          <!-- 根评论回复输入框（使用 AppReplyInput 组件) -->
          <AppReplyInput
            v-if="replyTarget && replyTarget.id === comment.id"
            :targetUsername="comment.username"
            :isChildReply="false"
            :loading="replyLoading"
            v-model:content="replyContent"
            @submit="submitReply"
            @cancel="cancelReply"
          />

          <!-- 子评论区域 -->
          <div v-if="comment.children?.length > 0 || comment.hasMoreChild">
            <!-- 子评论列表容器 -->
            <div class="children-list">
              <!-- 基础子评论（前3条，始终显示） -->
              <template v-for="child in comment.baseChildren" :key="child.id">
                <v-list-item class="child-comment-item">
                  <template v-slot:prepend>
                    <v-avatar size="30">
                      <v-icon size="20" :color="getAvatarColor(child.createBy)">
                        {{ getAvatarIcon(child.createBy) }}
                      </v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="text-body-2">
                    <strong class="comment-username">{{ child.username || '匿名用户' }}</strong>
                    <span 
                    v-if="child.toCommentUserName && child.toCommentUserId !== -1 && child.toCommentId !== child.rootId" 
                    class="text-caption">
                      回复 <strong class="comment-username">@ {{ child.toCommentUserName }}</strong>
                    </span>
                      <div class="text-caption text-grey my-1">
                        {{ formatTime(child.createTime) }}
                      </div>
                  </v-list-item-title>

                  <v-list-item-subtitle class="comment-content mt-1 text-body-2">
                    {{ child.content }}
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click="startReply(child)"
                      title="回复"
                    >
                      <v-icon size="16">mdi-reply</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>

                <AppReplyInput
                  v-if="replyTarget && replyTarget.id === child.id"
                  :targetUsername="child.username"
                  :isChildReply="true"
                  :loading="replyLoading"
                  v-model:content="replyContent"
                  @submit="submitReply"
                  @cancel="cancelReply"
                />
              </template>

              <!-- 额外子评论（可收起/展开） -->
              <template v-if="comment.isChildExpanded">
                <template v-for="child in comment.extraChildren" :key="child.id">
                  <v-list-item class="child-comment-item">
                    <template v-slot:prepend>
                      <v-avatar size="30">
                        <v-icon size="20" :color="getAvatarColor(child.createBy)">
                          {{ getAvatarIcon(child.createBy) }}
                        </v-icon>
                      </v-avatar>
                    </template>

                    <v-list-item-title class="text-body-2">
                      <strong class="comment-username">{{ child.username || '匿名用户' }}</strong>
                      <span 
                      v-if="child.toCommentUserName && child.toCommentUserId !== -1 && child.toCommentId !== child.rootId" 
                      class="text-caption">
                        回复 <strong class="comment-username">@ {{ child.toCommentUserName }}</strong>
                      </span>
                        <div class="text-caption text-grey my-1">
                          {{ formatTime(child.createTime) }}
                        </div>
                    </v-list-item-title>

                    <v-list-item-subtitle class="comment-content mt-1 text-body-2">
                      {{ child.content }}
                    </v-list-item-subtitle>

                    <template v-slot:append>
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        @click="startReply(child)"
                        title="回复"
                      >
                        <v-icon size="16">mdi-reply</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>

                  <AppReplyInput
                    v-if="replyTarget && replyTarget.id === child.id"
                    :targetUsername="child.username"
                    :isChildReply="true"
                    :loading="replyLoading"
                    v-model:content="replyContent"
                    @submit="submitReply"
                    @cancel="cancelReply"
                  />
                </template>
              </template>
            </div>

            <!-- 底部操作按钮（水平居中） -->
            <div class="child-actions-wrapper">
              <!-- 有额外评论时显示操作按钮 -->
              <template v-if="comment.extraChildren.length > 0 || comment.hasMoreChild">
                <!-- 展开状态：显示"查看更多"和"收起" -->
                <template v-if="comment.isChildExpanded">
                  <v-btn
                    v-if="comment.hasMoreChild"
                    variant="text"
                    size="small"
                    color="primary"
                    :loading="comment.childLoading"
                    @click="loadMoreChildren(comment)"
                    class="mx-1"
                  >
                    <v-icon left size="16">mdi-chevron-down</v-icon>
                    查看更多
                  </v-btn>
                  
                  <v-btn
                    variant="text"
                    size="small"
                    color="primary"
                    @click="collapseChildren(comment)"
                    class="mx-1"
                  >
                    <v-icon left size="16">mdi-chevron-up</v-icon>
                    收起
                  </v-btn>
                </template>
                
                <!-- 收起状态：显示"查看剩余x条回复" -->
                <v-btn
                  v-else
                  variant="text"
                  size="small"
                  color="primary"
                  @click="expandChildren(comment)"
                >
                  <v-icon left size="16">mdi-chevron-down</v-icon>
                  查看剩余 {{ comment.childTotal - comment.baseChildren.length }} 条回复
                </v-btn>
              </template>
            </div>
          </div>

          <v-divider v-if="comment !== commentList[commentList.length-1]"></v-divider>
        </template>
      </v-list>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="d-flex justify-center py-4">
        <v-pagination
          v-model="currentPage"
          :length="Math.ceil(total / pageSize)"
          :total-visible="5"
          @update:model-value="loadComments"
          size="small"
        ></v-pagination>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/store/user'
import { useConfigStore } from '@/store/config'
import emitter from '@/utils/event-bus.js'

// 引入评论API（需要创建）
import { getCommentsApi, addCommentApi, getChildCommentsApi } from '@/api/comment'
import AppReplyInput from './AppReplyInput.vue'

const props = defineProps({
  articleId: {
    type: [Number, String],
    required: true
  }
})

const userStore = useUserStore()
const configStore = useConfigStore()

// 获取子评论显示限制数量（默认3条）
const childCommentLimit = ref(3)

// 是否登录
const isLoggedIn = ref(false)

// 数据
const loading = ref(false)
const commentList = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 发表评论
const commentContent = ref('')
const submitLoading = ref(false)

// 回复相关
const replyTarget = ref(null)
const replyContent = ref('')
const replyLoading = ref(false)

// 检查登录状态
const checkLogin = () => {
  isLoggedIn.value = !!userStore.token && Object.keys(userStore.user).length > 0
}

// 监听用户登录状态变化
watch(() => userStore.token, () => {
  checkLogin()
})

// 初始化配置
const initConfig = () => {
  // 从配置中获取子评论显示数量
  // 假设后端会在 configStore 中注入 childCommentLimit
  childCommentLimit.value = configStore.childCommentLimit || 3
}

// 加载评论列表
const loadComments = async () => {
  if (!configStore.isCommentEnabled) return
  
  loading.value = true
  try {
    const res = await getCommentsApi(currentPage.value, pageSize.value, props.articleId)
    if (res.code === 200 && res.data) {
      commentList.value = res.data.items || []
      total.value = res.data.total || 0

      // 为每个评论初始化子评论加载状态
      commentList.value.forEach(comment => {
        // 添加子评论加载状态
        comment.childLoading = false

        // 分离：前3条作为打底基础评论（始终显示）
        comment.baseChildren = comment.children.slice(0, childCommentLimit.value)
        // 多余的作为额外评论（可收起/展开）
        comment.extraChildren = comment.children.slice(childCommentLimit.value)
        
        // 初始状态：如果有额外评论，默认展开显示
        comment.isChildExpanded = comment.extraChildren.length > 0

      })
    }
  } catch (error) {
    console.error('加载评论失败:', error)
    window.$snackbar?.error('加载评论失败')
  } finally {
    loading.value = false
  }
}

// 展开额外子评论
const expandChildren = async (comment) => {
  // 如果还没有加载过更多数据，先加载第一页更多数据
  if (comment.extraChildren.length === 0 && comment.hasMoreChild) {
    comment.childLoading = true
    try {
      
      // 从第2页开始加载，跳过前3条打底数据
      // 第1页返回的是前7条，但前3条已经是 baseChildren 了
      // 所以需要从第2页开始，每页加载 childCommentLimit 条
      const res = await getChildCommentsApi(comment.id, 2, childCommentLimit.value)
      if (res.code === 200 && res.data) {
        const { children, total, hasMore } = res.data
        comment.extraChildren = children //直接设置为 extraChildren
        comment.childTotal = total
        comment.hasMoreChild = hasMore
      }
    } catch (error) {
      console.error('加载子评论失败:', error)
      window.$snackbar?.error('加载回复失败')
      return
    } finally {
      comment.childLoading = false
    }
  }
  
  comment.isChildExpanded = true
}

// 收起额外子评论
const collapseChildren = (comment) => {
  comment.isChildExpanded = false
}

// 加载更多子评论
const loadMoreChildren = async (comment) => {
  if (comment.childLoading) return
  
  // 计算当前已加载的页数
  // 计算当前页数：当前 extraChildren 数量 / 每页数量 + 1
  // 注意：因为第一页是从第2页开始的，所以基础页码需要调整
  // extraChildren 的第1页对应后端的第2页

  // 数据分布说明：
  // - comment.children: 后端返回的全部子评论（初始前7条）
  // - comment.baseChildren: 前3条打底数据（从 children 中分离）
  // - comment.extraChildren: 剩余数据（初始时是 children.slice(3)）
  //
  // 页码计算逻辑：
  // - 第1页（后端第2页）：extraChildren 初始有3条（第4-6条）
  // - 第2页（后端第3页）：extraChildren 追加3条（第7-9条）
  // - 第3页（后端第4页）：extraChildren 追加剩余
  const currentPageNum = Math.ceil(comment.extraChildren.length / childCommentLimit.value) + 2
  
  comment.childLoading = true
  try {
    const res = await getChildCommentsApi(comment.id, currentPageNum, childCommentLimit.value)
    if (res.code === 200 && res.data) {
      const { children, total, hasMore } = res.data
      
      // 追加新的子评论
      comment.extraChildren.push(...children)
      // 更新是否有更多
      comment.hasMoreChild = hasMore
    }
  } catch (error) {
    console.error('加载子评论失败:', error)
    window.$snackbar?.error('加载更多回复失败')
  } finally {
    comment.childLoading = false
  }
}

// 发表评论
const submitComment = async () => {
  if (!commentContent.value.trim()) return
  
  submitLoading.value = true
  try {
    const res = await addCommentApi({
      articleId: props.articleId,
      content: commentContent.value,
      type: '0'  // 0表示文章评论
    })
    if (res.code === 200) {
      window.$snackbar?.success('评论发表成功')
      commentContent.value = ''
      // 刷新列表到第一页
      currentPage.value = 1
      await loadComments()
    }
  } catch (error) {
    console.error('发表评论失败:', error)
    if (error.response?.status === 401) {
      window.$snackbar?.error('请先登录')
      emitter.emit('loginDialogVisible', true)
    } else {
      window.$snackbar?.error('发表评论失败')
    }
  } finally {
    submitLoading.value = false
  }
}

// 开始回复
const startReply = (comment) => {
  if(!isLoggedIn.value){
    window.$snackbar?.error('请登录','')
    emitter.emit('loginDialogVisible', true);
    return;
  }
  
  if (replyTarget.value && replyTarget.value.id === comment.id) {
    cancelReply()
    return
  }
  
  replyTarget.value = {
    id: comment.id,
    rootId: comment.rootId,
    createBy: comment.createBy,
    username: comment.username,
    content: comment.content
  }
  replyContent.value = ''
}

// 取消回复
const cancelReply = () => {
  replyTarget.value = null
  replyContent.value = ''
}

// 提交回复
const submitReply = async () => {
  if (!replyContent.value.trim() || !replyTarget.value) return
  
  replyLoading.value = true
  try {
    const res = await addCommentApi({
      articleId: props.articleId,
      content: replyContent.value,
      type: '0',
      rootId: replyTarget.value.rootId === -1 ? replyTarget.value.id : replyTarget.value.rootId,
      toCommentId: replyTarget.value.id,
      toCommentUserId: replyTarget.value.createBy
    })
    if (res.code === 200) {
      window.$snackbar?.success('回复成功')
      cancelReply()
      await loadComments()
    }
  } catch (error) {
    console.error('回复失败:', error)
    if (error.response?.status === 401) {
      window.$snackbar?.error('请先登录')
      emitter.emit('loginDialogVisible', true)
    } else {
      window.$snackbar?.error('回复失败')
    }
  } finally {
    replyLoading.value = false
  }
}

// 显示登录弹窗
const showLoginDialog = () => {
  emitter.emit('loginDialogVisible', true)
}

// 🚀 时间格式化函数
// 规则：
// - 小于1分钟：刚刚
// - 1-59分钟：X分钟前
// - 1-23小时：X小时前（支持到23小时前）
// - 24小时-3天：X天前（1天前、2天前、3天前）
// - 超过3天：直接使用后端返回的原始格式
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  // 计算时间差
  const minutes = Math.floor(diff / (60 * 1000))
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))

  // 小于1分钟：刚刚
  if (minutes < 1) {
    return '刚刚'
  }
  
  // 1-59分钟前
  if (minutes >= 1 && minutes < 60) {
    return `${minutes}分钟前`
  }
  
  // 1-23小时前
  if (hours >= 1 && hours < 24) {
    return `${hours}小时前`
  }
  
  // 1-3天前
  if (days >= 1 && days <= 3) {
    return `${days}天前`
  }
  
  // 超过3天，使用原始格式
  return time
}

// 获取头像颜色
const getAvatarColor = (userId) => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'purple', 'orange']
  const index = (userId || 1) % colors.length
  return colors[index]
}

// 获取头像图标
const getAvatarIcon = (userId) => {
  const icons = [
    'mdi-account-circle',
    'mdi-account-cowboy-hat',
    'mdi-account-star',
    'mdi-account-music',
    'mdi-account-badge',
    'mdi-account-crown'
  ]
  const index = (userId || 1) % icons.length
  return icons[index]
}

// 监听articleId变化重新加载
watch(() => props.articleId, () => {
  currentPage.value = 1
  if (configStore.isCommentEnabled) {
    loadComments()
  }
})

// 监听配置变化
watch(() => configStore.commentEnabled, (newVal) => {
  if (newVal && props.articleId) {
    loadComments()
  }
})

// 监听配置加载完成，获取子评论限制数量
watch(() => configStore.childCommentLimit, (newVal) => {
  if (newVal) {
    childCommentLimit.value = newVal
  }
})

onMounted(() => {
  checkLogin()
  initConfig() // 初始化配置
  if (configStore.isCommentEnabled && props.articleId) {
    loadComments()
  }
})
</script>

<style scoped>
.comment-container {
  background-color: rgba(var(--v-theme-surface), 0.5);
  backdrop-filter: blur(2px);
}

.comment-item {
  padding: 12px 16px !important;
}

.comment-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.03);
}

.child-comment-item {
  padding: 8px 12px 8px 56px !important;
}

.children-list {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
  margin: 4px 12px 4px 44px;
}

.comment-username {
  color: rgb(var(--v-theme-primary));
  font-weight: 500;
}

.comment-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}

/* 加载更多按钮样式 */
.load-more-child-wrapper {
  padding: 8px 16px 12px 56px;
  text-align: center;
  border-top: 1px dashed rgba(var(--v-theme-primary), 0.2);
  margin-top: 4px;
}

.comment-username {
  color: rgb(var(--v-theme-primary));
  font-weight: 500;
}

.comment-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}

/* 子评论操作按钮容器 - 水平居中 */
.child-actions-wrapper {
  padding: 8px 16px 12px 56px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-top: 1px dashed rgba(var(--v-theme-primary), 0.15);
  margin-top: 4px;
}


/* 移动端适配 */
@media (max-width: 600px) {
  .children-list {
    margin-left: 8px;
    margin-right: 8px;
  }
  
  .child-comment-item {
    padding-left: 40px !important;
  }

  /* 移动端加载更多按钮样式 */
  .load-more-child-wrapper {
    padding-left: 40px;
    padding-right: 8px;
  }
}

:deep(.v-list-item__prepend) {
  /* 确保 prepend 容器自身在交叉轴对齐到其所在行的起始位置 */
  align-self: start !important;
  
}
</style>