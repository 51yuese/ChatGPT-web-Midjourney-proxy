<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { NButton, NInput, NTooltip, useDialog, useMessage } from 'naive-ui'
import HeaderComponent from './components/Header/index.vue'
import AiBotComponent from './components/AiBot/index.vue'
import CopyRight from "@/components/common/Copyright/index.vue";
import RecordDialog from "@/layout/components/RecordDialog.vue";

import html2canvas from 'html2canvas'
import { useRoute } from 'vue-router'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useCopyCode } from './hooks/useCopyCode'
import { useChat } from './hooks/useChat'
import { useUsingContext } from './hooks/useUsingContext'
import { useUsingNetwork } from './hooks/useUsingNetwork'

import { SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useAuthStore, useChatStore, useGlobalStoreWithOut } from '@/store'
import { fetchChatAPIProcess } from '@/api'
import { t } from '@/locales'
import { router } from '@/router'

import {fetchChatTailAPI} from "@/api/config";
import {useUpload} from "@/views/chat/hooks/useUpload";
import {AxiosProgressEvent} from "axios";

const useGlobalStore = useGlobalStoreWithOut()
const authStore = useAuthStore()
const route = useRoute()
let controller = new AbortController()

const dialog = useDialog()
const ms = useMessage()
const appStore = useAppStore()
const bottomContainer = ref()
const chatStore = useChatStore()
const isStreamIn = ref(false)
const typingStatusEnd = ref(true) // 打字效果是否完成

// const globalConfig = computed(() => authStore.globalConfig)
// const isSetBeian = computed(() => globalConfig.value?.companyName && globalConfig.value?.filingNumber)

const { addGroupChat, updateGroupChat, updateGroupChatSome } = useChat()
const appId = computed(() => route.query.appId as string)
const tradeStatus = computed(() => route.query.trade_status as string)
const token = computed(() => route.query.token as string)

useCopyCode()

const { isMobile } = useBasicLayout()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()
const { usingContext, toggleUsingContext } = useUsingContext()
const { usingNetwork, toggleUsingNetwork } = useUsingNetwork()

const dataSources = computed(() => chatStore.chatList)
const activeModel = computed(() => chatStore.activeModelName)

