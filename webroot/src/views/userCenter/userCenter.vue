<script setup lang="ts">
import {useAuthStore, useGlobalStoreWithOut} from "@/store";
import {computed, h, onMounted, reactive, ref} from 'vue'
import {SvgIcon} from "@/components/common";
import {
	NModal,
	useMessage,
	NButton,
	NInput,
	NUpload,
	NCard,
	NDataTable,
	NAvatar,
	NForm,
	NFormItem, FormRules, FormInst, useDialog,
} from 'naive-ui'
import {fetchUseCramiAPI} from "@/api/crami";
import {fetchUploadImage} from "@/api/mjDraw";
import {
	fetchEditAndBindPhoneAPI,
	fetchLoginAndRegisterByPhoneAPI,
	fetchSendSms, fetchUpdateEmailAPI,
	fetchUpdateInfoAPI,
	fetchUpdatePasswordAPI
} from "@/api";
import {ResData} from "@/api/types";
import {fetchGenInviteCodeAPI, fetchGetInviteRecordAPI, fetchUserDestoryAPI} from "@/api/user";
import Wallet from "@/views/userCenter/components/wallet.vue";
import clipboard3 from "vue-clipboard3";
import {useRouter} from "vue-router";
import {data} from "autoprefixer";

import KamilDialog from '@/views/userCenter/components/kamilDialog.vue'

const authStore = useAuthStore()
const message = useMessage();
const useGlobalStore = useGlobalStoreWithOut();
const dialog = useDialog();
const router = useRouter();

const {toClipboard} = clipboard3()
// 用户信息
const userInfo = computed(() => authStore.userInfo)
// 用户积分信息
const userBalance = computed(() => authStore.userBalance)
// 邀请码
const inviteCode = computed(() => authStore.userInfo.inviteCode)
// 用户显示的昵称
const userNickname = computed(() => authStore.userInfo.nickname == null ? (authStore.userInfo.nickname == null ? (authStore.userInfo.nickname.phone == null ? '小智' : authStore.userInfo.nickname.phone) : authStore.userInfo.nickname) : authStore.userInfo.nickname)


// 上传得到的用户头像
const userAvatar = ref("")
// 昵称修改输入框 双向绑定
const userName = ref(authStore.userInfo.nickname)
// 用户名修改输入框 双向绑定
const account = ref(authStore.userInfo.username)

const regLoading = ref(false)
// 邀请记录数据
const inviteData = ref([])
const lastSendPhoneCodeTime = ref(60)
// 获取验证码文字是否显示
const PhoneCodeStatus = ref(true)
const formRef = ref<FormInst | null>(null)
const modifyPasswordRef = ref<FormInst | null>(null)
const emailDataRef = ref<FormInst | null>(null)
// 修改用户信息对话框
const userInfoDialog = ref(false)
// 邀请记录对话框
const inviteRecordDialog = ref(false)
// 积分对话框
const pointsDialog = ref(false)
// 绑定/换绑手机号对话框
const modifPhoneDialog = ref(false)
// 修改密码对话框
const modifyPasswordDialog = ref(false)
// 修改邮箱
const modifyEmailDialog = ref(false)

// 修改密码的数据
const modifyPasswordData = ref({
	username: '', // 用户名
	password: '', // 密码
	oldPassword: '' // 确认密码
})

// 修改邮箱数据
const emailData = ref({
	emali: ''
})
const columns = computed(() => {
	return [
		{
			title: '头像',
			key: 'avatar',
			render(row: InviteRecord) {
				return h(
					NAvatar,
					{
						src: row.avatar,
						size: 48,
						round: true,
						lazy: true,
					},
				)
			},
		},
		{
			title: '用户名称',
			key: 'username',
		},
		{
			title: '用户邮箱',
			key: 'email',
		},
		{
			title: '受邀人状态',
			key: 'status',
			render(row: InviteRecord) {
				return h(
					NButton,
					{
						type: row.status === 1 ? 'primary' : 'error',
						size: 'small',
						round: true,
						quaternary: true,
					},
					{
						default: () => row.status === 1 ? '已认证' : '未激活',
					},
				)
			},
		},
		{
			title: '邀请时间',
			key: 'createdAt',
			render(row: InviteRecord) {
				return h(
					'p',
					{
						// style: {
						//   fontSize: '12px',
						//   color: '#000',
						// },
					},
					{
						default: () => row.createdAt,
					},
				)
			},
		},
		{
			title: '获得奖励状态',
			key: 'status',
			render(row: InviteRecord) {
				return h(
					NButton,
					{
						type: row.status === 1 ? 'success' : 'warning',
						size: 'small',
						round: true,
						quaternary: true,
					},
					{
						default: () => row.status === 1 ? '已领取邀请奖励' : '等待受邀人确认',
					},
				)
			},
		},
	]
})

