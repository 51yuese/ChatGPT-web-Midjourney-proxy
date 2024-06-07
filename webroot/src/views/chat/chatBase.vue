<script setup lang='ts'>
import type {Ref} from 'vue'
import {computed, nextTick, onMounted, onUnmounted, ref, watch, onBeforeMount, defineEmits} from 'vue'
import {NButton, NInput, NTooltip, useDialog, useMessage} from 'naive-ui'
import HeaderComponent from './components/Header/index.vue'
import AiBotComponent from './components/AiBot/index.vue'

import CopyRight from "@/components/common/Copyright/index.vue";
import RecordDialog from "@/layout/components/RecordDialog.vue";
import ModelDialog from '@/layout/components/ModelDialog.vue"'
import CreateApp from "@/views/gpts/components/gpts/CreateAppDialog.vue";
import {fetchQueryModelsListAPI} from '@/api/models'
import html2canvas from 'html2canvas'
import {useRoute} from 'vue-router'
import {Message} from './components'
import {useScroll} from './hooks/useScroll'
import {useCopyCode} from './hooks/useCopyCode'
import {useChat} from './hooks/useChat'
import {useUsingContext} from './hooks/useUsingContext'
import {useUsingNetwork} from './hooks/useUsingNetwork'

import {SvgIcon} from '@/components/common'
import {useBasicLayout} from '@/hooks/useBasicLayout'
import {useAppStore, useAuthStore, useChatStore, useGlobalStoreWithOut, useAppCatStoreWithOut} from '@/store'
import {fetchChatAPIProcess} from '@/api'
import {t} from '@/locales'
import {router} from '@/router'

import {fetchChatTailAPI} from "@/api/config";
import {useUpload} from "@/views/chat/hooks/useUpload";
import {AxiosProgressEvent} from "axios";
import {fetchUpdateGroupAPI} from "@/api/group";

const useGlobalStore = useGlobalStoreWithOut()
const useAppCatStore = useAppCatStoreWithOut()
const authStore = useAuthStore()
const route = useRoute()
let controller = new AbortController()
const appCenterStore = useAppCatStoreWithOut()

const dialog = useDialog()
const ms = useMessage()
const appStore = useAppStore()
const bottomContainer = ref()
const chatStore = useChatStore()
const isStreamIn = ref(false)
const typingStatusEnd = ref(true) // 打字效果是否完成
// 聊天方式选择的索引 0 表示直接开始 1表示其他应用
const cardSelectIndex = ref(0)

const {addGroupChat, updateGroupChat, updateGroupChatSome} = useChat()

const appId = computed(() => route.query.appId as string)
const tradeStatus = computed(() => route.query.trade_status as string)
const token = computed(() => route.query.token as string)
const runApp = computed(() => useAppCatStore.runApp)


useCopyCode()

const {isMobile} = useBasicLayout()
const {scrollRef, scrollToBottom, scrollToBottomIfAtBottom} = useScroll()
const {usingContext, toggleUsingContext} = useUsingContext()
const {usingNetwork} = useUsingNetwork()

const dataSources = computed(() => chatStore.chatList);
// const activeModel = computed(() => chatStore.activeModelName);
const isCanUpload = computed(() => chatStore.canUpload);
const isCanAudio = computed(() => chatStore.canAudio);
const isLogin = computed(() => authStore.isLogin);
let applyList = Object


const {selectFile, upload} = useUpload();

/* 当前所有的ai回复信息列表 方便拿到上下文 */
const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !item.error)))

const prompt = ref<string>('')
const loading = ref<boolean>(false)
const inputRef = ref<Ref | null>(null)
const firstScroll = ref<boolean>(true)
const chatTail = ref<string>('')

/* 当前选中的对话组 */
const activeGroupId = computed(() => chatStore.active)

/* 当前对话组的详细信息 */
const activeGroupInfo = computed(() => chatStore.groupList.find((item: any) => item.uuid === activeGroupId.value))

/* 当前选用的模型的类型 1： openai  2: 百度  */
const activeModelKeyType = computed(() => Number(chatStore?.activeModelKeyType))

const buttonDisabled = computed(() => {
	return loading.value || !prompt.value || prompt.value.trim() === '' || !typingStatusEnd.value
})

watch(activeGroupId, (val) => {
		if (val)
			firstScroll.value = true
		if (inputRef.value && !isMobile.value)
			inputRef.value?.focus()
	},
	{immediate: true},
)

