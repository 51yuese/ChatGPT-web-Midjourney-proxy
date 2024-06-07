<script setup lang="ts">
import {onMounted, ref, reactive} from 'vue'
import {NButton, NSkeleton, NSpace, useMessage} from 'naive-ui'
import {SvgIcon} from "@/components/common";
import {ImageData} from "@/views/midjourney/components/mj-menu";
import {fetchMidjourneySuggestList} from "@/api/mjDraw";
import {useAuthStore} from "@/store";
import EventBus from '@/hooks/eventBus';
const ms = useMessage()
const {updatePromptWords} = useAuthStore();
const pager = reactive({
  size: 5,
  page: 1,
})
const imageList = ref<ImageData[]>([])

async function queryDrawImg() {
	const list  = await fetchMidjourneySuggestList(pager).then(res => res.data || [])
  if (!list.length) {
     pager.page = 1;
     ms.warning("备选图片不足，请前往后台添加")
     return
  }
  imageList.value = list;
}

async function handleRefresh() {
  pager.page +=1;
  await queryDrawImg();
}

const handlePrompt = (item: { isCarryParams: boolean, aspect: string, status: boolean, prompt: string }) => {
  const {isCarryParams, aspect, prompt, status } = item;
  const prompts = isCarryParams && status ? `${prompt}  --ar ${aspect}` : `${prompt}`
  updatePromptWords({prompt: prompts});
  EventBus.emit("prompts",prompts)
}

queryDrawImg();
</script>

<template>
	<div class="start-mj w-full rounded-3xl p-6 py-8 dark:bg-[#010102] bg-[#F4F4F4] h-full" style="width: 100%;">
		<div class="flex justify-between">
			<div>
				<h1 class="text-[34px]">您好,请创作您的第一个作品吧！</h1>
				<p class="text-[14px] text-[#aaa]">我是您的专属AI伙伴，您可以尝试使用快捷提示，体验一下！</p>
			</div>

			<!-- <n-button round icon-placement="left" @click="handleRefresh">
				<template #icon>
					<SvgIcon class="text-lg" icon="mynaui:refresh"/>
				</template>
				换一换
			</n-button> -->
      <div class="bg-[#3378ED] dark:bg-[#2960BE]" @click="handleRefresh"style="color: #fff;display: flex;height: 36px;padding: 0 12px;align-items: center;border-radius: 8px;cursor: pointer;">
          <!-- <template #icon> -->
					  <SvgIcon class="text-lg" icon="mynaui:refresh"/>
				  <!-- </template> -->
				  换一换
      </div>
		</div>

		<div class="body mt-4 h-full">
			<ul class="flex justify-between h-full min-h-[400px]">
					<template v-if="!imageList.length">
              <li  v-for="_ in 5">
                  <div class="bg-[#F7F7F7] relative dark:bg-[] w-[14rem] rounded-3xl overflow-hidden  ">
                      <n-space vertical >
                          <n-skeleton height="400px" width="100%" :sharp="false" />
                      </n-space>
                  </div>
              </li>
          </template>

				<li v-for="item in imageList" class="bg-[#F7F7F7] relative dark:bg-[] w-[14rem] h-[400px] rounded-3xl overflow-hidden mr-2 ml-2">

          <div class="absolute left-2 bottom-28 z-30">
            <p class="leading-0 text-white line-clamp-2">{{item.title}}</p>
          </div>

          <img loading="lazy" :src="item.imageUrl"
							 class="cursor-pointer bg-gray-500 duration-300 transition-all hover:scale-110" alt="">

          <div  class="absolute cursor-pointer text-white dark:text-[#fff] dark:bg-[rgba(0,0,0,.6)] px-2 py-1 bg-[rgba(0,0,0,.6)] right-4 bottom-6 z-10 rounded-full flex justify-start items-center" @click="handlePrompt(item)">
            <SvgIcon icon="icon-park-outline:send" />
            <p class="select-none ml-2">一键制作</p>
          </div>

				</li>
			</ul>
		</div>

	</div>
</template>
