<template>
    <v-container>
            <ArticleItem v-for="(item,index) in articleList" :key="item.id" 
                :class="{'mt-5':(index !== 0)}"
                :id="item.id"
                :title="item.title" 
                :cateName="item.cateName"
                :cover="item.cover" 
                :description="item.description" 
                :createTime="item.createTime"
                :viewCount="item.viewCount">
            </ArticleItem>

            <v-pagination
            v-show=" Math.ceil(total / params.pageSize) > 1 " 
            v-model="params.pageNum" 
            class="mt-5"
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
import { ref,onMounted } from 'vue'
// 全局总线
import emitter from '@/utils/event-bus.js'

// 文章列表
const articleList = ref([])

// 文章分页大小
const total = ref(null)

//搜索相关
const searchData = ref({
      keyword:'',
      categoryId: null,
      tagId: null
})

const params = ref({
    pageNum :1,
    pageSize : 5
})

const renderArticleList = async() => {
    const res = await articleListApi(params.value.pageNum,params.value.pageSize,searchData.value)
    articleList.value = res.data.items
    total.value = res.data.total
}

renderArticleList()

// 绑定总线事件
onMounted(()=>{
    emitter.on('search',receiveParam)
})

    const history = {
        keyword:'',
        categoryId: null,
        tagId: null
    }

    /**
     * 搜索业务(增加用户有没有重复点击相同的按钮)
     * @param {*} data 
     */
     const receiveParam = (data) => {
        params.value.pageNum = 1 //重置分页
        console.log('data',data)
        history.keyword = searchData.value.keyword
        history.categoryId = searchData.value.categoryId
        history.tagId = searchData.value.tagId
        searchData.value.keyword = ''
        searchData.value.categoryId = null
        searchData.value.tagId = null
        if(data.type === 'cate'){
          searchData.value.categoryId = data.param
          console.log('输出了吗',searchData.value.categoryId)
            // 验证是否重复点击
            if(history.categoryId === data.param){
                console.log('你重复点击了，请求失败')
                return
            }
        }else if (data.type === 'tag'){
          searchData.value.tagId = data.param
            // 验证是否重复点击
            if (history.tagId === data.param) {
                console.log('你重复点击了，请求失败')
                return
            }
        }else if (data.type === 'keyword') {
          searchData.value.keyword = data.param
            // 验证是否重复点击
            if (!data.param.trim() ||  history.keyword === data.param) {
                console.log('你重复点击了，请求失败')
                return
            }
        }
        renderArticleList() 
  
    }


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