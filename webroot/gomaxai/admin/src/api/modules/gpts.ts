import api from '../index'

export default {

  queryModels: (data: any) => api.post('gpts/query', data),
  insertModelsBatch: (data: any) => api.post('gpts/batch', data),
  setModels: (data: any) => api.post('gpts/set', data),
  delModels: (data: any) => api.post('gpts/delete', data),

  addGptsGroup: (data: any) => api.post('gpts/group_add', data),
  removeGptsGroup: (data: any) => api.post('gpts/group_remove', data),
  modifyGptsGroup: (data: any) => api.post('gpts/group_modify', data),
  queryGptsGroup: (data: any) => api.post('gpts/group_query', data),

}
