import http from '@/utils/http'

// 分类
export const cateListApi = () => http.get('/user/content/category')

// 所有文章
export const articleListApi = (pageNum,pageSize,searchData) => http.get(`/user/content/article/${pageNum}/${pageSize}`,{params:searchData})

// 热门文章
export const hotListApi = () => http.get('user/content/article/hot')