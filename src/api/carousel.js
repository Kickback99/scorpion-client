import http from '@/utils/http'

const API = {
    CAROUSEL_URL: '/user/blog/carousel'
}

// 获取轮播图列表
export const getCarouselListApi = () => http.get(`${API.CAROUSEL_URL}/list`)
