import { defineStore } from "pinia"
import { getConfigApi } from "@/api/config"

export const useConfigStore = defineStore('config', {
  state: () => ({
    // 锚点显示（true开启，false禁用）
    anchor_enabled: true,
    // 前端主题（0：github主题，1：vuepress主题）
    theme: 0,
    // 加载状态
    loading: false,

    // 评论相关
    comment: {
      // 评论显示（true开启，false禁用）
      comment_enabled: true,
      // 子评论默认显示数量
      child_comment_limit: 3,
      // 子评论分页大小
      child_page_size: 7
    },

    // 导航相关
    nav:{
      // 前端登录（true开启，false禁用）
      login_enabled: true,
      // 友链显示
      friend_link_enabled: false,
    }

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
      return this.anchor_enabled === true
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
      return this.nav?.login_enabled === true
    },

    /**
     * 获取友链是否启用
     */
    getFriendLinkEnabled(){
      return this.nav?.friend_link_enabled === true
    },
    
    /**
     * 获取评论是否启用
     */
    getCommentEnabled() {
      return this.comment_enabled === true
    },


    /**
     * 🎯 获取子评论默认显示数量
     */
    getChildCommentLimit() {
      return this.comment?.child_comment_limit ?? 3
    },

    /**
     * 🎯 获取子评论分页大小
     */
    getChildPageSize() {
      return this.comment?.child_page_size ?? 7
    }

  },

  getters: {
    isAnchorEnabled: (state) => state.anchor_enabled === true,
    isLoginEnabled: (state) => state.login_enabled === true,
    currentThemeName: (state) => state.theme === 0 ? 'github' : 'vuepress',
    isCommentEnabled: (state) => state.comment?.comment_enabled === true,
    childCommentLimit: (state) => state.comment?.child_comment_limit ?? 3,
    childPageSize: (state) => state.comment?.child_page_size ?? 7
  }
})