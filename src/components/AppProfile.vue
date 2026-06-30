<template>
  <v-sheet class="pa-6">
    <v-form ref="profileFormRef">
      <div class="d-flex justify-end mb-4">
        <v-btn
          color="warning"
          variant="outlined"
          size="small"
          @click="showChangePasswordDialog = true"
        >
          <v-icon left size="18">mdi-lock-reset</v-icon>
          修改密码
        </v-btn>
      </div>

      <!-- 头像 -->
      <v-row>
        <v-col cols="12" class="text-center">
          <div class="avatar-wrapper mb-4">
            <v-avatar size="100" color="grey-lighten-2">
              <v-img v-if="profileData.avatar" :src="profileData.avatar"></v-img>
              <v-icon v-else size="60" color="grey">mdi-account-circle</v-icon>
            </v-avatar>
            <v-btn
              icon
              size="small"
              color="primary"
              class="edit-avatar-btn"
              @click="changeAvatar"
            >
              <v-icon size="18">mdi-camera</v-icon>
            </v-btn>
          </div>
          <v-btn
            variant="text"
            color="primary"
            size="small"
            @click="changeAvatar"
          >
            更换头像
          </v-btn>
        </v-col>
      </v-row>

      <!-- 用户名（禁用状态） -->
      <v-text-field
        v-model="profileData.username"
        label="用户名"
        disabled
        variant="outlined"
        density="comfortable"
        class="mb-3"
      ></v-text-field>

      <!-- 昵称 -->
      <v-text-field
        v-model="profileData.nickname"
        label="昵称"
        placeholder="请输入昵称"
        variant="outlined"
        density="comfortable"
        class="mb-3"
        :rules="[v => !!v || '昵称不能为空']"
      ></v-text-field>

      <!-- 手机号 -->
      <v-text-field
        v-model="profileData.phone"
        label="手机号"
        placeholder="请输入手机号"
        variant="outlined"
        density="comfortable"
        class="mb-3"
        :rules="[
          v => !v || /^1[3-9]\d{9}$/.test(v) || '请输入正确的手机号'
        ]"
      ></v-text-field>

      <!-- 邮箱（只读） -->
      <v-text-field
        v-model="profileData.email"
        label="邮箱"
        disabled
        variant="outlined"
        density="comfortable"
        class="mb-3"
      ></v-text-field>

      <!-- 操作按钮 -->
      <div class="d-flex justify-center mt-6">
        <v-btn
          color="primary"
          :loading="saving"
          @click="saveProfile"
        >
          <v-icon left>mdi-content-save</v-icon>
          保存
        </v-btn>
      </div>
    </v-form>

    <!-- 修改密码弹窗 -->
    <v-dialog v-model="showChangePasswordDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          修改密码
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="showChangePasswordDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-form ref="passwordFormRef">
            <v-text-field
              v-model="passwordData.oldPassword"
              label="原密码"
              type="password"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || '请输入原密码']"
              class="mb-3"
            ></v-text-field>
            <v-text-field
              v-model="passwordData.newPassword"
              label="新密码"
              type="password"
              variant="outlined"
              density="comfortable"
              :rules="[
                v => !!v || '请输入新密码',
                v => v.length >= 6 || '密码长度至少6位'
              ]"
              class="mb-3"
            ></v-text-field>
            <v-text-field
              v-model="passwordData.confirmPassword"
              label="确认新密码"
              type="password"
              variant="outlined"
              density="comfortable"
              :rules="[
                v => !!v || '请确认新密码',
                v => v === passwordData.newPassword || '两次输入的密码不一致'
              ]"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showChangePasswordDialog = false">取消</v-btn>
          <v-btn color="primary" :loading="changingPassword" @click="changePassword">确认修改</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-sheet>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '@/store/user'

// 定义事件
const emit = defineEmits(['profile-saved'])

const userStore = useUserStore()

// 个人资料数据
const profileData = reactive({
  username: userStore.user?.username || 'test_user',
  nickname: userStore.user?.nickname || '测试用户',
  phone: userStore.user?.phone || '',
  email: userStore.user?.email || 'test@example.com',
  avatar: userStore.user?.avatar || ''
})

const profileFormRef = ref(null)
const saving = ref(false)

// 修改密码
const showChangePasswordDialog = ref(false)
const passwordData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordFormRef = ref(null)
const changingPassword = ref(false)

// 方法
const changeAvatar = () => {
  // TODO: 实现头像上传
  console.log('更换头像')
}

const saveProfile = async () => {
  const { valid } = await profileFormRef.value.validate()
  if (!valid) return
  
  saving.value = true
  try {
    // TODO: 调用保存接口
    console.log('保存个人资料:', profileData)
    // 更新 store
    userStore.setUser({ ...userStore.user, ...profileData })
    // 触发父组件事件
    emit('profile-saved', profileData)
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  const { valid } = await passwordFormRef.value.validate()
  if (!valid) return
  
  changingPassword.value = true
  try {
    // TODO: 调用修改密码接口
    console.log('修改密码:', passwordData)
    showChangePasswordDialog.value = false
    // 重置表单
    Object.assign(passwordData, {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  } catch (error) {
    console.error('修改密码失败:', error)
  } finally {
    changingPassword.value = false
  }
}

// 暴露方法供父组件调用
defineExpose({
  loadProfile: () => {
    // 重新加载用户数据
    Object.assign(profileData, {
      username: userStore.user?.username || 'test_user',
      nickname: userStore.user?.nickname || '测试用户',
      phone: userStore.user?.phone || '',
      email: userStore.user?.email || 'test@example.com',
      avatar: userStore.user?.avatar || ''
    })
  }
})
</script>

<style scoped lang="scss">
.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: white;
}
</style>