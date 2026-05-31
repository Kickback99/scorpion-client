<template>
  <v-container class="profile-center py-6">
      <div :class="display.mobile.value ? 'd-flex flex-row' : ''">
        <!-- 使用动态 direction 属性 -->
        <v-sheet>
          <v-tabs 
          v-model="tab" 
          color="primary"
          :direction="display.mobile.value ? 'vertical' : 'horizontal'"
          :grow="!display.mobile.value"
          :class="[
            display.mobile.value ? 'mobile-tabs' : '',
            display.mobile.value ? 'mr-4' : 'mb-4'  // 非移动端时，tabs 右侧添加间距
        ]"
        >
          <v-tab value="profile" :class="display.mobile.value ? 'justify-start' : ''">
            <v-icon left class="mr-2">mdi-account-circle</v-icon>
            个人资料
          </v-tab>
          <v-tab value="feedback" :class="display.mobile.value ? 'justify-start' : ''">
            <v-icon left class="mr-2">mdi-message-text</v-icon>
            我的反馈
          </v-tab>
          <v-tab value="posts" :class="display.mobile.value ? 'justify-start' : ''">
            <v-icon left class="mr-2">mdi-file-document</v-icon>
            我的发布
          </v-tab>
          <v-tab value="comments" :class="display.mobile.value ? 'justify-start' : ''">
            <v-icon left class="mr-2">mdi-comment</v-icon>
            我的评论
          </v-tab>
          <v-tab value="favorites" :class="display.mobile.value ? 'justify-start' : ''">
            <v-icon left class="mr-2">mdi-heart</v-icon>
            我的收藏
          </v-tab>
          </v-tabs>
        </v-sheet>

        <v-divider v-if="!display.mobile.value"></v-divider>

        <v-sheet elevation="2" rounded="lg"
         :class="display.mobile.value ? 'flex-grow-1' : ''"
         style="overflow: hidden; min-width: 0;"
        >
        <v-tabs-window v-model="tab" :class="display.mobile.value ? 'flex-grow-1 overflow-auto' : ''">
          <!-- 个人资料 Tab -->
          <v-tabs-window-item value="profile">
            <v-sheet class="pa-6">
              <v-form ref="profileFormRef">
                <div class="d-flex justify-end mb-4">
                  <v-btn
                    color="warning"
                    variant="outlined"
                    size="small"
                    @click="showChangePasswordDialog = true"
                  >
                    <v-icon left size="18">mdi-lock-reset</v-icon>
                    修改密码
                  </v-btn>
                </div>

                <!-- 头像 -->
                <v-row>
                  <v-col cols="12" class="text-center">
                    <div class="avatar-wrapper mb-4">
                      <v-avatar size="100" color="grey-lighten-2">
                        <v-img v-if="profileData.avatar" :src="profileData.avatar"></v-img>
                        <v-icon v-else size="60" color="grey">mdi-account-circle</v-icon>
                      </v-avatar>
                      <v-btn
                        icon
                        size="small"
                        color="primary"
                        class="edit-avatar-btn"
                        @click="changeAvatar"
                      >
                        <v-icon size="18">mdi-camera</v-icon>
                      </v-btn>
                    </div>
                    <v-btn
                      variant="text"
                      color="primary"
                      size="small"
                      @click="changeAvatar"
                    >
                      更换头像
                    </v-btn>
                  </v-col>
                </v-row>

                <!-- 用户名（禁用状态） -->
                <v-text-field
                  v-model="profileData.username"
                  label="用户名"
                  disabled
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                ></v-text-field>

                <!-- 昵称 -->
                <v-text-field
                  v-model="profileData.nickname"
                  label="昵称"
                  placeholder="请输入昵称"
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                  :rules="[v => !!v || '昵称不能为空']"
                ></v-text-field>

                <!-- 手机号 -->
                <v-text-field
                  v-model="profileData.phone"
                  label="手机号"
                  placeholder="请输入手机号"
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                  :rules="[
                    v => !v || /^1[3-9]\d{9}$/.test(v) || '请输入正确的手机号'
                  ]"
                ></v-text-field>

                <!-- 邮箱（只读） -->
                <v-text-field
                  v-model="profileData.email"
                  label="邮箱"
                  disabled
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                ></v-text-field>

                <!-- 操作按钮 -->
                <div class="d-flex justify-center mt-6">
                  <v-btn
                    color="primary"
                    :loading="saving"
                    @click="saveProfile"
                  >
                    <v-icon left>mdi-content-save</v-icon>
                    保存
                  </v-btn>
                </div>
              </v-form>
            </v-sheet>
          </v-tabs-window-item>

          <!-- 我的反馈 Tab -->
          <v-tabs-window-item value="feedback">
            <v-sheet class="pa-6">
              <v-data-table
                :headers="feedbackHeaders"
                :items="feedbackList"
                :loading="feedbackLoading"
                hover
              >
                <template v-slot:item.status="{ item }">
                  <v-chip :color="getStatusColor(item.status)" size="small">
                    {{ item.status }}
                  </v-chip>
                </template>
                <template v-slot:item.createdAt="{ item }">
                  {{ formatDate(item.createdAt) }}
                </template>
                <template v-slot:no-data>
                  <v-empty-state
                    headline="暂无反馈"
                    text="你还没有提交过任何反馈"
                    icon="mdi-message-text-outline"
                  ></v-empty-state>
                </template>
              </v-data-table>
            </v-sheet>
          </v-tabs-window-item>

          <!-- 我的发布 Tab -->
          <v-tabs-window-item value="posts">
            <v-sheet class="pa-6">
              <v-data-table
                :headers="postHeaders"
                :items="postList"
                :loading="postLoading"
                hover
              >
                <template v-slot:item.title="{ item }">
                  <router-link :to="`/article/${item.id}`" class="text-decoration-none text-primary">
                    {{ item.title }}
                  </router-link>
                </template>
                <template v-slot:item.createdAt="{ item }">
                  {{ formatDate(item.createdAt) }}
                </template>
                <template v-slot:no-data>
                  <v-empty-state
                    headline="暂无发布"
                    text="你还没有发布过任何内容"
                    icon="mdi-file-document-outline"
                  ></v-empty-state>
                </template>
              </v-data-table>
            </v-sheet>
          </v-tabs-window-item>

          <!-- 我的评论 Tab -->
          <v-tabs-window-item value="comments">
            <AppContentList
              ref="commentListRef"
              content-type="card"
              :load-data-api="getUserCommentsApi"
              :delete-api="deleteCommentApi"
              :table-headers="commentHeaders"
              :enable-search="true"
              search-label="搜索发布的评论"
              search-placeholder="输入文章标题关键词"
              :search-fields="['content']"
              empty-icon="mdi-comment-outline"
              empty-headline="暂无评论"
              empty-text="你还没有发表过任何评论"
              item-icon="mdi-comment"
              :get-item-id="(item) => item.commentId || item.id"
              :get-item-title="(item) => item.content"
              :get-item-subtitle="(item) => `发布于 ${formatDate(item.createTime)} · ${item.type || '文章'}`"
              :get-detail-link="(item) => ({ name: 'detail', params: { id: item.articleId } })"
            >
                <!-- 可选：自定义空状态插槽 -->
              <template #empty="{ searchKeyword }">
                <v-empty-state
                  headline="暂无评论"
                  :text="`没有找到包含 “${searchKeyword}” 的评论`"
                  icon="mdi-comment-outline"
                  class="custom-empty-state"
                />
              </template>
            </AppContentList>
          </v-tabs-window-item>

          <!-- 我的收藏 Tab -->
          <v-tabs-window-item value="favorites">
            <AppContentList
              ref="favoriteListRef"
              content-type="grid"
              :load-data-api="userFavoritesApi"
              :delete-api="deleteFavoriteApi"
              :table-headers="favoriteHeaders"
              :enable-search="true"
              search-label="搜索收藏的文章"
              search-placeholder="输入文章标题关键词"
              :search-fields="['title']"
              empty-icon="mdi-heart-outline"
              empty-headline="暂无收藏"
              empty-text="你还没有收藏任何内容"
              :get-item-id="(item) => item.articleId"
              :get-item-title="(item) => item.title"
              :get-detail-link="(item) => ({ name: 'detail', params: { id: item.articleId } })"
            />
          </v-tabs-window-item>
        </v-tabs-window>
        </v-sheet>
      </div>

    <!-- 修改密码弹窗 -->
    <v-dialog v-model="showChangePasswordDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          修改密码
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="showChangePasswordDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-form ref="passwordFormRef">
            <v-text-field
              v-model="passwordData.oldPassword"
              label="原密码"
              type="password"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || '请输入原密码']"
              class="mb-3"
            ></v-text-field>
            <v-text-field
              v-model="passwordData.newPassword"
              label="新密码"
              type="password"
              variant="outlined"
              density="comfortable"
              :rules="[
                v => !!v || '请输入新密码',
                v => v.length >= 6 || '密码长度至少6位'
              ]"
              class="mb-3"
            ></v-text-field>
            <v-text-field
              v-model="passwordData.confirmPassword"
              label="确认新密码"
              type="password"
              variant="outlined"
              density="comfortable"
              :rules="[
                v => !!v || '请确认新密码',
                v => v === passwordData.newPassword || '两次输入的密码不一致'
              ]"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showChangePasswordDialog = false">取消</v-btn>
          <v-btn color="primary" :loading="changingPassword" @click="changePassword">确认修改</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'