const {selectFile, upload } = useUpload();

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

   if (mode === 1)  {
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

		if (progress &&  Number(progress.toFixed(2)) * 100 <= 99) {
			 useGlobalStore.updateUploadProgress( Number(progress.toFixed(2)) * 100);
		}

	})

  if (result.data) {
    useGlobalStore.updateUploadProgress(  100);
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

function handleScrollBtm() {
  bottomContainer.value.scrollIntoView({ behavior: 'smooth' })
}

function handleUpdateModel(val: number) {
  useGlobalStore.updateModel(val)
}

/* 发送消息 */
async function handleSubmit(index?: number) {

	if(chatStore.groupList.length === 0 || loading.value || !typingStatusEnd.value ) return;
	let message = ''

	/* 如果有index就是重新生成 */
	if(index && typeof index === 'number'){
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

  let options: any = { groupId: +activeGroupId.value, usingNetwork: usingNetwork.value }
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

				cacheResText[i] && currentText.length < cacheResText.length  && (currentText += cacheResText[i])

        if(cacheResText[i]){

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
				if(!isStreamIn.value && currentText.length >= cacheResText.length){

          i = 0
					currentText = ''
          timer && clearInterval(timer)
          timer = null;

				  // 修改loading状态
					typingStatusEnd.value = true

          updateGroupChatSome(dataSources.value.length - 1, { loading: false }) // 更新最后一条的loading状态

          useGlobalStore.updateIsChatIn(false)

					/* 如果拿到了余额信息  更新 */
					if (userBanance){
						authStore.updateUserBanance(userBanance)
					}

					/* 当为2说明第一次对话 则修改一个对话组的默认title，取回答记录前十个字 如果长度不到十个 拿全部 */
					if (dataSources.value.length === 2 && !activeGroupInfo?.value?.appId) {
						const title = dataSources.value[1].text.length > 15 ? dataSources.value[1].text.slice(0, 15) : dataSources.value[1].text
						await chatStore.updateGroupInfo({ groupId: +activeGroupId.value, title })
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
        onDownloadProgress: ({ event }) => {

          const xhr = event.target;
          const { responseText } = xhr

          /* 这种解析只对openai有效 其他的会漏掉前面的字 */
					if([1].includes(activeModelKeyType.value)){

						const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)

            let chunk = responseText
						if (lastIndex !== -1){
							chunk = responseText.substring(lastIndex)
						}

            try {
							data = JSON.parse(chunk)

						} catch (error) {
							// TODO 如果出现类似超时错误 会连接上次的内容一起发出来导致无法解析  后端需要处理 下
							console.log('parse data erro from openai: ', error, chunk);
							if(chunk.includes('OpenAI timed out waiting for response')){
								console.log('绘画超时了~')
								ms.warning('会话超时了、告知管理员吧~~~')
							}
						}
					}

					/* 处理和百度一样格式的模型消息解析 */
					if([2,3].includes(activeModelKeyType.value)){
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
          if([4].includes(activeModelKeyType.value)){

            const lastIndex = responseText.lastIndexOf('\n', responseText.length)
            let chunk = responseText;

            if (lastIndex !== -1){
              chunk = responseText.substring(lastIndex)
            }

            try {
              data = JSON.parse(chunk)
            } catch (error) {

              // TODO 如果出现类似超时错误 会连接上次的内容一起发出来导致无法解析  后端需要处理 下
              console.log('parse data error from xunfeizhipu: ', error, chunk);
              if(chunk.includes('xunfeizhipu timed out waiting for response')){
                console.log('绘画超时了~')
                ms.warning('会话超时了、告知管理员吧~~~')
              }
            }
          }

					// 显示消耗的token
					try {

            /* 如果出现输出内容不一致就需要处理了 */
						if([1].includes(activeModelKeyType.value)){

							cacheResText = data.text;
							isStreamIn.value = !data.is_end;

							if(data?.detail?.usage){
								typingStatusEnd.value = data.is_end;
								userBanance = data?.userBanance;
							}
						}

            // 百度
						if([2,3].includes(activeModelKeyType.value)){
							const { result, is_end } = data
							cacheResText = result
							isStreamIn.value = !is_end
							data?.userBanance && (userBanance = data?.userBanance)
						}

            // 讯飞星火模型
            if([4].includes(activeModelKeyType.value)){

              const { text, is_end } = data
              cacheResText = text
              isStreamIn.value = !is_end
              data?.userBanance && (userBanance = data?.userBanance)
            }

					}
					catch (error) {
            console.log(error);
          }
        }
      })
    }

    await fetchChatAPIOnce()
  }

  catch (error: any) {
    console.log('chat error catch', error);

    useGlobalStore.updateIsChatIn(false)
		clearInterval(timer)
		isStreamIn.value = false

    if (error.code === 402 || error?.message.includes('余额不足')|| error?.message.includes('免费额度已经使用完毕'))
      useGlobalStore.updateGoodsDialog(true)

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
  console.log('onRegenerate', loading.value);

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
          }
          catch (error) {
            console.log(error);
            //
          }
        },
      })
      updateGroupChatSome(dataSources.value.length - 1, { loading: false })
    }
    await fetchChatAPIOnce()
  }
  catch (error: any) {

    if (error?.message.includes('canceled')) {
      updateGroupChatSome(dataSources.value.length - 1, { loading: false })
      setTimeout(() => authStore.getUserBalance(), 200)
      return
    }

    if (error.code === 402 || error?.message.includes('余额不足'))
      useGlobalStore.updateGoodsDialog(true)

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

  }
  finally {
    loading.value = false
    isStreamIn.value = false
  }
}

/* 有appId的特殊处理 */
async function handleAppId(appId: string) {
  const id = +appId
  await router.replace({name: 'Chat', query: {}})
  const isHasGroup = chatStore.groupList.find((item: any) => item.appId === id)
  if (!isHasGroup) {
    await chatStore.addNewChatGroup(id)
    await chatStore.queryMyGroup()
  }
  else {
    await chatStore.setActiveGroup(isHasGroup.uuid)
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
    ms.success('感谢你的购买、祝您使用愉快~', { duration: 5000 })
    authStore.getUserInfo()
    router.replace({ name: 'Chat', query: {} })
  }
  else {
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
      }
      catch (error: any) {
        ms.error(t('chat.exportFailed'))
      }
      finally {
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
			chatStore.deleteChatById(chatId)
    },
  })
}

