<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount ,onBeforeMount} from 'vue'
import textConfigure from './components/configure.vue'
import Suggestion from "@/views/midjourney/components/suggestion.vue";
import chatHistory from './components/chatHistory.vue'
import { useAuthStore, useGlobalStore } from "@/store";
import { fetchGetDraw, fetchMidjourneyDrawList ,fetchGetDrawMany} from "@/api/mjDraw";
import MobileText2Image from "@/views/midjourney/mobile/text2image.vue";
import { useBasicLayout } from "@/hooks/useBasicLayout";
import { MidjourneyStatusEnum } from "@/views/midjourney/components/mj-menu";
import NewSend from "@/views/midjourney/components/newSend.vue"
import { useAppStore } from "@/store";
import { SvgIcon } from '@/components/common'
import { NSpace, NSlider, NSwitch, useMessage, NUpload, NRadio } from 'naive-ui';
import EventBus from "@/hooks/eventBus"
import drawView from './components/drawView.vue';
import drawLogView from './components/drawLogList.vue'
import SiderBar from '../../layout/siderBar/index.vue';
import { utcToShanghaiTime } from "@/utils/date";
import { useMidjourneyStore } from "@/store/modules/midjourney";
import popup from './components/popup.vue';
import { router } from "@/router";
import UserDetails from './components/userDetails.vue';
import { drawLsit } from "@/views/midjourney/components/mj-menu";
import { allQuery } from "@/api/music"
const appStore = useAppStore()
const darkMode = computed(() => appStore.theme === 'dark')
const globalStore = useGlobalStore();
const auth = useAuthStore();
const { isMobile } = useBasicLayout();
const ms = useMessage()
// const jobId = computed(() => auth.drawId);
const authStore = useAuthStore();
const isLogin = computed(() => authStore.isLogin);
const avatar = computed(() => authStore.userInfo.avatar);
const username = computed(() => authStore.userInfo.username);
const userBalance = computed(() => authStore.userBalance);
const form = computed(() => authStore.mjDrawForm);
const resquestStatus = ref()
const drawLogList = ref([])
const midjourneyStore = useMidjourneyStore();
const menuPath = ref("")
menuPath.value = router.currentRoute.value.fullPath
function handleClick(item: any) {
	router.replace({ path: item.menuPath })
	if (item.menuName == "图生图") {
		EventBus.emit("upLoadShow", 1)
	} else if (item.menuName == "图生文") {
		EventBus.emit("upLoadShow", 1)
	}
}

const jobId = ref()
const loadingStatus = ref(0)
//获取绘画记录
fetchMidjourneyDrawList({ page: 1, size: 20 }).then((res: any) => {
	let dataList = res.data.rows
	drawLogList.value = dataList.reverse()
	localStorage.setItem("drawLogList", JSON.stringify(dataList))
	loadingStatus.value = 1
	setTimeout(() => {
		to1()
	}, 100)
})

const toTop = ref(null)
const to = () => {
	let element = toTop.value
	element.scrollTo({ top: element.scrollHeight + element.clientHeight, behavior: 'smooth' });
}

const to1=()=>{
	let element = toTop.value
	element.scrollTop=element.scrollHeight
}

const newJob = ref()
const newJobIdList=ref([])
const newJobId =async (newjobId: string) => {
	newJobIdList.value=[
		...newJobIdList.value,
		newjobId
	]
	if(newJobIdList.value.length==1){
		newJob.value = newJobIdList.value[0]
	}else if(newJobIdList.value.length>1){
		newJob.value=newJobIdList.value.join(',')
	}
	await handleGetCurrentDraw(newJob.value);
	setTimeout(() => to(), 100)
	// handlePullByTimes()
}

// 获取当前绘图任务
const handleGetCurrentDraw = async (jobId: string) => {

	if (!jobId) {
		return;
	}

	const res = await fetchGetDrawMany({ jobIds: jobId });
	currentTask.value=res.data
	//完成、错误、超时等
	let completeList=res.data.filter(item=>item.status>=3)
	let repaintList=res.data.filter(item=>item.status==6)
	if(completeList.length!=0){
	
	}
	//局部重绘
	if(repaintList.length!=0){
		let task=repaintList[0]
		if(task.action==9){
			midjourneyStore.openRegionModal(true,{
				customId:task.customId,
				taskId:task.id,
				mode:task.mode
			})
		}else{
			authStore.updateRemixModal(true,{
				prompt:"",
				taskId:task.id,
				customId:task.customId
			})
		}
		drawTimer.value && clearTimeout(drawTimer.value);
		return
	}
	if(completeList.length==res.data.length){
		drawTimer.value && clearTimeout(drawTimer.value);
		setTimeout(() => to(), 100)
		return;
	}
	// 进行中继续轮询
	handlePullByTimes();
}
const jobidList=ref([])
const handleGetTask = async (id: string) => {
	jobidList.value=[
		...jobidList.value,
		id
	]
	if(jobidList.value.length==1){
		jobId.value = jobidList.value[0]
	}else if(jobidList.value.length>1){
		jobId.value=jobidList.value.join(',')
	}
	await handleGetCurrentDraw(jobId.value);
	setTimeout(() => to(), 100)
	// handlePullByTimes()
}

