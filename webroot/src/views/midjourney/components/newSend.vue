<script setup lang="ts">
import { ref, defineEmits, computed, watch } from 'vue'
import { drawLsit } from "@/views/midjourney/components/mj-menu";
import { NSwitch, NSpace, useMessage, NTooltip, NSpin } from 'naive-ui'
import { fetchAddMjDrawTaskAPI, fetchUploadImageDrawTaskAPI, AIChangeFaceApi ,fetchMidjourneyDrawList} from "@/api/mjDraw"
import EventBus from "@/hooks/eventBus"
import { MidjourneyActionEnum, MidJourneyDrawEnum } from "@/constants";
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from "@/store";
import baiduThink from './baiduThink.vue'
import createInspiration from './createInspiration.vue'
import { SvgIcon } from "@/components/common";
import { allQuery } from "@/api/music"
const message = useMessage()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore();
const isLogin = computed(() => authStore.isLogin);
const form = computed(() => authStore.mjDrawForm);
const emits = defineEmits(['isSettingShow', 'getjobId', "resquestStatus"])
const ms = useMessage()
const props = defineProps({
	imageList: { type: Array },
	sendType: { type: Number }
})
const inpValue = ref()//输入框内容
const sendType = props.sendType

const active = ref(false)//自动翻译开关
const translate = ref(0)
function handleChange() {
	if (active.value) {
		translate.value = 1
	} else {
		translate.value = 0
	}
}
EventBus.on("selectIncantation", data => {
	inpValue.value = data
})
const routerPath = computed(() => route.path)
const railStyle = () => {
	const style = {};
	if (translate.value == 1) {
		style.background = "#3076F5";
	} else if (translate.value == 0) {
		style.background = "#313155";
	}
	return style;
}
const bool = ref(false)
function handleSetting() {//点击设置
	if (bool) {
		emits("isSettingShow", !bool.value)
		bool.value = !bool.value
	} else {
		emits("isSettingShow", bool.value)
		bool.value = !bool.value
	}
}
const MjOrNj = ref("--v")//出图模型  Midjourney="--v"  Niji="--niji"
EventBus.on("MjOrNj", data => {
	MjOrNj.value = data
})
const cueWord = ref("")//风格提示词
EventBus.on("styleWord", data => {
	cueWord.value = data
})
const extendList = ref({})
const promptValue = ref()
const base64Array = ref([])
const resquestStatus = ref(0)
// watch(inpValue, (newValue, OleValue) => {
// 	handleInpValue()
// })
const iw = ref(0.25)//垫图相似度
const cw = ref(0)//角色一致性
const sw = ref(0)//风格一致性
const pidImgList = ref([])//垫图数组
const roleImgList = ref([])//角色一致性数组
const styleImgList = ref([])//风格一致性数组
function handleInpValue() {//输入框输入事件
	promptValue.value = inpValue.value
	isFocus.value = false
	EventBus.emit("isFocus", isFocus.value)
	// if (inpValue.value) {
	// 	resquestStatus.value = 0
	// } else {
	// 	resquestStatus.value = 1
	// }
}
EventBus.on("suggestEn", data => {
	promptValue.value = data
	inpValue.value = data
})
const sizeValue = ref('--ar 1:1')
// formData.value.extend=formData.value.extend+" "+sizeValue.value//尺寸默认为1:1
extendList.value.seed = ""//种子默认为空
extendList.value.no = ""
extendList.value.v = " 6.0"//
extendList.value.sizeValue = sizeValue.value//尺寸默认为1:1
extendList.value.q = "--q 1"//质量化默认为1
extendList.value.s = "--s 0"//风格化默认为0
extendList.value.c = "--c 0"//多样化化默认为0
if (localStorage.getItem("drawMode")) {
	let data = JSON.parse(localStorage.getItem("drawMode"))
	extendList.value.fast = data.value
} else {
	extendList.value.fast = "--fast"//出图模式默认为快速模式--------  '--fast'
}
extendList.value.tile = "--tile 0"//无缝出图默认为false--------  '-- tile 0' false=0,true=1
extendList.value.stop = "--stop 100" //停止默认为100--------  '-- stop '  10-100之间
extendList.value.weird = ""//奇妙默认为空--------  '-- weird '
EventBus.on("--seed", data => {
	if (data == 0) {
		extendList.value.seed = ""
	} else {
		extendList.value.seed = data
	}
})
EventBus.on('--no', data => {//不想出现的词
	extendList.value.no = data
})
EventBus.on('base64Array', data => {
	base64Array.value = data
})
EventBus.on('--v', data => {
	extendList.value.v = data
})
EventBus.on('sizeValue', (size) => {//获取高级设置尺寸
	sizeValue.value = "--ar " + size
	extendList.value.sizeValue = sizeValue.value
})
EventBus.on('--q', data => {//质量化
	extendList.value.q = "--q " + data
})
EventBus.on('--s', data => {//风格化
	extendList.value.s = "--s " + data
})
EventBus.on('--c', data => {//多样化
	extendList.value.c = "--c " + data
})
EventBus.on("--tile", data => {
	if (data) {
		data = 1
	} else {
		data = 0
	}
	extendList.value.tile = "--tile " + data
})
EventBus.on("--stop", data => {
	extendList.value.stop = "--stop " + data
})
EventBus.on("--weird", data => {
	extendList.value.weird = "--weird " + data
})
EventBus.on('--iw', data => {
	iw.value = data
})
EventBus.on('--cw', data => {
	cw.value = data
})
EventBus.on('--sw', data => {
	sw.value = data
})
EventBus.on("pidImgList", data => {
	pidImgList.value = []
	data.forEach(item => {
		pidImgList.value = [
			...pidImgList.value,
			item.url
		]
	})
})
EventBus.on("roleImgList", data => {
	roleImgList.value = []
	data.forEach(item => {
		roleImgList.value = [
			...roleImgList.value,
			item.url
		]
	})
})
EventBus.on("styleImgList", data => {
	console.log(data)
	styleImgList.value = []
	data.forEach(item => {
		styleImgList.value = [
			...styleImgList.value,
			item.url
		]
	})
})
const drawMode = ref(1)//出图模式，默认为1 ---快速模式
const imageForm = ref()
EventBus.on('imageForm', data => {//上传图片
	imageForm.value = data
})
const currentPage = computed(() => {
	return routerPath.value.includes('text-to-image') ?
		MidJourneyDrawEnum.TEXT_TO_IMAGE : routerPath.value.includes('image-to-text') ?
			MidJourneyDrawEnum.IMAGE_TO_TEXT : routerPath.value.includes('image-mix-image') ?
				MidJourneyDrawEnum.IMAGE_MIX_IMAGE : MidJourneyDrawEnum.NONE;
})

