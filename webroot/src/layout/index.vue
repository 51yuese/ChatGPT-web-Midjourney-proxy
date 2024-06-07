<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { NLayoutContent, useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import Navbar from './navBar/index.vue'
import marketDetails from "./components/marketDetails.vue"
import SiderBar from './siderBar/index.vue'
import FooterBar from './footerBar/index.vue'
import Login from './components/Login.vue'
import NoticeDialog from './components/NoticeDialog.vue'
import BindWxDialog from './components/BindWx.vue'
import SignInDialog from './components/SignInDialog.vue'
import ModelDialog from './components/modelDialog.vue'
import UploadDialog from './components/UploadDialog.vue'
import FeedbackDialog from './components/FeedbackDialog.vue' // 反馈
import UserInfoDialog from './components/UserInfoDialog.vue' // 反馈
import AppDialog from './components/AppDialog.vue' // 反馈
import AppCenterDialog from './components/AppCenterDialog.vue' // 反馈
import VipCenterDialog from './components/VipCenterDialog.vue' // 客户中心

import { useBasicLayout } from '@/hooks/useBasicLayout'
import {useAppCatStoreWithOut, useAppStore, useAuthStore, useGlobalStoreWithOut} from '@/store'
import { fetchLoginByCodeAPI, fetchWxLoginRedirectAPI } from '@/api/user'
import Loading from '@/components/base/Loading.vue'
import type { ResData } from '@/api/types'
import {ref} from "vue"
import EventBus from '@/hooks/eventBus'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const useGlobalStore = useGlobalStoreWithOut()
const useAppCatStore = useAppCatStoreWithOut()
const appStore = useAppStore()
const ms = useMessage()

const noticeDialog = computed(() => useGlobalStore.noticeDialog)
const bindWxDialog = computed(() => useGlobalStore.bindWxDialog)
const signInDialog = computed(() => useGlobalStore.signInDialog)
const modelDialog = computed(() => useGlobalStore.modelDialog)
const uploadingDialog = computed(() => useGlobalStore.uploadingDialog)
const uploadProgress = computed(() => useGlobalStore.uploadProgress)
const feedbackDialog = computed(() => useGlobalStore.feedbackDialog)
const userInfoDialog = computed(() => useGlobalStore.userInfoDialog)
const showAppDialog = computed(() => useAppCatStore.appDialog)
const appCenterDialog = computed(() => useAppCatStore.appCenterDialog)
const vipCenterDialog = computed(() => useGlobalStore.vipCenterDialog)

const { isMobile } = useBasicLayout()
const loginDialog = computed(() => authStore.loginDialog)
const globalConfigLoading = computed(() => authStore.globalConfigLoading)
const theme = computed(() => appStore.theme)
const bgColor = computed(() => theme.value === 'dark' ? '#24272e' : '#fff')
const isLogin = computed(() => authStore.isLogin)
const wechatSilentLoginStatus = computed(() => Number(authStore.globalConfig?.wechatSilentLoginStatus) === 1)
const homePath = computed(() => authStore.globalConfig?.clientHomePath)

/* 如果在vx环境并且携带了code则静默登录 */
function handleCheckOtherLoginByToken() {
  const { token } = route.query
  if (token) {
    authStore.setToken(token)
    const name = route.name
    router.replace({ name, query: {} })
    ms.success('账户登录成功、开始体验吧！')
    authStore.getUserInfo()
  }
}

/* 微信环境静默登录 */
async function loginByWechat() {
  if (homePath.value || !wechatSilentLoginStatus.value)
    return
  if (isLogin.value)
    return

  /* 如果在vx环境并且携带了code则静默登录 */
  const { code } = route.query

  if (code) {
    const res: ResData = await fetchLoginByCodeAPI({ code: code as string })
    if (res.success) {
      authStore.setToken(res.data)
      authStore.getUserInfo()
    }
  }
  else {
    const url = window.location.href.replace(/#.*$/, '')
    const res: ResData = await fetchWxLoginRedirectAPI({ url })
    if (res.success)
      window.location.href = res.data
  }
}

function init() {
  const ua = window.navigator.userAgent.toLowerCase()
  if (ua.match(/MicroMessenger/i) && ua?.match(/MicroMessenger/i)?.[0] === 'micromessenger')
    loginByWechat()
}

onMounted(() => {
  init()
  handleCheckOtherLoginByToken()
})

const getMobileMainClass = computed(() => {
  if (isMobile.value)
    return ['rounded-none', 'shadow-none']
  return ['dark:border-neutral-800']
})

const getMobileLayoutClass = computed(() => {
  if (isMobile.value)
    return ['flex-col']
  return ['dark:border-neutral-800']
})
const routes=router.options.routes[0].children
const isShow=ref(false)
//router.options.history.location    刷新后当前页面的路径
showSiderBar(router.options.history.location)
const handleRoute=(route:string)=>{
  showSiderBar(route)
}
function showSiderBar(route:string){
  const str=route.split('/')[1]
  const haveChildren=routes?.filter(item=>item.path.indexOf(str)!=-1)[0]
  if(haveChildren?.children){
    isShow.value=true
  }else{
    isShow.value=false
  }
}
const isMask=ref(false)
EventBus.on("Details",data=>{
  isMask.value=data
})
const mainData=ref()
EventBus.on("DetailsData",data=>{
  mainData.value=data
})
</script>

<template>
  <div class="h-full dark:bg-[#24272e] transition-all p-0">
    <div class="mask" v-if="isMask">
      <marketDetails v-if="mainData" :mainData="mainData"></marketDetails>
    </div>
    <div class="h-full overflow-hidden">
			<!-- 顶部导航栏 -->
			<Navbar v-if="!isMobile && !globalConfigLoading" @route="handleRoute"></Navbar>
      <div class="z-40 transition flex h-full relative dark:bg-[#010102] bg-[#F4F4F4]" :class="getMobileLayoutClass">

				<!-- 菜单栏 -->
        <!-- <SiderBar v-if="!isMobile&&isShow" /> -->
        <!-- <SiderBar v-if="router.options.routes.children" /> -->

				<!--页面内容 -->
        <NLayoutContent class="h-full " style="flex: 1;background-color: transparent" :class="getMobileMainClass">
            <RouterView v-slot="{ Component, route }">
              <component :is="Component" :key="route.fullPath" />
            </RouterView>
        </NLayoutContent>

				<!--手机端的tab-->
        <FooterBar v-if="isMobile" />
        <Loading v-if="globalConfigLoading" :bg-color="bgColor" />
      </div>

      <Login :visible="loginDialog" />
      <UploadDialog :visible="uploadingDialog" :progress="uploadProgress" />
      <NoticeDialog :visible="noticeDialog" />
      <BindWxDialog :visible="bindWxDialog" />
      <SignInDialog :visible="signInDialog" />
			<ModelDialog :visible="modelDialog" />
			<FeedbackDialog :visible="feedbackDialog" />
			<UserInfoDialog :visible="userInfoDialog" />
			<AppDialog :visible="showAppDialog" />
			<AppCenterDialog :visible="appCenterDialog" />
			<VipCenterDialog :visible="vipCenterDialog" />

    </div>
  </div>
</template>

<style lang="less" scoped>
.footer-copyright-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 4px;
  margin: 0 auto;
}
//.n-layout-content{
//	background: url("@/assets/images/layout_content_background.png");
//}
.mask{
  width: 100%;
  height: 100vh;
  background-color: #15171A;
  position: absolute;
  z-index: 100;
  left: 0;
}
</style>
