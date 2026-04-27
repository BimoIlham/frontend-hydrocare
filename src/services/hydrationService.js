import api from './api'

export const hydrationService = {
  // Hitung target air harian
  calculate: (userData, temperature = null) =>
    api.post('/api/hydration/calculate', { ...userData, temperature }),
}