<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, nextTick, reactive, onMounted, onUnmounted, ref, watch } from 'vue'
import {
	NButton,
	NInput,
	NTooltip,
	useDialog,
	useMessage,
	NForm,
	NFormItem,
	NModal,
	NSwitch,
	NSelect,
	NUpload
} from 'naive-ui'
import EmptyLog from '@/views/gpts/components/emptyLog/index.vue'
import CopyRight from "@/components/common/Copyright/index.vue";
import RecordDialog from "@/layout/components/RecordDialog.vue";
import HeaderComponent from "@/views/gpts/components/Header/index.vue";
import type { App } from '@/views/appStore/components/helpter'
import html2canvas from 'html2canvas'
import { useRoute } from 'vue-router'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useCopyCode } from './hooks/useCopyCode'
import { useGptsChat } from './hooks/useGptsChat'
import { useUsingContext } from './hooks/useUsingContext'
import { useUsingNetwork } from './hooks/useUsingNetwork'

import { SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useAuthStore, useGptsStore, useGlobalStoreWithOut } from '@/store'
import { fetchChatAPIProcess } from '@/api'
import { fetchQueryGptsByPageAPI } from '@/api/appStore'
import { t } from '@/locales'
import { router } from '@/router'
import { fetchChatTailAPI } from "@/api/config";
import { useUpload } from "@/views/chat/hooks/useUpload";
import { AxiosProgressEvent } from "axios";
import AiGptsCom from "@/views/gpts/components/gpts/aiGptsCom.vue";

import Search from "@/views/gpts/components/gpts/Search.vue";
import Recommend from "@/views/gpts/components/gpts/Recommend.vue";
import Popular from "@/views/gpts/components/gpts/Popular.vue";
import Publish from "@/views/gpts/components/gpts/Publish.vue";
import Ranking from "@/views/gpts/components/gpts/Ranking.vue";
import AppList from "@/views/gpts/components/gpts/AppList.vue";
import CreateApp from "@/views/gpts/components/gpts/CreateAppDialog.vue";
import AppModeDialog from "@/views/gpts/components/gpts/modelDialog.vue";
import MineApp from "@/views/gpts/components/gpts/MineApp.vue";
import EventBus from '@/hooks/eventBus';

const useGlobalStore = useGlobalStoreWithOut()
const authStore = useAuthStore()
const route = useRoute()
let controller = new AbortController()
const isLogin = computed(() => authStore.isLogin);
const gptStore = useGptsStore()
const dialog = useDialog()
const ms = useMessage()
const appStore = useAppStore()
const bottomContainer = ref()
const gptsStore = useGptsStore()
const isStreamIn = ref(false)
const typingStatusEnd = ref(true) // 打字效果是否完成


// 当前选中的侧边栏索引
const selectSiderIndex = computed(() => authStore.selectSiderIndex)
// 应用列表当前选择的索引 0表示对话列表页面 1表示聊天页面
const selectAppListIndex = computed(() => authStore.selectAppListIndex)
// 搜索的应用数据
const searchData = computed(() => authStore.getSearchApp)

const { addGroupChat, updateGroupChat, updateGroupChatSome } = useGptsChat()

const appId = computed(() => route.query.appId as string)
const tradeStatus = computed(() => route.query.trade_status as string)
const token = computed(() => route.query.token as string)

useCopyCode()

const { isMobile } = useBasicLayout()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()
const { usingContext, toggleUsingContext } = useUsingContext()
const { usingNetwork, toggleUsingNetwork } = useUsingNetwork()

const dataSources = computed(() => gptsStore.chatList)
const gptsSources = computed(() => gptsStore.groupList)
const activeModel = computed(() => gptsStore.activeModelName)
const isCanUpload = computed(() => gptsStore.canUpload);
const isCanAudio = computed(() => gptsStore.canAudio);

const { selectFile, upload } = useUpload();

/* 当前所有的ai回复信息列表 方便拿到上下文 */
const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !item.error)))

const prompt = ref<string>('')
const loading = ref<boolean>(false)
const inputRef = ref<Ref | null>(null)
const firstScroll = ref<boolean>(true)
const chatTail = ref<string>('')

/* 当前选中的对话组id */
const activeGroupId = computed(() => gptsStore.active)

/* 当前对话组的详细信息 */
const activeGroupInfo = computed(() => gptsStore.groupList.find((item: any) => item.uuid === activeGroupId.value))

/* 当前对话组的配置信息 */
const activeConfig = computed(() => gptsStore.activeConfig)

/* 当前选用的模型的类型 1： openai  2: 百度  */
const activeModelKeyType = computed(() => Number(gptsStore?.activeModelKeyType))

const buttonDisabled = computed(() => {
	return loading.value || !prompt.value || prompt.value.trim() === '' || !typingStatusEnd.value
})

watch(activeGroupId, (val) => {
	if (val)
		firstScroll.value = true
	if (inputRef.value && !isMobile.value)
		inputRef.value?.focus()
},
	{ immediate: true },
)


watch(dataSources, (val) => {
	if (val.length === 0)
		return
	if (firstScroll.value) {
		firstScroll.value = false
		scrollToBottom()
	}
},
	{ immediate: true },
)

