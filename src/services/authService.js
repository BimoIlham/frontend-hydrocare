import api from './api'

export const authService = {
  register: (data) => api.post('/api/auth/register', data),
  login:    (username, password) => api.post('/api/auth/login', { username, password }),
}
