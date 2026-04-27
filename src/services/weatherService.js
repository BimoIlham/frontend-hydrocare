import api from './api'

export const weatherService = {
  getWeather: (city = '') =>
    city ? api.get(`/api/weather/${city}`) : api.get('/api/weather/'),
}