<script setup lang="ts">
import {computed, ref, onBeforeUnmount} from 'vue'
import textConfigure from '../components/configure.vue'
import chatMessage from './chatMessage.vue'
import createInspiration from './createInspiration.vue'

import {useAuthStore} from "@/store";
import {fetchGetDraw} from "@/api/mjDraw";
import {useRoute} from "vue-router";
const auth = useAuthStore();
const route = useRoute();

const taskId = computed(() => auth.drawId);
const fullPath = computed(() => route.path);

// 获取当前绘图任务
const handleGetCurrentDraw = async (id: number) => {
	if (!id) {
		return;
	}

	currentTask.value =  await fetchGetDraw({id}).then(res => res.data)
  drawTimer.value && (currentTask.value.status >= 4) && clearTimeout(drawTimer.value);
}



const currentTask = ref({})
const drawTimer = ref();


</script>

<template>

  <createInspiration ref="inspirationRef" ></createInspiration>

  <div class="text-image-container flex flex-row">
		<div class="w-full pt-2 flex flex-col justify-between" >
      <chatMessage v-if="fullPath.includes('text-to-image')" ></chatMessage>
      <textConfigure ref="configRef"></textConfigure>
		</div>
	</div>
</template>


