<template>
  <v-container>
    <div class="mt-5" v-if="configStore.getFriendLinkCommentEnabled()">
      <!-- 复用 AppComment 组件，传入友链ID和API类型 -->
      <AppComment 
        :articleId="null" 
        :totalCount="totalCount"
        commentType="friendLink"
        @comment-deleted="handleCommentCountChange"
      />
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppComment from '@/components/AppComment.vue'
import { getFriendLinkCommentCountApi } from '@/api/comment'
import { useConfigStore } from '@/store/config'
const configStore = useConfigStore()

// 友链评论总数
const totalCount = ref(0)

// 获取友链评论总数
const fetchLinkCommentCount = async () => {
  try {
    const res = await getFriendLinkCommentCountApi()
    if (res.code === 200 && res.data) {
      totalCount.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取友链评论总数失败:', error)
  }
}

// 处理评论删除后刷新总数
const handleCommentCountChange = async () => {
  await fetchLinkCommentCount()
}

onMounted(() => {
  fetchLinkCommentCount()
})
</script>

<style scoped lang="scss">

</style>