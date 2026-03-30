<template>
    <!-- 全宽应用栏 -->
    <v-app-bar app color="primary">
      <!-- 将导航内容限制在容器内 -->
      <v-container class="d-flex align-center">
        <!-- 应用标题/Logo -->
         <v-app-bar-title>
            <router-link 
              to="/" 
              @click="handleLogoClick"
              style="color: inherit; text-decoration: none;"
            >
              蝎子编程
            </router-link>
        </v-app-bar-title>
        
        <!-- 桌面导航 (显示在 md 及以上屏幕) -->
        <div v-if="!smAndDown" class="d-flex ml-4">
          <template v-for="item in categories" :key="item.id">
            <!-- 一级导航项 -->
            <v-btn
              variant="text"
              @click="handleNavClick('cate',item.id)"
              class="text-none"
            >
              {{ item.name }}
              
              <!-- 二级菜单 (桌面端下拉) -->
              <v-menu
                v-if="hasChildren(item)"
                activator="parent"
                location="bottom"
                open-on-hover
              >
                <v-list density="compact">
                  <v-list-item
                    v-for="child in item.children"
                    :key="child.id"
                    @click="handleNavClick('cate',child.id)"
                  >
                    <v-list-item-title>{{ child.name }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-btn>
          </template>
          <v-btn color="success"
            variant="text"
            @click="handleNavClick('about')"
            class="text-none"
            >关于</v-btn>

            <!-- 右侧登录按钮 - 桌面端 -->
          <v-spacer></v-spacer>
          <v-btn
            color="white"
            variant="outlined"
            @click="handleLogin"
            class="text-none"
          >
            <v-icon left>mdi-account</v-icon>
            登录
          </v-btn>
        </div>
        
        <div v-else class="d-flex ml-auto">

          <!-- 移动端登录按钮 -->
          <v-btn
            color="white"
            variant="outlined"
            @click="handleLogin"
            class="text-none mr-2 mt-2"
            size="small"
          >
            <v-icon>mdi-account</v-icon>
            登录
          </v-btn>
        <!-- 移动端菜单按钮 (显示在 sm 及以下屏幕) -->
        <v-btn
          icon
          @click="drawer = !drawer"
          class="ml-auto"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </div>
      </v-container>
    </v-app-bar>
    
    <!-- 移动端抽屉菜单 -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="left"
    >
      <v-list nav density="compact">
        <template v-for="item in categories" :key="item.id">
          <!-- 有子菜单的项 -->
          <v-list-group
            v-if="hasChildren(item)"
            :value="item.id"
            @click="!item.children && handleNavClick('cate',item.id)"
          >
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" :title="item.name"></v-list-item>
            </template>
            
            <v-list-item
              v-for="child in item.children"
              :key="child.id"
              :value="child.id"
              @click="handleNavClick('cate',child.id)"
            >
              <v-list-item-title>{{ child.name }}</v-list-item-title>
            </v-list-item>
          </v-list-group>
          
          <!-- 没有子菜单的项 -->
          <v-list-item
            v-else
            :title="item.name"
            @click="handleNavClick('cate',item.id)"
          ></v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
    <AppLogin></AppLogin>
</template>

<script setup>
import { ref,watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
// 全局总线
import emitter from '@/utils/event-bus.js'
import { useSearch } from '@/utils/useSearch'
import AppLogin from './AppLogin.vue'


const {triggerSearch} = useSearch()

const router = useRouter()
const { smAndDown } = useDisplay()
const drawer = ref(false)

defineProps(['categories'])

// 辅助函数：判断是否有子项
const hasChildren = (item) => {
  return item.children && item.children.length > 0
}

// 监听屏幕尺寸变化，当从移动端切换到桌面端时关闭抽屉
watch(smAndDown, (newValue, oldValue) => {
  // 当从移动端（true）切换到桌面端（false）时，关闭抽屉
  if (oldValue === true && newValue === false) {
    drawer.value = false
  }
})

// 导航数据
const navItems = ref([
  { 
    title: '首页', 
    to: '/',
    icon: 'mdi-home',
    action: () => console.log('导航到首页')
  },
  { 
    title: '产品', 
    icon: 'mdi-apps',
    children: [
      { 
        title: '产品1', 
        to: '/products/1',
        action: () => console.log('导航到产品1') 
      },
      { 
        title: '产品2', 
        to: '/products/2',
        action: () => console.log('导航到产品2') 
      }
    ]
  },
  { 
    title: '关于我们', 
    to: '/about',
    icon: 'mdi-information',
    action: () => console.log('导航到关于我们')
  },
  { 
    title: '联系我们', 
    to: '/contact',
    icon: 'mdi-email',
    action: () => console.log('导航到联系我们')
  }
])

// 处理登录点击
const handleLogin = () => {
  console.log('hello world')
  // 移动端点击登录后可以选择关闭抽屉（如果登录按钮在抽屉内，但这里是独立按钮，所以不需要）
  // 如果需要在移动端点击登录后也关闭抽屉，可以取消下面的注释
  if (smAndDown.value) {
     drawer.value = false
   }
   emitter.emit('loginDialogVisible',true)
}


// 处理Logo点击
const handleLogoClick = () => {
  if (smAndDown.value) drawer.value = false
  emitter.emit('reset-search')
}


// 处理导航点击
const handleNavClick = (type,param) => {
  /* // 执行自定义动作
  if (item.action) item.action()
  
  // 路由跳转
  if (item.to) {
    router.push(item.to)
  } */

  // console.log(item)
  
  // 移动端点击后关闭抽屉
  if (smAndDown.value) {
    drawer.value = false
  }

  if(type === 'about'){
    router.push('/about')
    return
  }

  // emitter.emit('search',{type,param})
  triggerSearch(type,param)
}
</script>

<style scoped lang="scss">
/* 可选的自定义样式 */
/* .v-container {
  max-width: 1280px; 
} */

/* 移除按钮最小宽度 */
.v-btn {
  min-width: 0;
}

/* 导航项悬停效果 */
.v-btn:hover .v-btn__content {
  opacity: 0.8;
}
</style>