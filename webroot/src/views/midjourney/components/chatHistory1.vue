<script setup lang="ts">
import {useAuthStore} from "@/store";
import {computed,} from "vue";
import taskItem1 from './taskItem.vue'
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
const handleRefresh = () => {
	emit("refresh")
}
</script>

<template>
		<div class="flex  flex-col" style="width: 100%;">
			<div class="w-[1200px] rounded bg-[#F7F7F7] dark:bg-[#313155] h-auto flex-1" style="width: 100%;">
        <taskItem1 :task="currentTask" chat="chat-history" @fresh="handleRefresh"></taskItem1>
			</div>
		</div>
</template>

<style scoped lang="scss">

</style>