// 手机数据
const phoneData = ref({
	phone: '',
	code: ''
})

// 手机验证规则
const rules: FormRules = {
	phone: [
		{
			key: 'phone',
			required: true,
			trigger: 'blur',
			validator(rule: FormItemRule, value: string) {
				if (!value)
					return new Error('请输入手机号')

				else if (!/^1[3,4,5,6,7,8,9][0-9]{9}$/.test(value))
					return new Error('请输入正确格式的手机号')

				return true
			},
		},
	],
	code: [
		{required: true, message: '验证码不能为空', trigger: 'blur'},
		{min: 6, max: 6, message: '验证码不能为空的长度应为 6 个字符', trigger: 'blur'},
	],
}
// 修改密码表单验证规则
const modifyPassworRules: modifyPasswordRef = {
	username: [
		{required: true, message: '用户名不能为空', trigger: 'blur'},
		{min: 6, message: '用户名的长度应为 6 个字符', trigger: 'blur'},
	],
	password: [
		{required: true, message: '密码不能为空', trigger: 'blur'},
		{min: 6, message: '密码的长度应为 6 个字符', trigger: 'blur'},
	],
	oldPassword: [
		{required: true, message: '原密码不能为空', trigger: 'blur'},
		{min: 6, message: '原密码的长度应为 6 个字符', trigger: 'blur'},
	]
}

// 修改邮箱表单言这个规则
const emailDataRules: emailDataRef = {
	email: [
		{
			key: 'email',
			required: true,
			trigger: 'blur',
			validator(rule: FormItemRule, value: string) {
				// 邮箱正则
				let phone = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
				if (!value) {
					return new Error('邮箱地址不能为空')
				} else {

					if (phone.test(value)) {
						return true;
					} else {
						return new Error('请输入正确格式的邮箱地址')
					}
				}

			},
		},
	]
}


// 用户头像上传
function uploadChang(e) {
	const formData = new FormData()
	const fileName = e.file.type.split('/')[1];
	formData.append('filename', e.file.id + '.' + fileName)
	formData.append('file', e.file.file)
	formData.append('dir', 'user-avatar-upload');
	fetchUploadImage(formData).then(res => {
		if (res.code == 200) {
			userAvatar.value = res.data
		} else {
			message.error(res.data)
		}
	})
}

// 用户信息修改
async function modifUserInfoClick() {

	const userinfo = {}

	if (userAvatar.value != '' && userInfo.value?.avatar != userAvatar.value){
		userinfo.avatar = userAvatar.value
	}

	if(userInfo.value?.username != account.value){
		userinfo.username = account.value
	}
	if(userInfo.value?.nickname != userName.value){
		userinfo.nickname = userName.value
	}

	console.log(userinfo)

	const res = await fetchUpdateInfoAPI(userinfo);
	if (res.code == 200) {
		// authStore.getUserInfo()
		await authStore.getUserInfo();
		message.success(res.data)
		userInfoDialog.value = false
	} else {
		message.error(res.data)
	}
}

// 生成邀请码
async function createInviteCode() {

	const res: ResData = await fetchGenInviteCodeAPI()
	if (!res.data)
		return message.error(res.message)
	message.success('生成邀请链接成功')
	authStore.getUserInfo()
}

// 复制邀请码
async function copyInviteCode() {
	if (!inviteCode.value)
		return message.error('请先生成您的专属邀请链接！')
	const path = `${window.location.href}?inVitecode=${inviteCode.value}`
	try {
		await toClipboard(path)
		message.success('复制专属邀请链接成功！')
	} catch (error) {
		message.error('当前设置不支持自动复制、手动复制吧！')
	}
}

// 分页
const paginationReg = reactive({
	page: 1,
	pageSize: 10,
	showSizePicker: true,
	pageSizes: [10, 20, 50],
	onChange: (page: number) => {
		paginationReg.page = page
		queryInviteRecord()
	},
	onUpdatePageSize: (pageSize: number) => {
		paginationReg.pageSize = pageSize
		paginationReg.page = 1
		queryInviteRecord()
	},
})

// 获取邀请记录
async function queryInviteRecord() {
	try {
		regLoading.value = true
		inviteData.value = await fetchGetInviteRecordAPI({
			page: paginationReg.page,
			size: paginationReg.pageSize
		}).then(res => res.data.rows);
		regLoading.value = false
	} catch (error) {
		regLoading.value = false
	}
}

