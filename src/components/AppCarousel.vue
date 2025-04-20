<template>
       <!--  <v-carousel>
            <v-carousel-item
            v-for="(item, i) in carouselItems"
            :key="i"
            :src="item.src"
            reverse-transition="fade-transition"
            transition="fade-transition"
            ></v-carousel-item>
        </v-carousel> -->
</template>

<script setup>
  import { ref } from 'vue';
  // 示例数据
  const carouselItems = ref([
    { src: '../assets/course01.png' },
    { src: '../assets/course02.png' },
    { src: '../assets/course03.png' },
  ]);
</script>

<style scoped lang="scss">

</style>