let formdata = new FormData();
const imgToTextMode = ref(1)//默认为快速模式
EventBus.on("imgToTextMode", data => {
	imgToTextMode.value = data
})
const imageToText = () => {
	if (imageForm.value == undefined) {
		ms.error("请上传一张图片")
		return
	}
	resquestStatus.value = 1
	EventBus.emit("upLoadIsShow", 0)
	formdata.append("type", currentPage.value + '')
	formdata.append("action", MidJourneyDrawEnum.IMAGE_TO_TEXT + '')
	formdata.append("mode", imgToTextMode.value + '')
	formdata.append("files", imageForm.value.files[0]);
	fetchUploadImageDrawTaskAPI(formdata).then((res: any) => {
		if (res.code == 200) {
			fetchMidjourneyDrawList({ page: 1, size: 20 }).then((re: any) => {
				let dataList = re.data.rows
				localStorage.setItem("drawLogList", JSON.stringify(dataList))
				resquestStatus.value = 0
				emits("getjobId", res.data)
				emits("resquestStatus", 1)
				formdata = new FormData()
			})
			
		}
	}).catch(res => {
		ms.error('提交任务失败！')
		inpValue.value = ""
		resquestStatus.value = 0
		formdata = new FormData()
	})
}

EventBus.on("status", data => {
	resquestStatus.value = data
	if (data == 0) {
		inpValue.value = ""
	}
})


