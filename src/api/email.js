import http from '@/utils/http'

/**
 * 发送注册邮箱验证码
 * @param {Object} params 请求参数，{ email: 邮箱 }
 * @returns {Promise}
 */
export const emailCodeSendApi = (params) => http.post('/user/email/code', params)
