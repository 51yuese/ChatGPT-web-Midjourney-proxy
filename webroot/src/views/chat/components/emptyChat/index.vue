<script setup lang="ts">
import {reactive, onMounted, ref} from 'vue'
import { SvgIcon } from '@/components/common'
import {NButton, NGi, NSkeleton, NSpace, useMessage} from 'naive-ui'
import {useAppCatStoreWithOut, useAuthStore, useChatStore} from '@/store'
import SuggestApps from "@/views/chat/components/SuggestApps/index.vue"
import MobileApp from "@/views/chat/components/emptyChat/mobile.vue"
import {ResData} from "@/api/types";
import {fetchQueryAppsAPI} from "@/api/appStore";
import {App} from "@/views/appStore/components/helpter";
import {useBasicLayout} from "@/hooks/useBasicLayout";
const chatStore = useChatStore();
const authStore = useAuthStore();
const ms = useMessage();
const loading = ref(false);
const appCenterStore = useAppCatStoreWithOut();
const {isMobile} = useBasicLayout()
// 获取时间
const getCurrentTime = () => {
	const day = new Date();
	const hour = day.getHours();
	return hour > 4 && hour < 11  ? '上午好' : hour >= 11 && hour < 13 ? '中午好' : hour >= 13 && hour < 18 ? "下午好" : hour >= 18 && hour <= 23 ? '晚上好' : '午夜好'
}

const pager = reactive({
	 page: 1,
	 size: isMobile.value ? 3 : 12
})

async function queryApps() {
	const res: ResData = await fetchQueryAppsAPI(pager)
	appList.value = res?.data?.rows.map((item: App) => {
	  	item.loading = false;
      return item;
	})
}


interface Emit {
  (ev: 'run', app: App): void
}

const emit = defineEmits<Emit>()
const appList = ref([]);

const handleRun = (data: App) => {
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
	<div style="height: 100%" class="w-full">

<!--    <div style="padding: 10px 0 0 0;height: 100%" class="suggest-container  w-full max-w-screen-2xl dark:bg-[#1A1D21] bg-[#fff]" :class="[isMobile ? '' : ' pt-4 px-6 pb-6 rounded-xl']">-->
    <div class="suggest-container  w-full max-w-screen-2xl dark:bg-[#1A1D21] bg-[#fff]" :class="[isMobile ? '' : ' pt-4 px-6 pb-6 rounded-xl']">

<!--      <div class="text-2xl flex items-start" v-if="!isMobile">-->
<!--        <h1 >Hi, {{getCurrentTime()}}, </h1>-->
<!--      </div>-->

<!--      <div class="flex justify-between items-center" v-if="!isMobile">-->
<!--        <p>我是你的专属AI伙伴，你可以试用快捷应用</p>-->

<!--        <div class="flex justify-between w-[230px]">-->

<!--          <n-button round :bordered="false" icon-placement="left" class="block dark:bg-[#282848] bg-[#F3F3F3] hover:bg-[#3076ED] hover:dark:bg-[#3076ED]"-->
<!--                    @click="handleRefresh">-->
<!--            <template #icon>-->
<!--              <SvgIcon class="text-lg" icon="mynaui:refresh"/>-->
<!--            </template>-->
<!--            <p class=" ">换一换</p>-->
<!--          </n-button>-->

<!--          <n-button :bordered="false" class=" bg-gradient-to-r from-[#3076ED] to-[#54A2F5] hover:bg-gradient-to-r dark:hover:text-white"-->
<!--                    round icon-placement="right" 	@click="appCenterStore.updateAppCenterDialog(true)">-->
<!--            <template #icon>-->
<!--              <SvgIcon class="text-lg text-white" icon="formkit:right"/>-->
<!--            </template>-->
<!--            <p class="text-white">更多应用</p>-->
<!--          </n-button>-->
<!--        </div>-->
<!--      </div>-->

      <div style="display: flex;flex-wrap: wrap;justify-content: space-between;height: 100%;background-color: transparent"  class="w-full overflow-hidden">

<!--        <div 	v-if="!appList.length">-->
<!--          <div class="mt-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-6">-->

<!--            <n-space vertical v-for="item in 12" class="border border-gray-200 dark:border-gray-600 rounded hover:bg-neutral-100-->
<!--							 dark:bg-[#3A3A5E] dark:hover:bg-[#24272e] px-4 py-2  pb-4">-->
<!--              <div class="flex justify-start items-center">-->
<!--                <n-skeleton round height="50px" width="20%"   class="mt-1" :sharp="false" />-->
<!--                <n-skeleton height="20px" width="20%"   class="mt-1 ml-4" :sharp="false" />-->
<!--              </div>-->

<!--              <n-skeleton height="40px" width="100%"  class="mt-1" :sharp="false" />-->

<!--              <div class="flex justify-between">-->
<!--                <n-skeleton height="20px" width="30%"   class="mt-1" :sharp="false" />-->
<!--                <n-skeleton height="20px" width="10%"   class="mt-1" :sharp="false" />-->
<!--              </div>-->
<!--            </n-space>-->
<!--          </div>-->
<!--        </div>-->

        <SuggestApps @run-app="handleRun" :list="appList"  v-if="!isMobile"></SuggestApps>

        <MobileApp @run-app="handleRun" :list="appList"  v-else></MobileApp>
      </div>

    </div>
	</div>
</template>
