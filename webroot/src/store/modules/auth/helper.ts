import {ss} from '@/utils/storage'

const LOCAL_NAME = 'SECRET_TOKEN'

export function getToken() {
	return ss.get(LOCAL_NAME)
}

export function setToken(token: string) {
	return ss.set(LOCAL_NAME, token)
}

export function removeToken() {
	return ss.remove(LOCAL_NAME)
}

export interface UserBalance {
	isMember: boolean
	model3Count: number
	model4Count: number
	drawMjCount: number
	memberModel3Count: number
	memberModel4Count: number
	memberDrawMjCount: number
	useModel3Count: number
	useModel4Count: number
	useModel3Token: number
	useModel4Token: number
	useDrawMjToken: number
	sumModel3Count: number
	sumModel4Count: number
	sumDrawMjCount: number
	expirationTime: Date
}

export interface GlobalConfig {
	siteName: string
	qqNumber: string
	vxNumber: string
	baiduCode: string
	buyCramiAddress: string
	noticeInfo: string
	inviteSendStatus: string
	registerSendStatus: string
	registerSendModel3Count: string
	registerSendModel4Count: string
	registerSendDrawMjCount: string
	inviteGiveSendModel3Count: string
	inviteGiveSendModel4Count: string
	inviteGiveSendDrawMjCount: string
	invitedGuestSendModel3Count: string
	invitedGuestSendModel4Count: string
	invitedGuestSendDrawMjCount: string
	clientHomePath: string
	clientLogoPath: string
	clientFavoIconPath: string
	isUseWxLogin: boolean
	robotAvatar: string
	siteRobotName: string
	mindDefaultData: string
	payEpayStatus: string
	payHupiStatus: string
	payWechatStatus: string
	payEpayChannel: string
	payMpayChannel: string
	payEpayApiPayUrl: string
	payMpayStatus: string
	isAutoOpenNotice: string
	isShowAppCatIcon: string
	salesBaseRatio: string
	salesSeniorRatio: string
	salesAllowDrawMoney: string
	companyName: string
	filingNumber: string
	phoneRegisterStatus: string
	emailRegisterStatus: string
	wechatRegisterStatus: string
	wechatSilentLoginStatus: string
	signInStatus: string
	signInModel3Count: string
	signInModel4Count: string
	signInMjDrawToken: string
	appMenuHeaderTips: string
	appMenuHeaderBgUrl: string
	clientMenuList: string
}

export interface MjDrawFormConfig {
	prompt: string, // 绘画内容描述
	model: string, // 模型版本
	quality: string, // 质量
	style: string, // 风格
	stylize: number, // 风格化
	diversity: number, // 多样性
	similarity: string, // 相似度
	sensitiveWords: string, // 敏感词
	size: string // 尺寸
	baseImage: string[],
	mode: number,  // 模式 relax 休闲模式 fast 快速模式
	translate: number, // 翻译
	extendParam: any[];
}

export interface AuthState {
	token: string | undefined
	loginDialog: boolean
	globalConfigLoading: boolean
	customZoomDialog: boolean
	inspirationDialog: boolean
	openRemixModal: boolean
	openRegionModal: boolean
	openRemixModalData: {
		customId: string;
		prompt: string;
	}
	loadInit: boolean
	isGenuine: number
	userInfo: {
		username: string
		email: string
		role: string
		id: number
		avatar?: string
		sign?: string
		inviteCode: string
		isBindWx: boolean
		consecutiveDays: number
	}
	userBalance: UserBalance
	globalConfig: GlobalConfig,
	mjDrawForm: MjDrawFormConfig,
	sendSquareDialog: boolean, // 发送灵感广场
	sendSquareTaskId: number, // 发送灵感广场
	previewDrawDialog: boolean, // 预览绘画
	previewDrawTaskId: number, // 预览绘画id

	drawId: string;
	taskId: string;
	selectSiderIndex: number // // 应用侧边栏当前选中的id
	exploreAppIndex: number, // 探索引用的索引值
	appListIndex: number, // 应用列表的索引值
	mineAppIndex: number, // 我的应用的索引值
	createAppIndex: number, //创建应用的索引值
	AppAllIndex: number, // 全部应用的索引值
	createAppDialog:boolean, // 创建应用对话框,
	selectAppListIndex: number,
	searchAppList: any // 搜索获得的应用数据
	isSearchApp: boolean // 是否处于应用搜索，
	kamilDialog: boolean // 卡密兑换对话框
}

export interface MjDraw {
	empty: boolean // 是否空，空的表示刚开始，没任何绘画
}
