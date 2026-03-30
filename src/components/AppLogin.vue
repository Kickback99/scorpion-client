<template>
    <v-dialog persistent no-click-animation :width="handleWidth" v-model="dialogVisible" content-class="rounded-8">
        <template #default>
            <div class="dialog-container">
                <v-btn
                    icon
                    active="grey"
                    variant="text"
                    size="0"
                    class="dialog-close-btn"
                    @click="dialogVisible = false"
                >
                    <v-icon size="30" color="grey">mdi-close-circle</v-icon>
                </v-btn>
                <v-window v-model="step"
                >
                    <!-- 登录视图 -->
                    <v-window-item :value="1">
                        <v-card title :width="handleWidth" height="auto"  :class="`d-flex flex-column ${handlePadding}`">
                            <v-container class="d-flex align-center">
                                <h2>登录</h2>
                                <span class="text-caption ml-auto">
                                    没有账号?
                                    <a class="text-decoration-none" href="#" @click="switchToRegister">点击注册</a>
                                </span>
                            </v-container>
                            <v-container class="pb-2">
                            <v-form 
                            ref="loginFormRef" 
                            @submit.prevent="handleLogin"
                            >
                                <!-- 账号文本框 -->
                                <v-text-field
                                    variant="outlined"
                                    density="compact"
                                    v-model="loginModel.username"
                                    label="账号 / 邮箱 / 手机号"
                                    placeholder="请输入账号 / 邮箱 / 手机号"
                                    :rules="loginRules.username"
                                    prepend-inner-icon="mdi-account"
                                    class="mb-3"
                                ></v-text-field>        
                                <!-- 密码文本框 -->
                                <v-text-field
                                    variant="outlined"
                                    density="compact"
                                    v-model="loginModel.password"
                                    :append-inner-icon="loginShowPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                    @click:append-inner="eyeLoginPwd"
                                    :type="loginShowPassword ? 'text' : 'password'"
                                    label="密码"
                                    placeholder="请输入密码"
                                    :rules="loginRules.password"
                                    :prepend-inner-icon="loginShowPassword ? 'mdi-lock-open-outline' : 'mdi-lock-outline'"
                                    >
                                </v-text-field>

                                <!-- 条款与协议 -->
                                <v-checkbox
                                density="compact"
                                style="--v-input-control-height: 20px; --v-input-padding-top: 8px;"
                                class="my-4" 
                                v-model="loginTerm"
                                :rules="loginRules.term"
                                >
                                    <template #label>
                                        <span class="text-caption text-grey-darken-1">
                                            同意本网站的条款与协议
                                        </span>
                                    </template> 
                                </v-checkbox>

                                <v-btn 
                                block 
                                color="success" 
                                :loading="loading"
                                type="submit"
                                >登录</v-btn>
                                <v-container class="text-center">
                                    <a href="" class="text-decoration-none text-caption text-grey">忘记密码</a>
                                </v-container>
                                </v-form>
                            </v-container>
                            <!-- 其他登录方式 -->
                            <v-container class="mt-auto pt-0">
                                <v-sheet class="d-flex align-center mb-3">
                                    <v-divider class="flex-grow-1" />
                                    <span class="text-caption mx-4 text-grey" style="flex-shrink: 0;">其他的登录方式</span>
                                    <v-divider class="flex-grow-1" />
                                </v-sheet>
                                <!-- 图标 -->
                                <v-sheet class="text-center py-0">
                                    <v-btn
                                    icon
                                    size="small"
                                    v-for="(item, index) in chats" :key="item.id"
                                    :color="item.color ? item.color : ''"
                                    :to="item.to"
                                    :class="{'ml-8':(index != 0)}"
                                    >
                                    <v-icon>{{ item.icon }}</v-icon> 
                                    </v-btn>        
                                </v-sheet>
                            </v-container>
                        </v-card> 
                    </v-window-item>

                    <!-- 注册视图 -->
                    <v-window-item :value="2">
                        <v-card title :width="handleWidth" height="auto" :class="`d-flex flex-column ${handlePadding}`">
                            <v-container class="d-flex align-center">
                                <h2>注册</h2>
                                <span class="text-caption ml-auto">
                                    已有账号?
                                    <a class="text-decoration-none" href="#" @click="switchToLogin">点击登录</a>
                                </span>
                            </v-container>
                            <v-container>
                            <v-form
                            ref="registerFormRef" 
                            @submit.prevent="handleRegister"
                            >
                                <v-text-field
                                    variant="outlined"
                                    density="compact"
                                    v-model="registerModel.username"
                                    label="用户名"
                                    placeholder="请输入用户名"
                                    :rules="registerRules.username"
                                    prepend-inner-icon="mdi-account"
                                    class="mb-3"
                                >
                                </v-text-field>
                                <v-text-field
                                    variant="outlined"
                                    density="compact"
                                    v-model="registerModel.password"
                                    :append-inner-icon="registerShowPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                    @click:append-inner="eyeRegisterPwd"
                                    :type="registerShowPassword ? 'text' : 'password'"
                                    label="密码"
                                    placeholder="请输入密码"
                                    :rules="registerRules.password"
                                    :prepend-inner-icon="registerShowPassword ? 'mdi-lock-open-outline' : 'mdi-lock-outline'"
                                    class="mb-3"
                                >
                                </v-text-field>
                                <v-text-field
                                    variant="outlined"
                                    density="compact"
                                    v-model="registerModel.rePassword"
                                    :append-inner-icon="registerShowPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                    @click:append-inner="eyeRegisterPwd"
                                    :type="registerShowPassword ? 'text' : 'password'"
                                    label="确认密码"
                                    placeholder="请输入确认密码"
                                    :rules="registerRules.rePassword"
                                    :prepend-inner-icon="registerShowPassword ? 'mdi-lock-open-outline' : 'mdi-lock-outline'"
                                    class="mb-3"
                                >
                                </v-text-field>
                                <v-text-field
                                    variant="outlined"
                                    density="compact"
                                    v-model="registerModel.email"
                                    label="邮箱"
                                    placeholder="请输入邮箱"
                                    :rules="registerRules.email"
                                    prepend-inner-icon="mdi-email"
                                    class="mb-3"
                                    name="email"
                                >
                                </v-text-field>
                                <v-row  style="margin-bottom: -20px;">
                                    <v-col :cols="!display.mobile.value?8:7">
                                        <v-text-field
                                        variant="outlined"
                                        density="compact"
                                        v-model="registerModel.verifyCode"
                                        label="验证码"
                                        placeholder="请输入验证码"
                                        :rules="registerRules.verifyCode"
                                        prepend-inner-icon="mdi-email"
                                        > 
                                        </v-text-field>
                                    </v-col>
                                    <v-col :cols="!display.mobile.value?4:5">
                                        <v-btn block color="info" :disabled="countdown > 0 || isSending"
                                        @click="sendVerifyCode"
                                        >
                                            <span v-if="countdown > 0">{{ countdown }}秒后重试</span>
                                            <span v-else>获取验证码</span>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                                    <!-- 条款与协议 -->
                                <v-checkbox
                                density="compact"
                                style="--v-input-control-height: 20px; --v-input-padding-top: 8px;"
                                class="my-4" 
                                v-model="registerTerm"
                                :rules="registerRules.term"
                                >
                                    <template #label>
                                        <span class="text-caption text-grey-darken-1">
                                            同意本网站的条款与协议
                                        </span>
                                    </template> 
                                </v-checkbox>
                                
                                <v-btn 
                                block 
                                color="success" 
                                :loading="registerLoading"
                                type="submit"
                                >注册</v-btn>
                            </v-form>
                            </v-container>
                        </v-card> 
                    </v-window-item>
                    <v-window-item :value="3">
                        <v-card title :width="handleWidth" height="auto" class="d-flex align-center">
                            <v-container class="text-center">
                                <v-icon size="120" color="success">mdi-check-circle</v-icon> 
                                <h3 class="mt-4">恭喜你，注册成功</h3>
                                <p class="text-caption text-grey">请前往邮箱，查看账号信息
                                    <a href="#" @click="forwardLogin" class="text-decoration-none">前往登录</a>
                                </p>
                            </v-container>
                        </v-card> 
                    </v-window-item>
                </v-window>
            </div>
        </template>
    </v-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useDisplay } from 'vuetify'
