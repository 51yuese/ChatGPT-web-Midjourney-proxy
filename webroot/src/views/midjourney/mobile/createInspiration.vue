<script setup lang="ts">
import {NModal, NTabPane, NTabs} from 'naive-ui'
import {computed, reactive, ref, onMounted} from 'vue'
import {fetchAllIncantationClassify, fetchQueryIncantation} from "@/api/mjDraw";
import {useAuthStore} from "@/store";


const selectIncantation = ref(''); // 选中的咒语
const authStore = useAuthStore();

const showDialog = computed(() => authStore.inspirationDialog)


const listData = reactive({
	level1: [],
	level2: []
})

const mode = ref(0)
const handleChange = async (ev: number) => {
  mode.value = ev;
  listData.level2 = await fetchQueryIncantation({id: ev}).then(res => res.data.rows)
}

const handleGoPrompt = () => {
  authStore.updatePromptWords({prompt: selectIncantation.value});
  authStore.updateInspireDialog(false)
}

// 查询所有的分类
const handleQueryAllInspiration = async () => {

	const classify = await fetchAllIncantationClassify({level: 0}).then(res => res.data)
	const {level1} = classify;
  await handleChange(level1[0].id)

	Object.assign(listData, {level1})
}

const handleSelect = (item: { incantationEn: string }) => {
	selectIncantation.value.includes(item.incantationEn) ? selectIncantation.value = selectIncantation.value.replace(item.incantationEn + ',', "") : selectIncantation.value += item.incantationEn + ','
}

const handleClose = () => {
   authStore.updateInspireDialog(false);
}


onMounted(() => {
  handleQueryAllInspiration();
})

</script>
<template>

	<n-modal v-model:show="showDialog"
					 style="width: 100vw;max-width: 100vw; height: 100vh"
					 preset="dialog"
					 title="咒语生成器"
					 :close-on-esc="false"
					 :mask-closable="false"
					 :show-icon="false"
           @close="handleClose"
	>

		<div class="flex justify-between">
			<div class="mr-2 w-full">
				<n-tabs
					v-model:value="mode"
					type="card"
					animated
					trigger="click"
					tab-style="min-width: 90px; text-align: center;"
					@update:value="handleChange"
				>
					<n-tab-pane v-for="panel in listData.level1"
                      :key="panel.id"
                      :tab="panel.classifyName"
											:name="panel.id"></n-tab-pane>
				</n-tabs>

				<div class="dark:border-gray-600 border  h-[470px] min-h-[470px] overflow-y-auto overflow-x-hidden">
					<ul class="p-2">
						<li v-for="item in listData.level2">
							<div class="mb-2">
								<span class="level-classify text-[15px] py-2 pt-2">{{ item.classifyName }}</span>
							</div>

							<div class="my-1" v-if="item.children.length > 0">
								<div v-for="subItem in item.children" :key="subItem.id"
										 class="inline-block rounded mr-2 mb-2 text-[12px] dark:bg-[#313155] bg-[#A0A0A0] py-[2px] px-[6px]"
										 @click="handleSelect(subItem)"
										 :class="[selectIncantation.includes(subItem.incantationEn) ? 'dark:bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-50% to-emerald-500 to-90% bg-[#3C4EBF]' : '']">
									<button class="select-none text-white">{{ subItem.incantationCn }} {{ subItem.incantationEn }}
									</button>
								</div>
							</div>
						</li>
					</ul>
				</div>
			</div>

			<div class="w-full h-full  flex flex-col">

				<div class="dark:bg-[#1C1C34] dark:border-gray-600 border bg-[#F7F7F7] h-[470px] rounded p-2">
					<p>{{ selectIncantation }}</p>
				</div>

				<div @click="handleGoPrompt" class="rounded-full flex items-center justify-center
				 mt-2 w-full h-[28px] cursor-pointer dark:bg-gradient-to-r dark:from-[#3144F1] dark:to-[#01C0F9]  bg-gradient-to-r from-[#3144F1] to-[#01C0F9]">
					<p class="dark:text-white text-white">前往制作</p>
				</div>

			</div>


		</div>
	</n-modal>
</template>

