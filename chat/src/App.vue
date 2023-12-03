<script setup lang="ts">
import {dateZhCN, NConfigProvider, NGlobalStyle} from 'naive-ui'
import {computed, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {ClientJS} from 'clientjs'
import {ss} from './utils/storage'
import {NaiveProvider} from '@/components/common'
import {useTheme} from '@/hooks/useTheme'
import {useLanguage} from '@/hooks/useLanguage'
import {useAppStore, useAuthStore, useChatStore, useGlobalStoreWithOut} from '@/store'
import {fetchThemeAPI} from "@/api/config";
import {Theme} from "@/store/modules/app/helper";

const client = new ClientJS()
const chatStore = useChatStore()

// Get the client's fingerprint id
const fingerprint = client.getFingerprint()
const authStore = useAuthStore()
const appStore = useAppStore()
const useGlobalStore = useGlobalStoreWithOut()
const router = useRouter()
useGlobalStore.updateFingerprint(fingerprint)
const { theme, lightThemeOverrides, darkThemeOverrides } = useTheme()
const { language } = useLanguage()

const homePath = computed(() => authStore.globalConfig?.clientHomePath)
const faviconPath = computed(() => authStore.globalConfig?.clientFavoIconPath || '/favicon.svg')
const isAutoOpenNotice = computed(() => Number(authStore.globalConfig?.isAutoOpenNotice) === 1)


// 获取设置的主题色
async function loadTheme() {
	return fetchThemeAPI(['theme']).then((res: { data: Theme }) => {
		 appStore.setTheme(res.data)
	})
}

async function loadBaiduCode() {
  const baiduCode: any = authStore.globalConfig?.baiduCode || ''
  if (!baiduCode)
    return
  const scriptElem = document.createElement('script')
  scriptElem.innerHTML = baiduCode.replace(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi, '$1')
  document.head.appendChild(scriptElem)
}

function setDocumentTitle() {
  document.title = authStore.globalConfig?.siteName || 'GoMaxAI'
}

const themeOverrides = computed(() => {
  return !theme.value ? lightThemeOverrides : darkThemeOverrides
})

function goHome() {
  homePath.value && router.push(homePath.value)
}

function noticeInit() {
  const showNotice = ss.get('showNotice')
  if (!showNotice && isAutoOpenNotice.value) {
    useGlobalStore.updateNoticeDialog(true)
  }
  else {
    if (Date.now() > Number(showNotice) && isAutoOpenNotice.value)
      useGlobalStore.updateNoticeDialog(true)
  }
}

/* 动态设置网站ico svg格式 */
const link = document.createElement('link')
link.rel = 'shortcut icon'
link.href = faviconPath.value
link.type = 'image/svg+xml'
document.getElementsByTagName('head')[0].appendChild(link)

onMounted(async () => {
  goHome()
  await chatStore.getBaseModelConfig()
  loadBaiduCode()
  setDocumentTitle()
  noticeInit();
	await loadTheme();
})
</script>

<template>
  <NConfigProvider
    class="h-full "
    :theme="theme"
    :theme-overrides="themeOverrides"
    :locale="language"
    :date-locale="dateZhCN"
    preflight-style-disabled
  >
    <NaiveProvider>
        <RouterView />
    </NaiveProvider>
    <NGlobalStyle />
  </NConfigProvider>
</template>