const display = useDisplay()

const dialogVisible = ref(false)

const step = ref(1)

import emitter from '@/utils/event-bus.js'


// ------------------------ 响应式 ------------------------

const handleWidth = computed(()=>{
    if(display.smAndDown.value){
        return '350'
    }else return '500'
})

const handlePadding = computed(()=>{
    return display.mobile.value ? 'pa-8': 'pa-10'
})

// ------------------------ 全局总线 ------------------------ 

emitter.on('loginDialogVisible',param => {
    if(dialogVisible.value && param === true) return
    dialogVisible.value = param
    if(step.value != 1){
        step.value = 1
    }
})

import { onUnmounted } from 'vue'
onUnmounted(() => {
    emitter.off('loginDialogVisible')
})

// ------------------------ 登录相关 ------------------------ 

const loginModel = reactive({})

const loginShowPassword = ref(false)

const loginTerm = ref(false)

const chats = reactive([
    {id:'001',icon:'mdi-qqchat',color:'info',to:''},
    {id:'002',icon:'mdi-wechat',color:'success',to:''},
    {id:'001',icon:'mdi-github',color:'black',to:''},
])

const eyeLoginPwd = () => {
     loginShowPassword.value = !loginShowPassword.value
}

// 获取表单 ref
const loginFormRef = ref(null)
const loading = ref(false)