import { watch } from 'vue'
import { deleteFavoriteApi, userFavoritesApi, getUserCommentsApi,deleteUserCommentApi } from '@/api/user'
import AppContentList from './AppContentList.vue'



const display = useDisplay()
const userStore = useUserStore()

// ✅ 定义评论相关的配置和删除方法
const commentHeaders = [
  { title: '评论内容', key: 'content', align: 'start' },
  { title: '评论时间', key: 'createTime' },
  { title: '操作', key: 'actions', sortable: false, align: 'end' }
]

// ✅ 删除评论的方法（使用占位符）
const deleteCommentApi = async (commentId) => {
  console.log('🚧 [待实现] 删除评论 - 评论ID:', commentId)
  // TODO: 后端实现后取消注释
  // return await deleteUserCommentApi(commentId)
  
  // 模拟成功
  return Promise.resolve({ code: 200 })
}

// Tab 值
const tab = ref('profile')

// 个人资料数据
const profileData = reactive({
  username: userStore.user?.username || 'test_user',
  nickname: userStore.user?.nickname || '测试用户',
  phone: userStore.user?.phone || '',
  email: userStore.user?.email || 'test@example.com',
  avatar: userStore.user?.avatar || ''
})

const profileFormRef = ref(null)
const saving = ref(false)

