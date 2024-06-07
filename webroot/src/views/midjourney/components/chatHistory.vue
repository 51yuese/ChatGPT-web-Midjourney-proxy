<script setup lang="ts">
import {useAuthStore} from "@/store";
import {computed,} from "vue";
import taskItem from './taskItem.vue'
import {NAvatar} from "naive-ui";

import {utcToShanghaiTime} from "@/utils/date";
import defaultAvatar from "@/assets/avatar.png";
const props = defineProps (
    {
      task: {type: Object, required: true},
    }

  );
const currentTask = computed(() => props.task);
const authStore = useAuthStore();
const avatar = computed(() => authStore.userInfo.avatar)
const emit = defineEmits(['refresh'])
const handleRefresh = (data) => {
	emit("refresh",data)
}
</script>

<template>
		<div class="flex  flex-col" style="width: 100%;">
      <!-- <div class="flex items-center mb-4 mt-2">
        <NAvatar :size="42" :src="avatar" round bordered :fallback-src="defaultAvatar" class="cursor-pointer"   />
        <h2 class="mx-2 flex text-[16px] bg-[#F7F7F7] rounded px-2.5 py-1.5 dark:bg-[#313155]">{{ currentTask.mode === 1 ? '快速模式' : currentTask.mode === 2 ? '休闲模式' : currentTask.mode === 3 ? 'Turbo模式' : '模式错误' }}</h2>
        <p class="text-[14px]">{{utcToShanghaiTime(currentTask.createdAt)}}</p>
      </div> -->

			<div class=" h-auto flex-1">
        <taskItem :task="currentTask" chat="chat-history" @fresh="handleRefresh"></taskItem>
			</div>
		</div>
</template>

<style scoped lang="scss">

</style>
