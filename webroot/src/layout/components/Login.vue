<script setup lang='ts'>
import {
	NButton,
	NIcon,
	useMessage,
	NModal,
	NResult,
	NTabPane,
	NTabs,
	NCheckbox
} from 'naive-ui'
import {computed, onMounted, ref,} from 'vue'
import {CloseOutline} from '@vicons/ionicons5'
import Phone from './Login/Phone.vue'
import Email from './Login/Email.vue'
import Wechat from './Login/Wechat.vue'
import Register from './Login/register.vue'
import {useAuthStore, useAppStore} from '@/store'
import {SvgIcon} from '@/components/common'
import {useBasicLayout} from "@/hooks/useBasicLayout";
import {fetchGetMemberAgreementAPI} from "@/api/global";
// import Phone from "@/layout/components/Login/Phone.vue";
// export default {
// 	components: {Phone}
// }
defineProps<Props>()
let timer: any
const authStore = useAuthStore()
const appStore = useAppStore()
const activeCount = ref(false)
const wxLoginUrl = ref('')
const sceneStr = ref('')
const {isMobile} = useBasicLayout()
const theme = computed(() => appStore.theme)
// 系统头像以及系统名
const robotAvatarData = ref('')


const ms = useMessage();

const registerSendStatus = computed(() => {
	return Number(authStore.globalConfig.registerSendStatus)
})

const registerSendModel3Count = computed(() => {
	return Number(authStore.globalConfig.registerSendModel3Count)
})

const registerSendModel4Count = computed(() => {
	return Number(authStore.globalConfig.registerSendModel4Count)
})

const registerSendDrawMjCount = computed(() => {
	return Number(authStore.globalConfig.registerSendDrawMjCount)
})

const wechatRegisterStatus = computed(() => Number(authStore.globalConfig.wechatRegisterStatus) === 1)
const phoneRegisterStatus = computed(() => Number(authStore.globalConfig.phoneRegisterStatus) === 1)
const emailRegisterStatus = computed(() => Number(authStore.globalConfig.emailRegisterStatus) === 1)

const disabledReg = computed(() => {
	return !wechatRegisterStatus.value && !phoneRegisterStatus.value && !emailRegisterStatus.value
})

const activeTab = ref(wechatRegisterStatus.value ? 'wechat' : 'email')
// const activeTab = ref(wechatRegisterStatus.value ? 'wechat' : 'email')

// watchEffect(() => {
//   if (wechatRegisterStatus.value) {
//     activeTab.value = ""
//   }
//   if (phoneRegisterStatus.value) {
//     activeTab.value = ""
//   }
// })

interface Props {
	visible: boolean
}

const registerTips = computed(() => (`首次认证：赠送${registerSendModel3Count.value}积分基础模型 | ${registerSendModel4Count.value}积分高级模型 | ${registerSendDrawMjCount.value}积分绘画`))


function handleCloseDialog() {
	clearInterval(timer)
	wxLoginUrl.value = ''
	sceneStr.value = ''
	activeCount.value = false
}

const closeColor = computed(() => {
	return theme.value === 'light' ? '#555' : '#fff'
})

const handleGoLogin = (mode: string) => {
	activeTab.value = mode;
}

const closeLogin = () => {
	//   if (!authStore.isLogin) {
	//     ms.warning("请先登录系统后再使用");
	//     return;
	//   }
	authStore.setLoginDialog(false);
}

async function gerQuery() {
	const res = await fetchGetMemberAgreementAPI({keys: ['siteName', 'robotAvatar']})
	robotAvatarData.value = res.data

}

onMounted(() => {
	gerQuery()
})
</script>