watch(step,()=>{
    if(step.value != 1){
        Object.assign(loginModel,{username:'',password:''})
    }
})

/* // 实时校验表单状态
const validateForm = async () => {
    if (!loginFormRef.value) return
    
    try {
        const { valid } = await loginFormRef.value.validate()
        isFormValid.value = valid
    } catch (error) {
        isFormValid.value = false
    }
}

// 监听表单数据变化，实时校验
watch(
    () => [loginModel.username, loginModel.password, loginTerm.value],
    () => {
        validateForm()
    },
    { deep: true }
) */


// 登录表单校验规则（类似 Element Plus 风格）
const loginRules = {
    username: [
        (v) => !!v || '请输入账号/邮箱/手机号',
        (v) => {
            if (!v) return true
            // 校验用户名（4-20位字母数字下划线）
            const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/
            // 校验邮箱
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            // 校验手机号（简单校验11位数字，可根据需要调整）
            const phoneRegex = /^1[3-9]\d{9}$/
            
            if (usernameRegex.test(v)) return true
            if (emailRegex.test(v)) return true
            if (phoneRegex.test(v)) return true
            
            return '请输入正确的账号（4-20位字母/数字/下划线）、邮箱或手机号'
        }
    ],
    password: [
        (v) => !!v || '请输入密码',
        (v) => /^\S{4,15}$/.test(v) || '密码必须是 4-15位 的非空字符'
    ],
    term: [
        (v) => !!v || '请同意本网站的条款与协议'
    ]
}

// 登录处理
const handleLogin = async () => {
    // if (!loginFormRef.value) return

    await loginFormRef.value.validate()
    
    loading.value = true
    try {
        // 再次确认表单校验
        const { valid } = await loginFormRef.value.validate()
        
        if (valid) {
            // 这里调用登录接口
            console.log('登录信息:', loginModel)
            console.log('是否同意条款:', loginTerm.value)
            
            // 模拟登录请求
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // 登录成功后的处理
            // dialogVisible.value = false
            // 跳转到首页等
        }
    } catch (error) {
        console.error('登录失败:', error)
    } finally {
        loading.value = false
    }
}

// ------------------------ 注册相关 ------------------------ 

const registerModel = reactive({})

const registerShowPassword = ref(false)

const registerTerm = ref(false)

const eyeRegisterPwd = () => {
    //如果type是password类型，点击就把图标切换到mdi-eye-off

    //否则就把图标切换到mdi-eye

     registerShowPassword.value = !registerShowPassword.value
}

const registerLoading = ref(false)
const registerFormRef = ref(null)

// ========== 注册表单校验规则 ==========
const registerRules = {
    username: [
        (v) => !!v || '请输入用户名',
        (v) => /^[a-zA-Z0-9_]{4,20}$/.test(v) || '用户名必须是 4-20位 的字母、数字或下划线'
    ],
    password: [
        (v) => !!v || '请输入密码',
        (v) => /^\S{4,15}$/.test(v) || '密码必须是 4-15位 的非空字符'
    ],
    rePassword: [
        (v) => !!v || '请确认确认密码',
        (v) => v === registerModel.password || '两次输入的密码不一致'
    ],
    email:[
        (v) => !!v || '请输入邮箱',
        (v) => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) || '邮箱格式不正确'
    ],
    verifyCode:[
        (v) => !!v || '请输入验证码'
    ],
    term: [
        (v) => !!v || '请同意本网站的条款与协议'
    ]
}

