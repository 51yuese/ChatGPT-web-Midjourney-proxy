<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount, reactive, onMounted } from 'vue'
import axios from 'axios'
import textConfigure from './components/configure.vue'
import Suggestion from "@/views/midjourney/components/suggestion.vue";
import chatHistory from './components/chatHistory.vue'
import imgSize from "./components/imgSize.vue"
import drawLogView from './components/drawLogList.vue'
import { useAuthStore, useGlobalStore } from "@/store";
import { fetchChatAPIUpload } from "@/api/index"
import { fetchGetDraw, fetchMidjourneyDrawList, fetchMidjourneyGetList, fetchQuerySuggest, textToImageStyleSelect, fetchQueryIncantation ,fetchGetDrawMany} from "@/api/mjDraw";
import MobileText2Image from "@/views/midjourney/mobile/text2image.vue";
import { useBasicLayout } from "@/hooks/useBasicLayout";
import { MidjourneyStatusEnum } from "@/views/midjourney/components/mj-menu";
import NewSend from "@/views/midjourney/components/newSend.vue"
import { NSpace, NSlider, NSwitch, NUpload, useMessage, NTooltip } from 'naive-ui';
import EventBus from "@/hooks/eventBus";
import drawView from './components/drawView.vue';
import SiderBar from '../../layout/siderBar/index.vue';
import Loading1 from '@/components/base/Loading1.vue'
import { router } from "@/router";
import { utcToShanghaiTime } from "@/utils/date";
import popup from './components/popup.vue';
import UserDetails from './components/userDetails.vue';
import { useMidjourneyStore } from "@/store/modules/midjourney";
import { drawLsit } from "@/views/midjourney/components/mj-menu";
import { SvgIcon } from '@/components/common'
import defaultAvatar from "@/assets/avatar.png";
const globalStore = useGlobalStore();
const auth = useAuthStore();
const { isMobile } = useBasicLayout();
const resquestStatus = ref()
// const jobId = computed(() => auth.drawId);
const authStore = useAuthStore();
const midjourneyStore = useMidjourneyStore();
const showRegionDialog = computed(() => midjourneyStore.openRegionDialog);



const isLogin = computed(() => authStore.isLogin);
const avatar = computed(() => authStore.userInfo.avatar);
const username = computed(() => authStore.userInfo.username);
const userBalance = computed(() => authStore.userBalance);
const form = computed(() => authStore.mjDrawForm);
const jobId = ref()
const ms = useMessage()
const drawLogList = ref([])
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
const RecommendedWord = ref([])
fetchQuerySuggest({ page: 1, size: 20 }).then(res => {
	RecommendedWord.value = res.data.rows
})
const currentTask = ref({
	status: 0
})