async function handleOpenRecord() {
	useGlobalStore.updateRecordDialog(true)
}

// 上传文件
async function handleUploadFile(mode: number | File = 1) {

	const purpose = "assistants";

	let file: File | number;

	if (mode === 1) {
		file = await selectFile()

		if (!file) {
			ms.error("选择文件错误")
			return;
		}
	} else {
		file = mode;
	}

	useGlobalStore.updateUploadDialog(true)

	const result = await upload({ purpose, file: <File>file }, (progressEvt: AxiosProgressEvent) => {
		const { progress, loaded, total } = progressEvt;

		if (progress && Number(progress.toFixed(2)) * 100 <= 99) {
			useGlobalStore.updateUploadProgress(Number(progress.toFixed(2)) * 100);
		}

	})

	if (result.data) {
		useGlobalStore.updateUploadProgress(100);
		useGlobalStore.updateUploadDialog(false)

		prompt.value = mode === 1 ? '请分析一下上传的这个文件 ' + result.data : '请将语音转换成文本 ' + result.data
	}

	if (mode !== 1) {
		useGlobalStore.updateRecordDialog(false)
	}

}

function handlePrompt(val: string) {
	prompt.value = val;
	handleSubmit()
}

function handleUpdateModel(val: number) {
	useGlobalStore.updateModel(val)
}

/* 发送消息 */
async function handleSubmit(index?: number) {

	if (gptsStore.groupList.length === 0 || loading.value || !typingStatusEnd.value) return;
	let message = ''

	/* 如果有index就是重新生成 */
	if (index && typeof index === 'number') {
		const { requestOptions } = dataSources.value[index]
		message = requestOptions?.prompt ?? ''
	}

	onConversation(message)
}

/* 按钮发送消息 */
async function onConversation(msg?: string) {
	let message = msg || prompt.value

	if (loading.value)
		return

	if (!message || message.trim() === '')
		return

	controller = new AbortController()

	/* 虚拟增加一条用户记录 */
	addGroupChat({
		dateTime: new Date().toLocaleString(),
		text: message,
		inversion: true,
		error: false,
		conversationOptions: null,
		requestOptions: { prompt: message, options: null },
	})

	scrollToBottom()

	loading.value = true
	prompt.value = ''
	let options: any = {
		type: 'gpts',
		groupId: activeGroupId.value,
		usingNetwork: usingNetwork.value,
	}

	const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions

	if (lastContext && usingContext.value && !usingNetwork.value) {
		options = { ...lastContext, ...options }
	}


	/* 虚拟增加一条ai记录 */
	addGroupChat({
		dateTime: new Date().toLocaleString(),
		text: 'AI思考中',
		loading: true,
		inversion: false,
		error: false,
		conversationOptions: null,
		requestOptions: { prompt: message, options: { ...options } },
	},
	)

	scrollToBottom()

	let timer: any = null;
	let cacheResText = ''; // 部分模型是分批返回文字 需要合并 全部的内容
	let currentText = ''; // 当前使用的部分
	let i: number = 0;
	let data: any = null;
	isStreamIn.value = true;
	let userBanance: any = {};

	useGlobalStore.updateIsChatIn(true)

	/* 匀速输出 */
	try {
		const fetchChatAPIOnce = async () => {

			timer = setInterval(async () => {

				cacheResText[i] && currentText.length < cacheResText.length && (currentText += cacheResText[i])

				if (cacheResText[i]) {

					typingStatusEnd.value = false
					/* 实时更新消息 */
					updateGroupChat(
						dataSources.value.length - 1,
						{
							dateTime: new Date().toLocaleString(),
							text: currentText,
							inversion: false,
							usage: data?.detail?.usage,
							error: false,
							loading: true,
							conversationOptions: { conversationId: data?.conversationId, parentMessageId: data?.id },
							requestOptions: { prompt: message, options: { ...options } },
						},
					)
					scrollToBottomIfAtBottom()
					i++
				}

				/* 更新完了结束 */
				if (!isStreamIn.value && currentText.length >= cacheResText.length) {

					i = 0
					currentText = ''
					timer && clearInterval(timer)
					timer = null;

					// 修改loading状态
					typingStatusEnd.value = true

					updateGroupChatSome(dataSources.value.length - 1, { loading: false }) // 更新最后一条的loading状态

					useGlobalStore.updateIsChatIn(false)

					/* 如果拿到了余额信息  更新 */
					if (userBanance) {
						authStore.updateUserBanance(userBanance)
					}

					/* 当为2说明第一次对话 则修改一个对话组的默认title，取回答记录前十个字 如果长度不到十个 拿全部 */
					// if (dataSources.value.length === 2 && !activeGroupInfo?.value?.appId) {
					// 	const title = dataSources.value[1].text.length > 15 ? dataSources.value[1].text.slice(0, 15) : dataSources.value[1].text
					// 	// await gptsStore.updateGroupInfo({groupId: +activeGroupId.value, title})
					// 	await gptsStore.queryMyGroup()
					// }

					scrollToBottomIfAtBottom()
				}
			}, 16)

			// 流式接入数据
			await fetchChatAPIProcess<Chat.ConversationResponse>({
				prompt: message,
				appId: activeGroupInfo.value ? activeGroupInfo.value.appId : 0,
				options,
				signal: controller.signal,
				onDownloadProgress: ({ event }) => {

					const xhr = event.target;
					const { responseText } = xhr

					/* 这种解析只对openai有效 其他的会漏掉前面的字 */
					const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)

					let chunk = responseText
					if (lastIndex !== -1) {
						chunk = responseText.substring(lastIndex)
					}

					try {
						data = JSON.parse(chunk)

					} catch (error) {
						// TODO 如果出现类似超时错误 会连接上次的内容一起发出来导致无法解析  后端需要处理 下
						console.log('parse data erro from openai: ', error, chunk);
						if (chunk.includes('OpenAI timed out waiting for response')) {
							console.log('绘画超时了~')
							ms.warning('会话超时了、告知管理员吧~~~')
						}
					}

					// 显示消耗的token
					try {
						cacheResText = data.text;
						isStreamIn.value = !data.is_end;

						if (data?.detail?.usage) {
							typingStatusEnd.value = data.is_end;
							userBanance = data?.userBanance;
						}


					} catch (error) {
						console.log(error);
					}
				}
			})
		}

		await fetchChatAPIOnce()
	} catch (error: any) {
		console.log('chat error catch', error);

		useGlobalStore.updateIsChatIn(false)
		clearInterval(timer)
		isStreamIn.value = false

		if (error.code === 402 || error?.message.includes('余额不足') || error?.message.includes('免费额度已经使用完毕'))
			useGlobalStore.updateVipDialog(true)

		let errorMessage = error?.message ?? t('common.wrong')
		if (errorMessage === 'Request failed with status code 401')
			errorMessage = '非法操作、请先登录后再进行问答使用！'

		if (error?.message.includes('canceled')) {
			updateGroupChatSome(dataSources.value.length - 1, { loading: false })
			scrollToBottomIfAtBottom()
			setTimeout(() => {
				authStore.getUserBalance()
			}, 200)
			return
		}

		const currentChat = dataSources.value[dataSources.value.length - 1]

		if (currentChat?.text && currentChat.text !== '') {
			updateGroupChatSome(
				dataSources.value.length - 1,
				{
					text: `${currentChat.text === 'AI思考中' ? '' : currentChat.text}\n[${errorMessage}]`,
					error: false,
					loading: false,
				},
			)
			return
		}

		updateGroupChat(
			dataSources.value.length - 1,
			{
				dateTime: new Date().toLocaleString(),
				text: errorMessage,
				inversion: false,
				error: true,
				loading: false,
				conversationOptions: null,
				requestOptions: { prompt: message, options: { ...options } },
			},
		)
		scrollToBottomIfAtBottom()
	} finally {
		console.log('finally', loading.value);

		loading.value = false
		isStreamIn.value = false
	}
}

