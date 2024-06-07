<script setup lang="ts">
import {ref, computed, onBeforeMount} from 'vue'
import {SvgIcon, Reply} from "@/components/common";
import {useBasicLayout} from "@/hooks/useBasicLayout";
import {useRouter, useRoute} from 'vue-router'
import {MjMenu} from "@/views/midjourney/components/mj-menu";
const { isMobile } = useBasicLayout()

const activeRoutePath = computed(() =>  route.params.id)

const menuList = ref(MjMenu)

const router = useRouter();
const route = useRoute();


const handleClickMenu = (item: { menuPath: string }) => {
	router.push(item.menuPath)
}


</script>

<template>
	<div class="flex flex-col justify-between" :style="{height: 'calc(100% - 60px)'}">
		<div>
			<div v-for="item in menuList" :key="item.menuName" :class="isMobile ? 'mt-0' : 'mt-2'" @click="handleClickMenu(item)">
				<div class="h-12 w-full cursor-pointer rounded hover:dark:bg-[#262642] hover:bg-[#3144F1] hover:text-[#fff] duration-300 dark:bg-[#131323] "
						 :class="[item.menuPath.includes(activeRoutePath)  ? 'dark:bg-gradient-to-r dark:from-[#262642] dark:to-[#33334F] bg-gradient-to-r from-[#3144F1] to-[#7381FF]' : '']">
					<div class="flex h-full justify-center">
						<div class="m-auto text-center flex justify-between transition-all" :class="[item.menuPath.includes(activeRoutePath) ? 'text-[#fff] dark:text-[#fff] ' : '']" >
							<SvgIcon :icon="item.menuIcon" class="text-[16px] flex dark:text-[#fff] self-center mr-2 text-center" />
							<p class="mt-0.5 text-[15px]" >{{item.menuName}}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<Reply></Reply>
	</div>
</template>
