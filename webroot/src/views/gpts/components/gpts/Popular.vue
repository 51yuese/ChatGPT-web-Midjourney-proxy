<script setup lang="ts">
import {computed, onMounted, ref, watch, inject} from 'vue'
import {fetchCollectAppAPI, fetchQueryAppsByTypeAPI} from "@/api/appStore";
import {useAuthStore, useGptsStore} from "@/store";
import {useMessage} from "naive-ui";

const authStore = useAuthStore()
const gptStore = useGptsStore()

const message = useMessage()
const popularList = ref([])
const collectApps = computed(() => gptStore.collectApps)
const selectSiderIndex = computed(() => authStore.selectSiderIndex)
const exploreAppIndex = computed(() => authStore.exploreAppIndex)
const isLogin = computed(() => authStore.isLogin);

watch(selectSiderIndex, (val) => {
		if (selectSiderIndex.value == exploreAppIndex.value) {
			getPopularList();
		}

	},
	{immediate: true},
)

// 获取最受欢迎的数据
async function getPopularList() {
	const res = await fetchQueryAppsByTypeAPI({type: 'popular'});
	if (res.code == 200) {
		popularList.value = res.data
	}
}

// 创建新会话
async function createChat(id) {

	if (!isLogin.value) {
		authStore.setLoginDialog(true)
		return
	}

	// 判断当前应用是否有开启对话
	const sessionStatus = await gptStore.isSession(id);
	if (sessionStatus == false) {
		// 当前应用没有创建会话，执行创建对话
		await gptStore.addNewChat(id)
		gptStore.updateGptsStore(false)
	} else {
		// 当前应用已经创建了对话， 直接切换会话
		gptStore.setActiveGroup(sessionStatus)
	}

	authStore.selectAppListIndex = 1
	authStore.setSelectSiderIndex(authStore.appListIndex);
}

async function collectApp(appId) {

	if (!isLogin.value) {
		authStore.setLoginDialog(true)
		return
	}

	const res = await fetchCollectAppAPI({appId: appId});
	if (res.code == 200) {
		gptStore.refreshCollect();
		message.success(res.data)
		getPopularList();
	} else {
		message.error(res.data)
	}
}
</script>

