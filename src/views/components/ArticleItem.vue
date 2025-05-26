<template>
  <v-card :to="{name:'detail',params:{id}}">
        <v-list-item class="pa-0">
            <template v-slot:prepend>
                <v-img
                  src="https://img0.baidu.com/it/u=74028626,2723881857&fm=253&fmt=auto&app=138&f=JPEG"
                  :alt="title"
                  class="cover-image"
                  :width="display.smAndDown.value ? 150 : 250"
                :aspect-ratio="16/9"
                contain
                />
            </template>
            <!-- 右侧内容区域 -->
              <!-- <v-list-item-content class="d-flex flex-column justify-space-between"> -->
                <v-list-item-title class="title-category">
                  <h4 class="ma-0 title" :class="display.mdAndUp.value ? 'truncate-multi' : 'truncate-single'">{{ title }}</h4>
                  <!-- <span class="category">{{ post.category }}</span> -->
                </v-list-item-title>
  
                <v-list-item-subtitle class="description">
                  <p class="ma-0 truncate-multi">{{ description }}</p>
                </v-list-item-subtitle>
  
                <v-list-item-subtitle class="metadata pb-1">
                  <span>{{  createTime }}</span>
                  <span>{{ viewCount }} 评论</span>
                  <span>{{ viewCount }} 阅读量</span>
                </v-list-item-subtitle>
              <!-- </v-list-item-content> -->
        </v-list-item>
  </v-card>
  </template>

<script setup>
import { mdToPlainText } from '@/utils/useExtractText'
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
const display = useDisplay()

/* const posts = ref([
  {
    id: 1,
    // title: '关于标题的编写很重要的而关于这个标题的长度会可能挺长的',
    title: '关于标题的编写很重要的而关于这个标题的长度会可能挺长的关于标题的编写很重要的而关于这个标题的长度会可能挺长的编写很重要的而关于这个标题的长度会可能挺长的编写很重要的而关于这个标题的长度会可能挺长的编写很重要的而关于这个标题的长度会可能挺长的编写很重要的而关于这个标题的长度会可能挺长的编写很重要的而关于这个标题的长度会可能挺长的编写很重要的而关于这个标题的长度会可能挺长的编写很重要的而关于这个标题的长度会可能挺长的编写很重要的而关于这个标题的长度会可能挺长的编写很重要的而关于这个标题的长度会可能挺长的编写很重要的而关于这个标题的长度会可能挺长的编写很重要的而关于这个标题的长度会可能挺长的编写很重要的而关于这个标题的长度会可能挺长的编写很重要的而关于这个标题的长度会可能挺长的编写很重要的而关于这个标题的长度会可能挺长的',
    category: '文章分类名',
    description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    publishDate: '2025-04-21',
    comments: 15,
    views: 1024
  },
  // 添加更多文章
]) */


const props = defineProps(['id','title','cateName','cover','description','createTime','viewCount'])

/* const descriptionText = computed(()=>{
   return mdToPlainText(props.description)
}) */



</script>

<style scoped>
/* .title-category {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
} */

.metadata{
    padding-top: 8px;
    margin-top: auto;
}

:deep(.v-list-item__content) {
  display: flex;
  align-self: stretch !important;
  flex-direction: column;
  /* background: coral; */
}

/* 移动端-单行截断 */
.v-list-item-title .truncate-single{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* pc端-两行截断 */
.v-list-item-title .truncate-multi,
.v-list-item-subtitle .truncate-multi {

  display: -webkit-box;
  white-space: wrap !important;
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word; 
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