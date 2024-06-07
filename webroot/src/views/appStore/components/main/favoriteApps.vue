<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue'
import {NButton, useMessage, NInput, NScrollbar, NSpace, NSkeleton} from 'naive-ui'
import type {App} from '@/views/appStore/components/helpter'
import {useRouter} from 'vue-router'
import {fetchCollectAppAPI, fetchQueryAppsAPI} from '@/api/appStore'
import {useAppCatStore, useAuthStore} from '@/store'
import {SvgIcon} from '@/components/common'
import type {ResData} from '@/api/types'
import {fetchQueryModelsListAPI} from '@/api/models'
import {fetchQueryAppCatsAPI} from '@/api/appStore'
import {useBasicLayout} from '@/hooks/useBasicLayout'
import {fetchQueryMenuAPI} from '@/api/config'

const {isMobile} = useBasicLayout()
const authStore = useAuthStore()

const appMenuHeaderTips = computed(() => authStore.globalConfig.appMenuHeaderTips)
const appMenuHeaderBgUrl = computed(() => authStore.globalConfig.appMenuHeaderBgUrl)

const router = useRouter()
const emit = defineEmits<Emit>()
const ms = useMessage()
const appCatStore = useAppCatStore()
const keyword = ref('')
const menuList = ref([])

interface Emit {
	(ev: 'run-app', app: App): void
}

interface AppCat {
	id: number
	name: string
	coverImg: string
	des: string
}

const catId = computed(() => appCatStore.catId)
const appList = ref<App[]>([])
const activeList = ref<App[]>([])
const mineApps = computed(() => appCatStore.mineApps)
const catList = ref<AppCat[]>([])
const activeCatId = ref(0)

function isMineApp(app: App) {
	return mineApps.value.some((item: any) => item.appId === app.appId)
}

const backgrounds = ["#19B6D8", '#00D9AE', '#7B61C6', '#19B6D8', '#3AB66F', '#7B61C6', '#575CBE', '#CA53B8', '#CA53B8', '#00D9AE', '#C89D3F', '#CA53B8', '#3AB66F', '#C89D3F', '#575CBE', '#575CBE', '#19B6D8']

async function queryApps() {

	await appCatStore.queryMineApps();

	appList.value = mineApps.value.map((item: App, index: number) => {
		item.loading = false
		item.background = backgrounds[index % 15];
		return item
	})
	activeList.value = appList.value
}

const list = computed(() => {

	if (keyword.value) {
		return appList.value.filter(item => item.name.includes(keyword.value))
	}

	if (activeCatId.value === 0) return appList.value
	return appList.value.filter(item => item.catId === activeCatId.value)
})

/* 加入取消收藏 */
async function handleCollect(app: App) {
	app.loading = true
	try {
		const res: ResData = await fetchCollectAppAPI({appId: app.id})
		ms.success(res.data)
		await appCatStore.queryMineApps()
		app.loading = false
	} catch (error) {
		app.loading = false
	}
}

async function handleRunApp(app: App) {
	const res: any = await fetchQueryModelsListAPI()
	const {modelMaps} = res.data
	if (!modelMaps[1]) {
		return ms.warning('管理员未配置特定应用模型、请联系管理员配置~')
	}

	// await router.push({ path: '/chat/chat-app', query: { appId: app.id, } })
	emit('run-app', app)
}

async function queryCats() {
	const res: ResData = await fetchQueryAppCatsAPI()
	const defaultCat = {
		id: 0,
		name: '全部分类',
	}
	catList.value = [defaultCat, ...res?.data?.rows]
}

async function queryMenu() {
	const res: any = await fetchQueryMenuAPI({menuPlatform: 1})
	if (!res.success) return
	menuList.value = res.data
}

function isShowBtn(path: string) {
	return menuList.value.filter((item: any) => item.menuPath === path).length
}

function handleChangeCatId(id: number) {
	activeCatId.value = id
}

watch(catId, (val) => {
	if (!val)
		activeList.value = appList.value

	else
		activeList.value = appList.value.filter((item: App) => item.catId === val)
})

onMounted(() => {
	// queryCats()
	queryApps()
	// queryMenu()
})
</script>

