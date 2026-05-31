import http from '@/utils/http'

// 用户登录
export const userLoginApi = (params) => http.post('/user/login',params)

// 用户详情
export const userInfoApi = () => http.get('/user/userDetailInfo')

// 用户收藏
export const userFavoritesApi = (params) => {
  const pageNum = params?.pageNum || 1
  const pageSize = params?.pageSize || 9999
  return http.get(`/user/favorites/${pageNum}/${pageSize}`)
}

// 取消收藏
export const deleteFavoriteApi = (articleId) => http.delete(`/user/favorites/${articleId}`)

// 获取用户评论列表
export const getUserCommentsApi = (params) => {
  const pageNum = params?.pageNum || 1
  const pageSize = params?.pageSize || 9999
  return http.get(`/user/comments/${pageNum}/${pageSize}`)
}

// 删除用户评论（待后端实现 - 占位符）
export const deleteUserCommentApi = (commentId) => {
  // TODO: 后端接口实现后替换为真实调用
  console.log('🚧 [待实现] 删除评论接口 - commentId:', commentId)
  return Promise.resolve({ code: 200, message: '删除成功（模拟）' })
  
  // 真实接口示例（后端实现后启用）：
  // return request({
  //   url: `/user/comments/${commentId}`,
  //   method: 'delete'
  // })
}