<template>
	<!--	<NModal :show="visible"-->
	<!--					style="max-width: 550px; min-height: 600px;"-->
	<!--					class="dark:bg-[#33334D] bg-[#F2F2F2] "-->
	<!--					:class="[isMobile ? 'px-2 w-full' : 'px-20']"-->
	<!--					:on-after-leave="handleCloseDialog">-->
	<!--		<div class=" rounded " :class="[isMobile ? 'h-[100vh]' : 'p-5']">-->

	<!--			<div class="absolute top-3 right-3 cursor-pointer z-30" v-if="!isMobile" @click="closeLogin">-->
	<!--				<NIcon size="20" :color="closeColor">-->
	<!--					<CloseOutline/>-->
	<!--				</NIcon>-->
	<!--			</div>-->


	<!--			<div v-if="disabledReg">-->
	<!--				<NResult-->
	<!--					size="small"-->
	<!--					status="403"-->
	<!--					title="网站已经关闭注册通道"-->
	<!--					description="请联系管理员开通吧"-->
	<!--				>-->
	<!--					<template #footer>-->
	<!--						<NButton @click="authStore.setLoginDialog(false)">-->
	<!--							知道了-->
	<!--						</NButton>-->
	<!--					</template>-->
	<!--				</NResult>-->
	<!--			</div>-->

	<!--			<div v-else>-->

	<!--				&lt;!&ndash; register &ndash;&gt;-->
	<!--				<div class="mx-auto"  v-if="!wechatRegisterStatus || activeTab !== 'wechat'" :class="[isMobile ? 'mt-4 w-auto' : 'w-auto']">-->
	<!--					<NTabs  justify-content="center" animated v-model:value="activeTab">-->
	<!--						<NTabPane v-if="emailRegisterStatus" name="email" tab="账号登录"></NTabPane>-->
	<!--						<NTabPane v-if="phoneRegisterStatus" name="phone" tab="手机号登录"></NTabPane>-->
	<!--					</NTabs>-->
	<!--				</div>-->

	<!--				<div v-if="wechatRegisterStatus && activeTab === 'wechat'">-->
	<!--					<h3 class="text-xl text-center mb-5">微信扫码登录</h3>-->
	<!--					<Wechat/>-->
	<!--				</div>-->

	<!--				<div :class="[isMobile ? 'mt-4' : '']" >-->

	<!--&lt;!&ndash;-->
	<!--					<div v-if="isMobile" class="flex flex-col  items-center">-->
	<!--						<img :src="logoPath ? logoPath : logo"   class="w-[60px] cursor-pointer px-0 dark:border-[#ffffff17] border-#ebebeb-400" alt="">-->
	<!--&lt;!&ndash;						<NAvatar :size="60"&ndash;&gt;-->
	<!--&lt;!&ndash;										 :src="logoPath"&ndash;&gt;-->
	<!--&lt;!&ndash;										 round&ndash;&gt;-->
	<!--&lt;!&ndash;										 bordered&ndash;&gt;-->
	<!--&lt;!&ndash;										 :fallback-src="logo"&ndash;&gt;-->
	<!--&lt;!&ndash;										 class="cursor-pointer"&ndash;&gt;-->
	<!--&lt;!&ndash;						/>&ndash;&gt;-->
	<!--						<p class="text-xl w-auto mt-1">{{sideName || "GoMaxAi"}}</p>-->

	<!--					</div>-->
	<!--&ndash;&gt;-->

	<!--					<Email v-if="emailRegisterStatus && activeTab === 'email'" />-->
	<!--					<Phone v-if="phoneRegisterStatus && activeTab === 'phone'"/>-->
	<!--				</div>-->

	<!--				<div v-if="!disabledReg" class="w-full flex items-center justify-center mt-10">-->
	<!--					<div class="flex items-center justify-around w-2/3">-->

	<!--						<div v-if="wechatRegisterStatus && activeTab !== 'wechat'"-->
	<!--								 class="select-none cursor-pointer text-[#fff] bg-[#4D8ADD] dark:bg-[#4D4D7A] px-4 py-2 flex justify-center items-center rounded"-->
	<!--								 @click="handleGoLogin('wechat')">-->
	<!--							<SvgIcon icon="ic:twotone-wechat"></SvgIcon>-->
	<!--							<p class="ml-1">微信登录</p>-->
	<!--						</div>-->

	<!--						<div v-if="emailRegisterStatus && activeTab !== 'email'"-->
	<!--								 class="select-none cursor-pointer text-[#fff] bg-[#4D8ADD] dark:bg-[#4D4D7A] px-4 py-2 flex justify-center items-center rounded"-->
	<!--								 @click="handleGoLogin('email')">-->
	<!--							<SvgIcon icon="ic:baseline-email"></SvgIcon>-->
	<!--							<p class="ml-1">账号登录</p>-->
	<!--						</div>-->

	<!--						<div v-if="phoneRegisterStatus && activeTab !== 'phone'"-->
	<!--								 class="select-none cursor-pointer text-[#fff] bg-[#4D8ADD] dark:bg-[#4D4D7A] px-4 py-2 flex justify-center items-center rounded"-->
	<!--								 @click="handleGoLogin('phone')">-->
	<!--							<SvgIcon icon="fluent:phone-16-filled"></SvgIcon>-->
	<!--							<p class="ml-1">手机登录</p>-->
	<!--						</div>-->

	<!--					</div>-->
	<!--				</div>-->

	<!--				<div class="mt-6">-->
	<!--					<p class="text-center text-[12px]">注册登录即表示阅读并同意-->

	<!--						<router-link to="/agreement" target="_blank">-->
	<!--							 <span>-->
	<!--								 《用户协议》-->
	<!--							 </span>-->
	<!--						</router-link>-->

	<!--						<router-link to="/policy" target="_blank">-->
	<!--							 <span>-->
	<!--								《隐私政策》-->
	<!--							 </span>-->
	<!--						</router-link>-->
	<!--					</p>-->
	<!--				</div>-->

	<!--				<div v-if="registerSendStatus && !disabledReg"-->
	<!--						 class="mt-5 border rounded px-2 py-2 text-[12px] dark:border-[#737373] border-[##A7A7A7] ">-->
	<!--					<p class="text-center select-none text-[12px]">{{ registerTips }}</p>-->
	<!--				</div>-->

	<!--			</div>-->


	<!--		</div>-->
	<!--	</NModal>-->

	<NModal :show="visible" style="max-width: 550px; min-height: 600px;" class="dark:bg-[#15171A] bg-[#ffffff] "
					:class="[isMobile ? 'px-2 w-full' : 'px-20']" :on-after-leave="handleCloseDialog">
		<div class=" rounded " :class="[isMobile ? 'h-[100vh]' : 'p-5']">
			<div class="login_type dark:bg-[#15171A] bg-[#fff]">
				<div class="absolute top-5 right-5 cursor-pointer z-30" v-if="!isMobile" @click="closeLogin">
					<NIcon size="20" :color="closeColor">
						<CloseOutline/>
					</NIcon>
				</div>


				<!--				<div v-if="activeTab === 'register">-->

				<!--				</div>-->
				<div v-if="activeTab === 'register'">
					<h3 style="font-size: 16px;font-weight: 600;text-align: center;padding-top: 20px">注册</h3>
					<Register></Register>
				</div>
				<div v-else>
					<!--微信登录-->
					<div style="padding-top: 40px" v-if="wechatRegisterStatus && activeTab === 'wechat'">
						<h3 class="text-xl text-center mb-5">微信扫码登录</h3>
						<Wechat/>

					</div>

					<div class="login_type_card" v-else>
						<div @click="handleGoLogin('email')">
							<span :class="activeTab == 'email' ? 'title_tag' : ''">密码登录</span>
						</div>
						<div @click="handleGoLogin('phone')">
							<span :class="activeTab == 'phone' ? 'title_tag' : ''">验证码登录</span>
						</div>
					</div>

					<Phone v-if="phoneRegisterStatus && activeTab === 'phone'"/>
					<Email v-if="emailRegisterStatus && activeTab === 'email'"/>
				</div>


				<div class="other_login_type">
					<div style="font-size: 13px;cursor: pointer" @click="handleGoLogin('register')"
							 v-if="activeTab != 'register'">还没有账号？去注册！
					</div>
					<div style="font-size: 13px;cursor: pointer" @click="handleGoLogin('email')" v-else>已有账户，点击登录</div>
					<div style="display: flex;align-items: center;justify-content: center;margin-top: 20px">
						<div style="margin-left: 50px;margin-right: 50px;cursor: pointer;"
								 v-if="wechatRegisterStatus && activeTab !== 'wechat'" @click="handleGoLogin('wechat')">
							<img class="login_type_image" src="../../assets/images/wx_logo.png">
							<div style="font-size: 14px;white-space: nowrap">微信登录</div>
						</div>
						<div style="margin-left: 50px;margin-right: 50px;ursor: pointer;"
								 v-if="emailRegisterStatus && activeTab !== 'email'" @click="handleGoLogin('email')">
							<img class="login_type_image" src="../../assets/images/lock.png">
							<div style="font-size: 14px;white-space: nowrap">密码登录</div>
						</div>
						<div style="margin-left: 50px;margin-right: 50px;cursor: pointer;"
								 v-if="phoneRegisterStatus && activeTab !== 'phone'" @click="handleGoLogin('phone')">
							<img class="login_type_image" src="../../assets/images/phone.png">
							<div style="font-size: 14px;white-space: nowrap">验证码登录</div>
						</div>
					</div>
				</div>
				<div class="protocol">
					<NCheckbox default-checked></NCheckbox>
					<div style="margin-top: 3px;margin-left: 15px">阅读并同意
						<router-link to="/agreement" target="_blank">
							<span style="text-decoration: underline;cursor: pointer"
										@click="goUserAgreementPage">《用户协议》</span>
						</router-link>
						<router-link to="/policy" target="_blank">
							<span style="text-decoration: underline;cursor: pointer" @click="goPolicyPage">《隐私政策》</span>
						</router-link>
					</div>
				</div>

				<!--				<div class="mt-6">-->
				<!--					<p class="text-center text-[12px]">注册登录即表示阅读并同意-->

				<!--						<router-link to="/agreement" target="_blank">-->
				<!--												 <span>-->
				<!--													 《用户协议》-->
				<!--												 </span>-->
				<!--						</router-link>-->

				<!--						<router-link to="/policy" target="_blank">-->
				<!--												 <span>-->
				<!--													《隐私政策》-->
				<!--												 </span>-->
				<!--						</router-link>-->
				<!--					</p>-->
				<!--				</div>-->
			</div>
			<div class="login_desc">
				<div class="desc_title  text-[#fff]">
					<img :src="robotAvatarData.robotAvatar">
					<div>{{ robotAvatarData.siteName }}</div>
				</div>
				<div class="tips text-[#fff]">
					<div>现在登录</div>
					<div style="font-size: 20px;font-weight: bold;margin-top: 10px;margin-bottom: 10px">立即获取多种服务</div>
				</div>
				<div>
					<div class="item text-[#fff]">
						<SvgIcon class="text-lg leading-10 text-[#FF6B1B] mr-2" icon="mingcute:check-2-fill"></SvgIcon>
						<div>Midjourney 绘画、官方原版功能</div>
					</div>
					<div class="item text-[#fff]">
						<SvgIcon class="text-lg leading-10 text-[#FF6B1B] mr-2" icon="mingcute:check-2-fill"></SvgIcon>
						<div>AI创意、文案、写作、对话、聊天</div>
					</div>
					<div class="item text-[#fff]">
						<SvgIcon class="text-lg leading-10 text-[#FF6B1B] mr-2" icon="mingcute:check-2-fill"></SvgIcon>
						<div>AI换脸、图像增强、高清放大</div>
					</div>
					<div class="item text-[#fff]">
						<SvgIcon class="text-lg leading-10 text-[#FF6B1B] mr-2" icon="mingcute:check-2-fill"></SvgIcon>
						<div>AI音乐、AI视频、文档分析</div>
					</div>
				</div>
				<div class=" text-[#fff]" style="position: absolute;bottom: 20px;margin-left: 50%;transform: translate(-50%)">
					ctrl + D 收藏我们, 永不迷路
				</div>
			</div>
		</div>
	</NModal>