const currentTask = ref({
	status: 0
})

const drawTimer = ref();

const handlePullByTimes = () => {
	drawTimer.value && clearTimeout(drawTimer.value);
	drawTimer.value = setTimeout(() => {

		if (currentTask.value?.status === MidjourneyStatusEnum.DRAWED ||
			currentTask.value?.status === MidjourneyStatusEnum.DRAWFAIL ||
			currentTask.value?.status === MidjourneyStatusEnum.DRAWTIMEOUT) {
			drawTimer.value && clearTimeout(drawTimer.value);
			resquestStatus.value = 0
			EventBus.emit("status", resquestStatus.value)
			drawLogList.value.push(currentTask.value)
			EventBus.emit("newDrawLogList", drawLogList.value)
			newJob.value = ""
			jobId.value = ""
			//获取绘画记录
			fetchMidjourneyDrawList({ page: 1, size: 20 }).then((res: any) => {
				let dataList = res.data.rows
				drawLogList.value = dataList.reverse()
				localStorage.setItem("drawLogList", JSON.stringify(res.data.rows))
				setTimeout(() => to(), 100)
			})
			return;
		}

		handlePullByTimes();
		if (jobId.value) {
			handleGetCurrentDraw(jobId.value)
		} else if (newJob.value) {
			handleGetCurrentDraw(newJob.value)
		}
	}, 3000)
}

onBeforeUnmount(() => {
	drawTimer.value && clearTimeout(drawTimer.value);
	drawTimer.value = null;
	auth.updateDrawId({ id: '' })
})
const modeList = [
	{ name: "MJ6.0（最新）", intro: "全新6.0 ALPHA真实风格图像", id: 0, value: "--v 6.0" },
	{ name: "MJ5.2（真实细节）", intro: "增加真实风格图像细节", id: 1, value: "--v 5.2" },
	{ name: "MJ5.1（艺术）", intro: "专注真实艺术风格图像", id: 2, value: "--v 5.1" },
	// {name:"MJ5.0（真实增强）",intro:"增加真实风格图像细节",id:3,value:"--v 5"},
	// {name:"MJ4.0（真实）",intro:"增强动漫风格图像细节",id:4,value:"--v 4"},
	{ name: "NJ5.0（动漫增强）", intro: "官方最新动漫模型同步", id: 5, value: "--niji 5" },
	{ name: "NJ4.0（动漫）", intro: "官方最新动漫模型同步", id: 6, value: "--niji 4" },
]
const modeIndex = ref(0)//选择mode

function hanleSelectMode(data: any) {
	modeIndex.value = data.index
	EventBus.emit("--v", data.item.value)
}
const isSettingShow = ref(false)//高级设置是否显示
function handleChidren(res: boolean) {
	isSettingShow.value = res
}
const textareaValue = ref("")//高级选项输入框内容

const sizeList = [
	{ name: "头像框", src: "/src/views/midjourney/img/1.png", id: 0, intro: "1:1", value: "SQUARE" },
	{ name: "小红书图", src: "/src/views/midjourney/img/2.png", id: 1, intro: "2:3", value: "PORTRAIT" },
	{ name: "横板名片", src: "/src/views/midjourney/img/3.png", id: 2, intro: "3:2", value: "LANDSCAPE" },
]//寸尺列表
const isSelect = ref(0)
function handleSize(index: number) {//选择尺寸
	isSelect.value = index
	EventBus.emit("imageMixImageSize", sizeList[index].value);

}
const sliderList = ref([
	{ name: "--q 质量化", sliderValue: 0, id: 0, max: 100, type: "--q" },
	{ name: "--s 风格化", sliderValue: 0, id: 1, max: 1000, type: "--s" },
	{ name: "--c 多样化", sliderValue: 0, id: 2, max: 100, type: "--c" },
])
function handleReduce(index: number) {
	sliderList.value[index].sliderValue--
}
function handleAdd(index: number) {
	sliderList.value[index].sliderValue++
}
function handleSlider(index: number) {
	let { sliderValue, type } = sliderList.value[index]
	if (index == 0) {
		EventBus.emit("--q", { sliderValue, type });
	} else if (index == 1) {
		EventBus.emit("--s", { sliderValue, type });
	} else if (index == 2) {
		EventBus.emit("--c", { sliderValue, type });
	}
}

