<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue'
import { NButton, NPopover, NSlider, NTooltip, useMessage } from 'naive-ui'
import { useUsingContext } from '../../hooks/useUsingContext'
import { SvgIcon } from '@/components/common'
import { useAppStore, useChatStore, useGlobalStoreWithOut, useAuthStore, useGptsStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
const authStore = useAuthStore()

import type { Theme } from '@/store/modules/app/helper'
defineProps<Props>()

const emit = defineEmits<Emit>()

const { usingContext, toggleUsingContext } = useUsingContext()

interface Props {
  usingContext: boolean
}

interface Emit {
  (ev: 'export'): void
  (ev: 'toggleUsingContext'): void
  (ev: 'clear'): void
  (ev: 'scrollBtn'): void
}
const ms = useMessage()
const marks = ref({
  0: '死板',
  0.1: '专业',
  0.2: '准确',
  0.8: '平衡',
  1: '创造性',
  1.3: '离谱',
  1.6: '荒谬',
})


const themeOptions: { label: string; key: Theme; icon: string }[] = [
  // {
  //   label: 'Auto',
  //   key: 'auto',
  //   icon: 'ri:contrast-line',
  // },
  {
    label: 'Light',
    key: 'light',
    icon: 'ri:sun-foggy-line',
  },
  {
    label: 'Dark',
    key: 'dark',
    icon: 'ri:moon-foggy-line',
  },
]


const modelName = computed(() => {
	if(!chatStore.activeConfig) return;
	const { modelTypeInfo, modelInfo } =  chatStore.activeConfig
	if(!modelTypeInfo || !modelInfo ) return
	return `${modelTypeInfo?.label} / ${modelInfo.modelName}`
})


const gptsStore = useGptsStore()
const appStore = useAppStore()
const chatStore = useChatStore()
const useGlobalStore = useGlobalStoreWithOut()

const collapsed = computed(() => gptsStore.siderCollapsed)
const currentChatHistory = computed(() => chatStore.getChatByGroupInfo())

const { isMobile } = useBasicLayout()
const theme = computed(() => appStore.theme)

function handleUpdateCollapsed() {
	gptsStore.setSiderCollapsed(!collapsed.value)
}

function onScrollToTop() {
  const scrollRef = document.querySelector('#scrollRef')
  if (scrollRef)
    nextTick(() => scrollRef.scrollTop = 0)
}

function handleExport() {
  emit('export')
}

function handleClear() {
  emit('clear')
}

function handleScrollBtm() {
  emit('scrollBtn')
}

function handleOpenModelDialog(){
	if(useGlobalStore.isChatIn){
		return ms.warning('请等待聊天结束后修改模型信息！')
	}
	useGlobalStore.updateModelDialog(true)
}
const isLogin = computed(() => authStore.isLogin)

function handleSignIn(){
	if(!isLogin.value){
    authStore.setLoginDialog(true)
		return;
	}
	useGlobalStore.updateSignInDialog(true)
}

</script>

<template>
  <header
      v-if="isMobile"
    class="sticky top-0 left-0 right-0 z-30 border-b dark:border-neutral-800 bg-white/80 dark:bg-black/20 backdrop-blur"
  >
    <div class="relative flex items-center justify-center min-w-0 overflow-hidden h-14">
      <div class="max-w-screen-2xl  flex w-full items-center px-4">
        <div  class="flex items-center">
          <button
            class="flex items-center justify-center w-11 h-11"
            @click="handleUpdateCollapsed"
          >
            <SvgIcon v-if="collapsed" class="text-2xl" icon="ri:align-justify" />
            <SvgIcon v-else class="text-2xl" icon="ri:align-right" />
          </button>
        </div>
        <h1
          class=" flex-1 px-4 ele-drag font-bold pr-6 overflow-hidden cursor-pointer select-none text-ellipsis whitespace-nowrap"
          @dblclick="onScrollToTop"
        >
          {{ currentChatHistory?.title ?? '' }}
        </h1>

        <div class="flex-1 py-4 ele-drag" />

        <div class="flex items-center space-x-2">

          <NPopover v-if="isMobile" trigger="click">
            <template #trigger>
              <button class="flex h-8 w-8 items-center justify-center rounded border transition hover:bg-[#eef0f3] dark:border-neutral-700 dark:hover:bg-[#33373c]">
                <span class="text-base text-slate-500 dark:text-slate-400">
                  <SvgIcon icon="fluent:dark-theme-24-regular" />
                </span>
              </button>
            </template>
            <div>
              <div class="flex items-center gap-4">
                <template v-for="item of themeOptions" :key="item.key">
                  <NButton
                    size="small"
                    :type="item.key === theme ? 'info' : undefined"
                    @click="appStore.setTheme(item.key)"
                  >
                    <template #icon>
                      <SvgIcon :icon="item.icon" />
                    </template>
                  </NButton>
                </template>
              </div>
            </div>
          </NPopover>

<!--					 <NTooltip trigger="hover" v-if="isMobile" :disabled="isMobile">-->
<!--            <template #trigger>-->
<!--              <button class="flex h-8 w-8 items-center justify-center rounded border transition hover:bg-[#eef0f3] dark:border-neutral-700 dark:hover:bg-[#33373c]" @click="handleSignIn">-->
<!--                <span class="text-base text-slate-500 dark:text-slate-400">-->
<!--                  <SvgIcon icon="ant-design:gift-outlined" />-->
<!--                </span>-->
<!--              </button>-->
<!--            </template>-->
<!--            签到领福利-->
<!--          </NTooltip>-->
<!--          <NTooltip trigger="hover" :disabled="isMobile">-->
<!--            <template #trigger>-->
<!--              <button class="flex h-8 w-8 items-center justify-center rounded border transition hover:bg-[#eef0f3] dark:border-neutral-700 dark:hover:bg-[#33373c]" @click="handleExport">-->
<!--                <span class="text-base text-slate-500 dark:text-slate-400">-->
<!--                  <SvgIcon icon="material-symbols:sim-card-download-outline-rounded" />-->
<!--                </span>-->
<!--              </button>-->
<!--            </template>-->
<!--            导出本页为图片-->
<!--          </NTooltip>-->
<!--          <NTooltip trigger="hover" :disabled="isMobile">-->
<!--            <template #trigger>-->
<!--              <button class="flex h-8 w-8 items-center justify-center rounded border transition hover:bg-[#eef0f3] dark:border-neutral-700 dark:hover:bg-[#33373c]" @click="handleClear">-->
<!--                <span class="text-base text-slate-500 dark:text-slate-400"><SvgIcon icon="material-symbols:delete-outline" /></span>-->
<!--              </button>-->
<!--            </template>-->
<!--            删除本页内容-->
<!--          </NTooltip>-->
<!--          <NTooltip trigger="hover" :disabled="isMobile">-->
<!--            <template #trigger>-->
<!--              <button class="flex h-8 w-8 items-center justify-center rounded border transition hover:bg-[#eef0f3] dark:border-neutral-700 dark:hover:bg-[#33373c]" @click="handleScrollBtm">-->
<!--                <span class="text-base text-slate-500 dark:text-slate-400"><SvgIcon icon="material-symbols:keyboard-arrow-down" /></span>-->
<!--              </button>-->
<!--            </template>-->
<!--            滚动到底部-->
<!--          </NTooltip>-->
        </div>
      </div>
    </div>

  </header>
</template>
