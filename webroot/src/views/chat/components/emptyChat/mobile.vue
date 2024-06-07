<script setup lang="ts">
import {reactive, onMounted, ref} from 'vue';
import { NAvatar,  useMessage} from 'naive-ui';
import {useAuthStore, useChatStore} from '@/store';
import {ResData} from "@/api/types";
import {fetchQueryAppsAPI} from "@/api/appStore";
import {useBasicLayout} from "@/hooks/useBasicLayout";
const chatStore = useChatStore();
const authStore = useAuthStore();
const ms = useMessage();
const loading = ref(false);
const {isMobile} = useBasicLayout();

// 获取时间
const pager = reactive({
	 page: 1,
	 size: isMobile.value ? 3 : 8
})

async function queryApps() {
	const res: ResData = await fetchQueryAppsAPI(pager)
	appList.value = res?.data?.rows.map((item: any) => {
		item.loading = false;
    item.demoData = item.demoData?.split("\n").slice(0,3);
		return item
	})
}


interface Emit {
  (ev: 'run', app: { id: string, demoData: string }): void
}

const emit = defineEmits<Emit>()
const appList = ref([]);

const handleRun = (data: { id: string, demoData: string }) => {
  emit('run', data)
}

onMounted(() => {
	queryApps()
})


</script>

<template>
	<div class="w-full">
      <ul class="grid grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          <li v-for="item in appList">

							<div class="cursor-pointer" @click="handleRun(item)">
                  <NAvatar round :size="42" :src="item.coverImg"></NAvatar>
                  <p class="mb-4">{{item.name}}</p>
              </div>

							<p v-for="subItem in item.demoData" class="px-1 py-2 dark:bg-[#42425F] bg-[#f5f5f5] my-3 rounded cursor-pointer" @click="handleRun({id: item.id, demoData: subItem})">
									<span class="line-clamp-2 ">{{subItem}}</span>
							</p>
          </li>
      </ul>
	</div>
</template>
