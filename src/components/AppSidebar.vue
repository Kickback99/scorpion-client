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

    <!-- <AppBlogBox title="个人信息">
        <p>用户名: {{ user.username }}</p>
        <p>邮箱: {{ user.email }}</p>
    </AppBlogBox> -->

    <div ref="hotRef" class="hot-section" :class="{ 'is-fixed': isHotFixed }" :style="isHotFixed ? hotFixedStyle : {}">
    <AppBlogBox title="热门文章">
        <v-list color="primary">
            <v-list-item v-for="(item, index) in hotBlogs" :key="item.id"  :value="item.id" density=compact :to="{name:'detail',params:{id:item.id}}">
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
            v-for="(item, index) in latestBlogs"
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
import { nextTick, onMounted,onUnmounted,ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import AppBlogBox from './AppBlogBox.vue';
import { hotListApi, latestListApi, tagListApi } from '@/api/article';
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
const latestBlogs = ref([])

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
    articles:'最新发布',
    tags:'文章标签'
})

const renderHotList = async() => {
    const res = await hotListApi()
    hotBlogs.value =  res.data
}

const renderLatestList = async() => {
    const res = await latestListApi()
    titles.value.articles = '最新发布'
    latestBlogs.value = res.data
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
        latestBlogs.value = data.cateArticles
    } 
    // 如果有标签数据，更新标签数据
    if (data.tags && data.tags.length > 0) {
        titles.value.tags = '标签'
        tagList.value = data.tags
    }
}

onMounted(()=>{
    renderHotList()
    renderLatestList()
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
        renderLatestList()
        renderTagList()
    }
})

// -- 热门文章滚动跟随（今日头条式） --
const { mobile } = useDisplay()

const hotRef = ref(null)
const recRef = ref(null)
const isHotFixed = ref(false)
const hotFixedStyle = ref({})

let originalRecBottom = 0
let flipTimer = null
let sidebarNaturalTop = 0 // v-col 顶部的文档坐标，用于 fixed 时对齐「文章搜索」间距

const animateFlip = (toFixed) => {
    const el = hotRef.value
    if (!el) return

    // 取消进行中的动画
    clearTimeout(flipTimer)
    el.style.transition = 'none'

    // FIRST — 记录当前位置
    const first = el.getBoundingClientRect()

    // 切换状态
    if (toFixed) {
        // 测量 v-col 内容区顶部文档坐标（含 padding），保证与「文章搜索」位置一致
        if (!sidebarNaturalTop) {
            const vCol = el.closest('.v-col')
            if (vCol) {
                const r = vCol.getBoundingClientRect()
                const s = getComputedStyle(vCol)
                const padTop = parseFloat(s.paddingTop) || 0
                sidebarNaturalTop = r.top + (window.pageYOffset || document.documentElement.scrollTop) + padTop
            }
        }
        hotFixedStyle.value = {
            position: 'fixed',
            top: (sidebarNaturalTop || 64) + 'px',
            left: first.left + 'px',
            width: first.width + 'px',
            zIndex: 10,
        }
        isHotFixed.value = true
    } else {
        isHotFixed.value = false
        hotFixedStyle.value = {}
    }

    // LAST — 记录新位置 & INVERT
    requestAnimationFrame(() => {
        const last = el.getBoundingClientRect()
        const deltaY = first.top - last.top
        const deltaX = first.left - last.left

        if (Math.abs(deltaY) < 1 && Math.abs(deltaX) < 1) {
            el.style.transform = ''
            el.style.transition = ''
            return
        }

        // 反偏移：视觉上留在原位
        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`
        el.offsetHeight // 强制回流

        // PLAY — 动画归零
        el.style.transition = 'transform 0.5s ease-out'
        el.style.transform = 'translate(0, 0)'

        flipTimer = setTimeout(() => {
            el.style.transition = ''
            el.style.transform = ''
        }, 520)
    })
}

const updateFixedStyle = () => {
    const el = hotRef.value
    if (!el) return

    const vCol = el.closest('.v-col')
    if (!vCol) return

    const r = vCol.getBoundingClientRect()
    const s = getComputedStyle(vCol)
    const padTop = parseFloat(s.paddingTop) || 0
    const padLeft = parseFloat(s.paddingLeft) || 0
    const padRight = parseFloat(s.paddingRight) || 0
    sidebarNaturalTop = r.top + (window.pageYOffset || document.documentElement.scrollTop) + padTop

    hotFixedStyle.value = {
        position: 'fixed',
        top: sidebarNaturalTop + 'px',
        left: (r.left + padLeft) + 'px',
        width: (r.width - padLeft - padRight) + 'px',
        zIndex: 10,
    }
}

const handleResize = () => {
    if (!isHotFixed.value) return
    updateFixedStyle()
}

const handleHotScroll = () => {
    if (!hotRef.value || !recRef.value) return
    if (mobile.value) return

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    // 静态时持续更新「文章推荐」底部的文档坐标
    if (!isHotFixed.value) {
        const recRect = recRef.value.getBoundingClientRect()
        originalRecBottom = recRect.bottom + scrollTop
    }

    if (scrollTop > originalRecBottom) {
        if (!isHotFixed.value) animateFlip(true)
    } else {
        if (isHotFixed.value) animateFlip(false)
    }
}

const bindScroll = () => {
    if (!mobile.value) {
        window.addEventListener('scroll', handleHotScroll, { passive: true })
        window.addEventListener('resize', handleResize)
        // 从移动端切回桌面端：等 DOM 更新后再检查，避免 v-col 仍为 display:none 导致测量为 0
        nextTick(() => handleHotScroll())
    } else {
        window.removeEventListener('scroll', handleHotScroll)
        window.removeEventListener('resize', handleResize)
        // 清理 FLIP 动画残留
        clearTimeout(flipTimer)
        if (hotRef.value) {
            hotRef.value.style.transition = ''
            hotRef.value.style.transform = ''
        }
        // 移动端还原状态
        isHotFixed.value = false
        hotFixedStyle.value = {}
        originalRecBottom = 0
        sidebarNaturalTop = 0
    }
}

onMounted(() => {
    bindScroll()
    watch(mobile, bindScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleHotScroll)
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.hot-section {
    transition: none; // FLIP 自行管理动画，不靠 CSS transition
}

/* .hot-section.is-fixed {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
} */

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

/* 聚焦时使用 primary 颜色（含聚焦时悬停，避免反跳） */
:deep(.v-field--focused .v-field__outline),
:deep(.v-field--focused:hover .v-field__outline) {
  color: rgb(var(--v-theme-primary)) !important;
}

:deep(.v-field__input) {
  font-size: 12px !important;
}



</style>