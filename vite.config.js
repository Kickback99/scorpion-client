import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import prismjs from 'vite-plugin-prismjs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: true,  // 必须启用自动导入
      styles: { configFile: 'src/assets/styles/variables.scss' },// 可选，用于自定义变量
    }),
      prismjs({
      languages: ['json','xml','java','js'],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
      //配置代理
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:8900', // 后端服务器地址
            changeOrigin: true, // 是否改变请求域名
            rewrite: (path) => path.replace(/^\/api/, '')//将原有请求路径中的api替换为''
          }
        }
      },
})
