<template>
    <v-container>
        <v-card>
        <v-list lines="one">
        <v-list-item v-for="post in posts" :key="post.id">
            <template v-slot:prepend>
                <v-img
                  src="https://img0.baidu.com/it/u=74028626,2723881857&fm=253&fmt=auto&app=138&f=JPEG?w=787&h=500"
                  :alt="post.title"
                  class="cover-image"
                  width="200"
                :aspect-ratio="16/9"
                contain
                />
            </template>
            <!-- 右侧内容区域 -->
              <v-list-item-content class="d-flex flex-column justify-space-between">
                <v-list-item-title class="title-category ">
                  <h4 class="ma-0">{{ post.title }}</h4>
                  <span class="category">{{ post.category }}</span>
                </v-list-item-title>
  
                <v-list-item-subtitle class="description">
                  <p class="ma-0">{{ post.description }}</p>
                </v-list-item-subtitle>
  
                <v-list-item-subtitle class="metadata pb-1">
                  <span>{{ post.publishDate }}</span>
                  <span>{{ post.comments }} 评论</span>
                  <span>{{ post.views }} 阅读量</span>
                </v-list-item-subtitle>
              </v-list-item-content>
        </v-list-item>
    </v-list>
    </v-card>
    </v-container>
  </template>

<script setup>
import { ref } from 'vue'
import coverImg from '@/assets/course01.png'

const posts = ref([
  {
    id: 1,
    title: '关于标题的编写很重要的而关于这个标题的长度会可能挺长的',
    category: '文章分类名',
    description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    publishDate: '2025-04-21',
    comments: 15,
    views: 1024
  },
  // 添加更多文章
])
</script>

<style scoped>
.title-category {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.metadata{
    padding-top: 8px;
    margin-top: auto;
}

:deep(.v-list-item__content) {
  align-self: stretch !important;
  background: coral;
}

/* .title-category h4 {
  font-size: 1.5rem;
  font-weight: bold;
  width: 350px;
}

.category {
  font-size: 0.875rem;
  color: #555;
}

.description p {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.metadata {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #777;
} */
</style>