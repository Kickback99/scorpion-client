//main.js
// Vuetify
import 'vuetify/styles'
import './assets/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
// 导入路由
import router from './router'
// 导入pinia
import {createPinia} from 'pinia'
// 导入持久化插件
import persist from 'pinia-plugin-persistedstate'

// 全局导入mdi图标
import '@mdi/font/css/materialdesignicons.css'

// Vuetify 自动导入实例（来自 vite-plugin-vuetify）
import { createVuetify as autoImportVuetify } from 'vuetify'

// 外部配置实例
import vuetifyPlugins from './plugins/vuetify'

// 合并两个实例（保留自动导入+主题配置）
const vuetify = autoImportVuetify(vuetifyPlugins)

const app = createApp(App)
app.use(vuetify) // 只需注册一次
app.use(router)
const pinia = createPinia() //创建Pinia实例
app.use(pinia.use(persist)) //安装pinia插件
app.mount('#app')
