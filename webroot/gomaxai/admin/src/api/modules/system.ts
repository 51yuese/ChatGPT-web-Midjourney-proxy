import api from '../index'

export default {
    uploadFile: (params: FormData) => api.post('upload/file', params),
    queryFeedback: (params: any) => api.get('feedback/query', {params}),
    removeFeedback: (data: any) => api.post('feedback/delete', data),
    setFeedbackStatus: (data: any) => api.post('feedback/status', data),
}
