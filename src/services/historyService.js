import api from './api'

export const historyService = {
  // Catat konsumsi air baru
  addLog: (amount_ml, note = '') =>
    api.post('/api/history/log', {
      amount_ml,
      log_date: new Date().toISOString().split('T')[0],
      note,
    }),

  // Ambil ringkasan hari ini
  getToday: (targetMl) =>
    api.get(`/api/history/daily/${new Date().toISOString().split('T')[0]}`, {
      params: { target_ml: targetMl },
    }),

  // Ambil histori 7 hari
  getWeekly: (targetMl) =>
    api.get('/api/history/weekly', { params: { target_ml: targetMl } }),

  // Hapus log tertentu
  deleteLog: (logId) =>
    api.delete(`/api/history/log/${logId}`),
}