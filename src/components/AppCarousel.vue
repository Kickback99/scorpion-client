<template>
  <v-card>
  <v-carousel>
    <v-carousel-item
      v-for="(item, i) in carouselItems"
      :key="i"
    >
      <v-img :src="item.src" cover />
    </v-carousel-item>
  </v-carousel>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';

const carouselItems = ref([
  { src: new URL('../assets/course01.png', import.meta.url).href },
  { src: new URL('../assets/course02.png', import.meta.url).href },
  { src: new URL('../assets/course03.png', import.meta.url).href },
]);
</script>