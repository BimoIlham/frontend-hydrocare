import { useEffect, useRef } from 'react'
import useUserStore from '../store/useUserStore'

export function useReminder(reminderHours = 2) {
  const intervalRef = useRef(null)
  const { isOnboarded } = useUserStore()

  const showReminder = () => {
    // Cek apakah browser support notifikasi
    if (!('Notification' in window)) return

    if (Notification.permission === 'granted') {
      new Notification('💧 Waktunya Minum Air!', {
        body: 'Jangan lupa minum air ya! Tubuh kamu butuh hidrasi.',
        icon: '/icons/water-drop.png',
        badge: '/icons/badge.png',
      })
    }
  }

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      await Notification.requestPermission()
    }
  }

  useEffect(() => {
    if (!isOnboarded) return

    requestPermission()

    // Set interval untuk reminder
    const intervalMs = reminderHours * 60 * 60 * 1000
    intervalRef.current = setInterval(showReminder, intervalMs)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isOnboarded, reminderHours])

  return { requestPermission, showReminder }
}