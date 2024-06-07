<script setup lang="ts">
import {reactive, onMounted, ref} from 'vue'
import { SvgIcon } from '@/components/common'
import {NButton, NGi, NSkeleton, NSpace, useMessage} from 'naive-ui'
import {useAuthStore, useChatStore} from '@/store'
import AiLogo from "@/views/midjourney/components/ai-logo.vue"
import SuggestApps from "@/views/chat/components/SuggestApps/index.vue"
import {ResData} from "@/api/types";
import {fetchQueryAppsAPI} from "@/api/appStore";
import {App} from "@/views/appStore/components/helpter";
const chatStore = useChatStore()
const authStore = useAuthStore()
const ms = useMessage();
const loading = ref(false)

async function handleAddNewGroup(){

  // 去掉了游客模式
  if(!authStore.token) {
    ms.info("请先登录")
    loading.value = false
    authStore.setLoginDialog(true);
    return;
  }

  loading.value = true
	try {
		await chatStore.addNewChatGroup()
		await chatStore.queryMyGroup()
		loading.value = false
	} catch (error) {
		loading.value = false
	}
}


// 获取时间
const getCurrentTime = () => {
	const day = new Date();
	const hour = day.getHours();
	return hour > 4 && hour < 11  ? '上午好' : hour >= 11 && hour < 13 ? '中午好' : hour >= 13 && hour < 18 ? "下午好" : hour >= 18 && hour <= 23 ? '晚上好' : '午夜好'
}

const pager = reactive({
	 page: 1,
	 size: 8
})

async function queryApps() {
	const res: ResData = await fetchQueryAppsAPI(pager)
	appList.value = res?.data?.rows.map((item: App) => {
		item.loading = false
		return item
	})
}


interface Emit {
  (ev: 'run', app: App): void
}
const emit = defineEmits<Emit>()
const appList = ref([]);

const handleRun = (data) => {
  emit('run', data)
}

// 刷新
const handleRefresh = () => {
	if (appList.value.length > 0 && appList.value.length === pager.size) {
		pager.page +=1;
		queryApps();
		return
	}
	ms.info("无更多应用可以推荐，您还可以自己创建应用！")

}

onMounted(() => {
	queryApps()
})


</script>

<template>
	<div class="w-full h-full flex  items-center ">

		<div class="w-full">
			<ai-logo class="my-4"></ai-logo>

			<div class="suggest-container bg-[#F7F7F7] dark:bg-[#313155] w-full max-w-screen-2xl p-6 rounded-3xl" >

				<div class="text-2xl flex items-start">
					<h1 >Hi, {{getCurrentTime()}}, </h1>
				</div>

				<div class="flex justify-between items-center">
					<p>我是你的专属AI伙伴，你可以试用快捷应用</p>

					<div class="flex justify-between w-[230px]">

						<n-button round :bordered="false" icon-placement="left" class="block dark:bg-[#282848] bg-[#F3F3F3] hover:bg-[#3144F1] hover:dark:bg-[#fff]" @click="handleRefresh">
							<template #icon>
								<SvgIcon class="text-lg" icon="mynaui:refresh"/>
							</template>
							换一换
						</n-button>

						<n-button :bordered="false" class="dark:bg-[#3969AB] bg-[#282848] hover:bg-[#3144F1] hover:dark:bg-[#fff]" round icon-placement="right" @click="handleRefresh">
							<template #icon>
								<SvgIcon class="text-lg" icon="formkit:right"/>
							</template>
							更多应用
						</n-button>
					</div>
				</div>

				<div class="w-full">

					<div 	v-if="!appList.length">
						<div class="mt-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-6">

							<n-space vertical v-for="item in 8" class="border border-gray-200 dark:border-gray-600 rounded-md hover:bg-neutral-100 dark:bg-[#3A3A5E] dark:hover:bg-[#24272e] px-4 py-2">
								<div class="flex justify-start items-center">
									<n-skeleton round height="50px" width="20%"   class="mt-1" :sharp="false" />
									<n-skeleton height="20px" width="20%"   class="mt-1 ml-4" :sharp="false" />
								</div>

								<n-skeleton height="40px" width="100%"  class="mt-1" :sharp="false" />

								<div class="flex justify-between">
									<n-skeleton height="20px" width="30%"   class="mt-1" :sharp="false" />
									<n-skeleton height="20px" width="10%"   class="mt-1" :sharp="false" />
								</div>
							</n-space>
						</div>
					</div>

					<SuggestApps @run-app="handleRun" :list="appList"  v-else></SuggestApps>
				</div>

			</div>
		</div>

<!--			<SvgIcon icon="tabler:message" class="mb-4 inline-block text-6xl text-[#2080f0]" />-->
<!--			<h1 class="mb-4 text-2xl font-bold mt-1">对话聊天</h1>-->
<!--			<p class="mb-6 text-base text-slate-500">点击下方按钮，开始一个新的对话吧</p>-->
<!--		 <NButton type="primary" :loading="loading" @click="handleAddNewGroup">新对话</NButton>-->

	</div>
</template>
