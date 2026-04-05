import http from '@/utils/http'

// 所有分类
export const cateListApi = () => http.get('/user/content/category')

// 所有文章
export const articleListApi = (pageNum,pageSize,searchData) => http.get(`/user/content/article/${pageNum}/${pageSize}`,{params:searchData})

// 热门文章
export const hotListApi = () => http.get('/user/content/article/hot')

// 所有标签
export const tagListApi = () => http.get('/user/content/tag')

// 文章详情
export const articleDetailApi = (param) => http.get(`/user/content/article/detail/${param}`)

//切换收藏状态
export const toggleFavoriteApi = (articleId) => http.post(`/user/favorite/toggle/${articleId}`)