const active = ref(false)//是否公开作品开关
const show = ref(0)
function handleChange() {
	if (active.value) {
		show.value = 1
	} else {
		show.value = 0
	}
	console.log(show.value)
}
const railStyle = () => {
	const style = {};
	if (show.value == 1) {
		style.background = "#3076F5";
	} else if (show.value == 0) {
		style.background = "#313155";
	}
	return style;
}
function handleInput() {
	EventBus.emit("textareaValue", textareaValue.value);
}
const upLoadIsShow = ref(0)
setTimeout(() => {
	upLoadIsShow.value = 1
}, 0)
const base64Array = ref([])
const fileType = ['jpg', 'jpeg', 'png'];
const handleChangeUploadMixImage = (ev: { file: { file: File, status: string; type: string; id: string; }; }) => {
	if (ev.file.status === 'pending') {
		fileToBase64(ev.file.file).then(res => {
			let base64Str = 'data:image/png;base64,' + res
			base64Array.value.push(base64Str)
		})
	}
	if (ev.file.status === "removed") {
		fileToBase64(ev.file.file).then(res => {
			let base64Str = 'data:image/png;base64,' + res
			base64Array.value = base64Array.value.filter(item => item !== base64Str)
		})
	}
	EventBus.emit("base64Array", base64Array.value)
}
const handleBeforeUploadMj = (ev: { file: { name: string, type: string }; fileList: FileList[] }) => {
	const fileName = ev.file.type.split('/')[1];

	if (ev.fileList.length >= 5) {
		ms.warning("最多只能上传5张图片")
		return false;
	}
	return fileType.includes(fileName) && ev.fileList.length <= 5;
}

const handleRemoveImageToText = (ev: { file: { name: string; id: string; status: string; type: string; url: string; }; }) => {
	const name = ev.file.name;
	form.value.extendParam = form.value.extendParam.filter(item => !item.filename.includes(name));
	changeForm();
}
const changeForm = async () => {
	authStore.updateMjDrawForm(form.value)
}
const handleStatus = (res: number) => {
	resquestStatus.value = res
}
function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		// 创建一个新的 FileReader 对象
		const reader = new FileReader();
		// 读取 File 对象
		reader.readAsDataURL(file);
		// 加载完成后
		reader.onload = function () {
			// 将读取的数据转换为 base64 编码的字符串
			const base64String = reader.result.split(",")[1];
			// 解析为 Promise 对象，并返回 base64 编码的字符串
			resolve(base64String);
		};
		// 加载失败时
		reader.onerror = function () {
			reject(new Error("Failed to load file"));
		};
	});
}
EventBus.on("upLoadIsShow", data => {
	upLoadIsShow.value = data
})
EventBus.on("upLoadShow", data => {
	upLoadIsShow.value = data
})
const popIsShow = ref(false)
EventBus.on("error", data => {
	popIsShow.value = data
})
const handleClosePop = () => {
	popIsShow.value = false
}
const handleBuyVip = () => {
	popIsShow.value = false
	if (authStore.checkAuth()) {
		globalStore.updateVipDialog(true)
	}
}
const isShowUserinfo = ref(false)
EventBus.emit("drawRoute", router.options.history.location)
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
const padMapBoxPutAway = ref(false)
const imgSizePutAway = ref(false)
function putAway(idx) {//展开收起
	if (idx == 0) {
		padMapBoxPutAway.value = !padMapBoxPutAway.value
	} else if (idx == 1) {
		imgSizePutAway.value = !imgSizePutAway.value
	}
}
const selectIdx = ref(0)
const sizeValue = ref("SQUARE")
function handleSizeClick(idx) {
	selectIdx.value = idx
	if (idx == 0) {//头像框
		sizeValue.value = "SQUARE"
	} else if (idx == 1) {//横板名片
		sizeValue.value = "PORTRAIT"
	} else if (idx == 2) {//小红书图
		sizeValue.value = "LANDSCAPE"
	}
	EventBus.emit("imageMixImageSize", sizeValue.value);
}
const checkedValue = ref("快图模式")
function reaioChange(e) {
	checkedValue.value = e.target.value
}
const ModIdx = ref(0)
const drawMode = ref(1)//1==快图模式,2==慢速模式
function handleMode(idx) {
	if (idx == 0) {
		drawMode.value = 1
	} else if (idx == 1) {
		drawMode.value = 2
	}
	EventBus.emit("drawMode", drawMode.value)
	ModIdx.value = idx
}
function handleAgreement() {
	router.push("/serviceAgreement")
}
const inpValue1 = ref(1)
const inpValue2 = ref(1)
</script>

