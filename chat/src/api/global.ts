import { get, post } from '@/utils/request'

/* get notice */
export function fetchGetGlobalNoticeAPI<T>(): Promise<T> {
  return get<T>({
    url: '/config/notice',
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
