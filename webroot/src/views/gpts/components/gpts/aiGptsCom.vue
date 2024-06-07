<script setup lang="ts">

import {useAuthStore, useChatStore, useGptsStore} from '@/store';
import {ref, computed, reactive, watch, onMounted} from 'vue';
import {useMessage, NButton, NImage, NTag, NScrollbar} from 'naive-ui';
import { SvgIcon } from '@/components/common';
import { useRouter } from 'vue-router';
import {fetchQueryGptsByPageAPI, fetchQueryGptsGroupAPI} from "@/api/gpts";
import {
	fetchCollectAppAPI,
	fetchDelAppChatAPI,
	fetchQueryAppChatListAPI,
	fetchQueryAppsByTypeAPI
} from "@/api/appStore";
import EventBus from '@/hooks/eventBus';


const router = useRouter()
const ms = useMessage();
const chatStore = useChatStore()
const gptStore = useGptsStore()
const authStore = useAuthStore()
// const emit = defineEmits(['close','toq']);
const pp = defineProps<{q:string}>();
const gptsList =  ref<{logo: string,  desc: string, modelName: string, useCount: number}[]>([])
const st = ref({loadPage:false, q:'', tab:'',search:false, hasMore: true});

const tag= ref(<{id: number, groupName: string}[]>[]);
const activeTag= ref(0);


// //  const gptUrl = homeStore.myData.session.gptUrl??'https://gpts.ddaiai.com/open/gpts';
// const go = async(item: any)=>{
// 	// await gptStore.upgradeModelConfig(item) // 切换模型，创建对话
// 	await gptStore.addNewChat(item.id)
//   gptStore.updateGptsStore(false)
// 	ms.success('切换成功！');
// }
//
// const pageLoad = async () =>{
// 		st.value.tab = '';
//     st.value.loadPage= true;
//     pager.page += 1;
//     await	handleQueryList();
//     // const gptUrl= `https://gpts.ddaiai.com/open/gptsapi/list/${ gptsPageList.value.length}`;
//     st.value.loadPage= false;
//
// }
//
// // 搜索
// const search = async (q:string ) => {
//
//     st.value.tab = 'search';
//     st.value.search= true;
// 	  pager.groupId = 0;
// 	  pager.modelName = q;
//   	await	handleQueryList();
//     // const gptUrl= `https://gpts.ddaiai.com/open/gptsapi/search?q=${ st.value.q }`;
//     st.value.search= false;
// }
//
// const pager = reactive({
// 	 size: 20,
//  	 page: 1,
// 	 groupId: 0,
// 	 modelName: "",
// });
//
// const goSearch = async (q: { id: number })=>{
// 	activeTag.value = q.id
// 	pager.groupId = q.id;
// 	st.value.hasMore = true;
// 	await	handleQueryList();
// }
//
// onMounted(() => {
// 	st.value.hasMore = true;
// 	handleQueryGptGroup();
// 	handleQueryList()
// })
//
// const handleQueryList = async () => {
// 	const list  = await fetchQueryGptsByPageAPI(pager).then(res => res.data.rows || []);
//
// 	if (pager.page > 1 && list.length === 0) {
// 		pager.page -= 1;
// 		st.value.hasMore = false;
// 		ms.info("未查询到更多Gpt");
// 		return;
// 	}
//
//   if (gptsList.value.length === 0 || activeTag.value !== 0 || st.value.tab === 'search') {
//     gptsList.value = list;
//   } else {
//     gptsList.value = list.concat(gptsList.value);
// 		st.value.hasMore = true;
//   }
// }
//
// const handleQueryGptGroup = async () => {
//   tag.value = await fetchQueryGptsGroupAPI({page: 1, size: 20}).then(res => [{id: 0, groupName: "全部"}, ...res.data.rows] || []);
// }
//
// defineExpose({
// 	search
// })
//
//


//当前选中的索引值
const selectSiderIndex = computed(() => authStore.selectSiderIndex)
// 应用列表索引值
const appListIndex = computed(() => authStore.appListIndex)


