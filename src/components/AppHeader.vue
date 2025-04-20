<template>
    <div class="d-flex justify-space-between align-center">
        <!-- Logo -->
        <v-toolbar-title>蝎子编程</v-toolbar-title>
        <!-- 导航项 -->
        <div class="hidden-sm-and-down">
            <v-tabs v-model="tab">
                <v-tab v-for="(item, index) in navItems" :key="item.id" :to="item.url">
                    {{ item.name }}
                </v-tab>
            </v-tabs>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const tab = ref(null)

const navItems = ref([
{
            id: 1,
            name: '首页',
            url: '/',
          },
          {
            id: 2,
            name: '博客',
            url: '/blog',
          },
          {
            id: 3,
            name: '关于',
            url: '/about',
          },
])
</script>

<style scoped lang="scss">

</style>