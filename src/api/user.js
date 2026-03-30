import http from '@/utils/http'

// 用户登录
export const userLoginApi = (params) => http.post('/user/login',params)

// 用户详情
export const userInfoApi = () => http.get('/user/userDetailInfo')