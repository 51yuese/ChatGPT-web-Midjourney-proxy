import api from '../index'

export default {
  queryAdminDrawList: (params: any) => api.get('midjourney/adminDrawList', { params }),
  salesAuditOrder: (data: any) => api.post('sales/auditOrder', data),
  updateSalesUser: (data: any) => api.post('sales/updateUserSales', data),
  queryRecords: (params: any) => api.get('sales/inviteRecords', { params }),
  querySalesUserList: (params: any) => api.get('sales/salesUserList', { params }),
  queryPrompts: () => api.get('midjourney/queryPrompts'),
  setPrompt: (data: any) => api.post('midjourney/setPrompt', data),
  delPrompt: (data: any) => api.post('midjourney/delPrompt', data),

  queryMjParamByPage: (data: any) => api.post('midjourney/queryList', data),
  getMjParamById: (params: any) => api.get('midjourney/get', {params}),
  modifyMjParam: (data: any) => api.post('midjourney/modify', data),
  removeMjParam: (data: any) => api.post('midjourney/delete', data),
  addMjParam: (data: any) => api.post('midjourney/add', data),
  setMjParamEnable: (data: any) => api.post('midjourney/enable', data),
  updateMjSync: (data: any) => api.post('midjourney/syncMjpAccountManual', data),
  uploadPromptImage: (data: any) => api.post('upload/file', data),
  freshPromptImage: (data: any) => api.get('midjourney/fresh', {data}), // 换一批
  queryPromptImage: (data: any) => api.get('midjourney/query', {data}), // 换一批


  addMjIncantClassify: (data: any) => api.post('midjourney/incantationClassifyAdd', data),
  removeMjIncantClassify: (data: any) => api.post('midjourney/incantationClassifyDelete', data),
  modifyMjIncantClassify: (data: any) => api.post('midjourney/incantationClassifyModify', data),
  queryMjIncantClassify: (data: any) => api.post('midjourney/incantationClassifyQuery', data),
  getMjIncantClassify: (params: any) => api.get('midjourney/incantationClassifyGet', {params}),
  queryTopMjIncantationClassify: () => api.post('midjourney/queryTopMjIncantationClassify'),
  queryAllMjIncantClassify: (data: any) => api.post('midjourney/incantationClassifyQueryAll', data),

  addMjInspireClassify: (data: any) => api.post('midjourney/inspireClassifyAdd', data),
  removeMjInspireClassify: (data: any) => api.post('midjourney/inspireClassifyDelete', data),
  modifyMjInspireClassify: (data: any) => api.post('midjourney/inspireClassifyModify', data),
  queryMjInspireClassify: (data: any) => api.post('midjourney/inspireClassifyQuery', data),
  getMjInspireClassify: (params: any) => api.get('midjourney/inspireClassifyGet', {params}),

  addMjIncantation: (data: any) => api.post('midjourney/incantationAdd', data),
  removeMjIncantation: (data: any) => api.post('midjourney/incantationDelete', data),
  modifyMjIncantation: (data: any) => api.post('midjourney/incantationModify', data),
  queryMjIncantation: (data: any) => api.post('midjourney/incantationQuery', data),
  getMjIncantation: (params: any) => api.get('midjourney/incantationGet', {params}),

  getCnTranslateEn: (params: any) => api.get('/fanyi/translate', {params}),

  addMjSuggestWord: (data: any) => api.post('midjourney/suggestSave', data),
  removeMjSuggestWord: (data: any) => api.post('midjourney/suggestDelete', data),
  // modifyMjSuggestWord: (data: any) => api.post('midjourney/incantationModify', data),
  queryMjSuggestWord: (data: any) => api.post('midjourney/suggestQuery', data),

  updateMjSetting: (data: any) => api.post('midjourney/updateSetting', data),



}
