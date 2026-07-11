import { defineStore } from "pinia"
import { getConfigApi } from "@/api/config"

export const useConfigStore = defineStore('config', {
  state: () => ({
    // 加载状态
    loading: false,

    // 轮播数量
    carousel_limit: 3,

    // 评论相关
    comment: {
      // 文章评论显示（true开启，false禁用）
      article_comment_enabled: true,
      // 友链评论显示（true开启，false禁用）
      friend_link_comment_enabled: false,
      // 子评论默认显示数量
      child_comment_limit: 3,
      // 子评论分页大小
      child_page_size: 7,
      // 父评论分页大小
      parent_page_size: 10
    },

    // 导航相关
    nav:{
      // 友链显示
      friend_link_enabled: false,
    },

    // 用户相关
    user: {
      // 前端登录（true开启，false禁用）
      login_enabled: true,
    },

    // 个人中心相关
    profile: {
      my_publishes_enabled: false,
      my_comments_enabled: true,
      my_favorites_enabled: true
    },

    // 文章详情相关
    article_detail: {
      theme: 0, // 前端主题（0：github主题，1：vuepress主题）
      anchor_enabled: true, // 锚点显示（true开启，false禁用）
      favorite_count_enabled: true
    },

    // 文章列表相关
    article_list: {
      view_enabled: true,
      favorite_enabled: true,
      comment_enabled: true,
      load_mode: 'scroll',
      scroll_page_size: 10,
      pagination_page_size: 7
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
     * 获取轮播数量限制
     */
    getCarouselLimit(){
      return this.carousel_limit ?? 3
    },

    /**
     * 获取友链是否启用
     */
    getFriendLinkEnabled(){
      return this.nav?.friend_link_enabled === true
    },

    /**
     * 获取登录是否启用
     */
    getUserLoginEnabled(){
      return this.user?.login_enabled === true
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
     * 根据评论类型和文章自身的评论开关，综合判断评论是否启用
     * @param {String} commentType 评论类型（'article' 或 'friendLink'）
     * @param {String|Number} isComment 文章自身的评论开关（'1'开启，'0'关闭），仅 commentType='article' 时有效
     * @returns {Boolean}
     */
    isCommentTypeEnabledWithExtra(commentType, isComment) {
      // 1. 先检查全局开关
      const globalEnabled = this.isCommentTypeEnabled(commentType)
      if (!globalEnabled) return false

      // 2. 如果是文章评论，额外检查文章自身的 isComment
      if (commentType === 'article') {
        // isComment 为 '1' 表示允许评论
        return isComment === '1' || isComment === 1 || isComment === true
      }

      // 3. 友链评论直接返回全局开关结果
      return globalEnabled
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
     *  获取父评论分页大小
     */
    getParentPageSize(){
      return this.comment?.parent_page_size ?? 10
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

    /**
     * 获取文章主题名称
     */
    getArticleTheme() {
      return this.article_detail?.theme === 0 ? 'github' : 'vuepress'
    },

    /**
     * 获取文章锚点是否启用
     */
    getAnchorEnabled() {
      return this.article_detail?.anchor_enabled ?? true
    },

    /**
     * 获取文章收藏数是否启用
     */
    getFavoriteCountEnabled(){
      return this.article_detail?.favorite_count_enabled ?? true
    },

    /**
     * 获取文章列表浏览是否启用
     */
    getListViewEnabled(){
      return this.article_list?.view_enabled ?? true
    },

    /**
     * 获取文章列表收藏是否启用
     */
    getListFavoriteEnabled(){
      return this.article_list?.favorite_enabled ?? true
    },

    /**
     * 获取文章列表评论是否启用
     */
    getListCommentEnabled(){
      return this.article_list?.comment_enabled ?? true
    },

    /**
     * 获取文章列表加载方式
     */
    getListLoadMode(){
      return this.article_list?.load_mode
    },

    /**
     * 获取滚动模式分页大小
     */
    getListScrollPageSize(){
      return this.article_list?.scroll_page_size ?? 10
    },

    /**
     * 获取分页模式分页大小
     */
    getListPaginationPageSize(){
      return this.article_list?.pagination_page_size ?? 7
    }

  },

  getters: {
    carouselLimit: (state) => state.carousel_limit ?? 3,
    isNavFriendLinkEnabled:(state) => state.nav?.friend_link_enabled === true,
    isUserLoginEnabled: (state) => state.user?.login_enabled === true,
    isArticleCommentEnabled: (state) => state.comment?.article_comment_enabled === true,
    isFriendLinkCommentEnabled: (state) => state.comment?.friend_link_comment_enabled === true,
    childCommentLimit: (state) => state.comment?.child_comment_limit ?? 3,
    childPageSize: (state) => state.comment?.child_page_size ?? 7,
    parentPageSize: (state) => state.comment?.parent_page_size ?? 10,
    isMyPublishesEnabled: (state) => state.profile?.my_publishes_enabled ?? true,
    isMyCommentsEnabled: (state) => state.profile?.my_comments_enabled ?? true,
    isMyFavoritesEnabled: (state) => state.profile?.my_favorites_enabled ?? true,
    currentArticleTheme: (state) => state.article_detail?.theme === 0 ? 'github' : 'vuepress',
    isAnchorEnabled: (state) => state.article_detail?.anchor_enabled ?? true,
    isFavoriteCountEnabled: (state) => state.article_detail?.favorite_count_enabled ?? true,
    isListViewEnabled: (state) => state.article_list?.view_enabled ?? true,
    isListFavoriteEnabled: (state) => state.article_list?.favorite_enabled ?? true,
    isListCommentEnabled: (state) => state.article_list?.comment_enabled ?? true,
    currentListLoadMode: (state) => state. article_list?.load_mode === 'scroll' ? 'scroll' : 'pagination',
    scrollPageSize: (state) => state.article_list?.scroll_page_size ?? 10,
    paginationPageSize: (state) => state.article_list?.pagination_page_size ?? 7,
  }
})