<template>
	<div class="relative h-full flex flex-col w-full">
		<div class="flex flex-col !bg-no-repeat !bg-cover" :style="{
			background: `url('${appMenuHeaderBgUrl}')`
		}" :class="[isMobile ? 'px-4' : 'px-16', appMenuHeaderBgUrl ? 'pb-[30px]' : '']">

			<div class="flex justify-between items-center w-full">
				<div>
					<p class="text-lg">我的应用</p>
				</div>
				<div class="mt-3 flex items-center ">
					<n-input class="mr-2" v-model:value="keyword" round placeholder="搜索应用名称、快速查找应用...">
						<template #suffix>
							<SvgIcon icon="iconamoon:search-thin" class="text-base"/>
						</template>
					</n-input>

					<NButton  @click="appCatStore.updateAppDialog(true)" round>
					     <span class="flex justify-center items-center">
						      <SvgIcon class="text-lg mr-1" style="width: 0.8em;height: 0.8em" icon="gala:add"/>
					        <span>创建应用</span>
							 </span>
					</NButton>
				</div>

			</div>

			<div class="w-full dark:bg-transparent" v-if="catList.length > 0" :class="isMobile ? 'py-3' : 'py-6'">
				<NScrollbar x-scrollable>
					<div class="flex items-center space-x-3 whitespace-nowrap">
						<n-button size="small" round :type="activeCatId === item.id ? 'primary': 'default'"
											v-for="(item,index) in catList" :key="index"
											@click="handleChangeCatId(item.id)">
							{{ item.name }}
						</n-button>
					</div>
				</NScrollbar>
			</div>
		</div>

		<div v-if="!list.length">
			<div
				class="mt-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-6">

				<n-space vertical v-for="item in 12" class="border border-gray-200 dark:border-gray-600
        rounded-md hover:bg-neutral-100 dark:bg-[#3A3A5E] dark:hover:bg-[#24272e] px-4 py-2 pb-4">
					<div class="flex justify-start items-center">
						<n-skeleton round height="50px" width="20%" class="mt-1" :sharp="false"/>
						<n-skeleton height="20px" width="20%" class="mt-1 ml-4" :sharp="false"/>
					</div>

					<n-skeleton height="40px" width="100%" class="mt-1" :sharp="false"/>

					<div class="flex justify-between">
						<n-skeleton height="20px" width="30%" class="mt-1" :sharp="false"/>
						<n-skeleton height="20px" width="10%" class="mt-1" :sharp="false"/>
					</div>
				</n-space>
			</div>
		</div>

		<div v-if="list.length"
				 class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 py-4"
				 :class="isMobile ? 'px-4' : 'px-16 overflow-y-scroll'">

			<div v-for="item in list" :key="item.id" class="
       rounded-3xl
       custom-card cursor-pointer
       border border-transparent dark:border-neutral-800 p-4 pt-2
       flex flex-col
       justify-center items-center hover:bg-neutral-100
        dark:hover:bg-[#24272e] select-none max-h-[170px]"
					 :style="{background: item.background}"
			>

				<div class="w-full h-12 flex items-center">
					<!--          <span class="w-14 h-14 flex justify-center items-center rounded-md shadow-md mr-5 border border-[#00000014]">-->
					<!--            <img :src="item.coverImg" class="w-12 h-12 mb-1" alt="">-->
					<!--          </span>-->
					<span class="text-base font-bold mb-1 text-[#fff] dark:text-[#fff] line-clamp-1">{{ item.appName }}</span>
				</div>

				<p class="w-full mb-1 text-[#fcfcfc] text-xs py-2 text-left line-clamp-2">
					{{ item.appDes }}
				</p>

				<div class="w-full flex justify-between ">

					<NButton size="tiny" :bordered="false" class="text-white dark:text-white" ghost :disabled="item.loading"
									 @click.stop="handleCollect(item)">
						<template #icon>
							<SvgIcon :icon="isMineApp(item) ? 'clarity:favorite-solid' : 'clarity:favorite-line'"
											 class="text-base text-white dark:text-white"/>
						</template>
					</NButton>

					<div class="cursor-pointer rounded-full text-white dark:text-white flex justify-between items-center
					 px-2 py-1 bg-[rgba(0,0,0,.1)] dark:-bg-[#5a91fc]" @click.stop="handleRunApp(item)">
						<SvgIcon icon="icon-park-outline:send" class="text-base "/>
						<p class="text-[12px]">尝试指令</p>
					</div>

				</div>
			</div>

		</div>

	</div>
</template>

<style lang="less">
.custom-card {
	transition: all .3s;

	.run-icon {
		opacity: 0;
		transition: all .3s;
	}

	&:hover {
		border: 1px solid #5A91FC;
		box-shadow: 0 6px 32px #04343014;
		transform: translateY(-10px);

		.run-icon {
			opacity: 1;
		}
	}
}
</style>
