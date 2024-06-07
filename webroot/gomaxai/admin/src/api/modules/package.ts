import api from '../index'

export default {
  queryAllPackage: (params: any) => api.get('crami/queryAllPackage', { params }),
  updatePackage: (data: any) => api.post('crami/updatePackage', data),
  createPackage: (data: any) => api.post('crami/createPackage', data),
  delPackage: (data: any) => api.post('crami/delPackage', data),
  queryAllCrami: (params: any) => api.get('crami/queryAllCrami', { params }),
  delCrami: (data: any) => api.post('crami/delCrami', data),
  createCrami: (data: any) => api.post('crami/createCrami', data),
  batchDelCrami: (data: any) => api.post('crami/batchDelCrami', data),
  delPackageType: (data: any) => api.post('crami/deleteType', data),
  updatePackageType: (data: any) => api.post('crami/updateType', data),
  createPackageType: (data: any) => api.post('crami/createType', data),
  queryPackageType: () => api.get('crami/queryAllType',),
}
