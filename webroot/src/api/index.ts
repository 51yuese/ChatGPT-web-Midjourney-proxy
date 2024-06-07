import type {AxiosProgressEvent, GenericAbortSignal} from 'axios'
import {get, post} from '@/utils/request'
// import { useSettingStore } from '@/store'

/* 流失对话聊天 */
export function fetchChatAPIProcess<T = any>(
	params: {
		prompt: string
		appId?: number
		options?: { conversationId?: string; parentMessageId?: string; temperature: number }
		signal?: GenericAbortSignal
		onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void
	},
) {
	return post<T>({
		url: '/chatgpt/chat-process',
		data: {prompt: params.prompt, appId: params?.appId, options: params.options},
		signal: params.signal,
		onDownloadProgress: params.onDownloadProgress,
	})
}

export function fetchChatAPIUpload(param: FormData, onUploadProgress?: (progress: AxiosProgressEvent) => void) {
	return post({
		url: '/chatgpt/upload',
		data: param,
		onUploadProgress
	})
}

/* 获取个人信息 */
export function fetchGetInfo<T>() {
	return get<T>({url: '/auth/getInfo'})
}

// /* 注册 */
// export function fetchRegisterAPI<T>(data: { username: string; password: string; email: string }): Promise<T> {
// 	return post<T>({url: '/auth/register', data}) as Promise<T>
// }

/* 注册 */
export function fetchRegisterByPhoneAPI<T>(data: { username: string; password: string; phone: string; phoneCode: string }): Promise<T> {
	return post<T>({url: '/auth/registerByPhone', data}) as Promise<T>
}

// /* 登录 */
// export function fetchLoginAPI<T>(data: { username: string; password: string }): Promise<T> {
// 	return post<T>({url: '/auth/login', data}) as Promise<T>
// }

/* 手机号登录 */
export function fetchLoginByPhoneAPI<T>(data: { phone: string; password: string }): Promise<T> {
	return post<T>({url: '/auth/loginByPhone', data}) as Promise<T>
}

/* 修改个人信息 */
export function fetchUpdateInfoAPI<T>(data: {}): Promise<T> {
	return post<T>({url: '/user/update', data}) as Promise<T>
}

/* 获取个人绘画记录 */
export function fetchGetChatLogDraw<T>(data: { model: string }): Promise<T> {
	return get<T>({url: '/chatLog/draw', data}) as Promise<T>
}

/* 获取所有绘画记录 */
export function fetchGetAllChatLogDraw<T>(data: { size: number; rec: number; model: string }): Promise<T> {
	return get<T>({url: '/chatLog/drawAll', data}) as Promise<T>
}

/* chatgpt的dall-e2绘画 */
export function fetchChatDraw<T>(data: { prompt: string; n: number; size: string }): Promise<T> {
	return post<T>({url: '/chatgpt/chat-draw', data}) as Promise<T>
}


/* 获取mind绘画联想词 */
export function fetchGetchatMindApi<T = any>(
	params: {
		prompt: string
		options?: { conversationId?: string; parentMessageId?: string; temperature: number }
		signal?: GenericAbortSignal
		onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void
	},
) {
	return post<T>({
		url: '/chatgpt/chat-mind',
		data: {prompt: params.prompt, options: params.options},
		signal: params.signal,
		onDownloadProgress: params.onDownloadProgress,
	})
}

/* 获取图片验证码 */
export function fetchCaptchaImg<T>(data: { color: string }): Promise<T> {
	return post<T>({url: '/auth/captcha', data}) as Promise<T>
}

/* 发送手机验证码 */
export function fetchSendSms<T>(data: { phone: string; captchaId: string; captchaCode: string }): Promise<T> {
	return post<T>({url: '/auth/sendPhoneCode', data}) as Promise<T>
}

/* 发送手机验证码 */
export function fetchChatVoice<T>(data: FormData, signal?: GenericAbortSignal): Promise<Blob> {
	// 返回类型blob
	return post({
		url: '/chatgpt/chat-conversation',
		signal: signal,
		data,
		responseType: 'blob',
	}) as Promise<Blob>
}

// 获取手机号是否绑定
export function fetchGetPhoneStatus() {
	return post({
			url: '/auth/getPhoneStatus'
		}
	)
}

/* 手机号登录注册 */
export function fetchLoginAndRegisterByPhoneAPI<T>(data: { phone: string; phoneCode: string, invitedBy: string }): Promise<T> {
	return post<T>({url: '/auth/loginByPhoneV3', data}) as Promise<T>
}

/* 绑定/换绑手机号 */
export function fetchEditAndBindPhoneAPI<T>(data: { userId: number, phone: string; phoneCode: string }): Promise<T> {
	return post<T>({url: '/auth/bindPhone', data}) as Promise<T>
}

// 邮箱注册
export function fetchEmailRegister<T>(data: {
	username:string,
	password:string,
	email: string,
	captchaCode:string,
	captchaId:string
}): Promise<T> {
	return post<T>({url: '/auth/register', data}) as Promise<T>
}

// /* 修改密码 */
// export function fetchUpdatePasswordAPI<T>(data: { username:string, oldPassword?: string; password?: string }): Promise<T> {
// 	return post<T>({url: '/auth/updatePassword', data}) as Promise<T>
// }

/* 修改密码 */
export function fetchUpdatePasswordAPI<T>(data:{}): Promise<T> {
	return post<T>({url: '/auth/updatePassword', data}) as Promise<T>
}

/* 修改/绑定邮箱 */
export function fetchUpdateEmailAPI<T>(data:{email:string}): Promise<T> {
	return post<T>({url: '/auth/updateEmail', data}) as Promise<T>
}

/* 注册 */
export function fetchRegisterAPI<T>(data: { username: string; password: string}): Promise<T> {
	return post<T>({url: '/auth/registeV3', data}) as Promise<T>
}
/* 登录 */
export function fetchLoginAPI<T>(data: { username: string; password: string }): Promise<T> {
	return post<T>({url: '/auth/loginV4', data}) as Promise<T>
}


