<script setup lang="ts">
import {ref, computed, watch, onBeforeMount} from 'vue'
import {SvgIcon, Reply} from "@/components/common";
import {useBasicLayout} from "@/hooks/useBasicLayout";
import {useRouter, useRoute} from 'vue-router'
import {chatMenu} from "@/views/chat/components";
import {useChatStore} from "@/store";
const { isMobile } = useBasicLayout();
const chatStore = useChatStore();

const activeRoutePath = computed(() => route.params.id)
// const activeRouteAppId = computed(() => route.query.appId)
// const routeQuery = computed(() => route.query)

const menuList = ref(chatMenu)

const router = useRouter();
const route = useRoute();

const handleClickMenu = (item: { menuPath: string }) => {
	router.push(item.menuPath)
  if (item.menuPath.includes('hot-app')) {
    chatStore.addNewChat()
  }
}


</script>

<template>
	<div class="flex flex-col justify-between p-3 sm:pt-2 bg-[#f8f8f8] dark:bg-[#131323] overflow-y-auto w-full sm:w-[16rem] shrink-0 border-r-1 border-[#ffffff17]" :style="{height: 'calc(100% - 60px)'}">
		<div>
			<div v-for="item in menuList" :key="item.menuName" :class="isMobile ? 'mt-0' : 'mt-2'" @click="handleClickMenu(item)">
				<div class="h-12 w-full cursor-pointer rounded hover:dark:bg-gradient-to-r dark:from-[#262642] dark:to-[#33334F] from-[#3144F1] to-[#7381FF] hover:bg-gradient-to-r hover:text-[#fff] "
						 :class="[item.menuPath.includes(activeRoutePath)  ? 'dark:bg-gradient-to-r dark:from-[#262642] dark:to-[#33334F] bg-gradient-to-r from-[#3144F1] to-[#7381FF]' : '']">
					<div class="flex h-full justify-center">
						<div class="m-auto text-center flex justify-between transition-all"
                 :class="[item.menuPath.includes(activeRoutePath) ? 'text-[#fff] dark:text-[#fff] ' : '']" >
							<SvgIcon :icon="item.menuIcon" class="text-[16px] flex dark:text-[#fff] self-center mr-2 text-center" />
							<p class="mt-0.5 text-[15px] select-none" >{{item.menuName}}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<Reply></Reply>
	</div>
</template>