// 获取当前绘图任务
const handleGetCurrentDraw = async (_jobId: string) => {

	if (!_jobId) {
		return;
	}
	const res = await fetchGetDrawMany({ jobIds: _jobId });
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

watch(() => showRegionDialog.value, (newValue) => {
	if (!newValue) {
		// 1s 后开始刷新任务状态
		setTimeout(() => {
			if (jobId.value) {
				handleGetCurrentDraw(jobId.value)
			} else if (newJob.value) {
				handleGetCurrentDraw(newJob.value)
			}
		}, 1000)
	}
})

const newJob = ref()
const toTop = ref(null)
const to = () => {
	let element = toTop.value
	element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
}
const to1 = () => {
	let element = toTop.value
	element.scrollTop = element.scrollHeight
}

const newJobIdList=ref([])
const newJobId = async (newjobId: string) => {
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
	setTimeout(() => to(), 100);
}


const jobidList=ref([])
const handleGetTask =async (id: string) => {
	console.log("提交任务成功")
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
	setTimeout(() => to(), 100);
}
const drawTimer = ref();

const handlePullByTimes = () => {
	drawTimer.value && clearTimeout(drawTimer.value);
	drawTimer.value = setTimeout(() => {
		if (
			currentTask.value?.status === MidjourneyStatusEnum.DRAWED ||
			currentTask.value?.status === MidjourneyStatusEnum.DRAWFAIL ||
			currentTask.value?.status === MidjourneyStatusEnum.DRAWTIMEOUT
		) {
			drawTimer.value && clearTimeout(drawTimer.value);
			resquestStatus.value = 0
			EventBus.emit("status", resquestStatus.value)
			drawLogList.value.push(currentTask.value)
			EventBus.emit("newDrawLogList", drawLogList.value)
			newJob.value = ""
			jobId.value = ""
			//获取绘画记录
			fetchMidjourneyDrawList({ page: 1, size: 20 }).then((res: any) => {
				localStorage.setItem("drawLogList", JSON.stringify(res.data.rows))
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
	{ name: "V 6.0", intro: "全新6.0 ALPHA真实风格图像", id: 0, value: " 6.0" },
	{ name: "V 5.2", intro: "增加真实风格图像细节", id: 1, value: " 5.2" },
	{ name: "V 5.1", intro: "专注真实艺术风格图像", id: 2, value: " 5.1" },
	{ name: "V 5.0", intro: "增加真实风格图像细节", id: 3, value: " 5" },
]
const nijiModeList = [
	{ name: "Niji 6", intro: "全新6.0 ALPHA真实风格图像", id: 0, value: " 6" },
	{ name: "Niji 5", intro: "增加真实风格图像细节", id: 1, value: " 5" },
	{ name: "Niji 4", intro: "专注真实艺术风格图像", id: 2, value: " 4" },
]
const modeIndex = ref(0)//选择mode
const uploadIsShow = ref(true)
function hanleSelectMode(data: any) {
	modeIndex.value = data.index
	EventBus.emit("--v", data.item.value)
	if (data.item.id != 0) {
		uploadIsShow.value = false
	} else {
		uploadIsShow.value = true
	}
}
const isSettingShow = ref(false)//高级设置是否显示
function handleChidren(res: boolean) {
	isSettingShow.value = res
	if (!res) {
		textareaValue.value = ""
	}
}
const textareaValue = ref("")//高级选项输入框内容

const sizeList = [
	{ name: "头像框", src: "/src/views/midjourney/img/1.png", id: 0, value: " 1:1" },
	{ name: "手机壁纸", src: "/src/views/midjourney/img/2.png", id: 1, value: " 1:2" },
	{ name: "电脑壁纸", src: "/src/views/midjourney/img/3.png", id: 2, value: " 16:9" },
	{ name: "宣传海报", src: "/src/views/midjourney/img/4.png", id: 3, value: " 9:16" },
	{ name: "文章配图", src: "/src/views/midjourney/img/5.png", id: 4, value: " 4:3" },
	{ name: "媒体配图", src: "/src/views/midjourney/img/6.png", id: 5, value: " 3:4" },
	{ name: "横版名片", src: "/src/views/midjourney/img/7.png", id: 6, value: " 3:2" },
	{ name: "小红书图", src: "/src/views/midjourney/img/8.png", id: 7, value: " 2:3" },
	{ name: "自定义", src: "/src/views/midjourney/img/6.png", id: 8, value: "" },
]//寸尺列表
const isSelect = ref(0)
function handleSize(index: number) {//选择尺寸
	isSelect.value = index
	EventBus.emit("sizeValue", '--ar' + sizeList[index].value);

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
	EventBus.emit("--no", textareaValue.value);
}

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
		base64Array.value = []
	}
	// EventBus.emit("base64Array", base64Array.value)
}
const uploadUrl = ref(`${import.meta.env.VITE_GLOB_API_URL}/upload/file`)
const pidImgForm = new FormData()
const roleImgForm = new FormData()
const styleImgForm = new FormData()
const pidImgList = ref([])//垫图数组
const roleImgList = ref([])//角色图片数组
const styleImgList = ref([])//风光图片数组

const handleBeforeUploadMj = async (ev: { file: { name: string, type: string, file: object }; fileList: FileList[] }) => {//垫图图片
	const fileName = ev.file.type.split("/")[1];
	const name = ev.file.name.split(".")[0];

	if (ev.fileList.length >= 3) {
		ms.warning("最多只能上传3张图片")
		return false;
	}
	pidImgForm.append('file', ev.file.file)
	const res = await axios.post(uploadUrl.value, pidImgForm, { headers: { 'Content-Type': 'multipart/form-data', } }).catch(err=>{
		ms.error(err.message)
	})
	// console.log("=====",res)
	pidImgForm.delete("file")
	pidImgList.value = [
		...pidImgList.value,
		...[{ url: res.data.data, name: name }]
	]
	EventBus.emit("pidImgList", pidImgList.value)
	return fileType.includes(fileName) && ev.fileList.length <= 3;
}
const handleRemoveImageToText1 = (ev: { file: { name: string; id: string; status: string; type: string; url: string; }; }) => {
	const name = ev.file.name;
	const fileName = ev.file.name.split(".")[0];
	form.value.extendParam = form.value.extendParam.filter(item => !item.filename.includes(name));
	pidImgList.value = pidImgList.value.filter(item => item.name != fileName)
	EventBus.emit("pidImgList", pidImgList.value)
	changeForm();
}

const handleBeforeUploadMj1 = async (ev: { file: { name: string, type: string }; fileList: FileList[] }) => {//角色一致性
	const fileName = ev.file.type.split('/')[1];
	const name = ev.file.name.split(".")[0];
	if (ev.fileList.length >= 1) {
		ms.warning("最多只能上传1张图片")
		return false;
	}
	roleImgForm.append('file', ev.file.file)
	const res = await axios.post(uploadUrl.value, roleImgForm, { headers: { 'Content-Type': 'multipart/form-data', } })
	roleImgForm.delete("file")
	roleImgList.value = [
		...roleImgList.value,
		...[{ url: res.data.data, name: name }]
	]
	console.log("角色", roleImgList.value)
	EventBus.emit("roleImgList", roleImgList.value)
	return fileType.includes(fileName) && ev.fileList.length <= 1;
}
const handleRemoveImageToText2 = (ev: { file: { name: string; id: string; status: string; type: string; url: string; }; }) => {
	const name = ev.file.name;
	const fileName = ev.file.name.split(".")[0];
	form.value.extendParam = form.value.extendParam.filter(item => !item.filename.includes(name));
	roleImgList.value = roleImgList.value.filter(item => item.name != fileName)
	EventBus.emit("roleImgList", roleImgList.value)
	changeForm();
}

const handleBeforeUploadMj2 = async (ev: { file: { name: string, type: string }; fileList: FileList[] }) => {//风格一致性
	const fileName = ev.file.type.split('/')[1];
	const name = ev.file.name.split(".")[0];
	if (ev.fileList.length >= 3) {
		ms.warning("最多只能上传3张图片")
		return false;
	}
	styleImgForm.append('file', ev.file.file)
	const res = await axios.post(uploadUrl.value, styleImgForm, { headers: { 'Content-Type': 'multipart/form-data', } })
	styleImgForm.delete("file")
	styleImgList.value = [
		...styleImgList.value,
		...[{ url: res.data.data, name: name }]
	]
	console.log("风格", styleImgList.value)
	EventBus.emit("styleImgList", styleImgList.value)
	return fileType.includes(fileName) && ev.fileList.length <= 3;
}
const handleRemoveImageToText3 = (ev: { file: { name: string; id: string; status: string; type: string; url: string; }; }) => {
	const name = ev.file.name;
	const fileName = ev.file.name.split(".")[0];
	styleImgList.value = styleImgList.value.filter(item => item.name != fileName)
	EventBus.emit("styleImgList", styleImgList.value)
	form.value.extendParam = form.value.extendParam.filter(item => !item.filename.includes(name));
	changeForm();
}



const handleRemoveImageToText = (ev: { file: { name: string; id: string; status: string; type: string; url: string; }; }) => {
	const name = ev.file.name;
	form.value.extendParam = form.value.extendParam.filter(item => !item.filename.includes(name));
	changeForm();
}
const changeForm = async () => {
	authStore.updateMjDrawForm(form.value)
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
const modeImgIdx = ref(0)
function modeImgClick(idx) {//模型选择点击图片
	modeImgIdx.value = idx
	modeIndex.value = 0
	if (idx == 0) {
		EventBus.emit("MjOrNj", "--v")
		EventBus.emit("--v", modeList[0].value)
	} else if (idx == 1) {
		EventBus.emit("MjOrNj", "--niji")
		EventBus.emit("--v", nijiModeList[0].value)
	}
}
const styleIdx = ref(0)
const container = ref(null)
const styleList = ref([])

//文生图风格选择
textToImageStyleSelect({ page: 1, size: 20, type: "style" }).then(res => {
	let dataList = res.data.filter(item => item.level == 2)
	styleList.value = dataList
	queryByPid(styleList.value[0].pid)
})
// dataList(styleList.value[0].pid)
function styleSelect(index) {//风格选择
	styleIdx.value = index
	let id = styleList.value[index].pid
	queryByPid(id)
	let containerRef = container.value
	if (30 * index >= 120) {
		containerRef.scrollTo({ left: 20 * index, behavior: 'smooth' })
	} else if (30 * index <= 150) {
		containerRef.scrollTo({ left: 20 * index, behavior: 'smooth' })
	}
}
const styleListChildren = ref([])
function queryByPid(id) {//获取风格
	let data = {
		id
	}
	fetchQueryIncantation(data).then(res => {
		if (res.data.rows.length) {
			styleListChildren.value = res.data.rows[0].children
		}
	})

}
const handleStatus = (res: number) => {
	resquestStatus.value = res
	if (res == 1) {
		roleSimilarValue.value = 0
		styleSimilarValue.value = 0
		StyleSliderValue.value = 0
		diversitySliderValue.value = 0
		stopSliderValue.value = 100
		wonderfulSliderValue.value = 0
		notWantValue.value = ""
		EventBus.emit("--cw", roleSimilarValue.value)
		EventBus.emit("--sw", styleSimilarValue.value)
		EventBus.emit("--s", StyleSliderValue.value)
		EventBus.emit("--c", diversitySliderValue.value)
		EventBus.emit("--weird", wonderfulSliderValue.value)
		EventBus.emit("--stop", stopSliderValue.value)
		EventBus.emit("--no", notWantValue.value)
	}
}
const roleSimilarValue = ref(0)//角色一致性滑块选择
const styleSimilarValue = ref(0)//风格一致性滑块选择
function handleRoleSlider() {//角色一致性滑块事件
	EventBus.emit("--cw", roleSimilarValue.value)
}
function handleStyleSlider() {//风格一致性滑块事件
	EventBus.emit("--sw", styleSimilarValue.value)

}
const parameterNum = ref(0)//种子
const StyleSliderValue = ref(0)//风格化  --s
const diversitySliderValue = ref(0)//多样性  --c
const wonderfulSliderValue = ref(0)//奇妙  --weird
const stopSliderValue = ref(100)//停止  --stop
const tileValue = ref(false)//无缝图案  --tile
function StyleSliderFn() {
	EventBus.emit("--s", StyleSliderValue.value)
}
function diversitySliderFn() {
	EventBus.emit("--c", diversitySliderValue.value)

}
function wonderfulSliderFn() {
	EventBus.emit("--weird", wonderfulSliderValue.value)
}
function stopSliderFn() {
	EventBus.emit("--stop", stopSliderValue.value)
}
function tileFn() {
	EventBus.emit("--tile", tileValue.value)
}
watch(() => showRegionDialog.value, (newValue) => {
	if (!newValue) {
		handleQueryTaskByPage()
	}
})
const modeBoxPutAway = ref(false)
const styleBoxPutAway = ref(false)
const padMapBoxPutAway = ref(false)
const roleBoxPutAway = ref(false)
const styleConsistentBoxPutAway = ref(false)
const noTwantBoxPutAway = ref(false)
const parameterBoxPutAway = ref(false)
function putAway(idx) {//展开收起
	if (idx == 0) {
		modeBoxPutAway.value = !modeBoxPutAway.value
	} else if (idx == 1) {
		styleBoxPutAway.value = !styleBoxPutAway.value
	} else if (idx == 2) {
		padMapBoxPutAway.value = !padMapBoxPutAway.value
	} else if (idx == 3) {
		roleBoxPutAway.value = !roleBoxPutAway.value
	} else if (idx == 4) {
		styleConsistentBoxPutAway.value = !styleConsistentBoxPutAway.value
	} else if (idx == 5) {
		noTwantBoxPutAway.value = !noTwantBoxPutAway.value
	} else if (idx == 6) {
		parameterBoxPutAway.value = !parameterBoxPutAway.value
	}
}
const notWantValue = ref("")//不想出现的词
function notWant() {
	EventBus.emit('--no', notWantValue.value)
}
const imgSimilarValue = ref("")
const ImgsimilarList = ref([
	{ name: "--iw 0.25 默认 相似度30%", id: 0, value: 0.25, isSelect: true },
	{ name: "--iw 0.5 相似度40%", id: 1, value: 0.5, isSelect: false },
	{ name: "--iw 1 相似度50%", id: 2, value: 1, isSelect: false },
	{ name: "--iw 1.25 相似度60%", id: 3, value: 1.25, isSelect: false },
	{ name: "--iw 1.5 相似度70%", id: 4, value: 1.5, isSelect: false },
	{ name: "--iw 1.75 相似度80%", id: 5, value: 1.75, isSelect: false },
	{ name: "--iw 2 相似度90%", id: 6, value: 2, isSelect: false },
])
imgSimilarValue.value = ImgsimilarList.value[0].name

const selectItemListIsShow = ref(false)
const selectItemListIsShow1 = ref(false)
function selectItemListShow() {
	selectItemListIsShow.value = !selectItemListIsShow.value
}
function selectItemListShow1() {
	selectItemListIsShow1.value = !selectItemListIsShow1.value
}
function handleSelectSimilar(item) {
	ImgsimilarList.value.forEach(item => {
		item.isSelect = false
	})
	item.isSelect = true
	imgSimilarValue.value = item.name
	selectItemListIsShow.value = false
	EventBus.emit('--iw', item.value)
}
const qualityList = ref([
	{ name: "1x - 默认", id: 0, isSelect: true, value: 1 },
	{ name: "0.25x", id: 1, isSelect: false, value: 0.25 },
	{ name: "0.5x", id: 2, isSelect: false, value: 0.5 },
])
const quality = ref("")
quality.value = qualityList.value[0].name
function handleSelectquality(item) {
	qualityList.value.forEach(item => {
		item.isSelect = false
	})
	item.isSelect = true
	quality.value = item.name
	selectItemListIsShow1.value = false
	EventBus.emit('--q', item.value)
}

function inputSeed() {//输入种子
	EventBus.emit("--seed", parameterNum.value)
}
const styleImgIndex = ref()
function handlestyleImgItem(data) {
	styleImgIndex.value = data.index
	EventBus.emit("styleWord", data.item.incantationEn)
}
const isMoreMode = ref(false)
function handleMoreMode() {
	isMoreMode.value = !isMoreMode.value
}
const isFocus = ref(false)
EventBus.on("isFocus", data => {
	isFocus.value = data
})
function handleTip(item) {
	isFocus.value = false
	EventBus.emit("suggestEn", item.suggestEn)
}
function handleMask() {
	isShowUserinfo.value = false
	isFocus.value = false
}
</script>

<template>
	<div class="mask" v-if="isShowUserinfo || isFocus" @click="handleMask"></div>
	<div v-if="isMobile">
		<MobileText2Image></MobileText2Image>
	</div>
	<div v-if="popIsShow">
		<popup @closePop="handleClosePop" @buy-vip="handleBuyVip"></popup>
	</div>
	<div class="text-image-container flex flex-row dark:bg-[#010102] bg-[#F4F4F4]" v-if="!isMobile" style="width: 100%;">
		<!-- 菜单栏 -->
		<SiderBar v-if="!isMobile" />
		<!-- <div class="w-full pt-2 px-20 h-[calc(100% - 60px)] flex flex-col justify-between"> -->
		<div style="width: 100%;">
			<!--	中间的对话框	-->
			<div class="h-full flex justify-start items-between" style="height: 100vh;width: 100%;overflow: hidden;">
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
					<div class="crollBox" style="margin-top: 150px;padding-bottom: 300px;overflow-y: scroll;height: 100%;">
						<div class="modeBox">
							<div class="modeTitle">
								<div style="font-size: 15px;font-weight: 500;">模型选择</div>
							</div>
							<div class="modePutExpand">
								<div class="modeImg">
									<div style="margin-right: 8px;" @click="modeImgClick(0)"
										:class="modeImgIdx == 0 ? 'select' : 'unSelect'">
										<div class="imgText">
											<p>Midjourney</p>
											<p>真实感强</p>
										</div>
										<img src="./img/image 6.png" alt="">
									</div>
									<div @click="modeImgClick(1)" :class="modeImgIdx == 1 ? 'select' : 'unSelect'">
										<div class="imgText">
											<p>Niji</p>
											<p>卡通动漫</p>
										</div>
										<img src="./img/image 6 (1).png" alt="">
									</div>
								</div>
								<div class="modeSelect" v-if="modeImgIdx == 0">
									<p>版本</p>
									<div :class="modeIndex == index ? 'modeItemSelect' : 'modeItem'"
										v-for="(item, index) in modeList" :key="item.id"
										@click="hanleSelectMode({ item, index })">
										{{ item.name }}</div>
								</div>
								<div class="modeSelect" v-if="modeImgIdx == 1">
									<p>版本</p>
									<div :class="modeIndex == index ? 'modeItemSelect' : 'modeItem'"
										v-for="(item, index) in nijiModeList" :key="item.id"
										@click="hanleSelectMode({ item, index })">
										{{ item.name }}</div>
								</div>
							</div>
						</div>
						<div class="styleMain">
							<div style="display: flex;">
								<div style="font-size: 15px;font-weight: 500;">风格选择</div>
							</div>
							<div class="modePutExpand">
								<div class="styleBox" ref="container">
									<div :class="styleIdx == index ? 'styleItemSelect' : 'styleItem'"
										@click="styleSelect(index)" v-for="(item, index) in styleList" :key="item.id">{{
											item.classifyName }}</div>
								</div>
								<div class="styleImgBox" :style="isMoreMode ? 'height: auto' : 'max-height:285px'">
									<!-- styleListChildren -->
									<div :class="styleImgIndex == index ? 'styleImgItemSelect' : 'styleImgItem'"
										v-for="(item, index) in styleListChildren"
										@click="handlestyleImgItem({ item, index })">
										<div class="styleImgText">{{ item.incantationCn }}</div>
										<img :src="item.img" alt="">
									</div>
								</div>
								<div v-if="styleListChildren.length > 9" @click="handleMoreMode"
									class="expand dark:bg-[#010102] bg-[#F4F4F4]">
									<img src="./img/Union.svg" alt="">
								</div>
							</div>
						</div>
						<div class="padMapBox" v-if="uploadIsShow">
							<div style="display: flex;justify-content: space-between;">
								<div style="display: flex;">
									<div :class="padMapBoxPutAway ? 'putExpand' : 'putAway'">
										<SvgIcon @click="putAway(2)" icon="material-symbols-light:expand-more-rounded"
											class="text-2xl"></SvgIcon>
									</div>
									<div style="font-size: 15px;font-weight: 500;">垫图图片（0-3张）</div>
								</div>
							</div>
							<div :class="padMapBoxPutAway ? 'modePutExpand' : 'modePutAway'">
								<div>
									<p class="padMapText text-[#A3A5A6] dark:text-[#76777A]" style="margin-top: 16px;">
										如需垫图请至少上传一张图片，图片总大小上限20M</p>
									<p class="padMapText text-[#FF3B30] dark:text-[#FF5E55]" style="margin-top: 6px;">
										严禁上传违规图(政治人物、色情、暴恐等)违者100%封号</p>
								</div>
								<div class="upLoadContent">
									<div>
										<n-upload accept=".jpg,.jpeg,.png" action="" :default-upload="false"
											:on-change="handleChangeUploadMixImage" :on-before-upload="handleBeforeUploadMj"
											:on-remove="handleRemoveImageToText1" list-type="image-card" directory-dnd>
										</n-upload>
									</div>
								</div>
								<div class="imgSimilar bg-[#F5F8FE] dark:bg-[#202B3A]">
									<div style="display: flex;align-items: center;">
										<div class="similarText">-- iw 图片相似度</div>
										<NTooltip trigger="hover" placement="top">
											<template #trigger>
												<img src="./img/Help.png" alt=""
													style="width: 14px;height: 14px;margin-left: 6px;margin-right: 7px;">
											</template>
											<div style="width: 280px;">--iw 值越高，上传的图像对最终效果的影响就越大</div>
										</NTooltip>
										<div style="width: 2px;height: 10px;margin-right: 7px;"
											class="dark:bg-[#484A4D] bg-[#D1D2D3]"></div>
										<div style="display: flex;align-items: center;justify-content: space-between;width: 145px;"
											@click="selectItemListShow()">
											<div>{{ imgSimilarValue }}</div>
											<SvgIcon icon="material-symbols-light:expand-more-rounded" class="text-2xl">
											</SvgIcon>
										</div>
										<div class="selectItemList bg-[#48484E] text-[#fff]" v-if="selectItemListIsShow">
											<div :class="item.isSelect ? 'similarSelect' : 'unSimilarSelect'"
												v-for="item in ImgsimilarList" :key="item.id"
												@click="handleSelectSimilar(item)">
												{{ item.name }}
												<SvgIcon v-if="item.isSelect" icon="dashicons:yes" class="text-2xl">
												</SvgIcon>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="roleConsistent" v-if="uploadIsShow">
							<div style="display: flex;justify-content: space-between;">
								<div style="display: flex;">
									<div :class="roleBoxPutAway ? 'putExpand' : 'putAway'">
										<SvgIcon @click="putAway(3)" icon="material-symbols-light:expand-more-rounded"
											class="text-2xl"></SvgIcon>
									</div>
									<div style="font-size: 15px;font-weight: 500;">角色一致性</div>
								</div>
							</div>
							<div :class="roleBoxPutAway ? 'modePutExpand' : 'modePutAway'">
								<div class="roleIntro text-[#A3A5A6] dark:text-[#76777A]">
									(--cref)请上传1张具有人脸的图片,图片大小上限为20M
								</div>
								<div class="upLoadContent">
									<div>
										<n-upload accept=".jpg,.jpeg,.png" action="" :default-upload="false"
											:on-change="handleChangeUploadMixImage"
											:on-before-upload="handleBeforeUploadMj1" :on-remove="handleRemoveImageToText2"
											list-type="image-card" directory-dnd>
										</n-upload>
									</div>
								</div>
								<div class="roleSimilar bg-[#F5F8FE] dark:bg-[#202B3A]">
									<div style="display: flex;align-items: center;">
										<div class="similarText">-- cw 角色一致性强度</div>
										<NTooltip trigger="hover" placement="top">
											<template #trigger>
												<img src="./img/Help.png" alt=""
													style="width: 14px;height: 14px;margin-left: 6px;margin-right: 7px;">
											</template>
											<div style="width: 280px;">强度为0时会专注面部一致，强度为100时会同时参考面部、头发和衣服。</div>
										</NTooltip>
										<div style="width: 102px;">
											<n-space vertical>
												<n-slider v-model:value="roleSimilarValue" :step="1" :max="100"
													@dragend="handleRoleSlider" />
											</n-space>
										</div>
										<div class="tex-[#3378ED] dark:text-[#2960BE]"
											style="margin-left: 8px;width: 20px;">{{
												roleSimilarValue }}</div>
									</div>
								</div>
							</div>

						</div>
						<div class="styleConsistent" v-if="uploadIsShow">
							<div style="display: flex;justify-content: space-between;">
								<div style="display: flex;">
									<div :class="styleConsistentBoxPutAway ? 'putExpand' : 'putAway'">
										<SvgIcon @click="putAway(4)" icon="material-symbols-light:expand-more-rounded"
											class="text-2xl"></SvgIcon>
									</div>
									<div style="font-size: 15px;font-weight: 500;">风格一致性</div>
								</div>
							</div>
							<div :class="styleConsistentBoxPutAway ? 'modePutExpand' : 'modePutAway'">
								<div class="styleIntro text-[#A3A5A6] dark:text-[#76777A]">
									(--sref)请上传1-3张风格相似的图片,图片大小上限为20M
								</div>
								<div class="upLoadContent">
									<div>
										<n-upload accept=".jpg,.jpeg,.png" action="" :default-upload="false"
											:on-change="handleChangeUploadMixImage"
											:on-before-upload="handleBeforeUploadMj2" :on-remove="handleRemoveImageToText3"
											list-type="image-card" directory-dnd>
										</n-upload>
									</div>
								</div>
								<div class="styleSimilar bg-[#F5F8FE] dark:bg-[#202B3A]">
									<div style="display: flex;align-items: center;">
										<div class="similarText">-- cw 风格一致性强度</div>
										<NTooltip trigger="hover" placement="top">
											<template #trigger>
												<img src="./img/Help.png" alt=""
													style="width: 14px;height: 14px;margin-left: 6px;margin-right: 7px;">
											</template>
											<div style="width: 280px;">这个值越低生成的四张图风格越相似，反之差异越大</div>
										</NTooltip>
										<div style="width: 102px;">
											<n-space vertical>
												<n-slider v-model:value="styleSimilarValue" :step="1" :max="100"
													@dragend="handleStyleSlider" />
											</n-space>
										</div>
										<div class="tex-[#3378ED] dark:text-[#2960BE]"
											style="margin-left: 8px;width: 20px;">{{
												styleSimilarValue }}</div>
									</div>
								</div>
							</div>

						</div>
						<div class="imgSize">
							<imgSize></imgSize>
						</div>
						<div class="notWant">
							<div style="display: flex;">
								<div :class="noTwantBoxPutAway ? 'putExpand' : 'putAway'">
									<SvgIcon @click="putAway(5)" icon="material-symbols-light:expand-more-rounded"
										class="text-2xl"></SvgIcon>
								</div>
								<div style="font-size: 15px;font-weight: 500;">不想出现的词</div>
							</div>
							<div :class="noTwantBoxPutAway ? 'modePutExpand' : 'modePutAway'">
								<textarea
									class="notWantText bg-[#F4F4F4] dark:bg-[#010102] dark:text-[#7E7F82] text-[#878A8B]"
									name="" id="" cols="30" rows="3" maxlength="200"
									placeholder="请输入不想出现在图像中的内容（例如：树木， 0/200）" @input="notWant"
									v-model="notWantValue"></textarea>
							</div>
						</div>
						<div class="parameterBox">
							<div style="display: flex;">
								<div :class="parameterBoxPutAway ? 'putExpand' : 'putAway'">
									<SvgIcon @click="putAway(6)" icon="material-symbols-light:expand-more-rounded"
										class="text-2xl"></SvgIcon>
								</div>
								<div style="font-size: 15px;font-weight: 500;">高级参数</div>
							</div>
							<div :class="parameterBoxPutAway ? 'modePutExpand' : 'modePutAway'">
								<div class="parameterItem dark:bg-[#202B3A] bg-[#F5F8FE]">
									<div>--seed 种子</div>
									<div class="parameterLine"></div>
									<input class="dark:text-[#2960BE] text-[#3378ED]" v-model="parameterNum"
										@input="inputSeed" type="number">
								</div>
								<div class="parameterItem dark:bg-[#202B3A] bg-[#F5F8FE]">
									<div>--s 风格化</div>
									<NTooltip trigger="hover" placement="top">
										<template #trigger>
											<img src="./img/Help.png" alt=""
												style="width: 14px;height: 14px;margin-left: 6px;margin-right: 7px;">
										</template>
										<div style="width: 280px;">这个值越低会更符合 prompt 的描述,数值越高艺术性就会越强，但跟 prompt关联性就会比较弱</div>
									</NTooltip>
									<div style="width: 120px;">
										<n-space vertical>
											<n-slider v-model:value="StyleSliderValue" :step="1" :max="100"
												@dragend="StyleSliderFn" />
										</n-space>
									</div>
									<div style="width: 20px;margin-left: 10px;color: #2960BE;">{{ StyleSliderValue }}</div>
								</div>
								<div class="parameterItem dark:bg-[#202B3A] bg-[#F5F8FE]">
									<div>--c 多样性</div>
									<NTooltip trigger="hover" placement="top">
										<template #trigger>
											<img src="./img/Help.png" alt=""
												style="width: 14px;height: 14px;margin-left: 6px;margin-right: 7px;">
										</template>
										<div style="width: 280px;">这个值越低生成的四张图风格越相似，反之差异越大</div>
									</NTooltip>
									<div style="width: 120px;">
										<n-space vertical>
											<n-slider v-model:value="diversitySliderValue" :step="1" :max="100"
												@dragend="diversitySliderFn" />
										</n-space>
									</div>
									<div style="width: 20px;margin-left: 10px;color: #2960BE;">{{ diversitySliderValue }}
									</div>
								</div>
								<div class="parameterItem dark:bg-[#202B3A] bg-[#F5F8FE]">
									<div>--quality 质量</div>
									<div class="parameterLine"></div>
									<div
										style="display: flex;flex: 1;justify-content: space-between;cursor: pointer;align-items: center;">
										<div style="display: flex;justify-content: space-between;width: 100%;"
											@click="selectItemListShow1">
											<div>{{ quality }}</div>
											<div>
												<SvgIcon icon="material-symbols-light:expand-more-rounded" class="text-2xl">
												</SvgIcon>
											</div>
										</div>
										<div class="selectItemList bg-[#48484E] text-[#fff]" v-if="selectItemListIsShow1">
											<div :class="item.isSelect ? 'similarSelect' : 'unSimilarSelect'"
												v-for="item in qualityList" :key="item.id"
												@click="handleSelectquality(item)">
												{{ item.name }}
												<SvgIcon v-if="item.isSelect" icon="dashicons:yes" class="text-2xl">
												</SvgIcon>
											</div>
										</div>
									</div>
								</div>
								<div class="parameterItem dark:bg-[#202B3A] bg-[#F5F8FE]">
									<div>--weird 奇妙</div>
									<NTooltip trigger="hover" placement="top">
										<template #trigger>
											<img src="./img/Help.png" alt=""
												style="width: 14px;height: 14px;margin-left: 6px;margin-right: 7px;">
										</template>
										<div style="width: 280px;">生成的图像引入奇特和离奇的特质，从而产生独特而意想不到的结果</div>
									</NTooltip>
									<div style="width: 110px;">
										<n-space vertical>
											<n-slider v-model:value="wonderfulSliderValue" :step="1" :max="100"
												@dragend="wonderfulSliderFn" />
										</n-space>
									</div>
									<div style="width: 22px;margin-left: 10px;color: #2960BE;">{{ wonderfulSliderValue }}
									</div>
								</div>
								<div class="parameterItem dark:bg-[#202B3A] bg-[#F5F8FE]">
									<div>--stop 停止</div>
									<NTooltip trigger="hover" placement="top">
										<template #trigger>
											<img src="./img/Help.png" alt=""
												style="width: 14px;height: 14px;margin-left: 6px;margin-right: 7px;">
										</template>
										<div style="width: 280px;">使用"--stop"参数可以在作业进行到对应的任务百分比时终止任务，比如50，在任务的50%进度时终止任务
										</div>
									</NTooltip>
									<div style="width: 110px;">
										<n-space vertical>
											<n-slider v-model:value="stopSliderValue" :step="1" :max="100" :min="10"
												@dragend="stopSliderFn" />
										</n-space>
									</div>
									<div style="width: 20px;margin-left: 10px;color: #2960BE;">{{ stopSliderValue }}</div>
								</div>
								<!-- <div class="parameterItem dark:bg-[#202B3A] bg-[#F5F8FE]">
									<div>--tile 无缝图案</div>
									<n-space>
										<NSwitch v-model:value="tileValue" @update:value="tileFn" size="small" />
									</n-space>
								</div> -->
							</div>

						</div>
					</div>
					<div class="userInfoBox dark:bg-[#15171A] bg-[#FFFFFF]">
						<div class="userInfoAvatar">
							<img class="avatar" :src="avatar ? avatar : defaultAvatar" alt=""
								@click="isShowUserinfo = true">
						</div>
						<div>
							<div class="userInfoNicknmae" style="margin-left: 12px;font-weight: bold;font-size: 17px;">{{
								username }}</div>
							<div class="drawIntegral text-[#A3A5A6] dark:text-[#76777A]" style="margin-left: 12px;">
								绘画积分:{{ userBalance?.drawMjCount }}</div>
						</div>
					</div>
				</div>
				<div class="contentCenter bg-[#fff] dark:bg-[#15171A]">
					<div class="contentCenterTop border-b-[2px] dark:border-[#000000] border-[#D1D1D1]">
						<span class="text-[#808080] dark:text-[#fff]"># &nbsp;创作中心</span>
						<span
							style="color: #EDB830;">&nbsp;&nbsp;&nbsp;&nbsp;请遵守中华人民共和国网络安全法，严禁生成涉及政治人物、色情、恐怖等不良内容，如有违规封号处理</span>
					</div>
					<div style="overflow-y: auto;position: relative;flex: 1;" ref="toTop">
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
						<template v-if="drawLogList.length != 0 || jobId">
							<div class="drawList">
								<div style="margin-top: 10px;">
									<drawLogView :drawLogList="drawLogList" @newJobId="newJobId"></drawLogView>
								</div>
								<chatHistory :task="currentTask" @refresh="handleGetTask" v-if="jobId"></chatHistory>
								<drawView :task="currentTask" v-if="newJob" @newJob="newJobId"></drawView>
							</div>
						</template>
					</div>
					<div class="bg-[#fff] dark:bg-[#15171A] newSendBox">
						<div class="tipBox dark:bg-[#202B3A] bg-[#f9f9f9]" v-if="isFocus">
							<div class="tip dark:bg-[#202B3A] bg-[#f9f9f9]">
								<p>推荐关键词</p>
								<SvgIcon @click="isFocus = false" style="cursor: pointer;" icon="mdi:close-circle"
									class="text-2xl"></SvgIcon>
							</div>
							<div class="itemBox">
								<div class="tipItem" v-for="item in RecommendedWord" :key="item.id"
									@click="handleTip(item)">
									<div style="margin-right: 12px;">
										<img style="width: 40px;height: 40px;border-radius: 50%;" :src="item.image" alt="">
									</div>
									<div>
										<p style="font-size: 15px;">{{ item.suggestCn }}</p>
										<p style="font-size: 13px;">{{ item.suggestEn }}</p>
									</div>
								</div>
							</div>
						</div>
						<NewSend :sendType="0" @isSettingShow="handleChidren" @getjob-id="handleGetTask"
							@resquest-status="handleStatus">
						</NewSend>
					</div>
				</div>

			</div>
		</div>

	</div>
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
		margin-top: 8px;
		padding: 8px 0;

		.modeTitle {
			display: flex;
		}

		.modeImg {
			display: flex;
			justify-content: center;
			margin-top: 12px;
			padding-right: 8px;

			.unSelect {
				cursor: pointer;
				position: relative;
				border-radius: 8px;
				overflow: hidden;
				border: 2px solid transparent;

			}

			.select {
				border: 2px solid #1A67D3;
				border-radius: 8px;
				overflow: hidden;
				cursor: pointer;
				position: relative;
			}

			.imgText {
				background: rgba(0, 0, 0, 0.4);
				color: #fff;
				width: 100%;
				height: 100%;
				position: absolute;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
			}
		}

		.modeSelect {
			display: flex;
			align-items: center;
			padding: 8px 0;

			.modeItem {
				border: 1px solid #76777A;
				color: #8D9090;
				padding: 0 8px;
				height: 18px;
				line-height: 20px;
				border-radius: 4px;
				text-align: center;
				margin-left: 8px;
				cursor: pointer;
			}

			.modeItemSelect {
				border: 1px solid #2C6BD6;
				color: #2C6BD6;
				padding: 0 8px;
				height: 18px;
				line-height: 20px;
				border-radius: 4px;
				text-align: center;
				margin-left: 8px;
				cursor: pointer;
			}
		}

	}

	.styleBox {
		display: flex;
		overflow-x: auto;
		margin-top: 16px;

		.styleItem {
			margin-right: 20px;
			flex-shrink: 0;
			cursor: pointer;
		}

		.styleItemSelect {
			margin-right: 20px;
			flex-shrink: 0;
			cursor: pointer;
			color: #0058EA;
		}
	}

	.styleImgBox {
		display: flex;
		flex-wrap: wrap;
		overflow: hidden;

		.styleImgItemSelect {
			cursor: pointer;
			margin-right: 5px;
			border: 2px solid #006DF7;
			width: 86px;
			height: 86px;
			margin-top: 8px;
			border-radius: 8px;
			overflow: hidden;
			position: relative;
			text-align: center;

		}

		.styleImgItem {
			cursor: pointer;
			margin-right: 5px;
			border: 2px solid transparent;
			width: 86px;
			height: 86px;
			margin-top: 8px;
			border-radius: 8px;
			overflow: hidden;
			position: relative;
			text-align: center;


		}

		.styleImgText {
			position: absolute;
			bottom: 0;
			width: 100%;
			background: rgba(0, 0, 0, 0.4);
			height: 26px;
			line-height: 26px;
			color: #fff;
		}

		img {
			width: 100%;
			height: 100%;
		}
	}

	.expand {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 26px;
		border-radius: 8px;
		margin-top: 8px;
		cursor: pointer;
	}

	.padMapBox {
		margin-top: 8px;
		position: relative;

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
				.unSimilarSelect:hover{
					color: #7369E2;
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

	.roleConsistent {
		margin-top: 8px;

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

		.roleIntro {
			font-size: 10px;
			margin-top: 15px;
		}

		.roleSimilar {
			font-size: 10px;
			width: 100%;
			height: 26px;
			display: flex;
			justify-content: center;
			border-radius: 8px;
			cursor: pointer;
		}
	}

	.styleConsistent {
		margin-top: 8px;

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

		.styleIntro {
			font-size: 10px;
			margin-top: 15px;
		}

		.styleSimilar {
			font-size: 10px;
			width: 100%;
			height: 26px;
			display: flex;
			justify-content: center;
			border-radius: 8px;
			cursor: pointer;
		}
	}

	.imgSize {
		margin-top: 8px;

		.sizeBox {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-around;

			.sizeItemSelect {
				position: relative;
				width: 30%;
				height: 124px;
				border-radius: 8px;
				padding: 12px 0;
				flex-shrink: 0;
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-top: 8px;
				cursor: pointer;
				border: 2px solid #2960BE;
			}

			.sizeItem {
				position: relative;
				width: 30%;
				height: 124px;
				border-radius: 8px;
				padding: 12px 0;
				flex-shrink: 0;
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-top: 8px;
				cursor: pointer;
				border: 2px solid transparent;
			}

			.sizeInp {
				width: 22px;
				text-align: center;
				height: 18px;
				border-radius: 6px;
				color: #2960BE;
			}
		}
	}

	.notWant {
		margin-top: 8px;

		.notWantText {
			width: 100%;
			padding: 12px;
			border-radius: 8px;
			resize: none;
			margin-top: 8px;
		}
	}

	.parameterBox {
		margin-top: 8px;

		.parameterItem {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 6px 12px;
			border-radius: 8px;
			margin-top: 8px;
			position: relative;

			.parameterLine {
				width: 2px;
				height: 12px;
				background-color: #D1D2D3;
				margin: 0 5px;
			}

			input {
				background-color: transparent;
			}

			.selectItemList {
				position: absolute;
				bottom: -85px;
				width: 150px;
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
				.unSimilarSelect:hover{
					color: #7369E2;
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
	}

	.userInfoBox {
		width: 280px;
		padding: 12px 0;
		display: flex;
		position: absolute;
		bottom: 0;

		.userInfoAvatar {
			width: 42px;
			height: 42px;
			border-radius: 6px;
			overflow: hidden;

			img {
				width: 100%;
				height: 100%;
				margin-right: 12px;
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
			cursor: pointer;
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
	padding: 12px 12px 0 12px;
	border-radius: 12px;
	margin-top: 10px;
	margin-right: 12px;
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.newSendBox {
	margin-top: 0px;
	height: 200px;
	position: relative;
	z-index: 99999999;

	.tipBox {
		width: 98%;
		position: absolute;
		z-index: 999999;
		bottom: 190px;
		margin: 0 10px;
		padding: 15px;
		border-radius: 8px;

		.tip {
			display: flex;
			justify-content: space-between;
			width: 100%;
			position: absolute;
			top: 0;
			left: 0;
			padding: 15px;
			border-radius: 8px;
		}

		.itemBox {
			margin-top: 20px;
			height: 400px;
			overflow-y: auto;

		}

		.tipItem {
			display: flex;
			margin-top: 20px;
			cursor: pointer;
		}
	}
}

.contentCenterTop {
	padding: 10px 0;
	height: 40px;
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

.none {
	width: 100%;
	height: 0;
	position: absolute;
	z-index: 999;
	border-radius: 10px;
	overflow: auto;
	bottom: 245px;
	// padding-bottom: 40px;
	transition: all .3s;
}

.setting {
	width: 100%;
	height: 680px;
	// background-color: #1A1A2F;
	position: absolute;
	z-index: 9999;
	bottom: 247px;
	border-radius: 10px;
	overflow: auto;
	padding-bottom: 40px;
	transition: all .3s;

	.settingText {
		font-size: 18px;
	}

	.settingTitle {
		display: flex;
		height: 65px;
		// background-color: #272740;
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
				// background-color: #1A1A2F;
				// border: 1px solid #5B5B7A;
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
					cursor: pointer;
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
						// background-color: #272740;
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

.setting::-webkit-scrollbar {
	display: none
}

.itemBox::-webkit-scrollbar {
	display: none
}

.drawList {
	width: 100%;
	overflow: auto;
}

.upLoadContent {
	// background-color: #1A1A2F;
	padding: 20px;
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

.crollBox::-webkit-scrollbar {
	display: none;
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
}</style>