onMounted(() => {
	queryInviteRecord()
})

// 发送验证码
function handleSendCaptch() {
	formRef.value?.validate(async (errors) => {
		if (!errors) {
			const res = await fetchSendSms({phone: phoneData.value?.phone, captchaCode: '123456'})
			if (res.code == 200) {
				PhoneCodeStatus.value = false
				message.success(res.data)
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
				message.error(res.data);
			}
		}
	}, (rule) => {
		return rule?.key === 'phone'
	})
}

// 绑定事件
function handlerSubmit() {
	formRef.value?.validate(async (errors) => {
		if (!errors) {
			const params = {
				userId: userInfo.value?.id,
				phone: phoneData.value?.phone,
				phoneCode: phoneData.value?.code,
			}
			const res = await fetchEditAndBindPhoneAPI(params)
			if (res.code == 200) {
				message.success(res.data)
				modifPhoneDialog.value = false
				authStore.getUserInfo()
			}
		}
	})
}

// 注销账号
function cancel() {

	const d = dialog.warning({
		title: '注销账号',
		content: '账号注销后所有数据将销毁并退出登录，确定注销？',
		positiveText: '确认',
		onPositiveClick: () => {
			d.loading = true
			handleConfirmDestroy();
		}
	})
}

const handleConfirmDestroy = async () => {
	await fetchUserDestoryAPI().then(res => {
		message.success("注销成功，系统即将自动退出");
		setTimeout(() => {
			authStore.logOut()
			router.push('/')
		}, 2000)
	})
}

// 关闭当前页面，返回上一级页面
function closePage() {
	// 获取上一级页面的路由地址
	const upPage = router.options.history.state.back
	router.push(upPage)
}

// 修改密码
async function modifyPasswordClick() {

	modifyPasswordRef.value?.validate(async res => {
		if (!res) {

			var data = {}
			// 判断用户是否有用户名
			if (userInfo.value?.username == null) {
				// 表示当前用户没有用户名，需要传递用户名

				// 判断用户是否有密码
				if (userInfo.value?.password == null) {
					// 当前用户没有设置密码，无需传递原密码
					data.username = modifyPasswordData.value?.username
					data.password = modifyPasswordData.value?.password

				} else {
					// 当前用户有设置密码，需传递原密码
					data.username = modifyPasswordData.value?.username
					data.password = modifyPasswordData.value?.password
					data.oldPassword = modifyPasswordData.value?.oldPassword

				}

			} else {
				// 表示当前用户已经有用户名，不用传用户名

				// 判断用户是否有密码
				if (userInfo.value?.password == null) {
					// 当前用户没有设置密码，无需传递原密码
					data.password = modifyPasswordData.value?.password
				} else {
					// 当前用户有设置密码，需传递原密码
					data.password = modifyPasswordData.value?.password
					data.oldPassword = modifyPasswordData.value?.oldPassword
				}
			}

			const resdata = await fetchUpdatePasswordAPI(data);
			if (resdata.code != 200) {
				message.error(resdata.message)
				return
			}

			modifyPasswordDialog.value = false
			message.success(resdata.data)

		}
	})
}

// 绑定/修改邮箱
async function modifyEmailClick() {
	emailDataRef.value?.validate(async errors => {
		if (!errors) {
			const res = await fetchUpdateEmailAPI({email: emailData.value?.email})
			if (res.code == 200) {
				message.success("验证信息发送成功，请前往邮箱完成" + (userInfo.value?.email == null ? '绑定' : '修改'))
				modifyEmailDialog.value = false
				authStore.getUserInfo()
			} else {
				message.error(res.data);
			}
		}
	}, (rule) => {
		return rule?.key === 'email'
	})
}
</script>