</template>

<style scoped lang="less">
.n-modal {
	max-width: none !important;
	max-height: auto !important;
	padding: 0;
}

// 左侧登录类型样式 start

.rounded {
	width: 50%;
	height: 60vh;
	background: linear-gradient(88deg, #4BA3FF, #3179F5);
	border-radius: 50px;
	overflow: hidden;
}

.login_type {
	height: 100%;
	width: 50%;
	//border-radius: 50px;
	border-top-right-radius: 50px;
	border-bottom-right-radius: 50px;
	position: relative;
	float: left;
}

.login_type_card {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 50px;

	div {
		width: 140px;
		text-align: center;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		//position: relative;

		.title_tag {
			color: #3187F1;
			border-bottom: 3px solid #3187F1;
			padding-bottom: 5px;
		}
	}
}

login_desc {
	height: 100%;
	width: 50%;
}

.n-checkbox {
	background-color: #FFFFFF;
	border-radius: 4px;
}

.other_login_type {
	text-align: center;
	margin-top: 20px;
}

.login_type_image {
	width: 50px;
	height: 50px;
	margin-bottom: 10px;
	margin-left: 50%;
	transform: translate(-50%);
}

.n-checkbox--checked {
	border-radius: 4px;
}

.protocol {
	display: flex;
	align-items: center;
	justify-content: center;
	color: #C0C0C0;
	font-size: 13px;
	flex-wrap: nowrap;
	white-space: nowrap;
	position: absolute;
	bottom: 10px;
	left: 50%;
	transform: translate(-50%);

}

// 左侧登录类型样式 end

// 右侧登录描述样式 start
.login_desc {
	width: 50%;
	height: 100%;
	float: right;
	text-align: center;
	position: relative;
	//padding-right: 20px;
	//white-space: nowrap;
	//overflow: hidden;
	//text-align: center;

	.desc_title {
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: Arial Rounded MT Bold;
		font-weight: bold;
		font-size: 40px;
		margin-top: 80px;
		white-space: nowrap;
		overflow: hidden;

		div {
			width: 5em;
			overflow: hidden;
			text-align: left;
		}

		img {
			width: 70px;
			height: 70px;
			margin-right: 20px;
			margin-bottom: 10px;
		}
	}

	.tips {
		width: 17.5em;
		white-space: nowrap;
		overflow: hidden;
		text-align: left;
		margin-left: 50%;
		transform: translate(-50%);
		margin-top: 30px;

	}

	.item {
		width: 17.5em;
		white-space: nowrap;
		overflow: hidden;
		text-align: left;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		margin-left: 50%;
		transform: translate(-50%);
		line-height: 50px;

		svg {
			min-width: 1em;
			height: 1em;
		}
	}
}

// 右侧登录描述样式 start
</style>
