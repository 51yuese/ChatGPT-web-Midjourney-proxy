<script setup lang='ts'>
import { computed, defineAsyncComponent, ref, watch, onMounted, nextTick } from 'vue'
import { NTooltip, useMessage, NScrollbar, ms ,NModal,NCard} from 'naive-ui'
import { MjMenu } from "@/views/midjourney/components/mj-menu";
import {MusicMenu} from "@/views/music/components/music-menu"
import { useRoute, useRouter } from 'vue-router'
import { SvgIcon } from '@/components/common'
import { fetchQueryMenuAPI } from '@/api/config'
import { useAppStore, useAuthStore, useGlobalStoreWithOut, useGlobalStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { fetchMidjourneyDrawList } from "@/api/mjDraw";
import EventBus from '@/hooks/eventBus';
import { fetchGetQrCode , fetchGetMemberAgreementAPI} from "@/api/global";
const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))
const appStore = useAppStore()
const authStore = useAuthStore()
const useGlobalStore1 = useGlobalStoreWithOut()
const globalStore = useGlobalStore();
const message = useMessage()
const track = ref(null)
appStore.setEnv()
const avatar = computed(() => authStore.userInfo.avatar)
const route = useRoute()
const router = useRouter()
const show = ref(false)
const isLogin = computed(() => authStore.isLogin)
const darkMode = computed(() => appStore.theme === 'dark')
const env = computed(() => appStore.env)
const menuList1 = ref(MjMenu)
const menuList2 = ref(MusicMenu)
// const logInIcon = shallowRef(PersonAddOutline)
// const logOutIcon = shallowRef(PersonRemoveOutline)
async function queryMenu() {
  const res: any = await fetchQueryMenuAPI({ menuPlatform: 1 })

  if (!res.success) return
  menuList.value = res.data

  nextTick(() => {
    calcExceededTotalWidth()
  })
}
const props = defineProps({
  toTask: { type: String },
  sideType:{type:Number}
})
interface MenuItem {
  menuName: string;
  menuPath: string;
  menuIcon: string;
  menuTipText: string;
  menuIframeUrl: string;
  isJump: boolean;
  isNeedAuth: boolean
}

const menuList = ref<MenuItem[]>([])
const isNeedScroll = ref(false)

onMounted(() => {
  queryMenu()
  useGlobalStore1.updateIframeUrl('')
})
// 会员中心
const handleGoMember = async () => {
  if (authStore.checkAuth()) {
    globalStore.updateVipDialog(true)
  }
}
const signInStatus = computed(() => Number(authStore.globalConfig?.signInStatus) === 1)


function checkMode() {
  const mode = darkMode.value ? 'light' : 'dark';

  // setThemeAPI({configKey: 'theme', configVal: mode }).then(res => {
  appStore.setTheme(mode)
  // })
}

function setting() {
  if (!isLogin.value)
    authStore.setLoginDialog(true)

  else
    show.value = true
}
const { isMobile } = useBasicLayout()

const activeRoutePath = computed(() => route.path)
// function toPath(name: string) {
//   router.push({ name })
// }

const mobileSafeArea = computed(() => {
  if (isMobile.value) {
    return {
      paddingBottom: 'env(safe-area-inset-bottom)',
    }
  }
  return {
    height: 'calc(100% - 60px)'
  }
})

const getMobileLayoutClass = computed(() => {
  if (isMobile.value)
    return ['flex-rol', 'w-full', 'border-0']
  return ['flex-col', 'w-sider',]
})

const getIconMobileLayoutClass = computed(() => {
  if (isMobile.value)
    return ['flex', 'flex-rol', 'items-center', 'pt-0', 'w-full']
  return ['flex', 'flex-col', 'pt-1', 'items-center']
})

const iframeSrc = computed(() => useGlobalStore1.iframeUrl)

watch(iframeSrc, (newValue) => {
}, { deep: true, immediate: true })

