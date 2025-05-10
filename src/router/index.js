import AppAbout from '@/views/AppAbout.vue'
import AppBlog from '@/views/AppBlog.vue'
import AppDetail from '@/views/AppDetail.vue'
import AppIndex from '@/views/AppIndex.vue'
import AppLayout from '@/views/AppLayout.vue'
import {createRouter, createWebHistory} from 'vue-router'


// 路由规则
const routes = [
    {path:"/",component :AppLayout,children:[
        {path:"",component:AppIndex},
        {path:"/blog",component:AppBlog},
        {path:"/about",component:AppAbout},
        {path:"/detail/:id",name:'detail',component:AppDetail,props:true},
    ]}

]

// 创建路由对象

const router = createRouter({
    history:createWebHistory(), //采用 html5 路由模式
    routes
})

// 将路由对象暴露出去
export default router