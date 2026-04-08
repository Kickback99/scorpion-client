<template>
    <!-- 全宽应用栏 -->
    <v-app-bar app color="secondary">
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

          <!-- 右侧用户区域 - 桌面端 -->
          <v-spacer></v-spacer>

          <!-- ========== 桌面端主题切换按钮 ========== -->
          <v-btn
            @click="handleToggleTheme"
            variant="text"
            class="mr-2"
          >
            <v-icon>{{ themeStore.isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
          </v-btn>

          <div v-if="isLoggedIn">
            <!-- 用户信息下拉菜单 -->
            <v-menu
              location="bottom"
              offset-y
              transition="slide-y-transition"
            >
              <template v-slot:activator="{ props }">
                <div 
                  v-bind="props"
                  class="user-info-wrapper cursor-pointer d-flex align-center"
                  style="cursor: pointer;"
                >
                  <v-avatar size="36" color="white" class="mr-2">
                    <v-icon color="primary" v-if="!userAvatar">mdi-account-circle</v-icon>
                    <v-img v-else :src="userAvatar" alt="avatar"></v-img>
                  </v-avatar>
                  <span class="text-white text-body-2">{{ userName }}</span>
                  <v-icon color="white" size="20" class="ml-1">mdi-menu-down</v-icon>
                </div>
              </template>
              
              <v-list density="compact" min-width="100" class="mt-2">
                <v-list-item @click="handleProfile">
                  <template v-slot:prepend>
                    <v-icon>mdi-account-circle</v-icon>
                  </template>
                  <v-list-item-title>个人中心</v-list-item-title>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="handleLogout">
                  <template v-slot:prepend>
                    <v-icon>mdi-logout</v-icon>
                  </template>
                  <v-list-item-title>退出登录</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
          <v-btn
            v-else
            color="white"
            variant="outlined"
            @click="handleLogin"
            class="text-none"
          >
            <v-icon left>mdi-account</v-icon>
            登录
          </v-btn>
        </div>
        
        <div v-else class="d-flex ml-auto align-center">

          <!-- 移动端用户区域 -->
          <div v-if="isLoggedIn">
            <v-menu
              location="bottom"
              offset-y
              transition="slide-y-transition"
            >
              <template v-slot:activator="{ props }">
                <div 
                  v-bind="props"
                  class="user-info-wrapper cursor-pointer d-flex align-center"
                  style="cursor: pointer;"
                >
                  <v-avatar size="32" color="white">
                    <v-icon color="primary" v-if="!userAvatar">mdi-account-circle</v-icon>
                    <v-img v-else :src="userAvatar" alt="avatar"></v-img>
                  </v-avatar>
                  <v-icon color="white" size="20" class="ml-1">mdi-menu-down</v-icon>
                </div>
              </template>
              
              <v-list density="compact" min-width="80" class="mt-2 scorpion-list-mobile">
                <v-list-item @click="handleProfile">
                  <template v-slot:prepend>
                    <v-icon>mdi-account-circle</v-icon>
                  </template>
                  <v-list-item-title>个人中心</v-list-item-title>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="handleLogout">
                  <template v-slot:prepend>
                    <v-icon>mdi-logout</v-icon>
                  </template>
                  <v-list-item-title>退出登录</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
          <v-btn
            v-else
            color="white"
            variant="outlined"
            @click="handleLogin"
            class="text-none mr-2 mt-2"
            size="small"
          >
            <v-icon>mdi-account</v-icon>
            登录
          </v-btn>

          <!-- ========== 移动端主题切换按钮（图标按钮） ========== -->
          <v-btn
            @click="handleToggleTheme"
            icon
          >
            <v-icon>{{ themeStore.isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
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
import { ref,watch,computed, onMounted } from 'vue'
import { useDisplay,useTheme  } from 'vuetify'
import { useRouter } from 'vue-router'
// 全局总线
import emitter from '@/utils/event-bus.js'
import { useSearch } from '@/utils/useSearch'
import AppLogin from './AppLogin.vue'
import { useUserStore } from '@/store/user'
import { useThemeStore } from '@/store/theme'


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

// 判断登录
const userStore = useUserStore()

// 判断是否登录
const isLoggedIn = computed(() => {
  return !!userStore.token && Object.keys(userStore.user).length > 0
})

// 用户名（写死的数据，实际应该从 userStore.user 中获取）
const userName = computed(() => {
  // 优先从 store 中获取真实用户名
  if (userStore.user && userStore.user.username) {
    return userStore.user.username
  }
  // 写死的测试数据
  return '张三'
})

// 用户头像（写死的数据，实际应该从 userStore.user 中获取）
const userAvatar = computed(() => {
  // 优先从 store 中获取真实头像
  if (userStore.user && userStore.user.avatar) {
    return userStore.user.avatar
  }
  // 写死的测试数据（返回空字符串表示使用默认图标）
  return ''
})

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

// 处理个人中心点击
const handleProfile = () => {
  console.log('跳转到个人中心')
  // 关闭移动端抽屉
  if (smAndDown.value) {
    drawer.value = false
  }
  // 跳转到个人中心页面
  router.push('/profile')
  // 或者触发事件
  // emitter.emit('openProfile')
}

// 处理退出登录
const handleLogout = () => {
  console.log('退出登录')
  // 清除用户信息
  userStore.removeToken()
  userStore.removeUser()
  
  // 关闭移动端抽屉
  if (smAndDown.value) {
    drawer.value = false
  }

  // 如果当前在个人中心页面，跳转到首页
  if (router.currentRoute.value.path === '/profile') {
    router.push('/')
  }
  
  // 可以弹出提示
  // emitter.emit('showMessage', { type: 'success', text: '已退出登录' })
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


// ========== 主题切换业务 ==========

const vuetifyTheme = useTheme()

const themeStore = useThemeStore() 


/**
 * 处理主题切换
 */
const handleToggleTheme = () => {
  themeStore.toggleTheme(vuetifyTheme)
}

/**
 * 初始化主题：从 Vuetify 同步到 store
 */
const initTheme = () => {
  themeStore.initTheme(vuetifyTheme)
}

// ========== 双向同步 ==========

// 监听 Store 变化，同步到 Vuetify
watch(
  () => themeStore.currentTheme,
  (newTheme) => {
    if (vuetifyTheme.global.name.value !== newTheme) {
      themeStore.applyTheme(vuetifyTheme, newTheme)
    }
  }
)

// 监听 Vuetify 变化，同步到 Store
watch(
  () => vuetifyTheme.global.name.value,
  (newTheme) => {
    if (themeStore.currentTheme !== newTheme) {
      themeStore.setTheme(newTheme)
    }
  }
)


onMounted(()=>{
  // 初始化主题
  initTheme()
})

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

// 用户信息样式
.user-info-wrapper {
  transition: opacity 0.3s ease;
}

.user-info-wrapper:hover {
  opacity: 0.8;
}

.cursor-pointer {
  cursor: pointer;
}

:deep(div.v-list-item__prepend) {
  flex-direction: column !important;
}

:deep(div.scorpion-list-mobile) {
  // 如果需要微调位置
  transform: translateX(-50px) !important;
}
</style>