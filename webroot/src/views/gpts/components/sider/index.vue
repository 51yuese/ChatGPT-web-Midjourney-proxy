<script setup lang='ts'>
import type {CSSProperties} from 'vue';
import {computed, ref, watch, nextTick, onMounted} from 'vue';
import type {NumberAnimationInst} from 'naive-ui';
import {NButton, NInput, NLayoutSider, NNumberAnimation, useDialog, useMessage} from 'naive-ui';
import {useRouter} from 'vue-router';
import List from './List.vue';
import {Reply, SvgIcon} from '@/components/common';

import {useAppStore, useAuthStore, useGptsStore, useGlobalStoreWithOut} from '@/store'
import {useBasicLayout} from '@/hooks/useBasicLayout'
import {fetchAppSortAPI} from "@/api/appStore";

const useGlobalStore = useGlobalStoreWithOut();

const router = useRouter();
const appStore = useAppStore();
const gptsStore = useGptsStore();
const authStore = useAuthStore();
const ms = useMessage();
const model3AnimationInstRef = ref<NumberAnimationInst | null>(null);
const model4AnimationInstRef = ref<NumberAnimationInst | null>(null);
const userBalance = computed(() => authStore.userBalance);
const dialog = useDialog();
const {isMobile} = useBasicLayout();
/* 当前选用的模型的扣费类型 1: 普通 2： 高级  */
const activeModelKeyDeductType = computed(() => gptsStore?.activeModelKeyDeductType);
const activeModelKeyPrice = computed(() => gptsStore?.activeModelKeyPrice);
const isLogin = computed(() => authStore.isLogin);


// 应用分类数据
const appSortList = ref([])
// 当前选中的分类
const selectAppSortIndex = ref(authStore.exploreAppIndex)
// 将当前侧边栏选中的id保存起来
authStore.setSelectSiderIndex(selectAppSortIndex)


// const getMobileClass = computed<CSSProperties>(() => {
// 	if (isMobile.value) {
// 		return {
// 			position: 'fixed',
// 			zIndex: 50,
// 			// top: '56px',
// 			// height: 'calc(100% - 60px)'
// 			height: 'calc(100% - 100px)'
// 		}
// 	}
// 	return {
// 		background: theme.value === 'dark' ? '#131323' : '',
// 		// height: 'calc(100% - 56px)'
// 		height: 'calc(100% - 100px)'
// 	}
// })
//
// const mobileSafeArea = computed(() => {
// 	if (isMobile.value) {
// 		return {
// 			paddingBottom: 'env(safe-area-inset-bottom)',
// 		}
// 	}
// 	return {}
// })

const oldUse3Token = ref(0)
const newUse3Token = ref(0)
const oldUse4Token = ref(0)
const newUse4Token = ref(0)

const isSearch = ref(false)
const searchRef = ref(null)

watch(() => authStore.userBalance.useModel3Token, (newVal, oldVal) => {
	oldUse3Token.value = oldVal || 0
	newUse3Token.value = newVal || 0
	model3AnimationInstRef.value?.play()
}, {
	immediate: true,
	flush: 'post',
})

watch(() => authStore.userBalance.useModel4Token, (newVal, oldVal) => {
	oldUse4Token.value = oldVal || 0
	newUse4Token.value = newVal || 0
	model4AnimationInstRef.value?.play()
}, {
	immediate: true,
	flush: 'post',
})

watch(isMobile, (val) => {
		gptsStore.setSiderCollapsed(val)
	},
	{
		immediate: true,
		flush: 'post',
	},
)

const addLoading = ref(false)
const removeLoading = ref(false)

const collapsed = computed(() => gptsStore.siderCollapsed)
const groupKeyWord = ref('')

function handleInputGroupSearch(val: string) {
	groupKeyWord.value = val
	gptsStore.setGroupKeyWord(val)
}

function handleBlurInput() {
	isSearch.value = false;
}

// 提取公共的功能
function checkAuth() {
	if (!authStore.token) {
		ms.info("请先登录")
		addLoading.value = false
		authStore.setLoginDialog(true);
		return false
	}
	return true
}


/* 新增一个对话 */
async function handleAdd() {

	try {

		if (!checkAuth()) {
			return;
		}

		gptsStore.updateGptsStore(true)
		if (isMobile.value)
			gptsStore.setSiderCollapsed(true)
	} catch (error) {
		addLoading.value = false
	}
}

onMounted(() => {
	gptsStore.queryMyGroup()
	// 获取应用分类
	getAppSortList()
})

