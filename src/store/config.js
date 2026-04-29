import { defineStore } from "pinia"
import { getConfigApi } from "@/api/config"

export const useConfigStore = defineStore('config', {
  state: () => ({
    // 锚点显示（true开启，false禁用）
    anchorEnabled: true,
    // 前端主题（0：github主题，1：vuepress主题）
    theme: 0,
    // 前端登录（true开启，false禁用）
    loginEnabled: true,
    // 加载状态
    loading: false,

    // 评论相关
    comment: {
      // 评论显示（true开启，false禁用）
      commentEnabled: true,
      // 子评论默认显示数量
      childCommentLimit: 3,
      // 子评论分页大小
      childPageSize: 5
    },

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
     * 获取当前主题名称
     */
    getCurrentTheme() {
      return this.theme === 0 ? 'github' : 'vuepress'
    },

    /**
     * 获取登录是否启用
     */
    getLoginEnabled(){
      return this.loginEnabled === true
    },
    
    /**
     * 获取评论是否启用
     */
    getCommentEnabled() {
      return this.commentEnabled === true
    },


    /**
     * 🎯 获取子评论默认显示数量
     */
    getChildCommentLimit() {
      return this.comment?.childCommentLimit ?? 3
    },

    /**
     * 🎯 获取子评论分页大小
     */
    getChildPageSize() {
      return this.comment?.childPageSize ?? 10
    }

  },

  getters: {
    isAnchorEnabled: (state) => state.anchorEnabled === true,
    isLoginEnabled: (state) => state.loginEnabled === true,
    currentThemeName: (state) => state.theme === 0 ? 'github' : 'vuepress',
    isCommentEnabled: (state) => state.comment?.commentEnabled === true,
    childCommentLimit: (state) => state.comment?.childCommentLimit ?? 3,
    childPageSize: (state) => state.comment?.childPageSize ?? 10
  }
})