
import api from '../index'

export default {
    queryAccessList: (data: any) => api.post('access/query', data),
    getAccess: (params: any) => api.get('access/get', { params }),
    deleteAccess: (data: { id: number }) => api.post('access/delete', data),
    addAccess: (data: any) => api.post('access/add', data),
    updateAccess: (data: any) => api.post('access/modify', data),
    updateManagerStatus: (data: any) => api.post('access/status', data),
    resetUserPassword: (data: any) => api.post('access/reset_password', data),
}
