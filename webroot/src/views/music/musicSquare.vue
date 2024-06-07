<script setup lang="ts">
import SiderBar from '../../layout/siderBar/index.vue';
import { useBasicLayout } from "@/hooks/useBasicLayout";
import { SvgIcon } from '@/components/common'
import { computed, ref, defineEmits, onMounted } from "vue";
import { useAppStore } from "@/store";
import { musicSquare, musicLike, musicPlay, queryMusicGroup, createMusicGroup, allQuery, musicDelect, musicAgree } from "@/api/music"
import { useRouter } from "vue-router";
import axios from "axios"
import Loading from '@/components/base/Loading.vue'
import { NSpace, NSwitch, NTooltip, NSpin, useMessage } from 'naive-ui';
import type { MessageReactive } from 'naive-ui'
import { useAuthStore } from '@/store'
import { parseMusicText } from '@/utils/format';

const message = useMessage()
const authStore = useAuthStore()
const isLogin = computed(() => authStore.isLogin);

let messageReactive: MessageReactive | null = null
const router = useRouter()
const appStore = useAppStore()
const darkMode = computed(() => appStore.theme === 'dark')
const { isMobile } = useBasicLayout();
const tabBox = ref([
	{ name: "最新歌曲", key: 0 },
	{ name: "流行趋势", key: 1 },
])
const tabIndex = ref(0)
const pageNum = ref(1)
const countNum = ref()//总条数
const tabValue = ref("")
const squareType = ref("")
function changeTab(){
	squareList.value=[]
	let data = {
			size: 50,
			page: pageNum.value,
			order: squareType.value
		}
		musicSquare(data).then(res => {
			countNum.value = res.data.count
			const newData = res.data.records.filter(item => item.text).map(item => {
				const [first, second] = parseMusicText(item.text);
				item.title = first.title;
				item.image = first.image;
				item.agree = item.agree;
				item.agreeNum = item.agreeNum;
				item.operation = first.operation;
				item.intro = first.intro;
				item.mp3 = first.mp3;
				item.mp4 = first.mp4;
				return item;
			})
			squareList.value = newData
			removeMessage()
		}).catch(err => {
			removeMessage()
		})
}
const handleTab = (idx: number) => {
	tabIndex.value = idx
	pageNum.value = 1
	if (idx == 0) {
		tabValue.value = ""
		squareType.value = ""
		changeTab()
	} else if (idx == 1) {
		squareType.value = "agreeNum"
		changeTab()
	}
}
const squareList = ref([])//广场数据
handleSquare()
queryMusicGroup({ modelType: "music" }).then(res => {
	if (res.data.length != 0) {
		localStorage.setItem("musicGroupId", res.data[0].id)
	} else if (res.data.length == 0) {
		createMusicGroup({ modelType: "music" }).then(res => {
			localStorage.setItem("musicGroupId", res.data.id)
		})
	}
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

function handleSquare() {
	createMessage1()
	let data = {
		size: 50,
		page: pageNum.value,
		order: squareType.value
	}
	musicSquare(data).then(res => {
		countNum.value = res.data.count
		const newData = res.data.records.filter(item => item.text).map(item => {
			const [first, second] = parseMusicText(item.text);
			item.title = first.title;
			item.image = first.image;
			item.agree = item.agree;
			item.agreeNum = item.agreeNum;
			item.operation = first.operation;
			item.intro = first.intro;
			item.mp3 = first.mp3;
			item.mp4 = first.mp4;
			return item;
		})
		squareList.value = [
			...squareList.value,
			...newData
		]
		removeMessage()
	}).catch(err => {
		removeMessage()
	})
}

const likeStatus = ref(1)//点赞状态    0锁定，1放行
function handleLike(item) {//点赞
	let data = {
		relateId: item.chatId,
		action: "agree",
		relateType: "suno"
	}
	if (likeStatus.value == 0) {
		return
	}
	likeStatus.value = 0
	musicAgree(data).then(res => {
		if (item.agree) {
			squareList.value.forEach(ite => {
				if (ite.chatId == item.chatId) {
					ite.agree = null
					ite.agreeNum--
				}
			})
		} else {
			squareList.value.forEach(ite => {
				if (ite.chatId == item.chatId) {
					ite.agree = "agree"
					ite.agreeNum++
				}
			})
		}
		likeStatus.value = 1
	})
}

const playVideo = ref("")//当前播放的视频
const isPlay = ref(true)//是否播放
function handlePlay() {//暂停开始
	const video = document.getElementById('video');
	if (isPlay.value) {
		isPlay.value = false
		//暂停
		video.pause()
	} else {
		isPlay.value = true
		// 播放
		video.play()
	}
}

function handleWatch(item) {//观看

	if (!isLogin.value) {
		authStore.setLoginDialog(true)
		return
	}

	playVideo.value = item.mp4
	let data = {
		recoredId: item.chatId
	}
	item.playNum++
	musicPlay(data).then(res => {

	})
}

function handleCheckout(type) {//上一首、下一首，type=0上一首，1下一首
	let mp4List = []
	squareList.value.forEach(item => {
		mp4List = [
			...mp4List,
			item.mp4
		]
	})
	let idx = mp4List.indexOf(playVideo.value)
	if (type == 0) {
		if (idx == 0) {
			return
		}
		idx--
		let data = {
			recoredId: squareList.value[idx].chatId
		}
		squareList.value[idx].playNum++
		musicPlay(data).then(res => {

		})
		playVideo.value = mp4List[idx]
	} else if (type == 1) {
		if (idx == mp4List.length - 1) {
			return
		}
		idx++
		let data = {
			recoredId: squareList.value[idx].chatId
		}
		squareList.value[idx].playNum++
		musicPlay(data).then(res => {

		})
		playVideo.value = mp4List[idx]
	}
}

const operation = ref(false)

function handleMore(item) {//更多
	item.operation = true
	operation.value = true
}

function removeMessage() {
	if (messageReactive) {
		messageReactive.destroy()
		messageReactive = null
	}
}

function createMessage1() {//数据加载
	if (!messageReactive) {
		messageReactive = message.loading("数据加载中", {
			duration: 0
		})
	}
}

function createMessage() {//下载中
	if (!messageReactive) {
		messageReactive = message.loading("下载中，请稍等", {
			duration: 0
		})
	}
}

function handleDownload(item: object, type: string) {//下载

	if (!isLogin.value) {
		authStore.setLoginDialog(true)
		return
	}

	let baseURL = import.meta.env.VITE_GLOB_API_URL
	createMessage()
	if (type == "mp4") {
		closeMask()
		let fileName = item.mp4.split('/').pop()
		axios.get(baseURL + '/proxy/down', {
			responseType: 'blob',
			params: { url: item.mp4 }
		}).then(res => {
			const url = window.URL.createObjectURL(new Blob([res.data]))
			const link = document.createElement("a")
			link.href = url
			link.setAttribute("download", fileName)
			link.click()
			removeMessage()
			message.success("下载成功")
		})
	} else if (type == "mp3") {
		closeMask()
		let fileName = item.mp3.split('/').pop()
		axios.get(baseURL + '/proxy/down', {
			responseType: 'blob',
			params: { url: item.mp3 }
		}).then(res => {
			const url = window.URL.createObjectURL(new Blob([res.data]))
			const link = document.createElement("a")
			link.href = url
			link.setAttribute("download", fileName)
			link.click()
			removeMessage()
			message.success("下载成功")
		})
	}
}

function handleSimilar(item) {//生成类似
	router.push({
		path: "/music/creativeCenter",
		query: {
			id: item.chatId
		}
	})
}

function closeMask() {
	operation.value = false
	squareList.value.forEach(item => {
		item.operation = false
	})
}

const container = ref(null)

function handleScroll() {
	const containerRef = container.value
	if (containerRef.scrollTop + containerRef.clientHeight + 1 >= containerRef.scrollHeight) {
		if (pageNum.value * 30 >= countNum.value) {
			message.error("没有更多数据了")
			return
		}
		pageNum.value++
		handleSquare()
	}
}
</script>
<template>
	<div class="bg-[#f4f4f4] dark:bg-[#020104] musicBody">
		<SiderBar :sideType="1" v-if="!isMobile" />
		<div class="mask" v-if="operation" @click="closeMask"></div>
		<div class="mainBox">
			<div class="videoBox" v-if="playVideo">
				<div style="width: 504px;height: 756px;border-radius: 8px;position: relative;display: flex;flex-direction: column;justify-content: center;align-items: center;"
					class="bg-[#E5EDFE] dark:bg-[#0A182F]">
					<div style="width: 50px;height: 50px;">
						<div class="loader"></div>
					</div>
					<p style="margin-top: 10px;">视频生成中，请稍等</p>
				</div>
				<video class="video" autoplay id="video" loop :src="playVideo"></video>
				<SvgIcon icon="icon-park-solid:close-one" class="text-xl text-[#fff] text-center icon"
					@click="playVideo = ''"></SvgIcon>
				<div class="control">
					<img class="controlItem" style="cursor: pointer;" src="./img/start.png" alt=""
						@click="handleCheckout(0)">
					<img class="controlItem" v-if="isPlay" src="./img/false.svg" style="margin: 0 50px;cursor: pointer;"
						alt="" @click="handlePlay">
					<img class="controlItem" v-if="!isPlay" src="./img/play.png" style="margin: 0 50px;cursor: pointer;"
						alt="" @click="handlePlay">
					<img class="controlItem" style="cursor: pointer;" src="./img/end.png" alt="" @click="handleCheckout(1)">
				</div>
			</div>
			<div
				class="musicSquareTitle bg-[#fff] dark:bg-[#15171A] border-[1px] border-b dark:border-[#020104] border-[transparent]">
				<SvgIcon icon="akar-icons:music-album" class="text-xl text-center"></SvgIcon>
				<div style="margin-left: 4px;">音乐广场</div>
			</div>
			<div style="height: 87vh;border-radius: 0 0 12px 12px;" class=" bg-[#fff] dark:bg-[#15171A]">
				<div class="contentBox bg-[#fff] dark:bg-[#15171A]">
					<div class="tabBox">
						<div :class="tabIndex == index ? 'bg-[#3378ED] text-[#fff]' : 'bg-[#F4F4F4] dark:bg-[#010102]'"
							class="tabItem" @click="handleTab(index)" v-for="(item, index) in tabBox" :key="item.key">{{
								item.name }}
						</div>
					</div>
					<div class="content" ref="container" @scroll="handleScroll">
						<div class="contentItem" v-for="item in squareList" :key="item.chatId">
							<div class="itemTop bg-[#F5F8FE] dark:bg-[#0A182F]">
								<img class="topImg" :src="item.image" alt="加载失败">
								<div class="topTitle">
									<div class="title">{{ item.title == "" ? '匿名' : item.title }}</div>
									<div class="intro">{{ item.intro }}</div>
								</div>
							</div>
							<div v-if="darkMode" class="itemBottomDark">
								<div class="iconBox">
									<!-- 观看次数 -->
									<SvgIcon icon="gridicons:play" class="text-xl text-center icon"
										@click="handleWatch(item)"></SvgIcon>
									<div style="margin-left: 4px;">{{ item.playNum ? item.playNum : 0 }}</div>
								</div>
								<div class="iconBox">
									<!-- 点赞次数 -->
									<SvgIcon v-if="item.agree == 'agree'" icon="iconamoon:like-fill"
										class="text-xl text-center icon" @click="handleLike(item)"></SvgIcon>
									<SvgIcon v-else icon="iconamoon:like-light" class="text-xl text-center icon"
										@click="handleLike(item)"></SvgIcon>
									<div style="margin-left: 4px;">{{ item.agreeNum ? item.agreeNum : 0 }}</div>
								</div>
								<!-- <div class="iconBox">
										转发
										<SvgIcon icon="charm:forward" class="text-xl text-center icon"></SvgIcon>
								</div> -->
								<div class="iconBox" style="position: relative;">
									<!-- 更多 -->
									<SvgIcon icon="ri:more-line" class="text-xl text-center icon" @click="handleMore(item)">
									</SvgIcon>
									<div class="operationBox bg-[#fff] dark:bg-[#15171A]" v-if="item.operation">
										<!-- <div class="operationItem" @click="handleSimilar(item)">生成类似</div> -->
										<div class="operationItem" style="display: flex;"
											@click="handleDownload(item, 'mp4')">
											<SvgIcon icon="gravity-ui:video" style="margin-right: 5px;"
												class="text-xl text-center"></SvgIcon>
											<div>下载视频</div>
										</div>
										<div class="operationItem" style="display: flex;"
											@click="handleDownload(item, 'mp3')">
											<SvgIcon icon="fluent:headphones-sound-wave-24-filled"
												style="margin-right: 5px;" class="text-xl text-center"></SvgIcon>
											<div>下载音频</div>
										</div>
										<!-- <div class="operationItem" style="display: flex;color:#FF5E55 ;" @click="musicDelectFn(item)">
												<SvgIcon icon="mi:delete" style="margin-right: 5px;" class="text-xl text-center"></SvgIcon>
												<div>删除</div>
										</div> -->
									</div>
								</div>
							</div>
							<div v-else class="itemBottomLight">
								<div class="iconBox">
									<!-- 观看次数 -->
									<SvgIcon icon="gridicons:play" class="text-xl text-center icon"
										@click="handleWatch(item)"></SvgIcon>
									<div style="margin-left: 4px;"> {{ item.playNum ? item.playNum : 0 }}</div>
								</div>
								<div class="iconBox">
									<!-- 点赞次数 -->
									<SvgIcon v-if="item.agree" icon="iconamoon:like-fill" class="text-xl text-center icon"
										@click="handleLike(item)"></SvgIcon>
									<SvgIcon v-else icon="iconamoon:like-light" class="text-xl text-center icon"
										@click="handleLike(item)"></SvgIcon>
									<div style="margin-left: 4px;">{{ item.agreeNum ? item.agreeNum : 0 }}</div>
								</div>
								<!-- <div class="iconBox">
										转发
										<SvgIcon icon="charm:forward" class="text-xl text-center icon"></SvgIcon>
								</div> -->
								<div class="iconBox" style="position: relative;">
									<!-- 更多 -->
									<SvgIcon icon="ri:more-line" class="text-xl text-center icon" @click="handleMore(item)">
									</SvgIcon>
									<div class="operationBox bg-[#fff] dark:bg-[#15171A]" v-if="item.operation">
										<!-- <div class="operationItem">生成类似</div> -->
										<div class="operationItem" style="display: flex;">
											<SvgIcon icon="gravity-ui:video" style="margin-right: 5px;"
												class="text-xl text-center"></SvgIcon>
											<div>下载视频</div>
										</div>
										<div class="operationItem" style="display: flex;">
											<SvgIcon icon="fluent:headphones-sound-wave-24-filled"
												style="margin-right: 5px;" class="text-xl text-center"></SvgIcon>
											<div>下载音频</div>
										</div>
										<!-- <div class="operationItem" style="display: flex;color:#FF5E55 ;" @click="musicDelectFn(item)">
												<SvgIcon icon="mi:delete" style="margin-right: 5px;" class="text-xl text-center"></SvgIcon>
												<div>删除</div>
										</div> -->
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="end text-[#A3A5A6] dark:text-[#76777A]">版权所有 © {{ copyrightTitle }} <a :href="icpUrl || '#'"><a
							:href="policeFilingUrl || '#'">{{ policeFilingNumber }}</a>{{ icpNumber }}</a></div>
			</div>
		</div>
	</div>
</template>
<style lang="scss" scoped>
.musicBody {
	width: 100%;
	height: 100%;
	display: flex;
	padding-right: 10px;

	.mainBox {
		width: 100%;
		margin-top: 10px;
		position: relative;

		.icon {
			cursor: pointer;
		}

		.videoBox {
			position: absolute;
			width: 504px;
			top: 20px;
			left: calc(50% - 252px);
			z-index: 99;
			border-radius: 12px;
			overflow: hidden;

			.video {
				position: absolute;
				top: 0;
				z-index: 101;
			}

			.icon {
				position: absolute;
				top: 10px;
				right: 10px;
				z-index: 102;
			}

			.control {
				width: 100%;
				position: absolute;
				bottom: 0;
				left: 0;
				background: rgba(0, 0, 0, 0.24);
				backdrop-filter: blur(4.6px);
				z-index: 102;
				height: 72px;
				display: flex;
				justify-content: center;
				align-items: center;

				.controlItem {
					width: 42px;
					height: 42px;
				}
			}
		}

		.musicSquareTitle {
			width: 100%;
			display: flex;
			padding: 12px;
			border-radius: 12px 12px 0 0;
			box-sizing: border-box;
		}

		.contentBox {
			width: 100%;
			height: calc(100% - 50px);
			border-radius: 0 0 12px 12px;
			overflow: hidden;

			.tabBox {
				display: flex;
				padding: 12px 0 0 35px;

				.tabItem {
					cursor: pointer;
					padding: 0 12px;
					height: 36px;
					line-height: 36px;
					border-radius: 8px;
					margin-right: 12px;
				}
			}

			.content {
				padding: 0 20px 80px 20px;
				display: flex;
				justify-content: flex-start;
				flex-shrink: 1;
				flex-wrap: wrap;
				overflow-y: auto;
				height: 100%;

				.contentItem {
					width: 31%;
					// height: 300px;
					// margin-top: 20px;
					margin: 20px 11px 0 11px;

					.itemTop {
						display: flex;
						padding: 6px;
						border-top-right-radius: 10px;
						border-top-left-radius: 10px;

						.topImg {
							width: 146px;
							height: 180px;
							border-radius: 8px;
							margin-right: 12px;
							flex-shrink: 0;
						}

						.topTitle {
							padding: 12px 0;

							.title {
								font-size: 17px;
							}

							.intro {
								font-size: 13px;
								color: #A3A5A6;
								margin-top: 8px;

								display: -webkit-box;
								-webkit-box-orient: vertical;
								-webkit-line-clamp: 5;
								/* 显示的行数，可以根据需要修改 */
								overflow: hidden;
								text-overflow: ellipsis;
							}
						}
					}

					.itemBottomLight {
						background: linear-gradient(180deg, #D7E4FF 0%, #F5F8FE 100%);
						height: 52px;
						line-height: 52px;
						font-size: 15px;
						display: flex;
						justify-content: space-between;
						padding: 0 20px;
						border-bottom-left-radius: 10px;
						border-bottom-right-radius: 10px;
					}

					.itemBottomDark {
						background: linear-gradient(0deg, #0A182F 0%, #204C95 100%);
						height: 52px;
						line-height: 52px;
						font-size: 15px;
						display: flex;
						justify-content: space-between;
						padding: 0 20px;
						border-bottom-left-radius: 10px;
						border-bottom-right-radius: 10px;
					}

					.iconBox {
						display: flex;
						align-items: center;

						.operationBox {
							position: absolute;
							z-index: 1000;
							right: 0;
							top: 40px;
							width: 150px;
							padding: 10px 20px;
							border-radius: 12px;
							line-height: 30px;

							.operationItem {
								cursor: pointer;
							}
						}
					}
				}
			}
		}
	}
}

.end {
	width: 100%;
	text-align: center;
	font-size: 13px;
	margin-top: 5px;
	display: flex;
	justify-content: center;
	margin-top: 20px;
}

.mask {
	width: 100%;
	height: 100vh;
	// background-color: red;
	position: absolute;
	z-index: 999;
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
