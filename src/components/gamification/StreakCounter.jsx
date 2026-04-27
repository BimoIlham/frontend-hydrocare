import { Flame, Trophy, Droplet } from 'lucide-react'

export default function StreakCounter({ streak = 0, className = '' }) {
  const getMessage = () => {
    if (streak === 0) return 'Mulai streak kamu hari ini!'
    if (streak < 3)  return 'Terus pertahankan!'
    if (streak < 7)  return 'Kamu luar biasa!'
    return 'Hydration Master sejati!'
  }
  const renderIcon = () => {
    if (streak >= 7) return <Trophy className="w-7 h-7 text-yellow-500" />
    if (streak >= 3) return <Flame className="w-7 h-7 text-orange-500" />
    return <Droplet className="w-7 h-7 text-sky-500" />
  }

  return (
    <div className={`card flex items-center ${className}`}>
      <div className="flex items-center gap-4 w-full">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center
                        bg-sky-50/80 border border-sky-100/60">
          {renderIcon()}
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Streak saat ini</p>
          <p className="text-3xl font-bold text-gradient">{streak} hari</p>
          <p className="text-sm text-gray-500 mt-0.5">{getMessage()}</p>
        </div>
      </div>
    </div>
  )
}