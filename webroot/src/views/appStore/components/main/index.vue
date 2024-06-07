<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { NButton, useMessage, NInput, NScrollbar } from 'naive-ui'
import type { App } from '../helpter'
import { useRouter } from 'vue-router'
import { fetchCollectAppAPI, fetchQueryAppsAPI } from '@/api/appStore'
import { useAppCatStore, useAuthStore } from '@/store'
import { SvgIcon } from '@/components/common'
import type { ResData } from '@/api/types'
import { fetchQueryModelsListAPI } from '@/api/models'
import { fetchQueryAppCatsAPI } from '@/api/appStore'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { fetchQueryMenuAPI } from '@/api/config'

const { isMobile } = useBasicLayout()
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
  return mineApps.value.some((item: any) => item.appId === app.id)
}

async function queryApps() {
  const res: ResData = await fetchQueryAppsAPI()
  appList.value = res?.data?.rows.map((item: App) => {
    item.loading = false
    return item
  })
  activeList.value = appList.value
}

const list = computed(() => {
	if(keyword.value){
		return appList.value.filter( item => item.name.includes(keyword.value))
	}
	if(activeCatId.value === 0) return appList.value
	return appList.value.filter( item => item.catId === activeCatId.value)
})

/* 加入取消收藏 */
async function handleCollect(app: App) {
  app.loading = true
  try {
    const res: ResData = await fetchCollectAppAPI({ appId: app.id })
    ms.success(res.data)
    await appCatStore.queryMineApps()
    app.loading = false
  }
  catch (error) {
    app.loading = false
  }
}

async function handleRunApp(app: App) {
	const res: any = await fetchQueryModelsListAPI()
	const { modelMaps } = res.data
	if(!modelMaps[1]){
		return ms.warning('管理员未配置特定应用模型、请联系管理员配置~')
	}
	router.push({ path: '/chat', query: { appId: app.id } })
  // emit('run-app', app)
}

// const appMenuHeaderBgUrl = 'https://nineai-v1.oss-cn-shanghai.aliyuncs.com/ai/8c011e212.png'

async function queryCats() {
  const res: ResData = await fetchQueryAppCatsAPI()
  const defaultCat = {
    id: 0,
    name: '全部分类',
  }
  catList.value = [defaultCat, ...res?.data?.rows]
}

async function queryMenu (){
	const res: any = await fetchQueryMenuAPI({ menuPlatform: 1})
	if(!res.success) return
	menuList.value = res.data
}

function isShowBtn(path: string){
	return menuList.value.filter( (item: any) => item.menuPath === path).length
}

function handleChangeCatId(id: number){
	activeCatId.value = id
}

watch(catId, (val) => {
  if (!val)
    activeList.value = appList.value

  else
    activeList.value = appList.value.filter((item: App) => item.catId === val)
})

function handlJumpPath(path: string){
	router.push(path)
}

onMounted(() => {
	queryCats()
  queryApps()
	queryMenu()
})
</script>

<template>
  <div class="relative h-full flex flex-col " >
		<div class="flex flex-col !bg-no-repeat !bg-cover" :style="{
			background: `url('${appMenuHeaderBgUrl}')`
		}" :class="[isMobile ? 'px-4' : 'px-16', appMenuHeaderBgUrl ? 'pb-[30px]' : '']">
			<div class="mb-2 mt-8 text-center text-3xl font-extrabold text-[#5A91FC] dark:text-[var(--primary-color-dark)] lg:text-4xl">AI Tools</div>
			<div class="flex justify-center text-base text-small mb-4 mt-4 text-center text-gray-700 dark:text-gray-300 lg:text-lg"> {{ appMenuHeaderTips ||'探索无限可能，与AI一同开创智慧未来！'}}</div>
			<div class="w-full flex justify-center my-3 " :class="isMobile ? 'space-x-1' : 'space-x-5'">
				<n-button trong secondary type="primary" round v-if="isShowBtn('/chat')" @click="handlJumpPath('/chat')">
					<SvgIcon icon="carbon:chat" class="text-2xl mr-2" />
					AI 对话
				</n-button>
				<n-button trong secondary type="primary" round v-if="isShowBtn('/midjourney')"  @click="handlJumpPath('/midjourney')">
					<SvgIcon icon="ph:pencil-slash-duotone" class=" text-2xl mr-2 " />
					AI 绘画
				</n-button>
				<n-button trong secondary type="primary" round v-if="isShowBtn('/mind')" @click="handlJumpPath('/mind')" >
					<SvgIcon icon="ri:mind-map" class=" text-2xl mr-2 " />
					思维导图
				</n-button>
			</div>
			<div class="mt-3">
				<n-input v-model:value="keyword" round placeholder="搜索应用名称、快速查找应用...">
					<template #suffix>
						<SvgIcon icon="iconamoon:search-thin" class="text-base" />
					</template>
				</n-input>
			</div>
			<div class="w-full dark:bg-transparent"  :class="isMobile ? 'py-3' : 'py-6'">
				<NScrollbar  x-scrollable>
					<div class="flex items-center space-x-3 whitespace-nowrap">
						<n-button size="small" round :type="activeCatId === item.id ? 'primary': 'default'" v-for="(item,index) in catList" :key="index" @click="handleChangeCatId(item.id)">
							{{ item.name }}
						</n-button>
					</div>
				</NScrollbar>
			</div>
		</div>

    <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 py-4"  :class="isMobile ? 'px-4' : 'px-16 overflow-y-scroll'">
      <div v-for="item in list" :key="item.id" class="dark:bg-transparent custom-card cursor-pointer  border-[#e0e0e0] dark:border-neutral-800 p-4 pt-2 border rounded-md flex flex-col justify-center items-center hover:bg-neutral-100 dark:hover:bg-[#24272e] select-none max-h-[170px]" @click="handleRunApp(item)">
        <div class="w-full h-16 flex items-center">
          <span class="w-14 h-14 flex justify-center items-center rounded-md shadow-md mr-5 border border-[#00000014]">
            <img :src="item.coverImg" class="w-12 h-12 mb-1" alt="">
          </span>
          <span class="text-base font-bold mb-1 text-[#333] dark:text-[#ffffff85]">{{ item.name }}</span>
        </div>

        <p class="w-full mb-1 text-[#999999] text-xs py-2">
          {{ item.des }}
        </p>
        <div class="w-full flex justify-between ">
          <NButton size="tiny" ghost :disabled="item.loading" @click.stop="handleCollect(item)">
            <template #icon>
              <SvgIcon :icon=" isMineApp(item) ? 'iconamoon:sign-minus-bold' : 'mi:add'" class="text-base" />
            </template>
            {{ isMineApp(item) ? '取消收藏' : '加入个人工作台' }}
          </NButton>
          <SvgIcon icon="codicon:run-all" class="run-icon text-xl text-[#5A91FC]" />
        </div>
      </div>

    </div>

  </div>
</template>

<style lang="less">
.custom-card{
	transition: all .3s;
	.run-icon{
		opacity: 0;
		transition: all .3s;
	}
	&:hover{
    border: 1px solid #5A91FC;
    box-shadow: 0 6px 32px #04343014;
		transform: translateY(-10px);
		.run-icon{
			opacity: 1;
		}
	}
}
</style>