function handleClickMenu(menu: MenuItem) {
  const { menuPath, isJump, menuIframeUrl, isNeedAuth } = menu
  if (isNeedAuth && !isLogin.value) {
    message.warning('请先登录后访问！')
    authStore.setLoginDialog(true)
    return;
  }
  if (menuPath == "/midjourney/text-to-image") {
    //获取绘画记录
    fetchMidjourneyDrawList({ page: 1, size: 20 }).then((res: any) => {
      localStorage.setItem("drawLogList", JSON.stringify(res.data.rows))
    })
  }
  useGlobalStore1.updateIframeUrl('')
  if (menuPath) {
    return router.push({ path: menuPath })
  } else {
    if (isJump) {
      window.open(menuIframeUrl)
    } else {
      useGlobalStore1.updateIframeUrl(menuIframeUrl)
      router.push({ path: '/extend' })
    }
  }
}

function handleSignIn() {
  if (!isLogin.value) {
    authStore.setLoginDialog(true)
    return;
  }
  useGlobalStore1.updateSignInDialog(true)
}

function calcExceededTotalWidth() {
  if (!track.value) return;
  const { clientHeight = 0, scrollHeight = 0 } = track.value;
  isNeedScroll.value = scrollHeight > clientHeight;
}

watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val)
  },
  {
    immediate: true,
    flush: 'post',
  },
)
//  在线客服
const queryQrCode = async () => {
  return await fetchGetQrCode({ keys: ['wechatImage'] }).then(res => res.data)
}
const ms = useMessage()
const showModal=ref(false)
const qrCode=ref("")
const handleChatOnline = async () => {
  qrCode.value = await queryQrCode();
  showModal.value=true
  // if (!qrCode) {
  //   ms.info("请先前往后台管理系统【关注我们】页面配置在线客服系统地址后再使用！")
  //   return
  // }
  // window.open(qrCode, "_blank");
}
</script>

