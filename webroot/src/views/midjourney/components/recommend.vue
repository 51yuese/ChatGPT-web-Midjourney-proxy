<script setup lang="ts">

import {SvgIcon} from "@/components/common";
import {ref} from 'vue'

const list = ref([]);

import logo from '@/assets/logo.png'
import {fetchQuerySuggest} from "@/api/mjDraw";
import defaultAvatar from "@/assets/avatar.png";
import {NAvatar} from "naive-ui";

const emit = defineEmits(['select'])

const showModal = ref(false)
const handleSelect = (data: { value: string, label: string }) => {
	emit("select", data);
	showModal.value = false;
}

const open = () => {
	showModal.value === false && (showModal.value = true);

  if (showModal.value) {
    handleQuerySuggest();
  }
}

const handleQuerySuggest = () => {
  fetchQuerySuggest({page: 1, size: 30}).then(res => {
    list.value = res.data.rows.map((item: { image: string; suggestCn: string; suggestEn: string; }) => {
      return {
        icon: item.image || logo,
        label: item.suggestCn,
        value: item.suggestEn
      }
    });
  })
}

const close = () => {
	showModal.value = false;
}

defineExpose({
	open,
	close
})

</script>

<template>
   <div v-if="showModal" class="absolute left-0 right-0 top-[-500px] bottom-0 bg-[#f0f0f0] m-auto dark:bg-[#3E3E64] overflow-hidden  w-full h-[400px] p-2 z-50 rounded">
		 <div class="flex justify-between">
				<h1>体验推荐关键词</h1>
			  <SvgIcon class="w-6 h-6 cursor-pointer hover:bg-[#666161] rounded" icon="iconamoon:close" @click="showModal = false"></SvgIcon>
		 </div>

		 <ul class="overflow-y-auto overflow-x-hidden w-full h-[360px] flex-col">
			 <li v-for="item in list" class="flex justify-start items-center mb-2 p-2 rounded cursor-pointer hover:bg-[#ddd] hover:dark:bg-[#2c2c4e]" @click="handleSelect(item)">
				  <div class="w-[44px] h-[44px]">
            <NAvatar :size="44"
                     :src="item.icon"
                     round
                     :bordered="false"
                     :fallback-src="logo"
                     class="cursor-pointer"
            />

<!--						<img class="w-full" :src="item.icon" alt="">-->
					</div>
				  <div class="ml-2">
						<h4 class="text-[16px]">{{item.label}}</h4>
						<p class="text-gray-400">{{item.value}}</p>
					</div>
			 </li>
		 </ul>
	 </div>

</template>

<style scoped lang="scss">

</style>
