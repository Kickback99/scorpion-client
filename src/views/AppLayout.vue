<template>
    <v-app>
        <v-app-bar app color="primary" dark>
            <v-container>
                <AppHeader></AppHeader>
            </v-container>
        </v-app-bar>

        <!-- 主内容 -->
        <v-main>
            <v-container>
                <v-row>
                    <!-- 左侧内容：轮播图和文章列表 -->
                    <v-col md="9" cols="12">
                        <!-- 轮播图 -->
                        <AppCarousel></AppCarousel>

                        <v-row>
                            <router-view></router-view>
                        </v-row>
                    </v-col>

                    <!-- 右侧侧边栏 -->
                    <v-col md="3" class="d-none d-md-block">
                        <!-- 个人信息卡片 -->
                        <v-card class="mb-4">
                            <v-card-title>个人信息</v-card-title>
                            <v-card-text>
                            <p>用户名: {{ user.username }}</p>
                            <p>邮箱: {{ user.email }}</p>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup>
import AppCarousel from '@/components/AppCarousel.vue';
import AppHeader from '@/components/AppHeader.vue';
import { ref } from 'vue'
  
const user = ref({
    username: 'JohnDoe',
    email: 'johndoe@example.com',
  });

</script>

<style scoped lang="scss">

</style>