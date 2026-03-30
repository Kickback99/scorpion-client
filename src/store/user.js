import { userInfoApi } from '@/api/user'
import {defineStore} from 'pinia'

// 定义store
// defineStore('仓库的唯一标识',()=>{...})

export const useUserStore = defineStore('user',{
    state:()=>({
        token:'',
        user:{}
    }),
    actions:{
        setToken(newToken) {
            this.token = newToken
        },
        removeToken(){
            this.token = ''
        },
        async getUser(){
            try {
                const res = await userInfoApi()
                this.user = res.data 
            } catch (error) {
                return Promise.reject(error)
            }
        },
        setUser(user) {
            this.user = user
        },
        removeUser(){
            this.user = {}
        }
    },
    persist:true
})