/* 删除全部非置顶聊天 */
async function handleDelGroup() {
	if (!checkAuth()) {
		return;
	}

	dialog.create({
		title: '清空分组',
		content: '是否删除所有非置顶的对话组？',
		positiveText: '确认删除',
		negativeText: '再想想',
		onPositiveClick: async () => {
			await gptsStore.delAllGroup()
		},
	})

}

function handleUpdateCollapsed() {
	gptsStore.setSiderCollapsed(!collapsed.value)
}

const theme = computed(() => appStore.theme)

function handleOpenSearch() {

	if (!checkAuth()) {
		return;
	}

	isSearch.value = true
	nextTick(() => {
		searchRef.value?.focus()
	})
}

// 获取应用分类
async function getAppSortList(){
	 const res = await fetchAppSortAPI({status:1});
	appSortList.value = res.data.rows
}

// 应用分类点击事件
function changSortClick(index){


	// 探索应用以及全部应用直接放行
	if(index == authStore.exploreAppIndex || index == authStore.AppAllIndex){
		selectAppSortIndex.value = index
		return;
	}

	// 是否登录
	if (!isLogin.value) {
		authStore.setLoginDialog(true)
		return
	}

	// 判断创建弹窗
	if(index == authStore.createAppIndex){
		authStore.updateCreateAppDialog(true)
		return;
	}

	selectAppSortIndex.value = index
	// authStore.setSelectSiderIndex(index)
	isSelect(index);
}

function isSelect(index){
	return  selectAppSortIndex.value == index ? true:false
}
</script>

<template>
	<div class="sidebar">