<template>
	<div class="mask" v-if="isShowUserinfo" @click="isShowUserinfo = false"></div>
	<div v-if="isMobile">
		<MobileText2Image></MobileText2Image>
	</div>
	<div v-if="popIsShow">
		<popup @closePop="handleClosePop" @buy-vip="handleBuyVip"></popup>
	</div>
	<div class="text-image-container flex flex-row dark:bg-[#010102] bg-[#F4F4F4]" v-if="!isMobile" style="width: 100%;">
		<!-- <div class="w-full pt-2 px-20 h-[calc(100% - 60px)] flex flex-col justify-between"> -->
		<!-- 菜单栏 -->
		<SiderBar v-if="!isMobile" />
		<div style="width: 100%;">
			<!--	中间的对话框	-->
			<div class="h-full flex justify-start items-between" style="height: 100vh;width: 100%;">
				<div class="contentBox dark:bg-[#15171A] bg-[#FFFFFF]">
					<div style="position: absolute;z-index: 99;width: 278px;padding-bottom: 10px;top: 0;"
						class="bg-[#fff] dark:bg-[#15171A]">
						<div style="display: flex;margin-top: 12px;">
							<div :class="menuPath == item.menuPath ? 'activeSelectItem text-[#fff]' : 'selectItem text-[#808080] bg-[#F4F4F4;] dark:bg-[#010102] dark:text-[#fff]'"
								v-for="item in drawLsit" :key="item.key" @click="handleClick(item)">
								{{ item.menuName }}
							</div>
						</div>
						<div class="MJBox dark:bg-[#202B3A] bg-[#fff]">
							<!-- <img class="logoImg" src="./img/logo.png" alt="">
							<div class="titleBox">
								<p class="title1 dark:text-[#CAC5C5] text-[#808080]">Mid Journey</p>
								<p class="title2">AI</p>
							</div> -->
							<div class="intro dark:text-[#CAC5C5] text-[#808080]">
								一款强大的人工智能绘画工具，为用户提供了各种创意的绘画功能，一次性生成4张高质量的艺术创作。
							</div>
						</div>
					</div>
					<div class="padMapBox">
						<div style="display: flex;justify-content: space-between;">
							<div style="display: flex;">
								<div style="font-size: 15px;font-weight: 500;">上传图片（2-5张）</div>
							</div>
						</div>
						<div class="modePutExpand">
							<div class="upLoadContent">
								<div>
									<n-upload accept=".jpg,.jpeg,.png" action="" :default-upload="false"
										:on-change="handleChangeUploadMixImage" :on-before-upload="handleBeforeUploadMj"
										:on-remove="handleRemoveImageToText" list-type="image-card" directory-dnd>
									</n-upload>
								</div>
							</div>
						</div>
					</div>
					<div class="ImgSize" style="margin-top: 10px;">
						<div style="display: flex;justify-content: space-between;">
							<div style="display: flex;">
								<div style="font-size: 15px;font-weight: 500;">图片尺寸</div>
							</div>
						</div>
						<div class="modePutExpand">
							<div class="sizeBox">
								<div :class="selectIdx == 0 ? 'imgSizeItemSelect border-[2px] border-[#76A5F3] dark:border-[#2A63C5]' : 'imgSizeItem'"
									class=" dark:bg-[#202B3A] bg-[#F5F8FE]" @click="handleSizeClick(0)">
									<div class="imgBox">
										<img src="./img/1.1.svg" alt="" v-if="darkMode">
										<img src="./img/1.1Light.svg" alt="" v-else>
									</div>
									<div class="title1 text-[#919393] dark:text-[#707277]">1:1</div>
									<div class="title2 text-[#919393] dark:text-[#707277]">头像框</div>
								</div>
								<div :class="selectIdx == 1 ? 'imgSizeItemSelect border-[2px] border-[#76A5F3] dark:border-[#2A63C5]' : 'imgSizeItem'"
									class=" dark:bg-[#202B3A] bg-[#F5F8FE]" @click="handleSizeClick(1)">
									<div class="imgBox">
										<img src="./img/1.1.svg" alt="" v-if="darkMode">
										<img src="./img/1.1Light.svg" alt="" v-else>
									</div>
									<div class="title1 text-[#919393] dark:text-[#707277]">3:2</div>
									<div class="title2 text-[#919393] dark:text-[#707277]">横板名片</div>
								</div>
								<div :class="selectIdx == 2 ? 'imgSizeItemSelect border-[2px] border-[#76A5F3] dark:border-[#2A63C5]' : 'imgSizeItem'"
									class=" dark:bg-[#202B3A] bg-[#F5F8FE]" @click="handleSizeClick(2)">
									<div class="imgBox">
										<img src="./img/1.1.svg" alt="" v-if="darkMode">
										<img src="./img/1.1Light.svg" alt="" v-else>
									</div>
									<div class="title1 text-[#919393] dark:text-[#707277]">2:3</div>
									<div class="title2 text-[#919393] dark:text-[#707277]">小红书图</div>
								</div>
								<!-- <div :class="selectIdx == 3 ? 'imgSizeItemSelect border-[2px] border-[#76A5F3] dark:border-[#2A63C5]' : 'imgSizeItem'"
									class=" dark:bg-[#202B3A] bg-[#F5F8FE]" @click="handleSizeClick(3)" style="margin-top: 10px;">
									<div class="imgBox">
										<img src="./img/zdy.svg" alt="" v-if="darkMode">
										<img src="./img/zdyLight.svg" alt="" v-else>
										<img class="setSvg" src="./img/set.svg" alt="">
									</div>
									<div style="display: flex;margin-top: 8px;">
										<input class="sizeInp" v-model="inpValue1" type="text" />
										<div style="margin: 0 4px;">:</div>
										<input class="sizeInp" v-model="inpValue2" type="text" />
									</div>
									<div class="title2 text-[#919393] dark:text-[#707277]">自定义</div>
								</div> -->
							</div>
						</div>
					</div>
					<div class="promptBox dark:bg-[#202B3A] bg-[#F5F8FE] text-[#3378ED] dark:text-[#2960BE]">
						温馨提示：同官方的/blend命令图混图，最多可以上传5张图片进行混图，图片越靠前，权重越高。
					</div>
					<div class="radioBox dark:bg-[#15171A] bg-[#FFFFFF]">
						<div style="display: flex;">
							<div class="radioItem" @click="handleMode(0)">
								<div class="radioItemImgBox"
									:class="ModIdx == 0 ? 'dark:bg-[#2960BE] bg-[#3378ED]' : 'dark:bg-[#484A4D] bg-[#CECFD0]'">
									<img src="./img/Line 1.svg" alt="">
								</div>
								<p style="margin-left: 4px;font-size: 10px;">快图模式</p>
							</div>
							<div class="radioItem" style="margin-left: 12px;" @click="handleMode(1)">
								<div class="radioItemImgBox"
									:class="ModIdx == 1 ? 'dark:bg-[#2960BE] bg-[#3378ED]' : 'dark:bg-[#484A4D] bg-[#CECFD0]'">
									<img src="./img/Line 1.svg" alt="">
								</div>
								<p style="margin-left: 4px;font-size: 10px;">常规模式</p>
							</div>
						</div>
						<div style="display: flex;align-items: center;cursor: pointer;" @click="handleAgreement">
							<img style="width: 12px;height: 12px;margin-right: 4px;" src="./img/Help.png" alt="">
							<p style="font-size: 10px;" class="text-[#A3A5A6] dark:text-[#76777A]">免责声明</p>
						</div>
					</div>
					<NewSend :sendType="1" @getjob-id="handleGetTask" @resquest-status="handleStatus"></NewSend>
				</div>

				<div class="contentCenter bg-[#fff] dark:bg-[#15171A]">
					<div class="contentCenterTop  border-b-[2px] dark:border-[#000000] border-[#D1D1D1]">
						<span># &nbsp;创作中心</span>
						<span
							style="color: #EDB830;">&nbsp;&nbsp;&nbsp;&nbsp;请遵守中华人民共和国网络安全法，严禁生成涉及政治人物、色情、恐怖等不良内容，如有违规封号处理</span>
					</div>
					<div class="w-full" v-if="drawLogList.length == 0 && !jobId"
							style="padding: 0 0px;position: relative;margin-top: 10px;">
							<div v-if="loadingStatus == 0 && isLogin"
								style="height: 64vh;display: flex;justify-content: center;align-items: center;">
								<div style="width: 50px;height: 50px;">
									<!-- <Loading1></Loading1> -->
									<div class="loader"></div>
								</div>
							</div>
							<Suggestion v-if="loadingStatus != 0 || !isLogin"></Suggestion>
						</div>
					<template v-else>
						<div class="drawList" ref="toTop">
							<div style="margin-top: 10px;">
								<drawLogView :drawLogList="drawLogList" @newJobId="newJobId"></drawLogView>
							</div>
							<chatHistory :task="currentTask" @refresh="handleGetTask" v-if="jobId"></chatHistory>
							<drawView :task="currentTask" v-if="newJob" @newJob="newJobId"></drawView>
						</div>
					</template>
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

			</div>
		</div>
		<!-- </div> -->
	</div>
	<!-- <textConfigure  ref="configRef" @fresh="handleGetTask"></textConfigure> -->
