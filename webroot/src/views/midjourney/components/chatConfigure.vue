<script setup lang="ts">
import baiduThink from './baiduThink.vue'
import createInspiration from './createInspiration.vue'
import {NRadio, NSwitch, NTooltip} from "naive-ui";
import {SvgIcon} from "@/components/common";
import {ref, reactive} from "vue";
import {useBasicLayout} from "@/hooks/useBasicLayout";
const { isMobile } = useBasicLayout();
import Vip from '@/assets/icons/vip.png'
import {useAuthStore} from "@/store";
const { mjMode, mjTranslate, updateMjChatConfig, } = useAuthStore();


const radioGroup = ref([
	{label: "休闲模式", value: 2, icon: ""},
	{label: "快速模式 4积分", value: 1, icon: ""},
	{label: "Turbo模式", value: 3, icon: ""},
])

const form = reactive({
		mode: mjMode,  // 模式 fast 快速模式 relax 休闲模式
	  translate: mjTranslate, // 翻译
})

const thinkRef = ref()
const inspirationRef = ref()

const handleChange = (ev: { value: number; }) => {
  form.mode = ev.value;
  updateMjChatConfig(form)
}

const changeTranslate = (ev: number) => {
  form.translate = ev;
  updateMjChatConfig(form);
}

// 联想
const handleThink = () => {
  thinkRef.value.open()
}


// 咒语生成器
const handlePromptCreate = () => {
  inspirationRef.value.open()
}

</script>

<template>

  <baiduThink ref="thinkRef" ></baiduThink>

  <createInspiration ref="inspirationRef" ></createInspiration>

	<footer  class="footer-dialog">
		<div :class="['m-auto', isMobile ? 'px-2 py-1' : 'mt-4']">
			<ul class="flex justify-between">
				<li v-for="item in radioGroup" class="bg-[#F7F7F7] dark:bg-[#262643] rounded-3xl flex justify-start py-2 px-4 cursor-pointer" @click="handleChange(item)">
					<p class="mr-2  select-none"> {{item.label}}</p>
					<img :src="Vip" v-if="item.value === 2" class="w-[20px] h-auto mr-2"  alt="">
					<n-radio
						size="small"
						:checked="form.mode === item.value"
						:value="item.value"
						@change="handleChange(item)"
					>
					</n-radio>
				</li>
				<li class="bg-[#F7F7F7] dark:bg-[#262643] rounded-3xl flex items-center justify-start py-2 px-4">
          <NTooltip placement="top" trigger="hover">
            <template #trigger>
              <SvgIcon icon="ri:error-warning-line" class="text-[14px]"/>
            </template>
            <p>系统默认使用GPT翻译，所有中文都将自动翻译成英文，也可以直接输入翻译好的英文提示词，请在其他翻译里面选择翻译工具</p>
          </NTooltip>
          <p  class="mr-2 select-none" >自动翻译</p>
					<n-switch size="small" v-model:value="form.translate" :checked-value="1" :unchecked-value="0"  @update:value="changeTranslate(form.translate)"></n-switch>
				</li>
				<li class="bg-[#F7F7F7] dark:bg-[#262643] rounded-3xl flex justify-start py-2 px-4 cursor-pointer hover:bg-[#3144F1] hover:dark:bg-[#3144F1]" @click="handleThink">
					<p  class="mr-2  select-none">联想</p>
					<SvgIcon icon="mdi:head-sync-outline" class="w-[20px] h-full"></SvgIcon>
<!--					<n-switch  size="small" v-model="form.thought"></n-switch>-->
				</li>
				<li class="bg-[#F7F7F7] dark:bg-[#262643] rounded-3xl flex justify-start py-2 px-4 cursor-pointer hover:bg-[#3144F1] hover:dark:bg-[#3144F1]"
            @click="handlePromptCreate">
					<p  class="mr-2  select-none ">咒语生成器</p>
<!--					<n-switch  size="small" v-model="form.thought"></n-switch>-->
				</li>
			</ul>
		</div>
	</footer>
</template>

<style scoped lang="scss">

</style>
