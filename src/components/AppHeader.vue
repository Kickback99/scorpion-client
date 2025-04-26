<template>
  <v-app>
    <!-- 全宽应用栏 -->
    <v-app-bar app color="primary">
      <!-- 将导航内容限制在容器内 -->
      <v-container class="d-flex align-center pa-0">
        <!-- 应用标题/Logo -->
        <v-app-bar-title>My App</v-app-bar-title>
        
        <!-- 桌面导航 (显示在 md 及以上屏幕) -->
        <div v-if="!smAndDown" class="d-flex ml-4">
          <template v-for="item in navItems" :key="item.title">
            <!-- 一级导航项 -->
            <v-btn
              variant="text"
              @click="handleNavClick(item)"
              class="text-none"
            >
              {{ item.title }}
              
              <!-- 二级菜单 (桌面端下拉) -->
              <v-menu
                v-if="item.children"
                activator="parent"
                location="bottom"
                open-on-hover
              >
                <v-list density="compact">
                  <v-list-item
                    v-for="child in item.children"
                    :key="child.title"
                    @click="handleNavClick(child)"
                  >
                    <v-list-item-title>{{ child.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-btn>
          </template>
        </div>
        
        <!-- 移动端菜单按钮 (显示在 sm 及以下屏幕) -->
        <v-btn
          v-else
          icon
          @click="drawer = !drawer"
          class="ml-auto"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </v-container>
    </v-app-bar>
    
    <!-- 移动端抽屉菜单 -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="left"
    >
      <v-list nav density="compact">
        <template v-for="item in navItems" :key="item.title">
          <!-- 有子菜单的项 -->
          <v-list-group
            v-if="item.children"
            :value="item.title"
            @click="!item.children && handleNavClick(item)"
          >
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" :title="item.title"></v-list-item>
            </template>
            
            <v-list-item
              v-for="child in item.children"
              :key="child.title"
              :value="child.title"
              @click="handleNavClick(child)"
            >
              <v-list-item-title>{{ child.title }}</v-list-item-title>
            </v-list-item>
          </v-list-group>
          
          <!-- 没有子菜单的项 -->
          <v-list-item
            v-else
            :title="item.title"
            @click="handleNavClick(item)"
          ></v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
    
    <v-main>
      <v-container>
        <!-- 页面内容 -->
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'

const router = useRouter()
const { smAndDown } = useDisplay()
const drawer = ref(false)

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

// 处理导航点击
const handleNavClick = (item) => {
  // 执行自定义动作
  if (item.action) item.action()
  
  // 路由跳转
  if (item.to) {
    router.push(item.to)
  }
  
  // 移动端点击后关闭抽屉
  if (smAndDown.value) {
    drawer.value = false
  }
}
</script>

<style scoped lang="scss">
/* 可选的自定义样式 */
.v-container {
  max-width: 1280px; /* 根据设计系统调整 */
}

/* 移除按钮最小宽度 */
.v-btn {
  min-width: 0;
}

/* 导航项悬停效果 */
.v-btn:hover .v-btn__content {
  opacity: 0.8;
}
</style>