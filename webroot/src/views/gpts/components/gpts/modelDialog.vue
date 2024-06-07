<script setup lang='ts'>
import {
	NCountdown,
	NIcon,
	NImage,
	NModal,
	NSkeleton,
	NSpin,
	useMessage,
	NInput,
	NSelect,
	NCascader,
	NCollapse,
	NCollapseItem,
	NButton,
	NSlider,
	NTooltip,
	NTag,
} from 'naive-ui'
import {ref, onMounted, computed, watch, h} from 'vue'
import {CloseOutline, SettingsOutline} from '@vicons/ionicons5'
import {fetchQueryModelsListAPI} from '@/api/models'
import {useAuthStore, useGlobalStoreWithOut, useChatStore, useAppStore, useGptsStore} from '@/store'
import {isNullObject} from "@/utils/is";
import {fetchUpdateAppGroupAPI} from "@/api/appStore";

// defineProps<Props>()

interface ModelType {
	label: string
	val: number
}

const ms = useMessage()
const useGlobalStore = useGlobalStoreWithOut()
const authStore = useAuthStore()
// const chatStore = useChatStore()

const gptsStore = useGptsStore()

const loading = ref(false)
const appStore = useAppStore();
const theme = computed(() => appStore.theme)


/* 当前对话组的配置信息 */
const activeConfig = computed(() => gptsStore.activeConfig)
/* 当前选中的对话组id */
const activeGroupId = computed(() => gptsStore.active)

const modelDialog = computed(() => useGlobalStore.appModelDialog)


/* 当前对话组的详细信息 */
// const activeGroupInfo = computed(() => gptsStore.groupList.find((item: any) => item.uuid === activeGroupId.value))

/* 不是openai的模型暂时不让设置预设 */
const disabled = computed(() => {
	return Number(activeConfig.value?.modelTypeInfo?.val) !== 1 || Number(activeGroupId.value) > 0
})

/* 温度 */
const maxTemperature = computed(() => {
	return Number(gptsStore.activeModelKeyType) === 1 ? 1.2 : 1
})

/* 当前的对话组id */
const chatGroupId = computed(() => gptsStore.active)

watch(activeConfig, (val) => {
	if (!val) return;
	compilerConfig(val)
})

const maxModelTokens = ref(0)
const maxResponseTokens = ref(0)
const topN = ref(0.8)
// const modelTypes = ref<ModelType[]>([])
const model = ref('')
const systemMessage = ref('')
const maxRounds = ref()
const rounds = ref(8)

// 当前选择的模型
const selectModel = ref("")
// interface Props {
// 	visible: boolean
// }


const message = useMessage()
const showResetBtn = ref(false)

let modelMapsCache: any = ref({})
let modelTypeListCache: any = ref([])

onMounted(() => {
	queryModelsList()
	if (activeConfig.value != null){
		selectModel.value =  activeConfig.value.modelInfo.modelName
	}
})

function compilerConfig(val: any) {
	const {modelInfo, modelTypeInfo} = val
	if (!modelInfo || !modelTypeInfo) return;
	maxModelTokens.value = modelInfo.maxModelTokens
	maxResponseTokens.value = modelInfo.maxResponseTokens
	topN.value = modelInfo.topN
	systemMessage.value = modelInfo.systemMessage
	model.value = `${modelTypeInfo.val}----${modelInfo.model}`
	maxRounds.value = modelInfo.maxRounds
	rounds.value = modelInfo.rounds > modelInfo.maxRounds ? modelInfo.maxRounds : modelInfo.rounds
}

