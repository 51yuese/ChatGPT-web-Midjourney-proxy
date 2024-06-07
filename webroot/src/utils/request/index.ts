import type { AxiosProgressEvent, AxiosResponse, GenericAbortSignal } from 'axios'
import request from './axios'
import { useAuthStore } from '@/store'
import EventBus from '@/hooks/eventBus'

export interface HttpOption {
  timeout?: number
  url: string
  data?: any
  method?: string
  headers?: any
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  signal?: GenericAbortSignal
  beforeRequest?: () => void
  afterRequest?: () => void
  responseType?: string
}

export interface Response<T = any> {
  data: T
  message: string | null
  status: string
}

let last401ErrorTimestamp = 0
const homePagePath = ['/chatlog/chatList', '/group/query']

function hasWhitePath(path: string) {
  if (!path)
    return false
  return homePagePath.some(item => path.includes(item))
}

function http<T = any>({ url, data, method, headers, responseType, onDownloadProgress, onUploadProgress, signal, beforeRequest, afterRequest }: HttpOption) {
  const successHandler = (res: AxiosResponse<Response<T>>) => {
    const authStore = useAuthStore()

    const { code } = res.data

    if ((code >= 200 && code < 300) || !code)
      return res.data

    if (code === 401) {
      authStore.removeToken()
      window.location.reload()
    }

    return Promise.reject(res.data)
  }

  const failHandler = (error: Response<Error>) => {
    const authStore = useAuthStore()
    let data = ''
    error.response?.data && (data = error.response.data)
    afterRequest?.()
    const status = error?.response?.status

    if (status === 401) {
      authStore.removeToken()
      if (!hasWhitePath(error?.request?.responseURL)) {

        // authStore.loadInit && authStore.setLoginDialog(true)

        const message = error.response.data?.message || '请先登录后再进行使用！'
        Date.now() - last401ErrorTimestamp > 3000 && window.$message.error(message)
      }
      last401ErrorTimestamp = Date.now()
    }
    else {
      // if (data && !data?.success)
        // window.$message.error(data?.message || '请求接口错误！')
        // EventBus.emit("error",true)
    }
    // throw new Error(error.response?.data?.message || error || 'Error')
    return Promise.reject(error.response?.data)
  }

  beforeRequest?.()

  method = method || 'GET'

  const params = Object.assign(typeof data === 'function' ? data() : data ?? {}, {})

  return method === 'GET'
    ? request.get(url, { params, signal, responseType, onDownloadProgress }).then(successHandler, failHandler)
    : request.post(url, params, { headers, responseType, signal, onDownloadProgress, onUploadProgress }).then(successHandler, failHandler)
}

export function get<T = any>(
  { url, data, method = 'GET', onDownloadProgress, signal, beforeRequest, afterRequest }: HttpOption,
): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    onDownloadProgress,
    signal,
    beforeRequest,
    afterRequest,
  })
}

export function post<T = any>(
  { url, data, method = 'POST', headers, responseType, onDownloadProgress, signal, beforeRequest, afterRequest, onUploadProgress, timeout }: HttpOption,
): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    responseType,
    headers,
    onDownloadProgress,
    onUploadProgress,
    signal,
    beforeRequest,
    afterRequest,
	 timeout
  })
}

export default post
