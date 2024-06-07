<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue'
import type {FormInst, FormRules} from 'naive-ui'
import {NButton, NForm, NFormItem, NInput, useMessage} from 'naive-ui'
import {
	fetchCaptchaImg, fetchEmailRegister,
	fetchLoginAndRegisterByPhoneAPI,
	fetchLoginByPhoneAPI,
	fetchRegisterByPhoneAPI,
	fetchSendSms
} from '@/api'
import {useAppStore, useAuthStore} from '@/store'
import {ss} from '@/utils/storage'

const appStore = useAppStore()
const formRef = ref<FormInst | null>(null)
const Nmessage = useMessage()
const isLogin = ref(true)
const loading = ref(false)
const authStore = useAuthStore()
const captchaSvg = ref('')
const theme = computed(() => appStore.theme)
const isSendCaptcha = ref(false)
const lastSendPhoneCodeTime = ref(60)
// 获取验证码文字是否显示
const PhoneCodeStatus = ref(true)

const captchaBgColor = computed(() => {
	return theme.value === 'dark' ? '#363f4f' : '#fff'
})

const sendBtnMsg = computed(() => {
	return isSendCaptcha.value ? '注册账户' : '发送验证码'
})

const registerForm = ref({
	username: '',
	password: '',
	phone: '',
	phoneCode: '',
	invitedBy: '',
	captchaCode: '',
	captchaId: null,
})

const loginForm = ref({
	password: '',
	phone: '',
})

const rules: FormRules = {
	username: [
		{required: true, message: '请输入用户名', trigger: 'blur'},
		{min: 2, max: 30, message: '用户名长度应为 2 到 30 个字符', trigger: 'blur'},
	],
	// password: [
	// 	{ required: true, message: '请输入密码', trigger: 'blur' },
	// 	{ min: 6, max: 30, message: '密码长度应为 6 到 30 个字符', trigger: 'blur' },
	// ],
	password: [
		{required: true, message: '验证码不能为空', trigger: 'blur'},
		{min: 6, max: 6, message: '验证码不能为空的长度应为 6 个字符', trigger: 'blur'},
	],
	phone: [
		{
			key: 'phone',
			required: true,
			trigger: 'blur',
			// message: '手机/邮箱不能为空'
			validator(rule: FormItemRule, value: string) {
				// 手机号正则
				let phone = /^1[3,4,5,6,7,8,9][0-9]{9}$/;
				if (!value) {
					return new Error('请输入手机号')
				} else {

					if (phone.test(value)) {
						return true;
					} else {
						return new Error('请输入正确格式的手机号')
					}
				}

			},
		},
	],
	captchaCode: [
		{required: true, message: '请填写图形验证码结果', trigger: 'blur'},
	],
	phoneCode: [
		{required: true, message: '请填写手机验证码', trigger: 'blur'},
	],
}
const logTips = computed(() => (isLogin.value ? '还没账号去注册！' : '已有账户去登录！'))

//  定时器改变倒计时时间方法
function changeLastSendPhoneCodeTime() {
	if (lastSendPhoneCodeTime.value > 0) {
		setTimeout(() => {
			lastSendPhoneCodeTime.value--
			changeLastSendPhoneCodeTime()
		}, 1000)
	}
}

/* 发送验证码 */
// async function handleSendCaptch() {
//   formRef.value?.validate(async (errors) => {
//     if (!errors) {
//       try {
//         const { phone, captchaCode, captchaId } = registerForm.value
//         const params = { phone, captchaCode, captchaId }
//         const res = await fetchSendSms(params)
//         getCaptchaImg()
//         const { success, message } = res
//         if (success) {
//           Nmessage.success(res.data)
//           isSendCaptcha.value = true
//           // 记录重新发送倒计时
//           lastSendPhoneCodeTime.value = 60
//           changeLastSendPhoneCodeTime()
//         }
//         else {
//           isSendCaptcha.value = false
//           Nmessage.error(message)
//         }
//       }
//       catch (error) {
//         getCaptchaImg()
//       }
//     }
//   })
// }


