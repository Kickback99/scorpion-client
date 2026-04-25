import { defineStore } from "pinia"
import { getConfigApi } from "@/api/config"

export const useConfigStore = defineStore('config', {
  state: () => ({
    // 评论显示（true开启，false禁用）
    commentEnabled: true,
    // 锚点显示（true开启，false禁用）
    anchorEnabled: true,
    // 前端主题（0：github主题，1：vuepress主题）
    theme: 0,
    // 前端登录（true开启，false禁用）
    loginEnabled: true,
    // 加载状态
    loading: false
  }),

  actions: {
    /**
     * 加载所有配置
     */
    async loadConfig() {
      this.loading = true
      try {
        const res = await getConfigApi()
        if (res.code === 200 && res.data) {
          Object.assign(this.$state, res.data)
        }
      } catch (error) {
        console.error('加载配置失败:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取锚点是否启用
     */
    getAnchorEnabled() {
      return this.anchorEnabled === true
    },

    /**
     * 获取评论是否启用
     */
    getCommentEnabled() {
      return this.commentEnabled === true
    },

    /**
     * 获取当前主题名称
     */
    getCurrentTheme() {
      return this.theme === 0 ? 'github' : 'vuepress'
    }
  },

  getters: {
    isAnchorEnabled: (state) => state.anchorEnabled === true,
    isCommentEnabled: (state) => state.commentEnabled === true,
    isLoginEnabled: (state) => state.loginEnabled === true,
    currentThemeName: (state) => state.theme === 0 ? 'github' : 'vuepress'
  }
})