watch(dataSources, (val) => {
		if (val.length === 0)
			return
		if (firstScroll.value) {
			firstScroll.value = false
			scrollToBottom()
		}
	},
	{immediate: true},
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

	const result = await upload({purpose, file: <File>file}, (progressEvt: AxiosProgressEvent) => {
		const {progress, loaded, total} = progressEvt;

		if (progress && Number(progress.toFixed(2)) * 100 <= 99) {
			useGlobalStore.updateUploadProgress(Number(progress.toFixed(2)) * 100);
		}

	})

	if (result.data) {
		useGlobalStore.updateUploadProgress(100);
		useGlobalStore.updateUploadDialog(false)

		prompt.value = mode === 1 ? '请分析一下上传的这个文件 ' + result.data : '请将语音转换成文本 ' + result.data
		// prompt.value = mode === 1 ? result.data : '请将语音转换成文本 ' + result.data
	}

	if (mode !== 1) {
		useGlobalStore.updateRecordDialog(false)
	}

}

function handlePrompt(val: string) {
	prompt.value = val;
	handleSubmit()
}

function handleScrollBtm() {
	bottomContainer.value.scrollIntoView({behavior: 'smooth'})
}

function handleUpdateModel(val: number) {
	useGlobalStore.updateModel(val)
}

/* 发送消息 */
async function handleSubmit(index?: number) {
	if (!isLogin.value){
		authStore.setLoginDialog(true)
		return
	}

	if (chatStore.groupList.length === 0 || loading.value || !typingStatusEnd.value) return;
	let message = ''

	/* 如果有index就是重新生成 */
	if (index && typeof index === 'number') {
		const {requestOptions} = dataSources.value[index]
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
		requestOptions: {prompt: message, options: null},
	})

	scrollToBottom()

	loading.value = true
	prompt.value = ''

	let options: any = {groupId: +activeGroupId.value, usingNetwork: usingNetwork.value}
	const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions

	if (lastContext && usingContext.value && !usingNetwork.value) {
		options = {...lastContext, ...options}
	}


	/* 虚拟增加一条ai记录 */
	addGroupChat({
			dateTime: new Date().toLocaleString(),
			text: 'AI思考中',
			loading: true,
			inversion: false,
			error: false,
			conversationOptions: null,
			requestOptions: {prompt: message, options: {...options}},
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
							conversationOptions: {conversationId: data?.conversationId, parentMessageId: data?.id},
							requestOptions: {prompt: message, options: {...options}},
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

					updateGroupChatSome(dataSources.value.length - 1, {loading: false}) // 更新最后一条的loading状态

					useGlobalStore.updateIsChatIn(false)

					/* 如果拿到了余额信息  更新 */
					if (userBanance) {
						authStore.updateUserBanance(userBanance)
					}

					/* 当为2说明第一次对话 则修改一个对话组的默认title，取回答记录前十个字 如果长度不到十个 拿全部 */
					if (dataSources.value.length === 2 && !activeGroupInfo?.value?.appId) {
						const title = dataSources.value[1].text.length > 15 ? dataSources.value[1].text.slice(0, 15) : dataSources.value[1].text
						await chatStore.updateGroupInfo({groupId: +activeGroupId.value, title})
						await chatStore.queryMyGroup()
					}

					scrollToBottomIfAtBottom()
				}
			}, 16)

			// 流式接入数据
			await fetchChatAPIProcess<Chat.ConversationResponse>({
				prompt: message,
				appId: activeGroupInfo.value ? activeGroupInfo.value.appId : 0,
				options,
				signal: controller.signal,
				onDownloadProgress: ({event}) => {

					const xhr = event.target;
					const {responseText} = xhr

					/* 这种解析只对openai有效 其他的会漏掉前面的字 */
					if ([1].includes(activeModelKeyType.value)) {

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
					}

					/* 处理和百度一样格式的模型消息解析 */
					if ([2, 3].includes(activeModelKeyType.value)) {
						const lines = responseText
							.toString()
							.split('\n')
							.filter((line: string) => line.trim() !== '');

						let cacheResult = '' // 拿到本轮传入的所有字段信息
						let tem: any = {}
						for (const line of lines) {
							try {
								const parseData = JSON.parse(line);
								cacheResult += parseData.result
								tem = parseData
							} catch (error) {
								console.log('Json parse 2 3 type error: ', line);
							}
						}
						tem.result = cacheResult
						data = tem
					}

					// 讯飞星火模型
					if ([4].includes(activeModelKeyType.value)) {

						const lastIndex = responseText.lastIndexOf('\n', responseText.length)
						let chunk = responseText;

						if (lastIndex !== -1) {
							chunk = responseText.substring(lastIndex)
						}

						try {
							data = JSON.parse(chunk)
						} catch (error) {

							// TODO 如果出现类似超时错误 会连接上次的内容一起发出来导致无法解析  后端需要处理 下
							console.log('parse data error from xunfeizhipu: ', error, chunk);
							if (chunk.includes('xunfeizhipu timed out waiting for response')) {
								console.log('绘画超时了~')
								ms.warning('会话超时了、告知管理员吧~~~')
							}
						}
					}

					// 显示消耗的token
					try {

						/* 如果出现输出内容不一致就需要处理了 */
						if ([1].includes(activeModelKeyType.value)) {

							cacheResText = data.text;
							isStreamIn.value = !data.is_end;

							if (data?.detail?.usage) {
								typingStatusEnd.value = data.is_end;
								userBanance = data?.userBanance;
							}
						}

						// 百度
						if ([2, 3].includes(activeModelKeyType.value)) {
							const {result, is_end} = data
							cacheResText = result
							isStreamIn.value = !is_end
							data?.userBanance && (userBanance = data?.userBanance)
						}

						// 讯飞星火模型
						if ([4].includes(activeModelKeyType.value)) {

							const {text, is_end} = data
							cacheResText = text
							isStreamIn.value = !is_end
							data?.userBanance && (userBanance = data?.userBanance)
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
			useGlobalStore.updateVipDialog(true);

		let errorMessage = error?.message ?? t('common.wrong')
		if (errorMessage === 'Request failed with status code 401')
			errorMessage = '非法操作、请先登录后再进行问答使用！'

		if (error?.message.includes('canceled')) {
			updateGroupChatSome(dataSources.value.length - 1, {loading: false})
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
				requestOptions: {prompt: message, options: {...options}},
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

	const {requestOptions} = dataSources.value[index]

	let message = requestOptions?.prompt ?? ''

	let options: any = {groupId: +activeGroupId.value, usingNetwork: usingNetwork.value}

	if (requestOptions.options) {
		options = {...requestOptions.options, groupId: +activeGroupId.value}
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
			requestOptions: {prompt: message, ...options},
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
			requestOptions: {prompt: message, options: {...options}},
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
				onDownloadProgress: ({event}) => {
					const xhr = event.target
					const {responseText} = xhr
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
								conversationOptions: {conversationId: data.conversationId, parentMessageId: data.id},
								requestOptions: {prompt: message, options: {...options}},
							},
						)
					} catch (error) {
						console.log(error);
						//
					}
				},
			})
			updateGroupChatSome(dataSources.value.length - 1, {loading: false})
		}
		await fetchChatAPIOnce()
	} catch (error: any) {

		if (error?.message.includes('canceled')) {
			updateGroupChatSome(dataSources.value.length - 1, {loading: false})
			setTimeout(() => authStore.getUserBalance(), 200)
			return
		}

		if (error.code === 402 || error?.message.includes('余额不足'))
			useGlobalStore.updateVipDialog(true);

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
				requestOptions: {prompt: message, ...options},
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

	await router.replace({name: 'Chat', query: {}})
	const isHasGroup = chatStore.groupList.find((item: any) => item.appId === id);

	if (!isHasGroup) {
		await chatStore.addNewChatGroup(id)
		await chatStore.queryMyGroup()
	} else {
		await chatStore.setActiveGroup(isHasGroup.uuid)
	}

	if (prompt.value) {
		handlePrompt(prompt.value)
	}

}

