import star1 from "../img/star1.png"
import task from "../img/task.png"
import application from "../img/application.png"
export const drawLsit=[
	{
		menuName: '文生图',
		key: 'TextToImage',
		// menuIcon: 'fluent:draw-text-20-filled',
		menuPath: '/midjourney/text-to-image',
	},{
		menuName: '图生图',
		key: 'ImageMixImage',
		// menuIcon: 'fluent:draw-text-20-filled',
		menuPath: '/midjourney/image-mix-image',
	},{
		menuName: '图生文',
		key: 'ImageToText',
		// menuIcon: 'fluent:draw-text-20-filled',
		menuPath: '/midjourney/image-to-text',
	},{
		menuName: 'AI换脸',
		key: 'AIChangeFace',
		// menuIcon: 'fluent:draw-text-20-filled',
		menuPath: '/midjourney/AI-change-face',
	},
]

export const MjMenu = [

	{
		menuName: '绘画广场',
		key: 'draw',
		menuIcon: 'bxs:planet',
		menuIcon1: star1,
		menuPath: '/midjourney/inspiration',
		menuPath1: '/midjourney/inspiration',
	},
	{
		menuName: 'MJ绘画',
		key: 'beverage',
		menuIcon: 'ph:images',
		menuIcon1: '',
		name:"MJ",
		menuPath: '/midjourney/text-to-image',
		menuPath1: '/midjourney/text-to-image,/midjourney/image-to-text,/midjourney/image-mix-image,/midjourney/AI-change-face',
	},
	{
		menuName: '绘画任务',
		key: 'prompt',
		menuIcon: 'mingcute:task-2-fill',
		menuIcon1: task,
		menuPath: '/midjourney/paint-task',
		menuPath1: '/midjourney/paint-task',
	},
	{
		menuName: 'DALL绘画',
		key: 'inspiration',
		menuIcon: 'game-icons:inspiration',
		menuIcon1: '',
		name:"dall",
		menuPath: '/draw',
		menuPath1: '/draw',
	},
	// {
	// 	menuName: '工具箱',
	// 	key: 'task',
	// 	menuIcon: 'fluent:draw-shape-24-regular',
	// 	menuIcon1: application,
	// 	menuPath: '/midjourney/image-mix-image',
	// },
]


export const InspirationTab = [
	{name: "全部", value: ''},
	{name: "绘画制作", value: '1'},
	{name: "摄影拍照", value: '2'},
	{name: "头像制作", value: '3'},
	{name: "美女形象", value: '4'},
	{name: "动漫漫画", value: '5'},
	{name: "3D渲染", value: '6'},
	{name: "广告设计", value: '7'},
	{name: "壁纸绘画", value: '8'},
	{name: "艺术设计", value: '9'},
	{name: "国风画作", value: '10'},
	{name: "平面设计", value: '11'},
	{name: "商拍摄影", value: '12'},
	{name: "室内设计", value: '13'},
]

export interface PromptItem {
	status: boolean
	title: string
	isCarryParams: boolean
}


export interface ImageData {
	fileInfo: FileInfo
	imageUrl: string
	prompt: string;
	title: string;
}

interface FileInfo {
	thumbImg: string;
}

export interface ArrayObj {
	label: string;
	value: number
}

export const MjMode = {
  'fast': 1,
  "relax": 2,
  "turbo": 3,
}

export const mjModelKeyMap:{[key: number]: string } = {
	1: 'fast',
	2: "relax",
	3: "turbo"
}

/**
 * 任务状态枚举 1: 等待中 2: 绘制中 3: 绘制完成 4: 绘制失败 5: 绘制超时 6：等待输入
 */
export enum MidjourneyStatusEnum {
	None,
	WAITING  , // 1: 等待中
	DRAWING , // 2: 绘制中
	DRAWED , // 3: 绘制完成
	DRAWFAIL , // 4: 绘制失败
	DRAWTIMEOUT , // 5: 绘制超时
	MODAL, // 6: 等待输入
}