<template>
	<div style="overflow: hidden;width: 100%">
		<div class="user_center_left border-r-[2px] dark:border-[#15171A] border-[#ffffff]">
			<div class="return_page" @click="closePage">
				<img src="@/assets/images/retuen.png">
			</div>
			<div class="user_avatar_card">
				<div>
					<img class="user_avatar" :src="userInfo?.avatar">
					<div class="edit" @click="userInfoDialog = true">
						<img src="../../assets/images/edit.png">
					</div>
				</div>
				<div style="margin-top: 20px">
					<div style="font-size: 18px;font-weight: 600;margin-bottom: 5px">{{ userNickname }}</div>
					<div>{{ userInfo?.phone }}</div>
				</div>
			</div>
		</div>
		<div class="user_center_right">
			<div style="font-size: 28px;margin-top: 60px;margin-bottom: 20px" class="dark:text-[#D7D7D7]">用户中心</div>
			<div>
				<div class="points_card bg-[#fff] dark:bg-[#15171A] bg-[#FFFFFF]">
					<div class="points_item">
						<div>基础积分</div>
						<div style="margin-top: 10px">{{ userBalance?.model3Count }}</div>
					</div>
					<div class="points_item">
						<div>高级积分</div>
						<div style="margin-top: 10px">{{ userBalance?.model4Count }}</div>
					</div>
					<div class="points_item">
						<div>绘画积分</div>
						<div style="margin-top: 10px">{{ userBalance?.drawMjCount }}</div>
					</div>
					<div style="position: absolute;right: 20px;top: 20px" @click="pointsDialog = true">
						<SvgIcon icon="teenyicons:text-document-outline"></SvgIcon>
					</div>
				</div>
				<div class="invite_card">
					<div class="invite_card_item dark:bg-[#15171A] bg-[#FFFFFF]">
						<div style="position: absolute; top: 50%;left: 50%;transform: translate(-50%,-50%)">
							<div>卡密激活</div>
							<!--							<div style="width: 80px;height: 25px;line-height: 25px;background-color: #1174B3;-->
							<!--							border-radius: 5px;font-size: 14px;cursor: pointer;margin-top: 15px;color: #E5E5E5" @click="kamilDialog = true">-->
							<!--								立即激活-->
							<!--							</div>-->
							<div style="width: 80px;height: 25px;line-height: 25px;background-color: #1174B3;
							border-radius: 5px;font-size: 14px;cursor: pointer;margin-top: 15px;color: #E5E5E5"
									 @click="authStore.updateKamilDialog(true)">
								立即激活
							</div>
						</div>
					</div>
					<div class="invite_card_item dark:bg-[#15171A] bg-[#FFFFFF]">
						<div
							style="position: absolute; top: 50%;left: 50%;transform: translate(-50%,-50%);white-space: nowrap">
							<div>邀请好友</div>
							<div style="display: flex;align-items: center;justify-content: center;margin-top: 15px">
								<div style="height: 25px;line-height: 25px;background-color: #6B69BF;font-size: 14px;
								border-radius: 5px;padding: 1px 10px;cursor: pointer;margin-right: 5px;color: #E5E5E5"
										 @click="createInviteCode">生成专属邀请码
								</div>
								<div style="height: 25px;line-height: 25px;background-color: #35929A;font-size: 14px;
								border-radius: 5px;padding: 1px 10px;cursor: pointer;margin-left: 5px;color: #E5E5E5"
										 @click="copyInviteCode">
									复制专属邀请链接
								</div>
							</div>
						</div>
					</div>
					<div style="position: absolute;right: 20px;top: 20px" @click="inviteRecordDialog = true">
						<SvgIcon class="text-xl" icon="mdi:file-text-minus-outline"></SvgIcon>
					</div>
				</div>
			</div>
			<div class="info_card">
				<div style="position: relative;">
					<p class="info_title dark:text-[#fff]">资料修改</p>
					<div class="info_title_line bg-[#ffffff] dark:bg-[#010102]"></div>
				</div>
				<div class="info_list">
					<div class="info_item"
							 @click="useGlobalStore.updateBindwxDialog(userInfo?.isBindWx == true ? false : true)">
						<div style="display: flex;align-items: center">
							<div class="tag_img dark:bg-[#15171A] bg-[#FFFFFF]">
								<SvgIcon class="text-2xl text-[#000] dark:text-[#fff]" icon="arcticons:wechat"></SvgIcon>
							</div>
							<div>{{ userInfo?.isBindWx == true ? '已绑定' : '绑定微信' }}</div>
						</div>
						<div>
							<SvgIcon class="text-2xl" icon="mingcute:right-line"></SvgIcon>
						</div>
					</div>
					<div class="info_item" @click="modifyPasswordDialog = true">
						<div style="display: flex;align-items: center">
							<div class="tag_img dark:bg-[#15171A] bg-[#FFFFFF]">
								<SvgIcon class="text-2xl" icon="la:user-edit"></SvgIcon>
							</div>
							<div>修改密码</div>
						</div>
						<div>
							<SvgIcon class="text-2xl" icon="mingcute:right-line"></SvgIcon>
						</div>
					</div>
					<div class="info_item" @click="modifyEmailDialog = true">
						<div style="display: flex;align-items: center">
							<div class="tag_img dark:bg-[#15171A] bg-[#FFFFFF]">
								<SvgIcon class="text-2xl" icon="ic:outline-email"></SvgIcon>
							</div>
							<div>{{ userInfo?.email != null ? '修改邮箱' : '绑定邮箱' }}</div>
						</div>
						<div>
							<SvgIcon class="text-2xl" icon="mingcute:right-line"></SvgIcon>
						</div>
					</div>
					<div class="info_item" @click="modifPhoneDialog = true">
						<div style="display: flex;align-items: center">
							<div class="tag_img dark:bg-[#15171A] bg-[#FFFFFF]">
								<SvgIcon class="text-2xl" icon="ph:phone"></SvgIcon>
							</div>
							<div>{{ userInfo?.phone != null ? '修改手机号' : '绑定手机号' }}</div>
						</div>
						<div>
							<!-- <img style="width: 20px;height: 20px" src="../../assets/images/right_arrow.png"> -->
							<SvgIcon class="text-2xl" icon="mingcute:right-line"></SvgIcon>
						</div>
					</div>
				</div>
			</div>
			<div class="logout">
				<div style="position: relative;">
					<div class="logout_title dark:text-[#fff]">账号注销</div>
					<div class="info_title_line bg-[#ffffff] dark:bg-[#010102]"></div>
				</div>

				<div style="color: #B6B6B6;font-size: 13px;padding-left: 20px;margin-top: 10px">注销后账号所有数据将被销毁并不可能找回，请谨慎操作。
				</div>
				<div style="color: #fff; width: 100px;height: 30px;background-color: #1174B3;border-radius: 5px;
				font-size: 16px;text-align: center;line-height: 30px;margin-left: 20px;margin-top: 10px;cursor: pointer"
						 @click="cancel">注销账号
				</div>
			</div>
		</div>
	</div>

	<!--卡密兑换  对话框-->
	<KamilDialog></KamilDialog>

	<!--修改用户信息对话框-->
	<NModal :show="userInfoDialog" :mask-closable="false">
		<div class="user_modif_dialog dark:bg-[#15171A] bg-[#FFFFFF]">
			<div class="close_btn" @click="userInfoDialog = false">
				<img src="../../assets/images/close.png">
			</div>

			<div style="font-size: 20px;margin: 20px 0 20px 40px">
				编辑信息
			</div>

			<div class="user_info_card">
				<img class="user_avatar" :src="userAvatar == '' ? userInfo?.avatar : userAvatar">
				<n-upload accept=".jpg,.jpeg,.png" action="" :on-change="uploadChang"
									:default-upload="false" :show-file-list="true">
					<div>
						<img style="width: 15px;height: 15px;" src="../../assets/images/edit.png">
					</div>
				</n-upload>
				<div>
					<div style="text-align: left;margin-left: 20%">用户名:</div>
					<div class="dark:bg-[#010102] bg-[#f4f4f4]" style="width: 356px;text-align: center;margin-left: 20%;margin-top: 5px;">
						<NInput v-model:value="account" @keyup.enter="modifUserInfoClick"/>
					</div>

					<div style="text-align: left;margin-left: 20%;margin-top: 15px">昵称:</div>
					<div class="dark:bg-[#010102] bg-[#f4f4f4]" style="width: 356px;text-align: center;margin-left: 20%;margin-top: 5px;">
						<NInput v-model:value="userName" @keyup.enter="modifUserInfoClick"/>
					</div>

				</div>
			</div>
			<div class="btn_list">
				<NButton tertiary @click="userInfoDialog = false">
					取消
				</NButton>
				<NButton tertiary @click="modifUserInfoClick">
					确定
				</NButton>
			</div>
		</div>
	</NModal>

	<!--邀请记录对话框-->
	<NModal :show="inviteRecordDialog" :mask-closable="false">
		<div class="invite_Record_dialog dark:bg-[#15171A] bg-[#FFFFFF]">
			<div class="close_btn" @click="inviteRecordDialog = false">
				<img src="../../assets/images/close.png">
			</div>
			<div style="font-size: 20px;margin-top: 40px;margin-bottom: 20px">邀请记录</div>
			<NDataTable :loading="regLoading" :remote="true" pagination-behavior-on-filter="first" class="min-h-[470px]"
									:columns="columns" :data="inviteData" :pagination="paginationReg" :scroll-x="500"/>
		</div>
	</NModal>

	<!--积分对话框-->
	<NModal :show="pointsDialog" :mask-closable="false">
		<div class="points_card dark:bg-[#15171A] bg-[#FFFFFF]">
			<div class="close_btn" @click="pointsDialog = false">
				<img src="../../assets/images/close.png">
			</div>
			<Wallet ref="walletRef"/>
		</div>

	</NModal>


	<!--修改手机号/绑定手机号对话框-->
	<NModal :show="modifPhoneDialog" :mask-closable="false">
		<div class="modif_phone_dialog dark:bg-[#15171A] bg-[#FFFFFF]">
			<div class="close_btn" @click="modifPhoneDialog = false">
				<img src="../../assets/images/close.png">
			</div>

			<div style="font-size: 18px;color: #6BC4FD;margin-top: 30px">
				<span style="border-bottom: 3px solid #6BC4FD; padding-bottom: 2px">修改手机号</span>
			</div>

			<NForm ref="formRef" :model="phoneData" :rules="rules" label-placement="top" label-width="auto" size="large"
						 require-mark-placement="right-hanging" :style="{
					maxWidth: '640px',
					marginTop: '20px'
				}">
				<NFormItem path="phone" label="手机号">
					<div class="dark:bg-[#010102] bg-[#f4f4f4] w-full">
						<NInput v-model:value="phoneData.phone" tabindex="1" placeholder="请输入手机号">
							<template #prefix>
								<img style="margin-right: 5px" src="../../assets/images/user_center_phone2.png">
							</template>
						</NInput>
					</div>

				</NFormItem>
				<NFormItem path="code" label="验证码">
					<div class="dark:bg-[#010102] bg-[#f4f4f4] w-full">
						<NInput style="position: relative" v-model:value="phoneData.code" placeholder="请输入验证码" :maxlength="6"
										show-password-on="click" tabindex="2" @keyup.enter="handlerSubmit">
							<template #prefix>
								<img style="margin-right: 3px" src="../../assets/images/user_phone_code.png">
							</template>
						</NInput>
					</div>

					<div class="send_code dark:bg-[#010102] bg-[#f4f4f4]" @click="handleSendCaptch" v-if="PhoneCodeStatus == true">获取验证码</div>
					<div class="send_code dark:bg-[#010102] bg-[#f4f4f4]" v-else>{{ lastSendPhoneCodeTime }}S后重新获取</div>
				</NFormItem>

				<NFormItem>
					<NButton block type="primary" @click="handlerSubmit">
						绑定
					</NButton>
				</NFormItem>
			</NForm>
		</div>
	</NModal>

	<!--修改密码对话框-->
	<NModal :show="modifyPasswordDialog" :mask-closable="false">
		<div class="modify_password_dialog dark:bg-[#15171A] bg-[#FFFFFF]">

			<div class="close_btn" @click="modifyPasswordDialog = false">
				<img src="../../assets/images/close.png">
			</div>

			<div style="font-size: 18px;color: #6BC4FD;margin-top: 30px">
				<span style="border-bottom: 3px solid #6BC4FD; padding-bottom: 2px">修改密码</span>
			</div>

			<NForm ref="modifyPasswordRef" :model="modifyPasswordData" :rules="modifyPassworRules" label-placement="top"
						 label-width="auto" size="large"
						 require-mark-placement="right-hanging" :style="{
					maxWidth: '640px',
					marginTop: '20px'
				}">
				<NFormItem path="username" label="用户名" v-if="userInfo.password == null">
					<div class="dark:bg-[#010102] bg-[#f4f4f4] w-full">
						<NInput v-model:value="modifyPasswordData.username" tabindex="1" placeholder="请输入用户名">
							<template #prefix>
								<img style="margin-right: 5px" src="../../assets/images/user_center_username.png">
							</template>
						</NInput>
					</div>
				</NFormItem>
				<NFormItem path="oldPassword" label="原密码" v-if="userInfo.password != 'no'">
					<div class="dark:bg-[#010102] bg-[#f4f4f4] w-full">
						<NInput style="position: relative" type="password" v-model:value="modifyPasswordData.oldPassword"
										placeholder="请输入原密码"
										show-password-on="click" tabindex="2" @keyup.enter="modifyPasswordClick">
							<template #prefix>
								<img style="margin-right: 3px" src="../../assets/images/user_center_password.png">
							</template>
						</NInput>
					</div>

				</NFormItem>
				<NFormItem path="password" label="密码">
					<div class="dark:bg-[#010102] bg-[#f4f4f4] w-full">
						<NInput style="position: relative" v-model:value="modifyPasswordData.password" placeholder="请输入密码"
										show-password-on="click" tabindex="2" @keyup.enter="modifyPasswordClick" type="password">
							<template #prefix>
								<img style="margin-right: 3px" src="../../assets/images/user_center_password.png">
							</template>
						</NInput>
					</div>
				</NFormItem>

				<NFormItem>
					<NButton block type="primary" @click="modifyPasswordClick">
						修改
					</NButton>
				</NFormItem>
			</NForm>
		</div>

	</NModal>

	<!--修改邮箱对话框-->
	<NModal :show="modifyEmailDialog" :mask-closable="false">
		<div style="height: auto" class="modif_phone_dialog dark:bg-[#15171A] bg-[#FFFFFF]">
			<div class="close_btn" @click="modifyEmailDialog = false">
				<img src="../../assets/images/close.png">
			</div>

			<div style="font-size: 18px;color: #6BC4FD;margin-top: 30px">
				<span style="border-bottom: 3px solid #6BC4FD; padding-bottom: 2px">{{
						userInfo?.email != null ? '修改邮箱' : '绑定邮箱'
					}}</span>
			</div>

			<NForm ref="emailDataRef" :model="emailData" :rules="emailDataRules" label-placement="top" label-width="auto"
						 size="large"
						 require-mark-placement="right-hanging" :style="{
					maxWidth: '640px',
					marginTop: '20px'
				}">
				<NFormItem path="email" label="邮箱地址">
					<div class="dark:bg-[#010102] bg-[#f4f4f4] w-full">
						<NInput v-model:value="emailData.email" tabindex="1" placeholder="请输入邮箱地址">
							<template #prefix>
								<img style="margin-right: 5px" src="../../assets/images/user_center_email.png">
							</template>
						</NInput>
					</div>

				</NFormItem>

				<NFormItem>
					<NButton block type="primary" @click="modifyEmailClick">
						{{ userInfo?.email != null ? '修改' : '绑定' }}
					</NButton>
				</NFormItem>
			</NForm>
		</div>
	</NModal>