<template>
  <n-modal v-model:show="showModal">
    <div style="padding: 20px;background-color: #0099ED;border-radius: 8px;">
      <img :src="qrCode" alt="" style="width: 200px;height: auto;">
    </div>
  </n-modal>
  <div class="flex min-w-[80px] pb-2 dark:bg-[#15171A] bg-[#fff] dark:border-[#0c0c16]" :class="getMobileLayoutClass"
    :style="mobileSafeArea" style="position: relative;height: 92vh;margin: 10px;border-radius: 10px;">
    <main :class="['flex-1 flex-grow-1 overflow-auto', getIconMobileLayoutClass]" :style="{ height: 'calc(100% - 60px)' }"
      ref="track">
      <NScrollbar>
        <div class="siderBarBox" v-if="props.sideType!=1">
          <img class="siderBarImg border-[#ccc] border-[1px] dark:border-[transparent]" src="./img/ship.png" alt="">
          <div class="line bg-[#D1D1D1] dark:bg-[#1F1F38]"></div>
        </div>
        <div class="siderBarBox" v-else>
          <div v-if="darkMode" style="width: 52px;height: 52px;background-color: #fff;border-radius: 50%;display: flex;justify-content: center;align-items: center;">
            <img class="" style="width: 32px;height: 32px;" src="./img/Union.svg" alt="">
          </div>
          <div v-else style="width: 52px;height: 52px;background-color: #000;border-radius: 50%;display: flex;justify-content: center;align-items: center;">
            <img class="" style="width: 32px;height: 32px;" src="./img/lightUnion.svg" alt="">
          </div>
          <div class="line bg-[#D1D1D1] dark:bg-[#1F1F38]"></div>
        </div>
        <div class="flex h-full flex-col items-center space-y-4">
          <!-- 画一画 -->
          <div v-for="item in menuList1" v-if="props.sideType!=1" :key="item.menuName" class="inline-block" :class="isMobile ? 'mt-0' : 'mt-3'"
            @click="handleClickMenu(item)" style="display:flex;align-items: flex-end;">
            <div class="leftLine" v-if="item.menuPath1 && item.menuPath1.includes(activeRoutePath)"></div>
            <NTooltip trigger="hover" placement="right">
              <template #trigger>

                <div class="h-16 w-12 cursor-pointer rounded-xl box-border "
                  style="border-radius: 50%;width: 52px;height: 52px;text-align: center;margin-top: 22px;line-height: 52px;"
                  :class="[((item.menuPath1 && item.menuPath1.includes(activeRoutePath))) ?
                    'shadow-[#3076fd] border-[transparent] text-[#fff] dark:border-[#010102] bg-gradient-to-l from-[#2F73EC] to-[#5AA8F7] hover:bg-gradient-to-l' : ' border-[#ccc] border-[1px] dark:border-[transparent] bg-white dark:bg-[#010102]']">
                  <div class="flex h-full justify-center">
                    <div class="m-auto text-center hover:scale-125 duration-300 transition-all ">
                      <SvgIcon v-if="item.menuIcon1" :icon="item.menuIcon" class="text-4xl text-center"></SvgIcon>
                      <p class="svgText" v-if="item.name">{{ item.name }}</p>
                    </div>

                  </div>
                  <p class="mt-1.5 text-[0.6rem] leading-3 text-[#808080]" :class="[((item.menuPath1 && item.menuPath1.includes(activeRoutePath))) ?
                    'text-[#808080] dark:text-[#fff]' : '']" style="margin-top:10px;">{{ item.menuName }}</p>
                </div>

              </template>
              <span>{{ item.menuName }}</span>

            </NTooltip>
          </div>
          <!-- AI音乐 -->
          <div v-for="item in menuList2" v-else :key="item.menuName" class="inline-block" :class="isMobile ? 'mt-0' : 'mt-3'"
            @click="handleClickMenu(item)" style="display:flex;align-items: flex-end;">
            <div class="leftLine" v-if="item.menuPath && item.menuPath.includes(activeRoutePath)"></div>
            <NTooltip trigger="hover" placement="right">
              <template #trigger>

                <div class="h-16 w-12 cursor-pointer rounded-xl box-border "
                  style="border-radius: 50%;width: 52px;height: 52px;text-align: center;margin-top: 22px;line-height: 52px;"
                  :class="[((item.menuPath && item.menuPath.includes(activeRoutePath))) ?
                    'shadow-[#3076fd] border-[transparent] text-[#fff] dark:border-[#010102] bg-gradient-to-l from-[#2F73EC] to-[#5AA8F7] hover:bg-gradient-to-l' : ' border-[#ccc] border-[1px] dark:border-[transparent] bg-white dark:bg-[#010102]']">
                  <div class="flex h-full justify-center">
                    <div class="m-auto text-center hover:scale-125 duration-300 transition-all ">
                      <SvgIcon :icon="item.menuIcon" class="text-3xl text-center"></SvgIcon>
                    </div>

                  </div>
                  <p class="mt-1.5 text-[0.6rem] leading-3 text-[#808080]" :class="[((item.menuPath1 && item.menuPath1.includes(activeRoutePath))) ?
                    'text-[#808080] dark:text-[#fff]' : '']" style="margin-top:10px;">{{ item.menuName }}</p>
                </div>

              </template>
              <span>{{ item.menuName }}</span>

            </NTooltip>
          </div>
        </div>
      </NScrollbar>
    </main>

    <!-- <HoverButton tooltip="全局设置" :placement="isMobile ? 'bottom' : 'right'" :class="isMobile ? 'pb-0' : 'pb-1' " @click="setting">
      <NIcon size="20" color="#555">
        <SvgIcon class="text-2xl" icon="fluent:dark-theme-24-regular" />
      </NIcon>
    </HoverButton> -->
    <!-- <HoverButton v-if="isLogin" tooltip="个人中心" :placement="isMobile ? 'bottom' : 'right'" :class="isMobile ? 'pb-0' : 'pb-8' " @click="toPath('UserCenter')">
    <SvgIcon icon="icon-park-twotone:personal-collection" />
    h-[140px] -->

    <div class="flex flex-col justify-between items-center dark:bg-[#15171A] bg-[#fff] dark:border-[#0c0c16]"
      style="position: absolute;bottom: 20px;width: 80px;">
      <div class="line bg-[#D1D1D1] dark:bg-[#1F1F38]"></div>
      <div style="text-align: center;">
        <div class="siderBarBottomBox dark:bg-[#010102] bg-[#fff] border-[#ccc] border-[1px] dark:border-[transparent]"
          @click="handleGoMember">
          <NTooltip trigger="hover" placement="right">
            <template #trigger>
              <div style="display: flex;justify-content: center;align-items: center;">
                <img style="width: 60%;height: auto;" src="./img/vip.png" alt="">
              </div>
            </template>
            <span>会员中心</span>
          </NTooltip>
        </div>
        <p class="siderBarBottomText">会员</p>
      </div>

      <div style="text-align: center;">
        <div class="siderBarBottomBox dark:bg-[#010102] bg-[#fff] border-[#ccc] border-[1px] dark:border-[transparent]"
          @click="handleChatOnline">
          <NTooltip trigger="hover" placement="right">
            <template #trigger>
              <div style="display: flex;justify-content: center;align-items: center;">
                <img style="width: 60%;height: auto;" src="./img/people.png" alt="">
              </div>
            </template>
            <span>客服</span>
          </NTooltip>
        </div>
        <p class="siderBarBottomText">客服</p>
      </div>
    </div>
    <!-- <NTooltip v-if="!isMobile && signInStatus" trigger="hover" placement="right">
        <template #trigger>
          <SvgIcon class="text-xl cursor-pointer mb-5" icon="iconamoon:gift-light" @click="handleSignIn" />
        </template>
        签到奖励
      </NTooltip> -->

    <!-- <NTooltip v-if="!isMobile" trigger="hover" placement="right">
        <template #trigger>
          <SvgIcon class="text-xl cursor-pointer mb-5" :icon="darkMode ? 'ic:outline-dark-mode' : 'entypo:light-up' " @click="checkMode" />
        </template>
        主题切换
      </NTooltip> -->

    <!--      <NTooltip v-if="isLogin" trigger="hover" placement="right">-->
    <!--        <template #trigger>-->
    <!--          <NAvatar :size="42" :src="avatar" round bordered :fallback-src="defaultAvatar" class="cursor-pointer" @click="toPath('UserCenter')" />-->
    <!--        </template>-->
    <!--        个人中心-->
    <!--      </NTooltip>-->

    <!--      <HoverButton v-if="!isLogin" tooltip="登录账户" :placement="isMobile ? 'bottom' : 'right'" :class="isMobile ? 'mb-0' : 'mb-5' " @click="toggleLogin">-->
    <!--        <NIcon size="20" color="#555">-->
    <!--          <component :is="logInIcon" />-->
    <!--        </NIcon>-->
    <!--      </HoverButton>-->

  </div>
  <Setting v-if="show" v-model:visible="show" />