const appList = ref([])

watch(selectSiderIndex, (val) => {
		// 获取应用列表数据
		if(selectSiderIndex.value  == appListIndex.value){
			getAppChatList();
		}
	},
	{immediate: true},
)

// 获取应用列表数据
async function getAppChatList(){
	const res = await fetchQueryAppChatListAPI()
	if (res.code == 200) {
		appList.value = res.data
	}
}
// 立即使用点击事件
async function handleSelectApp(item){
	console.log(item)
	gptStore.setActiveGroup(item.id)
	authStore.selectAppListIndex = 1
}


// 应用收藏/取消收藏
async function collectApp(modelId){
	const res = await fetchCollectAppAPI({appId:modelId});
	if (res.code == 200){
		ms.success(res.data)
		getAppChatList();
	}else{
		ms.error(res.data)
	}
}

// 删除对话组
async function removeAppChat(id){
	const res = await fetchDelAppChatAPI({groupId: id});
	console.log(res)
	if (res.code == 200){
		ms.success("对话组删除成功");
		getAppChatList();
	}else{
		ms.error(res.data);
	}

}
</script>
<template>
	<div class="app_list">
		<div class="app_item dark:bg-[#1A1D21] bg-[#FFF]" v-for="item in appList" :key="item.id">
			<div style="display: flex;">
				<div>
					<img class="app_avatar" :src="item.logo">
				</div>
				<div style="width: 55%">
					<div style="display: flex;align-items: center;justify-content: space-between">
						<div style="font-size: 16px;margin-right: 5px;white-space: nowrap;
						overflow: hidden;text-overflow: ellipsis">{{item.modelName}}</div>
						<svg style="min-height: 20px;min-width: 20px;position: absolute;right: 20px;" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" v-if="item.collected == true" @click="collectApp(item.modelId)">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M10.9016 2.84785C11.2379 2.66173 11.6159 2.56409 12.0002 2.56409C12.3844 2.56409 12.7625 2.66173 13.0987 2.84785C13.4345 3.03375 13.7176 3.30183 13.9216 3.62698L15.8561 6.68835C16.1767 7.1956 16.708 7.53213 17.3036 7.60511L19.4485 7.86792C19.8524 7.91377 20.2363 8.06864 20.559 8.31599C20.8828 8.56414 21.1328 8.89594 21.2817 9.27565C21.4309 9.65535 21.4735 10.0685 21.4051 10.4707C21.3367 10.8728 21.1599 11.2487 20.8935 11.5577L20.8909 11.5607L18.9176 13.824C18.5085 14.2932 18.3412 14.9261 18.4651 15.5362L19.1181 18.753L19.119 18.7582C19.2012 19.1794 19.1613 19.6152 19.0043 20.0146C18.8473 20.4141 18.5796 20.7603 18.2326 21.0128L18.2246 21.0186C17.8749 21.2652 17.4631 21.4086 17.0359 21.4324C16.609 21.456 16.184 21.3594 15.8094 21.1532L12.9603 19.5941C12.3621 19.2667 11.6383 19.2667 11.04 19.5941L8.19165 21.1528C7.81629 21.3594 7.39135 21.456 6.96449 21.4324C6.53731 21.4086 6.12542 21.2652 5.77582 21.0186L5.76771 21.0129C5.42074 20.7603 5.15298 20.4141 4.99597 20.0146C4.83894 19.6152 4.79915 19.1794 4.88129 18.7582L4.8823 18.753L5.53527 15.5362C5.65911 14.9261 5.49181 14.2932 5.08271 13.824L3.10939 11.5607L3.10677 11.5577C2.84051 11.2487 2.66364 10.8728 2.59522 10.4707C2.52681 10.0685 2.56945 9.65535 2.71854 9.27565C2.86764 8.89594 3.11754 8.56414 3.44131 8.31599C3.76403 8.06864 4.14794 7.91377 4.55191 7.86792L6.69671 7.60511C7.2923 7.53214 7.82365 7.19561 8.14419 6.68836L10.078 3.62816C10.2827 3.30183 10.5658 3.03375 10.9016 2.84785Z" fill="#2960BE" stroke="#2960BE" stroke-width="2"/>
						</svg>
						<svg style="min-height: 20px;min-width: 20px;position: absolute;right: 20px;" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
								 viewBox="0 0 25 24" fill="none" v-else @click="collectApp(item.modelId)">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M11.7017 2.84785C12.0379 2.66173 12.4159 2.56409 12.8002 2.56409C13.1845 2.56409 13.5625 2.66173 13.8987 2.84785C14.2345 3.03375 14.5176 3.30183 14.7216 3.62698L16.6561 6.68835C16.9767 7.1956 17.508 7.53213 18.1036 7.60511L20.2485 7.86792C20.6524 7.91377 21.0363 8.06864 21.359 8.31599C21.6828 8.56414 21.9328 8.89594 22.0817 9.27565C22.2309 9.65535 22.2735 10.0685 22.2051 10.4707C22.1367 10.8728 21.9599 11.2487 21.6935 11.5577L21.6909 11.5607L19.7176 13.824C19.3085 14.2932 19.1412 14.9261 19.2651 15.5362L19.9181 18.753L19.919 18.7582C20.0012 19.1794 19.9613 19.6152 19.8043 20.0146C19.6473 20.4141 19.3796 20.7603 19.0326 21.0128L19.0246 21.0186C18.6749 21.2652 18.2631 21.4086 17.8359 21.4324C17.409 21.456 16.984 21.3594 16.6094 21.1532L13.7603 19.5941C13.1621 19.2667 12.4383 19.2667 11.8401 19.5941L8.9917 21.1528C8.61634 21.3594 8.1914 21.456 7.76454 21.4324C7.33736 21.4086 6.92547 21.2652 6.57587 21.0186L6.56776 21.0129C6.22079 20.7603 5.95303 20.4141 5.79602 20.0146C5.63899 19.6152 5.5992 19.1794 5.68134 18.7582L5.68235 18.753L6.33532 15.5362C6.45916 14.9261 6.29186 14.2932 5.88276 13.824L3.90944 11.5607L3.90681 11.5577C3.64056 11.2487 3.46368 10.8728 3.39527 10.4707C3.32686 10.0685 3.3695 9.65535 3.51859 9.27565C3.66769 8.89594 3.91759 8.56414 4.24135 8.31599C4.56408 8.06864 4.94799 7.91377 5.35196 7.86792L7.49676 7.60511C8.09235 7.53214 8.6237 7.19561 8.94424 6.68836L10.878 3.62816C11.0827 3.30183 11.3659 3.03375 11.7017 2.84785Z" stroke="#484A4D" stroke-width="2.004"/>
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
			<div style="display: flex;align-items: center;justify-content: space-between">
				<div class="attempt_btn dark:bg-[#2960BE] bg-[#3378ED] dark:text-[#FFF] text-[#FFF]" @click="handleSelectApp(item)">立即使用
				</div>
				<div @click="removeAppChat(item.id)">
					<svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
						<path d="M6.18604 5.995V17.0299C6.18604 19.239 7.9769 21.0299 10.186 21.0299H15.0139C17.223 21.0299 19.0139 19.239 19.0139 17.0299V5.995H6.18604Z" stroke="#FF5B5B" stroke-width="2.004" stroke-linejoin="round"/>
						<path d="M10.8896 10.2709V15.8297" stroke="#FF5B5B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M14.3105 10.2709V15.8297" stroke="#FF5B5B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M4.04834 5.995H21.1521" stroke="#FF5B5B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M8.39868 5.99501L8.8967 5.12287C9.65683 3.79171 11.0721 2.97009 12.605 2.97009V2.97009C14.1512 2.97009 15.5766 3.80589 16.3316 5.1552L16.8016 5.99501H8.39868Z" stroke="#FF5B5B" stroke-width="2" stroke-linejoin="round"/>
					</svg>
				</div>
			</div>
		</div>
	</div>

