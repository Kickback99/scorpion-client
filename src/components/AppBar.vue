<template>
    <!-- 个人信息卡片 -->
    <!-- <v-card class="mb-4">
        <v-card-title>个人信息</v-card-title>
        <v-card-text>
            <p>用户名: {{ user.username }}</p>
            <p>邮箱: {{ user.email }}</p>
        </v-card-text>
    </v-card> -->

    <AppBlogBox title="文章搜索">
        <v-text-field
        v-model="keyword"
        full-width
        label="请输入标题/内容" 
        variant="outlined" 
        density="compact" 
        append-inner-icon="mdi-magnify"
        @click:append-inner="onSearch('keyword',keyword)"
        @keyup.enter="onSearch('keyword',keyword)"
        class="px-2"
        >
        </v-text-field>
    </AppBlogBox>

    <AppBlogBox :title="titles.tags">
        <v-chip-group column class="pa-2" mandatory>
        <v-chip label v-for="item in tagList" :key="item.id" @click="onSearch('tag',item.id)"  density="comfortable" size="small" :value="item.id" 
        base-color="primary"
        >{{ item.name }}</v-chip>
        </v-chip-group>
    </AppBlogBox>

    <AppBlogBox title="个人信息">
        <p>用户名: {{ user.username }}</p>
        <p>邮箱: {{ user.email }}</p>
    </AppBlogBox>

    <div ref="hotRef" class="hot-section" :style="isHotFixed ? hotFixedStyle : {}">
    <AppBlogBox title="热门文章">
        <v-list color="primary">
            <v-list-item v-for="(item, index) in hotBlogs" :key="item.id"  :value="item.id" density=compact>
                <template v-slot:prepend>
                    <v-icon color="primary">mdi-numeric-{{index+1}}-box</v-icon>
                </template>

                <v-list-item-title class="text-caption">{{ item.title }}</v-list-item-title>
            </v-list-item>
        </v-list>
    </AppBlogBox>
    </div>

    <div ref="recRef">
    <AppBlogBox :title="titles.articles">
        <v-list>
            <v-list-item 
            v-for="(item, index) in hotBlogs" 
            :key="item.id"  
            :value="item.id"
            :to="{name:'detail',params:{id:item.id}}"
            >
                <template v-slot:prepend>
                    <v-img
                    class="customImg"
                    :src="item.cover || coverRect"
                    width="90"
                    >

                    </v-img>
                </template>
                <v-list-item-title class="text-caption">{{ item.title }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ item.createTime }}</v-list-item-subtitle>
            </v-list-item>
        </v-list>
    </AppBlogBox>
    </div>
</template>

<script setup>
import { onMounted,onUnmounted,ref, watch } from 'vue'
import AppBlogBox from './AppBlogBox.vue';
import { hotListApi, tagListApi } from '@/api/article';
const keyword = ref('')
// 全局总线
import emitter from '@/utils/event-bus.js'
import { useRoute } from 'vue-router';
import { useSearch } from '@/utils/useSearch';
import coverRect from '@/assets/images/cover-rect.png';
const route = useRoute()

const {triggerSearch} = useSearch()
  
const user = ref({
    username: 'JohnDoe',
    email: 'johndoe@example.com',
});

const hotBlogs = ref([])

// 搜索功能
const onSearch = (type,param) => {
    // alert(123)
    // emitter.emit('search',{type,param})
    if(type === 'keyword'){
        if(!param.trim()){
            return
        }
    }
    triggerSearch(type,param)
    keyword.value = ''
}

