<script lang="ts" setup>
import {computed, nextTick, ref} from 'vue'
import {NButton, NPopover, NSlider, NTooltip, useMessage} from 'naive-ui'
import {useUsingContext} from '../../hooks/useUsingContext'
import {SvgIcon} from '@/components/common'
import {useAppStore, useChatStore, useGlobalStoreWithOut, useAuthStore} from '@/store'
import {useBasicLayout} from '@/hooks/useBasicLayout'

const authStore = useAuthStore()

import type {Theme} from '@/store/modules/app/helper'

defineProps<Props>()

const emit = defineEmits<Emit>()

const {usingContext, toggleUsingContext} = useUsingContext()

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

const themeOptions: { label: string; key: Theme; icon: string }[] = [
	// {
	// 	label: 'Auto',
	// 	key: 'auto',
	// 	icon: 'ri:contrast-line',
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
	if (!chatStore.activeConfig) return;
	const {modelTypeInfo, modelInfo} = chatStore.activeConfig
	if (!modelTypeInfo || !modelInfo) return
	return `${modelTypeInfo?.label} / ${modelInfo.modelName}`
})


const appStore = useAppStore()
const chatStore = useChatStore()
const useGlobalStore = useGlobalStoreWithOut()

const collapsed = computed(() => appStore.siderCollapsed)
const currentChatHistory = computed(() => chatStore.getChatByGroupInfo())

const {isMobile} = useBasicLayout()
const theme = computed(() => appStore.theme)

function handleUpdateCollapsed() {
	appStore.setSiderCollapsed(!collapsed.value)
}


/* 新增一个对话 */
async function handleAdd() {
	try {

		await chatStore.updateChatTab('history');
		await chatStore.addNewChatGroup()
		await chatStore.queryMyGroup()

		if (isMobile.value)
			appStore.setSiderCollapsed(true)
	}
	catch (error) {

	}
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

function handleOpenModelDialog() {
	if (useGlobalStore.isChatIn) {
		return ms.warning('请等待聊天结束后修改模型信息！')
	}
	useGlobalStore.updateModelDialog(true)
}

const isLogin = computed(() => authStore.isLogin)

function handleSignIn() {
	if (!isLogin.value) {
		authStore.setLoginDialog(true)
		return;
	}
	useGlobalStore.updateSignInDialog(true)
}

</script>

<template>
	<header class="sticky top-0 left-0 right-0 z-30 border-b dark:border-neutral-800 bg-white/80 dark:bg-black/20 backdrop-blur"
					v-if="isMobile">
		<div class="relative flex items-center justify-center min-w-0 overflow-hidden h-14">
			<div class="max-w-screen-2xl  flex w-full items-center px-4">
				<div v-if="isMobile" class="flex items-center">
					<button
						class="flex items-center justify-center w-11 h-11"
						@click="handleUpdateCollapsed"
					>
						<SvgIcon v-if="collapsed" class="text-2xl" icon="ri:align-justify"/>
						<SvgIcon v-else class="text-2xl" icon="ri:align-right"/>
					</button>
				</div>

				<h1
					class=" flex-1 px-4 ele-drag font-bold pr-6 overflow-hidden cursor-pointer select-none text-ellipsis whitespace-nowrap"
					@dblclick="onScrollToTop"
				>
					{{ currentChatHistory?.title ?? '' }}
				</h1>

				<div class="flex-1 py-4 ele-drag"/>

				<div class="flex-1" v-if="isMobile">
					<button  class="rounded w-full  flex justify-center items-center " @click="handleAdd">
						<SvgIcon icon="mingcute:add-line" class="text-sm mr-0.5" />
						<span class="mr-0">新对话</span>
					</button>
				</div>

				<NPopover v-if="isMobile" trigger="click">
						<template #trigger>
							<button
								class="flex h-8 w-8 items-center justify-center rounded border transition hover:bg-[#eef0f3] dark:border-neutral-700 dark:hover:bg-[#33373c]">
                <span class="text-base text-slate-500 dark:text-slate-400">
                  <SvgIcon icon="fluent:dark-theme-24-regular"/>
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
											<SvgIcon :icon="item.icon"/>
										</template>
									</NButton>
								</template>
							</div>
						</div>
					</NPopover>
				</div>
			</div>

	</header>
</template>