/* 重新生成 */
async function onRegenerate(index: number) {

	if (loading.value) {
		return
	}

	controller = new AbortController()

	const { requestOptions } = dataSources.value[index]

	let message = requestOptions?.prompt ?? ''

	let options: any = { groupId: +activeGroupId.value, usingNetwork: usingNetwork.value }

	if (requestOptions.options) {
		options = { ...requestOptions.options, groupId: +activeGroupId.value }
	}

	loading.value = true

	/* 虚拟增加一条用户记录 */
	addGroupChat(
		{
			dateTime: new Date().toLocaleString(),
			text: message,
			inversion: true,
			error: false,
			conversationOptions: null,
			requestOptions: { prompt: message, ...options },
		},
	)

	/* 虚拟增加一条ai记录 */
	addGroupChat(
		{
			dateTime: new Date().toLocaleString(),
			text: '',
			loading: true,
			inversion: false,
			error: false,
			conversationOptions: null,
			requestOptions: { prompt: message, options: { ...options } },
		},
	)

	scrollToBottom()

	try {

		let lastText = ''
		const fetchChatAPIOnce = async () => {

			await fetchChatAPIProcess<Chat.ConversationResponse>({
				prompt: message,
				appId: activeGroupInfo.value ? activeGroupInfo.value.appId : 0,
				options,
				signal: controller.signal,

				onDownloadProgress: ({ event }) => {
					const xhr = event.target
					const { responseText } = xhr
					// Always process the final line
					const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
					let chunk = responseText

					if (lastIndex !== -1)
						chunk = responseText.substring(lastIndex)
					try {

						const data = JSON.parse(chunk)
						/* 拿到剩余次数额度 */
						const userBanance = data?.detail?.userBanance
						if (userBanance)
							authStore.updateUserBanance(userBanance)

						/* 实时更新消息 */
						updateGroupChat(
							dataSources.value.length - 1,
							{
								dateTime: new Date().toLocaleString(),
								text: lastText + (data.text ?? ''),
								inversion: false,
								usage: data?.detail?.usage,
								error: false,
								loading: true,
								conversationOptions: { conversationId: data.conversationId, parentMessageId: data.id },
								requestOptions: { prompt: message, options: { ...options } },
							},
						)
					} catch (error) {
						console.log(error);
						//
					}
				},
			})
			updateGroupChatSome(dataSources.value.length - 1, { loading: false })
		}
		await fetchChatAPIOnce()
	} catch (error: any) {

		if (error?.message.includes('canceled')) {
			updateGroupChatSome(dataSources.value.length - 1, { loading: false })
			setTimeout(() => authStore.getUserBalance(), 200)
			return
		}

		if (error.code === 402 || error?.message.includes('余额不足'))
			useGlobalStore.updateVipDialog(true)

		let errorMessage = error?.message ?? t('common.wrong')
		if (errorMessage === 'Request failed with status code 401')
			errorMessage = '非法操作、请先登录后再进行问答使用！'

		updateGroupChat(
			dataSources.value.length - 1,
			{
				dateTime: new Date().toLocaleString(),
				text: errorMessage,
				inversion: false,
				error: true,
				loading: false,
				conversationOptions: null,
				requestOptions: { prompt: message, ...options },
			},
		)

	} finally {
		loading.value = false
		isStreamIn.value = false
	}
}

