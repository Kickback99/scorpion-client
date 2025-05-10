<template>
<v-card>
    <v-card-title>{{ article.title }}</v-card-title>
    <v-card-text>{{ article.content }}</v-card-text>
</v-card>
</template>

<script setup>
import { articleDetailApi } from '@/api/article';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
// 全局总线
import emitter from '@/utils/event-bus.js'

const route = useRoute()

const props = defineProps(['id'])

const article = ref({})

const cateArticles = ref([])

const tags = ref([])

const renderArticleItem = async() => {
    const res = await articleDetailApi(props.id) 
    console.log("res.data",res.data)
    article.value = res.data.articleItem
    cateArticles.value = res.data.cateArticles
    tags.value = res.data.tags
    // 发射数据
    emitter.emit('detail-data', {
        cateArticles:cateArticles.value, 
        tags:tags.value
    })
}

renderArticleItem()

// 监听路由参数变化
watch(()=>route.params.id,(newId)=>{
    if(newId){
        renderArticleItem()
    }
})

</script>

<style scoped lang="scss">

</style>