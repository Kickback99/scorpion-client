<template>
    <v-container>
            <!-- 空状态显示 -->
             <v-card v-if="articleList.length === 0" >
            <v-empty-state
                icon="mdi-file-document-outline"
                title="暂无文章"
                text="当前没有找到任何文章内容"
            >
            </v-empty-state>
            </v-card>

              <!-- 正常文章列表 -->
          <template v-else>
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
            :total-visible="smAndUp?8:4"
            :elevation="2"
            size="small"
            @update:modelValue="renderArticleList"
            >

            </v-pagination>
          </template>
    </v-container>
</template>

<script setup>
import { articleListApi } from '@/api/article';
import ArticleItem from './components/ArticleItem.vue';
import { ref,onMounted,onUnmounted,watch, provide } from 'vue'
import { useDisplay } from 'vuetify';


const {smAndUp} = useDisplay()


// 全局总线
import emitter from '@/utils/event-bus.js'
import { useRoute, useRouter } from 'vue-router';


const route = useRoute()
const router = useRouter()


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
    // console.log('renderArticleList函数执行...')
    console.log('searchData.value',searchData.value)
    const res = await articleListApi(params.value.pageNum,params.value.pageSize,searchData.value)
    // console.log('renderArticleList...')
    articleList.value = res.data.items
    total.value = res.data.total
}

renderArticleList()

// 处理状态
const isProcessing = ref(false) // 全局标志位
const history = {
    keyword:'',
    categoryId: null,
    tagId: null
}

// 绑定总线事件
onMounted(()=>{
  // emitter.on('search', receiveParam)
  emitter.on('reset-search', () => {
    console.log('触发了reset-search')
  params.value.pageNum = 1
  searchData.value = {
    keyword: '',
    categoryId: null,
    tagId: null
  }
  renderArticleList() // 主动刷新
})
  
  // 监听路由变化处理参数
  watch(() => route.query, (newQuery) => {
    if (newQuery.type && newQuery.param) {
      console.log('query参数路由执行...')
      updateSearchState({
        type: newQuery.type,
        param: newQuery.param
      })
      renderArticleList()
    }
  }, { immediate: true })
})



    /**
     * 搜索业务(增加用户有没有重复点击相同的按钮)
     * @param {*} data 
     */
  const receiveParam = (data) => {
    if (isProcessing.value) return
    isProcessing.value = true

    // 记录历史值用于重复点击检测
  history.keyword = searchData.value.keyword
  history.categoryId = searchData.value.categoryId
  history.tagId = searchData.value.tagId

  
  // 重复点击检测
  if (data.type === 'cate' && history.categoryId === data.param) {
    console.log('重复点击分类:', data.param)
    isProcessing.value = false
    return
  }
  if (data.type === 'tag' && history.tagId === data.param) {
    console.log('重复点击标签:', data.param)
    isProcessing.value = false
    return
  }
  if (data.type === 'keyword' && 
      (!data.param.trim() || history.keyword === data.param)) {
    console.log('重复点击关键词或空输入')
    isProcessing.value = false
    return
  }

  // 统一使用带参URL确保历史记录正确
  router.push({
    path: '/',
    query: { type: data.type, param: data.param }
  }).finally(() => {
    isProcessing.value = false
  })
  
    }

onUnmounted(()=>{
    console.log("searchData.value.categoryId",searchData.value.categoryId)
    console.log('卸载了...')
})




// 更新搜索状态
const updateSearchState = (data) => {
  params.value.pageNum = 1
  

  
  // 更新当前搜索参数
  searchData.value = {
    keyword: data.type === 'keyword' ? data.param : '',
    categoryId: data.type === 'cate' ? Number(data.param) : null,
    tagId: data.type === 'tag' ? Number(data.param) : null
  }
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