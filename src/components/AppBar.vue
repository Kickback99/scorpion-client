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
        max-width="80%"  
        label="请输入标题/内容" 
        variant="outlined" 
        density="compact" 
        append-inner-icon="mdi-magnify"
        @click:append-inner="onSearch"
        >
        </v-text-field>
    </AppBlogBox>

    <AppBlogBox title="个人信息">
        <p>用户名: {{ user.username }}</p>
        <p>邮箱: {{ user.email }}</p>
    </AppBlogBox>

    <AppBlogBox title="热门文章">
        <v-list color="error">
            <v-list-item v-for="(item, index) in hotBlogs" :key="item.id"  :value="item.id" density=compact>
                <template v-slot:prepend>
                    <v-icon color="error">mdi-numeric-{{index+1}}-box</v-icon>
                </template>

                <v-list-item-title class="text-caption">{{ item.title }}</v-list-item-title>
            </v-list-item>
        </v-list>
    </AppBlogBox>

    <AppBlogBox title="文章推荐">
        <v-list>
            <v-list-item v-for="(item, index) in hotBlogs" :key="item.id"  :value="item.id">
                <template v-slot:prepend>
                    <v-img
                    class="customImg"
                    src="https://img0.baidu.com/it/u=74028626,2723881857&fm=253&fmt=auto&app=138&f=JPEG"
                    width="90"
                    >

                    </v-img>
                </template>
                <v-list-item-title class="text-caption">{{ item.title }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ item.createTime }}</v-list-item-subtitle>
            </v-list-item>
        </v-list>
    </AppBlogBox>
</template>

<script setup>
import { ref } from 'vue'
import AppBlogBox from './AppBlogBox.vue';
import { hotListApi } from '@/api/article';
  
const user = ref({
    username: 'JohnDoe',
    email: 'johndoe@example.com',
});

const hotBlogs = ref([])

const onSearch = () => {
    // alert(123)
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

const renderHotList = async() => {
    const res = await hotListApi()
    hotBlogs.value =  res.data
}

renderHotList()

</script>

<style scoped lang="scss">
/* 使用深度选择器 */
:deep(.v-list-item__spacer) {
  width: 16px !important; /* 调整为更小的值 */
}

:deep(.customImg+.v-list-item__spacer){
    width: 10px !important; /* 调整为更小的值 */
}
</style>