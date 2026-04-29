import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useHydrationStore = create(
  persist(
    (set, get) => ({
      todayLogs:      [],     // Log minum hari ini
      totalToday:     0,      // Total mL hari ini
      weeklyData:     [],     // Data 7 hari untuk grafik
      streak:         0,      // Streak hari berturut-turut
      badges:         [],     // Badge yang sudah diraih

      // Reset semua data (untuk logout)
      reset: () => set({ todayLogs: [], totalToday: 0, weeklyData: [], streak: 0, badges: [] }),

      // Update log hari ini
      setTodayData: (logs, total) => {
        set({ todayLogs: logs, totalToday: total })
        // Cek dan update badge
        get()._checkBadges(total)
      },

      setWeeklyData: (data) => {
        set({ weeklyData: data })
        // Hitung streak dari data mingguan
        const streak = _calculateStreak(data)
        set({ streak })
      },

      addLog: (log) => {
        const { todayLogs, totalToday } = get()
        const newTotal = totalToday + log.amount_ml
        set({
          todayLogs: [...todayLogs, log],
          totalToday: newTotal,
        })
        get()._checkBadges(newTotal)
      },

      // Hapus log (untuk undo / delete)
      removeLog: (logId) => {
        const { todayLogs } = get()
        const filtered = todayLogs.filter((l) => l.id !== logId)
        const newTotal = filtered.reduce((sum, l) => sum + l.amount_ml, 0)
        set({ todayLogs: filtered, totalToday: newTotal })
      },

      // Periksa apakah ada badge baru yang didapat
      _checkBadges: (totalMl) => {
        const { badges, streak } = get()
        const newBadges = [...badges]

        if (totalMl >= 500 && !badges.includes('first_drop')) {
          newBadges.push('first_drop')
        }
        if (totalMl >= 2000 && !badges.includes('daily_goal')) {
          newBadges.push('daily_goal')
        }
        if (streak >= 3 && !badges.includes('three_day_streak')) {
          newBadges.push('three_day_streak')
        }
        if (streak >= 7 && !badges.includes('hydration_master')) {
          newBadges.push('hydration_master')
        }

        if (newBadges.length !== badges.length) {
          set({ badges: newBadges })
        }
      },
    }),
    {
      name: 'hydrocare-hydration', // Key di localStorage
    }
  )
)

// Helper: hitung streak dari data mingguan
function _calculateStreak(weeklyData) {
  let streak = 0
  const reversed = [...weeklyData].reverse() // Mulai dari hari ini
  for (const day of reversed) {
    if (day.goal_met) streak++
    else break
  }
  return streak
}

export default useHydrationStore