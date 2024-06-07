import {get, post} from '@/utils/request'
import {data} from "autoprefixer";

/* 查询app分组 */
export function fetchQueryAppCatsAPI<T>(): Promise<T> {
	return get<T>({url: '/app/queryCats'})
}

/*  查询全量app列表 */
export function fetchQueryAppsAPI<T>(data?: { page: number, size: number }): Promise<T> {
	return get<T>({
		url: '/app/list',
		data
	})
}

/*  查询收藏的app  */
// export function fetchQueryMineAppsAPI<T>(): Promise<T> {
// 	return get<T>({
// 		url: '/app/mineApps',
// 	})
// }
export function fetchQueryMineAppsAPI<T>(): Promise<T> {
	return get<T>({
		url: '/app/mineAppsV3',
	})
}


/* 收藏app */
export function fetchCollectAppAPI<T>(data: { appId: number }): Promise<T> {
	return post<T>({url: '/app/collect', data})
}

/* 收藏app */
export function fetchCustomAppAPI<T>(data: any): Promise<T> {
	return post<T>({url: '/app/customApp', data})
}

/* 删除app */
export function fetchDelMineAppAPI<T>(data: any): Promise<T> {
	return post<T>({url: '/app/delMineApp', data})
}


// 获取应用分类
export function fetchAppSortAPI<T>(
	data: {
		status: number
	}
): Promise<T> {
	return post<T>({url: '/gpts/group_query', data})
}

// 获取应用（站内搜索）
export function fetchQueryGptsByPageAPI<T>(
	data: {
		page: number,
		size: number,
		modelName: number,
		modelId: string,
		groupId: number
	}
): Promise<T> {
	return post<T>({
		url: '/gpts/query',
		data,
	})
}


// 根据分类获取应用数据
export function fetchQueryAppsByTypeAPI<T>(data: { type?: string }): Promise<T> {
	return get<T>({
		url: '/gpts/listByFrontType',
		data
	})
}

// 获取应用列表数据
export function fetchQueryAppChatListAPI<T>(): Promise<T> {
	// return get<T>({url: '/chatlog/chatList'})
	return get<T>({url: '/gpts/chat_group_get'})
}

/* 创建新的对话组 */
export function fetchCreateGptChatGroupAPI<T>(data: { appId: number }): Promise<T> {
	return post<T>({
		url: '/gpts/chat_group_create',
		data,
	})
}

/* 查询对话信息 */
export function fetchQueryChatLogListAPI<T>(data: { groupId: number }): Promise<T> {
	return get<T>({
		url: '/chatlog/chatList',
		data,
	})
}

/* 修改对话组 */
export function fetchUpdateAppGroupAPI<T>(data?: {
	groupId?: number
	title?: string
	isSticky?: boolean,
	config?: string
}): Promise<T> {
	return post<T>({
		url: '/gpts/chat_group_update',
		data,
	})
}

/* 删除对话组 */
export function fetchDelAppChatAPI<T>(data?: { groupId: number }): Promise<T> {
	return post<T>({
		url: '/gpts/chat_group_delete',
		data,
	})
}

// 添加应用
// export function fetchAddAppAPI<T>(data?: { groupId: number, modelName: string, desc: string, logo: string, demoData: string, gptsApp: boolean, modelId: string }): Promise<T> {
// 	return post<T>({
// 		url: '/gpts/set',
// 		data,
// 	})
// }

export function fetchAddAppAPI<T>(data: {}): Promise<T> {
	return post<T>({
		url: '/gpts/set',
		data,
	})
}


