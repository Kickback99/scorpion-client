//定制请求的实例

//导入axios  npm install axios
import axios from 'axios';
//定义一个变量,记录公共的前缀  ,  baseURL
const baseURL = import.meta.env.VITE_API;
const instance = axios.create({baseURL,timeout:4000})


//添加响应拦截器
instance.interceptors.response.use(
    res=>{
        if(res.data.code === 0 || res.data.code === 200){
            console.log('哈哈')
            return res.data
        }

        alert(res.data.message || '服务异常')
        return Promise.reject(res.data)
    },
    err=>{
        alert('服务异常');
        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

export default instance;