export const taskList: ArrayObj[] = [
	{label: '全部', value: 0},
	{label: '执行中', value: 2},
	{label: '已完成', value: 3},
	{label: '已失败', value: 4},
	{label: '我的收藏', value: 6},
]

export const taskMap = taskList.reduce((pre: any, cur, index, arr) => {
	pre[cur.label] = cur.value;
	return pre;
}, {})

export const sizeList = [
	[
		{aspect: '1:1', width: '100%', height: '100%', label: "头像框", value: '1:1',},
		{aspect: '1:2', width: '50%', height: '100%', label: "手机壁纸", value: '1:2',},
		{aspect: '16:9', width: '100%', height: '57%', label: "电脑壁纸", value: '16:9',},
		{aspect: '9:16', width: '57%', height: '100%', label: "宣传海报", value: '9:16',},
	],
	[
		{aspect: '4:3', width: '100%', height: '75%', label: "文章配图", value: '4:3',},
		{aspect: '3:4', width: '75%', height: '100%', label: "媒体配图", value: '3:4',},
		{aspect: '3:2', width: '100%', height: '67%', label: "横板名片", value: '3:2',},
		{aspect: '2:3', width: '67%', height: '100%', label: "小红书图", value: '2:3',},
	]
]

export const imgMixImgSize = [
    [
		{aspect: '1:1', width: '100%', height: '100%', label: "头像框", value: 'SQUARE'},
        {aspect: '2:3', width: '67%', height: '100%', label: "小红书图", value: 'PORTRAIT'},
		{aspect: '3:2', width: '100%', height: '67%', label: "横板名片", value: 'LANDSCAPE'},
    ]
]



export const styleOptions = [
	{label: '默认风格', value: 'default'},
	{label: '表现力风格', value: 'expressive'},
	{label: '可爱风格', value: 'cute'},
	{label: '景观风格', value: 'scenic'},
	{label: '原始风格', value: 'original'},
]

export const styleMjOptions = [
	{label: 'raw风格', value: 'raw'},
]

export const qualityOptions = [
	{label: '普通', value: '.25'},
	{label: '一般', value: '.5'},
	{label: '高清', value: '1'},
	{label: '超高清', value: '2'},
]


export const radioGroup =  [
	{label: "休闲模式", value: 2, icon: ""},
	{label: "快速模式", value: 1, icon: ""},
	{label: "Turbo模式", value: 3, icon: ""},]

export const radioMobileGroup =  [
	{label: "休闲模式(预计耗时6分)", value: 2, icon: ""},
	{label: "快速模式(预计耗时1分)", value: 1, icon: ""},
	{label: "Turbo模式(预计耗时30秒)", value: 3, icon: ""},]

export const modelOptions = [
	{label: 'MJ6.0(最新)', value: 'MJ-6.0'},
	{label: 'MJ5.2(真实细节)', value: 'MJ-5.2'},
	{label: 'MJ5.1(艺术)', value: 'MJ-5.1'},
	{label: 'MJ5.0(真实增强)', value: 'MJ-5'},
	{label: 'MJ4.0(真实)', value: 'MJ-4'},
	{label: 'NJ5.0(动漫增强)', value: 'NIJI-5'},
	{label: 'NJ4.0(动漫)', value: 'NIJI-4'},
	// {label: 'Original', value: 'Original'},
	// {label: 'Scenic', value: 'Scenic'},
	// {label: 'Cute', value: 'Cute'},
	// {label: 'Expressive', value: 'Expressive'},
]

export const similarityOptions = [
	{label: '--iw 0.25 默认 相似度30%', value: '0.25'},
	{label: '--iw 0.5 相似度40%', value: '0.5'},
	{label: '--iw 1 相似度50%', value: '1'},
	{label: '--iw 1.25 相似度60%', value: '1.25'},
	{label: '--iw 1.5 相似度70%', value: '1.5'},
	{label: '--iw 1.75 相似度80%', value: '1.75'},
	{label: '--iw 2 相似度90%', value: '2'},
]

