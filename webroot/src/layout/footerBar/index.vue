<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, onBeforeMount, ref } from 'vue'
import { SvgIcon } from '@/components/common'
import { useAuthStore, useGlobalStoreWithOut } from '@/store'
import { fetchQueryMenuAPI } from '@/api/config'
import { useMessage } from 'naive-ui'

interface MenuItem {
	id: number
	menuName: string;
	menuPath: string;
	menuIcon: string;
	menuTipText: string;
	menuIframeUrl: string;
	isJump: boolean;
	isNeedAuth: boolean
}
const menuListData = ref<MenuItem[]>([])
const message = useMessage()

async function queryMenu(){
	const res: any = await fetchQueryMenuAPI({ menuPlatform: 0})
	if(!res.success) return;
	menuListData.value = res.data;
	console.log(menuListData.value);
}
const useGlobalStore = useGlobalStoreWithOut()
const router = useRouter()
const route = useRoute()
const activePath = computed(() => route.path)
const authStore = useAuthStore()
const iframeSrc = computed(() => useGlobalStore.iframeUrl)


const isLogin = computed(() => authStore.isLogin)
const clientMenuList = authStore.globalConfig?.clientMenuList;

const list = [
  { name: 'Chat', title: 'AI聊天', icon: 'ri:message-3-line' },
  // { name: 'Draw', title: '基础绘画', icon: 'fluent:draw-image-24-regular' },
  { name: 'AppStore', title: '应用广场', icon: 'ant-design:appstore-outlined' },
  { name: 'GPTS', title: 'GPTS', icon: 'tdesign:letters-g' },
  { name: 'Midjourney', title: '专业绘画', icon: 'ri:landscape-line' },
  { name: 'Mind', title: '思维导图', icon: 'icon-park-outline:mindmap-map' },
  { name: 'UserCenter', title: '个人中心', icon: 'ri:account-pin-box-line' },
]

const menuList = computed(() => {
  const openMenuList = clientMenuList ? JSON.parse(clientMenuList) : ['Chat', 'Draw',  'GPTS', 'Midjourney']
  return [...list.filter(item => openMenuList.includes(item.name)), { name: 'UserCenter', title: '我的', icon: 'ri:account-pin-box-line' }]
})

function handleToPage(menu: MenuItem) {

	const { menuPath, isJump, menuIframeUrl, isNeedAuth } = menu;

	// if(isNeedAuth && !isLogin.value){
	// 	message.warning('请先登录后访问！')
	// 	authStore.setLoginDialog(true)
	// 	return;
	// }


  useGlobalStore.updateIframeUrl('')
	if(menuPath){
		return router.push({path: menuPath})
	}else{
		if(isJump){
			window.open(menuIframeUrl)
		}else{
			useGlobalStore.updateIframeUrl(menuIframeUrl)
			router.push({ path: '/extend' })
		}
	}
}

onBeforeMount(() => {
	queryMenu()
})
</script>

<template>
  <footer class="bg-white dark:bg-[#252541]">
    <div class="grid border-t py-1 dark:border-t-neutral-800 grid-cols-2" :style="{	gridTemplateColumns: `repeat(${menuListData.length}, minmax(0, 1fr))` }">
      <a v-for="(item) in menuListData" :key="item.id" :class="[activePath.includes(item.menuPath)  || iframeSrc === item.menuIframeUrl ? 'text-[#3076fd] dark:text-[#3076fd]' : '']" class="cursor-pointer text-center leading-4 " @click="handleToPage(item)">
        <span class="inline-block text-xl">
          <SvgIcon :icon="item.menuIcon" class="mb-1 inline-block text-lg" /></span>
        <p class="text-xs">{{ item.menuTipText }}</p>
      </a>
    </div>
  </footer>
</template>