<!--<div class="w-full h-full p-4 overflow-y-hidden">-->
<!--	<div class="w-full dark:bg-transparent" >-->
<!--		<NScrollbar x-scrollable>-->
<!--			<div class="flex items-center justify-start line-clamp-1 pb-4"  >-->
<!--				<div class="m-1 cursor-pointer select-none" v-for="v in tag" @click="goSearch(v)">-->
<!--					<div class=" py-1 px-4 rounded-full  border border-gray-200 dark:border-gray-700" :class="[v.id === activeTag ?-->
<!--							'bg-gradient-to-r from-[#3076ED] to-[#54A2F5] hover:bg-gradient-to-r text-white' : 'text-[#5A5A5A] dark:text-[#fff]  bg-[#FBFBFB] dark:bg-[#1F1F38]']">-->
<!--						<p>{{ v.groupName}}</p>-->
<!--					</div>-->
<!--				</div>-->
<!--			</div>-->
<!--		</NScrollbar>-->
<!--	</div>-->

<!--  <div class="h-[92%] overflow-y-auto">-->
<!--    <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"  >-->
<!--      <div @click="go(v)" v-for="v in gptsList" class="group relative flex gap-3 rounded-2xl bg-[#f9f9f9] dark:bg-[#313155] p-5  cursor-pointer ">-->
<!--        <div class="min-w-0 flex-1">-->
<!--          <div class="flex justify-between items-center ">-->
<!--            <h3 class=" transition  text-lg font-semibold line-clamp-1 "> {{ v.modelName }}</h3>-->
<!--            <n-tag type="success" size="small" round v-if="v.useCount && (+v.useCount)> 0">-->
<!--              <div class="flex items-center text-[#FA6406]"><SvgIcon icon="mdi:hot"  ></SvgIcon>{{ v.useCount }}</div>-->
<!--            </n-tag>-->
<!--          </div>-->
<!--          <div class="mt-0.5 text-zinc-400 text-md line-clamp-2">{{ v.desc }}</div>-->

