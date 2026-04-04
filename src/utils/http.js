//定制请求的实例

//导入axios  npm install axios
import { useUserStore } from '@/store/user';
import axios from 'axios';
//定义一个变量,记录公共的前缀  ,  baseURL
const baseURL = import.meta.env.VITE_API;
const instance = axios.create({baseURL,timeout:4000})
import router from '@/router';

import {isAuthRequired} from '@/api/authRequired'
import emitter from '@/utils/event-bus.js'

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
                // 清空用户所有数据
                userStore.clearUserStore()
                // 提示用户重新登录
                emitter.emit('loginDialogVisible',true)
                // 提示信息
                window.$snackbar?.error(res.data?.message || '登录已过期，请重新登录')
                router.replace('/')

            }else ElMessage.error(res.data.message)

            // return Promise.reject(res.data.message)
            // 关键：返回pending的Promise，阻止错误开始向上传递的后续执行
             return new Promise(() => {})
       }

        window.$snackbar?.error(res.data?.message || '服务异常')
        return Promise.reject(res.data.message)
    },
    err=>{
        window.$snackbar?.error('服务异常')
        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

export default instance;