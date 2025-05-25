<template>
    <v-app>
        <AppHeader :categories="categories"></AppHeader>

        <!-- 主内容 -->
        <v-main>
            <v-container>
                <v-row>
                    <!-- 左侧内容：轮播图和文章列表 -->
                    <v-col :md="leftColMd" cols="12">
                        <!-- 轮播图 -->
                        <!-- <AppCarousel></AppCarousel> -->

                        <v-row>
                            <router-view></router-view>
                        </v-row>
                    </v-col>

                    <!-- 右侧侧边栏 -->
                    <v-col md="3" v-show="showSidebar && mdAndUp">
                        <AppBar></AppBar>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup>
import { cateListApi } from '@/api/article';
import AppBar from '@/components/AppBar.vue';
import AppCarousel from '@/components/AppCarousel.vue';
import AppHeader from '@/components/AppHeader.vue';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
// 全局总线
import emitter from '@/utils/event-bus.js'
import { useDisplay } from 'vuetify';

const {mdAndUp} = useDisplay()


const route = useRoute()

const categories = ref([])

const renderCateList = async() => {
    const res = await cateListApi()
    categories.value = res.data
}
renderCateList()

/* watch(()=>route.path,(newPath) => {
    if (newPath !== '/') {
      emitter.emit('reset-search')
    }
}) */


/* watch(route,(to,form) => {
  console.log(to.path)
  sidebarVisible.value = to.path != '/about'
},{immediate:true}) */

const isAboutPage = computed(() => route.path === '/about')
const leftColMd = computed(() => isAboutPage.value ? 12 : 9)
const showSidebar = computed(() => !isAboutPage.value)



console.log('route.path',route.path)

</script>

<style scoped lang="scss">

</style>