/* 有appId的特殊处理 */
async function handleAppId(appId: number) {
	const id = +appId
	// await router.replace({name: 'Chat', query: {}})
	const isHasGroup = gptsStore.groupList.find((item: any) => item.appId === id)
	if (!isHasGroup) {
		await gptsStore.addNewChatGroup(id)
		await gptsStore.queryMyGroup()
	} else {
		await gptsStore.setActiveGroup(isHasGroup.uuid)
	}

	if (prompt.value) {
		handlePrompt(prompt.value)
	}

}

/* 处理三方对接跳转 */
async function othLeroginByToken(token: string) {
	authStore.setToken(token)
	await router.replace({ name: 'Chat', query: {} })
	ms.success('账户登录成功、开始体验吧！')
	await authStore.getUserInfo()
}

/* 支付回调处理 */
function handleRefresh() {
	if (tradeStatus.value.toLowerCase().includes('success')) {
		ms.success('感谢你的购买、祝您使用愉快~', { duration: 5000 })
		authStore.getUserInfo()
		router.replace({ name: 'Chat', query: {} })
	} else {
		ms.error('您还没有购买成功哦~')
	}
}

/* 导出 */
function handleExport() {
	if (loading.value) {
		return
	}


	const d = dialog.create({
		title: t('chat.exportImage'),
		content: t('chat.exportImageConfirm'),
		positiveText: t('common.yes'),
		negativeText: t('common.no'),
		onPositiveClick: async () => {
			try {
				d.loading = true
				const ele = document.getElementById('image-wrapper')
				const canvas = await html2canvas(ele as HTMLDivElement, {
					useCORS: true,
				})
				const imgUrl = canvas.toDataURL('image/png')
				const tempLink = document.createElement('a')
				tempLink.style.display = 'none'
				tempLink.href = imgUrl
				tempLink.setAttribute('download', 'chat-shot.png')
				if (typeof tempLink.download === 'undefined')
					tempLink.setAttribute('target', '_blank')

				document.body.appendChild(tempLink)
				tempLink.click()
				document.body.removeChild(tempLink)
				window.URL.revokeObjectURL(imgUrl)
				d.loading = false
				ms.success(t('chat.exportSuccess'))
				return Promise.resolve(true)
			} catch (error: any) {
				ms.error(t('chat.exportFailed'))
			} finally {
				d.loading = false
			}
		},
	})
}

/* 删除 */
function handleDelete({ chatId }: Chat.Chat) {

	if (loading.value) {
		ms.warning("对话中，不可进行删除操作");
		return
	}

	dialog.warning({
		title: t('chat.deleteMessage'),
		content: t('chat.deleteMessageConfirm'),
		positiveText: t('common.yes'),
		negativeText: t('common.no'),
		onPositiveClick: () => {
			gptsStore.deleteChatById(chatId)
		},
	})
}

function handleClear() {

	if (loading.value)
		return

	dialog.create({
		title: t('chat.clearChat'),
		content: t('chat.clearChatConfirm'),
		positiveText: t('common.yes'),
		negativeText: t('common.no'),
		onPositiveClick: async () => {
			await gptsStore.clearChatByGroupId()
			ms.success('删除当前页面对话完成')
		},
	})
}

function handleEnter(event: KeyboardEvent) {
	if (!isMobile.value) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			handleSubmit()
		}
	} else {
		if (event.key === 'Enter' && event.ctrlKey) {
			event.preventDefault()
			handleSubmit()
		}
	}
}

function handleStop() {
	if (loading.value) {
		controller.abort()
		loading.value = false
		isStreamIn.value = false
		typingStatusEnd.value = true
	}
}

const placeholder = computed(() => {
	if (isMobile.value)
		return t('chat.placeholderMobile')
	return t('chat.placeholder')
})

// 获取小尾巴功能
const getChatTail = () => {
	fetchChatTailAPI(['dialogueTail']).then(res => {
		chatTail.value = res.data;
	})
}

const handleChat = async (data: App) => {
	if (data.id && data.demoData) {
		prompt.value = data.demoData;
		await handleAppId(data.id);
		return;
	}
	prompt.value = ""
}

