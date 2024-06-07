<script setup lang="ts">
import {computed, ref, reactive} from 'vue'
import {NAvatar} from 'naive-ui'
import {useBasicLayout} from '@/hooks/useBasicLayout'
import {useAuthStore, useGptsStore} from '@/store'

interface Emit {
	(ev: 'run', app: string): void
}
const emit = defineEmits<Emit>()
const authStore = useAuthStore()
const gptsStore = useGptsStore()
const {isMobile} = useBasicLayout()

const groupInfo = computed(() => gptsStore.getChatByGroupInfo())
const showDemoList = computed(() => {

	if(!groupInfo.value || !groupInfo.value ) {
		return [];
	}

	if (groupInfo.value) {
		const demoData = groupInfo.value.demoData?.slice(0,4)

		let newArray: string[] = [];
		let newArray2: string[] = [];

		if (!demoData) return []

		demoData.forEach((item: string, index: number) => {
			index % 2 === 0 ? newArray.push(item): newArray2.push(item)
		})

		return [{children: newArray,}, {children: newArray2,}]
	}
})

const handleGo = (text: string) => {
	emit("run", text)
}
</script>

<template>
<!--应用列表有会话展示的组件-->
  <div :class="[isMobile ? 'mt-2' : '']" class="px-4 py-4 ">
<!--		<div style="display: flex;align-items: center" @click="returnPage">-->
<!--			<div>-->
<!--				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">-->
<!--					<path d="M5.71521 10H15.8828" stroke="#F4F4F4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--					<path d="M9.10441 13.3892L5.71521 9.99999L9.10441 6.61078" stroke="#F4F4F4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--				</svg>-->
<!--			</div>-->
<!--			<div style="font-size: 12px;margin-left: 10px">{{ groupInfo?.title }}</div>-->
<!--		</div>-->
    <div class="w-full md:min-w-[450px] flex justify-center items-center ">
      <div style="width: 85%" class=" text-center text-sm " :class="[isMobile ? 'w-full' : 'w-1/4 mt-4']">
        <NAvatar style="border-radius: 12px" :size="60" round :src="groupInfo?.logo"></NAvatar>
        <h2 class="mt-5 text-2xl  text-[17px]">{{ groupInfo?.title }}</h2>
        <p style="width: 100%" class="text-center mt-4 text-neutral-400 dark:text-[#484A4D] text-[#A3A5A6] text-[13px]">
          {{
            groupInfo?.desc || ""
          }}</p>
      </div>
    </div>
    <div class="md:min-w-[450px]">

      <div style="width: 100%" class="flex justify-center items-center " v-if="showDemoList.length"  :class="[isMobile ? 'mt-1' : 'mt-20']">
        <div style="width: 85%" :class="[isMobile ? 'w-full' : 'w-1/2']">
          <h2 class="dark:text-[#F4F4F4] text-[#03060C] text-[13px]" v-if="showDemoList.length">示例提问内容</h2>

          <div v-for="item in showDemoList" class="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
            <div v-for="subItem in item.children">
              <div style="border-radius: 8px" class="dark:bg-[#1C2635] bg-[#F5F8FE]  rounded mt-4 cursor-pointer" @click="handleGo(subItem)">
                <p class="text-md px-2.5 py-2 dark:text-[#2960BE] text-[#3378ED] text-center select-none text-[13px]" :class="[isMobile ? 'line-clamp-2 ' : 'line-clamp-1']">{{ subItem }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