</template>

<style scoped lang="less">
.user_center_left {
	width: 30%;
	height: 100vh;
	// border-right: 1px solid #2E2E4C;
	float: left;
	position: relative;

	.return_page {
		position: absolute;
		top: 20px;
		left: 20px;

		img {
			width: 20px;
			height: 20px;
		}
	}

	.user_avatar_card {
		text-align: center;
		position: absolute;
		top: 25%;
		left: 50%;
		transform: translate(-50%);
		position: relative;

		.user_avatar {
			margin: auto;
		}

		.edit {
			position: absolute;
			padding: 5px;
			background-color: #DBDBDB;
			border-radius: 50%;
			right: 44%;
			top: 35%;

			img {
				width: 15px;
				height: 15px;
			}
		}
	}

	.user_avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
	}
}

.user_center_right {
	width: calc(100% - 30%);
	height: 100%;
	float: right;
	padding: 0 30px;

	.points_card {
		width: 80%;
		height: 152px;
		border-radius: 15px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;

		.points_item {
			width: calc(100% / 3);
			text-align: center;
			font-size: 20px;
		}
	}

	.invite_card {
		width: 80%;
		height: 152px;
		display: flex;
		align-items: center;
		margin-top: 10px;
		position: relative;

		.invite_card_item {
			width: 49.5%;
			height: 100%;
			// background-color: #2E2E4C;
			text-align: center;
			font-size: 20px;
			border-radius: 15px;
			margin-right: 10px;
			position: relative;
		}

		.invite_card_item:nth-child(2) {
			margin-right: 0;
		}
	}

	.info_card {
		margin-top: 20px;
		width: 80%;

		.info_title {
			// width: 100%;
			display: inline;
			font-size: 18px;
			// padding-left: 40px;
			margin-left: 40px;
			position: relative;
			overflow: hidden;
			z-index: 999;
			padding: 5px;
		}

		.info_title_line {
			height: 2px;
			width: 100%;
			position: absolute;
			top: 12px;
		}

		// .info_title:before,
		// .info_title:after {
		// 	position: absolute;
		// 	content: '';
		// 	background-color: #2E2E4C;
		// 	width: 35px;
		// 	height: 2px;
		// 	top: 50%;
		// 	right: 0;
		// 	left: 0;
		// 	transform: translate(0, -50%);
		// }

		.info_title:before {
			margin-right: 10px;
		}

		.info_title:after {
			margin-left: 115px;
			width: 100%;
		}

		.info_list {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-wrap: wrap;

			.info_item {
				width: 50%;
				display: flex;
				align-items: center;
				justify-content: space-between;
				height: 80px;
				font-size: 13px;
				cursor: pointer;

				.tag_img {
					margin-left: 20px;
					margin-right: 20px;
					// background-color: #2E2E4C;
					padding: 10px;
					border-radius: 50%;
					margin-bottom: 5px;

					img {
						width: 20px;
						height: 20px;
					}
				}
			}
		}
	}

	.logout {
		width: 80%;

		.logout_title {
			display: inline;
			font-size: 18px;
			margin-left: 40px;
			position: relative;
			overflow: hidden;
			padding: 5px;
			z-index: 999;
		}

		.info_title_line {
			height: 2px;
			width: 100%;
			position: absolute;
			top: 12px;
		}

		// .logout_title:before,
		// .logout_title:after {
		// 	position: absolute;
		// 	content: '';
		// 	background-color: #2E2E4C;
		// 	width: 35px;
		// 	height: 2px;
		// 	top: 50%;
		// 	right: 0;
		// 	left: 0;
		// 	transform: translate(0, -50%);
		// }

		.logout_title:before {
			margin-right: 10px;
		}

		.logout_title:after {
			margin-left: 115px;
			width: 100%;
		}
	}

}