/* 应用只可以使用openai模型 */
const options = computed(() => {

	const data = !activeGroupId.value ? modelTypeListCache : modelTypeListCache.filter((item: any) => Number(item.val) === 1)
	const arr: any[] = [];
	data.forEach((item: any) => {
		const {val} = item
		modelMapsCache[val].forEach((item: any) => {
			const {model, modelName, description} = item
			arr.push({
				label: modelName,
				deduct: item.deduct,
				desc: description,
				deductType: item.deductType,
				value: `${val}----${model}`
			})
		})
	})
	return arr;
	// return data.map((item: any) => {
	// 		const { label, val } = item
	// 		return {
	// 			label,
	// 			value: val,
	// 			children: modelMapsCache[val].map((item: any) => {
	// 				const { model, modelName } = item
	// 				return {
	// 					label: modelName,
	// 					value: `${val}----${model}`
	// 				}
	// 			})
	// 		}
	// 	})
})

// 获取对话模型
async function queryModelsList() {

	try {
		const res: any = await fetchQueryModelsListAPI()
		if (!res.success) return

		const {modelMaps, modelTypeList} = res.data
		let obj: any = {}
		if (modelMaps) {
			for (let i in modelMaps) {
				obj[i] = modelMaps[i].filter((subItem: { model: string; }, index: number) => modelMaps[i].findIndex((t: { model: string; }) => t.model === subItem.model) === index)
			}
		}
		// console.log(res.data)
		modelMapsCache = obj;
		modelTypeListCache = modelTypeList
		// modelTypes.value = modelTypeList;

		// const typeValue = modelTypes.value[0].val
		/* 设置默认为第一项 使用 ---- 分割  前面是 模型类型 后面是模型的名称  */
		// model.value = `${modelTypes.value[0].val}----${modelMaps[typeValue][0].model}`
	} catch (error) {
		console.log('error: ', error);
	}
}

function openDialog() {
	queryModelsList()
}

async function handleReset() {
	const config = gptsStore.baseConfig
	compilerConfig(config)
}

function handleUpdate(val: any) {
	showResetBtn.value = val.includes('1')
}

/* 获取模型的单项信息 */
function getModelTypeInfo(type: any) {
	return modelTypeListCache.find((item: any) => item.val === type)
}

/* 获取模型名称 */
function getModelDetailInfo(type: any, model: any) {
	return modelMapsCache[type].find((item: any) => item.model === model);
}
defineExpose({handleUpdateConfig})

/* 修改对话组模型配置 */
async function handleUpdateConfig() {

	if (!activeConfig.value || isNullObject(activeConfig.value)) {
		ms.warning("当前未选中对话，请选中任意一个对话组后重试！")
		return;
	}

	const [type, m] = model.value.split('----')

	const {maxModelTokens} = activeConfig.value?.modelInfo

	const selectModelInfo = getModelDetailInfo(type, m)

	const {modelName, deductType, deduct, maxRounds, canAudio, canUpload} = selectModelInfo
	const config = {
		modelInfo: {
			canAudio,
			canUpload,
			keyType: type,
			modelName,
			model: m,
			maxModelTokens: maxModelTokens,
			maxResponseTokens: maxResponseTokens.value,
			systemMessage: systemMessage?.value,
			topN: topN.value,
			deductType,
			deduct,
			maxRounds,
			rounds: rounds.value
		},
		modelTypeInfo: getModelTypeInfo(type)
	}

	const params = {
		groupId: chatGroupId.value,
		config: JSON.stringify(config)
	}

	try {
		loading.value = true
		await fetchUpdateAppGroupAPI(params)
		loading.value = false
		message.success('修改当前对话组自定义模型配置成功！')
		await gptsStore.queryMyGroup()
		useGlobalStore.updateAppModelDialog(false)
	} catch (error) {
		loading.value = false
	}
}

function renderLabel(option: { value?: string | number; label?: string }) {
	return () => h(NTooltip, {placement: 'bottom', trigger: 'hover'},
		[
			h(
				'template',
				{slot: 'trigger'},
				h('span', null, option.label)
			),
			h(
				'span',
				null,
				option.label
			)
		]
	);
}


function handleCloseDialog() {
	showResetBtn.value = false
}

// 监听对话模型改变事件
function changModelItemClick(label, value) {
	selectModel.value = label
	model.value = value
}
</script>

