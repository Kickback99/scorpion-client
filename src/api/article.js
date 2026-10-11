import http from '@/utils/http'

// 所有分类
export const cateListApi = () => http.get('/user/blog/category')

// 所有文章
export const articleListApi = (params) => {
  const pageNum = params?.pageNum || 1
  const pageSize = params?.pageSize || 10
  const searchData = params?.searchData || {}
  return http.get(`/user/blog/article/${pageNum}/${pageSize}`, { params: searchData })
}

// 热门文章
export const hotListApi = () => http.get('/user/blog/article/hot')

// 最新文章
export const latestListApi = () => http.get('/user/blog/article/latest')

// 所有标签
export const tagListApi = () => http.get('/user/blog/tag')

// 文章详情
export const articleDetailApi = (param) => http.get(`/user/blog/article/detail/${param}`)

// 切换收藏状态
export const toggleFavoriteApi = (articleId) => http.post(`/user/favorite/toggle/${articleId}`)

// 更新文章浏览量到 redis
export const updateViewCountApi = (id) => http.put(`/user/blog/article/updateViewCount/${id}`)