<!--		:style="getMobileClass"-->
		<NLayoutSider
			:collapsed="collapsed"
			:collapsed-width="0"
			:width="260"
			:show-trigger="false"
			collapse-mode="transform"
			class="dark:bg-[#1A1D21] bg-[#FFF]"
			@update-collapsed="handleUpdateCollapsed"
		>

			<div class="sidebar_card_main">
				<div class="apply_list">
					<div style="font-size: 13px;margin: 20px 0 10px 20px" class="drak:text-[#484A4D] text-[#A3A5A6]">了解应用</div>
					<div class="item_list">
						<div :class="isSelect(authStore.exploreAppIndex) ? 'app_item dark:bg-[#1C2635] bg-[#F5F8FE]':'def_app_item'" @click="changSortClick(authStore.exploreAppIndex)">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
								<path d="M6.77904 2.09332H3.73252C2.81205 2.09332 2.06586 2.83951 2.06586 3.75999V6.80651C2.06586 7.72698 2.81205 8.47318 3.73252 8.47318H6.77904C7.69952 8.47318 8.44571 7.72698 8.44571 6.80651V3.75999C8.44571 2.83951 7.69952 2.09332 6.77904 2.09332Z" stroke="#3378ED" stroke-width="1.66667"/>
								<path d="M6.77904 11.3871H3.73252C2.81205 11.3871 2.06586 12.1333 2.06586 13.0538V16.1003C2.06586 17.0207 2.81205 17.7669 3.73252 17.7669H6.77904C7.69952 17.7669 8.44571 17.0207 8.44571 16.1003V13.0538C8.44571 12.1333 7.69952 11.3871 6.77904 11.3871Z" stroke="#3378ED" stroke-width="1.66667"/>
								<path d="M16.7762 14.069C16.7762 12.5878 15.5754 11.3871 14.0943 11.3871C12.6131 11.3871 11.4124 12.5878 11.4124 14.069C11.4124 15.5502 12.6131 16.7509 14.0943 16.7509C15.5754 16.7509 16.7762 15.5502 16.7762 14.069Z" stroke="#3378ED" stroke-width="1.66667"/>
								<path d="M16.1255 2.09332H13.079C12.1585 2.09332 11.4124 2.83951 11.4124 3.75999V6.80651C11.4124 7.72698 12.1585 8.47318 13.079 8.47318H16.1255C17.046 8.47318 17.7922 7.72698 17.7922 6.80651V3.75999C17.7922 2.83951 17.046 2.09332 16.1255 2.09332Z" stroke="#3378ED" stroke-width="1.66667"/>
								<path d="M16.1091 16.0011L17.9431 17.7669" stroke="#3378ED" stroke-width="1.66667" stroke-linecap="round"/>
							</svg>
							<div>探索应用</div>
						</div>
						<div :class="isSelect(authStore.appListIndex) ? 'app_item dark:bg-[#1C2635] bg-[#F5F8FE]':'def_app_item'" @click="changSortClick(authStore.appListIndex)">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
								<path d="M7.1346 2.56708H3.6731C2.98274 2.56708 2.4231 3.12672 2.4231 3.81708V10.4271C2.4231 11.1174 2.98274 11.6771 3.6731 11.6771H7.1346C7.82496 11.6771 8.3846 11.1174 8.3846 10.4271V3.81708C8.3846 3.12672 7.82496 2.56708 7.1346 2.56708Z" stroke="#3378ED" stroke-width="1.67"/>
								<path d="M16.3265 17.4329H12.865C12.1746 17.4329 11.615 16.8733 11.615 16.1829V9.57292C11.615 8.88256 12.1746 8.32292 12.865 8.32292H16.3265C17.0169 8.32292 17.5765 8.88256 17.5765 9.57292V16.1829C17.5765 16.8733 17.0169 17.4329 16.3265 17.4329Z" stroke="#3378ED" stroke-width="1.67"/>
								<path d="M7.1346 14.4921H3.6731C2.98274 14.4921 2.4231 15.0518 2.4231 15.7421V16.1829C2.4231 16.8733 2.98274 17.4329 3.6731 17.4329H7.1346C7.82496 17.4329 8.3846 16.8733 8.3846 16.1829V15.7421C8.3846 15.0518 7.82496 14.4921 7.1346 14.4921Z" stroke="#3378ED" stroke-width="1.67"/>
								<path d="M16.3265 5.50787H12.865C12.1746 5.50787 11.615 4.94823 11.615 4.25787V3.8171C11.615 3.12674 12.1746 2.5671 12.865 2.5671H16.3265C17.0169 2.5671 17.5765 3.12674 17.5765 3.8171V4.25787C17.5765 4.94823 17.0169 5.50787 16.3265 5.50787Z" stroke="#3378ED" stroke-width="1.67"/>
							</svg>
							<div>对话列表</div>
						</div>
						<div :class="isSelect(authStore.mineAppIndex) ? 'app_item app_item dark:bg-[#1C2635] bg-[#F5F8FE]':'def_app_item'" @click="changSortClick(authStore.mineAppIndex)">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
								<path fill-rule="evenodd" clip-rule="evenodd" d="M9.08471 2.37322C9.36488 2.21812 9.67988 2.13675 10.0001 2.13675C10.3204 2.13675 10.6354 2.21812 10.9156 2.37322C11.1954 2.52814 11.4313 2.75154 11.6013 3.02249L13.2134 5.57363C13.4806 5.99634 13.9233 6.27678 14.4196 6.3376L16.2071 6.55661C16.5436 6.59482 16.8636 6.72387 17.1325 6.93C17.4023 7.13679 17.6106 7.41329 17.7347 7.72972C17.8591 8.04613 17.8946 8.39046 17.8376 8.72557C17.7806 9.06071 17.6332 9.37391 17.4112 9.63143L17.4091 9.63396L15.7646 11.52C15.4237 11.911 15.2843 12.4384 15.3876 12.9468L15.9317 15.6275L15.9325 15.6318C16.001 15.9828 15.9677 16.346 15.8369 16.6788C15.7061 17.0118 15.483 17.3002 15.1938 17.5107L15.1871 17.5155C14.8957 17.721 14.5526 17.8405 14.1966 17.8603C13.8408 17.88 13.4866 17.7995 13.1745 17.6277L10.8002 16.3284C10.3017 16.0556 9.69855 16.0556 9.20003 16.3284L6.82637 17.6273C6.51357 17.7995 6.15946 17.88 5.80374 17.8603C5.44776 17.8405 5.10451 17.721 4.81318 17.5155L4.80642 17.5107C4.51728 17.3002 4.29415 17.0118 4.16331 16.6788C4.03245 16.346 3.99929 15.9828 4.06774 15.6318L4.06858 15.6275L4.61272 12.9468C4.71592 12.4384 4.57651 11.911 4.23559 11.52L2.59116 9.63396L2.58897 9.63145C2.36709 9.37391 2.2197 9.06071 2.16268 8.72557C2.10567 8.39046 2.14121 8.04613 2.26545 7.72972C2.3897 7.41329 2.59795 7.13679 2.86775 6.93C3.13669 6.72387 3.45661 6.59482 3.79326 6.55661L5.58059 6.3376C6.07691 6.27679 6.51971 5.99635 6.78682 5.57364L8.39833 3.02347C8.56891 2.75154 8.80486 2.52814 9.08471 2.37322Z" stroke="#3378ED" stroke-width="1.67"/>
							</svg>
							<div>我的应用</div>
						</div>