/* 处理三方对接跳转 */
async function otherLoginByToken(token: string) {
	authStore.setToken(token)
	await router.replace({name: 'Chat', query: {}})
	ms.success('账户登录成功、开始体验吧！')
	await authStore.getUserInfo()
}

/* 支付回调处理 */
function handleRefresh() {
	if (tradeStatus.value.toLowerCase().includes('success')) {
		ms.success('感谢你的购买、祝您使用愉快~', {duration: 5000})
		authStore.getUserInfo()
		router.replace({name: 'Chat', query: {}})
	} else {
		ms.error('您还没有购买成功哦~')
	}
}

/* 导出 */
function handleExport() {
	if (loading.value) {
		return
	}


	const d = dialog.warning({
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
function handleDelete({chatId}: Chat.Chat) {

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
			chatStore.deleteChatById(chatId)
		},
	})
}

function handleClear() {

	if (!isLogin.value) {
		authStore.setLoginDialog(true)
		return
	}

	if (loading.value)
		return

	dialog.create({
		title: t('chat.clearChat'),
		content: t('chat.clearChatConfirm'),
		positiveText: t('common.yes'),
		negativeText: t('common.no'),
		onPositiveClick: async () => {
			await chatStore.clearChatByGroupId()
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

// const placeholder = computed(() => {
// 	if (isMobile.value)
// 		return t('chat.placeholderMobile')
// 	return t('chat.placeholder')
// })

// 获取小尾巴功能
const getChatTail = () => {
	fetchChatTailAPI(['dialogueTail']).then(res => {
		chatTail.value = res.data;
	})
}


const handleChat = async (data: { id: number; demoData: string; }) => {

	if (data.id && data.demoData) {
		prompt.value = data.demoData;
		await handleAppId(data.id);
		await chatStore.updateChatTab("app");
		return;
	}

	prompt.value = ""
}

watch(runApp, (val) => {
		handleChat(val)
		console.log(val)
	},
)

const handleOpenModelDialog = () => {
	if (!isLogin.value) {
		authStore.setLoginDialog(true)
		return
	}

	if (useGlobalStore.isChatIn) {
		return ms.warning('请等待聊天结束后修改模型信息！')
	}
	useGlobalStore.updateModelDialog(true)
}


const modelName = computed(() => {
	if (!chatStore.activeConfig) return;
	const {modelInfo} = chatStore.activeConfig
	if (!modelInfo) return
	return `${modelInfo.modelName}`
})


onMounted(async () => {

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
		await chatStore.queryActiveChatLogList()
		await scrollToBottom()
		if (inputRef.value && !isMobile.value)
			inputRef.value?.focus()
	})
	getChatTail()
})
const darkMode = computed(() => appStore.theme === 'dark')
const recordDialog = computed(() => useGlobalStore.recordDialog)
onUnmounted(() => {
	if (loading.value)
		controller.abort()
})


const getMobileClass = computed(() => {
	if (isMobile.value)
		return ['h-full']
})

const getMobileStyle = computed(() => {
	// if (!isMobile.value)
	// 	return {height: 'calc(100% - 60px)', width: '88%'}
})

const btnSize = computed(() => {
	if (!isMobile.value)
		return 'small'
	return 'tiny'
})

// 聊天方式监听事件
function changSessionType(index) {
	cardSelectIndex.value = index
}

// 跳转到dell绘画页面
function jumpDallDrawing() {
	router.push('/draw')

}

const ModelDialogRef = ref()

// 对话文件上传
async function uploadFlie(data) {

	if (!isLogin.value) {
		authStore.setLoginDialog(true)
		return
	}

	let newData = {modelInfo: data}
	// 获取当前绘画的模型
	const active = JSON.parse(activeGroupInfo.value?.config)
	if ("专业AI模型（ERNIE-Bot）" == active.modelInfo.modelName) {

		handleUploadFile();
	} else {
		console.log(newData)
		const params = {
			groupId: activeGroupId.value,
			// config: "{\"modelInfo\":{\"canAudio\":false,\"canUpload\":true,\"keyType\":\"1\",\"modelName\":\"专业AI模型（ERNIE-Bot）\",\"model\":\"gpt-4-all\",\"maxModelTokens\":8096,\"maxResponseTokens\":4000,\"systemMessage\":\"\",\"topN\":0.8,\"deductType\":2,\"deduct\":1,\"maxRounds\":12,\"rounds\":8},\"modelTypeInfo\":{\"label\":\"系统内置大模型\",\"val\":\"1\"}}"
			config: JSON.stringify(newData)
		}
		const res = await fetchUpdateGroupAPI(params)
		if (res.code == 200) {
			await chatStore.queryMyGroup()
			handleUploadFile();
		} else {
			ms.error(res.data)
		}
	}


}

const canUploadItem = ref()
onBeforeMount(() => {
	fetchQueryModelsListAPI().then(res => {
		canUploadItem.value = res.data.modelMaps[1].filter(item => item.canUpload == true)[0]
	})
})


import EventBus from '@/hooks/eventBus'
const handleToGpts = () => {
	if (!isLogin.value) {
		authStore.setLoginDialog(true)
		return
	}

	EventBus.emit('gptsRouter', '/gpts')
	router.push("/gpts")
}

function createDialog(){
	if (!isLogin.value) {
		authStore.setLoginDialog(true)
		return
	}
	authStore.updateCreateAppDialog(true)
}
</script>

<template>
	<div class="chat_card flex w-full flex-col bg-[#f4f4f4] dark:bg-[#010102]" :class="getMobileClass"
			 :style="getMobileStyle">
		<!-- <div class=""> -->
		<!-- 上传文件弹窗 -->
		<RecordDialog :visible="recordDialog" @submit="handleUploadFile"/>

		<!--头部显示标题 和导出按钮 -->
		<HeaderComponent :using-context="usingContext" :dark-mode="darkMode" @export="handleExport"
										 @toggle-using-context="toggleUsingContext" @clear="handleClear"/>

		<main class="flex-1 overflow-hidden">
			<div id="scrollRef" :class="dataSources.length ? '' : 'noData'" ref="scrollRef"
					 class="relative h-full overflow-hidden overflow-y-auto scroll-smooth bg-[#fff] dark:bg-[#1A1D21]"
					 style="border-radius: 10px 10px 0 0;margin-left: 20px;margin-right: 10px;">
				<div id="image-wrapper" class="w-full max-w-screen-2xl m-auto  h-full" :class="[isMobile ? '' : 'p-4']">

					<div class="main_content" v-if="!dataSources.length">
						<div class="main_title">
							<div style="font-size: 32px" class="text-[#000] dark:text-[#fff]">欢迎使用 <span
								style="font-size: 32px" class="dark:text-[#2960BE] text-[#3378ED]">聊一聊</span></div>
							<div style="font-size: 13px" class="text-[#818181] dark:text-[#A1A1A1]">由最先进AI支持的人类助手</div>
						</div>
						<div class="type">
							<div class="dark:text-[#E6E6E6] text-[#7F7F7F]">选择开始的方式</div>
							<div class="type_item dark:bg-[#010102] bg-[#F4F4F4]">
								<div :class="cardSelectIndex == 0 ? 'item dark:bg-[#2960BE] bg-[#3378ED] text-[#fff]' : 'def_item'"
										 @click="changSessionType(0)">
									<div>
										<!-- <img class="type_img" src="../../assets/images/send.png"> -->
										<SvgIcon class="mr-[10px]" icon="simple-line-icons:paper-plane"></SvgIcon>
									</div>
									<div>直接开始</div>
								</div>
								<div :class="cardSelectIndex == 1 ? 'item dark:bg-[#2960BE] bg-[#3378ED] text-[#fff]' : 'def_item'"
										 @click="changSessionType(1)">
									<div>
										<SvgIcon class="mr-[10px]" icon="icon-park-outline:all-application"></SvgIcon>
									</div>
									<div>其他应用</div>
								</div>
								<!-- <div :class="cardSelectIndex == 1 ? 'item dark:bg-[#3B3B5C] bg-[#3378ED] text-[#fff]' : 'def_item'"
						@click="handleToGpts">
						<div>
							<SvgIcon class="mr-[10px]" icon="icon-park-outline:all-application"></SvgIcon>
						</div>
						<div>其他应用</div>
					</div> -->
							</div>
						</div>
						<!--直接开始模块-->
						<div class="session_type" v-if="cardSelectIndex == 0">
							<div class="session_type_title">高级对话</div>
							<div class="item_card">
								<div class="item dark:bg-[#202B3A] bg-[#F5F8FE]">
									<div style="font-size: 17px;font-weight: bold;"
											 class="text-[#03060C] dark:text-[#fff]">
										PDF 问答/数据分析（基础版）
									</div>
									<div
										class="item_btn border-[2px] border-[#3378ED] text-[#3378ED] dark:text-[#2960BE]"
										@click="uploadFlie(canUploadItem)">上传文件
									</div>
									<div style="font-size: 14px;padding-top: 20px" class="dark:text-[#76777A] text-[#A3A5A6]">
										支持常见文件类型，最大25M
									</div>
									<div class="img_card dark:text-[#76777A] text-[#A3A5A6]">
										<div v-if="canUploadItem">{{ canUploadItem.modelName }}</div>
									</div>
								</div>
								<div class="item dark:bg-[#202B3A] bg-[#F5F8FE]" @click="jumpDallDrawing">
									<div style="font-size: 17px;font-weight: bold;"
											 class="text-[#03060C] dark:text-[#fff]">
										Dall-E绘画
									</div>
									<div
										class="item_btn border-[2px] border-[#3378ED] text-[#3378ED] dark:text-[#2960BE]">
										开始画图
									</div>
									<div class="dark:text-[#76777A] text-[#A3A5A6]" style="font-size: 14px;padding-top: 20px">
										支持常见文件类型，最大25M
									</div>
									<div class="img_card dark:text-[#76777A] text-[#A3A5A6]">
										<div>dall-e-3模型</div>
									</div>
								</div>
								<div class="item dark:bg-[#202B3A] bg-[#F5F8FE]">
									<div style="font-size: 17px;font-weight: bold;"
											 class="text-[#03060C] dark:text-[#fff]">
										图片对话
									</div>
									<div
										class="item_btn  border-[2px] border-[#3378ED] text-[#3378ED] dark:text-[#2960BE]"
										@click="uploadFlie(canUploadItem)">上传文件
									</div>
									<div style="font-size: 14px;padding-top: 20px" class="dark:text-[#76777A] text-[#A3A5A6]">
										支持常见文件类型，最大25M
									</div>
									<div class="img_card dark:text-[#76777A] text-[#A3A5A6]">
										<div v-if="canUploadItem">{{ canUploadItem.modelName }}</div>
									</div>
								</div>
							</div>
						</div>
						<!--其他应用模块-->
						<div class="apply_card" v-else>
							<div class="tips_tag">
								<div class="tag_item">多模型场景</div>
								<div class="tag_item">场景方案</div>
								<div class="tag_item">工作流</div>
							</div>
							<div class="title_card">
								<div>从收藏和创建的AI应用中选择</div>
								<div class="right_tag">
									<div class="tag dark:bg-[#010102] bg-[#f4f4f4]"
											 @click="handleToGpts">
										<div>
											<SvgIcon class="text-[15px] mr-[4px]" icon="icon-park-outline:application">
											</SvgIcon>
										</div>
										<div>应用中心</div>
									</div>
									<div class="tag dark:bg-[#010102] bg-[#f4f4f4]"
											 @click="createDialog">
										<div>
											<SvgIcon class="text-xl" icon="material-symbols-light:add"></SvgIcon>
										</div>
										<div>创建应用</div>
									</div>

								</div>
							</div>
							<div class="apply_list">
								<AiBotComponent @run-app="handleChat" @click="changSessionType(1)"/>
							</div>
						</div>
					</div>

					<template v-else>

						<!--新增小尾巴	-->
						<div class="max-w-full" :class="[isMobile ? 'px-1' : '']" style="width: 100%;">
							<Message :chatTail="chatTail" v-for="(item, index) of dataSources" :key="item.chatId"
											 :date-time="item.dateTime" :text="item.text" :inversion="item.inversion"
											 :error="item.error" :loading="item.loading" @regenerate="handleSubmit(index)"
											 @delete="handleDelete(item)"/>

							<div class="sticky bottom-0 left-0 flex justify-center">
								<NButton v-if="loading" @click="handleStop">
									<template #icon>
										<SvgIcon icon="ri:stop-circle-line"/>
									</template>
									停止输出
								</NButton>
							</div>
							<div ref="bottomContainer" class="bottom"/>
						</div>
					</template>
				</div>
			</div>
		</main>

		<!--		<div class="input_card">-->
		<!--			<div class="model">-->
		<!--				<div class="left">-->
		<!--					<div class="btn_tag">-->
		<!--						<SvgIcon class="text-lg" :class="[!isMobile ? 'mr-0.5' : '']" style="width: 0.8em;height: 0.8em"-->
		<!--										 icon="octicon:link-16"/>-->
		<!--						<span style="margin-left: 5px" v-if="!isMobile">上传</span>-->
		<!--					</div>-->
		<!--					<div class="btn_tag">-->
		<!--						<SvgIcon class="text-lg" :class="[!isMobile ? 'mr-0.5' : '']" style="width: 0.8em;height: 0.8em"-->
		<!--										 icon="streamline:voice-mail"/>-->
		<!--						<span style="margin-left: 5px" v-if="!isMobile">语音通话</span>-->
		<!--					</div>-->
		<!--					<div class="btn_tag">-->
		<!--						<SvgIcon class="text-lg text-white" style="width: 0.8em;height: 0.8em" icon="carbon:model"/>-->
		<!--						<span style="margin-left: 5px" class="text-white mr-0.5">{{ modelName }}</span>-->
		<!--					</div>-->
		<!--				</div>-->
		<!--				<div class="right">-->
		<!--					<div class="btn_tag">-->
		<!--						<span style="margin-right: 5px">清空</span>-->
		<!--						<SvgIcon class="text-lg mr-0.5" style="width: 0.8em;height: 0.8em;" icon="uiw:delete"/>-->
		<!--					</div>-->
		<!--				</div>-->
		<!--			</div>-->
		<!--			&lt;!&ndash;输入框&ndash;&gt;-->
		<!--			<div class="input"></div>-->
		<!--		</div>-->

		<footer class="footer-dialog bg-[#fff] dark:bg-[#1A1D21]" v-if="cardSelectIndex == 0"
						style="border-radius: 0 0 10px 10px;margin-left: 20px; margin-right: 10px;">
			<!--			<div :class="['m-auto max-w-screen-2xl', isMobile ? 'px-0 pt-1' : 'px-4 py-2']">-->
			<div style="padding-right: 20px;padding-left: 20px" :class="['m-auto', isMobile ? 'px-0 pt-1' : 'px-4 py-2']">
				<div class="flex justify-between">
					<div class="flex mb-1 items-center" :class="['max-w-screen-2xl', isMobile ? 'px-1' : '']">
						<NButton strong secondary :size="btnSize" @click="handleUploadFile(1)" v-if="isCanUpload"
										 style="diplay: block; margin-right: 12px;border-radius:8px;"
										 class="bg-[#f4f4f4] dark:bg-[#010102]">
								<span class="flex justify-center items-center">
									<SvgIcon class="text-xl" :class="[!isMobile ? 'mr-0.5' : '']"
													 style="width: 0.8em;height: 0.8em" icon="line-md:cloud-up"/>
									<span v-if="!isMobile">上传</span>
								</span>
						</NButton>

						<NButton strong secondary :size="btnSize" @click="handleOpenRecord" v-if="isCanAudio" round
										 style="diplay: block; margin-right: 0.4rem;" class="bg-[#f4f4f4] dark:bg-[#010102]">
								<span class="flex justify-center items-center">
									<SvgIcon class="text-lg" :class="[!isMobile ? 'mr-0.5' : '']"
													 style="width: 0.8em;height: 0.8em" icon="streamline:voice-mail"/>
									<span v-if="!isMobile">语音助手</span>
								</span>
						</NButton>

						<NTooltip trigger="hover" :disabled="isMobile">
							<template #trigger class="input_btn">
								<button strong secondary style="border-radius: 8px;" @click="handleOpenModelDialog"
												:class="[isMobile ? 'px-1 scale-75' : 'px-3']"
												class="mr-2  py-1 bg-gradient-to-r from-[#3076ED] to-[#54A2F5] hover:bg-gradient-to-r">
										<span class="flex justify-center items-center">
											<SvgIcon class="text-lg text-white" style="width: 0.8em;height: 0.8em"
															 icon="carbon:model"/>
											<span class="text-white mr-0.5">{{ modelName }}</span>
										</span>
								</button>
							</template>
							模型切换
						</NTooltip>

						<!--            <n-popover trigger="hover">-->
						<!--              <template #trigger>-->
						<!--                <NButton  size="small"   round style="diplay: block; margin-right: 0.4rem;">-->
						<!--                     <span class="flex justify-center items-center">-->
						<!--								      	 <SvgIcon class="text-lg mr-0.5" style="width: 0.8em;height: 0.8em" icon="iconoir:shop"/>-->
						<!--                       <span>插件商店</span>-->
						<!--								       </span>-->
						<!--                </NButton>-->
						<!--              </template>-->
						<!--              <div class="flex flex-row items-center">-->
						<!--                <p class="mr-1">联网查询</p>-->
						<!--                <NSwitch v-model:value="usingNetwork" theme="primary" size="small" :checked-value="true" :unchecked-value="false" @change="toggleUsingNetwork"></NSwitch>-->
						<!--              </div>-->
						<!--            </n-popover>-->

					</div>

					<!--		          <div class="mb-2" v-if="dataSources.length > 0">-->
					<!--		            <NTooltip trigger="hover" :disabled="isMobile">-->
					<!--		              <template #trigger>-->
					<!--		                <NButton size="small" round @click="handleClear" >-->
					<!--									    <span class="flex justify-center items-center ">-->
					<!--												 <SvgIcon class="text-lg mr-0.5" style="width: 0.8em;height: 0.8em;border: 1px solid #3C3C5A;" icon="uiw:delete"/>-->
					<!--		                     <span>清空</span>-->
					<!--										  </span>-->
					<!--		                </NButton>-->
					<!--		              </template>-->
					<!--		              清空聊天记录-->
					<!--		            </NTooltip>-->
					<!--		          </div>-->

					<div class="mb-2">
						<NTooltip trigger="hover" :disabled="isMobile">
							<template #trigger>
								<NButton strong secondary size="small" round @click="handleClear" style="border-radius: 8px;"
												 class="dark:bg-[#010102] bg-[#F4F4F4]">
										<span class="flex justify-center items-center ">
											<span class="dark:text-[#A3A5A6] text-[#76777A]">清空</span>
											<SvgIcon class="text-xl ml-0.5" style="width: 0.8em;height: 0.8em;"
															 icon="akar-icons:trash-can"/>
										</span>
								</NButton>
							</template>
							清空聊天记录
						</NTooltip>
					</div>
				</div>

				<div class="flex items-stretch space-x-2">
					<div style="border-radius: 8px;position: relative ;padding-bottom: 10px;margin-top: 10px"
							 class="relative flex-1 bg-[#f4f4f4] dark:bg-[#15171A]">

						<!-- <NInput ref="inputRef" v-model:value="prompt" type="textarea"
							class="pb-10" clearable placeholder="你可以问我任何问题"
							:autosize="{ minRows: isMobile ? 1 : 2, maxRows: isMobile ? 3 : 4 }"
							@keypress="handleEnter">
						</NInput> -->
						<textarea ref="inputRef" v-model="prompt" placeholder="你可以问我任何问题"
											style="height: 100px;width: 100%;resize:none;border-radius: 8px;" @keypress="handleEnter"
											class="bg-[#f4f4f4] dark:bg-[#15171A] pt-4 pb-10 pl-5 pr-5">

							</textarea>
						<div class="absolute bottom-6 right-2">
							<div class="flex items-center justify-between">

								<div class="flex justify-between items-center">
									<!-- <div class="tape_img dark:bg-[#1C2635] bg-[#F5F8FE]" >  -->
									<!-- 语音按钮暂时注释 -->
									<!-- <SvgIcon class="text-xl" icon="ph:microphone-light"></SvgIcon>
						</div> -->
									<NButton class="sendBtn" type="primary" size="small" :disabled="buttonDisabled"
													 round @click="handleSubmit">
										<div style="margin-right: 10px">发送</div>
										<SvgIcon icon="icon-park-outline:send"/>
									</NButton>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<CopyRight v-if="!isMobile" class="footer-copyright-bar"></CopyRight>

		</footer>
		<!--添加应用弹窗-->
		<CreateApp></CreateApp>
	</div>


	<!-- </div> -->
</template>

<style lang="less" scoped>

.chat_card {
	margin-top: 10px;
	width: calc(100% - 300px);
	height: calc(100% - 80px);
	margin-left: 0;
}

.message-container {
	flex: 3;
}

.main_content {
	width: 100%;
	height: 100%;
	overflow: hidden;


	.main_title {
		text-align: center;
		//margin-top: 20px;
	}

	.type {
		text-align: center;
		font-size: 14px;
		margin-top: 30px;

		.type_item {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0 5px;
			width: 300px;
			height: 50px;
			// background: #272740;
			border-radius: 32px;
			margin-left: 50%;
			transform: translate(-50%);
			justify-content: space-between;
			margin-top: 10px;

			// 选中的样式
			.item {
				display: flex;
				align-items: center;
				width: 150px;
				height: 41px;
				// background: #3B3B5C;
				border-radius: 27px;
				justify-content: center;
				font-size: 15px;
				cursor: pointer;

				.type_img {
					width: 18px;
					height: 18px;
					margin-right: 10px;
					margin-bottom: 5px;
				}
			}

			// 默认未选中样式
			.def_item {
				display: flex;
				align-items: center;
				width: 150px;
				height: 54px;
				border-radius: 27px;
				justify-content: center;
				font-size: 15px;
				cursor: pointer;

				.type_img {
					width: 18px;
					height: 18px;
					margin-right: 10px;
					margin-bottom: 5px;
				}
			}
		}
	}

	.session_type::-webkit-scrollbar {
		width: 0;
	}

	// 直接开始对话模块样式 start
	.session_type {
		margin-top: 40px;
		overflow-y: scroll;
		height: 65%;
		padding-bottom: 100px;

		.session_type_title {
			font-size: 15px;
			background-position: right;
			background-size: 10px 1px;
			background-repeat: repeat-x;
		}

		.item_card {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-top: 10px;
			.item:nth-child(3) {
				margin-right: 0;
			}

			.item {
				width: 400px;
				height: 200px;
				border-radius: 15px;
				opacity: 0.73;
				text-align: center;
				padding: 20px;
				margin-right: 20px;

				.item_btn {
					width: 100%;
					height: 44px;
					// background: #2E2E4C;
					border-radius: 7px;
					font-size: 16px;
					margin-bottom: 10px;
					margin-top: 20px;
					line-height: 44px;
					cursor: pointer;
				}

				.img_card {
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 14px;
					margin-top: 5px;

					img {
						width: 15px;
						height: 15px;
						margin-right: 5px;
					}
				}
			}
		}
	}

	// 直接开始对话模块样式 end

	// 其他应用模块样式 start
	.apply_card {
		width: 100%;
		padding: 0 100px;
		box-sizing: border-box;


		.tips_tag {
			text-align: center;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-top: 20px;

			.tag_item {
				height: 30px;
				padding: 0 10px;
				line-height: 30px;
				background: #489FFE;
				border-radius: 10px;
				// font-size: 13px;
				color: #ffffff;
				margin-right: 10px;
			}
		}

		.title_card {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-top: 20px;
			margin-bottom: 10px;

			.right_tag {
				display: flex;
				align-items: center;

				.tag {
					display: flex;
					align-items: center;
					border-radius: 8px;
					padding: 5px 10px;
					font-size: 14px;
					margin-right: 10px;
					cursor: pointer;

					img {
						width: 13px;
						height: 13px;
						margin-right: 5px;
					}
				}
			}
		}

		.apply_list {
			width: 100%;
			height: 60vh;
			display: flex;
			align-items: center;
			justify-content: space-between;
			flex-wrap: wrap;
			overflow-y: scroll;
		}
	}

	// 其他应用模块样式模块样式 end
}


// 模型选中样式
/deep/ .bg-gradient-to-r {
	background-image: linear-gradient(to right, #006EDD, #0099D4, #5052D7);
}


// 输入框提示文字
/deep/ .n-input {
	padding-top: 10px;
}

.sendBtn {
	width: 80px;
	height: 35px;
	background: #006DDD;
	border-radius: 5px;
	position: absolute;
	right: 10px;
}

.tape_img {
	position: absolute;
	width: 40px;
	height: 35px;
	border-radius: 5px;
	right: 100px;
	display: flex;
	justify-content: center;
	align-items: center;

	img {
		padding-top: 30%;
		padding-left: 50%;
		transform: translate(-25%, -20%);
	}
}

.n-input {
	border-radius: 15px;
}

#image-wrapper {
	max-width: none;
	padding: 20px;
	padding-left: 6%;
	padding-right: 6%;
}

.noData {
	scrollbar-width: none;
	/* Firefox */
	-ms-overflow-style: none;
	/* IE 10+ */
}

// ::-webkit-scrollbar {
//   display: none; /* Chrome Safari */
// }</style>