// 修改密码
const showChangePasswordDialog = ref(false)
const passwordData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordFormRef = ref(null)
const changingPassword = ref(false)

// 反馈数据
const feedbackHeaders = [
  { title: '标题', key: 'title', align: 'start' },
  { title: '内容', key: 'content' },
  { title: '状态', key: 'status' },
  { title: '提交时间', key: 'createdAt' }
]
const feedbackList = ref([])
const feedbackLoading = ref(false)

// 发布数据
const postHeaders = [
  { title: '标题', key: 'title', align: 'start' },
  { title: '分类', key: 'category' },
  { title: '阅读量', key: 'views' },
  { title: '发布时间', key: 'createdAt' }
]
const postList = ref([])
const postLoading = ref(false)

// 收藏数据
const favoriteHeaders = [
  { title: '标题', key: 'title', align: 'start' },
  // { title: '作者', key: 'author' },
  // { title: '收藏时间', key: 'createdAt' },
  { title: '操作', key: 'actions', sortable: false,align: 'end'  }
]

// 方法
const changeAvatar = () => {
  // TODO: 实现头像上传
  console.log('更换头像')
}

const saveProfile = async () => {
  const { valid } = await profileFormRef.value.validate()
  if (!valid) return
  
  saving.value = true
  try {
    // TODO: 调用保存接口
    console.log('保存个人资料:', profileData)
    // 更新 store
    userStore.setUser({ ...userStore.user, ...profileData })
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  const { valid } = await passwordFormRef.value.validate()
  if (!valid) return
  
  changingPassword.value = true
  try {
    // TODO: 调用修改密码接口
    console.log('修改密码:', passwordData)
    showChangePasswordDialog.value = false
    // 重置表单
    Object.assign(passwordData, {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  } catch (error) {
    console.error('修改密码失败:', error)
  } finally {
    changingPassword.value = false
  }
}

const getStatusColor = (status) => {
  const colors = {
    '待处理': 'warning',
    '处理中': 'info',
    '已解决': 'success',
    '已关闭': 'grey'
  }
  return colors[status] || 'default'
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

// TODO: 加载各 tab 数据的方法
const loadFeedback = async () => {
  feedbackLoading.value = true
  try {
    // TODO: 调用接口获取数据
    feedbackList.value = [
      { id: 1, title: '建议增加Python课程', content: '希望增加更多Python实战内容', status: '待处理', createdAt: '2024-01-15' }
    ]
  } finally {
    feedbackLoading.value = false
  }
}

const loadPosts = async () => {
  postLoading.value = true
  try {
    postList.value = [
      { id: 1, title: 'Vue3入门教程', category: '前端开发', views: 1234, createdAt: '2024-01-10' }
    ]
  } finally {
    postLoading.value = false
  }
}

// 组件引用
const commentListRef = ref(null)
const favoriteListRef = ref(null)


// 监听 tab 切换，加载数据
watch(tab, (newTab) => {
  switch (newTab) {
    case 'feedback':
      if (feedbackList.value.length === 0) loadFeedback()
      break
    case 'posts':
      if (postList.value.length === 0) loadPosts()
      break
    case 'comments':
        commentListRef.value?.loadData()
      break
    case 'favorites':
      favoriteListRef.value?.loadData()
      break
  }
})
</script>

<style scoped>
.profile-center {
  max-width: 75%;
  margin: 0 auto;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: white;
}

.comment-item {
  border-bottom: 1px solid #e0e0e0;
}

.comment-item:last-child {
  border-bottom: none;
}

.mobile-tabs {
  width: 100%;
  min-width: 120px;
  max-width: 140px;
}

:deep(.pagination-full-width .v-pagination__list) {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

:deep(.full-width-pagination .v-pagination__item,
.full-width-pagination .v-pagination__navigation ){
  flex: 1;  /* 让所有项均匀分配剩余空间 */
  max-width: calc(100% / 8); /* 根据 total-visible 调整 */
  margin: 0 !important; /* 移除默认外边距 */
}

/* --------------- 自定义空状态文字大小 --------------- */
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

/* 移动端更小 */
@media (max-width: 600px) {
  .empty-state-container {
    min-height: 150px;
    padding: 16px;
  }
  
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