<!--						<div  :class="selectAppSortIndex == authStore.createAppIndex ? 'app_item':'def_app_item'" @click="authStore.updateCreateAppDialog(true)">-->

						<div  :class="isSelect(authStore.createAppIndex) ? 'app_item app_item dark:bg-[#1C2635] bg-[#F5F8FE]':'def_app_item'" @click="changSortClick(authStore.createAppIndex)">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
								<path d="M6.7791 2.09329H3.73258C2.81211 2.09329 2.06592 2.83948 2.06592 3.75996V6.80648C2.06592 7.72695 2.81211 8.47314 3.73258 8.47314H6.7791C7.69958 8.47314 8.44577 7.72695 8.44577 6.80648V3.75996C8.44577 2.83948 7.69958 2.09329 6.7791 2.09329Z" stroke="#3378ED" stroke-width="1.67"/>
								<path d="M6.7791 11.3871H3.73258C2.81211 11.3871 2.06592 12.1333 2.06592 13.0538V16.1003C2.06592 17.0207 2.81211 17.7669 3.73258 17.7669H6.7791C7.69958 17.7669 8.44577 17.0207 8.44577 16.1003V13.0538C8.44577 12.1333 7.69958 11.3871 6.7791 11.3871Z" stroke="#3378ED" stroke-width="1.67"/>
								<path d="M16.1255 2.09329H13.079C12.1585 2.09329 11.4124 2.83948 11.4124 3.75996V6.80648C11.4124 7.72695 12.1585 8.47314 13.079 8.47314H16.1255C17.046 8.47314 17.7922 7.72695 17.7922 6.80648V3.75996C17.7922 2.83948 17.046 2.09329 16.1255 2.09329Z" stroke="#3378ED" stroke-width="1.67"/>
								<path d="M14.6023 11.7558V17.3982" stroke="#3378ED" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
								<path d="M17.4236 14.577L11.7812 14.577" stroke="#3378ED" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
							<div>创建应用</div>
						</div>
					</div>
				</div>
				<div class="apply_sort">
					<div style="font-size: 13px;margin: 30px 0 10px 20px" class="drak:text-[#484A4D] text-[#A3A5A6]">应用分类</div>
					<div class="sort_list">
							<div :class="isSelect(authStore.AppAllIndex) ? 'sort_item app_item dark:bg-[#1C2635] bg-[#F5F8FE]':'def_sort_item'" @click="changSortClick(authStore.AppAllIndex)">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
									<path d="M6.77904 2.09332H3.73252C2.81205 2.09332 2.06586 2.83951 2.06586 3.75999V6.80651C2.06586 7.72698 2.81205 8.47318 3.73252 8.47318H6.77904C7.69952 8.47318 8.44571 7.72698 8.44571 6.80651V3.75999C8.44571 2.83951 7.69952 2.09332 6.77904 2.09332Z" stroke="#3378ED" stroke-width="1.66667"/>
									<path d="M6.77904 11.3871H3.73252C2.81205 11.3871 2.06586 12.1333 2.06586 13.0538V16.1003C2.06586 17.0207 2.81205 17.7669 3.73252 17.7669H6.77904C7.69952 17.7669 8.44571 17.0207 8.44571 16.1003V13.0538C8.44571 12.1333 7.69952 11.3871 6.77904 11.3871Z" stroke="#3378ED" stroke-width="1.66667"/>
									<path d="M16.7762 14.069C16.7762 12.5878 15.5754 11.3871 14.0943 11.3871C12.6131 11.3871 11.4124 12.5878 11.4124 14.069C11.4124 15.5502 12.6131 16.7509 14.0943 16.7509C15.5754 16.7509 16.7762 15.5502 16.7762 14.069Z" stroke="#3378ED" stroke-width="1.66667"/>
									<path d="M16.1255 2.09332H13.079C12.1585 2.09332 11.4124 2.83951 11.4124 3.75999V6.80651C11.4124 7.72698 12.1585 8.47318 13.079 8.47318H16.1255C17.046 8.47318 17.7922 7.72698 17.7922 6.80651V3.75999C17.7922 2.83951 17.046 2.09332 16.1255 2.09332Z" stroke="#3378ED" stroke-width="1.66667"/>
									<path d="M16.1091 16.0011L17.9431 17.7669" stroke="#3378ED" stroke-width="1.66667" stroke-linecap="round"/>
								</svg>
								<div>全部</div>
							</div>
							<div :class="isSelect(item.id) ? 'sort_item app_item dark:bg-[#1C2635] bg-[#F5F8FE]':'def_sort_item'" v-for="item in appSortList" :key="item.id" @click="changSortClick(item.id)">
								<img :src="item.groupLogo">
								<div>{{item.groupName}}</div>
							</div>
					</div>
				</div>
			</div>

