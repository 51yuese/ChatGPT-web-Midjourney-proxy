import api from '../index'

export default {
  queryKeyList: (params: any) => api.get('chatgpt/keyList', { params }),
  queryKeyModelList: (params: any) => api.get('chatgpt/keyModelList', { params }),
  queryKeyDetail: (params: any) => api.get('chatgpt/keyDetail', { params }),
  addGptKey: (data: any) => api.post('chatgpt/addKey', data),
  updateGptKey: (data: any) => api.post('chatgpt/updateKey', data),
  addWhiteUser: (data: any) => api.post('chatgpt/addWhiteUser', data),
  updateWhiteUser: (data: any) => api.post('chatgpt/updateWhiteUser', data),
  queryWhiteUserList: (params: any) => api.get('chatgpt/userWhiteList', { params }),
  deleteGptKey: (data: any) => api.post('chatgpt/deleteKey', data),

}
