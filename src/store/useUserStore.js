import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUserStore = create(
  persist(
    (set, get) => ({
      profile: null,       // Data profil user
      dailyTarget: 2000,   // Target mL per hari
      isLoggedIn: false,    // Apakah user sudah login
      isOnboarded: false,  // Backward compat — now derived from isLoggedIn
      hydrationBreakdown: null, // Breakdown: base, gender, age, activity, weather, humidity
      userId: null,        // ID user dari backend

      // Login — set profil + userId + isLoggedIn
      login: (userData) => set({
        profile: userData,
        userId: userData.id,
        isLoggedIn: true,
        isOnboarded: true,
      }),

      setProfile: (profile) => set({ profile, isOnboarded: true, isLoggedIn: true }),
      setDailyTarget: (ml) => set({ dailyTarget: ml }),
      setHydrationBreakdown: (breakdown) => set({ hydrationBreakdown: breakdown }),

      // Logout — clear everything
      logout: () => set({
        profile: null,
        userId: null,
        isLoggedIn: false,
        isOnboarded: false,
        dailyTarget: 2000,
        hydrationBreakdown: null,
      }),

      clearProfile: () => set({
        profile: null,
        userId: null,
        isLoggedIn: false,
        isOnboarded: false,
        hydrationBreakdown: null,
      }),
    }),
    {
      name: 'hydrocare-user', // Key di localStorage
    }
  )
)

export default useUserStore