<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { NCountdown, NImage, NSkeleton, NSpin, useMessage } from 'naive-ui'
import { fetchGetQRCodeAPI, fetchGetQRSceneStrAPI, fetchLoginBySceneStrAPI } from '@/api/user'
import type { ResData } from '@/api/types'
import { useAuthStore } from '@/store'
import { ss } from '@/utils/storage'
let timer: any

const wxLoginUrl = ref('')
const sceneStr = ref('')
const activeCount = ref(false)
const Nmessage = useMessage()
const authStore = useAuthStore()
const countdownRef = ref<CountdownInst | null>()

function loadImage(src: string) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function getSeneStr() {
  const params = { invitedBy: ss.get('invitedBy') }
  const res: ResData = await fetchGetQRSceneStrAPI(params)
  if (res.success) {
    sceneStr.value = res.data
    getQrCodeUrl()
  }
}

async function loginBySnece() {
  if (!sceneStr.value)
    return
  const res: ResData = await fetchLoginBySceneStrAPI({ sceneStr: sceneStr.value })
  if (res.data) {
    clearInterval(timer)
    Nmessage.success('账户登录成功、开始体验吧！')
    authStore.setToken(res.data)
    authStore.getUserInfo()
    authStore.setLoginDialog(false)
    ss.remove('invitedBy')
  }
}

async function getQrCodeUrl() {
  const res: ResData = await fetchGetQRCodeAPI({ sceneStr: sceneStr.value })
  if (res.success) {
    activeCount.value = true
    await loadImage(res.data)
    wxLoginUrl.value = res.data
    timer = setInterval(() => {
      loginBySnece()
    }, 1000)
  }
}

function handleTimeDown() {
  clearInterval(timer)
  getSeneStr()
  countdownRef.value?.reset()
}

onMounted(() => {
  getSeneStr()
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<template>
  <div>
    <div style="white-space: nowrap" class="mt-2 w-full text-center font-bold text-sm">
      <p>
        <span class="w-[65px] inline-block text-[red] text-left"><NCountdown ref="countdownRef" :active="activeCount" :duration="60 * 1000" :on-finish="handleTimeDown" /></span> 秒后二维码将刷新
      </p>
    </div>
    <div class="my-2 flex justify-center relative">
      <NImage
        v-if="wxLoginUrl"
        preview-disabled
        width="230"
        :src="wxLoginUrl"
      />
      <NSkeleton v-else height="230px" width="230px" />
      <NSpin v-if="!wxLoginUrl" size="large" class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
    </div>

    <span class="flex items-center justify-center text-base mt-5">
      打开微信扫码登录
    </span>
  </div>
</template>