<template>
	<!--		<NModal :show="visible" style="width: 90%; max-width: 650px" :on-after-enter="openDialog"-->
	<!--			:on-after-leave="handleCloseDialog">-->

	<!--			<div class="py-3 px-5  rounded dark:bg-[#2D2D4F] bg-white">-->
	<!--				<div class="absolute top-3 right-3 cursor-pointer" @click="useGlobalStore.updateModelDialog(false)">-->
	<!--					<NIcon size="20" :color="theme === 'dark' ? '#fff' : '#333'">-->
	<!--						<CloseOutline />-->
	<!--					</NIcon>-->
	<!--				</div>-->
	<!--				<div class="flex font-bold mb-[20px] bg-currentflex items-center ">-->
	<!--					&lt;!&ndash;				<NIcon size="24" color="#0e7a0d">&ndash;&gt;-->
	<!--					&lt;!&ndash;					<SettingsOutline />&ndash;&gt;-->
	<!--					&lt;!&ndash;				</NIcon>&ndash;&gt;-->
	<!--					<span class="text-lg">模型个性化</span>-->
	<!--				<div class=" pb-4">-->
	<!--					<div class="pb-1">自定义角色预设</div>-->
	<!--					<n-input v-model:value="systemMessage" type="textarea" :disabled="disabled"-->
	<!--						placeholder="自定义头部预设、给你的AI预设一个身份、更多有趣的角色请前往「应用广场」..." />-->
	<!--				</div>-->

	<!--			</div>-->
	<!--				<div class="flex justify-between items-center mt-6">-->
	<!--					<span class="font-bold">模型选用</span>-->
	<!--					<div style="width: 240px;">-->

	<!--						&lt;!&ndash; <n-cascader class="w-full" v-model:value="model"-->
	<!--												placeholder="请选用当前聊天组所需的模型！"-->
	<!--												expand-trigger="click"-->
	<!--											  	:options="options"-->
	<!--												check-strategy="child"-->
	<!--												:show-path="true"-->
	<!--												:filterable="true" /> &ndash;&gt;-->
	<!--						<NSelect v-model:value="model" class="w-full" placeholder="请选用当前聊天组所需的模型！" :options="options"-->
	<!--							:filterable="true">-->
	<!--						</NSelect>-->
	<!--					</div>-->
	<!--				</div>-->

	<!--				<div class="mt-5 bg-[#fafbfc] px-2 py-2  dark:bg-[#2D2D4F]">-->
	<!--					<n-collapse default-expanded-names="" accordion :on-update:expanded-names="handleUpdate">-->
	<!--						<n-collapse-item name="1">-->
	<!--							<template #header>-->
	<!--								<div>-->
	<!--									高级配置-->
	<!--									<span class="text-xs text-neutral-500">（不了解不需要修改）</span>-->
	<!--								</div>-->
	<!--							</template>-->
	<!--							<template #header-extra>-->
	<!--								<div @click.stop="handleReset">-->
	<!--									<NButton text type="error" v-if="showResetBtn">-->
	<!--										重置-->
	<!--									</NButton>-->
	<!--								</div>-->
	<!--							</template>-->
	<!--							<div class="mt-2">-->
	<!--								<div>-->
	<!--									<div class=" w-full flex justify-between">-->
	<!--										<span class="w-[150px]">话题随机性</span>-->
	<!--										<div class="flex w-[200px] items-center">-->
	<!--											<n-slider v-model:value="topN" :step="0.1" :max="maxTemperature" />-->
	<!--											<span class="w-[55px] text-right">-->
	<!--												{{ topN }}-->
	<!--											</span>-->
	<!--										</div>-->
	<!--									</div>-->
	<!--									<div class="mt-2 text-xs text-slate-500 dark:text-slate-400">较高的数值会使同问题每次输出的结果更随机</div>-->
	<!--								</div>-->
	<!--								<div class="mt-4">-->
	<!--									<div class=" w-full flex justify-between">-->
	<!--										<span class="w-[150px]">回复Token数</span>-->
	<!--										<div class="flex w-[200px] items-center">-->
	<!--											<n-slider v-model:value="maxResponseTokens" :step="100" :max="maxModelTokens" />-->
	<!--											<span class="w-[55px] text-right">-->
	<!--												{{ maxResponseTokens }}-->
	<!--											</span>-->
	<!--										</div>-->
	<!--									</div>-->
	<!--									<div class="mt-2 text-xs text-slate-500 dark:text-slate-400">单条回复数，但也会消耗更多的额度</div>-->
	<!--								</div>-->
	<!--								<div class="mt-4">-->
	<!--									<div class=" w-full flex justify-between">-->
	<!--										<span class="w-[150px]">关联上下文数量</span>-->
	<!--										<div class="flex w-[200px] items-center">-->
	<!--											<n-slider v-model:value="rounds" :step="1" :max="maxRounds" />-->
	<!--											<span class="w-[55px] text-right">-->
	<!--												{{ rounds }}-->
	<!--											</span>-->
	<!--										</div>-->
	<!--									</div>-->
	<!--									<div class="mt-2 text-xs text-slate-500 dark:text-slate-400">单条回复数，但也会消耗更多的额度</div>-->
	<!--								</div>-->
	<!--							</div>-->
	<!--						</n-collapse-item>-->
	<!--					</n-collapse>-->
	<!--				</div>-->
	<!--				<div class="mt-4 flex items-center justify-end space-x-4">-->
	<!--					<NButton @click="useGlobalStore.updateModelDialog(false)">-->
	<!--						取消-->
	<!--					</NButton>-->
	<!--					<NButton type="primary" @click="handleUpdateConfig" :loading="loading">-->
	<!--						保存-->
	<!--					</NButton>-->
	<!--				</div>-->
	<!--			</div>-->
	<!--		</NModal>-->

	<NModal :show="modelDialog" style="width: 50%;" :on-after-enter="openDialog"
					:on-after-leave="handleCloseDialog">

		<div class="py-3 px-5  rounded dark:bg-[#15171A] bg-white">
			<div class="absolute top-3 right-3 cursor-pointer" @click="useGlobalStore.updateAppModelDialog(false)">
				<NIcon size="20" :color="theme === 'dark' ? '#fff' : '#333'">
					<CloseOutline/>
				</NIcon>
			</div>
			<div class="flex font-bold mb-[20px] bg-currentflex items-center">
				<span class="text-lg text-[#808080] dark:text-[#fff]">切换聊天模型</span>
			</div>
			<div class="model_list">
				<div class="bg-[#F5F8FE] dark:bg-[#202B3A]" :class=" selectModel == item.label? 'model_item':'def_model_item'"
						 v-for="(item,index) in options" :key="item.id" @click="changModelItemClick(item.label,item.value)">
					<div class="model_name text-[#808080] dark:text-[#fff]">
						<div style="display: flex;width: 70%">
							<img class="model_name_img" v-if="selectModel == item.label" src="@/assets/images/selectRound.png">
							<img class="model_name_img" v-else src="@/assets/images/round.png">
							<div class="text-[#808080] dark:text-[#fff]" style="font-size: 15px;white-space: nowrap;text-overflow:ellipsis;overflow:hidden;">
								{{ item.label }}
							</div>
						</div>
						<div style="display: flex;align-items: center;font-size: 12px;white-space: nowrap;">
							<div>
								<img style="margin-right: 3px;margin-bottom: 3px;min-height: 14px;min-width: 14px" src="@/assets/images/points.png">
							</div>
							<div>{{ item.deduct }}{{ item.deductType == 1 ? '基础' : '高级' }}积分/次</div>
						</div>
					</div>
					<div class="model_desc text-[#808080] dark:text-[#A1A1A1]" style="font-size: 12px">
						{{item.desc}}
					</div>
				</div>
			</div>

			<div class="mt-5 bg-[#fafbfc] px-2 py-2  dark:bg-[#15171A]">
				<n-collapse default-expanded-names="" accordion :on-update:expanded-names="handleUpdate">
					<n-collapse-item name="1">
						<template #header>
							<div class="dark:text-[#EEEEEE] text-[#808080]">
								高级配置
								<span class="text-xs text-neutral-500">（不了解不需要修改）</span>
							</div>
						</template>
						<template #header-extra>
							<div @click.stop="handleReset">
								<NButton text type="error" v-if="showResetBtn">
									重置
								</NButton>
							</div>
						</template>
						<div class="mt-2">
							<div>
								<div class=" w-full flex justify-between">
									<span class="w-[150px]">话题随机性</span>
									<div class="flex w-[200px] items-center">
										<n-slider v-model:value="topN" :step="0.1" :max="maxTemperature"/>
										<span class="w-[55px] text-right">
											{{ topN }}
										</span>
									</div>
								</div>
								<div style="color: #AFAFAF" class="mt-2 text-xs text-slate-500 dark:text-slate-400">
									较高的数值会使同问题每次输出的结果更随机
								</div>
							</div>
							<div class="mt-4">
								<div class=" w-full flex justify-between">
									<span class="w-[150px]">回复Token数</span>
									<div class="flex w-[200px] items-center">
										<n-slider v-model:value="maxResponseTokens" :step="100" :max="maxModelTokens"/>
										<span class="w-[55px] text-right">
											{{ maxResponseTokens }}
										</span>
									</div>
								</div>
								<div style="color: #AFAFAF" class="mt-2 text-xs text-slate-500 dark:text-slate-400">单条回复数，但也会消耗更多的额度
								</div>
							</div>
							<div class="mt-4">
								<div class=" w-full flex justify-between">
									<span class="w-[150px]">关联上下文数量</span>
									<div class="flex w-[200px] items-center">
										<n-slider v-model:value="rounds" :step="1" :max="maxRounds"/>
										<span class="w-[55px] text-right">
											{{ rounds }}
										</span>
									</div>
								</div>
								<div style="color: #AFAFAF" class="mt-2 text-xs text-slate-500 dark:text-slate-400">单条回复数，但也会消耗更多的额度
								</div>
							</div>
						</div>
					</n-collapse-item>
				</n-collapse>
			</div>
			<div class="mt-4 flex items-center justify-end space-x-4">
				<NButton style="border-radius: 5px;"  @click="useGlobalStore.updateModelDialog(false)">
					取消
				</NButton>
				<NButton style="background: #00A8EC; border-radius: 5px;color: #FFFFFF" type="primary" @click="handleUpdateConfig" :loading="loading">
					保存
				</NButton>
			</div>
		</div>
	</NModal>
</template>

<style scoped lang="less">

.model_list {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	justify-content: space-between;
	height: 400px;
	overflow: scroll;
}

// 模型选中的样式
.model_item {
	width: 49%;
	height: 120px;
	border-radius: 20px;
	padding: 20px;
	margin-right: 10px;
	margin-bottom: 20px;
	border: 2px solid #00A8EC;
	cursor: pointer;

}

// 模型默认样式
.def_model_item {
	width: 49%;
	height: 120px;
	border-radius: 20px;
	padding: 20px;
	margin-right: 10px;
	margin-bottom: 20px;
	cursor: pointer;
}

.model_item:nth-child(n+2) {
	margin-right: 0;
}
.def_model_item:nth-child(n+2) {
	margin-right: 0;
}

.model_name {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	font-size: 17px;
	margin-bottom: 10px;
}

.model_name_img {
	width: 20px;
	height: 20px;
	margin-top: 2px;
	margin-right: 10px;
}

.model_desc {
	font-size: 15px;
	margin-bottom: 20px;
}

.n-slider {
	--n-fill-color: #00A8EC !important;
	--n-fill-color-hover: #00A8EC !important;
}
</style>