/* 发送手机验证码 */
function handleSendCaptch() {
	formRef.value?.validate(async (errors) => {
		if (!errors) {
			const res = await fetchSendSms({phone: loginForm.value?.phone, captchaCode: '123456'})
			// const {success, message} = res
			console.log(res)
			if (res.code == 200) {
				PhoneCodeStatus.value = false
				Nmessage.success(res.data);
				const codeInterval = setInterval(() => {
					var time = --lastSendPhoneCodeTime.value
					lastSendPhoneCodeTime.value = time < 10 ? '0' + time : time
				}, 1000)
				setTimeout(() => {
					clearInterval(codeInterval)
					lastSendPhoneCodeTime.value = 60
					PhoneCodeStatus.value = true
				}, 60000)
			} else {
				Nmessage.error(res.data);
			}
		}
	}, (rule) => {
		return rule?.key === 'phone'
	})
}

/* 注册登录 */
// function handlerSubmit() {
// 	formRef.value?.validate(async (errors) => {
// 		if (!errors) {
// 			try {
// 				loading.value = true
// 				const Interface = isLogin.value ? fetchLoginByPhoneAPI : fetchRegisterByPhoneAPI
// 				const params: any = !isLogin.value ? registerForm.value : {
// 					phone: loginForm.value.phone,
// 					password: loginForm.value.password
// 				}
// 				const res: any = await Interface(params)
// 				loading.value = false
// 				getCaptchaImg()
//
// 				const {success, message} = res
// 				if (!success)
// 					return Nmessage.error(message)
// 				if (!isLogin.value) {
// 					Nmessage.success('账户注册成功、开始体验吧！')
// 					const {phone, password} = registerForm.value
// 					loginForm.value.phone = phone
// 					loginForm.value.password = password
// 					isLogin.value = !isLogin.value
// 				} else {
// 					Nmessage.success('账户登录成功、开始体验吧！')
// 					authStore.setToken(res.data)
// 					authStore.getUserInfo()
// 					authStore.setLoginDialog(false)
// 					ss.remove('invitedBy')
// 				}
// 			} catch (error) {
// 				getCaptchaImg()
// 				loading.value = false
// 			}
// 		}
// 	})
// }

// 手机号登录
function handlerSubmit() {

	formRef.value?.validate(async (errors) => {
		if (!errors) {
			const params = {
				phone: loginForm.value?.phone,
				phoneCode: loginForm.value?.password,
				invitedBy: ""
			}
			const res = await fetchLoginAndRegisterByPhoneAPI(params)
			console.log(res)
			if (res.code == 200) {
				loading.value = false
				Nmessage.success('账户登录成功、开始体验吧！')
				authStore.setToken(res.data)
				authStore.getUserInfo()
				authStore.setLoginDialog(false)
				ss.remove('invitedBy')
			}
		}
	})

}

async function getCaptchaImg() {
	const res: any = await fetchCaptchaImg({color: captchaBgColor.value})
	captchaSvg.value = res.data.svgCode
	registerForm.value.captchaId = res.data.code
}

onMounted(() => {
	const code = ss.get('invitedBy')
	code && (registerForm.value.invitedBy = code)
	getCaptchaImg()
})
</script>