</template>


<style lang="less" scoped>
.sidebar {
  overflow: hidden;
  width: calc(100% - 5px);
}

.sidebar:hover {
  width: 100%;
  overflow: overlay;
}

.overlay {
  overflow: hidden;
}

.overlay:hover {
  width: 100%;
  overflow: overlay;
}

.siderBarBox {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 23px;
}

.line {
  width: 50px;
  height: 2px;
  // background-color: #1F1F38;
  margin-top: 26px;
}

.siderBarImg {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.siderBarBottomBox {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
  position: relative;
  cursor: pointer;

}

.siderBarBottomImg {
  width: 25px;
  height: 19px;
}

.siderBarBottomImg1 {
  width: 28px;
}

.siderBarBottomText {
  font-size: 12px;
  margin-top: 10px;
}

.hoverBox1 {
  width: 10px;
  height: 10px;
  position: absolute;
  transform: rotate(45deg);
  left: 55px;
  opacity: 0;
  transition: all .5s;
}

.hoverBox2 {
  width: 85px;
  height: 38px;
  position: absolute;
  left: 60px;
  z-index: 99999;
  border-radius: 5px;
  line-height: 38px;
  opacity: 0;
  transition: all .5s;
}

.siderBarBottomBox:hover .hoverBox1 {
  opacity: 1;
}

.siderBarBottomBox:hover .hoverBox2 {
  opacity: 1;
}

.svgText {
  font-weight: bold;
  font-size: 18px;
}

.leftLine {
  width: 4px;
  height: 30px;
  background-color: #2960BE;
  position: absolute;
  left: 0;
  transform: translateY(-11px);
}
</style>
