//定制请求的实例

//导入axios  npm install axios
import { useUserStore } from '@/store/user';
import axios from 'axios';
//定义一个变量,记录公共的前缀  ,  baseURL
const baseURL = import.meta.env.VITE_API;
const instance = axios.create({baseURL,timeout:4000})
import router from '@/router';

import {isAuthRequired} from '@/api/authRequired'
import { useWebSocket } from '@/server/useWebSocket.js'
// 关闭 WebSocket（修改密码/注销后断开连接，与 Header 的 handleLogout 保持一致）
const { closeWebSocket } = useWebSocket()


//添加请求拦截器
instance.interceptors.request.use(
    config => {
        const userStore = useUserStore()
        // 根据路径判断是否需要携带 token
        if(userStore.token && isAuthRequired(config.url)){
            config.headers.authorization = userStore.token
        }

        return config
    },

    err => Premise.reject(err)
)


//添加响应拦截器
instance.interceptors.response.use(
    res=>{
        if(res.data.code === 0 || res.data.code === 200){
            console.log('哈哈')
            return res.data
        }

        //匹配状态码为40开头的正则 
       let regex = /^40[0-9]$/

              if(regex.test(res.data.code)) {

            if(res.data.code === 401){
                console.log('响应拦截器执行...')
                // 处理token过期或者篡改
                const userStore = useUserStore()
                // 清除 websocket 连接状态
                closeWebSocket()
                // 清空用户所有数据
                userStore.clearUserStore()
                // 提示用户重新登录
                // emitter.emit('loginDialogVisible',true)
                // 提示信息
                window.$snackbar?.error(res.data?.message || '登录已过期，请重新登录')
                router.replace('/')

            }else window.$snackbar?.error(res.data.message)

            // 返回 reject 让调用方的 catch/finally 正常执行，loading 状态能正确复位
            return Promise.reject(res.data.message)
       }

        window.$snackbar?.error(res.data?.message || '服务异常')
        return Promise.reject(res.data.message)
    },
    err=>{
        let message
        if (err.code === 'ECONNABORTED') {
            message = '请求超时，请检查网络连接'
        } else if (['ERR_NETWORK', 'ERR_CONNECTION_REFUSED'].includes(err.code)
                || err.message === 'Network Error') {
            message = '网络连接失败，请检查网络'
        } else {
            message = '服务异常，请稍后重试'
        }
        window.$snackbar?.error(message)
        return Promise.reject(err)
    }
)

export default instance;