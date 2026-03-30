import AppAbout from '@/views/AppAbout.vue'
import AppBlog from '@/views/AppBlog.vue'
import AppDetail from '@/views/AppDetail.vue'
import AppIndex from '@/views/AppIndex.vue'
import AppLayout from '@/views/AppLayout.vue'
import {createRouter, createWebHistory} from 'vue-router'
import { useUserStore } from '@/store/user'
import AppProfileCenter from '@/components/AppProfileCenter.vue'


// 路由规则
const routes = [
    {path:"/",component :AppLayout,children:[
        {path:"",component:AppIndex},
        {path:"/blog",component:AppBlog},
        {path:"/about",component:AppAbout},
        {
            path: '/profile',
            name: 'Profile',
            component: AppProfileCenter
        },
        {path:"/detail/:id",name:'detail',component:AppDetail,props:true},
    ]}

]

// 创建路由对象

const router = createRouter({
    history:createWebHistory(import.meta.env.VITE_ROUTER_URL), //采用 html5 路由模式
    routes
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = !!userStore.token && Object.keys(userStore.user).length > 0
  
  // 如果需要登录才能访问的页面
  if (to.path === '/profile' && !isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

// 将路由对象暴露出去
export default router