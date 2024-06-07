import {get, post} from '@/utils/request'

/* 创建新的对话组 */
export function fetchCreateGptChatGroupAPI<T>(data: { groupId: number, modelName?: string, config?: string}): Promise<T> {
    return post<T>({
        url: '/gpts/chat_group_create',
        data,
    })
}

/* 查询对话组列表 */
export function fetchQueryGptsAPI<T>(): Promise<T> {
    return get<T>({url: '/gpts/chat_group_get'})
}

/* 修改对话组 */
export function fetchUpdateGptsAPI<T>(data?: {
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
export function fetchDelGptsAPI<T>(data?: { groupId: number }): Promise<T> {
    return post<T>({
        url: '/gpts/chat_group_delete',
        data,
    })
}

/* 删除全部对话组 */
export function fetchDelAllGptsAPI<T>(data?: { groupId: number }): Promise<T> {
    return post<T>({
        url: '/gpts/chat_group_clear',
        data,
    })
}


/* 删除全部对话组 */
export function fetchQueryGptsByPageAPI<T>(data: { page: number; size: number; }): Promise<T> {
    return post<T>({
        url: '/gpts/query',
        data,
    })
}

/* 删除全部对话组 */
export function fetchQueryGptsGroupAPI<T>(data: { page: number; size: number; }): Promise<T> {
    return post<T>({
        url: '/gpts/group_query',
        data,
    })
}

/* 获取对话组的信息 */
export function fetchGetGptGroupAPI<T>(data: { groupId: number; }): Promise<T> {
    return get<T>({
        url: '/gpts/group_get',
        data,
    })
}