onMounted(async () => {

	// console.log(useAuthStore.updateSearchAppList() == undefined ? 1:2)
	// if (useAuthStore.updateSearchAppList().value.length != 0){
	// 	searchApp.value = useAuthStore.updateSearchAppList();
	// }

	if (appId.value) {
		await handleAppId(Number(appId.value))
	}
	if (token.value) {
		await otherLoginByToken(token.value)
	}

	if (tradeStatus.value) {
		handleRefresh()
	}

	await nextTick(async () => {
		await gptsStore.queryActiveChatLogList()
		await scrollToBottom()
		if (inputRef.value && !isMobile.value)
			inputRef.value?.focus()
	})
	getChatTail()
})
const darkMode = computed(() => appStore.theme === 'dark')
const recordDialog = computed(() => useGlobalStore.recordDialog)

const getMobileStyle = computed(() => {
	// if (!isMobile.value)
	// 	return {height: 'calc(100% - 80px)'
	// }
})

const btnSize = computed(() => {
	if (!isMobile.value)
		return 'small'
	return 'tiny'
})

const gpts = reactive({
	query: ""
})

const gptsItemRef = ref()

// 搜索
const search = (type?: string) => {
	if (type === 'clear') {
		gpts.query = ""
	}

	gptsItemRef.value.search(gpts.query);
}

onUnmounted(() => {

	if (loading.value)
		controller.abort()
})


const handleOpenModelDialog = () => {
	if (useGlobalStore.isChatIn) {
		return ms.warning('请等待聊天结束后修改模型信息！')
	}
	useGlobalStore.updateAppModelDialog(true)
}
EventBus.on("setActiveGroup",data=>{
	authStore.setSelectSiderIndex(authStore.appListIndex);
	authStore.selectSiderIndex = 1
	createChat(data.id)
})

// 创建新会话
async function createChat(id){

if (!isLogin.value) {
	authStore.setLoginDialog(true)
	return
}

// 判断当前应用是否有开启对话
const sessionStatus = await gptStore.isSession(id);
if (sessionStatus == false){
		// 当前应用没有创建会话，执行创建对话
			await gptStore.addNewChat(id)
			gptStore.updateGptsStore(false)
}else{
	// 当前应用已经创建了对话， 直接切换会话
			gptStore.setActiveGroup(sessionStatus)
}

authStore.selectAppListIndex = 1
authStore.setSelectSiderIndex(authStore.appListIndex);


// const res = await fetchQueryAppChatListAPI()
// for (const i in res.data) {
// 	if (res.data[i].modelId == id){
//
// 	}else{

// 	}
// }

}


</script>

