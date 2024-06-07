<script lang="ts" setup>
import {computed, onMounted, ref,  } from 'vue'
import {NButton, useMessage, NInput,  NScrollbar, NTabPane, NTabs} from 'naive-ui'
import type {App} from '../helpter'

import {fetchCollectAppAPI, fetchQueryAppsAPI} from '@/api/appStore'
import {useAppCatStore, useAppStore} from '@/store'
import {SvgIcon} from '@/components/common'
import type {ResData} from '@/api/types'
import {fetchQueryAppCatsAPI} from '@/api/appStore'
import {useBasicLayout} from '@/hooks/useBasicLayout'
import {fetchQueryMenuAPI} from '@/api/config'
const {isMobile} = useBasicLayout()

const ms = useMessage()
const appCatStore = useAppCatStore()
const keyword = ref('')
const menuList = ref([])
const appStore = useAppStore()
interface Emit {
	(ev: 'run-app', app: App): void
}

interface AppCat {
	id: number
	name: string
	coverImg: string
	des: string
}

const collapsed = computed(() => appStore.siderCollapsed)
const appList = ref<App[]>([])
const mineApps = computed(() => appCatStore.mineApps)
const catList = ref<AppCat[]>([])
const activeCatId = ref(0)
const activeTab = ref("hot");

function isMineApp(app: App) {
	return mineApps.value.some((item: any) => item.appId === app.id);
}

const backgrounds = ["#19B6D8", '#00D9AE', '#7B61C6', '#19B6D8', '#3AB66F', '#7B61C6', '#575CBE', '#CA53B8', '#CA53B8', '#00D9AE', '#C89D3F', '#CA53B8', '#3AB66F', '#C89D3F', '#575CBE', '#575CBE', '#19B6D8']

const handleChangeTab = (ev: string) => {
  appList.value = [];
  if (ev === 'my') {
    queryMyMineApps();
  } else {
    queryApps();
  }
}


//  查询收藏
async function queryMyMineApps() {
  const list = await appCatStore.queryMineApps();
  appList.value = list.map((item: { appDes: string; catId: number; appName: string; }, index: number) => {
    return {
      ...item,
      des: item.appDes,
      background: backgrounds[index % 15],
      loading: false,
      id: item.catId,
      name: item.appName,
    }
  })

}

//  查询
async function queryApps() {
	const res: ResData = await fetchQueryAppsAPI()
  appList.value = res?.data?.rows.map((item: App, index: number) => {
		item.loading = false
		item.background = backgrounds[index % 15];
		return item
	})

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
  await appCatStore.updateAppRun(app);
  await appCatStore.updateAppCenterDialog(false);
    appStore.setSiderCollapsed(!collapsed.value)
}

async function queryCats() {
	const res: ResData = await fetchQueryAppCatsAPI()
	const defaultCat = {
		id: 0,
		name: '全部',
	}
	catList.value = [defaultCat, ...res?.data?.rows];
}

async function queryMenu() {
	const res: any = await fetchQueryMenuAPI({menuPlatform: 1})
	if (!res.success) return
	menuList.value = res.data
}


function handleChangeCatId(id: number) {
	activeCatId.value = id
}

onMounted(() => {
	queryCats()
	queryApps()
	queryMenu()
})
</script>

<template>
	<div class="relative h-full flex flex-col w-full ">
		<div class="flex flex-col !bg-no-repeat !bg-cover"  :class="[isMobile ? 'px-2' : 'px-4',]">

			<div class="flex  items-center w-full"  :class="[isMobile ? 'flex-col-reverse' : 'justify-between']">
        <div :class="[isMobile ? 'mt-2' : '']">
          <n-tabs
              v-model:value="activeTab"
              class="card-tabs flex justify-center items-center"
              default-value="signin"
              size="medium"
              animated
              @update-value="handleChangeTab"
              pane-wrapper-style="margin: 0 -4px"
              pane-style="padding: 0 4px 0 4px; box-sizing: border-box;"
          >
            <n-tab-pane name="hot" tab="热门应用"></n-tab-pane>
            <n-tab-pane name="my" tab="我的应用"></n-tab-pane>
          </n-tabs>
        </div>

				<div class="mt-3 flex items-center" :class="[isMobile ? 'w-full' : '']">
					<n-input class="mr-2 border border-gray-600" bordered v-model:value="keyword" :round="!isMobile" placeholder="搜索应用名称、快速查找应用...">
						<template #suffix>
							<SvgIcon icon="iconamoon:search-thin" class="text-base"/>
						</template>
					</n-input>

					<NButton  @click="appCatStore.updateAppDialog(true)" :round="!isMobile">
					     <span class="flex justify-center items-center">
						      <SvgIcon class="text-lg mr-1" style="width: 0.8em;height: 0.8em" icon="gala:add"/>
					        <span>创建应用</span>
							 </span>
					</NButton>
				</div>
			</div>

			<div class="w-full dark:bg-transparent" :class="isMobile ? 'py-3' : 'py-6'">
				<NScrollbar x-scrollable>

					<div class="flex items-center space-x-3 whitespace-nowrap" v-if="!isMobile">
						<n-button size="small" round :type="activeCatId === item.id ? 'primary': 'default'"
											v-for="(item,index) in catList" :key="index"
											@click="handleChangeCatId(item.id)">
							{{ item.name }}
						</n-button>
					</div>

          <div v-else>
            <n-tabs
                v-model:value="activeCatId"
                class="card-tabs flex flex-start items-center"
                default-value="signin"
                size="medium"
                animated
                @update-value="handleChangeCatId"
                pane-wrapper-style="margin: 0 -4px"
                pane-style="padding: 0 4px 0 4px; box-sizing: border-box;"
            >
              <n-tab-pane :name="item.id" :tab="item.name" v-for="item in catList"></n-tab-pane>
            </n-tabs>
          </div>

				</NScrollbar>
			</div>
		</div>

    <div class="h-[450px] overflow-hidden" :class="[isMobile ? 'h-[250px]' : 'h-[450px]']">
      <NScrollbar y-scrollable>
        <div class=" grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 py-4"
             :class="isMobile ? 'px-2  gap-2 ' : 'px-4  gap-6 '">

          <div v-for="item in list" :key="item.id"
               class="

									 custom-card cursor-pointer
									 dark:border-transparent p-4 pt-2
									 flex flex-col
									 border border-transparent
									 justify-center items-center
									 hover:bg-neutral-100
									 dark:hover:bg-[#24272e]
									 select-none max-h-[170px]
									 dark:hover:shadow-md
									 hover:shadow-md"
               :class="[isMobile ? 'rounded-xl' : ' rounded-3xl']"
               :style="{background: item.background}"
          >

            <div class="w-full h-12 flex items-center">

              <span class="text-base font-bold mb-1 text-[#fff] dark:text-[#fff] line-clamp-1">{{ item.name }}</span>
            </div>

            <p class="w-full mb-2 text-[#fcfcfc] text-xs  text-left line-clamp-2">
              {{ item.des }}
            </p>

            <div class="w-full flex justify-between ">

              <NButton size="tiny" :bordered="false" class="text-white dark:text-white" ghost :disabled="item.loading"
                       @click.stop="handleCollect(item)">
                <template #icon>
                  <SvgIcon :icon="isMineApp(item) ? 'clarity:favorite-solid' : 'clarity:favorite-line'"
                           class="text-2xl dark:text-white" :class="[isMineApp(item) ? 'text-[#f4ea2a]' : 'text-white']"/>
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
      </NScrollbar>
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
