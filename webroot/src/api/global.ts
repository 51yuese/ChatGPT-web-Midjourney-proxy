import { get, post } from '@/utils/request'

/* get notice */
export function fetchGetGlobalNoticeAPI<T>(): Promise<T> {
  return get<T>({
    url: '/config/notice',
  })
}

export function fetchGetMemberAgreementAPI<T>(data: { keys: string[] }): Promise<T> {
	return post<T>({
		url: '/config/query',
		data
	})
}


/* get notice */
export function fetchGetGlobalAgreementAPI<T>(data: { keys: string[] }): Promise<T> {
  return post<T>({
    url: '/config/agreement',
		data
  })
}

/* get notice */
export function fetchGetGlobalPolicyAPI<T>(data: { keys: string[] }): Promise<T> {
  return post<T>({
    url: '/config/policy',
	data
  })
}

export  const queryCopyRight =  (data: { keys: string[] }) => post({
	url: '/config/copyright',
	data
})

export  const checkAuth =  (data: {domain: string}) => get({
	url: '/config/check',
	data
})

export  const fetchGetQrCode =  (data: any) => post({
	url: '/config/qrcode',
    data
})

// 添加用户收集
export  const fetchFeedbackAdd =  (data: any) => post({
	url: '/feedback/add',
	data
})
