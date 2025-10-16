import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import prismjs from 'vite-plugin-prismjs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 获取各种环境下的对应的变量
  let env = loadEnv(mode, process.cwd())
  return {
    base: env.VITE_BASE_URL,
    optimizeDeps: {
      exclude: ['markdown-it-toc-done-right'] // 明确排除这个包
    },
    plugins: [
      vue(),
      vuetify({
        autoImport: true,  // 必须启用自动导入
        styles: { configFile: 'src/assets/styles/variables.scss' },// 可选，用于自定义变量
      }),
      prismjs({
        languages: ['json', 'xml', 'java', 'js'],
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
        [env.VITE_API]: {
          target: env.VITE_HOST, // 后端服务器地址
          changeOrigin: true, // 是否改变请求域名
          rewrite: (path) => path.replace(new RegExp(`^${env.VITE_API}`), '')//将原有请求路径中的api替换为''
        }
      }
    },
  }
})