function handleEnter() {
	if (!isLogin.value){
		authStore.setLoginDialog(true)
		return
	}	
	if (resquestStatus.value == 0) {
		if (currentPage.value == MidJourneyDrawEnum.TEXT_TO_IMAGE) {//文生图
			resquestStatus.value = 1
			textToImage()
			promptValue.value = ""
			// resquestStatus.value = 0
		} else if (currentPage.value == MidJourneyDrawEnum.IMAGE_TO_TEXT) {//图生文
			imageToText()
		} else if (currentPage.value == MidJourneyDrawEnum.IMAGE_MIX_IMAGE) {//图混图
			imageMixImage()
		} else if (currentPage.value == 0) {//AI换脸
			AIChangeFace()
		}
	}
}
const sourceBase64 = ref("")
const targetBase64 = ref("")
EventBus.on("sourceBase64", data => {
	sourceBase64.value = data
})
EventBus.on("targetBase64", data => {
	targetBase64.value = data
})
const AiFaceMode = ref(1)
EventBus.on("AiFaceMode", data => {
	AiFaceMode.value = data
})
function AIChangeFace() {
	if (!sourceBase64.value) {
		ms.error("请上传人脸模板图片")
		return
	}
	if (!targetBase64.value) {
		ms.error("请上传替换人脸目标图")
		return
	}
	let data = {
		type: 4,
		params: {
			action: 22,
			sourceBase64: sourceBase64.value,
			targetBase64: targetBase64.value,
			mode: AiFaceMode.value
		}
	}
	resquestStatus.value = 1
	AIChangeFaceApi(data).then(res => {
		if (res.code == 200) {
			fetchMidjourneyDrawList({ page: 1, size: 20 }).then((re: any) => {
				let dataList = re.data.rows
				localStorage.setItem("drawLogList", JSON.stringify(dataList))
				resquestStatus.value = 0
				emits("getjobId", res.data)
				emits("resquestStatus", 1)
			})
			
		}
	}).catch(err=>{
		ms.error('提交任务失败！')
		resquestStatus.value = 0
	})
}



