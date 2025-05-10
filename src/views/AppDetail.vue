<template>
<v-card>
    <v-card-title>{{ article.title }}</v-card-title>
    <v-card-text>{{ article.content }}</v-card-text>
</v-card>
</template>

<script setup>
import { articleDetailApi } from '@/api/article';
import { ref } from 'vue';

const props = defineProps(['id'])

const article = ref({})

const cateArticles = ref([])

const tags = ref([])

const renderArticleItem = async() => {
    const res = await articleDetailApi(props.id) 
    article.value = res.data.articleItem
    cateArticles.value = res.data.cateArticles
    tags.value = res.data.tagNames
}

renderArticleItem()


</script>

<style scoped lang="scss">

</style>