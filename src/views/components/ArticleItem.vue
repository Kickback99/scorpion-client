<template>
    <!-- 文章图文列表 -->
</template>

<script setup>
  import { ref } from 'vue';
  const articles = ref([
    {
      id: 1,
      title: '文章标题1',
      description: '这是文章1的描述。',
      image: 'https://via.placeholder.com/150x150?text=Article+1',
      category: '科技',
      publishedAt: '2023-01-15',
      likes: 150,
    },
    {
      id: 2,
      title: '文章标题2',
      description: '这是文章2的描述。',
      image: 'https://via.placeholder.com/150x150?text=Article+2',
      category: '健康',
      publishedAt: '2023-02-20',
      likes: 200,
    },
    // 添加更多文章数据
  ]);
</script>

<style scoped lang="scss">

</style>