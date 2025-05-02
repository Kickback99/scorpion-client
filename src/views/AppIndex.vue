<template>
    <v-container>
            <ArticleItem v-for="(item,index) in articleList" :key="item.id" 
                class="elevation-2 rounded-lg"
                :class="{'mt-5':(index !== 0)}"
                :title="item.title" 
                :cateName="item.cateName"
                :cover="item.cover" 
                :description="item.description" 
                :createTime="item.createTime"
                :viewCount="item.viewCount">
            </ArticleItem>

            <v-pagination
            v-show=" total>=1 " 
            v-model="params.pageNum" 
            class="mt-5 pagination-full-width"
            :length="Math.ceil(total / params.pageSize)"
            :total-visible="8"
            :elevation="2"
            size="small"
            @update:modelValue="renderArticleList"
            >

            </v-pagination>
    </v-container>
</template>

<script setup>
import { articleListApi } from '@/api/article';
import ArticleItem from './components/ArticleItem.vue';
import { ref } from 'vue'

// 文章列表
const articleList = ref([])

// 文章分页大小
const total = ref(null)

//搜索相关
const searchData = ref({
    
})

const params = ref({
    pageNum :1,
    pageSize : 5
})

const renderArticleList = async() => {
    const res = await articleListApi(params.value.pageNum,params.value.pageSize,searchData.value)
    console.log(res.data.items)
    articleList.value = res.data.items
    total.value = res.data.total
}

renderArticleList()


</script>

<style scoped lang="scss">
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
</style>