function handleClear() {

  if (loading.value)
    return

  dialog.warning({
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
  }
  else {
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

// const footerClass = computed(() => {
//   let classes = ['p-4', isSetBeian.value ? 'pb-0' : 'pb-4']
//   if (isMobile.value)
//     classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden']
//   return classes
// })

onMounted(async () => {

  if (appId.value) {
		await handleAppId(appId.value)
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
</script>

<template>
  <div class="h-full  flex flex-col bg-white dark:bg-[#111114]">

    <RecordDialog :visible="recordDialog" @submit="handleUploadFile" />

    <HeaderComponent
      :using-context="usingContext"
      :dark-mode="darkMode"
      @export="handleExport"
      @toggle-using-context="toggleUsingContext"
      @clear="handleClear"
      @scroll-btn="handleScrollBtm"
    />

    <main class="flex-1 overflow-hidden">
      <div id="scrollRef" ref="scrollRef" class="relative h-full overflow-hidden overflow-y-auto scroll-smooth">

        <div
          id="image-wrapper"
          class="w-full max-w-screen-2xl m-auto dark:bg-[#101014] h-full"
          :class="[isMobile ? 'p-2' : 'p-4']"
        >

          <template v-if="!dataSources.length">
            <div class="flex justify-center items-center text-center " :class="[isMobile ? 'h-full' : 'h-4/5 ']">
              <AiBotComponent @prompt="handlePrompt" />
            </div>
          </template>

          <template v-else>

						<!--新增小尾巴	-->
            <div>
              <Message
								:chatTail="chatTail"
                v-for="(item, index) of dataSources"
                :key="item.chatId"
                :date-time="item.dateTime"
                :text="item.text"
                :inversion="item.inversion"
                :error="item.error"
                :loading="item.loading"
                @regenerate="handleSubmit(index)"
                @delete="handleDelete(item)"
              />
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
          </template>
        </div>
      </div>
    </main>

		<div v-if="isMobile">
			<div class="flex items-center w-[160px] p-1 mb-1 text-[#3076fd] rounded cursor-pointer transition hover:bg-[#eef0f3] dark:border-neutral-700 dark:hover:bg-[#33373c]" @click="useGlobalStore.updateGoodsDialog(true)">
				<SvgIcon icon="material-symbols:shopping-bag-outline" class="mr-1 text-base" />
				进入市场选购商品
			</div>
		</div>

    <!-- <footer :class="footerClass">
      <div class="w-full max-w-screen-2xl m-auto flex flex-col">
        <div v-if="isMobile">
          <div class="flex items-center w-[160px] p-1 mb-1 text-[#3076fd] rounded cursor-pointer transition hover:bg-[#eef0f3] dark:border-neutral-700 dark:hover:bg-[#33373c]" @click="useGlobalStore.updateGoodsDialog(true)">
            <SvgIcon icon="material-symbols:shopping-bag-outline" class="mr-1 text-base" />
            进入市场选购商品
          </div>
        </div> -->
        <!-- <div class="flex items-start justify-between space-x-2"> -->
          <!-- <NTooltip trigger="hover" :disabled="isMobile">
            <template #trigger>
              <button class="flex h-8 w-8 items-center justify-center rounded border transition hover:bg-[#eef0f3] dark:border-neutral-700 dark:hover:bg-[#33373c]" @click="toggleUsingNetwork">
                <span class="" :class="{ 'text-[#3076fd]': usingNetwork, 'text-[#a8071a]': !usingNetwork }"><SvgIcon class="text-lg" style="width: 1em;height: 1em" icon="gis:network-o" /></span>
              </button>
            </template>
            {{ usingNetwork ? '关闭联网模式' : '开启联网模式' }}
          </NTooltip> -->

					<footer  class="footer-dialog">
						<div :class="['m-auto max-w-screen-2xl', isMobile ? 'px-2 py-1' : 'px-4 py-2']">
							<div class="flex items-stretch space-x-2">
								<div class="relative flex-1">

									<NInput
										ref="inputRef"
										v-model:value="prompt"
										type="textarea"
										class="pb-10"
										clearable
										:placeholder="placeholder"
										:autosize="{ minRows: isMobile ? 1 : 2, maxRows: isMobile ? 3 : 4 }"
										@keypress="handleEnter"
									>
									</NInput>

									<div class="absolute bottom-2 left-2 right-2">
										<div class="flex items-center justify-between">
											<div class="flex items-center justify-between">

												<NTooltip trigger="hover" :disabled="isMobile" v-if="activeModel !== 'gpt-4-all'">
													<template #trigger>
														<button class="flex h-8 w-8 items-center justify-center rounded border transition hover:bg-[#eef0f3] dark:border-neutral-700 dark:hover:bg-[#33373c]" @click="toggleUsingContext">
															<span class="" :class="{ 'text-[#3076fd]': usingContext, 'text-[#a8071a]': !usingContext }">
                                <SvgIcon class="text-lg" style="width: 1em;height: 1em" icon="ri:chat-history-line" /></span>
														</button>
													</template>
													上下文状态
												</NTooltip>

												<NTooltip trigger="hover" :disabled="isMobile" v-if="['gpt-4-v', 'gpt-4-all', 'gpt-4-dalle'].includes(activeModel)">
													<template #trigger>
														<button class="flex h-8 w-8 items-center ml-1 justify-center rounded border transition hover:bg-[#eef0f3] dark:border-neutral-700 dark:hover:bg-[#33373c]" @click="handleUploadFile(1)">
															<span class="" :class="{ 'text-[#3076fd]': usingContext, 'text-[#a8071a]': !usingContext }">
																	<SvgIcon class="text-lg" style="width: 1em;height: 1em" icon="octicon:link-16" />
															</span>
														</button>
													</template>
													 上传文件
												</NTooltip>

												<NTooltip trigger="hover" :disabled="isMobile" v-if="activeModel.includes('tts-1')">
													<template #trigger>
														<button class="flex h-8 w-8 items-center ml-1 justify-center rounded border transition hover:bg-[#eef0f3] dark:border-neutral-700 dark:hover:bg-[#33373c]" @click="handleOpenRecord">
															<span class="" :class="{ 'text-[#3076fd]': usingContext, 'text-[#a8071a]': !usingContext }">
																	<SvgIcon class="text-lg" style="width: 1em;height: 1em" icon="streamline:voice-mail" />
															</span>
														</button>
													</template>
													 语音助手
												</NTooltip>

											</div>

											<div class="flex justify-between items-center">

												<div class="flex items-center text-neutral-400 cursor-pointer hover:text-[#3076fd] "  >

													<span class="ml-2 mr-2 text-xs" v-if="activeModel !== 'gpt-4-all'" @click="toggleUsingNetwork">{{usingNetwork? '关闭' : '开启'}}联网访问</span>

													<NTooltip trigger="hover" :disabled="isMobile" v-if="activeModel !== 'gpt-4-all'">
														<template #trigger>
															<SvgIcon icon="zondicons:network" @click="toggleUsingNetwork" :class="['cursor-pointer mb-0.5',{'text-[#3076fd]': usingNetwork, '': !usingNetwork } ]" />
														</template>
														{{ usingNetwork ? '关闭联网模式' : '开启联网模式' }}
													</NTooltip>

													<!-- <n-switch size="small" /> -->
													<div class="mx-4 h-full text-neutral-300 dark:text-neutral-600" v-if="activeModel !== 'gpt-4-all'">|</div>
												</div>

												<NButton type="primary" size="small" style="padding: 0px; width: 28px; height: 28px; border: 0px;" :disabled="buttonDisabled" round @click="handleSubmit">
													<template #icon>
														<span class="dark:text-black">
															<SvgIcon icon="icon-park-outline:send" />
														</span>
													</template>
												</NButton>

											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</footer>

		      <CopyRight  v-if="!isMobile" class="footer-copyright-bar"></CopyRight>

      <!-- </div>
    </footer> -->

	</div>
</template>

<style lang="less">
.footer-dialog {
 	//margin-bottom: 40px;
}
</style>
