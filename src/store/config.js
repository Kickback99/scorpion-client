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
      // 文章评论显示（true开启，false禁用）
      article_comment_enabled: true,
      // 友链评论显示（true开启，false禁用）
      friend_link_comment_enabled: false,
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
    },

    // 个人中心相关
    profile: {
      my_publishes_enabled: false,
      my_comments_enabled: true,
      my_favorites_enabled: true
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
     * 获取文章评论是否启用
     */
    getArticleCommentEnabled() {
      return this.comment?.article_comment_enabled === true
    },

    /**
     * 获取友链评论是否启用
     */
    getFriendLinkCommentEnabled(){
      return this.comment?.friend_link_comment_enabled === true
    },

    /**
     * 根据评论类型获取评论是否启用
     * @param {String} commentType 评论类型（'article' 或 'friendLink'）
     * @returns {Boolean}
     */
    isCommentTypeEnabled(commentType) {
      if (commentType === 'friendLink') {
        return this.getFriendLinkCommentEnabled()
      }
      // 默认为文章评论
      return this.getArticleCommentEnabled()
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
    },

    /**
     *  获取我的发布是否开启
     */
    getPublishesEnabled(){
      return this.profile?.my_publishes_enabled ?? true
    },

    /**
     *  获取我的评论是否开启
     */
    getMyCommentsEnabled(){
      return this.profile?.my_comments_enabled ?? true
    },

    /**
     *  获取我的收藏是否开启
     */
    getMyFavoritesEnabled(){
      return this.profile?.my_Favorites_enabled ?? true
    },

  },

  getters: {
    isAnchorEnabled: (state) => state.anchor_enabled === true,
    isLoginEnabled: (state) => state.login_enabled === true,
    currentThemeName: (state) => state.theme === 0 ? 'github' : 'vuepress',
    isArticleCommentEnabled: (state) => state.comment?.article_comment_enabled === true,
    isFriendLinkCommentEnabled: (state) => state.comment?.friend_link_comment_enabled === true,
    childCommentLimit: (state) => state.comment?.child_comment_limit ?? 3,
    childPageSize: (state) => state.comment?.child_page_size ?? 7,
    isMyPublishesEnabled: (state) => state.profile?.my_publishes_enabled ?? true,
    isMyCommentsEnabled: (state) => state.profile?.my_comments_enabled ?? true,
    isMyFavoritesEnabled: (state) => state.profile?.my_favorites_enabled ?? true,
  }
})