<template>
	<div class="pt-5">
		<NForm
			v-if="!isLogin"
			ref="formRef"
			:model="registerForm"
			:rules="rules"
			size="large"
			label-placement="left"
			label-width="auto"
			require-mark-placement="right-hanging"
			:style="{ maxWidth: '640px' }"
		>
			<NFormItem path="username">
				<NInput class="dark:bg-[#3C3C5A] bg-[#F4F4F5]" v-model:value="registerForm.username" tabindex="1"
								placeholder="请输入您的用户名昵称"/>
			</NFormItem>
			<NFormItem path="password">
				<NInput class="dark:bg-[#3C3C5A] bg-[#F4F4F5]" v-model:value="registerForm.password" tabindex="2"
								placeholder="请输入您的账户密码" type="password"
								:maxlength="30" show-password-on="click" @keyup.enter="handlerSubmit"/>
			</NFormItem>
			<NFormItem path="phone">
				<NInput class="dark:bg-[#3C3C5A] bg-[#F4F4F5]" v-model:value="registerForm.phone" tabindex="3"
								placeholder="请填写您的手机号"/>
			</NFormItem>
			<NFormItem v-if="!isSendCaptcha" path="captchaCode">
				<div class="flex items-center w-full space-x-4">
					<NInput v-model:value="registerForm.captchaCode" tabindex="4" class="flex-1 dark:bg-[#3C3C5A] bg-[#F4F4F5]"
									placeholder="请填写图中验证码结果"/>
					<div v-if="captchaSvg">
						<!-- <img :src="captchaSvg" alt=""> -->
						<span class="cursor-pointer rounded" @click="getCaptchaImg" v-html="captchaSvg"/>
					</div>
				</div>
			</NFormItem>

			<NFormItem v-if="isSendCaptcha" path="phoneCode">
				<NInput v-model:value="registerForm.phoneCode" class="flex-1 dark:bg-[#3C3C5A] bg-[#F4F4F5]"
								placeholder="请填写手机验证码"/>
			</NFormItem>

			<NFormItem path="invitedBy">
				<NInput class="dark:bg-[#3C3C5A] bg-[#F4F4F5]" v-model:value="registerForm.invitedBy" placeholder="邀请码[非必填]"/>
			</NFormItem>


			<NFormItem>

				<div class="flex space-x-2 w-full">
					<NButton
						v-if="!isSendCaptcha"
						class="flex-1 w-1/3"
						type="primary"
						:disabled="loading"
						:loading="loading"
						@click="handleSendCaptch"
					>
						发送验证码
					</NButton>

					<NButton
						block
						class="flex-1 w-1/3"
						:disabled="lastSendPhoneCodeTime > 0"
						@click="isSendCaptcha = false"
					>
						重新发送{{ lastSendPhoneCodeTime ? `(${lastSendPhoneCodeTime}S)` : '' }}
					</NButton>
				</div>
			</NFormItem>

			<NFormItem path="invitedBy">
				<NButton
					block
					type="primary"
					:disabled="loading"
					:loading="loading"
					class="flex-1 w-1/3"
					@click="handlerSubmit"
				>
					注册账户
				</NButton>

			</NFormItem>

		</NForm>

		<!-- login -->
		<NForm
			v-if="isLogin"
			ref="formRef"
			:model="loginForm"
			:rules="rules"
			label-placement="left"
			label-width="auto"
			size="large"
			require-mark-placement="right-hanging"
			:style="{
        maxWidth: '640px',
        marginTop: '50px'
      }"
		>
			<NFormItem path="phone">

				<NInput style="position: relative" class="dark:bg-[#010102] bg-[#F4F4F4]"
								v-model:value="loginForm.phone" tabindex="1" placeholder="请输入手机号"/>
			</NFormItem>
			<NFormItem path="password">
				<!--				<NInput style="position: relative" v-model:value="loginForm.password" placeholder="请输入验证码" :maxlength="6"-->
				<!--								show-password-on="click" tabindex="2" @keyup.enter="handlerSubmit"/>-->
				<NInput class="dark:bg-[#010102] bg-[#F4F4F4]" style="position: relative" v-model:value="loginForm.password"
								placeholder="请输入验证码" :maxlength="6"
								show-password-on="click" tabindex="2"/>
				<div class="send_code dark:bg-[#15171A] bg-[#ffffff]" @click="handleSendCaptch" v-if="PhoneCodeStatus == true">
					获取验证码
				</div>
				<div class="send_code dark:bg-[#15171A] bg-[#ffffff]" v-else>{{ lastSendPhoneCodeTime }}S后重新获取</div>
			</NFormItem>

			<NFormItem class="mt-10">
				<NButton
					style="background-color: #3187F1;width: 50%;border-radius: 29px;margin-left: 50%;transform: translate(-50%)"
					block
					type="primary"
					@click="handlerSubmit"
				>
					登录/注册
				</NButton>
			</NFormItem>
		</NForm>
	</div>
	<!--  <span class="flex justify-center cursor-pointer">-->
	<!--    <NButton text @click="isLogin = !isLogin">{{ logTips }}</NButton>-->
	<!--  </span>-->
</template>

<style scoped lang="less">
.n-input {
	width: 70% !important;
	// background-color: #3C3C5A;
	border-radius: 36px;
	height: 50px;
	margin-left: 25%;
	transform: translate(-12%)
}

/deep/ .n-input__input {
	width: 100%;
	height: 100%;
}

/deep/ .n-input__input-el {
	height: 100%;
	margin-top: 5px;
}

/deep/ .n-form-item-feedback-wrapper {
	margin-left: 17% !important;
}

/deep/ .n-input__placeholder {
	color: #BDBDBD !important;
	font-size: 12px !important;
	padding-top: 2px;
}

.send_code {
	color: #BDBDBD;
	font-size: 12px;
	position: absolute;
	right: 15%;
	border-radius: 24px;
	padding: 10px 20px;
	cursor: pointer;
}
</style>
