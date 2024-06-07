import { get, post } from '@/utils/request'
import {
    IMAGE_ACTION_OPTIONS,
    IMAGE_MIX_IMAGE_OPTIONS,
    IMAGE_TO_TEXT_OPTIONS, MidjourneyActionEnum,
    MidJourneyDrawEnum, REGION_REDRAW_ACTION_OPTIONS,
    TEXT_TO_IMAGE_OPTIONS
} from "@/constants";

/* mj draw */
export function fetchMjDtawAPI<T>(data: { prompt: string }): Promise<T> {
  return post<T>({
    url: '/mj/draw',
    data,
  })
}

/* mj upscale Img */
export function fetchUpscaleSingleImgAPI<T>(data: { message_id: string; orderId: number }): Promise<T> {
  return post<T>({
    url: '/mj/upscaleSingleImg',
    data,
  })
}

/* mj variation img */
export function fetchVariationSingleImgAPI<T>(data: { message_id: string; orderId: number }): Promise<T> {
  return post<T>({
    url: '/mj/variationSingleImg',
    data,
  })
}

/* mj fanyi */
export function fetchTranslateAPI<T>(data: { text: string }): Promise<T> {
  return get<T>({
    url: '/fanyi/translate',
    data,
  })
}

/* 提交一个绘画任务 */
// export function fetchDrawTaskAPI<T>(data: {prompt?: string; imgUrl?: string; extraParam?: string; drawId?: number; action?: number; orderId?: number,  }): Promise<T> {
//   return post<T>({
//     url: '/queue/addMjDrawQueue',
//     data,
//   })
// }


// action 1 绘图 参数 params: { prompt , imageUrl , mode, translate }
// action 2 图生图 参数 params: { image1 , image2 }
// action 3 图混图 参数 params: { image1 , image2, image3, image4 }
// action 4 按钮操作 params: { messageId, customId, flags, taskId }

/* 提交一个绘画任务 */
export function fetchAddMjDrawTaskAPI<T>(data: {
    type: MidJourneyDrawEnum,
    params: TEXT_TO_IMAGE_OPTIONS | IMAGE_TO_TEXT_OPTIONS | IMAGE_MIX_IMAGE_OPTIONS | IMAGE_ACTION_OPTIONS | REGION_REDRAW_ACTION_OPTIONS,
}): Promise<T> {
  return post<T>({
    url: '/midjourney/task_add',
    data,
  })
}

/* 提交一个绘画任务 */
export function fetchSubmitRegionJobAPI<T>(data: {
    messageId: string;
    customId: string;
    messageFlags: number;
    mode: number
}): Promise<T> {
  return post<T>({
    url: '/midjourney/vary_region_info',
    data,
  })
}

/* 图生文，图混图任务 */
export function fetchUploadImageDrawTaskAPI<T>(data: any): Promise<T> {
    return post<T>({ url: '/midjourney/upload_task_add', data }) as Promise<T>
}


/* 提交一个绘画任务 */
export function fetchMidjourneySuggestList<T>(data: { page: number  ; size: number  } = {page: 1, size: 4}): Promise<T> {
  return get<T>({
    url: '/midjourney/query',
    data,
  })
}



/* 获取MJ绘画联想词 */
export function fetchGetMjPromptAssociateApi<T>(data: { prompt: string }): Promise<T> {
	return post<T>({ url: '/chatgpt/mj-associate', data }) as Promise<T>
}


/* 获取MJ绘画翻译 */
export function fetchGetMjPromptFanyiApi<T>(data: { prompt: string }): Promise<T> {
	return post<T>({ url: '/chatgpt/mj-fy', data }) as Promise<T>
}

/* 获取我得绘制任务列表 */
export function fetchMidjourneyDrawList<T>(data: { page?: number; size?: number }): Promise<T> {
	return get<T>({ url: '/midjourney/drawList', data }) as Promise<T>
}



/* 获取Mj提示词 */
export function fetchMidjourneyPromptList<T>(): Promise<T> {
	return get<T>({ url: '/midjourney/queryPrompts' }) as Promise<T>
}

/* 删除MJ绘画记录 */
export function fetchRemoveMjDraw<T>(data: { id: number }): Promise<T> {
	return post<T>({ url: '/midjourney/delete_draw', data }) as Promise<T>
}

