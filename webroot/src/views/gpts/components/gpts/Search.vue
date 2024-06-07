<script setup lang="ts">
import {
	NInput,
	NPopover,
	useMessage,
} from 'naive-ui'
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {fetchQueryGptsByPageAPI} from "@/api/appStore";
import {useAuthStore} from "@/store";

const authStore = useAuthStore()
const message = useMessage()


const appListNum = ref(0)
const appTitle = ref('')
const searchType = ref('站内搜索')

onMounted(() => {
	getAppCount()
})



// 获取应用总数
async function getAppCount() {
	const res = await fetchQueryGptsByPageAPI({page: 0, size: 0, modelName: 0, modelId: '', groupId: 0});
	appListNum.value = res.data.count
}

// 应用搜索
async function appSearch() {

	if (searchType.value == '站内搜索') {
		const res = await fetchQueryGptsByPageAPI({page: 0, size: 0, modelName: appTitle.value, modelId: '', groupId: 0});
		console.log(res)
		if (res.code != 200) {
			message.error(res.data)
			return
		}

		if(res.data.rows.length == 0){
			message.error("未能找到"+ appTitle.value +" 相关内容, 你可尝试更换搜索内容再次尝试")
			return;
		}
		authStore.updateSearchAppList(res.data.rows, true);

	} else {
		// 全网搜索
		message.error("功能正在开发中")
	}
}

// 搜索输入框失去焦点事件
function searchInputBlur(){
	console.log(appTitle.value)
	if (appTitle.value == ''){
		authStore.updateSearchAppList('[]', false);
	}
}

// 清楚按钮点击事件
function closeClick(){
	appTitle.value = ''
	authStore.updateSearchAppList('[]', false);
}

</script>


<template>


	<div class="search_card dark:bg-[#1A1D21] bg-[#FFF]">

		<div class="search_tag dark:bg-[#1C2635] bg-[#F5F8FE]">
			<div>
				{{ searchType }}
			</div>
			<div style="margin-left: 5px">
				<img src="@/assets/images/app/down.png">
			</div>
		</div>

<!--		<div class="search_popover">-->
<!--			<n-popover-->
<!--				class="dark:bg-[#15171A] bg-[#ffffff]"-->
<!--				placement="bottom-start"-->
<!--				trigger="click" style="width: 100px;height: 80px;text-align: center;padding: 0">-->
<!--				<template #trigger>-->
<!--					<div class="search_tag dark:bg-[#1C2635] bg-[#F5F8FE]">-->
<!--						<div>-->
<!--							{{ searchType }}-->
<!--						</div>-->
<!--						<div style="margin-left: 5px">-->
<!--							<img src="@/assets/images/app/down.png">-->
<!--						</div>-->
<!--					</div>-->
<!--				</template>-->

<!--				<div class="search_type dark:bg-[#15171A] bg-[#ffffff]" style="width: 100%;height: 100%;line-height: 30px;border-radius: 20px">-->
<!--&lt;!&ndash;					<div class="search_type_item" tabindex="1"&ndash;&gt;-->
<!--&lt;!&ndash;							 style="cursor: pointer;padding-top: 5px;padding-bottom: 5px" @click="searchType = '全网搜索'">全网搜索</div>&ndash;&gt;-->
<!--					<div class="search_type_item" tabindex="2"-->
<!--							 style="cursor: pointer;padding-top: 5px; padding-bottom: 5px;" @click="searchType = '站内搜索'">站内搜索</div>-->
<!--				</div>-->
<!--			</n-popover>-->
<!--		</div>-->


		<div style="width: 88%">
			<NInput @blur="searchInputBlur" class="dark:bg-[#1A1D21] bg-[#FFF] bark:text-[#484A4D] text-[#A3A5A6] border-[0]"
							:placeholder="'搜索'+appListNum+'个应用'" v-model:value="appTitle" @keyup.enter="appSearch">
				<template #suffix v-if="appTitle != ''">
					<img src="@/assets/images/close.png" style="width: 15px;height: 15px;cursor: pointer" @click="closeClick">
				</template>
			</NInput>
		</div>
		<div style="position: absolute;right: 20px">
			<img src="@/assets/images/app/search.png" @click="appSearch">
		</div>
	</div>


</template>


<style scoped lang="less">
.search_card {
	width: 100%;
	height: 50px;
	border-radius: 50px;
	display: flex;
	align-items: center;
	padding: 0 10px;
	position: relative;
	margin-bottom: 10px;

	.search_tag {
		width: 120px;
		height: 40px;
		color: #2960BE;
		font-size: 16px;
		border-radius: 50px;
		text-align: center;
		line-height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;

	}

	.n-input {
		width: 100%;
		//background-color: transparent;
		font-size: 15px;
		margin-left: 20px;
		--n-border: 0px solid #ffffff !important;
	}

	/deep/.n-popover-arrow{
		background-color: transparent;
	}

}

//.search_type_item:focus{
//	background-color: #2960BE;
//	color: #FFFFFF;
//}
</style>
