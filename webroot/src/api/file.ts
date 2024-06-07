import {get, post} from '@/utils/request'

/* 创建新的对话组 */
export function getModalImgById(taskId: string) {
    return get<string>({
        url: '/upload/getModalImgById',
        data: { taskId },
    })
}
