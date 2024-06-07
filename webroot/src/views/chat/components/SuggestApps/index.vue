<script setup lang="ts">

import { NButton, useMessage } from "naive-ui";
import { SvgIcon } from "@/components/common";
import { useBasicLayout } from "@/hooks/useBasicLayout";
import { App } from "@/views/appStore/components/helpter";
import { computed, onMounted, ref } from "vue";
import { useAppCatStore, useAuthStore, useGptsStore } from "@/store";
import { ResData } from "@/api/types";
import { fetchCollectAppAPI, fetchQueryGptsByPageAPI } from "@/api/appStore";
import { fetchQueryModelsListAPI } from "@/api/models";
import { fetchCreateGptChatGroupAPI } from "@/api/appStore"
import { useRouter } from "vue-router";
import EventBus from "@/hooks/eventBus";
const appCatStore = useAppCatStore();
const { isMobile } = useBasicLayout()
const ms = useMessage()

const router = useRouter();
const authStore = useAuthStore();
const gptStore = useGptsStore()
const isLogin = computed(() => authStore.isLogin);

// interface Emit {
// 	(ev: 'run-app', app: App): void
// }

// const emit = defineEmits<Emit>()
// defineProps({
// 	list: {
// 		type: Array,
// 		required: true,
// 		default: () => ([])
// 	}
// })
const appList = ref([])

onMounted(() => {
	getApp();
})

async function getApp() {
	const res = await fetchQueryGptsByPageAPI({
		page: 1,
		size: 12,
		modelName: "",
		modelId: "",
		groupId: ""
	});

	appList.value = res.data.rows
	console.log(res)
}


/* 加入取消收藏 */
async function handleCollect(app: App) {
	app.loading = true
	try {
		const res: ResData = await fetchCollectAppAPI({ appId: app.id })
		ms.success(res.data)
		await appCatStore.queryMineApps()
		app.loading = false
	} catch (error) {
		app.loading = false
	}
}

async function handleRunApp(app: App) {
	// const res: any = await fetchQueryModelsListAPI()
	// const {modelMaps} = res.data
	// if (!modelMaps[1]) {
	// 	return ms.warning('管理员未配置特定应用模型、请联系管理员配置~')
	// }

	// if (!authStore.isLogin) {
	// 	return;
	// }

	// emit('run-app', app)
	// EventBus.emit("routerData",app)

	if (!isLogin.value) {
		authStore.setLoginDialog(true)
		return
	}


	// await gptStore.addNewChat(app.id);
	await fetchCreateGptChatGroupAPI({ appId: app.id }).then(res => {
		if (res.code != 400) {
			gptStore.updateGptsStore(false)
			EventBus.emit("setActiveGroup",{id:app.id})
			router.push("/gpts")
		}
	}).catch(err => {
		EventBus.emit("setActiveGroup",{id:app.id})
		authStore.selectSiderIndex = 1
		router.push("/gpts")
	})

}

const mineApps = computed(() => appCatStore.mineApps)
const isMineApp = (app: App) => {
	return mineApps.value.some((item: any) => item.appId === app.id)
}

</script>

<template>
	<!--		<div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 pt-2 pb-2"-->
	<!--				 :class="isMobile ? 'px-4' : 'overflow-y-auto'">-->

	<!--			<div v-for="item in list" :key="item.id"-->
	<!--					 class="dark:bg-[#3A3A5E] bg-[#FFFFFF] custom-card cursor-pointer p-2 pt-2-->
	<!--					  rounded-md flex flex-col justify-center items-center-->
	<!--					  border border-transparent dark:border-gray-600-->
	<!--					  hover:shadow-md-->
	<!--					  hover:dark:shadow-lg-->
	<!--					  dark:hover:bg-[#3A3A7E] select-none max-h-[170px]"-->
	<!--					 >-->
	<!--				<div class="w-full h-16 flex items-center">-->
	<!--	          <span class="w-14 h-14 flex justify-center items-center rounded-md shadow-md mr-3 border border-[#00000014]">-->
	<!--	            <img :src="item.coverImg" class="w-12 h-12 mb-1" alt="">-->
	<!--	          </span>-->
	<!--					<span class="text-base font-bold text-left  mb-1 text-[#333] dark:text-[#ffffff85] text-ellipsis overflow-hidden line-clamp-1">{{ item.name }}</span>-->
	<!--				</div>-->

	<!--				<p class="w-full mb-1 text-left text-[#999999] text-xs py-2 line-clamp-2">-->
	<!--					{{ item.des }}-->
	<!--				</p>-->

	<!--				<div class="w-full flex justify-between ">-->

	<!--	        <div class="w-full flex justify-between ">-->

	<!--	          <NButton size="tiny" :bordered="false"  ghost :disabled="item.loading" @click.stop="handleCollect(item)">-->
	<!--	            <template #icon>-->
	<!--	              <SvgIcon :icon="isMineApp(item) ? 'clarity:favorite-solid' : 'clarity:favorite-line'" class="text-base" />-->
	<!--	            </template>-->
	<!--	          </NButton>-->

	<!--	          <NButton size="tiny" secondary  round   :disabled="item.loading"  @click.stop="handleRunApp(item)">-->
	<!--	            <template #icon>-->
	<!--	              <SvgIcon icon="icon-park-outline:send" class="text-base" />-->
	<!--	            </template>-->
	<!--	            尝试指令-->
	<!--	          </NButton>-->

	<!--	        </div>-->
	<!--				</div>-->
	<!--			</div>-->

	<!--		</div>-->
	<div class="list_item  dark:bg-[#010102] bg-[#f4f4f4]" v-for="item in appList" :key="item.id"
		@click.stop="handleRunApp(item)">
		<div style="margin-right: 20px">
			<img :src="item.logo">
		</div>
		<div>
			<div style="margin-bottom: 10px;font-weight: bold;">{{ item.modelName }}</div>
			<div style="height: 40px;font-size: 12px;color: #9F9F9F;overflow: hidden;text-overflow: ellipsis">{{ item.desc
			}}</div>
		</div>
		<div class="recommend">推荐</div>
	</div>
</template>

<style scoped lang="less">
.list_item {
	//width: 382px;
	width: 32%;
	height: 100px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	padding: 10px;
	position: relative;
	overflow: hidden;
	margin-bottom: 20px;
	cursor: pointer;

	img {
		width: 70px;
		border-radius: 50%;
		margin-left: 5px;
		min-height: 70px;
		min-width: 70px;
	}

	.recommend {
		font-size: 10px;
		position: absolute;
		transform: rotate(50deg);
		text-align: center;
		right: -20px;
		top: 12px;
		width: 70px;
		color: #fff;
		background: linear-gradient(0deg, #4BA4FF 0%, #3178F5 100%);
	}
}
</style>

