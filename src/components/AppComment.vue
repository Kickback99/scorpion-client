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
              <v-avatar size="40">
                <v-icon :color="getAvatarColor(comment.createBy)">
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

          <!-- 子评论 -->
          <v-list
            v-if="comment.children && comment.children.length > 0"
            class="children-list"
          >
            <template v-for="child in comment.children" :key="child.id">
              <v-list-item class="child-comment-item">
                <template v-slot:prepend>
                  <v-avatar size="32">
                    <v-icon size="20" :color="getAvatarColor(child.createBy)">
                      {{ getAvatarIcon(child.createBy) }}
                    </v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="text-body-2">
                  <strong class="comment-username">{{ child.username || '匿名用户' }}</strong>
                  <span v-if="child.toCommentUserName" class="text-caption">
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

              <!-- 子评论回复输入框（使用 AppReplyInput 组件) -->
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
          </v-list>

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
import { getCommentsApi, addCommentApi } from '@/api/comment'
import AppReplyInput from './AppReplyInput.vue'

const props = defineProps({
  articleId: {
    type: [Number, String],
    required: true
  }
})

const userStore = useUserStore()
const configStore = useConfigStore()

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

// 加载评论列表
const loadComments = async () => {
  if (!configStore.isCommentEnabled) return
  
  loading.value = true
  try {
    const res = await getCommentsApi(currentPage.value, pageSize.value, props.articleId)
    if (res.code === 200 && res.data) {
      commentList.value = res.data.items || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('加载评论失败:', error)
    window.$snackbar?.error('加载评论失败')
  } finally {
    loading.value = false
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
// 规则：1分钟内=刚刚，1小时内=X分钟前，24小时内=X小时前
//       超过24小时=X天前（最多显示3天前）
//       超过3天=直接使用后端返回的原始格式
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  // 1分钟内
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  // 1小时内
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  }
  // 24小时内
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  }
  
  // 计算天数（超过24小时）
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  
  // 1-3天内显示 X天前
  if (days <= 3) {
    return `${days}天前`
  }
  
  // 超过3天，直接使用后端返回的原始格式
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

onMounted(() => {
  checkLogin()
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

/* 移动端适配 */
@media (max-width: 600px) {
  .children-list {
    margin-left: 8px;
    margin-right: 8px;
  }
  
  .child-comment-item {
    padding-left: 40px !important;
  }
}
</style>