<template>
	<div style="" class="app_chat_card flex flex-col " :style="getMobileStyle">

		<div v-if="selectSiderIndex == authStore.exploreAppIndex">
			<!--搜索组件-->
			<Search></Search>
		</div>
		<!--探索应用 有搜索结果-->
		<div v-if="selectSiderIndex == authStore.exploreAppIndex && searchData.code == true">
			<AppList></AppList>
		</div>
		<!--探索应用 没有搜索结果-->
		<div v-if="selectSiderIndex == authStore.exploreAppIndex && searchData.code == false">
			<!--推荐应用-->
			<Recommend></Recommend>
			<!--最受欢迎的-->
			<Popular></Popular>
			<!--最新发布-->
			<Publish></Publish>
			<!--应用排行-->
			<Ranking></Ranking>
		</div>
		<!--对话列表-->
		<div v-if="selectSiderIndex != authStore.appListIndex">
			<AppList></AppList>
		</div>
		<div v-if="selectSiderIndex == authStore.mineAppIndex">
			<MineApp></MineApp>
			<!--			<AppList></AppList>-->
		</div>

		<!--创建应用弹窗-->
		<CreateApp v-if="authStore.createAppDialog == true"></CreateApp>
		<!--切换模型弹窗-->
		<AppModeDialog></AppModeDialog>

		<!--		 上传文件弹窗-->
		<RecordDialog :visible="recordDialog" @submit="handleUploadFile" />

		<!--头部显示标题 和导出按钮 -->
		<HeaderComponent :using-context="usingContext" :dark-mode="darkMode" @export="handleExport"
			@toggle-using-context="toggleUsingContext" @clear="handleClear" />

		<!--		<div :class="[isMobile ? 'h-full' : 'h-[84vh]']" v-if="selectAppListIndex == 0 && selectSiderIndex == authStore.appListIndex">-->
		<!--			&lt;!&ndash;应用列表，没有会话展示的组件&ndash;&gt;-->
		<!--			<AiGptsCom ref="gptsItemRef" :q="gpts.query"/>-->
		<!--		</div>-->

		<main class="flex-1 overflow-hidden" v-if="selectSiderIndex == authStore.appListIndex" style="position: relative;border-radius: 12px 12px 0 0;">
			<div v-if="selectAppListIndex == 1" style="display: flex;align-items: center; padding-top: 20px; padding-left: 20px;position: absolute;top: 0;left: 0;z-index: 999;width: 100%;border-radius: 12px 12px 0 0;"
				@click="authStore.selectAppListIndex = 0" class="dark:bg-[#1A1D21] bg-[#FFF]">
				<div>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path d="M5.71521 10H15.8828" stroke="#A3A5A6" stroke-width="2" stroke-linecap="round"
							stroke-linejoin="round" />
						<path d="M9.10441 13.3892L5.71521 9.99999L9.10441 6.61078" stroke="#A3A5A6" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</div>
				<div style="font-size: 12px;margin-left: 10px">{{ activeGroupInfo?.title }}</div>
			</div>
			<div id="scrollRef" ref="scrollRef" class="relative h-full overflow-hidden overflow-y-auto scroll-smooth">
				<div id="image-wrapper" class="w-full h-full">

					<!--					<div :class="[isMobile ? 'h-full' : 'h-[84vh]']" v-if="!gptsSources.length">-->
					<div v-if="selectAppListIndex == 0">
						<!--												<div class="flex justify-between items-center  w-full">-->
						<!--													<div class="pr-4">GPTS</div>-->
						<!--													<div class="max-w-[500px]">-->
						<!--														<n-input round placeholder="GPTs名字(enter搜索)" class="w-full" @clear="search('clear')" clearable-->
						<!--																		 v-model:value="gpts.query" @keyup.enter="search()">-->
						<!--															<template #prefix>-->
						<!--																<SvgIcon icon="uil:search"/>-->
						<!--															</template>-->
						<!--															<template #suffix>-->
						<!--																<div class="cursor-pointer" @click="search()">搜索</div>-->
						<!--															</template>-->
						<!--														</n-input>-->
						<!--													</div>-->

						<!--												</div>-->

						<!--						<div class="w-full  bg-[#E4E4E4] dark:bg-[#444456] mt-3"></div>-->

						<!--应用列表，没有会话展示的组件-->
						<AiGptsCom ref="gptsItemRef" :q="gpts.query" />

					</div>

					<div v-else class="dark:bg-[#1A1D21] bg-[#FFF]"
						style="height: 100%;padding-top: 25px;">



						<!--应用列表，有会话展示的组件-->
						<EmptyLog @run="handlePrompt" v-if="!dataSources.length && gptsSources.length > 0"></EmptyLog>

						<!--新增小尾巴	-->
						<div v-else class="dark:bg-[#1A1D21] bg-[#FFF] pr-10">
							<Message :chatTail="chatTail" v-for="(item, index) of dataSources" :key="item.chatId"
								:date-time="item.dateTime" :text="item.text" :inversion="item.inversion" :error="item.error"
								:loading="item.loading" @regenerate="handleSubmit(index)" @delete="handleDelete(item)" />
							<div class="sticky bottom-0 left-0 flex justify-center">
								<NButton v-if="loading" @click="handleStop">
									<template #icon>
										<SvgIcon icon="ri:stop-circle-line" />
									</template>
									停止输出
								</NButton>
							</div>
							<div ref="bottomContainer" class="bottom" />
						</div>
					</div>
				</div>
			</div>
		</main>


		<!--			<footer class="footer-dialog dark:bg-[#1A1D21]" v-if="gptsSources.length > 0" >-->
		<footer class="footer-dialog dark:bg-[#1A1D21] bg-[#FFFFFF]"
			v-if="selectSiderIndex == authStore.appListIndex && selectAppListIndex != 0">
			<!--			<div :class="['m-auto max-w-screen-2xl', isMobile ? 'px-0 pt-1' : 'px-4 py-2']">-->
			<div :class="['m-auto']" style="padding: 0 30px">

				<div class="flex justify-between">
					<div class="flex mb-2">

						<NTooltip trigger="hover" :disabled="isMobile" v-if="isCanUpload">
							<template #trigger>
								<NButton class="dark:bg-[#15171A] bg-[#FFFFFF] mr-4" tertiary round :size="btnSize"
									@click="handleUploadFile(1)" style="diplay: block; margin-right: 1rem;
								border-radius: 8px;border: none;">
									<span class="flex justify-center items-center">
										<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20"
											fill="none" class="mb-1 mr-1">
											<path
												d="M4.92145 8.44626C3.0869 8.88255 1.72241 10.5319 1.72241 12.5C1.72241 14.8012 3.58789 16.6667 5.88908 16.6667C6.28383 16.6667 6.66575 16.6118 7.02762 16.5092"
												stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round"
												stroke-linejoin="round" />
											<path
												d="M15.0785 8.44626C16.9131 8.88255 18.2776 10.5319 18.2776 12.5C18.2776 14.8012 16.4121 16.6667 14.1109 16.6667C13.7162 16.6667 13.3343 16.6118 12.9724 16.5092"
												stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round"
												stroke-linejoin="round" />
											<path
												d="M15.0558 8.33334C15.0558 5.57193 12.8172 3.33334 10.0558 3.33334C7.29434 3.33334 5.05576 5.57193 5.05576 8.33334"
												stroke="#F4F4F4" stroke-width="1.67" stroke-linecap="round"
												stroke-linejoin="round" />
											<path d="M7.16635 11.6172L10.0557 8.71826L13.0274 11.6668" stroke="#A3A5A6"
												stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
											<path d="M10.0558 15.8334V10.1925" stroke="#A3A5A6" stroke-width="1.67"
												stroke-linecap="round" stroke-linejoin="round" />
										</svg>
										<!--														 <SvgIcon class="text-lg" style="width: 1em;height: 1em" icon="octicon:link-16"/>-->
										<span style="font-size: 13px">上传</span>
									</span>
								</NButton>
							</template>
							上传文件
						</NTooltip>

						<NTooltip trigger="hover" :disabled="isMobile" v-if="isCanAudio">
							<template #trigger>
								<NButton tertiary :size="btnSize" @click="handleOpenRecord" round
									class="mr-4 dark:bg-[#15171A] bg-[#FFFFFF]" style="border-radius: 8px;">
									<span class="flex justify-center items-center">
										<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20"
											fill="none">
											<path
												d="M2.48219 6.06211C2.48219 4.08493 4.08491 2.48221 6.06209 2.48221H6.26579C6.48041 2.48224 6.6901 2.54658 6.86781 2.66693C7.04552 2.78727 7.1831 2.9581 7.26279 3.15738L8.1456 5.36403C8.2497 5.62421 8.27517 5.90922 8.21885 6.18374C8.16254 6.45826 8.02691 6.71022 7.82878 6.9084L6.72724 8.00994C6.55075 8.18643 6.47665 8.44311 6.54896 8.68225C6.89225 9.80692 7.50666 10.83 8.33815 11.6615C9.16963 12.493 10.1927 13.1074 11.3174 13.4507C11.5565 13.5234 11.8132 13.4489 11.9897 13.2724L13.0912 12.1709C13.2894 11.9727 13.5414 11.8371 13.8159 11.7808C14.0904 11.7245 14.3754 11.7499 14.6356 11.854L16.8426 12.7368C17.0419 12.8165 17.2127 12.9541 17.3331 13.1318C17.4534 13.3095 17.5178 13.5192 17.5178 13.7339V13.9379C17.5178 15.9151 15.9151 17.5178 13.9379 17.5178H13.7589C7.63367 17.5178 2.64901 12.6341 2.48613 6.54826C2.48613 6.54648 2.48541 6.54469 2.48434 6.54361C2.48368 6.54302 2.48315 6.54231 2.48278 6.54151C2.48241 6.54071 2.48221 6.53984 2.48219 6.53896V6.06211Z"
												stroke="#A3A5A6" stroke-width="1.67" stroke-linejoin="round" />
										</svg>
										<span>语音</span>
									</span>
								</NButton>
							</template>
							语音助手
						</NTooltip>

						<!-- <NTooltip trigger="hover" :disabled="isMobile" v-if="activeGroupInfo.gptsApp != true">
							<template #trigger class="input_btn">
								<button
									style="border-radius: 8px;background: linear-gradient(101deg, #FF75C3 4%, #FFA647 24.47%, #FFE83F 42.67%, #9FFF5B 63.9%, #CD93FF 94.22%);"
									@click="handleOpenModelDialog" :class="[isMobile ? 'px-1 scale-75' : 'px-3']"
									class="mr-2  py-1 mr-4 bg-gradient-to-r from-[#3076ED] to-[#54A2F5] hover:bg-gradient-to-r">
									<span class="flex justify-center items-center">
										<svg class="mb-1" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
											viewBox="0 0 20 20" fill="none">
											<path
												d="M16.6666 8.33332C16.6666 11.1699 14.8951 13.5927 12.3981 14.5557H9.99998H7.60185C5.10481 13.5927 3.33331 11.1699 3.33331 8.33332C3.33331 4.65141 6.31806 1.66666 9.99998 1.66666C13.6819 1.66666 16.6666 4.65141 16.6666 8.33332Z"
												stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round"
												stroke-linejoin="round" />
											<path
												d="M12.3982 14.5557L12.2502 16.2773C12.1502 17.4402 11.1771 18.3333 10.0098 18.3333V18.3333C8.85224 18.3333 7.88378 17.4545 7.77176 16.3023L7.60193 14.5557"
												stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round"
												stroke-linejoin="round" />
											<path d="M9.80112 5.73129L8.69409 8.10935H11.3182L10.0061 10.9384"
												stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round"
												stroke-linejoin="round" />
										</svg>
										<span class="mr-0.5 dark:text-[#010102] text-[#03060C] ml-2">{{
											activeConfig.modelInfo.modelName }}</span>
									</span>
								</button>
							</template>
							模型切换
						</NTooltip> -->
					</div>


					<div class="mb-2" v-if="dataSources.length > 0">
						<NTooltip trigger="hover" :disabled="isMobile">
							<template #trigger>
								<NButton class="dark:bg-[#15171A] bg-[#FFFFFF]" tertiary round :size="btnSize"
									@click="handleClear" style="border-radius: 8px;">
									<span class="flex justify-center items-center ">
										<!--														 <SvgIcon class="text-lg" style="width: 0.8em;height: 0.8em; margin-right: 4px;"-->
										<!--																			icon="uiw:delete"/>-->
										<span>清空</span>
										<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20"
											fill="none">
											<path
												d="M4.65503 4.99582V14.1916C4.65503 16.0325 6.14741 17.5249 7.98836 17.5249H12.0115C13.8525 17.5249 15.3449 16.0325 15.3449 14.1916V4.99582H4.65503Z"
												stroke="#A3A5A6" stroke-width="1.67" stroke-linejoin="round" />
											<path d="M8.57471 8.55911V13.1914" stroke="#A3A5A6" stroke-width="1.67"
												stroke-linecap="round" stroke-linejoin="round" />
											<path d="M11.4253 8.55911V13.1914" stroke="#A3A5A6" stroke-width="1.67"
												stroke-linecap="round" stroke-linejoin="round" />
											<path d="M2.87341 4.99582H17.1265" stroke="#A3A5A6" stroke-width="1.67"
												stroke-linecap="round" stroke-linejoin="round" />
											<path
												d="M6.49878 4.99583L6.9138 4.26905C7.54724 3.15975 8.72666 2.47507 10.0041 2.47507V2.47507C11.2926 2.47507 12.4804 3.17156 13.1096 4.29599L13.5012 4.99583H6.49878Z"
												stroke="#A3A5A6" stroke-width="1.67" stroke-linejoin="round" />
										</svg>
									</span>
								</NButton>
							</template>
							清空聊天记录
						</NTooltip>
					</div>
				</div>

				<div class="input_card flex items-stretch space-x-2">
					<div class="relative flex-1 dark:bg-[#15171A] bg-[#F4F4F4]" style="border-radius: 8px;">

						<NInput style="background: transparent" ref="inputRef" v-model:value="prompt" type="textarea"
							class="pb-10 dark:bg-[#15171A] bg-[#F4F4F4]" clearable :placeholder="placeholder"
							:autosize="{ minRows: isMobile ? 1 : 2, maxRows: isMobile ? 3 : 4 }" @keypress="handleEnter">
						</NInput>

						<div class="absolute bottom-2   right-2 w-[28px]">
							<div class="flex justify-end items-center">
								<span class="dark:bg-[#1C2635] bg-[#F5F8FE]"
									style="padding: 6px 6px;border-radius: 8px;margin-right: 10px">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
										fill="none">
										<path
											d="M14.8248 6.75388C14.8248 5.19376 13.5601 3.92904 12 3.92904C10.4399 3.92904 9.17517 5.19376 9.17517 6.75388V12C9.17517 13.5601 10.4399 14.8248 12 14.8248C13.5601 14.8248 14.8248 13.5601 14.8248 12V6.75388Z"
											stroke="#A3A5A6" stroke-width="2" stroke-linejoin="round" />
										<path
											d="M5.94678 11.5965C5.94678 14.9396 8.65689 17.6497 12 17.6497C15.3431 17.6497 18.0532 14.9396 18.0532 11.5965"
											stroke="#A3A5A6" stroke-width="2" stroke-linecap="round"
											stroke-linejoin="round" />
										<path d="M12 17.6497V20.071" stroke="#A3A5A6" stroke-width="2"
											stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</span>
								<NButton style="border-radius: 8px" type="primary" :disabled="buttonDisabled" round
									@click="handleSubmit">
									发送
									<span class="ml-1">
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
											fill="none">
											<path
												d="M7.95721 12.9128L7.9572 12.9128C7.81154 13.0159 7.62203 13.0335 7.4599 12.9591L3.98974 11.3669C3.59039 11.1836 3.6046 10.6114 4.01256 10.4482L21.6627 3.38806L21.6627 3.38805L18.7104 17.9007L19.2004 18.0004L18.7104 17.9007C18.6421 18.2367 18.2635 18.4058 17.9677 18.2324L17.9677 18.2324L14.3604 16.1186C13.6645 15.7107 12.7708 15.9263 12.3372 16.6063L12.3372 16.6063L10.3608 19.7062V14.9168C10.3608 14.7778 10.4187 14.6451 10.5204 14.5505L15.9859 9.47092C16.3754 9.10892 16.3767 8.49274 15.9888 8.12908C15.6707 7.83094 15.1868 7.7976 14.8309 8.04942L7.95721 12.9128Z"
												fill="white" stroke="white" />
										</svg>
									</span>
								</NButton>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
		<CopyRight v-if="selectSiderIndex == authStore.appListIndex && selectAppListIndex != 0"
			class="footer-copyright-bar dark:bg-[#1A1D21] bg-[#FFFFFF]"></CopyRight>
	</div>
</template>

<style scoped lang="less">
.app_chat_card {
	margin-top: 10px;
	width: calc(100% - 300px);
	height: calc(100% - 80px);
	overflow-y: scroll;
}

.app_chat_card::-webkit-scrollbar {
	display: none;
}

.message-container {
	flex: 3;
}

.copy-container {
	margin: 0 !important;
	padding-top: 10px;
	padding-bottom: 10px;
	font-size: 13px;
	color: #484A4D;
	border-bottom-left-radius: 12px;
	border-bottom-right-radius: 12px;
}

.copy-container div p {
	color: #484A4D !important;
}


.input_card {
	height: 100px;
}

.n-input {
	//height: 100%;
	border-radius: 8px;
	--n-border: 0px solid #ffffff !important;
}
</style>