</template>
<style scoped lang="less">
.contentBox {
	width: 300px;
	min-width: 300px;
	height: 92vh;
	margin-top: 10px;
	flex-direction: column;
	padding: 0 10px 60px 10px;
	position: relative;
	border-radius: 10px;
	margin-right: 10px;
	overflow: hidden;
	position: relative;

	.MJBox {
		width: 280px;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 12px;
		margin-top: 8px;

		.logoImg {
			width: 80px;
			height: 80px;
		}

		.titleBox {
			display: flex;
			justify-content: center;
			align-items: center;
			margin-top: 12px;

			.title1 {
				font-size: 16px;
			}

			.title2 {
				font-size: 13px;
				background: #34C759;
				width: 28px;
				height: 18px;
				text-align: center;
				margin-left: 12px;
				border-radius: 8px;
				color: #fff;
			}
		}

		.intro {
			font-size: 14px;
			// text-align: center;
			margin-top: 8px;
		}
	}

	.modeBox {
		width: 280px;
		margin-top: 20px;

		.modeTitle {
			padding-left: 10px;

			.title {
				font-size: 18px;
			}
		}

		.modeContent {
			cursor: pointer;

			.contentItem {
				padding-left: 16px;
				display: flex;
				align-items: center;
				padding: 15px 26px;
			}

			.active {
				padding: 15px 26px;
				display: flex;
				align-items: center;
				background: linear-gradient(84deg, #4CA5FF 0%, #3076F5 100%);
				position: relative;
			}

			.contentNmae {
				margin-left: 13px;
				font-size: 16px;
			}

			.contentIntro {
				font-size: 12px;
				margin-left: 13px;
			}
		}
	}

	.userInfo {
		// background-color: #1A1A2F;
		width: 100%;
		display: flex;
		padding: 14px 25px;
		align-items: center;
		position: absolute;
		bottom: 60px;

		.avatar {
			width: 34px;
			height: 34px;
			border-radius: 50%;
		}

		.userName {
			margin-left: 16px;

			.name {
				font-size: 16px;
			}

			.isVip {
				font-size: 12px;

			}
		}

		.mine {
			width: 17px;
			height: 17px;
			position: absolute;
			right: 18px;
		}
	}
}

.contentCenter {
	width: 100%;
	height: 92vh;
	display: flex;
	padding: 12px 12px 40px 12px;
	flex-direction: column;
	// justify-content: space-between;
	border-radius: 12px;
	overflow: hidden;
	margin-top: 10px;
	margin-right: 12px;
	position: relative;
}

.contentCenterTop {
	// border-bottom: 2px solid #2C2C4F;
	// background-color: #1F1F38;
	padding: 10px 0;
}

.contentCenterBottom {
	width: 100%;
	height: 117px;
	border: 2px solid #347DF7;
	margin-bottom: 130px;
	border-radius: 5px;
	padding: 18px;
	display: flex;
	justify-content: space-between;
	align-items: center;

	.inpBoxLeft {
		.inputBox {
			display: flex;
			height: 33px;
			align-items: center;
			text-align: center;

			.selectBox1 {
				width: 94px;
				height: 25px;
				line-height: 25px;
				text-align: center;
				background-color: #1A1A2F;
			}

			.inp {
				color: #BDBDBD;
				background-color: #1F1F38;
				border: 0;
				outline: none;
				width: 728px;
				margin-left: 30px;
			}
		}

		.selectBox {
			display: flex;
			margin-top: 17px;
			align-items: center;

			.selectItem {
				width: 94px;
				height: 33px;
				background-color: #1A1A2F;
				margin-right: 25px;
				text-align: center;
				line-height: 33px;
				cursor: pointer;
			}

			.other {
				display: flex;

				.otherItem {
					width: auto;
					display: flex;
					margin-right: 20px;
					align-items: center;

					.setImg {
						width: 16px;
						height: 16px;
					}

					.otherText {
						font-size: 16px;
						margin: 0 5px;
					}
				}
			}
		}
	}

	.inpBoxRight {

		.send {
			display: flex;
			align-items: center;
			width: 80px;
			justify-content: space-evenly;
			background: linear-gradient(90deg, #4CA5FF, #3076F5);
			padding: 2px;
			border-radius: 2px;

			.sendImg {
				width: 16px;
				height: 16px;
			}

			.sendText {
				font-size: 14px;
			}
		}
	}
}

.setting {
	width: 110%;
	height: 680px;
	background-color: #1A1A2F;
	position: absolute;
	z-index: 9999;
	bottom: 247px;
	border-radius: 10px;
	overflow: auto;
	padding-bottom: 40px;

	.settingText {
		font-size: 18px;
		color: #fff;
	}

	.settingTitle {
		display: flex;
		height: 65px;
		background-color: #272740;
		align-items: center;
		padding-left: 26px;
		border-radius: 10px 10px 0 0;

		.settingImg {
			width: 18px;
			height: 18px;
			margin-right: 16px;
		}

	}

	.sttingContent {
		margin-top: 30px;
		padding-left: 27px;

		.contentBox1 {
			.content1 {
				display: flex;
				align-items: center;
				line-height: 25px;
			}

			.textBox {
				width: 826px;
				height: 107px;
				margin-top: 29px;
				background-color: #1A1A2F;
				border: 1px solid #5B5B7A;
				border-radius: 5px;
				resize: none;
				padding: 28px 0 0 37px;
			}
		}

		.contentBox2 {
			margin-top: 32px;

			.content2 {
				display: flex;
				align-items: center;
				line-height: 25px;
			}

			.sizeBox {
				display: flex;
				margin-top: 27px;

				.sizeItem {
					width: 92px;
					height: 120px;
					border: 1px solid #B2B2B2;
					border-radius: 5px;
					margin-left: 12px;
					cursor: pointer;
					text-align: center;
				}

				.sizeSelect {
					width: 92px;
					height: 120px;
					border: 1px solid #4AA1FE;
					border-radius: 5px;
					margin-left: 12px;
					text-align: center;
					cursor: pointer;
				}
			}
		}

		.contentBox3 {
			margin-top: 32px;

			.content3 {
				display: flex;
				align-items: center;
				line-height: 25px;
			}

			.sliderBox {
				margin-top: 20px;

				.sliderItem {
					width: 400px;
					display: flex;
					justify-content: space-between;
					margin-top: 10px;

					.sliderButton {
						display: flex;
						width: 72px;
						height: 22px;
						background-color: #272740;
						justify-content: space-between;
						margin-left: 27px;
						padding: 0 10px;
					}
				}
			}
		}

		.contentBox4 {
			margin-top: 32px;

			.content4 {
				display: flex;
				align-items: center;
				line-height: 25px;
			}

			.Show {
				display: flex;
				margin-top: 20px;

				.showText {
					font-size: 14px;
					color: #AEAEAE;
					margin-right: 120px;
				}
			}
		}
	}
}

.drawList {
	width: 100%;
	overflow: auto;
}

.upLoadImg1 {
	width: 100%;
	position: absolute;
	bottom: 117px;
	box-shadow: -10px -10px 20px #1B1B31;
	border-radius: 20px 20px 2px 2px;
	overflow: hidden;
	z-index: 99999;
	height: 0;
	transition: all .5s;
}

.upLoadImg {
	width: 100%;
	position: absolute;
	bottom: 117px;
	border-radius: 20px 20px 2px 2px;
	overflow: hidden;
	z-index: 99999;
	height: 400px;
	transition: all .5s;

	.upLoadTop {
		display: flex;
		align-items: center;
		// background-color: #32324D;
		padding: 8px 0 8px 26px;

		.topImg {
			width: 47px;
			height: 47px;
			margin-right: 15px;
		}

		.topText1 {
			font-size: 14px;
			margin-right: 5px;
		}

		.topText2 {
			color: #F7BE10;
			font-size: 14px;
		}
	}

	.upLoadContent {
		// background-color: #1A1A2F;
		padding: 20px;
		height: auto;
	}
}

.contentBox2 {
	margin-top: 32px;

	.content2 {
		display: flex;
		align-items: center;
		line-height: 25px;
	}

	.sizeBox {
		display: flex;
		margin-top: 27px;

		.sizeItem {
			width: 92px;
			height: 120px;
			border: 1px solid #B2B2B2;
			border-radius: 5px;
			margin-left: 12px;
			cursor: pointer;
			text-align: center;
		}

		.sizeSelect {
			width: 92px;
			height: 120px;
			border: 1px solid #4AA1FE;
			border-radius: 5px;
			margin-left: 12px;
			text-align: center;
			cursor: pointer;
		}
	}
}

.mask {
	width: 100%;
	height: 100vh;
	background-color: rgba(0, 0, 0, 0 0.3);
	position: absolute;
	z-index: 999998;
}

.selectItem {
	width: 64px;
	height: 32px;
	margin-right: 8px;
	text-align: center;
	line-height: 32px;
	border-radius: 6px;
	cursor: pointer;
}

.activeSelectItem {
	width: 64px;
	height: 32px;
	background: linear-gradient(90deg, #4CA5FF, #3076F5);
	margin-right: 8px;
	text-align: center;
	line-height: 32px;
	cursor: pointer;
	border-radius: 6px;
}

.end {
	width: 98%;
	display: flex;
	justify-content: center;
	position: absolute;
	bottom: 7px;
}

.padMapBox {
	margin-top: 8px;
	position: relative;
	margin-top: 170px;

	.imgSimilar {
		font-size: 10px;
		width: 100%;
		height: 26px;
		display: flex;
		justify-content: center;
		border-radius: 8px;
		cursor: pointer;

		.selectItemList {
			position: absolute;
			bottom: -150px;
			right: 10px;
			padding: 12px;
			border-radius: 8px;
			z-index: 999;

			.unSimilarSelect {
				font-size: 11px;
				display: flex;
				justify-content: space-between;
				align-items: center;
			}

			.similarSelect {
				font-size: 11px;
				display: flex;
				justify-content: space-between;
				align-items: center;
				color: #7369E2;

			}

			.similarSelect:hover {
				color: #7369E2;
			}
		}
	}

	.uploadBtn {
		color: #fff;
		height: 22px;
		line-height: 22px;
		padding: 0 6px;
		border-radius: 4px;
		background-color: #2860BE;
		text-align: center;
		cursor: pointer;
	}

	.padMapText {
		font-size: 10px
	}
}

.putAway {
	transform: rotate(-90deg);
	transition: all .2s;

	cursor: pointer;
}

.putExpand {
	cursor: pointer;
	transform: rotate(0);
	transition: all .2s;

}

.modePutAway {
	height: 0;
	overflow: hidden;
}

.modePutExpand {
	overflow: hidden;
}

.sizeBox {
	display: flex;
	flex-wrap: wrap;
}

.imgSizeItemSelect {
	width: 30%;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 8px;
	padding: 12px 0;
	border-radius: 8px;
	cursor: pointer;
	margin: 0 4px;
}

.imgSizeItem {
	border: 2px solid transparent;
	width: 30%;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 8px;
	padding: 12px 0;
	border-radius: 8px;
	margin: 0 4px;
	cursor: pointer;

}

.promptBox {
	padding: 4px 12px;
	font-size: 13px;
	margin-top: 32px;
	border-radius: 8px;
}

.radioBox {
	display: flex;
	justify-content: space-between;
	position: absolute;
	width: 100%;
	left: 0;
	padding: 10px 10px;
	bottom: 50px;
	z-index: 99;
}

.radioItem {
	display: flex;
	align-items: center;
}

.radioItemImgBox {
	width: 12px;
	height: 12px;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
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
		color: #fff;
		padding: 8px 12px;
		border-radius: 8px;
		cursor: pointer;
	}
}
.imgBox{
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    position: relative;
	.setSvg{
        position: absolute;
        right: 5px;
        bottom: 5px;
        width: 13px;
        height: 13px;
    }
}
.sizeInp {
	width: 22px;
	text-align: center;
	height: 18px;
	border-radius: 6px;
	color: #2960BE;
	line-height: 18px;
}
.loader {
	width: 50px;
	padding: 8px;
	aspect-ratio: 1;
	border-radius: 50%;
	background: #438FEF;
	--_m:
		conic-gradient(#0000 10%, #000),
		linear-gradient(#000 0 0) content-box;
	-webkit-mask: var(--_m);
	mask: var(--_m);
	-webkit-mask-composite: source-out;
	mask-composite: subtract;
	animation: l3 1s infinite linear;
}

@keyframes l3 {
	to {
		transform: rotate(1turn)
	}
}
</style>

