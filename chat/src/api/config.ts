import { get, post } from '@/utils/request'

/* query globle config  */
export function fetchQueryConfigAPI<T>(data: any) {
  return get<T>({
    url: '/config/queryFront',
    data,
  })
}

/* query globle menu  */
export function fetchQueryMenuAPI<T>(data: any) {
  return get<T>({
    url: '/menu/list',
    data,
  })
}

// 获取设置的主题
export function fetchThemeAPI<T>(data: string[]): Promise<any> {
  return post<T>({
    url: '/config/themeGet',
    data: {
		 keys: data
	},
  })
}

// 设置新主题
export function setThemeAPI<T>(data: {
	configKey: string,
	configVal: string,
}) {
  return post<T>({
    url: '/config/themeSet',
    data: {settings: [data]},
  })
}

// 获取对话小尾巴
export function fetchChatTailAPI<T>(data: string[]): Promise<any> {
    return post<T>({
        url: '/config/chatTail',
        data: {
            keys: data
        },
    })
}