<!--						      <div class="flex flex-col h-full" :style="mobileSafeArea">-->
<!--						        <main class="flex flex-col h-full flex-1 min-h-0">-->

<!--						          <div class="flex h-14 items-center space-x-2 bg-white px-4 dark:bg-[#131323]">-->
<!--												<NButton type="primary" :loading="addLoading" @click="handleAdd">-->
<!--						              <SvgIcon icon="ic:round-wifi-find" class="text-xl" />-->
<!--						            </NButton>-->
<!--						            <div class="flex-1">-->
<!--						              <NInput v-model="groupKeyWord"-->
<!--																	ref="searchRef"-->
<!--																	type="text"-->
<!--																	placeholder="对话历史查找"-->
<!--																	@blur="handleBlurInput"-->
<!--																	clearable @input="handleInputGroupSearch" />-->
<!--						            </div>-->
<!--						          </div>-->

<!--											<div class="flex w-full h-14 items-center space-x-2 bg-white px-4 dark:bg-[#131323]"  v-if="!isSearch">-->
<!--						            <div class=" w-full flex justify-between items-center">-->

<!--													<NButton  :loading="removeLoading" @click="handleDelGroup">-->
<!--														清除列表-->
<!--													</NButton>-->
<!--						              <NButton type="primary" :loading="addLoading" @click="handleAdd">-->
<!--						                更多GPTs-->
<!--						                <SvgIcon icon="ic:round-wifi-find" class="text-xl" />-->
<!--						              </NButton>-->
<!--						            </div>-->

<!--						          </div>-->

<!--											&lt;!&ndash; 对话分组 显示&ndash;&gt;-->
<!--						          <div class="flex-1 min-h-0 pb-4 overflow-hidden">-->
<!--						            <List />-->
<!--						          </div>-->

<!--			&lt;!&ndash;			          <div class="p-4 w-full border-t dark:border-t-neutral-800 flex flex-col" v-if="!isMobile">&ndash;&gt;-->

<!--			&lt;!&ndash;			            <div class="flex justify-between  w-full">&ndash;&gt;-->
<!--			&lt;!&ndash;			              <Reply></Reply>&ndash;&gt;-->
<!--			&lt;!&ndash;			            </div>&ndash;&gt;-->

<!--			&lt;!&ndash;			          </div>&ndash;&gt;-->

<!--						        </main>-->
<!--						       <Footer />-->
<!--						      </div>-->


		</NLayoutSider>
		<!--		<template v-if="isMobile">-->
		<!--			<div v-show="!collapsed" class="fixed inset-0 z-40 bg-black/40" @click="handleUpdateCollapsed"/>-->
		<!--		</template>-->
	</div>
</template>

<style scoped lang="less">
svg{
	margin-right: 10px;
}
.sidebar {
	margin-top: 10px;
	margin-left: 10px;
	//height: 87%;
	height: calc(100% - 80px);
}

.n-layout-sider {
	height: 100%;
	border-radius: 20px;
	border: none;
	margin-right: 20px;
}
.sidebar_card_main{
	width: 100%;
	height: 100%;
	overflow-y: scroll;
}
.sidebar_card_main::-webkit-scrollbar {
	width: 0px;
}
.item_list, .sort_list{
	padding: 0 20px;

	.app_item, .sort_item{
		width: 100%;
		height: 36px;
		display: flex;
		align-items: center;
		//background-color: #1C2635;
		//background-color: transparent;
		overflow: hidden;
		font-size: 15px;
		padding: 0 15px;
		border-radius: 12px;
		margin-bottom: 15px;
		cursor: pointer;
		color: #2960BE;

		img{
			width: 20px;
			height: 20px;
			margin-right: 10px;
		}
	}
	.def_app_item, .def_sort_item{
		width: 100%;
		height: 36px;
		display: flex;
		align-items: center;
		overflow: hidden;
		font-size: 15px;
		padding: 0 15px;
		border-radius: 12px;
		margin-bottom: 15px;
		cursor: pointer;

		img{
			width: 20px;
			height: 20px;
			margin-right: 10px;
		}
	}
}
</style>