.user_modif_dialog {
	width: 584px;
	//height: 383px;
	padding-bottom: 30px;
	// background: #3B3B62;
	border-radius: 5px;
	position: relative;

	.user_info_card {
		width: 100%;
		text-align: center;
		position: relative;

		.user_avatar {
			width: 80px;
			height: 80px;
			border-radius: 50%;
			margin: auto;
			margin-bottom: 30px;
		}

		.n-upload {
			height: 0;
		}

		/deep/ .n-upload-file-list {
			display: none;
		}

		.n-upload div {
			padding: 5px;
			background-color: #DBDBDB;
			border-radius: 50%;
			position: absolute;
			top: 55px;
			right: 43%;
		}

		.n-input {
			width: 356px;
			height: 35px;
			border-radius: 5px;
			font-size: 14px;
			color: #FFFFFF;
			line-height: 35px;
			background-color: transparent;
			--n-border: 0px solid rgb(224, 224, 230) !important;

			/deep/ .n-input__placeholder {
				color: #FFFFFF;
				line-height: 48px;
			}
		}
	}

	.btn_list {
		text-align: center;
		margin-top: 40px;

		.n-button:nth-child(1) {
			// background-color: #323254;
			color: #C0C0C0;
			font-size: 13px;
			margin-right: 50px;
		}

		.n-button:nth-child(2) {
			background-color: #1174B3;
			color: #FFFFFF;
			font-size: 13px;
			margin-left: 50px;
		}
	}

	.close_btn {
		position: absolute;
		right: 10px;
		top: 10px;

		img {
			width: 20px;
			height: 20px;
		}
	}
}

