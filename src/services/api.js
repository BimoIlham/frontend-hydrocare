import axios from 'axios'
import useUserStore from '../store/useUserStore'

// Satu instance axios yang digunakan di seluruh aplikasi
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://backend-hydrocare.vercel.app',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Interceptor: inject x-user-id header and error handling global
api.interceptors.request.use((config) => {
  try {
    // 1. Coba baca dari Zustand State dulu (instan, ada di memory)
    const state = useUserStore.getState()
    if (state.userId) {
      config.headers['x-user-id'] = state.userId
      return config
    }
    
    // 2. Fallback baca dari Local Storage (bisa ada delay)
    const rawData = localStorage.getItem('hydrocare-user')
    if (rawData) {
      const data = JSON.parse(rawData)
      if (data.state && data.state.userId) {
        config.headers['x-user-id'] = data.state.userId
      }
    }
  } catch (err) {
    console.error('Error parsing user data', err)
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api