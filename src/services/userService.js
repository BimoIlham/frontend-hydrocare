import api from './api'

export const userService = {
  getProfile:           () => api.get('/api/user/profile'),
  createOrUpdateProfile: (data) => api.post('/api/user/profile', data),
}