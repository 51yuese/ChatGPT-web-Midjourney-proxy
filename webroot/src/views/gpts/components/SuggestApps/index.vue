<script setup lang="ts">

import {NButton, useMessage} from "naive-ui";
import {SvgIcon} from "@/components/common";
import {useBasicLayout} from "@/hooks/useBasicLayout";
import {App} from "@/views/appStore/components/helpter";
import {computed} from "vue";
import {useAppCatStore} from "@/store";
import {ResData} from "@/api/types";
import {fetchCollectAppAPI} from "@/api/appStore";
import {fetchQueryModelsListAPI} from "@/api/models";
import {useRouter} from "vue-router";
const appCatStore = useAppCatStore();
const {isMobile} = useBasicLayout()
const ms = useMessage()
const router = useRouter()

interface Emit {
  (ev: 'run-app', app: App): void
}

const emit = defineEmits<Emit>()
defineProps({
	list: {
		type: Array,
		required: true,
		default: () => ([])
	}
})


/* 加入取消收藏 */
async function handleCollect(app: App) {
  app.loading = true
  try {
    const res: ResData = await fetchCollectAppAPI({ appId: app.id })
    ms.success(res.data)
    await appCatStore.queryMineApps()
    app.loading = false
  }
  catch (error) {
    app.loading = false
  }
}

async function handleRunApp(app: App) {
  const res: any = await fetchQueryModelsListAPI()
  const { modelMaps } = res.data
  if(!modelMaps[1]){
    return ms.warning('管理员未配置特定应用模型、请联系管理员配置~')
  }

  // await router.push({ path: '/chat/chat-app', query: { appId: app.id, } })
  emit('run-app', app)
}

const mineApps = computed(() => appCatStore.mineApps)
const isMineApp = (app: App) => {
	return mineApps.value.some((item: any) => item.appId === app.id)
}

</script>

<template>
	<div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 pt-4 pb-2"
			 :class="isMobile ? 'px-4' : 'overflow-y-scroll'">

		<div v-for="item in list" :key="item.id"
				 class="dark:bg-[#3A3A5E] bg-[#FFFFFF] custom-card cursor-pointer p-4 pt-2
				  rounded-md flex flex-col justify-center items-center
				  border border-gray-300 dark:border-gray-600
				  hover:bg-neutral-100 dark:hover:bg-[#24272e] select-none max-h-[170px]"
				 >
			<div class="w-full h-16 flex items-center">
          <span class="w-14 h-14 flex justify-center items-center rounded-md shadow-md mr-3 border border-[#00000014]">
            <img :src="item.coverImg" class="w-12 h-12 mb-1" alt="">
          </span>
				<span class="text-base font-bold text-left  mb-1 text-[#333] dark:text-[#ffffff85] text-ellipsis overflow-hidden">{{ item.name }}</span>
			</div>

			<p class="w-full mb-1 text-left text-[#999999] text-xs py-2">
				{{ item.des }}
			</p>

			<div class="w-full flex justify-between ">

        <div class="w-full flex justify-between ">

          <NButton size="tiny" :bordered="false"  ghost :disabled="item.loading" @click.stop="handleCollect(item)">
            <template #icon>
              <SvgIcon :icon="isMineApp(item) ? 'clarity:favorite-solid' : 'clarity:favorite-line'" class="text-base" />
            </template>
          </NButton>

          <NButton size="tiny" secondary  round   :disabled="item.loading"  @click.stop="handleRunApp(item)">
            <template #icon>
              <SvgIcon icon="icon-park-outline:send" class="text-base" />
            </template>
            尝试指令
          </NButton>

        </div>
			</div>
		</div>

	</div>
</template>

<style scoped lang="scss">

</style>