// 注册处理
const handleRegister = async () => {
    // if (!registerFormRef.value) return

    await registerFormRef.value.validate()
    
    registerLoading.value = true
    try {
        const { valid } = await registerFormRef.value.validate()
        
        if (valid) {
            console.log('注册信息:', registerModel)
            // 这里调用注册接口
            await new Promise(resolve => setTimeout(resolve, 1000))
            // 注册成功后切换到成功页面
            step.value = 3
        }
    } catch (error) {
        console.error('注册失败:', error)
    } finally {
        registerLoading.value = false
    }
}

// ------------------------ 验证码倒计时相关 ------------------------

const countdown = ref(0) // 倒计时秒数
const isSending = ref(false) // 是否正在发送验证码

// 封装：校验指定的多个字段
const validateFields = async (fieldNames) => {
    const fields = fieldNames.map(name => 
        registerFormRef.value?.items?.find(item => 
            item.vm?.vnode?.props?.name === name || item.vm?.vnode?.props?.label === name
        )
    ).filter(Boolean)
    
    if (fields.length === 0) {
        // 如果没有找到指定字段，校验整个表单
        const result = await registerFormRef.value?.validate()
        return result?.valid || false
    }
    
    // 重置所有字段的校验状态
    await Promise.all(fields.map(field => field.resetValidation()))
    
    // 同时校验所有字段
    const results = await Promise.all(fields.map(field => field.validate()))
    
    // 检查是否有错误
    return results.every(errors => errors.length === 0)
}

// 发送验证码
const sendVerifyCode = async () => {

   // 校验邮箱字段
    const isValid = await validateFields(['email'])
    
    if (!isValid) {
        console.log('校验失败')
        return
    }
    
    isSending.value = true
    countdown.value = 60
    
    try {
        // 这里调用发送验证码的接口
        console.log('发送验证码到邮箱:', registerModel.email)
        // await sendVerifyCodeAPI(registerModel.email)
        
        // 启动倒计时
        const timer = setInterval(() => {
            if (countdown.value <= 1) {
                clearInterval(timer)
                countdown.value = 0
                isSending.value = false
            } else {
                countdown.value--
            }
        }, 1000)
        
    } catch (error) {
        console.error('发送验证码失败:', error)
        countdown.value = 0
        isSending.value = false
    }
}

// 停止倒计时并重置状态（用于切换页面时）
const stopCountdown = () => {
    countdown.value = 0
    isSending.value = false
}

// ------------------------ 切换步骤时重置表单 ------------------------ 

const switchToRegister = () => {
    step.value = 2
    // 重置登录表单
    /* loginModel.username = ''
    loginModel.password = '' */
    loginShowPassword.value = false 
    loginTerm.value = false
    // 清除登录表单的校验状态
    loginFormRef.value?.reset()
}

const switchToLogin = () => {
    step.value = 1
    // 重置注册表单
    /* registerModel.username = ''
    registerModel.password = ''
    registerModel.rePassword = '' */
    registerShowPassword.value = false
    registerTerm.value = false
    // 清除注册表单的校验状态
    registerFormRef.value?.reset()
    // 停止验证码倒计时
    stopCountdown()
}

const forwardLogin = () => {
    step.value = 1
    registerShowPassword.value = false
    registerTerm.value = false
    // 清除注册表单的校验状态
    registerFormRef.value?.reset()
    // 停止验证码倒计时
    stopCountdown()
}

// 可选：监听 step 变化，当离开注册页时停止倒计时
/* watch(step, (newVal) => {
    if (newVal !== 2) {
        stopCountdown()
    }
}) */

</script>

<style lang="scss" scoped>
.dialog-container {
    position: relative;
    
    .dialog-close-btn {
        position: absolute;
        top: 20px;
        right: 40px;
        z-index: 100;
        /* &:hover {
            opacity: 1;
            background-color: rgba(0, 0, 0, 0.05);
        } */
    }
}

:deep(.v-window-item) {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

:deep(.v-window-item:not(.v-window-item--active)) {
    opacity: 0;
    transform: scale(0.95);
}

:deep(.v-window-item--active) {
    opacity: 1;
    transform: scale(1);
}
</style>