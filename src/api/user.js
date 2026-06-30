import http from '@/utils/http'

// 用户登录
export const userLoginApi = (params) => http.post('/user/login',params)

// 用户详情
export const userInfoApi = () => http.get('/user/userDetailInfo')

// 用户注销
export const userLogoutApi = () => http.get("/user/logout")

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

// 删除用户评论
export const deleteCommentApi = (commentId) => {
  return http({
    url: `/user/userComment/${commentId}`,
    method: 'delete'
  })
}

// 修改用户基本资料
export const userUpdateInfoApi = (params) => {
    const formData = new FormData()
    for(const k in params){
        if(params[k] != null){
        formData.append(k,params[k])
        }
    }
    return http.put('/user/updateUserDetailInfo',formData)
}