/* const hotBlogs =[
    {id:1,text: '考前50分-四六级必考词汇预测'},
    {id:2,text: '魔导国东征记-世界守护突破(622~624)三更·0VERLORD'},
    {id:3,text: 'FGo国服《妖精圆桌领域阿瓦隆·勒·菲星辰诞生之刻》2.6前篇主线根'},
    {id:4,text: '1999元的miniLEDHDR1000显示器HKCPG271Q简评'},
    {id:5,text: '22年四六级翻译预测--共青团'},
    {id:6,text: '四六级翻译预测--冬奥会'},
    {id:7,text: '兵装榜2全面推荐泛用兵装，斩击实战检验后'},
    {id:8,text: '为了实现游戏里的二段跳，人类到底能多拼命？'},
    {id:9,text: '2022上半年四级真题--提案，给学校图书馆，学校医院，学生会'},
    {id:10,text: '关于2022年高考数学试题的一点点想法'}
] */

// 动态标题状态
const titles = ref({
    articles:'文章推荐',
    tags:'文章标签'
})

const renderHotList = async() => {
    const res = await hotListApi()
    titles.value.articles = '文章推荐'
    hotBlogs.value =  res.data
}



const tagList = ref([])

const renderTagList = async() =>{
    const res = await tagListApi()
    titles.value.tags = '文章标签'
    tagList.value = res.data
}


// 处理详情页数据
const handleDetailData = (data) => {
    // 如果有分类文章数据，更新分类文章
    if (data.cateArticles && data.cateArticles.length > 0) {
        titles.value.articles = '相关文章'
        hotBlogs.value = data.cateArticles
    } 
    // 如果有标签数据，更新标签数据
    if (data.tags && data.tags.length > 0) {
        titles.value.tags = '标签'
        tagList.value = data.tags
    }
}

onMounted(()=>{
    renderHotList()
    renderTagList()
    emitter.on('detail-data',handleDetailData)
})

onUnmounted(() => {
  emitter.off('detail-data', handleDetailData)
})

// 监听路由地址变化
watch(() => route.path,(newPath) => {
    if(!newPath.includes('/detail')){
        renderHotList()
        renderTagList()
    }
})

// -- 热门文章滚动跟随（今日头条式） --
const hotRef = ref(null)
const recRef = ref(null)
const isHotFixed = ref(false)
const hotFixedStyle = ref({})

let originalRecBottom = 0

const getAppBarHeight = () => {
    const bar = document.querySelector('.v-app-bar')
    return bar ? bar.offsetHeight : 64
}

const handleHotScroll = () => {
    if (!hotRef.value || !recRef.value) return

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    // 静态时持续更新「文章推荐」底部的文档坐标
    if (!isHotFixed.value) {
        const recRect = recRef.value.getBoundingClientRect()
        originalRecBottom = recRect.bottom + scrollTop
    }

    if (scrollTop > originalRecBottom) {
        if (!isHotFixed.value) {
            const rect = hotRef.value.getBoundingClientRect()
            hotFixedStyle.value = {
                position: 'fixed',
                top: getAppBarHeight() + 'px',
                left: rect.left + 'px',
                width: rect.width + 'px',
                zIndex: 10,
            }
            isHotFixed.value = true
        }
    } else {
        isHotFixed.value = false
        hotFixedStyle.value = {}
    }
}

onMounted(() => {
    window.addEventListener('scroll', handleHotScroll, { passive: true })
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleHotScroll)
})
</script>

<style scoped lang="scss">
.hot-section {
    transition: none; // 滚动时不拖影
}

/* 使用深度选择器 */
:deep(.v-list-item__spacer) {
  width: 16px !important; /* 调整为更小的值 */
}

:deep(.customImg+.v-list-item__spacer){
    width: 10px !important; /* 调整为更小的值 */
}

:deep(.v-text-field .v-label) {
  font-size: 10px !important;
}

/* 彻底移除 hover、focus 等所有交互效果 */
/* 强制保持默认边框颜色 */
/* :deep(.v-field__outline) {
  color: rgba(0, 0, 0, 0.38) !important; 
} */

/* 禁用 hover 变色 */
:deep(.v-field:hover .v-field__outline) {
  color: rgba(0, 0, 0, 0.38) !important; 
}

/* 禁用 focus 变色（可选） */
 :deep(.v-field--focused .v-field__outline) {
  color: rgba(0, 0, 0, 0.38) !important; 
}



</style>