<script setup lang="ts">
// 获取我的应用数据
import {fetchCollectAppAPI, fetchQueryAppsByTypeAPI, fetchQueryMineAppsAPI} from "@/api/appStore";
import {computed, ref, watch} from "vue";
import {useMessage} from "naive-ui";
import {useAuthStore, useGptsStore} from "@/store";

const message = useMessage()
const authStore = useAuthStore()
const gptStore = useGptsStore()

//当前选中的索引值
const selectSiderIndex = computed(() => authStore.selectSiderIndex)
// 我的应用索引值
const mineAppIndex = computed(() => authStore.mineAppIndex)
const appList = ref([])

console.log(123)
watch(selectSiderIndex, (val) => {
		// 获取我的应用
		if(selectSiderIndex.value  == mineAppIndex.value){
			getMineCollectAppList();
			getMineAppList();
		}
	},
	{immediate: true},
)

// 获取我的应用数据
async function getMineAppList(){
	const res =  await fetchQueryAppsByTypeAPI({type:'mine'});
	console.log(res)
	if (res.code == 200){
		// appList.value = res.data
		// appList.value.push( res.data)
		appList.value.push(...res.data)
	}
}

// 获取我的收藏的应用数据
async function getMineCollectAppList(){
	const res =  await fetchQueryMineAppsAPI();
	console.log(res)
	if (res.code == 200){
		appList.value.push(...res.data.rows)
	}
}

// 收藏/取消收藏
async function collectApp(appId, index){
	console.log(index)
	const res = await fetchCollectAppAPI({appId:appId});
	if (res.code == 200){
		message.success(res.data)
		appList.value.splice(index, 1)
	}else{
		message.error(res.data)
	}
}

// 创建新会话
async function createChat(id){
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

}
</script>

<template>
	<div class="app_list">
		<div class="app_item dark:bg-[#1A1D21] bg-[#FFF]" v-for="(item,index) in appList" :key="item.id">
			<div style="display: flex;">
				<div>
					<img class="app_avatar" :src="item.logo">
				</div>
				<div style="width: 55%">
					<div style="display: flex;align-items: center;justify-content: space-between">
						<div style="font-size: 16px;margin-right: 5px;white-space: nowrap;
						overflow: hidden;text-overflow: ellipsis">{{item.modelName}}</div>
							<svg style="min-height: 20px;min-width: 20px;position: absolute;right: 20px;" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" v-if=" item.collectTime != null" @click="collectApp(item.id, index)">
								<path fill-rule="evenodd" clip-rule="evenodd" d="M10.9016 2.84785C11.2379 2.66173 11.6159 2.56409 12.0002 2.56409C12.3844 2.56409 12.7625 2.66173 13.0987 2.84785C13.4345 3.03375 13.7176 3.30183 13.9216 3.62698L15.8561 6.68835C16.1767 7.1956 16.708 7.53213 17.3036 7.60511L19.4485 7.86792C19.8524 7.91377 20.2363 8.06864 20.559 8.31599C20.8828 8.56414 21.1328 8.89594 21.2817 9.27565C21.4309 9.65535 21.4735 10.0685 21.4051 10.4707C21.3367 10.8728 21.1599 11.2487 20.8935 11.5577L20.8909 11.5607L18.9176 13.824C18.5085 14.2932 18.3412 14.9261 18.4651 15.5362L19.1181 18.753L19.119 18.7582C19.2012 19.1794 19.1613 19.6152 19.0043 20.0146C18.8473 20.4141 18.5796 20.7603 18.2326 21.0128L18.2246 21.0186C17.8749 21.2652 17.4631 21.4086 17.0359 21.4324C16.609 21.456 16.184 21.3594 15.8094 21.1532L12.9603 19.5941C12.3621 19.2667 11.6383 19.2667 11.04 19.5941L8.19165 21.1528C7.81629 21.3594 7.39135 21.456 6.96449 21.4324C6.53731 21.4086 6.12542 21.2652 5.77582 21.0186L5.76771 21.0129C5.42074 20.7603 5.15298 20.4141 4.99597 20.0146C4.83894 19.6152 4.79915 19.1794 4.88129 18.7582L4.8823 18.753L5.53527 15.5362C5.65911 14.9261 5.49181 14.2932 5.08271 13.824L3.10939 11.5607L3.10677 11.5577C2.84051 11.2487 2.66364 10.8728 2.59522 10.4707C2.52681 10.0685 2.56945 9.65535 2.71854 9.27565C2.86764 8.89594 3.11754 8.56414 3.44131 8.31599C3.76403 8.06864 4.14794 7.91377 4.55191 7.86792L6.69671 7.60511C7.2923 7.53214 7.82365 7.19561 8.14419 6.68836L10.078 3.62816C10.2827 3.30183 10.5658 3.03375 10.9016 2.84785Z" fill="#2960BE" stroke="#2960BE" stroke-width="2"/>
							</svg>
					</div>
					<div style="display: flex;align-items: center;justify-content: space-between">
						<div class="type dark:bg-[#15171A] bg-[#F4F4F4] dark:text-[#484A4D] text-[#A3A5A6]">{{item.groupName}}</div>
						<div style="position: absolute;right: 20px;" class="title_tag dark:bg-[#1C2F1E] bg-[#EAFAE6] dark:text-[#2ECD06] text-[#2ECD06]" v-if="item.gptsApp == true">gpts</div>
					</div>
				</div>
			</div>
			<div class="describe">
				{{item.desc}}
			</div>
			<div class="attempt_btn dark:bg-[#2960BE] bg-[#3378ED] dark:text-[#FFF] text-[#FFF]" @click="createChat(item.id)">立即使用
			</div>
		</div>
	</div>
</template>


<style scoped lang="less">
.app_list {
	width: 100%;
	display: flex;
	align-items: center;
	flex-wrap: wrap;

	.app_item {
		width: 262px;
		//height: 217px;
		height: 19%;
		border-radius: 12px;
		padding: 20px;
		//margin-right: 10px;
		margin-left: 7px;
		margin-bottom: 7px;
		position: relative;

		.app_avatar {
			width: 60px;
			height: 60px;
			min-width: 60px;
			min-height: 60px;
			border-radius: 12px;
			margin-bottom: 20px;
			margin-right: 10px;
		}

		.title_card {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.title_tag {
			padding: 2px 10px;
			border-radius: 16px;
			font-size: 13px;
			margin-top: 10px;
		}

		.type {
			font-size: 13px;
			width: 38px;
			text-align: center;
			height: 20px;
			line-height: 22px;
			margin-top: 10px;
			border-radius: 6px;
		}

		.describe {
			height: 42px;
			font-size: 13px;
			word-wrap: break-word;
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			margin: 10px 0;
		}

		.attempt_btn {
			font-size: 12px;
			border-radius: 8px;
			padding: 8px 12px;
			min-width: 80px;
			text-align: center;
			cursor: pointer;
		}
	}
}
</style>
