<script lang="ts" setup>
import {useRoute, useRouter} from 'vue-router'
import SendInspireSquire from './components/sendInspireSquire.vue'
import CustomZoom from './components/customZoom.vue'
import RegionModal from './components/regionModal.vue'
import RemixModal from './components/remixModal.vue'
import {useBasicLayout} from '@/hooks/useBasicLayout'
import {NTabPane, NTabs} from "naive-ui";
import {computed} from "vue";

const queryId = computed(() => route.path);
const {isMobile} = useBasicLayout();
const router = useRouter();
const route = useRoute();
const tabs = [
	{id: '/midjourney/text-to-image', name: "文生图"},
	{id: '/midjourney/image-to-text', name: "图生文"},
	{id: '/midjourney/image-mix-image', name: "图混图"},
	{id: '/midjourney/inspiration', name: "灵感广场"},
	{id: '/midjourney/paint-task', name: "绘画任务"},
];

const handleChangeTab = (item: string) => {
	router.push(`${item}`)
}

</script>

<template>

  <!-- 自定义缩放  -->
  <CustomZoom></CustomZoom>

 <!-- remix modal-->
  <RemixModal></RemixModal>

 <!-- remix modal-->
  <RegionModal></RegionModal>

  <!-- 发送到灵感广场  -->
  <SendInspireSquire></SendInspireSquire>

  <div v-if="isMobile">
		<div class="relative px-2  top-0 w-full" >
			<n-tabs
				class="mt-1"
				justify-content="space-around"
				type="line"
				tab-style="line"
				v-model:value="queryId"
				size="small"
				animated
				pane-wrapper-style="margin: 0 -4px"
				pane-style="padding: 0 4px 0 4px; box-sizing: border-box;"
				@update-value="handleChangeTab"
			>
				<n-tab-pane :name="item.id" :tab="item.name" v-for="item in tabs"></n-tab-pane>
			</n-tabs>
		</div>
		<div class="mj-content w-full h-full overflow-hidden">
			<RouterView/>
		</div>
	</div>

	<div class="grow flex h-screen flex-col lg:pt-0" v-if="!isMobile" style="background-color: #171726;">

		<div class="flex grow flex-col sm:flex-row h-full">

			<!-- 中间绘图区域 -->
			<div class="mj-content w-full bg-[#F4F4F4] dark:bg-[#010102]">
				<RouterView/>
			</div>
		</div>
	</div>
</template>

