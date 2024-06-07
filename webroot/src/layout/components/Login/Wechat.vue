<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {NCountdown, NImage, NSkeleton, NSpin, useMessage} from 'naive-ui'
import {fetchGetQRCodeAPI, fetchGetQRSceneStrAPI, fetchLoginBySceneStrAPI, fetchUserRegisterAPI} from '@/api/user'
import type {ResData} from '@/api/types'
import {useAuthStore} from '@/store'
import {ss} from '@/utils/storage'

let timer: any

const wxLoginUrl = ref('')
const sceneStr = ref('')
const activeCount = ref(false)
const Nmessage = useMessage()
const authStore = useAuthStore()
const countdownRef = ref<CountdownInst | null>()

function loadImage(src: string) {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => resolve(img)
		img.onerror = reject
		img.src = src
	})
}

async function getSeneStr() {
	const params = {invitedBy: ss.get('invitedBy')}
	const res: ResData = await fetchGetQRSceneStrAPI(params)
	if (res.success) {
		sceneStr.value = res.data
		getQrCodeUrl()
	}
}

async function loginBySnece() {
	if (!sceneStr.value)
		return
	const res: ResData = await fetchLoginBySceneStrAPI({sceneStr: sceneStr.value})
	if (Object.keys(res.data).length != 0){
		clearInterval(timer)

		if (res.data.authToken != undefined){
			// 已经注册
				Nmessage.success('账户登录成功、开始体验吧！')
				authStore.setToken(res.data.authToken)
				authStore.getUserInfo()
				authStore.setLoginDialog(false)
			console.log(authStore.getUserInfo())
				ss.remove('invitedBy')
		}else{
			// 还未注册
			const userData = {
				username: "",
				email: "",
				password: "",
				avatar: "",
				nickname: "",
				phone: "",
				phoneCode: "",
				openId: res.data.openId,
				miniOpenId: "",
				weAppOpenId: "",
				invitedBy: ""
			}
			const result = await fetchUserRegisterAPI(userData)
			if (result.code == 200){
				Nmessage.success('账户登录成功、开始体验吧！')
				authStore.setToken(result.data)
				authStore.getUserInfo()
				authStore.setLoginDialog(false)
				ss.remove('invitedBy')
			}else{
				Nmessage.success(result.data)
			}

		}
	}
}

async function getQrCodeUrl() {
	const res: ResData = await fetchGetQRCodeAPI({sceneStr: sceneStr.value})
	if (res.success) {
		activeCount.value = true
		await loadImage(res.data)
		wxLoginUrl.value = res.data
		timer = setInterval(() => {
			loginBySnece()
		}, 1000)
	}
}

function handleTimeDown() {
	clearInterval(timer)
	getSeneStr()
	countdownRef.value?.reset()
}

onMounted(() => {
	getSeneStr()
})

onBeforeUnmount(() => {
	clearInterval(timer)
})

function handleGoLogin(type){

}
</script>

<template>
	<div class="w-full">
		<div style="white-space: nowrap" class="mt-2 w-full text-center font-bold text-sm">
			<!--      <p>-->
			<!--        <span class="w-[65px] inline-block text-[red] text-left">-->
			<!--          <NCountdown ref="countdownRef" :active="activeCount" :duration="60 * 1000" :on-finish="handleTimeDown" /></span> 秒后二维码将刷新-->
			<!--      </p>-->
			<p>
        <span style="margin-bottom: 10px" class="w-[65px] inline-block text-[red] text-left">
          <NCountdown ref="countdownRef" :active="activeCount" :duration="60 * 1000"
											:on-finish="handleTimeDown"/></span> 秒后二维码将刷新
			</p>
		</div>


		<div class="QRCode_card">
			<div class="my-2 flex justify-center items-center relative ">
				<NImage
					v-if="wxLoginUrl"
					preview-disabled
					width="230"
					:src="wxLoginUrl"
					class="shadow-xl"
				/>
				<NSkeleton v-else height="230px" width="230px"/>
				<NSpin v-if="!wxLoginUrl" size="large"
							 class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"/>
			</div>

			<div class="tag">
				<div>
					<img src="../../../assets/images/wechat.png">
				</div>
				<div style="margin-top: 2px;margin-left: 10px">
					微信扫码
				</div>
			</div>
		</div>
		<!--    <span class="flex items-center justify-center text-base mt-5">-->
		<!--      打开微信扫码登录-->
		<!--    </span>-->
	</div>
</template>
<style scoped lang="less">
.QRCode_card {
	width: 250px;
	height: 280px;
	background: #FFFFFF;
	border-radius: 5px;
	margin-left: 50%;
	transform: translate(-50%);
}

.shadow-xl{
	background-color: #FFFFFF;
	box-shadow: none;
	margin-top: 10px;
}

.tag{
	display: flex;
	align-items: center;
	justify-content: center;
	color: #000000;
	font-family: SimHei;
	font-weight: 400;
	font-size: 13px;
}

.tag img{
	width: 25px;
	height: 25px;
}
</style>