/* 获取我得绘制列表 */
export function fetchMidjourneyGetList<T>(data: { page: number; size: number; squareType: string; rec: number }): Promise<any> {
	return get<T>({ url: '/midjourney/getList', data }) as Promise<T>
}

/* 获取我得绘制列表 */
export function fetchGetDraw<T>(data:any): Promise<any> {
	return get<T>({ url: '/midjourney/getDraw', data }) as Promise<T>
}
/* 获取多个绘制任务列表 */
export function fetchGetDrawMany<T>(data:any): Promise<T> {
	return get<T>({ url: '/midjourney/getDetailByIds', data }) as Promise<T>
}



/* 推荐图片 */
export function fetchRecDraw<T>(data: { id: number, squareType: string }): Promise<T> {
	return post<T>({ url: '/midjourney/rec', data }) as Promise<T>
}

/* 上传图片 */
export function fetchUploadImage<T>(data: FormData): Promise<T> {
	return post<T>({ url: '/upload/file', data }) as Promise<T>
}

/* 上传图片 */
export function fetchUploadImageToMj<T>(data: any): Promise<T> {
	return post<T>({ url: '/midjourney/upload', data }) as Promise<T>
}


/* 上传图片 */
export function fetchSetImageFavor<T>(data: {id: number, favorite: number}): Promise<T> {
	return post<T>({ url: '/midjourney/favorite_set', data }) as Promise<T>
}

/* 查询所有咒语分类 */
export function fetchAllIncantationClassify<T>(data: any): Promise<T> {
	return post<T>({ url: '/midjourney/incantationClassifyQueryAll', data }) as Promise<T>
}

/* 查询所有咒语 */
export function fetchAllIncantation<T>(data: any): Promise<T> {
	return post<T>({ url: '/midjourney/incantationQueryAll', data }) as Promise<T>
}

/* 根据咒语分类ID查询咒语 */
export function fetchQueryIncantation<T>(data: any): Promise<T> {
	return post<T>({ url: '/midjourney/incantationQueryByPid', data }) as Promise<T>
}

/* 查询灵感广场分类 */
export function fetchQuerySpireClassify<T>(data: any): Promise<T> {
	return post<T>({ url: 'midjourney/inspireClassifyQuery', data }) as Promise<T>
}

/* 查询灵感广场分类 */
export function fetchQuerySuggest<T>(data: any): Promise<T> {
	return post<T>({ url: 'midjourney/suggestQuery', data }) as Promise<T>
}

// 前端获取一下当前账号是否是
/* 查询当前账号的模式，如果是remix模式,并且返回的类型是INTERACTION_MODAL_CREATE 则需要弹窗 */
export function fetchAccountMode<T>(data: any): Promise<T> {
	return post<T>({ url: 'midjourney/getSetting', data }) as Promise<T>
}

// 前端获取一下当前账号是否是
/* 查询当前账号的模式，如果是remix模式,并且返回的类型是INTERACTION_MODAL_CREATE 则需要弹窗 */
export function fetchSubmitRemix<T>(data: any): Promise<T> {
	return post<T>({ url: 'midjourney/submitRemix', data }) as Promise<T>
}

// 前端获取一下当前账号是否是
/* 查询当前账号的模式，如果是remix模式,并且返回的类型是INTERACTION_MODAL_CREATE 则需要弹窗 */
export function fetchGetRemix<T>(data: any): Promise<T> {
	return get<T>({ url: 'midjourney/get_remix', data }) as Promise<T>
}
//绘画广场所搜
export function inspirationSearch<T>(data:any):Promise<T>{
  return get<T>({url:"/midjourney/getList",data}) as Promise<T>
}

//文生图风格选择
export function textToImageStyleSelect<T>(data:any):Promise<T>{
  return post<T>({url:"/midjourney/incantationClassifyQueryAll",data}) as Promise<T>
}
//获取图片seed
export function imgSeed<T>(data:any):Promise<T>{
  return get<T>({url:"/midjourney/imageSeed",data}) as Promise<T>
}
//AI换脸
export function AIChangeFaceApi<T>(data:any):Promise<T>{
  return post<T>({url:"/midjourney/insight-face",data}) as Promise<T>
}

//查询推荐关键词
export function suggestAdd<T>(data:any):Promise<T>{
  return post<T>({url:"/midjourney/suggestQuery",data}) as Promise<T>
}

//绘画广场点赞
export function drawAgree<T>(data:any):Promise<T>{
  return post<T>({url:"/aiLog/agree",data}) as Promise<T>
}