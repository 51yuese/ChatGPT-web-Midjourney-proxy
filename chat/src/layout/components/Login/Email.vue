<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import type { FormInst, FormRules } from 'naive-ui'
import { NButton, NForm, NFormItem, NInput, useMessage } from 'naive-ui'
import { fetchCaptchaImg, fetchLoginAPI, fetchRegisterAPI } from '@/api'
import { useAppStore, useAuthStore } from '@/store'
import { ss } from '@/utils/storage'
const appStore = useAppStore()
const formRef = ref<FormInst | null>(null)
const Nmessage = useMessage()
const isLogin = ref(true)
const loading = ref(false)
const authStore = useAuthStore()
const captchaSvg = ref('')
const theme = computed(() => appStore.theme)

const captchaBgColor = computed(() => {
  return theme.value === 'dark' ? '#363f4f' : '#fff'
})

const registerForm = ref({
  username: '',
  password: '',
  email: '',
  invitedBy: '',
  captchaCode: '',
  captchaId: null,
})

const loginForm = ref({
  username: '',
  password: '',
  email: '',
  invitedBy: '',
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 30, message: '用户名长度应为 2 到 30 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度应为 6 到 30 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] },
  ],
  captchaCode: [
    { required: true, message: '请填写验证码', trigger: 'blur' },
  ],
}
const logTips = computed(() => (isLogin.value ? '还没账号去注册！' : '已有账户去登录！'))

function handlerSubmit() {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        loading.value = true
        const Interface = isLogin.value ? fetchLoginAPI : fetchRegisterAPI
        const params: any = !isLogin.value ? registerForm.value : { username: loginForm.value.username, password: loginForm.value.password }
        const res: any = await Interface(params)
        loading.value = false
        getCaptchaImg()

        const { success, message } = res
        if (!success)
          return Nmessage.error(message)
        if (!isLogin.value) {
          Nmessage.success('您的账号激活邮件已经发送,请前往邮箱激活您的账户！')
          const { email, password } = registerForm.value
          loginForm.value.email = email
          loginForm.value.password = password
          isLogin.value = !isLogin.value
        }
        else {
          Nmessage.success('账户登录成功、开始体验吧！')
          authStore.setToken(res.data)
          authStore.getUserInfo()
          authStore.setLoginDialog(false)
          ss.remove('invitedBy')
        }
      }
      catch (error) {
        getCaptchaImg()
        loading.value = false
      }
    }
  })
}

async function getCaptchaImg() {
  const res: any = await fetchCaptchaImg({ color: captchaBgColor.value })
  captchaSvg.value = res.data.svgCode
  registerForm.value.captchaId = res.data.code
}

onMounted(() => {
  const code = ss.get('invitedBy')
  code && (registerForm.value.invitedBy = code)
  getCaptchaImg()
})
</script>

<template>
  <div class="pt-5">
    <NForm
      v-if="!isLogin"
      ref="formRef"
      :model="registerForm"
      :rules="rules"
      label-placement="left"
      label-width="auto"
      require-mark-placement="right-hanging"
      :style="{ maxWidth: '640px' }"
    >
      <NFormItem path="username">
        <NInput v-model:value="registerForm.username" placeholder="请输入您的用户名昵称" />
      </NFormItem>
      <NFormItem path="password">
        <NInput v-model:value="registerForm.password" placeholder="请输入您的账户密码" type="password" :maxlength="30" show-password-on="click" tabindex="0" @keyup.enter="handlerSubmit" />
      </NFormItem>
      <NFormItem path="email">
        <NInput v-model:value="registerForm.email" placeholder="请填写您的邮箱账号" />
      </NFormItem>
      <NFormItem path="captchaCode">
        <div class="flex items-center w-full space-x-4">
          <NInput v-model:value="registerForm.captchaCode" class="flex-1" placeholder="请填写图中验证码结果" />
          <div v-if="captchaSvg">
            <!-- <img :src="captchaSvg" alt=""> -->
            <span class="cursor-pointer rounded" @click="getCaptchaImg" v-html="captchaSvg" />
          </div>
        </div>
      </NFormItem>

      <NFormItem path="invitedBy">
        <NInput v-model:value="registerForm.invitedBy" placeholder="邀请码[非必填]" />
      </NFormItem>

      <NFormItem>
        <NButton
          block
          type="primary"
          :disabled="loading"
          :loading="loading"
          @click="handlerSubmit"
        >
          发送激活账户邮件
        </NButton>
      </NFormItem>
    </NForm>

    <!-- login -->
    <NForm
      v-if="isLogin"
      ref="formRef"
      :model="loginForm"
      :rules="rules"
      label-placement="left"
      label-width="auto"
      require-mark-placement="right-hanging"
      :style="{
        maxWidth: '640px',
      }"
    >
      <NFormItem path="username">
        <NInput v-model:value="loginForm.username" placeholder="请输入用户名/邮箱号" />
      </NFormItem>
      <NFormItem path="password">
        <NInput v-model:value="loginForm.password" placeholder="请输入您的账户密码" type="password" :maxlength="30" show-password-on="click" tabindex="0" @keyup.enter="handlerSubmit" />
      </NFormItem>

      <NFormItem>
        <NButton
          block
          type="primary"
          :disabled="loading"
          :loading="loading"
          @click="handlerSubmit"
        >
          登录账户
        </NButton>
      </NFormItem>
    </NForm>
  </div>
  <span class="flex justify-end cursor-pointer">
    <NButton text @click="isLogin = !isLogin">{{ logTips }}</NButton>
  </span>
</template>