const imageMixImageSize = ref("SQUARE")
const imgToimgMode = ref(1)//默认为快速模式
EventBus.on("imageMixImageSize", data => {
	imageMixImageSize.value = data
})
EventBus.on("drawMode", data => {
	imgToimgMode.value = data
})
const imageMixImage = () => {
	let data = {
		type: currentPage.value + '',
		action: MidJourneyDrawEnum.IMAGE_MIX_IMAGE + '',
		mode: imgToimgMode.value + '',
		base64Array: base64Array.value,
		size: imageMixImageSize.value
	}
	if (base64Array.value.length < 2) {
		ms.error("请上传2-5张图片")
		return
	}
	EventBus.emit("upLoadIsShow", 0)
	resquestStatus.value = 1
	fetchUploadImageDrawTaskAPI(data).then((res: any) => {
		if (res.code == 200) {
			fetchMidjourneyDrawList({ page: 1, size: 20 }).then((re: any) => {
				let dataList = re.data.rows
				localStorage.setItem("drawLogList", JSON.stringify(dataList))
				resquestStatus.value = 0
				emits("getjobId", res.data)
				emits("resquestStatus", 1)
			})
			
		}
	}).catch(res => {
		ms.error('提交任务失败！')
		inpValue.value = ""
		resquestStatus.value = 0
	})
}
const textToImage = () => {
	if (bool.value) {
		emits("isSettingShow", !bool.value)
		bool.value = !bool.value
	} else {
		emits("isSettingShow", bool.value)
		bool.value = !bool.value
	}
	let { no, v, sizeValue, q, s, c, fast, tile, stop, weird, seed } = extendList.value
	let mjType = MjOrNj.value
	fetchAddMjDrawTaskAPI({
		type: MidJourneyDrawEnum.TEXT_TO_IMAGE,
		params: {
			prompt: cueWord.value ? promptValue.value + " " + cueWord.value : promptValue.value,
			action: MidjourneyActionEnum.TEXT_TO_IMAGE,
			extend: (no != "" ? `--no ${no} ` : '') + mjType + v + " " + sizeValue + " " + q + " " + s + " " + c + " " + fast + " " + (stop == "" ? '' : stop) + " " + (weird == "" ? '' : weird) + (seed ? ` --seed ${seed}` : ""),
			base64Array: base64Array.value.length ? base64Array.value : [],
			mode: drawMode.value,
			translate: translate.value,
			iw: iw.value,
			cw: cw.value,
			sw: sw.value,
			mats: pidImgList.value,
			roles: roleImgList.value,
			styles: styleImgList.value
		}
	}).then(res => {
		if (res.code == 200) {
			emits("getjobId", res.data)
			emits("resquestStatus", 1)
			resquestStatus.value = 0
			inpValue.value = ""
		}
	}).catch(res => {
		ms.error('提交任务失败！')
		inpValue.value = ""
		resquestStatus.value = 0
		inpValue.value = ""
	})
}
const menuPath = ref("/midjourney/text-to-image")
menuPath.value = router.currentRoute.value.fullPath
function handleClick(item: any) {
	router.replace({ path: item.menuPath })
	if (item.menuName == "图生图") {
		EventBus.emit("upLoadShow", 1)
	} else if (item.menuName == "图生文") {
		EventBus.emit("upLoadShow", 1)
	}
}
const drawModeList = [
	{ name: "快速模式", id: 0, value: "--fast", icon: "/src/views/midjourney/img/right1.png", type: 1 },
	{ name: "休闲模式", id: 1, value: "--relax", icon: "/src/views/midjourney/img/importent.png", type: 2 },
	{ name: "Turbo模式", id: 2, value: "--turbo", icon: "/src/views/midjourney/img/importent.png", type: 3 },
]
const drawModeShow = ref(false)
const handleMode = () => {
	// if (currentPage.value == 1) {
	drawModeShow.value = !drawModeShow.value
	// } else if (currentPage.value == 2) {
	// console.log("禁用")
	// }
}
const drawModeTitle = ref("")
if (localStorage.getItem("drawMode")) {
	let modeItem = JSON.parse(localStorage.getItem("drawMode"))
	drawModeTitle.value = modeItem.name
	drawMode.value = modeItem.type
} else {
	drawModeTitle.value = "快速模式"
}
const handleClickMode = (item) => {
	extendList.value.fast = item.value
	drawMode.value = item.type
	drawModeTitle.value = item.name
	drawModeShow.value = false
	localStorage.setItem("drawMode", JSON.stringify(item))
}
const thinkRef = ref()
const inspirationRef = ref()
// 联想
const handleThink = () => {
	console.log(currentPage)
	if (currentPage.value == 1) {
		thinkRef.value.open()
	}
}
// 咒语生成器
const handlePromptCreate = () => {
	if (currentPage.value == 1) {
		inspirationRef.value.open()
	}
}
EventBus.on("prompts", data => {
	inpValue.value = data
	promptValue.value = data
})
EventBus.on("think", data => {
	inpValue.value = data
})
EventBus.on("error", data => {
	resquestStatus.value = 0
})
const copyrightTitle = ref("")
const icpNumber = ref("")
const policeFilingNumber = ref("")
const icpUrl = ref("")
const policeFilingUrl = ref("")
allQuery({ keys: ["copyrightTitle", "icpNumber", "policeFilingNumber", "icpUrl", "policeFilingUrl"] }).then(res => {
	copyrightTitle.value = res.data.copyrightTitle
	icpNumber.value = res.data.icpNumber
	policeFilingNumber.value = res.data.policeFilingNumber
	icpUrl.value = res.data.icpUrl
	policeFilingUrl.value = res.data.policeFilingUrl
})
const isFocus = ref(false)
function handleFocus() {
	if (inpValue.value) {
		return
	}
	isFocus.value = true
	EventBus.emit("isFocus", isFocus.value)

}
function handleBlur() {
	// isFocus.value=false
	// EventBus.emit("isFocus",isFocus.value)
}
function handleMask() {
	isFocus.value = false
	EventBus.emit("isFocus", isFocus.value)
}
</script>
<template>
	<baiduThink ref="thinkRef"></baiduThink>
	<createInspiration ref="inspirationRef"></createInspiration>
	<div class="mask" v-if="isFocus" @click="handleMask"></div>
	<div v-if="sendType == 0" class="contentCenterBottom bg-[#F4F4F4] dark:bg-[#010102]">
		<div class="inputBox">
			<textarea style="resize: none;width: 100%;height: 30px;line-height: 30px;"
				:disabled="currentPage == 2 || currentPage == 3" class="inp dark:bg-[#010102] bg-[#F4F4F4]"
				placeholder="在此处描述画图的关键字，注意不要在此填入萝莉、性感血腥等敏感词内容，100%不会出图" v-model="inpValue" @input="handleInpValue"
				@focus="handleFocus" @blur="handleBlur"></textarea>
		</div>
		<div class="inpBoxLeft">
			<div class="">
				<div class="selectBox">
					<div class="other">
						<!-- <div class="otherItem" @click="handleSetting">
							<img class="setImg" src="../img/set.png" alt="">
							<p class="otherText text-[#808080] dark:text-[#fff]">设置</p>
						</div> -->
						<div v-if="drawModeShow">
							<div class="drawModeBox bg-[#FFFFFF] dark:bg-[#15171A]">
								<div style="display: flex;align-items: center;justify-content: center;font-size: 13px;">
									<div style="width: 70px;height: 30px;line-height: 30px;">绘图模式</div>
									<NTooltip trigger="hover" placement="top">
										<template #trigger>
											<div>
												<SvgIcon style="font-size: 16px;" class="text-[#D2D2D2] dark:text-[#9898A1]"
													icon="f7:exclamationmark-circle-fill"></SvgIcon>
											</div>
										</template>
										<p>普通模式：高峰期预计需要10分钟出图 快速模式：平均1-2分钟出图（每张消耗4绘画积分）</p>
									</NTooltip>
								</div>
								<div v-for="item in drawModeList" :key="item.id" class="drawModeText"
									@click="handleClickMode(item)">
									<p class="text-[#696969] dark:text-[#fff] modeName">{{ item.name }}</p>
									<SvgIcon style="font-size: 16px;" class="text-[#B3B3B3] dark:text-[#9898A1]"
										icon="mingcute:right-line"></SvgIcon>
								</div>
								<div class="smallBox  bg-[#FFFFFF] dark:bg-[#15171A]" style="position: absolute;"></div>
							</div>
						</div>
						<div class="selectBox1 dark:bg-[#15171A] bg-[#FFFFFF;]" @click="handleMode"># {{ drawModeTitle }}
						</div>
						<div class="otherItem">
							<p class="otherText text-[#808080] dark:text-[#fff]">自动翻译</p>
							<n-space>
								<NSwitch v-model:value="active" @update:value="handleChange" size="small"
									:disabled="currentPage == 2 || currentPage == 3" />
							</n-space>
						</div>
						<div class="otherItem" @click="handleThink">
							<p class="otherText text-[#808080] dark:text-[#fff]">联想</p>
							<img class="setImg" src="../img/head.png" alt="">
						</div>
						<div class="otherItem" @click="handlePromptCreate">
							<p class="otherText text-[#808080] dark:text-[#fff]">提示词生成器</p>
						</div>
					</div>
					<div class="inpBoxRight">
						<div v-if="currentPage == MidJourneyDrawEnum.TEXT_TO_IMAGE">
							<button :class="inpValue == '' ? 'notSend' : 'send'" @click="handleEnter" :disabled="!promptValue"
								:style="promptValue ? '' : ' cursor:not-allowed'">
								<n-spin v-if="resquestStatus == 1" :size="18" stroke="#fff" />
								<p v-if="resquestStatus == 0" class="sendText">提交</p>
								<img v-if="resquestStatus == 0" class="sendImg" src="../img/send.png" alt="">
							</button>
						</div>
						<div v-else>
							<button :class="resquestStatus == 1 ? 'notSend' : 'send'" @click="handleEnter">
								<p class="sendText">提交</p>
								<img class="sendImg" src="../img/send.png" alt="">
							</button>
						</div>
					</div>
				</div>
			</div>

		</div>
		<div style="color: #eeeeee;" class="end ">
			<div style="display: flex;">版权所有 © {{ copyrightTitle }}
				<div v-if="icpNumber" style="display: flex;">
					<img style="margin-right: 5px;width: 16px;height: 16px" src="@/assets/icp-icon.png" alt="">
					<a :href="icpUrl || '#'">{{ icpNumber }}</a>
				</div>
				<div v-if="policeFilingNumber" style="display: flex;">
					<img style="margin-right: 5px;width: 16px;height: 16px" src="@/assets/police.png" alt="">
					<a :href="policeFilingUrl || '#'">{{ policeFilingNumber }}</a>
				</div>
			</div>
		</div>
	</div>
	<div v-if="sendType == 1">
		<div class="sendBox dark:bg-[#15171A] bg-[#FFFFFF] border-t-[2px] dark:border-[#4A4C4F] border-[#CECFD0]"
			v-if="currentPage != MidJourneyDrawEnum.TEXT_TO_IMAGE">
			<n-spin v-if="resquestStatus == 1" class="btnBox dark:bg-[#2960BE] bg-[#3378ED]" :size="18" stroke="#fff" />
			<div v-else class="btnBox dark:bg-[#2960BE] bg-[#3378ED]" @click="handleEnter">
				<div class="send">提交任务</div>
				<!-- <div class="send">提交任务（</div> -->
				<!-- <img src="../img/lightning.png" alt="">
				<div>4）</div> -->
			</div>
		</div>
	</div>
