import { get } from '@/utils/request'

/* query models list  */
export function fetchQueryModelsListAPI<T>() {
  return get<T>({
    url: '/models/list',
  })
}
/* query models list  */
export function fetchQueryModelsListAPIMaps<T>(data:any) {
  return get<T>({
    url: '/models/query',
    data
  })
}


/* query base model config  */
export function fetchModelBaseConfigAPI<T>() {
  return get<T>({
    url: '/models/baseConfig',
  })
}