<!--        </div>-->
<!--        <NImage :src="v.logo" :preview-disabled="true" lazy class="group-hover:scale-[130%] duration-300 shrink-0 overflow-hidden bg-base object-cover rounded-full bc-avatar w-[80px] h-[80px]">-->
<!--          <template #placeholder>-->
<!--            <div class="w-full h-full justify-center items-center flex"  >-->
<!--              <SvgIcon icon="line-md:downloading-loop" class="text-[60px] text-green-300"></SvgIcon>-->
<!--            </div>-->
<!--          </template>-->
<!--        </NImage>-->
<!--      </div>-->
<!--    </div>-->

<!--    <div class="h-full flex items-center justify-center"  v-if="gptsList.length === 0">-->
<!--      未查询到更多GPT-->
<!--    </div>-->

<!--		<div class="flex items-center justify-center py-5">-->
<!--			<div  v-if="st.loadPage">-->
<!--				<div class="w-full h-full justify-center items-center flex"  >-->
<!--					<SvgIcon icon="line-md:downloading-loop" class="text-[60px] text-green-300"></SvgIcon>-->
<!--				</div>-->
<!--			</div>-->
<!--			<NButton @click="pageLoad()" v-if="gptsList.length && !st.loadPage && st.hasMore">加载更多</NButton>-->
<!--		</div>-->

<!--	</div>-->
<!--</div>-->
</template>

<style scoped lang="less">
.app_list {
	width: 100%;
	display: flex;
	align-items: center;
	flex-wrap: wrap;

	//@media (min-width: 100%) and (max-width: 100%){
	//	.app_item:nth-child(even){
	//		margin-right: 0px;
	//	}
	//}

	//.app_item:last-child{
	//	margin-right: 0;
	//}

	.app_item {
		//width: 262px;
		width: 19%;
		height: 217px;
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
			width: 85%;
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