</template>
<style lang="less" scoped>
.contentCenterBottom {
	height: 117px;
	border-radius: 5px;
	padding: 18px;
	display: flex;
	flex-direction: column;
	// justify-content: space-between;
	// align-items: center;
	margin-bottom: 40px;
	margin-top: 24px;
	position: relative;
	z-index: 99999;

	.inpBoxLeft {

		.inputBox {
			display: flex;
			height: 33px;
			align-items: center;
			text-align: center;
			position: relative;

			.inp {
				// background-color: #1F1F38;
				border: 0;
				outline: none;
				width: 100%;
				resize: none;
			}

			.selectBox1 {
				width: 94px;
				height: 25px;
				line-height: 25px;
				text-align: center;
				// background-color: #1A1A2F;
				cursor: pointer;
			}


		}

		.selectBox {
			display: flex;
			margin-top: 17px;
			align-items: center;
			justify-content: space-between;

			.selectItem {
				width: 94px;
				height: 33px;
				// background-color: #1A1A2F;
				margin-right: 25px;
				text-align: center;
				line-height: 33px;
				cursor: pointer;
			}

			.activeSelectItem {
				width: 94px;
				height: 33px;
				background: linear-gradient(90deg, #4CA5FF, #3076F5);
				margin-right: 25px;
				text-align: center;
				line-height: 33px;
				cursor: pointer;
			}

			.other {
				display: flex;
				position: relative;

				.otherItem {
					width: auto;
					display: flex;
					margin-right: 20px;
					align-items: center;
					cursor: pointer;

					.setImg {
						width: 16px;
						height: 16px;
					}

					.otherText {
						font-size: 13px;
						margin: 5px 5px 0 5px;
					}
				}
			}
		}
	}

	.inpBoxRight {
		height: 100%;
		display: flex;
		align-items: flex-end;

		.notSend {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 70px;
			height: 30px;
			background: linear-gradient(90deg, #4CA5FF, #3076F5);
			padding: 2px;
			border-radius: 8px;
			cursor: not-allowed;
			align-items: center;

			.sendImg {
				width: 16px;
				height: 16px;
			}

			.sendText {
				font-size: 14px;
				margin-right: 5px;
				color: #fff;
			}
		}

		.send {
			display: flex;
			align-items: center;
			width: 70px;
			height: 30px;
			background: linear-gradient(90deg, #4CA5FF, #3076F5);
			padding: 2px;
			justify-content: center;
			align-items: center;
			border-radius: 8px;

			.sendImg {
				width: 16px;
				height: 16px;
			}

			.sendText {
				font-size: 14px;
				margin-right: 5px;
				color: #fff;
			}
		}
	}
}

.drawModeBox {
	// background-color: #1A1A2F;
	width: 120px;
	position: absolute;
	bottom: 50px;
	left: -15px;
	z-index: 999999;
	padding: 10px 10px 10px 10px;
	cursor: pointer;

	.modeName {
		width: 70px;
		text-align: start;
	}

	.drawModeText {
		font-size: 12px;
		color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;
		line-height: 30px;
	}

	.smallBox {
		width: 10px;
		height: 10px;
		transform: rotate(45deg);
		position: absolute;
		bottom: -5px;
		left: calc(50% - 5px);
	}
}

.modeImg1 {
	width: 14px;
	height: 15px;
}

.modeImg2 {
	width: 8px;
	height: 15px;
}

.selectBox1 {
	width: 110px;
	height: 36px;
	line-height: 36px;
	text-align: center;
	margin-right: 10px;
	border-radius: 8px;
	cursor: pointer;
}

.drawModeBox {
	width: 120px;
	position: absolute;
	bottom: 42px;
	left: -5px;
	z-index: 999999;
	padding: 10px 10px 10px 10px;
	cursor: pointer;

	.modeName {
		width: 70px;
		text-align: start;
	}

	.drawModeText {
		font-size: 12px;
		color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;
		line-height: 30px;
	}

	.smallBox {
		width: 10px;
		height: 10px;
		transform: rotate(45deg);
		position: absolute;
		bottom: -5px;
		left: calc(50% - 5px);
	}
}

.end {
	width: 98%;
	display: flex;
	justify-content: center;
	position: absolute;
	bottom: -47px;
}

.sendBox {
	padding: 8px 12px;
	position: absolute;
	width: 100%;
	left: 0;
	bottom: 0;
	z-index: 99;

	.btnBox {
		display: flex;
		justify-content: center;
		align-items: center;
		color: #fff;
		padding: 8px 12px;
		border-radius: 8px;
		cursor: pointer;
		height: 35px;
	}
}

.mask {
	width: 100%;
	height: 100vh;
	position: absolute;
	top: 0;
	left: 0;
	z-index: 999;
}
</style>