.invite_Record_dialog {
	width: 900px;
	height: 600px;
	// background: #3B3B62;
	border-radius: 5px;
	position: relative;
	padding: 0 50px;

	.close_btn {
		position: absolute;
		right: 10px;
		top: 10px;

		img {
			width: 20px;
			height: 20px;
		}
	}

	.n-data-table{
		--n-merged-th-color: transparent !important;
		--n-merged-td-color: transparent !important;

	}

	.n-base-selection-label{
		background-color: transparent !important;
		--n-merged-border-color: 1px solid #e0e0e6 !important;
	}
	.n-input{
		background-color: transparent !important;
	}

	/deep/.n-base-selection .n-base-selection-label{
		background-color: transparent !important;
		border: 1px solid #ffffff17;
	}
}

.points_card {
	width: 60%;
	height: 70%;
	// background-color: #3B3B62;
	position: relative;
	padding: 30px 50px;

	.close_btn {
		position: absolute;
		right: 10px;
		top: 10px;

		img {
			width: 20px;
			height: 20px;
		}
	}
}

.modif_phone_dialog {
	width: 450px;
	height: 383px;
	// background: #3B3B62;
	border-radius: 5px;
	position: relative;
	padding: 0 40px;

	.n-input {
		--n-color: none !important;
		border-radius: 5px;
		font-size: 12px;
		background-color: transparent;
		--n-border: 0px solid #0000 !important;
	}

	.send_code {
		width: 131px;
		height: 40px;
		border-radius: 5px;
		line-height: 40px;
		text-align: center;
		font-size: 12px;
		margin-left: 10px;
		cursor: pointer;
	}

	.close_btn {
		position: absolute;
		right: 10px;
		top: 10px;

		img {
			width: 20px;
			height: 20px;
		}
	}
}

.modify_password_dialog {
	width: 450px;
	//height: 383px;
	border-radius: 5px;
	position: relative;
	padding: 0 40px;

	.close_btn {
		position: absolute;
		right: 10px;
		top: 10px;

		img {
			width: 20px;
			height: 20px;
		}
	}

	.n-input {
		--n-color: none !important;
		--n-border: 0px solid #65658A !important;
		border-radius: 5px;
		font-size: 12px;
		background-color: transparent;
	}
}
</style>