<template>
	<div class="popular_card">
		<div class="title">
			<div>
				<svg style="margin-right: 10px" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"
						 fill="none">
					<path
						d="M10 18.3333C13.4311 18.3333 16.2499 15.6142 16.2499 12.1242C16.2499 11.2674 16.2064 10.349 15.7315 8.9215C15.2565 7.49408 15.1609 7.30983 14.6587 6.42829C14.4442 8.22725 13.2963 8.977 13.0046 9.20108C13.0046 8.96796 12.3102 6.38996 11.2573 4.84746C10.2237 3.33333 8.81808 2.33996 7.99388 1.66666C7.99388 2.94574 7.63413 4.84746 7.11892 5.81641C6.60371 6.78537 6.50696 6.82066 5.86342 7.54175C5.21992 8.26283 4.92454 8.48554 4.38642 9.36046C3.84832 10.2354 3.75 11.4007 3.75 12.2575C3.75 15.7476 6.56888 18.3333 10 18.3333Z"
						stroke="#A3A5A6" stroke-width="1.67" stroke-linejoin="round"/>
					<path
						d="M10.0338 10C8.44846 11.441 7.77275 12.7746 8.00675 14.0011C8.20817 15.0569 9.00925 15.57 9.61267 15.7355C10.0805 15.8638 10.8904 15.9355 11.6141 15.291C12.3807 14.6083 12.0753 13.6377 10.9636 12.437C10.4947 11.9305 10.1848 11.1182 10.0338 10Z"
						stroke="#A3A5A6" stroke-width="1.67" stroke-linejoin="round"/>
				</svg>
			</div>
			<div class="dark:text-[#F4F4F4] text-[#03060C]">受欢迎的</div>
		</div>

		<div class="app_list">
			<div class="app_item dark:bg-[#1A1D21] bg-[#FFF]" v-for="item in popularList" :key="item.id">
				<div>
					<img class="app_avatar" :src="item.logo">
				</div>
				<div class="title_card">
					<div style="display: flex;align-items: center;width: 180px">
						<div style="font-size: 16px;margin-right: 5px;white-space: nowrap;
						overflow: hidden;text-overflow: ellipsis">{{ item.modelName }}
						</div>
						<div class="title_tag dark:bg-[#1C2F1E] bg-[#EAFAE6] dark:text-[#2ECD06] text-[#2ECD06]"
								 v-if="item.gptsApp == true">gpts
						</div>
					</div>
					<div>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
								v-if="collectApps.includes(item.id)"
								 @click="collectApp(item.id)">
							<path fill-rule="evenodd" clip-rule="evenodd"
										d="M10.9016 2.84785C11.2379 2.66173 11.6159 2.56409 12.0002 2.56409C12.3844 2.56409 12.7625 2.66173 13.0987 2.84785C13.4345 3.03375 13.7176 3.30183 13.9216 3.62698L15.8561 6.68835C16.1767 7.1956 16.708 7.53213 17.3036 7.60511L19.4485 7.86792C19.8524 7.91377 20.2363 8.06864 20.559 8.31599C20.8828 8.56414 21.1328 8.89594 21.2817 9.27565C21.4309 9.65535 21.4735 10.0685 21.4051 10.4707C21.3367 10.8728 21.1599 11.2487 20.8935 11.5577L20.8909 11.5607L18.9176 13.824C18.5085 14.2932 18.3412 14.9261 18.4651 15.5362L19.1181 18.753L19.119 18.7582C19.2012 19.1794 19.1613 19.6152 19.0043 20.0146C18.8473 20.4141 18.5796 20.7603 18.2326 21.0128L18.2246 21.0186C17.8749 21.2652 17.4631 21.4086 17.0359 21.4324C16.609 21.456 16.184 21.3594 15.8094 21.1532L12.9603 19.5941C12.3621 19.2667 11.6383 19.2667 11.04 19.5941L8.19165 21.1528C7.81629 21.3594 7.39135 21.456 6.96449 21.4324C6.53731 21.4086 6.12542 21.2652 5.77582 21.0186L5.76771 21.0129C5.42074 20.7603 5.15298 20.4141 4.99597 20.0146C4.83894 19.6152 4.79915 19.1794 4.88129 18.7582L4.8823 18.753L5.53527 15.5362C5.65911 14.9261 5.49181 14.2932 5.08271 13.824L3.10939 11.5607L3.10677 11.5577C2.84051 11.2487 2.66364 10.8728 2.59522 10.4707C2.52681 10.0685 2.56945 9.65535 2.71854 9.27565C2.86764 8.89594 3.11754 8.56414 3.44131 8.31599C3.76403 8.06864 4.14794 7.91377 4.55191 7.86792L6.69671 7.60511C7.2923 7.53214 7.82365 7.19561 8.14419 6.68836L10.078 3.62816C10.2827 3.30183 10.5658 3.03375 10.9016 2.84785Z"
										fill="#2960BE" stroke="#2960BE" stroke-width="2"/>
						</svg>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
								 viewBox="0 0 25 24" fill="none" v-else @click="collectApp(item.id)">
							<path fill-rule="evenodd" clip-rule="evenodd"
										d="M11.7017 2.84785C12.0379 2.66173 12.4159 2.56409 12.8002 2.56409C13.1845 2.56409 13.5625 2.66173 13.8987 2.84785C14.2345 3.03375 14.5176 3.30183 14.7216 3.62698L16.6561 6.68835C16.9767 7.1956 17.508 7.53213 18.1036 7.60511L20.2485 7.86792C20.6524 7.91377 21.0363 8.06864 21.359 8.31599C21.6828 8.56414 21.9328 8.89594 22.0817 9.27565C22.2309 9.65535 22.2735 10.0685 22.2051 10.4707C22.1367 10.8728 21.9599 11.2487 21.6935 11.5577L21.6909 11.5607L19.7176 13.824C19.3085 14.2932 19.1412 14.9261 19.2651 15.5362L19.9181 18.753L19.919 18.7582C20.0012 19.1794 19.9613 19.6152 19.8043 20.0146C19.6473 20.4141 19.3796 20.7603 19.0326 21.0128L19.0246 21.0186C18.6749 21.2652 18.2631 21.4086 17.8359 21.4324C17.409 21.456 16.984 21.3594 16.6094 21.1532L13.7603 19.5941C13.1621 19.2667 12.4383 19.2667 11.8401 19.5941L8.9917 21.1528C8.61634 21.3594 8.1914 21.456 7.76454 21.4324C7.33736 21.4086 6.92547 21.2652 6.57587 21.0186L6.56776 21.0129C6.22079 20.7603 5.95303 20.4141 5.79602 20.0146C5.63899 19.6152 5.5992 19.1794 5.68134 18.7582L5.68235 18.753L6.33532 15.5362C6.45916 14.9261 6.29186 14.2932 5.88276 13.824L3.90944 11.5607L3.90681 11.5577C3.64056 11.2487 3.46368 10.8728 3.39527 10.4707C3.32686 10.0685 3.3695 9.65535 3.51859 9.27565C3.66769 8.89594 3.91759 8.56414 4.24135 8.31599C4.56408 8.06864 4.94799 7.91377 5.35196 7.86792L7.49676 7.60511C8.09235 7.53214 8.6237 7.19561 8.94424 6.68836L10.878 3.62816C11.0827 3.30183 11.3659 3.03375 11.7017 2.84785Z"
										stroke="#484A4D" stroke-width="2.004"/>
						</svg>
					</div>
				</div>
				<div class="type dark:bg-[#15171A] bg-[#F4F4F4] dark:text-[#484A4D] text-[#A3A5A6]">{{ item.groupName }}
				</div>
				<div class="describe">
					{{ item.desc }}
				</div>
				<div class="attempt_btn dark:bg-[#2960BE] bg-[#3378ED] dark:text-[#FFF] text-[#FFF]"
						 @click="createChat(item.id)">立即使用
				</div>
			</div>

		</div>
	</div>
</template>

<style scoped lang="less">
.popular_card {
	width: 100%;
	margin-top: 40px;

	.title {
		display: flex;
		align-items: center;
		margin-bottom: 20px;

		img {
			width: 20px;
			height: 20px;
			margin-right: 10px;
		}
	}

	.app_list::-webkit-scrollbar {
		width: 4px;
		height: 4px;
	}

	.app_list {
		width: 100%;
		white-space: nowrap;
		overflow-x: scroll;

		.app_item:nth-child(1){
			margin-left: 0;
		}
		.app_item {
			white-space: pre-wrap;
			display: inline-block;
			width: 260px;
			height: 273px;
			border-radius: 12px;
			padding: 20px;
			margin-left: 10px;

			.app_avatar {
				width: 60px;
				height: 60px;
				min-width: 60px;
				min-height: 60px;
				border-radius: 12px;
				margin-bottom: 20px;
			}

			.title_card {
				display: flex;
				align-items: center;
				justify-content: space-between;

				.title_tag {
					padding: 2px 10px;
					border-radius: 16px;
					font-size: 13px;
				}
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

			.collect {
				width: 20px;
				height: 20px;
				min-width: 20px;
				min-height: 20px;
				margin-left: 10px;
			}
		}
	}
}
</style>
